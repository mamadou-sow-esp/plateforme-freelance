import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { insertModere } from '../../lib/moderation'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

const CreerMission = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prestataire_id = searchParams.get('prestataire')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    titre: '', description: '', categorie_id: '', budget: '', localisation: '', delai: '',
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
      await insertModere('mission', {
        titre: form.titre,
        description: form.description,
        categorie_id: form.categorie_id,
        budget: parseFloat(form.budget),
        localisation: form.localisation,
        delai: form.delai,
        client_id: profile?.id,
        prestataire_id: prestataire_id || null,
        statut: 'en_attente',
        assigne_directement: !!prestataire_id,
      })
      setSuccess(true)
      setTimeout(() => navigate('/client/missions'), 2000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {prestataire_id ? 'Mission assignée !' : 'Mission publiée !'}
            </h2>
            <p className="text-gray-400 text-sm">Redirection en cours...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="mb-8">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {prestataire_id ? 'Assigner une mission' : 'Créer une mission'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {prestataire_id
              ? 'Décrivez la mission à assigner à ce prestataire'
              : 'Décrivez votre besoin pour trouver le bon prestataire'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6 space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Titre de la mission *
            </label>
            <input type="text" name="titre" value={form.titre} onChange={handleChange}
              placeholder="Ex: Création d'un site web vitrine"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description détaillée *
            </label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              placeholder="Décrivez précisément votre besoin, les livrables attendus, les contraintes..."
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catégorie *</label>
              <select name="categorie_id" value={form.categorie_id} onChange={handleChange}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white">
                <option value="">Choisir...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget (FCFA) *</label>
              <input type="number" name="budget" value={form.budget} onChange={handleChange}
                placeholder="50000"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localisation</label>
              <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
                placeholder="Dakar, Plateau"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Délai souhaité</label>
              <input type="text" name="delai" value={form.delai} onChange={handleChange}
                placeholder="Ex: 1 semaine"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
            </div>
          </div>

          {prestataire_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 font-medium">
                Cette mission sera assignée directement au prestataire sélectionné. Il devra l'accepter avant qu'elle commence.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:border-gray-400 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
              {loading
                ? (prestataire_id ? 'Assignation...' : 'Publication...')
                : (prestataire_id ? 'Assigner au prestataire' : 'Publier la mission')}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default CreerMission