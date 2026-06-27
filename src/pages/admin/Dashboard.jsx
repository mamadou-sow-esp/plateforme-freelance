import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ users: 0, prestataires: 0, clients: 0, missions: 0, missions_en_cours: 0, missions_validees: 0 })
  const [users, setUsers] = useState([])
  const [missions, setMissions] = useState([])
  const [partenaires, setPartenaires] = useState([])
  const [prestatairesNonVerifies, setPrestatairesNonVerifies] = useState([])
  const [onglet, setOnglet] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [partenaireForm, setPartenaireForm] = useState({ nom: '', site_url: '', logo_url: '', actif: true, ordre: 0 })
  const [showPartenaireForm, setShowPartenaireForm] = useState(false)
  const [savingPartenaire, setSavingPartenaire] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [cniModal, setCniModal] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)

    const { data: usersData } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })

    const { data: missionsData } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom), prestataire:profiles!missions_prestataire_id_fkey(nom)')
      .order('created_at', { ascending: false })

    const { data: partenairesData } = await supabase
      .from('partenaires').select('*').order('ordre', { ascending: true })

    const { data: cniData } = await supabase
      .from('prestataires')
      .select('*, profile:profiles(nom, email, avatar_url)')
      .not('cni_url', 'is', null)
      .order('created_at', { ascending: false })

    const u = usersData || []
    const m = missionsData || []

    setUsers(u)
    setMissions(m)
    setPartenaires(partenairesData || [])
    setPrestatairesNonVerifies(cniData || [])
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

  const handleValiderCNI = async (prestataireId) => {
  const { error } = await supabase
    .from('prestataires')
    .update({ verifie_cni: true })
    .eq('id', prestataireId)

  if (error) {
    alert('Erreur : ' + error.message)
    return
  }

  setCniModal(null)
  fetchData()
}

const handleRefuserCNI = async (prestataireId) => {
  const { error } = await supabase
    .from('prestataires')
    .update({ verifie_cni: false, cni_url: null })
    .eq('id', prestataireId)

  if (error) {
    alert('Erreur : ' + error.message)
    return
  }

  setCniModal(null)
  fetchData()
}

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'logo_' + Date.now() + '.' + ext
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setPartenaireForm({ ...partenaireForm, logo_url: urlData.publicUrl })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAjouterPartenaire = async () => {
    if (!partenaireForm.nom) return
    setSavingPartenaire(true)
    await supabase.from('partenaires').insert({
      nom: partenaireForm.nom,
      site_url: partenaireForm.site_url || null,
      logo_url: partenaireForm.logo_url || null,
      actif: partenaireForm.actif,
      ordre: parseInt(partenaireForm.ordre) || 0,
    })
    setPartenaireForm({ nom: '', site_url: '', logo_url: '', actif: true, ordre: 0 })
    setShowPartenaireForm(false)
    setSavingPartenaire(false)
    fetchData()
  }

  const handleTogglePartenaire = async (id, actif) => {
    await supabase.from('partenaires').update({ actif: !actif }).eq('id', id)
    fetchData()
  }

  const handleSupprimerPartenaire = async (id) => {
    if (!confirm('Supprimer ce partenaire ?')) return
    await supabase.from('partenaires').delete().eq('id', id)
    fetchData()
  }

  const cniEnAttente = prestatairesNonVerifies.filter(p => !p.verifie_cni)
  const cniVerifies = prestatairesNonVerifies.filter(p => p.verifie_cni)

  const onglets = [
    { key: 'overview', label: 'Vue globale' },
    { key: 'cni', label: 'Verification CNI', badge: cniEnAttente.length },
    { key: 'users', label: 'Utilisateurs' },
    { key: 'missions', label: 'Missions' },
    { key: 'partenaires', label: 'Partenaires' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Modal CNI */}
      {cniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-modal">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Verification CNI</h3>
                <p className="text-xs text-gray-400 mt-0.5">{cniModal.profile?.nom} — {cniModal.profile?.email}</p>
              </div>
              <button onClick={() => setCniModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-5">
              <Avatar url={cniModal.profile?.avatar_url} nom={cniModal.profile?.nom} size="md" />
              <div>
                <p className="text-sm font-bold text-gray-900">{cniModal.profile?.nom}</p>
                <p className="text-xs text-gray-400">{cniModal.metier}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {cniModal.competences?.map((c, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-lg font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Document CNI</p>
              {cniModal.cni_url ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {cniModal.cni_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img src={cniModal.cni_url} alt="CNI" className="w-full max-h-96 object-contain bg-gray-50" />
                  ) : (
                    <div className="p-6 text-center bg-gray-50">
                      <p className="text-sm text-gray-500 mb-3">Document PDF</p>
                      <a href={cniModal.cni_url} target="_blank" rel="noreferrer"
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                        Ouvrir le document
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-400">Aucun document disponible</p>
                </div>
              )}
            </div>

            {cniModal.verifie_cni ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-5">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-emerald-800">Ce prestataire est deja verifie</p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button onClick={() => handleRefuserCNI(cniModal.id)}
                className="flex-1 py-3 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
                Refuser et supprimer
              </button>
              <button onClick={() => handleValiderCNI(cniModal.id)}
                className="flex-1 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                Valider la CNI
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administration</h1>
            <p className="text-gray-400 text-sm mt-1">Gestion de la plateforme Alicia</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                onglet === o.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 shadow-card'
              }`}>
              {o.label}
              {o.badge > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  onglet === o.key ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
                }`}>
                  {o.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Vue globale */}
            {onglet === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total utilisateurs', value: stats.users, color: 'text-gray-900' },
                    { label: 'Clients', value: stats.clients, color: 'text-blue-600' },
                    { label: 'Prestataires', value: stats.prestataires, color: 'text-violet-600' },
                    { label: 'Total missions', value: stats.missions, color: 'text-gray-900' },
                    { label: 'Missions en cours', value: stats.missions_en_cours, color: 'text-blue-600' },
                    { label: 'Missions validees', value: stats.missions_validees, color: 'text-emerald-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-400 font-medium mt-2 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {cniEnAttente.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          {cniEnAttente.length} CNI en attente de verification
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Des prestataires attendent la validation de leur identite
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setOnglet('cni')}
                      className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-all ml-4 whitespace-nowrap">
                      Verifier maintenant
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-sm">Derniers inscrits</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar url={u.avatar_url} nom={u.nom} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.nom}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          u.role === 'admin' ? 'bg-gray-900 text-white'
                          : u.role === 'prestataire' ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verification CNI */}
            {onglet === 'cni' && (
              <div className="space-y-6">

                {cniEnAttente.length > 0 && (
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                      En attente de verification
                      <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {cniEnAttente.length}
                      </span>
                    </h2>
                    <div className="space-y-3">
                      {cniEnAttente.map(p => (
                        <div key={p.id}
                          className="bg-white rounded-2xl border border-amber-200 shadow-card p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="md" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{p.profile?.nom}</p>
                              <p className="text-xs text-gray-400">{p.metier}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{p.profile?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold">
                              En attente
                            </span>
                            <button onClick={() => setCniModal(p)}
                              className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                              Examiner la CNI
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cniVerifies.length > 0 && (
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm mb-3">Prestataires verifies ({cniVerifies.length})</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                      <div className="divide-y divide-gray-50">
                        {cniVerifies.map(p => (
                          <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="sm" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{p.profile?.nom}</p>
                                <p className="text-xs text-gray-400">{p.metier} — {p.profile?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                                Verifie
                              </span>
                              <button onClick={() => setCniModal(p)}
                                className="text-xs text-gray-400 hover:text-gray-900 font-medium transition-colors">
                                Voir CNI
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {prestatairesNonVerifies.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">Aucune CNI a verifier</p>
                    <p className="text-gray-400 text-xs mt-1">Tous les prestataires ont ete traites</p>
                  </div>
                )}
              </div>
            )}

            {/* Utilisateurs */}
            {onglet === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-sm">Tous les utilisateurs ({users.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar url={u.avatar_url} nom={u.nom} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{u.nom}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <select value={u.role}
                          onChange={(e) => handleChangerRole(u.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-900 transition-all bg-white text-gray-600">
                          <option value="client">Client</option>
                          <option value="prestataire">Prestataire</option>
                          <option value="admin">Admin</option>
                        </select>
                        {u.id !== profile?.id && (
                          <button onClick={() => handleSupprimerUser(u.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
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
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-sm">Toutes les missions ({missions.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {missions.map(m => (
                    <div key={m.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{m.titre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {m.client?.nom} → {m.prestataire?.nom || 'Sans prestataire'} · {m.budget?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <StatusBadge statut={m.statut} />
                        <button onClick={() => handleSupprimerMission(m.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partenaires */}
            {onglet === 'partenaires' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''}</p>
                  <button onClick={() => setShowPartenaireForm(!showPartenaireForm)}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                    + Ajouter un partenaire
                  </button>
                </div>

                {showPartenaireForm && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                    <h3 className="font-bold text-gray-900 text-sm mb-5">Nouveau partenaire</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nom *</label>
                        <input type="text" value={partenaireForm.nom}
                          onChange={(e) => setPartenaireForm({ ...partenaireForm, nom: e.target.value })}
                          placeholder="Nom du partenaire"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Site web</label>
                        <input type="url" value={partenaireForm.site_url}
                          onChange={(e) => setPartenaireForm({ ...partenaireForm, site_url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Logo</label>
                        {partenaireForm.logo_url && (
                          <img src={partenaireForm.logo_url} alt="Logo" className="h-10 object-contain mb-2" />
                        )}
                        <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-xs text-gray-500 font-medium">
                            {uploadingLogo ? 'Upload...' : partenaireForm.logo_url ? 'Changer le logo' : 'Uploader le logo'}
                          </span>
                          <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" disabled={uploadingLogo} />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ordre</label>
                          <input type="number" value={partenaireForm.ordre}
                            onChange={(e) => setPartenaireForm({ ...partenaireForm, ordre: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all bg-gray-50 focus:bg-white" />
                        </div>
                        <div className="flex items-end pb-0.5">
                          <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Actif</span>
                            <button onClick={() => setPartenaireForm({ ...partenaireForm, actif: !partenaireForm.actif })}
                              className={`relative w-10 h-5 rounded-full transition-all ${partenaireForm.actif ? 'bg-gray-900' : 'bg-gray-300'}`}>
                              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${partenaireForm.actif ? 'left-5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowPartenaireForm(false)}
                          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                          Annuler
                        </button>
                        <button onClick={handleAjouterPartenaire} disabled={savingPartenaire}
                          className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all disabled:opacity-40">
                          {savingPartenaire ? 'Ajout...' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                  {partenaires.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-400 text-sm">Aucun partenaire pour l instant</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {partenaires.map(p => (
                        <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {p.logo_url ? (
                              <img src={p.logo_url} alt={p.nom} className="h-8 w-16 object-contain flex-shrink-0" />
                            ) : (
                              <div className="h-8 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-gray-400 font-medium">Logo</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.nom}</p>
                              {p.site_url && (
                                <a href={p.site_url} target="_blank" rel="noreferrer"
                                  className="text-xs text-gray-400 hover:text-gray-900 truncate block">
                                  {p.site_url}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs text-gray-400">Ordre: {p.ordre}</span>
                            <button onClick={() => handleTogglePartenaire(p.id, p.actif)}
                              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                                p.actif ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                              {p.actif ? 'Actif' : 'Inactif'}
                            </button>
                            <button onClick={() => handleSupprimerPartenaire(p.id)}
                              className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminDashboard