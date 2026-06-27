import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'

const RechercherMission = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState('')
  const [filtres, setFiltres] = useState({ categorie_id: '', localisation: '', budget_min: '' })

  useEffect(() => { fetchCategories(); fetchMissions() }, [])
  useEffect(() => { fetchMissions() }, [filtres, search])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchMissions = async () => {
    setLoading(true)
    let query = supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, localisation, avatar_url)')
      .eq('statut', 'en_attente').is('prestataire_id', null).order('created_at', { ascending: false })
    if (filtres.categorie_id) query = query.eq('categorie_id', filtres.categorie_id)
    if (filtres.budget_min) query = query.gte('budget', filtres.budget_min)
    const { data } = await query
    let result = data || []
    if (search) {
      result = result.filter(m =>
        m.titre?.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (filtres.localisation) {
      result = result.filter(m => m.localisation?.toLowerCase().includes(filtres.localisation.toLowerCase()))
    }
    setMissions(result)
    setLoading(false)
  }

  const handlePostuler = async (missionId) => {
    const { error } = await supabase.from('missions')
      .update({ prestataire_id: profile?.id, statut: 'en_attente' }).eq('id', missionId)
    if (error) {
      setNotification('error:' + error.message)
      setTimeout(() => setNotification(''), 4000)
      return
    }
    setNotification('success:Candidature envoyée ! Le client doit accepter votre demande.')
    setTimeout(() => setNotification(''), 4000)
    fetchMissions()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {notification && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:right-6 md:top-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-modal border max-w-sm ${
          notification.startsWith('error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${notification.startsWith('error') ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium flex-1">
            {notification.startsWith('error') ? notification.replace('error:', '') : notification.replace('success:', '')}
          </p>
          <button onClick={() => setNotification('')} className="text-gray-400 hover:text-gray-600 font-bold flex-shrink-0">×</button>
        </div>
      )}

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Missions disponibles</h1>
          <p className="text-gray-400 text-sm mt-1">
            {missions.length} mission{missions.length > 1 ? 's' : ''} disponible{missions.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="relative mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une mission..."
            className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-card" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <select value={filtres.categorie_id} onChange={(e) => setFiltres({ ...filtres, categorie_id: e.target.value })}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-900 transition-all shadow-card">
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <input type="text" value={filtres.localisation} onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
            placeholder="Localisation"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
          <input type="number" value={filtres.budget_min} onChange={(e) => setFiltres({ ...filtres, budget_min: e.target.value })}
            placeholder="Budget min (FCFA)"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission disponible</p>
            <p className="text-gray-400 text-xs">Revenez plus tard ou élargissez vos critères</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{mission.titre}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{mission.description}</p>
                  </div>
                  <span className="text-base font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                    {mission.budget?.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
                  {mission.categorie?.nom && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl font-semibold">{mission.categorie.nom}</span>
                  )}
                  {mission.localisation && <span className="text-gray-400">{mission.localisation}</span>}
                  {mission.delai && <><span className="text-gray-300">·</span><span className="text-gray-400">{mission.delai}</span></>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar url={mission.client?.avatar_url} nom={mission.client?.nom} size="xs" />
                    <span className="text-xs text-gray-400 font-medium truncate max-w-24">{mission.client?.nom}</span>
                  </div>
                  <button onClick={() => handlePostuler(mission.id)}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all flex-shrink-0">
                    Postuler
                  </button>
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

export default RechercherMission