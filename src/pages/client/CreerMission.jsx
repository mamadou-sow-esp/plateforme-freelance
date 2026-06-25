import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const CreerMission = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prestataire_id = searchParams.get('prestataire')

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    titre: '',
    description: '',
    categorie_id: '',
    budget: '',
    localisation: '',
    delai: '',
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.titre || !form.description || !form.budget || !form.categorie_id) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    try {
      const { error: missionError } = await supabase
        .from('missions')
        .insert({
          titre: form.titre,
          description: form.description,
          categorie_id: form.categorie_id,
          budget: parseFloat(form.budget),
          localisation: form.localisation,
          delai: form.delai,
          client_id: profile?.id,
          prestataire_id: prestataire_id || null,
          statut: 'en_attente',
        })

      if (missionError) throw missionError

      setSuccess(true)
      setTimeout(() => navigate('/client/missions'), 2000)

    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={font}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Mission publiee</h2>
          <p className="text-gray-400 text-sm font-light">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Alicia" className="w-16 h-16 object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/client/dashboard"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link to="/client/rechercher"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Rechercher
            </Link>
            <Link to="/client/missions"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Mes missions
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {profile?.nom?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-black transition-colors font-light"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to="/client/dashboard"
            className="text-xs text-gray-400 hover:text-black transition-colors font-light flex items-center gap-1 mb-4">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
            style={{ letterSpacing: '-0.02em' }}>
            Creer une mission
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            Decrivez votre besoin pour trouver le bon prestataire
          </p>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">

          {/* Titre */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
              Titre de la mission *
            </label>
            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Creation d'un site web vitrine"
              style={font}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
              Description detaillee *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Decrivez precisement votre besoin, les livrables attendus, les contraintes..."
              style={font}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light resize-none"
            />
          </div>

          {/* Categorie + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Categorie *
              </label>
              <select
                name="categorie_id"
                value={form.categorie_id}
                onChange={handleChange}
                style={font}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
              >
                <option value="">Choisir...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Budget (FCFA) *
              </label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="50000"
                style={font}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
              />
            </div>
          </div>

          {/* Localisation + Délai */}
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Delai souhaite
              </label>
              <input
                type="text"
                name="delai"
                value={form.delai}
                onChange={handleChange}
                placeholder="Ex: 1 semaine"
                style={font}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
              />
            </div>
          </div>

          {prestataire_id && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-light">
                Cette mission sera assignee directement au prestataire selectionne
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ ...font, letterSpacing: '0.06em' }}
              className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-medium text-xs rounded-lg hover:border-gray-400 transition-all uppercase"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...font, letterSpacing: '0.06em' }}
              className="flex-1 py-3.5 bg-black text-white font-medium text-xs rounded-lg hover:bg-gray-900 transition-all uppercase disabled:opacity-40"
            >
              {loading ? 'Publication...' : 'Publier la mission'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreerMission