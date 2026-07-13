import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import useGeolocation from '../../hooks/useGeolocation'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import StarRating from '../../components/ui/StarRating'
import VerifiedBadge from '../../components/ui/VerifiedBadge'
import { MapPin } from 'lucide-react'

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

const ClientDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPrestataires, setLoadingPrestataires] = useState(true)
  const [geoActive, setGeoActive] = useState(false)

  const geo = useGeolocation(profile?.id, false)

  useEffect(() => {
    fetchMissions()
    fetchPrestataires()
    geo.startWatching()
    setGeoActive(true)
  }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), prestataire:profiles!missions_prestataire_id_fkey(nom, avatar_url)')
      .eq('client_id', profile?.id)
      .eq('conversation', false)
      .order('created_at', { ascending: false })
    setMissions(data || [])
    setLoading(false)
  }

  const fetchPrestataires = async () => {
    const { data } = await supabase
      .from('prestataires')
      .select('*, profile:profiles(id, nom, localisation, avatar_url, bio, latitude, longitude)')
      .eq('disponible', true)
    setPrestataires(data || [])
    setLoadingPrestataires(false)
  }

  const handleActiverGeo = () => {
    geo.startWatching()
    setGeoActive(true)
  }

  const stats = {
    total: missions.length,
    en_cours: missions.filter(m => m.statut === 'en_cours').length,
    valide: missions.filter(m => m.statut === 'valide').length,
    totalDepense: missions.filter(m => m.statut === 'valide').reduce((acc, m) => acc + (m.budget || 0), 0),
  }

  const prestatairesProches = [...prestataires]
    .map(p => ({
      ...p,
      distance: geo.location && p.profile?.latitude && p.profile?.longitude
        ? getDistance(geo.location.lat, geo.location.lon, p.profile.latitude, p.profile.longitude)
        : null
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      if (a.distance !== null) return -1
      if (b.distance !== null) return 1
      return (b.note_moyenne || 0) - (a.note_moyenne || 0)
    })
    .slice(0, 4)

  const formatDistance = (km) => {
    if (km < 1) return Math.round(km * 1000) + ' m'
    return km.toFixed(1) + ' km'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="lg" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Bonjour, {profile?.nom?.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-gray-400 text-sm">Voici votre tableau de bord</p>
                {geo.location && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Localisé
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link to="/client/creer-mission"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all self-start sm:self-auto">
            + Nouvelle mission
          </Link>
        </div>

        {/* PRESTATAIRES RECOMMANDÉS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-sm">
                {geo.location ? 'Prestataires près de toi' : 'Prestataires recommandés'}
              </h2>
              {geo.loading && (
                <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              )}
              {/* Point vert uniquement — pas de badge texte */}
              {geo.location && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </div>
            <Link to="/client/rechercher"
              className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">
              Voir tout
            </Link>
          </div>

          {/* Bandeau géoloc si pas encore accordée */}
          {!geo.location && !geo.loading && (
            <div className="mx-5 mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-blue-700 font-medium">
                  {geo.error || 'Activez la localisation pour voir les prestataires près de vous'}
                </p>
              </div>
              {!geo.error && (
                <button onClick={handleActiverGeo}
                  className="text-xs text-blue-700 font-bold hover:underline flex-shrink-0 ml-2">
                  Activer
                </button>
              )}
            </div>
          )}

          {loadingPrestataires ? (
            <div className="py-10 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : prestatairesProches.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-400 text-sm">Aucun prestataire disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-gray-50">
              {prestatairesProches.map((p) => (
                <div key={p.id}
                  className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50"
                  onClick={() => navigate('/client/prestataire/' + p.profile?.id)}>
                  <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.profile?.nom}</p>
                      {p.verifie_cni && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{p.metier}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.note_moyenne > 0 && (
                        <div className="flex items-center gap-1">
                          <StarRating note={Math.round(p.note_moyenne)} size="sm" />
                          <span className="text-xs text-gray-400">{p.note_moyenne}</span>
                        </div>
                      )}
                      {p.distance !== null ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <MapPin className="w-3 h-3" />
                          {formatDistance(p.distance)}
                        </span>
                      ) : (
                        p.profile?.localisation && (
                          <span className="text-xs text-gray-400">{p.profile.localisation}</span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">{p.prix_min?.toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-400">min.</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 border-t border-gray-50">
            <Link to="/client/rechercher"
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all">
              Voir tous les prestataires
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* NOUVELLES MISSIONS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm">Nouvelles missions</h2>
                <Link to="/client/missions"
                  className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">
                  Voir tout
                </Link>
              </div>
              {loading ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
              ) : missions.filter(m => ['en_attente', 'en_cours'].includes(m.statut)).length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission active</p>
                  <p className="text-gray-400 text-xs mb-4">Créez votre première mission</p>
                  <Link to="/client/creer-mission"
                    className="inline-flex px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                    Créer une mission
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {missions.filter(m => ['en_attente', 'en_cours'].includes(m.statut)).slice(0, 5).map((mission) => (
                    <div key={mission.id}
                      className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/client/missions')}>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{mission.titre}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {mission.categorie?.nom} · {mission.budget?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {mission.prestataire && (
                          <div className="hidden md:flex items-center gap-2">
                            <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="xs" />
                            <p className="text-xs text-gray-400">{mission.prestataire.nom}</p>
                          </div>
                        )}
                        <StatusBadge statut={mission.statut} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STATS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-4">Mes statistiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total missions', value: stats.total, color: 'text-gray-900' },
                  { label: 'En cours', value: stats.en_cours, color: 'text-blue-600' },
                  { label: 'Terminées', value: stats.valide, color: 'text-emerald-600' },
                  { label: 'Total dépensé', value: stats.totalDepense.toLocaleString() + ' FCFA', color: 'text-violet-600' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIQUE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-sm">Historique récent</h2>
                <Link to="/client/missions"
                  className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">
                  Voir tout
                </Link>
              </div>
              {missions.filter(m => ['valide', 'conteste', 'annule'].includes(m.statut)).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-gray-400 text-xs">Aucune mission terminée pour l'instant</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {missions.filter(m => ['valide', 'conteste', 'annule'].includes(m.statut)).slice(0, 4).map((mission) => (
                    <div key={mission.id}
                      className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/client/missions')}>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{mission.titre}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {mission.budget?.toLocaleString()} FCFA · {new Date(mission.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {mission.prestataire && (
                          <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="xs" />
                        )}
                        <StatusBadge statut={mission.statut} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <h3 className="font-bold text-base mb-1">Trouver un talent</h3>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Parcourez notre catalogue de prestataires vérifiés
              </p>
              <Link to="/client/rechercher"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all">
                Rechercher
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Statut géoloc */}
            <div className={`rounded-2xl p-4 border ${
              geo.location ? 'bg-emerald-50 border-emerald-200'
              : geo.error ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  geo.location ? 'bg-emerald-500 animate-pulse'
                  : geo.loading ? 'bg-amber-400 animate-pulse'
                  : geo.error ? 'bg-red-400'
                  : 'bg-gray-300'
                }`} />
                <p className={`text-xs font-bold ${
                  geo.location ? 'text-emerald-800'
                  : geo.error ? 'text-red-700'
                  : 'text-gray-600'
                }`}>
                  {geo.location ? 'Géolocalisation active'
                    : geo.loading ? 'Localisation en cours...'
                    : geo.error ? 'Localisation indisponible'
                    : 'Géolocalisation inactive'}
                </p>
              </div>
              {geo.location && (
                <p className="text-xs text-emerald-600 leading-relaxed">
                  Position mise à jour en temps réel. Précision : {Math.round(geo.location.accuracy)} m.
                </p>
              )}
              {geo.error && (
                <p className="text-xs text-red-500 leading-relaxed">{geo.error}</p>
              )}
              {!geo.location && !geo.loading && !geo.error && (
                <button onClick={handleActiverGeo}
                  className="mt-1 text-xs text-gray-700 font-semibold hover:underline">
                  Activer maintenant
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Accès rapide</h3>
              <div className="space-y-1">
                {[
                  { to: '/client/suivi', label: 'Suivi des missions' },
                  { to: '/client/messages', label: 'Mes messages' },
                  { to: '/client/profil', label: 'Mon profil' },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium transition-colors">
                      {item.label}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ClientDashboard