import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const PrestataireDashboard = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: missionsData } = await supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        client:profiles!missions_client_id_fkey(nom, avatar_url)
      `)
      .eq('prestataire_id', profile?.id)
      .order('created_at', { ascending: false })

    const { data: profilData } = await supabase
      .from('prestataires')
      .select('*')
      .eq('id', profile?.id)
      .single()

    setMissions(missionsData || [])
    setProfil(profilData)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleLivrer = async (missionId) => {
    await supabase.from('missions').update({ statut: 'livre' }).eq('id', missionId)
    fetchData()
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
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Alicia" className="w-16 h-16 object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/prestataire/dashboard"
              className="text-sm font-medium text-black border-b-2 border-black pb-0.5">
              Dashboard
            </Link>
            <Link to="/prestataire/missions"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Missions disponibles
            </Link>
            <Link to="/prestataire/profil"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Mon profil
            </Link>
            <Link to="/prestataire/messages"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Messages
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{profile?.nom}</p>
              <p className="text-xs text-gray-400 font-light">Prestataire</p>
            </div>
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
            <button onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-black transition-colors font-light">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
              Bonjour, {profile?.nom?.split(' ')[0]}
            </h1>
            <p className="text-gray-400 text-sm font-light mt-1">Voici un apercu de votre activite</p>
          </div>
          <Link to="/prestataire/missions"
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all">
            Trouver des missions
          </Link>
        </div>

        {profil && !profil.verifie_cni && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Completez votre profil</p>
              <p className="text-xs text-yellow-600 font-light mt-0.5">
                Uploadez votre CNI pour obtenir le badge verifie
              </p>
            </div>
            <Link to="/prestataire/profil"
              className="px-3 py-1.5 bg-yellow-800 text-white text-xs font-medium rounded-lg hover:bg-yellow-900 transition-all whitespace-nowrap ml-4">
              Completer
            </Link>
          </div>
        )}

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

        {profil && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900 text-sm">Mon profil</h2>
              <Link to="/prestataire/profil"
                className="text-xs text-gray-400 hover:text-black transition-colors">
                Modifier
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <Avatar url={profile?.avatar_url} nom={profile?.nom} size="lg" />
              <div>
                <p className="font-medium text-gray-900">{profile?.nom}</p>
                <p className="text-sm text-gray-400 font-light">{profil.metier}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    profil.disponible
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {profil.disponible ? 'Disponible' : 'Indisponible'}
                  </span>
                  {profil.verifie_cni && (
                    <span className="text-xs px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                      Verifie
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 font-light mb-1">Note moyenne</p>
                <p className="text-sm font-medium text-gray-900">
                  {profil.note_moyenne > 0 ? `${profil.note_moyenne}/5` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-light mb-1">Prix</p>
                <p className="text-sm font-medium text-gray-900">
                  {profil.prix_min?.toLocaleString()} — {profil.prix_max?.toLocaleString()} FCFA
                </p>
              </div>
            </div>

            {profil.competences?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-light mb-2">Competences</p>
                <div className="flex flex-wrap gap-2">
                  {profil.competences.map((c, i) => (
                    <span key={i}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-light">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900 text-sm">Mes missions</h2>
            <Link to="/prestataire/missions"
              className="text-xs text-gray-400 hover:text-black transition-colors">
              Voir les disponibles
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm font-light">Chargement...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-900 font-medium text-sm mb-1">Aucune mission assignee</p>
              <p className="text-gray-400 text-xs font-light mb-4">
                Parcourez les missions disponibles et postulez
              </p>
              <Link to="/prestataire/missions"
                className="inline-flex px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                Voir les missions
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {missions.map((mission) => (
                <div key={mission.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{mission.titre}</p>
                      <p className="text-xs text-gray-400 font-light mt-0.5">
                        {mission.categorie?.nom} — {mission.budget?.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      {mission.client && (
                        <div className="hidden md:flex items-center gap-2">
                          <Avatar url={mission.client.avatar_url} nom={mission.client.nom} size="xs" />
                          <p className="text-xs text-gray-400 font-light">{mission.client.nom}</p>
                        </div>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutColor[mission.statut]}`}>
                        {statutLabel[mission.statut]}
                      </span>
                    </div>
                  </div>

                  {/* Bouton livrer */}
                  {mission.statut === 'en_cours' && (
                    <button
                      onClick={() => handleLivrer(mission.id)}
                      className="mt-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all"
                    >
                      Marquer comme livre
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-black rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">Nouvelles missions disponibles</p>
            <p className="text-gray-400 text-xs font-light mt-1">
              Trouvez des missions correspondant a vos competences
            </p>
          </div>
          <Link to="/prestataire/missions"
            className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
            Parcourir
          </Link>
        </div>
      </main>
    </div>
  )
}

export default PrestataireDashboard