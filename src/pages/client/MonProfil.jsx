import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

const MonProfilClient = () => {
  const { profile, fetchProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nom: '', telephone: '', localisation: '', bio: '' })

  useEffect(() => {
    if (profile) {
      setForm({ nom: profile.nom || '', telephone: profile.telephone || '', localisation: profile.localisation || '', bio: profile.bio || '' })
    }
  }, [profile])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      const { error: profileError } = await supabase.from('profiles')
        .update({ nom: form.nom, telephone: form.telephone, localisation: form.localisation, bio: form.bio })
        .eq('id', profile?.id)
      if (profileError) throw profileError
      await fetchProfile(profile?.id)
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) { setError(err.message || 'Une erreur est survenue') }
    finally { setLoading(false) }
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploadingAvatar(true); setError('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = profile?.id + '/avatar.' + ext
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile?.id)
      await fetchProfile(profile?.id)
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    } catch (err) { setError("Erreur lors de l'upload de la photo.") }
    finally { setUploadingAvatar(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Mon profil</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez vos informations personnelles</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">Profil mis à jour avec succès</div>}

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
            <h2 className="font-bold text-gray-900 text-sm mb-5">Photo de profil</h2>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{profile?.nom?.charAt(0).toUpperCase()}</span>
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
                <p className="text-sm font-bold text-gray-900">{profile?.nom}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
                <p className="text-xs text-gray-400 mt-2">Cliquez sur l'icône pour changer votre photo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
            <h2 className="font-bold text-gray-900 text-sm mb-5">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nom complet</label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom"
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
                <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="+221 77 000 00 00"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localisation</label>
                <input type="text" name="localisation" value={form.localisation} onChange={handleChange} placeholder="Dakar, Plateau"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Décrivez-vous en quelques mots..."
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Accès rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/client/missions" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                <p className="text-xs text-gray-400 mb-1">Mes missions</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-black">Voir tout</p>
              </Link>
              <Link to="/client/messages" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                <p className="text-xs text-gray-400 mb-1">Messages</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-black">Voir tout</p>
              </Link>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
            {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MonProfilClient