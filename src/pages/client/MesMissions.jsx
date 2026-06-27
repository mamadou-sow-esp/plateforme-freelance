import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'

const MesMissions = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')
  const [avisModal, setAvisModal] = useState(null)
  const [avisForm, setAvisForm] = useState({ note: 5, commentaire: '' })
  const [savingAvis, setSavingAvis] = useState(false)
  const [avisDejaLaisses, setAvisDejaLaisses] = useState([])

  useEffect(() => {
    fetchMissions()
    fetchAvisDejaLaisses()
  }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`*, categorie:categories(nom), prestataire:profiles!missions_prestataire_id_fkey(id, nom, localisation, avatar_url)`)
      .eq('client_id', profile?.id)
      .order('created_at', { ascending: false })
    setMissions(data || [])
    setLoading(false)
  }

  const fetchAvisDejaLaisses = async () => {
    const { data } = await supabase.from('avis').select('mission_id').eq('auteur_id', profile?.id)
    setAvisDejaLaisses((data || []).map(a => a.mission_id))
  }

  const handleAccepter = async (id) => {
    await supabase.from('missions').update({ statut: 'en_cours' }).eq('id', id)
    fetchMissions()
  }

  const handleRefuser = async (id) => {
    await supabase.from('missions').update({ statut: 'en_attente', prestataire_id: null }).eq('id', id)
    fetchMissions()
  }

  const handleValider = async (id) => {
    await supabase.from('missions').update({ statut: 'valide' }).eq('id', id)
    fetchMissions()
  }

  const handleContester = async (id) => {
    await supabase.from('missions').update({ statut: 'conteste' }).eq('id', id)
    fetchMissions()
  }

  const handleAnnuler = async (id) => {
    await supabase.from('missions').update({ statut: 'annule' }).eq('id', id)
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
    const { data: tousAvis } = await supabase.from('avis').select('note').eq('prestataire_id', avisModal.prestataire_id)
    if (tousAvis) {
      const moyenne = tousAvis.reduce((acc, a) => acc + a.note, 0) / tousAvis.length
      await supabase.from('prestataires').update({
        note_moyenne: Math.round(moyenne * 10) / 10,
        nb_missions: tousAvis.length
      }).eq('id', avisModal.prestataire_id)
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
    { key: 'livre', label: 'Livrées' },
    { key: 'valide', label: 'Validées' },
    { key: 'annule', label: 'Annulées' },
  ]

  const missionsFiltrees = filtre === 'tous' ? missions : missions.filter(m => m.statut === filtre)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {avisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Laisser un avis</h3>
            <p className="text-xs text-gray-400 mb-6">
              Évaluez votre expérience avec {avisModal.prestataire?.nom}
            </p>
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star}
                    onClick={() => setAvisForm({ ...avisForm, note: star })}
                    className={`text-3xl transition-all ${star <= avisForm.note ? 'text-amber-400' : 'text-gray-200'} hover:text-amber-400`}>
                    ★
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{avisForm.note}/5</p>
            </div>
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Commentaire (optionnel)
              </p>
              <textarea value={avisForm.commentaire}
                onChange={(e) => setAvisForm({ ...avisForm, commentaire: e.target.value })}
                rows={4} placeholder="Décrivez votre expérience..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAvisModal(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                Annuler
              </button>
              <button onClick={handleLaisserAvis} disabled={savingAvis}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all disabled:opacity-40">
                {savingAvis ? 'Envoi...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Mes missions</h1>
            <p className="text-gray-400 text-sm mt-1">
              {missions.length} mission{missions.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link to="/client/creer-mission"
            className="inline-flex px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all self-start sm:self-auto">
            + Nouvelle mission
          </Link>
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
        ) : missionsFiltrees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission</p>
            <p className="text-gray-400 text-xs">
              {filtre === 'tous' ? 'Créez votre première mission' : 'Aucune mission dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {missionsFiltrees.map((mission) => (
              <div key={mission.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all p-4 md:p-5">

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{mission.titre}</h3>
                      <StatusBadge statut={mission.statut} />
                      {mission.statut === 'en_attente' && mission.prestataire_id && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Candidature reçue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{mission.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 flex-wrap">
                  <span className="font-medium text-gray-600">{mission.categorie?.nom}</span>
                  <span>·</span>
                  <span className="font-bold text-gray-900">{mission.budget?.toLocaleString()} FCFA</span>
                  {mission.localisation && <><span>·</span><span>{mission.localisation}</span></>}
                  {mission.delai && <><span>·</span><span>{mission.delai}</span></>}
                </div>

                {mission.prestataire && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                    <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{mission.prestataire.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{mission.prestataire.localisation}</p>
                    </div>
                    {mission.statut === 'en_attente' && (
                      <span className="text-xs text-amber-600 font-medium hidden sm:block">En attente de décision</span>
                    )}
                    <Link to={'/client/prestataire/' + mission.prestataire.id}
                      className="text-xs text-gray-900 font-semibold hover:underline whitespace-nowrap flex-shrink-0">
                      Voir profil
                    </Link>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {mission.statut === 'en_attente' && mission.prestataire_id && (
                    <>
                      <button onClick={() => handleAccepter(mission.id)}
                        className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                        Accepter
                      </button>
                      <button onClick={() => handleRefuser(mission.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                        Refuser
                      </button>
                    </>
                  )}
                  {mission.statut === 'en_attente' && !mission.prestataire_id && (
                    <button onClick={() => handleAnnuler(mission.id)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                      Annuler
                    </button>
                  )}
                  {mission.statut === 'livre' && (
                    <>
                      <button onClick={() => handleValider(mission.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                        Valider la livraison
                      </button>
                      <button onClick={() => handleContester(mission.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition-all">
                        Contester
                      </button>
                    </>
                  )}
                  {mission.statut === 'valide' && mission.prestataire_id && !avisDejaLaisses.includes(mission.id) && (
                    <button onClick={() => setAvisModal(mission)}
                      className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-50 transition-all">
                      Laisser un avis
                    </button>
                  )}
                  {mission.statut === 'valide' && avisDejaLaisses.includes(mission.id) && (
                    <span className="text-xs text-gray-400 py-1.5">Avis publié</span>
                  )}
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

export default MesMissions