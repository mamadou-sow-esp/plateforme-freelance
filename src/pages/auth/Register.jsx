import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: '',
    telephone: '',
    role: '',
    localisation: '',
    metier: '',
    competences: '',
    prix_min: '',
    prix_max: '',
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!form.nom || !form.email || !form.password) {
        setError('Veuillez remplir tous les champs')
        return
      }
      if (form.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caracteres')
        return
      }
    }
    if (step === 2 && !form.role) {
      setError('Veuillez choisir un role')
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      // 1. Créer le compte auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

      if (authError) throw authError

      const userId = data.user.id

      // 2. Attendre que la session soit active
      await supabase.auth.getSession()

      // 3. Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nom: form.nom,
          email: form.email,
          telephone: `+221${form.telephone}`,
          role: form.role,
          localisation: form.localisation,
        })

      if (profileError) throw profileError

      // 4. Si prestataire
      if (form.role === 'prestataire') {
        const competencesArray = form.competences
          .split(',')
          .map(c => c.trim())
          .filter(c => c !== '')

        const { error: prestError } = await supabase
          .from('prestataires')
          .insert({
            id: userId,
            metier: form.metier,
            competences: competencesArray,
            prix_min: parseFloat(form.prix_min) || 0,
            prix_max: parseFloat(form.prix_max) || 0,
          })

        if (prestError) throw prestError
      }

      // 5. Redirection
      if (form.role === 'client') navigate('/client/dashboard')
      else navigate('/prestataire/dashboard')

    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={font}>

      {/* Panel gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative z-10">
          <img src={logo} alt="Alicia" className="w-36 h-36 object-contain invert" />
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-light text-white leading-snug tracking-tight mb-6"
            style={{ letterSpacing: '-0.02em' }}>
            Rejoignez la communaute{' '}
            <span className="text-gray-500 font-light">freelance du Senegal.</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs font-light">
            Creez votre compte en quelques minutes et commencez a collaborer.
          </p>

          {/* Steps indicator */}
          <div className="flex items-center gap-4 mt-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step >= s ? 'bg-white text-black' : 'bg-gray-800 text-gray-600'
                }`}>
                  {s}
                </div>
                <span className={`text-xs font-light ${step >= s ? 'text-gray-400' : 'text-gray-700'}`}>
                  {s === 1 ? 'Infos' : s === 2 ? 'Role' : 'Details'}
                </span>
                {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-gray-500' : 'bg-gray-800'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-700 text-xs tracking-widest uppercase font-light">
            Dakar — 2025
          </p>
        </div>
      </div>

      {/* Panel droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">

          <div className="lg:hidden mb-10 flex justify-center">
            <img src={logo} alt="Alicia" className="w-24 h-24 object-contain" />
          </div>

          {/* Progress mobile */}
          <div className="lg:hidden flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                step >= s ? 'bg-black' : 'bg-gray-200'
              }`} />
            ))}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
              {step === 1 ? 'Creer un compte' : step === 2 ? 'Votre role' : 'Votre profil'}
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-light">
              {step === 1 ? 'Renseignez vos informations de base'
                : step === 2 ? 'Comment allez-vous utiliser la plateforme ?'
                : form.role === 'prestataire' ? 'Decrivez vos services'
                : 'Quelques informations supplementaires'}
            </p>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-light">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Mamadou Sow"
                  style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Telephone
                </label>
                <div className="flex">
                  <div className="flex items-center gap-2 px-3 py-3.5 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50">
                    <img
                      src="https://flagcdn.com/w20/sn.png"
                      alt="Senegal"
                      className="w-5 h-3.5 object-cover rounded-sm"
                    />
                    <span className="text-sm text-gray-500 font-light whitespace-nowrap">+221</span>
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="77 000 00 00"
                    style={font}
                    className="flex-1 px-4 py-3.5 border border-gray-200 rounded-r-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                />
              </div>

              <button
                onClick={handleNext}
                style={{ ...font, letterSpacing: '0.08em' }}
                className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-medium text-xs rounded-lg transition-all uppercase mt-2"
              >
                Continuer
              </button>

              <p className="text-center text-sm text-gray-400 font-light mt-2">
                Deja un compte ?{' '}
                <Link to="/login" className="text-black font-medium hover:underline underline-offset-2">
                  Se connecter
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setForm({ ...form, role: 'client' })}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  form.role === 'client'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-400 text-gray-700'
                }`}
              >
                <p className="font-medium text-sm">Je suis un Client</p>
                <p className={`text-xs mt-1 font-light ${
                  form.role === 'client' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Je cherche des prestataires pour mes projets
                </p>
              </button>

              <button
                onClick={() => setForm({ ...form, role: 'prestataire' })}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  form.role === 'prestataire'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-400 text-gray-700'
                }`}
              >
                <p className="font-medium text-sm">Je suis un Prestataire</p>
                <p className={`text-xs mt-1 font-light ${
                  form.role === 'prestataire' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  Je propose mes services et competences
                </p>
              </button>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  style={{ ...font, letterSpacing: '0.08em' }}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-medium text-xs rounded-lg hover:border-gray-400 transition-all uppercase"
                >
                  Retour
                </button>
                <button
                  onClick={handleNext}
                  style={{ ...font, letterSpacing: '0.08em' }}
                  className="flex-1 py-3.5 bg-black text-white font-medium text-xs rounded-lg hover:bg-gray-900 transition-all uppercase"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="localisation"
                  value={form.localisation}
                  onChange={handleChange}
                  placeholder="Dakar, Plateau"
                  style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                />
              </div>

              {form.role === 'prestataire' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                      Metier
                    </label>
                    <input
                      type="text"
                      name="metier"
                      value={form.metier}
                      onChange={handleChange}
                      placeholder="Developpeur Web"
                      style={font}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                      Competences (separees par des virgules)
                    </label>
                    <input
                      type="text"
                      name="competences"
                      value={form.competences}
                      onChange={handleChange}
                      placeholder="React, Node.js, Supabase"
                      style={font}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                        Prix min (FCFA)
                      </label>
                      <input
                        type="number"
                        name="prix_min"
                        value={form.prix_min}
                        onChange={handleChange}
                        placeholder="5000"
                        style={font}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                        Prix max (FCFA)
                      </label>
                      <input
                        type="number"
                        name="prix_max"
                        value={form.prix_max}
                        onChange={handleChange}
                        placeholder="50000"
                        style={font}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(2)}
                  style={{ ...font, letterSpacing: '0.08em' }}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-medium text-xs rounded-lg hover:border-gray-400 transition-all uppercase"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ ...font, letterSpacing: '0.08em' }}
                  className="flex-1 py-3.5 bg-black text-white font-medium text-xs rounded-lg hover:bg-gray-900 transition-all uppercase disabled:opacity-40"
                >
                  {loading ? 'Creation...' : 'Terminer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register