import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo.png'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Le lien envoyé par email contient un token de récupération dans
    // l'URL ; supabase-js (detectSessionInUrl: true) l'échange
    // automatiquement contre une session temporaire et déclenche
    // l'événement PASSWORD_RECOVERY. Tant qu'on ne l'a pas reçu (ou une
    // session déjà valide), on affiche un état de chargement plutôt que
    // le formulaire, pour éviter de laisser un lien expiré planter le
    // changement de mot de passe.
    let settled = false

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        settled = true
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        settled = true
        setReady(true)
      }
    })

    const timeout = setTimeout(() => {
      if (!settled) setInvalidLink(true)
    }, 4000)

    return () => {
      listener?.subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

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
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe. Réessayez ou redemandez un lien.")
      return
    }

    setDone(true)
    setTimeout(() => navigate('/'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Alicia" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nouveau mot de passe</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          {invalidLink ? (
            <div>
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm mb-5">
                Ce lien de réinitialisation est invalide ou a expiré.
              </div>
              <Link to="/login"
                className="w-full flex items-center justify-center py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all">
                Redemander un lien
              </Link>
            </div>
          ) : !ready ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Vérification du lien...</p>
            </div>
          ) : done ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-4 text-sm">
              Mot de passe mis à jour ✓ Redirection en cours...
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                    placeholder="••••••••"
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
                      Mise à jour...
                    </span>
                  ) : 'Mettre à jour le mot de passe'}
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

export default ResetPassword
