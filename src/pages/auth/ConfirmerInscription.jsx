import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const ConfirmerInscription = () => {
  const navigate = useNavigate()
  const { fetchProfile } = useAuth()
  const [ready, setReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [meta, setMeta] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Nouveau flux : le lien reçu par email pointe vers cette page avec
  // ?token_hash=...&type=email au lieu de rediriger directement vers l'API
  // Supabase. On n'appelle verifyOtp() qu'au clic explicite du bouton
  // ci-dessous, jamais automatiquement au chargement — sinon les scanners
  // de liens des clients mail (Gmail, Outlook...), qui pré-chargent les
  // liens des emails pour les analyser, consomment le lien (à usage
  // unique) à la place de l'utilisateur, qui tombe alors sur "lien
  // invalide ou expiré".
  const [tokenHash, setTokenHash] = useState(null)
  const [awaitingClick, setAwaitingClick] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const checkSession = useCallback(async (session) => {
    if (!session?.user) return false

    // Si un profil existe déjà pour cet utilisateur, l'inscription a déjà
    // été finalisée (ex. lien cliqué deux fois) : pas la peine de repasser
    // par le choix du mot de passe, on renvoie directement vers l'app.
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    if (existingProfile) {
      setAlreadyDone(true)
      setTimeout(() => navigate('/'), 1500)
      return true
    }

    setMeta(session.user.user_metadata || {})
    setReady(true)
    return true
  }, [navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = params.get('token_hash')

    if (hash) {
      // Nouveau flux : on attend le clic de l'utilisateur, voir handleConfirmClick.
      setTokenHash(hash)
      setAwaitingClick(true)
      return
    }

    // Ancien flux (compatibilité avec les emails déjà envoyés avant la mise
    // à jour du template) : Supabase a déjà consommé le lien et redirigé
    // ici avec une session dans l'URL — on la détecte directement.
    let settled = false

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session).then((ok) => { if (ok) settled = true })
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) checkSession(data.session).then((ok) => { if (ok) settled = true })
    })

    const timeout = setTimeout(() => {
      if (!settled) setInvalidLink(true)
    }, 4000)

    return () => {
      listener?.subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [checkSession])

  const handleConfirmClick = async () => {
    setVerifying(true)
    setError('')
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      })
      if (verifyError) throw verifyError
      setAwaitingClick(false)
      await checkSession(data.session)
    } catch (err) {
      setAwaitingClick(false)
      setInvalidLink(true)
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const { data: userData, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      const userId = userData.user.id
      const nom = meta?.nom || ''
      const telephone = meta?.telephone || ''
      const role = meta?.role || 'client'

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        nom,
        email: userData.user.email,
        telephone,
        role,
      })
      if (profileError) throw profileError

      if (role === 'prestataire') {
        const { error: prestError } = await supabase.from('prestataires').insert({
          id: userId,
          metier: '',
          competences: [],
          prix_min: 0,
          disponible: true,
          note_moyenne: 0,
          nb_missions: 0,
          verifie_cni: false,
          cni_url: null,
          cv_url: null,
          github_url: null,
          portfolio_url: null,
          linkedin_url: null,
        })
        if (prestError) throw prestError
      }

      await fetchProfile(userId)
      setDone(true)
      setTimeout(() => navigate('/completer-profil'), 1200)
    } catch (err) {
      setError(err.message || "Impossible de finaliser l'inscription. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Alicia" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenue sur Alicia</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          {invalidLink ? (
            <div>
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm mb-5">
                Ce lien de confirmation est invalide ou a expiré.
              </div>
              <Link to="/register"
                className="w-full flex items-center justify-center py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all">
                Recommencer l'inscription
              </Link>
            </div>
          ) : alreadyDone ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-4 text-sm">
              Votre compte est déjà confirmé ✓ Redirection...
            </div>
          ) : awaitingClick ? (
            <div className="text-center">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Confirmez votre email</h2>
              <p className="text-gray-400 text-xs mb-6">
                Cliquez sur le bouton ci-dessous pour vérifier votre adresse et continuer votre inscription.
              </p>
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={verifying}
                className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vérification...
                  </span>
                ) : 'Confirmer mon compte'}
              </button>
            </div>
          ) : !ready ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Vérification du lien...</p>
            </div>
          ) : done ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-4 text-sm">
              Compte créé ✓ Bienvenue ! On finalise votre profil...
            </div>
          ) : (
            <>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Email confirmé ✓</h2>
              <p className="text-gray-400 text-xs mb-5">
                Il ne reste plus qu'à choisir votre mot de passe pour {meta?.nom || 'finaliser votre compte'}.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    required
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création...
                    </span>
                  ) : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Alicia — Plateforme freelance du Sénégal
        </p>
      </div>
    </div>
  )
}

export default ConfirmerInscription
