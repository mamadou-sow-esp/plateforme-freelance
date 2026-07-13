import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import StarRating from '../../components/ui/StarRating'
import BackButton from '../../components/ui/BackButton'

const Historique = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [avisSelected, setAvisSelected] = useState([])
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => { fetchMissions() }, [])

  useEffect(() => {
    if (selected) fetchAvis(selected.id)
  }, [selected])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(id, nom, localisation, avatar_url)')
      .eq('prestataire_id', profile?.id)
      .eq('conversation', false)
      .order('created_at', { ascending: false })
    setMissions(data || [])
    if (data && data.length > 0) setSelected(data[0])
    setLoading(false)
  }

  const fetchAvis = async (missionId) => {
    const { data } = await supabase.from('avis')
      .select('*, auteur:profiles!avis_auteur_id_fkey(nom, avatar_url)')
      .eq('mission_id', missionId)
    setAvisSelected(data || [])
  }

  const handleLivrer = async (missionId) => {
    await supabase.from('missions').update({ statut: 'livre' }).eq('id', missionId)
    fetchMissions()
  }

  const filtres = [
    { key: 'tous', label: 'Toutes' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'valide', label: 'Terminées' },
    { key: 'conteste', label: 'Contestées' },
    { key: 'annule', label: 'Annulées' },
  ]

  const missionsFiltrees = (filtre === 'tous' ? missions : missions.filter(m => m.statut === filtre))
    .filter(m => search === '' ||
      m.titre?.toLowerCase().includes(search.toLowerCase()) ||
      m.client?.nom?.toLowerCase().includes(search.toLowerCase())
    )

  const totalGagne = missions.filter(m => m.statut === 'valide').reduce((acc, m) => acc + (m.budget || 0), 0)

  const handleSelectMission = (mission) => {
    setSelected(mission)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Historique des missions</h1>
            <p className="text-gray-400 text-sm mt-1">
              {missions.length} mission{missions.length > 1 ? 's' : ''} — {totalGagne.toLocaleString()} FCFA gagnés
            </p>
          </div>
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card w-full sm:w-48" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filtres.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filtre === f.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 shadow-card'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-2">Aucune mission pour l'instant</p>
            <Link to="/prestataire/missions" className="text-xs text-gray-400 hover:text-gray-900 underline">Trouver des missions</Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">

            {/* Liste */}
            <div className={`${showDetail ? 'hidden md:block' : 'block'} w-full md:w-72 flex-shrink-0 space-y-2`}>
              {missionsFiltrees.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center">
                  <p className="text-gray-400 text-xs">Aucune mission dans cette catégorie</p>
                </div>
              ) : (
                missionsFiltrees.map(mission => (
                  <button key={mission.id} onClick={() => handleSelectMission(mission)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selected?.id === mission.id && showDetail ? 'border-gray-900 bg-gray-900' : 'border-gray-100 bg-white hover:border-gray-300 shadow-card'
                    }`}>
                    <p className={`text-sm font-semibold truncate mb-1.5 ${selected?.id === mission.id && showDetail ? 'text-white' : 'text-gray-900'}`}>
                      {mission.titre}
                    </p>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs truncate max-w-24 ${selected?.id === mission.id && showDetail ? 'text-gray-300' : 'text-gray-400'}`}>
                        {mission.client?.nom}
                      </span>
                      <StatusBadge statut={mission.statut} />
                    </div>
                    <span className={`text-xs font-bold ${selected?.id === mission.id && showDetail ? 'text-white' : 'text-gray-900'}`}>
                      {mission.budget?.toLocaleString()} FCFA
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Détail */}
            {selected && (
              <div className={`${showDetail ? 'block' : 'hidden md:block'} flex-1 space-y-4`}>

                <button onClick={() => setShowDetail(false)}
                  className="md:hidden flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 font-medium mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour à la liste
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1">{selected.titre}</h2>
                      <p className="text-xs text-gray-400">
                        Créée le {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge statut={selected.statut} />
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Budget', value: selected.budget?.toLocaleString() + ' FCFA' },
                      { label: 'Catégorie', value: selected.categorie?.nom || '—' },
                      { label: 'Localisation', value: selected.localisation || '—' },
                      { label: 'Délai', value: selected.delai || '—' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {selected.statut === 'valide' ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Mission terminée avec succès</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Vous avez gagné {selected.budget?.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ) : selected.statut === 'conteste' ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800">Mission contestée</p>
                        <p className="text-xs text-red-600 mt-0.5">Le client a contesté la livraison</p>
                      </div>
                    </div>
                  ) : selected.statut === 'en_cours' ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-blue-800">Mission en cours</p>
                        <p className="text-xs text-blue-600 mt-0.5">Marquez la mission comme livrée quand vous avez terminé</p>
                      </div>
                      <button onClick={() => handleLivrer(selected.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all flex-shrink-0">
                        Marquer livré
                      </button>
                    </div>
                  ) : null}
                </div>

                {selected.client && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Client</h3>
                    <div className="flex items-center gap-3">
                      <Avatar url={selected.client.avatar_url} nom={selected.client.nom} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selected.client.nom}</p>
                        <p className="text-xs text-gray-400">{selected.client.localisation}</p>
                      </div>
                      <Link to="/prestataire/messages"
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all flex-shrink-0">
                        Message
                      </Link>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Avis reçu</h3>
                  {avisSelected.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      {selected.statut === 'valide' ? "Le client n'a pas encore laissé d'avis" : 'Aucun avis pour cette mission'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {avisSelected.map((a, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar url={a.auteur?.avatar_url} nom={a.auteur?.nom} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{a.auteur?.nom}</p>
                              <StarRating note={a.note} size="sm" />
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {a.commentaire ? (
                            <p className="text-sm text-gray-600 leading-relaxed">{a.commentaire}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Aucun commentaire</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap pb-4">
                  <Link to="/prestataire/statistiques"
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all">
                    Mes statistiques
                  </Link>
                  <Link to="/prestataire/missions"
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                    Trouver des missions
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Historique