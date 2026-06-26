import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const Historique = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

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
        client:profiles!missions_client_id_fkey(id, nom, localisation, avatar_url),
        avis(note, commentaire, created_at)
      `)
      .eq('prestataire_id', profile?.id)
      .order('created_at', { ascending: false })

    setMissions(data || [])
    if (data && data.length > 0) setSelected(data[0])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleLivrer = async (missionId) => {
    await supabase.from('missions').update({ statut: 'livre' }).eq('id', missionId)
    fetchMissions()
  }

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

  const filtres = [
    { key: 'tous', label: 'Toutes' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'valide', label: 'Terminees' },
    { key: 'conteste', label: 'Contestees' },
    { key: 'annule', label: 'Annulees' },
  ]

  const missionsFiltrees = (filtre === 'tous'
    ? missions
    : missions.filter(m => m.statut === filtre)
  ).filter(m =>
    search === '' ||
    m.titre?.toLowerCase().includes(search.toLowerCase()) ||
    m.client?.nom?.toLowerCase().includes(search.toLowerCase())
  )

  const totalGagne = missions
    .filter(m => m.statut === 'valide')
    .reduce((acc, m) => acc + (m.budget || 0), 0)

  const renderStars = (note) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < note ? 'text-yellow-400' : 'text-gray-200'}`}>
        {'\u2605'}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Historique des missions
            </h1>
            <p className="text-gray-400 text-sm font-light mt-1">
              {missions.length} mission{missions.length > 1 ? 's' : ''} — {totalGagne.toLocaleString()} FCFA gagnes
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={font}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white font-light w-56"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
        ) : missions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-900 font-medium text-sm mb-2">Aucune mission pour l instant</p>
            <Link to="/prestataire/missions" className="text-xs text-gray-400 hover:text-black underline">
              Trouver des missions
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">

            <div className="w-80 flex-shrink-0 space-y-2">
              {missionsFiltrees.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                  <p className="text-gray-400 text-xs font-light">Aucune mission dans cette categorie</p>
                </div>
              ) : (
                missionsFiltrees.map(mission => (
                  <button
                    key={mission.id}
                    onClick={() => setSelected(mission)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selected?.id === mission.id
                        ? 'border-black bg-black'
                        : 'border-gray-100 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-sm font-medium truncate mb-1.5 ${
                      selected?.id === mission.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mission.titre}
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-light ${
                        selected?.id === mission.id ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {mission.client?.nom}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selected?.id === mission.id
                          ? 'bg-white/20 text-white'
                          : statutColor[mission.statut]
                      }`}>
                        {statutLabel[mission.statut]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${
                        selected?.id === mission.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mission.budget?.toLocaleString()} FCFA
                      </span>
                      <span className="text-xs text-gray-400 font-light">
                        {new Date(mission.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short'
                        })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selected ? (
              <div className="flex-1 space-y-4">

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">{selected.titre}</h2>
                      <p className="text-xs text-gray-400 font-light">
                        Creee le {new Date(selected.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statutColor[selected.statut]}`}>
                      {statutLabel[selected.statut]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-light leading-relaxed mb-5">
                    {selected.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 font-light mb-1">Budget</p>
                      <p className="text-sm font-bold text-gray-900">{selected.budget?.toLocaleString()} FCFA</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 font-light mb-1">Categorie</p>
                      <p className="text-sm font-medium text-gray-900">{selected.categorie?.nom || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 font-light mb-1">Localisation</p>
                      <p className="text-sm font-medium text-gray-900">{selected.localisation || '—'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 font-light mb-1">Delai</p>
                      <p className="text-sm font-medium text-gray-900">{selected.delai || '—'}</p>
                    </div>
                  </div>

                  {selected.statut === 'valide' ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">Mission terminee avec succes</p>
                        <p className="text-xs text-green-600 font-light mt-0.5">
                          Vous avez gagne {selected.budget?.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  ) : selected.statut === 'conteste' ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Mission contestee</p>
                        <p className="text-xs text-red-600 font-light mt-0.5">Le client a conteste la livraison</p>
                      </div>
                    </div>
                  ) : selected.statut === 'en_cours' ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Mission en cours</p>
                        <p className="text-xs text-blue-600 font-light mt-0.5">
                          Marquez la mission comme livree quand vous avez termine
                        </p>
                      </div>
                      <button
                        onClick={() => handleLivrer(selected.id)}
                        className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all flex-shrink-0 ml-4">
                        Marquer livre
                      </button>
                    </div>
                  ) : null}
                </div>

                {selected.client ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 text-sm mb-4">Client</h3>
                    <div className="flex items-center gap-3">
                      <Avatar url={selected.client.avatar_url} nom={selected.client.nom} size="md" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selected.client.nom}</p>
                        <p className="text-xs text-gray-400 font-light">{selected.client.localisation}</p>
                      </div>
                      <Link to="/prestataire/messages"
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:border-black transition-all">
                        Envoyer message
                      </Link>
                    </div>
                  </div>
                ) : null}

                {selected.avis && selected.avis.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 text-sm mb-4">Avis recu</h3>
                    {selected.avis.map((a, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(a.note)}</div>
                          <span className="text-xs text-gray-500 font-medium">{a.note}/5</span>
                          <span className="ml-auto text-xs text-gray-400 font-light">
                            {new Date(a.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                        </div>
                        {a.commentaire ? (
                          <p className="text-sm text-gray-600 font-light leading-relaxed">{a.commentaire}</p>
                        ) : (
                          <p className="text-xs text-gray-400 font-light italic">Aucun commentaire</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : selected.statut === 'valide' ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 text-sm mb-2">Avis recu</h3>
                    <p className="text-xs text-gray-400 font-light">Le client n a pas encore laisse d avis</p>
                  </div>
                ) : null}

                <div className="flex gap-2 flex-wrap">
                  <Link to="/prestataire/statistiques"
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:border-black transition-all">
                    Voir mes statistiques
                  </Link>
                  <Link to="/prestataire/missions"
                    className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                    Trouver des missions
                  </Link>
                </div>

              </div>
            ) : null}

          </div>
        )}

      </main>
    </div>
  )
}

export default Historique