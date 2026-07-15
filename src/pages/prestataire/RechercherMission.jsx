import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import BackButton from '../../components/ui/BackButton'

const RechercherMission = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [missionsAssignees, setMissionsAssignees] = useState([])
  const [missionsCandidatures, setMissionsCandidatures] = useState([])
  const [missionsNegociation, setMissionsNegociation] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState('')
  const [filtres, setFiltres] = useState({ categorie_id: '', localisation: '', budget_min: '' })
  const [modalNego, setModalNego] = useState(null)
  const [nouveauPrix, setNouveauPrix] = useState('')

  useEffect(() => { fetchCategories(); fetchMissions() }, [])
  useEffect(() => { fetchMissions() }, [filtres, search])

  const showNotif = (msg, type = 'success') => {
    setNotification(type + ':' + msg)
    setTimeout(() => setNotification(''), 4000)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchMissions = async () => {
    setLoading(true)

    // Missions publiques disponibles
    let query = supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, localisation, avatar_url)')
      .eq('statut', 'en_attente')
      .is('prestataire_id', null)
      .order('created_at', { ascending: false })
    if (filtres.categorie_id) query = query.eq('categorie_id', filtres.categorie_id)
    if (filtres.budget_min) query = query.gte('budget', filtres.budget_min)
    const { data } = await query
    let result = data || []
    if (search) result = result.filter(m =>
      m.titre?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
    )
    if (filtres.localisation) result = result.filter(m =>
      m.localisation?.toLowerCase().includes(filtres.localisation.toLowerCase())
    )
    setMissions(result)

    // Missions assignées directement — prestataire doit accepter/refuser/négocier
    const { data: assignees } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, localisation, avatar_url)')
      .eq('prestataire_id', profile?.id)
      .eq('statut', 'en_attente')
      .eq('assigne_directement', true)
      .order('created_at', { ascending: false })
    setMissionsAssignees(assignees || [])

    // Candidatures en attente d'acceptation client
    const { data: candidatures } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, localisation, avatar_url)')
      .eq('prestataire_id', profile?.id)
      .eq('statut', 'en_attente')
      .eq('assigne_directement', false)
      .order('created_at', { ascending: false })
    setMissionsCandidatures(candidatures || [])

    // Missions en négociation — le client doit valider le nouveau prix proposé
    const { data: nego } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, localisation, avatar_url)')
      .eq('prestataire_id', profile?.id)
      .eq('statut', 'en_negociation')
      .eq('negociation_par', profile?.id)
      .order('created_at', { ascending: false })
    setMissionsNegociation(nego || [])

    setLoading(false)
  }

  const handlePostuler = async (missionId) => {
    const { error } = await supabase.from('missions').update({
      prestataire_id: profile?.id,
      statut: 'en_attente',
      assigne_directement: false,
    }).eq('id', missionId)
    if (error) { showNotif(error.message, 'error'); return }
    showNotif('Candidature envoyée ! En attente de la décision du client.')
    fetchMissions()
  }

  const handleAccepterMission = async (missionId) => {
    await supabase.from('missions').update({ statut: 'en_cours' }).eq('id', missionId)
    showNotif('Mission acceptée ! Elle est maintenant en cours.')
    fetchMissions()
  }

  const handleRefuserMission = async (missionId) => {
    await supabase.from('missions').update({
      statut: 'en_attente', prestataire_id: null, assigne_directement: false,
      budget_propose: null, negociation_par: null,
    }).eq('id', missionId)
    fetchMissions()
  }

  const handleAnnulerCandidature = async (missionId) => {
    await supabase.from('missions').update({ prestataire_id: null, assigne_directement: false }).eq('id', missionId)
    showNotif('Candidature annulée.')
    fetchMissions()
  }

  const handleProposerPrix = async () => {
    if (!nouveauPrix || isNaN(parseFloat(nouveauPrix))) {
      showNotif('Entrez un prix valide', 'error')
      return
    }
    const { error } = await supabase.from('missions').update({
      statut: 'en_negociation',
      budget_propose: parseFloat(nouveauPrix),
      negociation_par: profile?.id,
    }).eq('id', modalNego.id)
    if (error) { showNotif(error.message, 'error'); return }
    showNotif('Votre contre-proposition a été envoyée au client.')
    setModalNego(null)
    setNouveauPrix('')
    fetchMissions()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:right-6 md:top-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-modal border max-w-sm ${
          notification.startsWith('error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${notification.startsWith('error') ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium flex-1">
            {notification.startsWith('error') ? notification.replace('error:', '') : notification.replace('success:', '')}
          </p>
          <button onClick={() => setNotification('')} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
        </div>
      )}

      {/* Modal négociation */}
      {modalNego && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Proposer un nouveau prix</h3>
            <p className="text-xs text-gray-400 mb-6">
              Le client a proposé <span className="font-bold text-gray-900">{modalNego.budget?.toLocaleString()} FCFA</span> pour "{modalNego.titre}".
              Proposez le montant qui vous convient — le client devra l'accepter.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Votre prix proposé (FCFA)
              </label>
              <input
                type="number"
                value={nouveauPrix}
                onChange={(e) => setNouveauPrix(e.target.value)}
                placeholder={modalNego.budget?.toString()}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white"
              />
              {nouveauPrix && !isNaN(parseFloat(nouveauPrix)) && (
                <p className={`text-xs mt-2 font-medium ${
                  parseFloat(nouveauPrix) > modalNego.budget ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {parseFloat(nouveauPrix) > modalNego.budget
                    ? `+${(parseFloat(nouveauPrix) - modalNego.budget).toLocaleString()} FCFA par rapport au prix initial`
                    : `-${(modalNego.budget - parseFloat(nouveauPrix)).toLocaleString()} FCFA par rapport au prix initial`
                  }
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                Le client recevra votre proposition et pourra l'accepter ou la refuser.
                Si acceptée, la mission démarrera automatiquement avec votre prix.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setModalNego(null); setNouveauPrix('') }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                Annuler
              </button>
              <button onClick={handleProposerPrix}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all">
                Envoyer la proposition
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Missions disponibles</h1>
          <p className="text-gray-400 text-sm mt-1">
            {missions.length} mission{missions.length > 1 ? 's' : ''} disponible{missions.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Missions assignées directement */}
        {missionsAssignees.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              Missions qui m'ont été assignées
              <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {missionsAssignees.length}
              </span>
            </h2>
            <div className="space-y-3">
              {missionsAssignees.map(mission => (
                <div key={mission.id} className="bg-white rounded-2xl border border-amber-200 shadow-card p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{mission.titre}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{mission.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-gray-900">{mission.budget?.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-400">Prix proposé</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
                    {mission.categorie?.nom && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl font-semibold">{mission.categorie.nom}</span>
                    )}
                    {mission.localisation && <span className="text-gray-400">{mission.localisation}</span>}
                    {mission.delai && <><span className="text-gray-300">·</span><span className="text-gray-400">{mission.delai}</span></>}
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar url={mission.client?.avatar_url} nom={mission.client?.nom} size="xs" />
                      <span className="text-xs text-gray-400 font-medium">{mission.client?.nom}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleRefuserMission(mission.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                        Refuser
                      </button>
                      <button
                        onClick={() => { setModalNego(mission); setNouveauPrix('') }}
                        className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-50 transition-all">
                        Négocier le prix
                      </button>
                      <button onClick={() => handleAccepterMission(mission.id)}
                        className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                        Accepter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Négociations en cours — en attente de réponse du client */}
        {missionsNegociation.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              Négociations en cours
              <span className="w-5 h-5 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {missionsNegociation.length}
              </span>
            </h2>
            <div className="space-y-3">
              {missionsNegociation.map(mission => (
                <div key={mission.id} className="bg-white rounded-2xl border border-violet-200 shadow-card p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{mission.titre}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{mission.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 line-through">{mission.budget?.toLocaleString()} FCFA</p>
                      <p className="text-base font-bold text-violet-700">{mission.budget_propose?.toLocaleString()} FCFA</p>
                      <p className="text-xs text-violet-500">Votre proposition</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar url={mission.client?.avatar_url} nom={mission.client?.nom} size="xs" />
                      <div>
                        <span className="text-xs text-gray-400 font-medium">{mission.client?.nom}</span>
                        <p className="text-xs text-violet-600 font-medium">En attente de la décision du client</p>
                      </div>
                    </div>
                    <button onClick={() => handleRefuserMission(mission.id)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                      Annuler la proposition
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidatures en attente */}
        {missionsCandidatures.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              Mes candidatures en attente
              <span className="w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {missionsCandidatures.length}
              </span>
            </h2>
            <div className="space-y-3">
              {missionsCandidatures.map(mission => (
                <div key={mission.id} className="bg-white rounded-2xl border border-blue-200 shadow-card p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{mission.titre}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{mission.description}</p>
                    </div>
                    <span className="text-base font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                      {mission.budget?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar url={mission.client?.avatar_url} nom={mission.client?.nom} size="xs" />
                      <div>
                        <span className="text-xs text-gray-400 font-medium">{mission.client?.nom}</span>
                        <p className="text-xs text-blue-600 font-medium">En attente de la décision du client</p>
                      </div>
                    </div>
                    <button onClick={() => handleAnnulerCandidature(mission.id)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="relative mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une mission..."
            className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-card" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <select value={filtres.categorie_id} onChange={(e) => setFiltres({ ...filtres, categorie_id: e.target.value })}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-gray-900 transition-all shadow-card">
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <input type="text" value={filtres.localisation} onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
            placeholder="Localisation"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
          <input type="number" value={filtres.budget_min} onChange={(e) => setFiltres({ ...filtres, budget_min: e.target.value })}
            placeholder="Budget min (FCFA)"
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all shadow-card" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission disponible</p>
            <p className="text-gray-400 text-xs">Revenez plus tard ou élargissez vos critères</p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{mission.titre}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{mission.description}</p>
                  </div>
                  <span className="text-base font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                    {mission.budget?.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
                  {mission.categorie?.nom && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl font-semibold">{mission.categorie.nom}</span>
                  )}
                  {mission.localisation && <span className="text-gray-400">{mission.localisation}</span>}
                  {mission.delai && <><span className="text-gray-300">·</span><span className="text-gray-400">{mission.delai}</span></>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar url={mission.client?.avatar_url} nom={mission.client?.nom} size="xs" />
                    <span className="text-xs text-gray-400 font-medium truncate max-w-28">{mission.client?.nom}</span>
                  </div>
                  <button onClick={() => handlePostuler(mission.id)}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all flex-shrink-0">
                    Postuler
                  </button>
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

export default RechercherMission