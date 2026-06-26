import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const MesMissions = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')
  const [avisModal, setAvisModal] = useState(null)
  const [avisForm, setAvisForm] = useState({ note: 5, commentaire: '' })
  const [savingAvis, setSavingAvis] = useState(false)
  const [avisDejaLaisses, setAvisDejaLaisses] = useState([])

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchMissions()
    fetchAvisDejaLaisses()
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

  const fetchAvisDejaLaisses = async () => {
    const { data } = await supabase
      .from('avis')
      .select('mission_id')
      .eq('auteur_id', profile?.id)

    setAvisDejaLaisses((data || []).map(a => a.mission_id))
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

  const handleLaisserAvis = async () => {
    if (!avisModal) return
    setSavingAvis(true)

    await supabase.from('avis').insert({
      mission_id: avisModal.id,
      auteur_id: profile?.id,
      prestataire_id: avisModal.prestataire_id,
      note: avisForm.note,
      commentaire: avisForm.commentaire,
    })

    const { data: tousAvis } = await supabase
      .from('avis')
      .select('note')
      .eq('prestataire_id', avisModal.prestataire_id)

    if (tousAvis) {
      const moyenne = tousAvis.reduce((acc, a) => acc + a.note, 0) / tousAvis.length
      await supabase
        .from('prestataires')
        .update({
          note_moyenne: Math.round(moyenne * 10) / 10,
          nb_missions: tousAvis.length
        })
        .eq('id', avisModal.prestataire_id)
    }

    setAvisModal(null)
    setAvisForm({ note: 5, commentaire: '' })
    setSavingAvis(false)
    fetchMissions()
    fetchAvisDejaLaisses()
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

      {/* Modal avis */}
      {avisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" style={font}>
            <h3 className="font-semibold text-gray-900 text-base mb-1">Laisser un avis</h3>
            <p className="text-xs text-gray-400 font-light mb-5">
              Evaluez votre experience avec {avisModal.prestataire?.nom}
            </p>

            {/* Etoiles */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setAvisForm({ ...avisForm, note: star })}
                    className={`text-3xl transition-all ${
                      star <= avisForm.note ? 'text-yellow-400' : 'text-gray-200'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-light mt-1">{avisForm.note}/5</p>
            </div>

            {/* Commentaire */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Commentaire (optionnel)
              </p>
              <textarea
                value={avisForm.commentaire}
                onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                rows={4}
                placeholder="Decrivez votre experience avec ce prestataire..."
                style={font}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAvisModal(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleLaisserAvis}
                disabled={savingAvis}
                className="flex-1 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all disabled:opacity-40"
              >
                {savingAvis ? 'Envoi...' : 'Publier l\'avis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Navbar />
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
                      {mission.statut === 'en_attente' && mission.prestataire_id ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-orange-50 text-orange-700 border border-orange-200 flex-shrink-0">
                          Candidature recue
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400 font-light line-clamp-2">{mission.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 font-light mb-3 flex-wrap">
                  <span>{mission.categorie?.nom}</span>
                  <span>•</span>
                  <span className="font-medium text-gray-700">{mission.budget?.toLocaleString()} FCFA</span>
                  {mission.localisation ? <><span>•</span><span>{mission.localisation}</span></> : null}
                  {mission.delai ? <><span>•</span><span>{mission.delai}</span></> : null}
                </div>

                {mission.prestataire ? (
                  <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{mission.prestataire.nom}</p>
                      <p className="text-xs text-gray-400 font-light">{mission.prestataire.localisation}</p>
                    </div>
                    {mission.statut === 'en_attente' ? (
                      <span className="text-xs text-orange-600 font-light">En attente de votre decision</span>
                    ) : null}
                    <Link
                      to={'/client/prestataire/' + mission.prestataire.id}
                      className="text-xs text-black font-medium hover:underline underline-offset-2 whitespace-nowrap">
                      Voir profil
                    </Link>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {mission.statut === 'en_attente' && mission.prestataire_id ? (
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
                  ) : null}

                  {mission.statut === 'en_attente' && !mission.prestataire_id ? (
                    <button onClick={() => handleAnnuler(mission.id)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:border-red-300 hover:text-red-500 transition-all">
                      Annuler la mission
                    </button>
                  ) : null}

                  {mission.statut === 'livre' ? (
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
                  ) : null}

                  {mission.statut === 'valide' && mission.prestataire_id && !avisDejaLaisses.includes(mission.id) ? (
                    <button
                      onClick={() => setAvisModal(mission)}
                      className="px-3 py-1.5 border border-yellow-300 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-50 transition-all"
                    >
                      Laisser un avis
                    </button>
                  ) : null}

                  {mission.statut === 'valide' && avisDejaLaisses.includes(mission.id) ? (
                    <span className="text-xs text-gray-400 font-light py-1.5">
                      Avis publie
                    </span>
                  ) : null}
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