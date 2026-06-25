import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'client') navigate('/client/dashboard')
    else if (profile?.role === 'prestataire') navigate('/prestataire/dashboard')
    else if (profile?.role === 'admin') navigate('/admin/dashboard')

    setLoading(false)
  }

  const font = { fontFamily: "'DM Sans', sans-serif" }

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

        {/* Logo */}
        <div className="relative z-10">
          <img src={logo} alt="Alicia" className="w-36 h-36 object-contain invert" />
        </div>

        {/* Texte central */}
        <div className="relative z-10">
          <h2 className="text-4xl font-light text-white leading-snug tracking-tight mb-6"
            style={{ letterSpacing: '-0.02em' }}>
            La plateforme freelance{' '}
            <span className="text-gray-500 font-light">du Senegal.</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs font-light">
            Connectez clients et prestataires de services dans un espace de confiance, simple et efficace.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-gray-700 text-xs tracking-widest uppercase font-light">
            Dakar — 2025
          </p>
          <div className="w-8 h-px bg-gray-700" />
        </div>
      </div>

      {/* Panel droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden mb-10 flex justify-center">
            <img src={logo} alt="Alicia" className="w-20 h-21 object-contain" />
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
              Bon retour
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-light">
              Connectez-vous a votre espace personnel
            </p>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-light">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="vous@exemple.com"
                style={font}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 bg-gray-50 focus:bg-white font-light"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Mot de passe
                </label>
                <button type="button"
                  className="text-xs text-gray-400 hover:text-black transition-colors font-light">
                  Oublie ?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 bg-gray-50 focus:bg-white pr-16 font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black font-medium transition-colors"
                >
                  {showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...font, letterSpacing: '0.08em' }}
              className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-medium text-xs rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed uppercase mt-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 tracking-widest font-light">OU</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-400 font-light">
            Pas encore de compte ?{' '}
            <Link to="/register"
              className="text-black font-medium hover:underline underline-offset-2"
              style={{ letterSpacing: '0.01em' }}>
              Creer un compte
            </Link>
          </p>

          <p className="text-center text-xs text-gray-300 mt-8 font-light">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login