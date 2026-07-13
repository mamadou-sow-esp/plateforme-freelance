import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isValidEmail } from '../../lib/validation'
import logo from '../../assets/logo.png'

const Register = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.nom || !form.email || !form.telephone) {
        setError('Veuillez remplir tous les champs')
        return
      }
      if (!isValidEmail(form.email)) {
        setEmailTouched(true)
        setError('Adresse email invalide')
        return
      }
    }
    if (step === 2) {
      if (!form.role) {
        setError('Veuillez choisir votre rôle')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // On ne demande pas de mot de passe ici : on envoie d'abord un lien
      // de confirmation par email pour vérifier que l'adresse existe
      // vraiment. Le compte est créé (non confirmé), avec nom/téléphone/
      // rôle attachés en métadonnées ; le mot de passe et le profil ne
      // sont créés qu'après le clic sur le lien, sur /confirmer-inscription.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/confirmer-inscription`,
          data: {
            nom: form.nom,
            telephone: form.telephone,
            role: form.role,
          },
        },
      })

      if (otpError) throw otpError

      setEmailSent(true)
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de l'email")
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      key: 'client',
      title: 'Client',
      desc: "Je cherche des prestataires pour mes projets",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'prestataire',
      title: 'Prestataire',
      desc: 'Je propose mes services et compétences',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img src={logo} alt="Alicia" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Créer un compte</h1>
          <p className="text-gray-400 text-sm mt-1">Rejoignez la plateforme freelance du Sénégal</p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                s < step ? 'bg-gray-900 text-white'
                : s === step ? 'bg-gray-900 text-white ring-4 ring-gray-900/20'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 transition-all ${s < step ? 'bg-gray-900' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Étape 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Vos informations</h2>
                <p className="text-gray-400 text-xs">Renseignez vos informations personnelles</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nom complet</label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Amadou Diallo"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adresse email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="vous@exemple.com"
                  className={`w-full px-4 py-3.5 border rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                    emailTouched && form.email && !isValidEmail(form.email)
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                  }`} />
                {emailTouched && form.email && !isValidEmail(form.email) && (
                  <p className="text-xs text-red-500 mt-1.5">Format d'email invalide</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Téléphone</label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10 transition-all">
                  <span className="px-3 text-gray-500 text-sm font-medium border-r border-gray-200 py-3.5 flex-shrink-0">
                    🇸🇳 +221
                  </span>
                  <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                    placeholder="77 000 00 00"
                    className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none" />
                </div>
              </div>

              <button type="button" onClick={handleNextStep}
                className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all mt-2">
                Continuer
              </button>
            </div>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Votre rôle</h2>
                <p className="text-gray-400 text-xs">Comment allez-vous utiliser Alicia ?</p>
              </div>

              <div className="space-y-3">
                {roles.map(r => (
                  <button key={r.key} type="button"
                    onClick={() => setForm({ ...form, role: r.key })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      form.role === r.key
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        form.role === r.key ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <span className={form.role === r.key ? 'text-white' : 'text-gray-600'}>
                          {r.icon}
                        </span>
                      </div>
                      <div>
                        <p className={`font-bold text-base ${form.role === r.key ? 'text-white' : 'text-gray-900'}`}>
                          {r.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${form.role === r.key ? 'text-gray-300' : 'text-gray-400'}`}>
                          {r.desc}
                        </p>
                      </div>
                      {form.role === r.key && (
                        <div className="ml-auto w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:border-gray-400 transition-all">
                  Retour
                </button>
                <button type="button" onClick={handleNextStep}
                  className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all">
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 3 && (
            <div className="space-y-5">
              {emailSent ? (
                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">Vérifiez votre email</h2>
                  <p className="text-gray-400 text-xs mb-5">
                    On a envoyé un lien de confirmation à <strong className="text-gray-700">{form.email}</strong>.
                    Cliquez dessus pour vérifier votre adresse et choisir votre mot de passe.
                  </p>
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-4 text-sm">
                    Email envoyé ✓ Pensez à vérifier vos spams si vous ne le voyez pas.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-1">Vérifiez votre email</h2>
                    <p className="text-gray-400 text-xs">
                      Dernière étape : on vous envoie un lien pour confirmer votre adresse avant de choisir votre mot de passe.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{form.nom?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{form.nom}</p>
                        <p className="text-xs text-gray-400">{form.email} · {form.role === 'client' ? 'Client' : 'Prestataire'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(2)}
                      className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:border-gray-400 transition-all">
                      Retour
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi...
                        </span>
                      ) : 'Envoyer le lien de confirmation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Alicia — Plateforme freelance du Sénégal
        </p>

        <Link to="/"
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium mt-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default Register