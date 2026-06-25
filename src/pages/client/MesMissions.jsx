import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const MesMissions = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')

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
        prestataire:profiles!missions_prestataire_id_fkey(id, nom, localisation, avatar_url)
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

  const handleAccepter = async (missionId) => {
    await supabase.from('missions').update({ statut: 'en_cours' }).eq('id', missionId)
    fetchMissions()
  }

  const handleRefuser = async (missionId) => {
    await supabase.from('missions').update({ statut: 'en_attente', prestataire_id: null }).eq('id', missionId)
    fetchMissions()
  }

  const handleValider = async (missionId) => {
    await supabase.from('missions').update({ statut: 'valide' }).eq('id', missionId)
    fetchMissions()
  }

  const handleContester = async (missionId) => {
    await supabase.from('missions').update({ statut: 'conteste' }).eq('id', missionId)
    fetchMissions()
  }

  const handleAnnuler = async (missionId) => {
    await supabase.from('missions').update({ statut: 'annule' }).eq('id', missionId)
    fetchMissions()
  }

  const filtres = [
    { key: 'tous', label: 'Toutes' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'livre', label: 'Livrees' },
    { key: 'valide', label: 'Validees' },
    { key: 'annule', label: 'Annulees' },
  ]

  const missionsFiltrees = filtre === 'tous' ? missions : missions.filter(m => m.statut === filtre)

  const statutLabel = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    livre: 'Livree',
    valide: 'Validee',
    conteste: 'Contestee',
    annule: 'Annulee',
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
            <Link to="/client/dashboard"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link to="/client/rechercher"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Rechercher
            </Link>
            <Link to="/client/missions"
              className="text-sm font-medium text-black border-b-2 border-black pb-0.5">
              Mes missions
            </Link>
            <Link to="/client/messages"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Messages
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
            <button onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-black transition-colors font-light">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
              style={{ letterSpacing: '-0.02em' }}>
              Mes missions
            </h1>
            <p className="text-gray-400 text-sm font-light mt-1">
              {missions.length} mission{missions.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link to="/client/creer-mission"
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all">
            + Nouvelle mission
          </Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filtres.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtre === f.key
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : missionsFiltrees.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-900 font-medium text-sm mb-1">Aucune mission</p>
            <p className="text-gray-400 text-xs font-light">
              {filtre === 'tous' ? 'Creez votre premiere mission' : 'Aucune mission dans cette categorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {missionsFiltrees.map((mission) => (
              <div key={mission.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{mission.titre}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statutColor[mission.statut]}`}>
                        {statutLabel[mission.statut]}
                      </span>
                      {mission.statut === 'en_attente' && mission.prestataire_id && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-orange-50 text-orange-700 border border-orange-200 flex-shrink-0">
                          Candidature recue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-light line-clamp-2">{mission.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 font-light mb-3 flex-wrap">
                  <span>{mission.categorie?.nom}</span>
                  <span>•</span>
                  <span className="font-medium text-gray-700">{mission.budget?.toLocaleString()} FCFA</span>
                  {mission.localisation && <><span>•</span><span>{mission.localisation}</span></>}
                  {mission.delai && <><span>•</span><span>{mission.delai}</span></>}
                </div>

                {mission.prestataire && (
                  <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{mission.prestataire.nom}</p>
                      <p className="text-xs text-gray-400 font-light">{mission.prestataire.localisation}</p>
                    </div>
                    {mission.statut === 'en_attente' && (
                      <span className="text-xs text-orange-600 font-light">En attente de votre decision</span>
                    )}
                    {/* Bouton voir profil */}
                    <Link
                      to={`/client/prestataire/${mission.prestataire.id}`}
                      className="text-xs text-black font-medium hover:underline underline-offset-2 whitespace-nowrap"
                    >
                      Voir profil
                    </Link>
                  </div>
                )}

                <div className="flex gap-2 mt-3 flex-wrap">
                  {mission.statut === 'en_attente' && mission.prestataire_id && (
                    <>
                      <button onClick={() => handleAccepter(mission.id)}
                        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                        Accepter le prestataire
                      </button>
                      <button onClick={() => handleRefuser(mission.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:border-red-300 hover:text-red-500 transition-all">
                        Refuser
                      </button>
                    </>
                  )}
                  {mission.statut === 'en_attente' && !mission.prestataire_id && (
                    <button onClick={() => handleAnnuler(mission.id)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:border-red-300 hover:text-red-500 transition-all">
                      Annuler la mission
                    </button>
                  )}
                  {mission.statut === 'livre' && (
                    <>
                      <button onClick={() => handleValider(mission.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all">
                        Valider la livraison
                      </button>
                      <button onClick={() => handleContester(mission.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 transition-all">
                        Contester
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MesMissions