import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getSignedDocUrl } from '../../lib/documents'
import { reverseGeocode } from '../../lib/geocoding'
import { MOYENS_PAIEMENT } from '../../lib/moyensPaiement'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import VerifiedBadge from '../../components/ui/VerifiedBadge'
import BackButton from '../../components/ui/BackButton'

const DOC_MAX_SIZE = 10 * 1024 * 1024 // 10 Mo, doit rester cohérent avec la limite du bucket
const DOC_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const AVATAR_MAX_SIZE = 5 * 1024 * 1024 // 5 Mo
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 left-4 md:left-auto md:right-6 md:top-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-modal border max-w-sm ${
      type === 'location' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-white border-gray-200 text-gray-900'
    }`}>
      {type === 'location' ? (
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`} />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold flex-shrink-0 text-lg leading-none">×</button>
    </div>
  )
}

const MonProfilPrestataire = () => {
  const { profile } = useAuth()
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationSaved, setLocationSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [cniSignedUrl, setCniSignedUrl] = useState(null)
  const [cvSignedUrl, setCvSignedUrl] = useState(null)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [categories, setCategories] = useState([])

  const [form, setForm] = useState({
    nom: '', metier: '', competences: '', prix_min: '',
    disponible: true, localisation: '', bio: '',
    github_url: '', portfolio_url: '', linkedin_url: '',
    moyens_paiement: [], categorie_id: '',
  })

  useEffect(() => { if (profile?.id) fetchData() }, [profile?.id])
  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('nom')
    setCategories(data || [])
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', profile?.id).single()
    const { data: prestData } = await supabase
      .from('prestataires').select('*').eq('id', profile?.id).single()

    if (profileData) {
      setAvatarUrl(profileData.avatar_url)
      setLocationSaved(!!(profileData.latitude && profileData.longitude))
    }
    if (prestData) {
      setProfil(prestData)
      setForm({
        nom: profileData?.nom || '',
        metier: prestData.metier || '',
        competences: prestData.competences?.join(', ') || '',
        prix_min: prestData.prix_min || '',
        disponible: prestData.disponible ?? true,
        localisation: profileData?.localisation || '',
        bio: profileData?.bio || '',
        github_url: prestData.github_url || '',
        portfolio_url: prestData.portfolio_url || '',
        linkedin_url: prestData.linkedin_url || '',
        moyens_paiement: prestData.moyens_paiement || [],
        categorie_id: prestData.categorie_id || '',
      })
      // Le bucket "documents" est privé : on génère des URLs signées
      // temporaires pour afficher/ouvrir ses propres CNI et CV.
      setCniSignedUrl(prestData.cni_url ? await getSignedDocUrl(prestData.cni_url) : null)
      setCvSignedUrl(prestData.cv_url ? await getSignedDocUrl(prestData.cv_url) : null)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleToggleMoyenPaiement = (id) => {
    setForm((prev) => ({
      ...prev,
      moyens_paiement: prev.moyens_paiement.includes(id)
        ? prev.moyens_paiement.filter((m) => m !== id)
        : [...prev.moyens_paiement, id],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const competencesArray = form.competences.split(',').map(c => c.trim()).filter(c => c !== '')
      const { error: prestError } = await supabase.from('prestataires').update({
        metier: form.metier,
        competences: competencesArray,
        prix_min: parseFloat(form.prix_min) || 0,
        disponible: form.disponible,
        github_url: form.github_url || null,
        portfolio_url: form.portfolio_url || null,
        linkedin_url: form.linkedin_url || null,
        moyens_paiement: form.moyens_paiement,
        categorie_id: form.categorie_id || null,
      }).eq('id', profile?.id)
      if (prestError) throw prestError

      const { error: profileError } = await supabase.from('profiles').update({
        nom: form.nom,
        localisation: form.localisation,
        bio: form.bio,
      }).eq('id', profile?.id)
      if (profileError) throw profileError

      await fetchData()
      showToast('Profil sauvegardé avec succès ✓', 'success')
    } catch (err) {
      showToast(err.message || 'Une erreur est survenue', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDetecterPosition = () => {
    if (!navigator.geolocation) {
      showToast('Géolocalisation non supportée par votre navigateur', 'error')
      return
    }
    setDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        try {
          const { error } = await supabase.from('profiles')
            .update({ latitude, longitude }).eq('id', profile?.id)
          if (error) throw error
          setLocationSaved(true)

          // Remplit automatiquement la localisation texte avec l'adresse détectée
          const adresse = await reverseGeocode(latitude, longitude)
          if (adresse) {
            setForm(prev => ({ ...prev, localisation: adresse }))
            await supabase.from('profiles').update({ localisation: adresse }).eq('id', profile?.id)
          }

          setDetectingLocation(false)
          showToast(`Localisation mise à jour ! Précision : ${Math.round(accuracy)} m`, 'location')
        } catch (err) {
          showToast('Erreur lors de la sauvegarde de la position', 'error')
          setDetectingLocation(false)
        }
      },
      (err) => {
        setDetectingLocation(false)
        if (err.code === err.PERMISSION_DENIED) {
          showToast('Permission refusée. Activez la localisation dans les paramètres.', 'error')
        } else {
          showToast('Impossible de détecter votre position. Réessayez.', 'error')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSupprimerPosition = async () => {
    await supabase.from('profiles').update({ latitude: null, longitude: null }).eq('id', profile?.id)
    setLocationSaved(false)
    showToast('Position GPS supprimée', 'success')
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      showToast('Format non supporté. Utilisez une image JPG, PNG ou WebP.', 'error')
      return
    }
    if (file.size > AVATAR_MAX_SIZE) {
      showToast('Image trop lourde (5 Mo maximum).', 'error')
      return
    }
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = profile?.id + '/avatar.' + ext
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile?.id)
      setAvatarUrl(urlData.publicUrl)
      showToast('Photo de profil mise à jour ✓', 'success')
    } catch (err) {
      showToast("Erreur lors de l'upload de l'avatar.", 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUploadCNI = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (profil?.verifie_cni) {
      showToast('CNI déjà vérifiée, elle ne peut plus être remplacée.', 'error')
      return
    }
    if (!DOC_ALLOWED_TYPES.includes(file.type)) {
      showToast('Format non supporté. Utilisez une image (JPG/PNG/WebP) ou un PDF.', 'error')
      return
    }
    if (file.size > DOC_MAX_SIZE) {
      showToast('Fichier trop lourd (10 Mo maximum).', 'error')
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'cni_' + profile?.id + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('documents').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      // Le bucket "documents" est privé : on stocke le chemin (pas d'URL
      // publique), une URL signée est générée à chaque affichage.
      await supabase.from('prestataires')
        .update({ cni_url: fileName, verifie_cni: false }).eq('id', profile?.id)
      await fetchData()
      showToast('CNI uploadée — en attente de vérification', 'success')
    } catch (err) {
      showToast("Erreur lors de l'upload de la CNI.", 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!DOC_ALLOWED_TYPES.includes(file.type)) {
      showToast('Format non supporté. Utilisez une image (JPG/PNG/WebP) ou un PDF.', 'error')
      return
    }
    if (file.size > DOC_MAX_SIZE) {
      showToast('Fichier trop lourd (10 Mo maximum).', 'error')
      return
    }
    setUploadingCV(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'cv_' + profile?.id + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('documents').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      await supabase.from('prestataires').update({ cv_url: fileName }).eq('id', profile?.id)
      await fetchData()
      showToast('CV uploadé avec succès ✓', 'success')
    } catch (err) {
      showToast("Erreur lors de l'upload du CV.", 'error')
    } finally {
      setUploadingCV(false)
    }
  }

  const handleDeleteCV = async () => {
    if (!profil?.cv_url) return
    if (!confirm('Supprimer votre CV ?')) return
    setUploadingCV(true)
    try {
      await supabase.storage.from('documents').remove([profil.cv_url])
      await supabase.from('prestataires').update({ cv_url: null }).eq('id', profile?.id)
      await fetchData()
      showToast('CV supprimé', 'success')
    } catch (err) {
      showToast('Erreur lors de la suppression du CV.', 'error')
    } finally {
      setUploadingCV(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Mon profil</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos informations et vos services</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Photo de profil</h2>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {profile?.nom?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-card">
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" disabled={uploadingAvatar} />
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{profile?.nom}</p>
                    {profil?.verifie_cni && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
                  {profil?.verifie_cni ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <VerifiedBadge size="sm" />
                      <span className="text-xs text-blue-600 font-semibold">Identité vérifiée</span>
                    </div>
                  ) : profil?.cni_url ? (
                    <p className="text-xs text-amber-600 font-medium mt-2">CNI en attente de vérification</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Infos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Informations personnelles</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nom complet</label>
                  <input type="text" name="nom" value={form.nom} onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localisation (texte)</label>
                  <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
                    placeholder="Dakar, Plateau"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                    placeholder="Décrivez-vous en quelques mots..."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white resize-none" />
                </div>
              </div>
            </div>

            {/* Position GPS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Ma position GPS</h2>
              <p className="text-xs text-gray-400 mb-5">
                Permet aux clients de vous trouver via le filtre "Près de moi"
              </p>
              {locationSaved ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Position enregistrée ✓</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Les clients peuvent vous trouver par proximité</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button onClick={handleDetecterPosition} disabled={detectingLocation}
                      className="px-3 py-1.5 border border-emerald-300 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-40">
                      {detectingLocation ? (
                        <span className="flex items-center gap-1.5">
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-emerald-700 rounded-full animate-spin" />
                          Détection...
                        </span>
                      ) : 'Mettre à jour'}
                    </button>
                    <button onClick={handleSupprimerPosition}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-red-300 hover:text-red-500 transition-all">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={handleDetecterPosition} disabled={detectingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-900 transition-all disabled:opacity-40">
                  {detectingLocation ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <span className="text-sm font-semibold text-gray-600">
                    {detectingLocation ? 'Détection en cours...' : 'Détecter ma position'}
                  </span>
                </button>
              )}
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Mes services</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catégorie</label>
                  <select name="categorie_id" value={form.categorie_id} onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white">
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">Permet aux clients de vous trouver via le filtre par catégorie</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Métier</label>
                  <input type="text" name="metier" value={form.metier} onChange={handleChange}
                    placeholder="Ex : Électricien, Couturière, Développeur..."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Compétences (séparées par des virgules)
                  </label>
                  <input type="text" name="competences" value={form.competences} onChange={handleChange}
                    placeholder="Ex : Plomberie, Couture, Peinture"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prix minimum (FCFA)</label>
                  <input type="number" name="prix_min" value={form.prix_min} onChange={handleChange}
                    placeholder="5000"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Disponibilité</p>
                    <p className="text-xs text-gray-400 mt-0.5">Indiquez si vous acceptez de nouvelles missions</p>
                  </div>
                  <button onClick={() => setForm({ ...form, disponible: !form.disponible })}
                    className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${form.disponible ? 'bg-gray-900' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.disponible ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Moyens de paiement */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Moyens de paiement acceptés</h2>
              <p className="text-xs text-gray-400 mb-5">
                Indiquez comment vos clients peuvent vous payer (en dehors de l'application). Visible sur votre profil public.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {MOYENS_PAIEMENT.map((moyen) => {
                  const selected = form.moyens_paiement.includes(moyen.id)
                  return (
                    <button type="button" key={moyen.id} onClick={() => handleToggleMoyenPaiement(moyen.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                      }`}>
                      {moyen.logo ? (
                        <img src={moyen.logo} alt={moyen.label} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-xs font-semibold text-center ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {moyen.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Liens */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Liens professionnels</h2>
              <p className="text-xs text-gray-400 mb-5">Optionnel — renforcez la crédibilité de votre profil</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">GitHub</label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-gray-900 transition-all">
                    <span className="px-3 text-gray-400 text-xs font-medium border-r border-gray-200 py-3.5 whitespace-nowrap">github.com/</span>
                    <input type="text" name="github_url" value={form.github_url} onChange={handleChange}
                      placeholder="votre-username"
                      className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Portfolio</label>
                  <input type="url" name="portfolio_url" value={form.portfolio_url} onChange={handleChange}
                    placeholder="https://monportfolio.com"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">LinkedIn</label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-gray-900 transition-all">
                    <span className="px-3 text-gray-400 text-xs font-medium border-r border-gray-200 py-3.5 whitespace-nowrap">linkedin.com/in/</span>
                    <input type="text" name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                      placeholder="votre-profil"
                      className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Documents</h2>
              <p className="text-xs text-gray-400 mb-5">CNI pour vérification, CV pour votre profil</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CNI</label>
                    {profil?.verifie_cni ? (
                      <div className="flex items-center gap-1.5">
                        <VerifiedBadge size="sm" />
                        <span className="text-xs text-blue-600 font-semibold">Vérifiée</span>
                      </div>
                    ) : profil?.cni_url ? (
                      <span className="text-xs text-amber-600 font-semibold">En attente</span>
                    ) : null}
                  </div>
                  {profil?.cni_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
                      <p className="text-xs text-gray-600 flex-1">CNI uploadée</p>
                      {cniSignedUrl && (
                        <a href={cniSignedUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-gray-900 font-semibold hover:underline">Voir</a>
                      )}
                    </div>
                  )}
                  {profil?.verifie_cni ? (
                    <p className="text-xs text-gray-400 italic">
                      CNI vérifiée — contactez le support pour toute correction.
                    </p>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">
                        {uploading ? 'Upload...' : profil?.cni_url ? 'Remplacer la CNI' : 'Uploader la CNI'}
                      </span>
                      <input type="file" accept="image/*,.pdf" onChange={handleUploadCNI} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CV (optionnel)</label>
                  {profil?.cv_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
                      <p className="text-xs text-gray-600 flex-1">CV uploadé</p>
                      {cvSignedUrl && (
                        <a href={cvSignedUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-gray-900 font-semibold hover:underline">Voir</a>
                      )}
                      <button type="button" onClick={handleDeleteCV} disabled={uploadingCV}
                        className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-40">
                        Supprimer
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">
                      {uploadingCV ? 'Upload...' : profil?.cv_url ? 'Remplacer le CV' : 'Uploader le CV (PDF)'}
                    </span>
                    <input type="file" accept=".pdf" onChange={handleUploadCV} className="hidden" disabled={uploadingCV} />
                  </label>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sauvegarde...
                </span>
              ) : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MonProfilPrestataire