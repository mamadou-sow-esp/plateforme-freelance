import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const MonProfilClient = () => {
  const { profile, signOut, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    localisation: '',
    bio: '',
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    if (profile) {
      setForm({
        nom: profile.nom || '',
        telephone: profile.telephone || '',
        localisation: profile.localisation || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nom: form.nom,
          telephone: form.telephone,
          localisation: form.localisation,
          bio: form.bio,
        })
        .eq('id', profile?.id)

      if (profileError) throw profileError

      await fetchProfile(profile?.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${profile?.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile?.id)

      await fetchProfile(profile?.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Erreur lors de l'upload de la photo.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Mon profil
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">Gerez vos informations personnelles</p>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-light">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-green-200 bg-green-50 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm font-light">
            Profil mis a jour avec succes
          </div>
        )}

        <div className="space-y-4">

          {/* Photo de profil */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 text-sm mb-5">Photo de profil</h2>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-medium">
                      {profile?.nom?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all">
                  {uploadingAvatar ? (
                    <span className="text-white text-xs">...</span>
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
                <p className="text-sm font-medium text-gray-900">{profile?.nom}</p>
                <p className="text-xs text-gray-400 font-light mt-0.5">{profile?.email}</p>
                <p className="text-xs text-gray-400 font-light mt-3">
                  Cliquez sur l'icone pour changer votre photo
                </p>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 text-sm mb-5">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Nom complet
                </label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Votre nom" style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input type="email" value={profile?.email || ''} disabled style={font}
                  className="w-full px-4 py-3.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 font-light cursor-not-allowed" />
                <p className="text-xs text-gray-400 font-light mt-1">L'email ne peut pas etre modifie</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Telephone
                </label>
                <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                  placeholder="+221 77 000 00 00" style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Localisation
                </label>
                <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
                  placeholder="Dakar, Plateau" style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                  Bio
                </label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  placeholder="Decrivez-vous en quelques mots..." style={font}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light resize-none" />
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-medium text-gray-900 text-sm mb-4">Mon activite</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/client/missions"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <p className="text-xs text-gray-400 font-light mb-1">Mes missions</p>
                <p className="text-sm font-medium text-gray-900">Voir tout</p>
              </Link>
              <Link to="/client/messages"
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <p className="text-xs text-gray-400 font-light mb-1">Messages</p>
                <p className="text-sm font-medium text-gray-900">Voir tout</p>
              </Link>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            style={{ ...font, letterSpacing: '0.06em' }}
            className="w-full py-3.5 bg-black text-white font-medium text-xs rounded-xl hover:bg-gray-900 transition-all uppercase disabled:opacity-40">
            {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default MonProfilClient