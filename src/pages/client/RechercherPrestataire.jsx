import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'

const RechercherPrestataire = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [prestataires, setPrestataires] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtres, setFiltres] = useState({
    categorie: '',
    localisation: '',
    prix_max: '',
    disponible: false,
  })

  useEffect(() => {
    fetchCategories()
    fetchPrestataires()
  }, [])

  useEffect(() => {
    fetchPrestataires()
  }, [filtres, search])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchPrestataires = async () => {
    setLoading(true)
    let query = supabase
      .from('prestataires')
      .select(`*, profile:profiles(id, nom, localisation, avatar_url, bio)`)

    if (filtres.disponible) query = query.eq('disponible', true)
    if (filtres.prix_max) query = query.lte('prix_max', filtres.prix_max)

    const { data } = await query
    let result = data || []

    if (search) {
      result = result.filter(p =>
        p.metier?.toLowerCase().includes(search.toLowerCase()) ||
        p.profile?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        p.competences?.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (filtres.localisation) {
      result = result.filter(p =>
        p.profile?.localisation?.toLowerCase().includes(filtres.localisation.toLowerCase())
      )
    }

    setPrestataires(result)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Trouver un prestataire
          </h1>
          <p className="text-gray-400 text-sm">
            {prestataires.length} prestataire{prestataires.length > 1 ? 's' : ''} disponible{prestataires.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par metier, nom ou competence..."
            className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-card"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <select
            value={filtres.categorie}
            onChange={(e) => setFiltres({ ...filtres, categorie: e.target.value })}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-900 transition-all shadow-card"
          >
            <option value="">Toutes categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>

          <input
            type="text"
            value={filtres.localisation}
            onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
            placeholder="Localisation"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card"
          />

          <input
            type="number"
            value={filtres.prix_max}
            onChange={(e) => setFiltres({ ...filtres, prix_max: e.target.value })}
            placeholder="Budget max (FCFA)"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card"
          />

          <button
            onClick={() => setFiltres({ ...filtres, disponible: !filtres.disponible })}
            className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
              filtres.disponible
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
            }`}
          >
            Disponible
          </button>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : prestataires.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-1">Aucun prestataire trouve</p>
            <p className="text-gray-400 text-xs">Essayez d elargir vos criteres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {prestataires.map((p) => (
              <div key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-gray-200 transition-all overflow-hidden">

                {/* Header card */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="md" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{p.profile?.nom}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.metier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.verifie_cni && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                          Verifie
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.disponible ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                    </div>
                  </div>

                  {/* Bio */}
                  {p.profile?.bio && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {p.profile.bio}
                    </p>
                  )}

                  {/* Note */}
                  {p.note_moyenne > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating note={Math.round(p.note_moyenne)} size="sm" />
                      <span className="text-xs text-gray-500 font-medium">{p.note_moyenne}/5</span>
                    </div>
                  )}

                  {/* Competences */}
                  {p.competences?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.competences.slice(0, 3).map((c, i) => (
                        <span key={i}
                          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          {c}
                        </span>
                      ))}
                      {p.competences.length > 3 && (
                        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-400 rounded-lg font-medium">
                          +{p.competences.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer card */}
                <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400">{p.profile?.localisation || 'Dakar'}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {p.prix_min?.toLocaleString()} — {p.prix_max?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={'/client/prestataire/' + p.profile?.id}
                      className="flex-1 py-2 text-center border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all">
                      Voir profil
                    </Link>
                    <button
                      onClick={() => navigate('/client/creer-mission?prestataire=' + p.id)}
                      className="flex-1 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default RechercherPrestataire