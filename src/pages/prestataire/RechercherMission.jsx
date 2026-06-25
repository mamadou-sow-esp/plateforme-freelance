import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const RechercherMission = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtres, setFiltres] = useState({
    categorie_id: '',
    localisation: '',
    budget_min: '',
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchCategories()
    fetchMissions()
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [filtres, search])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchMissions = async () => {
    setLoading(true)

    let query = supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        client:profiles!missions_client_id_fkey(nom, localisation)
      `)
      .eq('statut', 'en_attente')
      .is('prestataire_id', null)
      .order('created_at', { ascending: false })

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
      result = result.filter(m =>
        m.localisation?.toLowerCase().includes(filtres.localisation.toLowerCase())
      )
    }

    setMissions(result)
    setLoading(false)
  }

  const handlePostuler = async (missionId) => {
    await supabase
      .from('missions')
      .update({
        prestataire_id: profile?.id,
        statut: 'en_cours'
      })
      .eq('id', missionId)
    fetchMissions()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
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
            <Link to="/prestataire/dashboard"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link to="/prestataire/missions"
              className="text-sm font-medium text-black border-b-2 border-black pb-0.5">
              Missions disponibles
            </Link>
            <Link to="/prestataire/profil"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Mon profil
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

      <main className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
            style={{ letterSpacing: '-0.02em' }}>
            Missions disponibles
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            {missions.length} mission{missions.length > 1 ? 's' : ''} disponible{missions.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une mission..."
            style={font}
            className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white font-light"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <select
            value={filtres.categorie_id}
            onChange={(e) => setFiltres({ ...filtres, categorie_id: e.target.value })}
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-black transition-all bg-white font-light"
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
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-black transition-all bg-white font-light"
          />

          <input
            type="number"
            value={filtres.budget_min}
            onChange={(e) => setFiltres({ ...filtres, budget_min: e.target.value })}
            placeholder="Budget min (FCFA)"
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-black transition-all bg-white font-light"
          />
        </div>

        {/* Liste missions */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-900 font-medium text-sm mb-1">Aucune mission disponible</p>
            <p className="text-gray-400 text-xs font-light">Revenez plus tard ou elargissez vos criteres</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 transition-all">

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {mission.titre}
                    </h3>
                    <p className="text-xs text-gray-400 font-light line-clamp-2">
                      {mission.description}
                    </p>
                  </div>
                  <span className="ml-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {mission.budget?.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-light mb-4">
                  {mission.categorie?.nom && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {mission.categorie.nom}
                    </span>
                  )}
                  {mission.localisation && (
                    <span>{mission.localisation}</span>
                  )}
                  {mission.delai && (
                    <>
                      <span>•</span>
                      <span>{mission.delai}</span>
                    </>
                  )}
                </div>

                {/* Client */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">
                        {mission.client?.nom?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-light">
                      {mission.client?.nom}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePostuler(mission.id)}
                    className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all"
                    style={{ letterSpacing: '0.04em' }}
                  >
                    Postuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default RechercherMission