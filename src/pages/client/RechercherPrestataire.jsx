import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useGeolocation from '../../hooks/useGeolocation'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import VerifiedBadge from '../../components/ui/VerifiedBadge'
import BackButton from '../../components/ui/BackButton'

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const RechercherPrestataire = () => {
  const navigate = useNavigate()
  const [prestataires, setPrestataires] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtres, setFiltres] = useState({
    categorie: '', localisation: '', budget: '',
    disponible: false, certifie: false, proximite: false,
  })

  const geo = useGeolocation(null, false)

  useEffect(() => { fetchCategories(); fetchPrestataires() }, [])
  useEffect(() => { fetchPrestataires() }, [filtres, search, geo.location])

  useEffect(() => {
    if (filtres.proximite && !geo.location && !geo.loading) {
      geo.startWatching()
    }
  }, [filtres.proximite])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchPrestataires = async () => {
    setLoading(true)
    let query = supabase
      .from('prestataires')
      .select('*, profile:profiles(id, nom, localisation, avatar_url, bio, latitude, longitude)')
    if (filtres.disponible) query = query.eq('disponible', true)
    if (filtres.certifie) query = query.eq('verifie_cni', true)
    if (filtres.budget) query = query.lte('prix_min', filtres.budget)
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

    result = result.map(p => ({
      ...p,
      distance: geo.location && p.profile?.latitude && p.profile?.longitude
        ? getDistance(geo.location.lat, geo.location.lon, p.profile.latitude, p.profile.longitude)
        : null
    }))

    if (filtres.proximite && geo.location) {
      result.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance
        if (a.distance !== null) return -1
        if (b.distance !== null) return 1
        return 0
      })
    } else {
      result.sort((a, b) => (b.note_moyenne || 0) - (a.note_moyenne || 0))
    }

    setPrestataires(result)
    setLoading(false)
  }

  const toggleFiltre = (key) => setFiltres(f => ({ ...f, [key]: !f[key] }))

  const hasActiveFilters = filtres.disponible || filtres.certifie || filtres.proximite ||
    filtres.localisation || filtres.budget || filtres.categorie || search

  const formatDistance = (km) => {
    if (km < 1) return Math.round(km * 1000) + ' m'
    return km.toFixed(1) + ' km'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Trouver un prestataire
          </h1>
          <p className="text-gray-400 text-sm">
            {prestataires.length} prestataire{prestataires.length > 1 ? 's' : ''} trouvé{prestataires.length > 1 ? 's' : ''}
            {geo.location && filtres.proximite && ' · Triés par distance'}
          </p>
        </div>

        <div className="relative mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par métier, nom ou compétence..."
            className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-card" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={filtres.categorie}
              onChange={(e) => setFiltres({ ...filtres, categorie: e.target.value })}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-900 transition-all shadow-card">
              <option value="">Toutes catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <input type="text" value={filtres.localisation}
              onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
              placeholder="Filtrer par ville"
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
            <input type="number" value={filtres.budget}
              onChange={(e) => setFiltres({ ...filtres, budget: e.target.value })}
              placeholder="Budget max (FCFA)"
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => toggleFiltre('disponible')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                filtres.disponible ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
              }`}>
              Disponible
            </button>

            <button onClick={() => toggleFiltre('certifie')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                filtres.certifie ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
              }`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Certifié CNI
            </button>

            <button
              onClick={() => {
                if (!filtres.proximite && !geo.location) geo.startWatching()
                toggleFiltre('proximite')
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                filtres.proximite ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-300'
              }`}>
              {geo.loading ? (
                <div className="w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {geo.loading ? 'Localisation...' : 'Près de moi'}
              {geo.location && filtres.proximite && (
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={() => {
                setSearch('')
                setFiltres({ categorie: '', localisation: '', budget: '', disponible: false, certifie: false, proximite: false })
              }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border-2 border-red-200 bg-white text-red-500 hover:bg-red-50 transition-all">
                Réinitialiser
              </button>
            )}
          </div>

          {geo.error && filtres.proximite && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{geo.error}</p>
            </div>
          )}

          {geo.location && filtres.proximite && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                Localisation en temps réel · Précision : {Math.round(geo.location.accuracy)} m
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : prestataires.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-1">Aucun prestataire trouvé</p>
            <p className="text-gray-400 text-xs">Essayez d'élargir vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prestataires.map((p) => (
              <div key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-gray-900 truncate">{p.profile?.nom}</p>
                          {p.verifie_cni && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{p.metier}</p>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${p.disponible ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                  </div>

                  {p.profile?.bio && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{p.profile.bio}</p>
                  )}

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {p.note_moyenne > 0 && (
                      <div className="flex items-center gap-1.5">
                        <StarRating note={Math.round(p.note_moyenne)} size="sm" />
                        <span className="text-xs text-gray-500 font-medium">{p.note_moyenne}/5</span>
                      </div>
                    )}
                    {p.distance !== null && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {formatDistance(p.distance)}
                      </span>
                    )}
                  </div>

                  {p.competences?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.competences.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">{c}</span>
                      ))}
                      {p.competences.length > 3 && (
                        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-400 rounded-lg font-medium">
                          +{p.competences.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-4 md:px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400">{p.profile?.localisation || 'Dakar'}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        À partir de {p.prix_min?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={'/client/prestataire/' + p.profile?.id}
                      className="flex-1 py-2 text-center border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all">
                      Voir profil
                    </Link>
                    <button onClick={() => navigate('/client/creer-mission?prestataire=' + p.id)}
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