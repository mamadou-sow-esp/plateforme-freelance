import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const AdminDashboard = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    prestataires: 0,
    clients: 0,
    missions: 0,
    missions_en_cours: 0,
    missions_validees: 0,
  })
  const [users, setUsers] = useState([])
  const [missions, setMissions] = useState([])
  const [onglet, setOnglet] = useState('overview')
  const [loading, setLoading] = useState(true)

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: missionsData } = await supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        client:profiles!missions_client_id_fkey(nom),
        prestataire:profiles!missions_prestataire_id_fkey(nom)
      `)
      .order('created_at', { ascending: false })

    const u = usersData || []
    const m = missionsData || []

    setUsers(u)
    setMissions(m)
    setStats({
      users: u.length,
      prestataires: u.filter(x => x.role === 'prestataire').length,
      clients: u.filter(x => x.role === 'client').length,
      missions: m.length,
      missions_en_cours: m.filter(x => x.statut === 'en_cours').length,
      missions_validees: m.filter(x => x.statut === 'valide').length,
    })

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSupprimerUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchData()
  }

  const handleChangerRole = async (id, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    fetchData()
  }

  const handleSupprimerMission = async (id) => {
    if (!confirm('Supprimer cette mission ?')) return
    await supabase.from('missions').delete().eq('id', id)
    fetchData()
  }

  const statutColor = {
    en_attente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    en_cours: 'bg-blue-50 text-blue-700 border border-blue-200',
    livre: 'bg-purple-50 text-purple-700 border border-purple-200',
    valide: 'bg-green-50 text-green-700 border border-green-200',
    conteste: 'bg-red-50 text-red-700 border border-red-200',
    annule: 'bg-gray-50 text-gray-500 border border-gray-200',
  }

  const statutLabel = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    livre: 'Livre',
    valide: 'Valide',
    conteste: 'Conteste',
    annule: 'Annule',
  }

  const onglets = [
    { key: 'overview', label: 'Vue globale' },
    { key: 'users', label: 'Utilisateurs' },
    { key: 'missions', label: 'Missions' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={font}>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Alicia" className="w-16 h-16 object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {onglets.map(o => (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  onglet === o.key
                    ? 'bg-black text-white'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {o.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{profile?.nom}</p>
              <p className="text-xs text-gray-400 font-light">Administrateur</p>
            </div>
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

      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
            style={{ letterSpacing: '-0.02em' }}>
            Administration
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            Gestion de la plateforme
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Vue globale */}
            {onglet === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total utilisateurs', value: stats.users },
                    { label: 'Clients', value: stats.clients },
                    { label: 'Prestataires', value: stats.prestataires },
                    { label: 'Total missions', value: stats.missions },
                    { label: 'Missions en cours', value: stats.missions_en_cours },
                    { label: 'Missions validees', value: stats.missions_validees },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                      <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-400 font-light mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Derniers inscrits */}
                <div className="bg-white rounded-xl border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-medium text-gray-900 text-sm">Derniers inscrits</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {u.nom?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.nom}</p>
                            <p className="text-xs text-gray-400 font-light">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.role === 'admin'
                            ? 'bg-black text-white'
                            : u.role === 'prestataire'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Utilisateurs */}
            {onglet === 'users' && (
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-medium text-gray-900 text-sm">
                    Tous les utilisateurs ({users.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {u.nom?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.nom}</p>
                          <p className="text-xs text-gray-400 font-light truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangerRole(u.id, e.target.value)}
                          style={font}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-black transition-all bg-white text-gray-600"
                        >
                          <option value="client">Client</option>
                          <option value="prestataire">Prestataire</option>
                          <option value="admin">Admin</option>
                        </select>

                        {u.id !== profile?.id && (
                          <button
                            onClick={() => handleSupprimerUser(u.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-light transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missions */}
            {onglet === 'missions' && (
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900 text-sm">
                    Toutes les missions ({missions.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {missions.map(m => (
                    <div key={m.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.titre}</p>
                        <p className="text-xs text-gray-400 font-light mt-0.5">
                          {m.client?.nom} → {m.prestataire?.nom || 'Sans prestataire'}
                          {' · '}{m.budget?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statutColor[m.statut]}`}>
                          {statutLabel[m.statut]}
                        </span>
                        <button
                          onClick={() => handleSupprimerMission(m.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-light transition-colors flex-shrink-0"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard