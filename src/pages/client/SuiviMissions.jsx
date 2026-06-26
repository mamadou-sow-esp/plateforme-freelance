import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const SuiviMissions = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
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
        prestataire:profiles!missions_prestataire_id_fkey(id, nom, localisation, avatar_url),
        messages:messages(count),
        avis(note, commentaire)
      `)
      .eq('client_id', profile?.id)
      .order('created_at', { ascending: false })

    setMissions(data || [])
    if (data && data.length > 0) setSelected(data[0])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
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

  // Timeline steps par statut
  const getTimeline = (mission) => {
    const steps = [
      {
        key: 'creation',
        label: 'Mission creee',
        desc: 'Votre mission a ete publiee',
        done: true,
        date: mission.created_at,
      },
      {
        key: 'candidature',
        label: 'Candidature recue',
        desc: mission.prestataire
          ? mission.prestataire.nom + ' a postule'
          : 'En attente d\'une candidature',
        done: !!mission.prestataire_id,
        date: null,
      },
      {
        key: 'acceptation',
        label: 'Prestataire accepte',
        desc: mission.prestataire
          ? 'Vous avez accepte ' + mission.prestataire.nom
          : 'En attente de votre decision',
        done: ['en_cours', 'livre', 'valide', 'conteste'].includes(mission.statut),
        date: null,
      },
      {
        key: 'livraison',
        label: 'Mission livree',
        desc: 'Le prestataire a marque la mission comme terminee',
        done: ['livre', 'valide', 'conteste'].includes(mission.statut),
        date: null,
      },
      {
        key: 'validation',
        label: mission.statut === 'conteste' ? 'Mission contestee' : 'Mission validee',
        desc: mission.statut === 'valide'
          ? 'Vous avez valide la livraison'
          : mission.statut === 'conteste'
          ? 'Vous avez conteste la livraison'
          : 'En attente de votre validation',
        done: ['valide', 'conteste'].includes(mission.statut),
        date: null,
        isConteste: mission.statut === 'conteste',
      },
    ]

    if (mission.statut === 'annule') {
      return [
        { key: 'creation', label: 'Mission creee', desc: 'Votre mission a ete publiee', done: true, date: mission.created_at },
        { key: 'annule', label: 'Mission annulee', desc: 'Cette mission a ete annulee', done: true, date: null, isConteste: true },
      ]
    }

    return steps
  }

  const filtres = [
    { key: 'tous', label: 'Toutes' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'livre', label: 'Livrees' },
    { key: 'valide', label: 'Validees' },
    { key: 'annule', label: 'Annulees' },
  ]

  const missionsFiltrees = filtre === 'tous'
    ? missions
    : missions.filter(m => m.statut === filtre)

  return (
    <div className="min-h-screen bg-gray-50" style={font}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Suivi des missions
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            Suivez l'avancement de toutes vos missions en detail
          </p>
        </div>

        {/* Filtres */}
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
            <p className="text-gray-900 font-medium text-sm mb-2">Aucune mission pour l'instant</p>
            <Link to="/client/creer-mission"
              className="text-xs text-gray-400 hover:text-black transition-colors underline">
              Creer une mission
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">

            {/* Liste missions */}
            <div className="w-80 flex-shrink-0 space-y-2">
              {missionsFiltrees.map(mission => (
                <button
                  key={mission.id}
                  onClick={() => setSelected(mission)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selected?.id === mission.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`text-sm font-medium truncate mb-1 ${
                    selected?.id === mission.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {mission.titre}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-light ${
                      selected?.id === mission.id ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {mission.budget?.toLocaleString()} FCFA
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selected?.id === mission.id
                        ? 'bg-white/20 text-white'
                        : statutColor[mission.statut]
                    }`}>
                      {statutLabel[mission.statut]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail mission */}
            {selected ? (
              <div className="flex-1 space-y-4">

                {/* Header */}
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

                  <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
                    {selected.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 font-light mb-1">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selected.budget?.toLocaleString()} FCFA
                      </p>
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
                </div>

                {/* Prestataire */}
                {selected.prestataire ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 text-sm mb-4">Prestataire</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar url={selected.prestataire.avatar_url} nom={selected.prestataire.nom} size="md" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selected.prestataire.nom}</p>
                          <p className="text-xs text-gray-400 font-light">{selected.prestataire.localisation}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={'/client/prestataire/' + selected.prestataire.id}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:border-black transition-all">
                          Voir profil
                        </Link>
                        <Link
                          to="/client/messages"
                          className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                          Envoyer message
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Timeline */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-medium text-gray-900 text-sm mb-6">Timeline</h3>
                  <div className="space-y-0">
                    {getTimeline(selected).map((step, i, arr) => (
                      <div key={step.key} className="flex gap-4">
                        {/* Indicateur */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            step.isConteste
                              ? 'border-red-400 bg-red-50'
                              : step.done
                              ? 'border-black bg-black'
                              : 'border-gray-200 bg-white'
                          }`}>
                            {step.done ? (
                              step.isConteste ? (
                                <span className="text-red-500 text-xs font-bold">!</span>
                              ) : (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                            )}
                          </div>
                          {i < arr.length - 1 ? (
                            <div className={`w-0.5 h-10 mt-1 ${step.done ? 'bg-black' : 'bg-gray-200'}`} />
                          ) : null}
                        </div>

                        {/* Contenu */}
                        <div className="pb-10 flex-1">
                          <p className={`text-sm font-medium ${
                            step.isConteste ? 'text-red-600' : step.done ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 font-light mt-0.5">{step.desc}</p>
                          {step.date ? (
                            <p className="text-xs text-gray-300 font-light mt-1">
                              {new Date(step.date).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avis */}
                {selected.avis && selected.avis.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-medium text-gray-900 text-sm mb-4">Votre avis</h3>
                    {selected.avis.map((a, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }, (_, idx) => (
                            <span key={idx} className={`text-lg ${idx < a.note ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-500 font-medium ml-2">{a.note}/5</span>
                        </div>
                        {a.commentaire ? (
                          <p className="text-sm text-gray-600 font-light">{a.commentaire}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Actions rapides */}
                <div className="flex gap-2 flex-wrap">
                  <Link to="/client/missions"
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:border-black transition-all">
                    Voir toutes les missions
                  </Link>
                  {['en_attente', 'en_cours'].includes(selected.statut) ? (
                    <Link to="/client/messages"
                      className="px-4 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                      Contacter le prestataire
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

export default SuiviMissions