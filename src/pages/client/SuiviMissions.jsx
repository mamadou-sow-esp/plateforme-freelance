import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import StarRating from '../../components/ui/StarRating'

const SuiviMissions = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filtre, setFiltre] = useState('tous')
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => { fetchMissions() }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        prestataire:profiles!missions_prestataire_id_fkey(id, nom, localisation, avatar_url),
        avis(note, commentaire)
      `)
      .eq('client_id', profile?.id)
      .order('created_at', { ascending: false })

    setMissions(data || [])
    if (data && data.length > 0) setSelected(data[0])
    setLoading(false)
  }

  const getTimeline = (mission) => {
    if (mission.statut === 'annule') {
      return [
        { key: 'creation', label: 'Mission creee', desc: 'Votre mission a ete publiee', done: true, date: mission.created_at },
        { key: 'annule', label: 'Mission annulee', desc: 'Cette mission a ete annulee', done: true, isError: true },
      ]
    }
    return [
      { key: 'creation', label: 'Mission creee', desc: 'Votre mission a ete publiee', done: true, date: mission.created_at },
      {
        key: 'candidature', label: 'Candidature recue',
        desc: mission.prestataire ? mission.prestataire.nom + ' a postule' : 'En attente d une candidature',
        done: !!mission.prestataire_id,
      },
      {
        key: 'acceptation', label: 'Prestataire accepte',
        desc: mission.prestataire ? 'Vous avez accepte ' + mission.prestataire.nom : 'En attente de votre decision',
        done: ['en_cours', 'livre', 'valide', 'conteste'].includes(mission.statut),
      },
      {
        key: 'livraison', label: 'Mission livree',
        desc: 'Le prestataire a marque la mission comme terminee',
        done: ['livre', 'valide', 'conteste'].includes(mission.statut),
      },
      {
        key: 'validation',
        label: mission.statut === 'conteste' ? 'Mission contestee' : 'Mission validee',
        desc: mission.statut === 'valide' ? 'Vous avez valide la livraison'
          : mission.statut === 'conteste' ? 'Vous avez conteste la livraison'
          : 'En attente de votre validation',
        done: ['valide', 'conteste'].includes(mission.statut),
        isError: mission.statut === 'conteste',
      },
    ]
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

  const handleSelectMission = (mission) => {
    setSelected(mission)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Suivi des missions</h1>
          <p className="text-gray-400 text-sm mt-1">Suivez l avancement de toutes vos missions en detail</p>
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
            <p className="text-gray-900 font-semibold text-sm mb-2">Aucune mission pour l instant</p>
            <Link to="/client/creer-mission" className="text-xs text-gray-400 hover:text-gray-900 underline">
              Creer une mission
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">

            {/* Liste missions — cachée sur mobile si detail ouvert */}
            <div className={`${showDetail ? 'hidden md:block' : 'block'} w-full md:w-72 flex-shrink-0 space-y-2`}>
              {missionsFiltrees.map(mission => (
                <button key={mission.id} onClick={() => handleSelectMission(mission)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    selected?.id === mission.id && showDetail
                      ? 'border-gray-900 bg-gray-900'
                      : 'border-gray-100 bg-white hover:border-gray-300 shadow-card'
                  }`}>
                  <p className={`text-sm font-semibold truncate mb-1.5 ${
                    selected?.id === mission.id && showDetail ? 'text-white' : 'text-gray-900'
                  }`}>
                    {mission.titre}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${selected?.id === mission.id && showDetail ? 'text-gray-400' : 'text-gray-400'}`}>
                      {mission.budget?.toLocaleString()} FCFA
                    </span>
                    <StatusBadge statut={mission.statut} />
                  </div>
                </button>
              ))}
            </div>

            {/* Detail mission */}
            {selected && (showDetail || window.innerWidth >= 768) && (
              <div className={`${showDetail ? 'block' : 'hidden md:block'} flex-1 space-y-4`}>

                {/* Bouton retour mobile */}
                <button onClick={() => setShowDetail(false)}
                  className="md:hidden flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 font-medium mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour aux missions
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1">{selected.titre}</h2>
                      <p className="text-xs text-gray-400">
                        Creee le {new Date(selected.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <StatusBadge statut={selected.statut} />
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Budget', value: selected.budget?.toLocaleString() + ' FCFA' },
                      { label: 'Categorie', value: selected.categorie?.nom || '—' },
                      { label: 'Localisation', value: selected.localisation || '—' },
                      { label: 'Delai', value: selected.delai || '—' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.prestataire && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Prestataire</h3>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar url={selected.prestataire.avatar_url} nom={selected.prestataire.nom} size="md" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selected.prestataire.nom}</p>
                          <p className="text-xs text-gray-400">{selected.prestataire.localisation}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Link to={'/client/prestataire/' + selected.prestataire.id}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all">
                          Voir profil
                        </Link>
                        <Link to="/client/messages"
                          className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                          Message
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-6">Timeline</h3>
                  <div className="space-y-0">
                    {getTimeline(selected).map((step, i, arr) => (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            step.isError ? 'border-red-400 bg-red-50'
                            : step.done ? 'border-gray-900 bg-gray-900'
                            : 'border-gray-200 bg-white'
                          }`}>
                            {step.done ? (
                              step.isError ? (
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
                          {i < arr.length - 1 && (
                            <div className={`w-0.5 h-10 mt-1 ${step.done ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-10 flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${step.isError ? 'text-red-600' : step.done ? 'text-gray-900' : 'text-gray-300'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.avis && selected.avis.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Votre avis</h3>
                    {selected.avis.map((a, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating note={a.note} size="sm" />
                          <span className="text-xs text-gray-500 font-semibold">{a.note}/5</span>
                        </div>
                        {a.commentaire && <p className="text-sm text-gray-600">{a.commentaire}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap pb-4">
                  <Link to="/client/missions"
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all">
                    Voir toutes les missions
                  </Link>
                  {['en_attente', 'en_cours'].includes(selected.statut) && (
                    <Link to="/client/messages"
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                      Contacter le prestataire
                    </Link>
                  )}
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

export default SuiviMissions