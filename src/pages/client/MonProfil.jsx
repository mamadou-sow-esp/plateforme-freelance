import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 left-4 md:left-auto md:right-6 md:top-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-modal border max-w-sm ${
      type === 'location' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        type === 'location' ? 'bg-emerald-500 animate-pulse'
        : type === 'error' ? 'bg-red-500'
        : 'bg-emerald-500'
      }`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold flex-shrink-0 text-lg leading-none">×</button>
    </div>
  )
}

const MonProfilClient = () => {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [locationSaved, setLocationSaved] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [form, setForm] = useState({
    nom: '', telephone: '', localisation: '', bio: ''
  })

  useEffect(() => { if (profile?.id) fetchProfileData() }, [profile?.id])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000)
  }

  const fetchProfileData = async () => {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', profile?.id).single()
    if (data) {
      setAvatarUrl(data.avatar_url)
      setLocationSaved(!!(data.latitude && data.longitude))
      setForm({
        nom: data.nom || '',
        telephone: data.telephone || '',
        localisation: data.localisation || '',
        bio: data.bio || '',
      })
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update({
        nom: form.nom,
        telephone: form.telephone,
        localisation: form.localisation,
        bio: form.bio,
      }).eq('id', profile?.id)
      if (error) throw error
      await fetchProfileData()
      showToast('Profil sauvegardé avec succès ✓', 'success')
    } catch (err) {
      showToast(err.message || 'Une erreur est survenue', 'error')
    } finally {
      setLoading(false)
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
          setDetectingLocation(false)
          showToast(`📍 Localisation mise à jour ! Précision : ${Math.round(accuracy)} m`, 'location')
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
      showToast("Erreur lors de l'upload de la photo.", 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Mon profil</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos informations personnelles</p>
        </div>

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
                      {form.nom?.charAt(0).toUpperCase() || profile?.nom?.charAt(0).toUpperCase()}
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
                <p className="text-sm font-bold text-gray-900">{form.nom || profile?.nom}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
                <p className="text-xs text-gray-400 mt-2">Cliquez sur l'icône pour changer votre photo</p>
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={profile?.email || ''} disabled
                  className="w-full px-4 py-3.5 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Téléphone</label>
                <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                  placeholder="+221 77 000 00 00"
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
              Permet de calculer la distance réelle avec les prestataires autour de vous
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
                    <p className="text-xs text-emerald-600 mt-0.5">Mettez à jour si vous avez changé de lieu</p>
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

          {/* Accès rapide */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Accès rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/client/missions"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                <p className="text-xs text-gray-400 mb-1">Mes missions</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-black">Voir tout</p>
              </Link>
              <Link to="/client/messages"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                <p className="text-xs text-gray-400 mb-1">Messages</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-black">Voir tout</p>
              </Link>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sauvegarde...
              </span>
            ) : 'Sauvegarder les modifications'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MonProfilClient