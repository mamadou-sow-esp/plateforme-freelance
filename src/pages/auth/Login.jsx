import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getSavedAccounts, setActiveAccountId } from '../../lib/multiAccountStorage'
import Avatar from '../../components/ui/Avatar'
import logo from '../../assets/logo.png'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const savedAccounts = getSavedAccounts()
  // Si des comptes sont déjà enregistrés sur ce navigateur, on propose de
  // les réutiliser d'abord plutôt que de forcer une nouvelle connexion.
  const [showSwitcher, setShowSwitcher] = useState(savedAccounts.length > 0)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleUseAccount = (accountId) => {
    setActiveAccountId(accountId)
    window.location.href = '/'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Alicia" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bon retour</h1>
          <p className="text-gray-400 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">

          {showSwitcher ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Comptes sur ce navigateur
              </p>
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleUseAccount(acc.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
                >
                  <Avatar url={acc.avatar_url} nom={acc.nom} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{acc.nom}</p>
                    <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setShowSwitcher(false)}
                className="w-full py-3.5 mt-4 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:border-gray-900 transition-all"
              >
                Utiliser un autre compte
              </button>
            </div>
          ) : (
            <>
              {savedAccounts.length > 0 && (
                <button
                  onClick={() => setShowSwitcher(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium mb-5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour aux comptes enregistrés
                </button>
              )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mot de passe
                </label>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-gray-900 font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Alicia — Plateforme freelance du Sénégal
        </p>
      </div>
    </div>
  )
}

export default Login