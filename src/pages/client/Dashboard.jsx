import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const ClientDashboard = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchMissions()
  }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        prestataire:profiles!missions_prestataire_id_fkey(nom, avatar_url)
      `)
      .eq('client_id', profile?.id)
      .order('created_at', { ascending: false })

    setMissions(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const stats = {
    total: missions.length,
    en_cours: missions.filter(m => m.statut === 'en_cours').length,
    valide: missions.filter(m => m.statut === 'valide').length,
    en_attente: missions.filter(m => m.statut === 'en_attente').length,
  }

  const statutLabel = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    livre: 'Livre',
    valide: 'Valide',
    conteste: 'Conteste',
    annule: 'Annule',
  }

  const statutColor = {
    en_attente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    en_cours: 'bg-blue-50 text-blue-700 border border-blue-200',
    livre: 'bg-purple-50 text-purple-700 border border-purple-200',
    valide: 'bg-green-50 text-green-700 border border-green-200',
    conteste: 'bg-red-50 text-red-700 border border-red-200',
    annule: 'bg-gray-50 text-gray-500 border border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
              Bonjour, {profile?.nom?.split(' ')[0]}
            </h1>
            <p className="text-gray-400 text-sm font-light mt-1">
              Voici un apercu de votre activite
            </p>
          </div>
          <Link to="/client/creer-mission"
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all">
            + Nouvelle mission
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total missions', value: stats.total },
            { label: 'En attente', value: stats.en_attente },
            { label: 'En cours', value: stats.en_cours },
            { label: 'Terminees', value: stats.valide },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-light mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900 text-sm">Missions recentes</h2>
            <Link to="/client/missions"
              className="text-xs text-gray-400 hover:text-black transition-colors">
              Voir tout
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-light">Chargement...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-900 font-medium text-sm mb-1">Aucune mission pour l'instant</p>
              <p className="text-gray-400 text-xs font-light mb-4">
                Creez votre premiere mission pour trouver un prestataire
              </p>
              <Link to="/client/creer-mission"
                className="inline-flex px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                Creer une mission
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {missions.slice(0, 5).map((mission) => (
                <div key={mission.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{mission.titre}</p>
                    <p className="text-xs text-gray-400 font-light mt-0.5">
                      {mission.categorie?.nom} — {mission.budget?.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    {mission.prestataire && (
                      <div className="hidden md:flex items-center gap-2">
                        <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="xs" />
                        <p className="text-xs text-gray-400 font-light">{mission.prestataire.nom}</p>
                      </div>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutColor[mission.statut]}`}>
                      {statutLabel[mission.statut]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-black rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">Trouvez le bon prestataire</p>
            <p className="text-gray-400 text-xs font-light mt-1">Parcourez notre catalogue de talents</p>
          </div>
          <Link to="/client/rechercher"
            className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
            Rechercher
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard