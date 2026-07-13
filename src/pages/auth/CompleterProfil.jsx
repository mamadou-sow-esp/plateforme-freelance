import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { reverseGeocode } from '../../lib/geocoding'
import logo from '../../assets/logo.png'

const CompleterProfil = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const role = profile?.role

  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationSaved, setLocationSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    localisation: '',
    metier: '',
    competences: '',
    prix_min: '',
  })

  const goToDashboard = () => {
    if (role === 'prestataire') navigate('/prestataire/dashboard', { replace: true })
    else if (role === 'admin') navigate('/admin/dashboard', { replace: true })
    else navigate('/client/dashboard', { replace: true })
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
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
    } catch (err) {
      setError("Erreur lors de l'upload de la photo.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDetecterPosition = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur')
      return
    }
    setError('')
    setDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const { error: geoError } = await supabase.from('profiles')
            .update({ latitude, longitude }).eq('id', profile?.id)
          if (geoError) throw geoError
          setLocationSaved(true)

          // Remplit automatiquement la localisation texte avec l'adresse détectée
          const adresse = await reverseGeocode(latitude, longitude)
          if (adresse) {
            setForm(prev => ({ ...prev, localisation: adresse }))
          }
        } catch (err) {
          setError('Erreur lors de la sauvegarde de la position')
        } finally {
          setDetectingLocation(false)
        }
      },
      (err) => {
        setDetectingLocation(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permission refusée. Activez la localisation dans les paramètres.')
        } else {
          setError('Impossible de détecter votre position.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleFinish = async () => {
    setSaving(true)
    setError('')
    try {
      if (form.localisation) {
        const { error: profileError } = await supabase.from('profiles')
          .update({ localisation: form.localisation }).eq('id', profile?.id)
        if (profileError) throw profileError
      }
      if (role === 'prestataire') {
        const competencesArray = form.competences.split(',').map(c => c.trim()).filter(c => c !== '')
        const { error: prestError } = await supabase.from('prestataires').update({
          metier: form.metier,
          competences: competencesArray,
          prix_min: parseFloat(form.prix_min) || 0,
        }).eq('id', profile?.id)
        if (prestError) throw prestError
      }
      goToDashboard()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Vous pouvez réessayer ou passer cette étape.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Alicia" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Complétez votre profil</h1>
          <p className="text-gray-400 text-sm mt-1">
            Quelques infos en plus pour bien démarrer — tout reste modifiable plus tard dans votre profil
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">{profile?.nom?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span className="text-xs font-semibold text-gray-500">
                  {uploadingAvatar ? 'Upload...' : avatarUrl ? 'Changer la photo' : 'Choisir une photo'}
                </span>
                <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Localisation
            </label>
            <button type="button" onClick={handleDetecterPosition} disabled={detectingLocation}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-xl transition-all disabled:opacity-40 mb-3 ${
                locationSaved ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-gray-900'
              }`}>
              {detectingLocation ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <svg className={`w-4 h-4 ${locationSaved ? 'text-emerald-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <span className={`text-sm font-semibold ${locationSaved ? 'text-emerald-700' : 'text-gray-600'}`}>
                {detectingLocation ? 'Détection en cours...' : locationSaved ? 'Position détectée ✓' : 'Détecter ma position GPS'}
              </span>
            </button>
            <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
              placeholder="Ville / quartier (ex : Dakar, Plateau)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
          </div>

          {/* Prestataire seulement */}
          {role === 'prestataire' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-4">Votre activité</p>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Métier / catégorie</label>
                <input type="text" name="metier" value={form.metier} onChange={handleChange}
                  placeholder="Développeur Web"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Compétences (séparées par des virgules)</label>
                <input type="text" name="competences" value={form.competences} onChange={handleChange}
                  placeholder="React, Node.js, Supabase"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Prix minimum (FCFA)</label>
                <input type="number" name="prix_min" value={form.prix_min} onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={goToDashboard}
              className="flex-1 py-3.5 border border-gray-200 text-gray-500 font-semibold text-sm rounded-xl hover:border-gray-400 transition-all">
              Passer cette étape
            </button>
            <button type="button" onClick={handleFinish} disabled={saving}
              className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : 'Terminer'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Alicia — Plateforme freelance du Sénégal
        </p>
      </div>
    </div>
  )
}

export default CompleterProfil
