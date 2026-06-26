import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const MonProfil = () => {
  const { profile, signOut, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const avatarRef = useRef(null)

  const [form, setForm] = useState({
    metier: '',
    competences: '',
    prix_min: '',
    prix_max: '',
    disponible: true,
    localisation: '',
    bio: '',
    github_url: '',
    portfolio_url: '',
    linkedin_url: '',
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('prestataires')
      .select('*')
      .eq('id', profile?.id)
      .single()

    if (data) {
      setProfil(data)
      setForm({
        metier: data.metier || '',
        competences: data.competences?.join(', ') || '',
        prix_min: data.prix_min || '',
        prix_max: data.prix_max || '',
        disponible: data.disponible ?? true,
        localisation: profile?.localisation || '',
        bio: profile?.bio || '',
        github_url: data.github_url || '',
        portfolio_url: data.portfolio_url || '',
        linkedin_url: data.linkedin_url || '',
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const competencesArray = form.competences
        .split(',')
        .map(c => c.trim())
        .filter(c => c !== '')

      const { error: prestError } = await supabase
        .from('prestataires')
        .update({
          metier: form.metier,
          competences: competencesArray,
          prix_min: parseFloat(form.prix_min) || 0,
          prix_max: parseFloat(form.prix_max) || 0,
          disponible: form.disponible,
          github_url: form.github_url || null,
          portfolio_url: form.portfolio_url || null,
          linkedin_url: form.linkedin_url || null,
        })
        .eq('id', profile?.id)

      if (prestError) throw prestError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
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
      setSaving(false)
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
      setError("Erreur lors de l'upload de l'avatar.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUploadCNI = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const fileName = `cni_${profile?.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      await supabase
        .from('prestataires')
        .update({ cni_url: urlData.publicUrl, verifie_cni: false })
        .eq('id', profile?.id)

      fetchData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError("Erreur lors de l'upload de la CNI.")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingCV(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const fileName = `cv_${profile?.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      await supabase
        .from('prestataires')
        .update({ cv_url: urlData.publicUrl })
        .eq('id', profile?.id)

      fetchData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError("Erreur lors de l'upload du CV.")
    } finally {
      setUploadingCV(false)
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
            style={{ letterSpacing: '-0.02em' }}>
            Mon profil
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            Gerez vos informations et vos services
          </p>
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

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Photo de profil + infos */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 text-sm mb-5">
                Informations personnelles
              </h2>

              <div className="flex items-center gap-5 mb-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-medium">
                        {profile?.nom?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all">
                    {uploadingAvatar ? (
                      <span className="text-white text-xs">...</span>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                <div>
                  <p className="font-medium text-gray-900">{profile?.nom}</p>
                  <p className="text-sm text-gray-400 font-light">{profile?.email}</p>
                  <p className="text-sm text-gray-400 font-light">{profile?.telephone}</p>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    Cliquez sur l'icone pour changer la photo
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    name="localisation"
                    value={form.localisation}
                    onChange={handleChange}
                    placeholder="Dakar, Plateau"
                    style={font}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Decrivez-vous en quelques mots..."
                    style={font}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 text-sm mb-5">Mes services</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    Metier
                  </label>
                  <input
                    type="text"
                    name="metier"
                    value={form.metier}
                    onChange={handleChange}
                    placeholder="Developpeur Web"
                    style={font}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    Competences (separees par des virgules)
                  </label>
                  <input
                    type="text"
                    name="competences"
                    value={form.competences}
                    onChange={handleChange}
                    placeholder="React, Node.js, Supabase"
                    style={font}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                      Prix min (FCFA)
                    </label>
                    <input
                      type="number"
                      name="prix_min"
                      value={form.prix_min}
                      onChange={handleChange}
                      placeholder="5000"
                      style={font}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                      Prix max (FCFA)
                    </label>
                    <input
                      type="number"
                      name="prix_max"
                      value={form.prix_max}
                      onChange={handleChange}
                      placeholder="50000"
                      style={font}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                    />
                  </div>
                </div>

                {/* Disponibilité */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Disponibilite</p>
                    <p className="text-xs text-gray-400 font-light mt-0.5">
                      Indiquez si vous acceptez de nouvelles missions
                    </p>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, disponible: !form.disponible })}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      form.disponible ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      form.disponible ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Liens professionnels */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 text-sm mb-1">Liens professionnels</h2>
              <p className="text-xs text-gray-400 font-light mb-5">Optionnel — renforcez la credibilite de votre profil</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    GitHub
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <span className="px-3 text-gray-400 text-xs font-light border-r border-gray-200 py-3.5 whitespace-nowrap">
                      github.com/
                    </span>
                    <input
                      type="text"
                      name="github_url"
                      value={form.github_url}
                      onChange={handleChange}
                      placeholder="votre-username"
                      style={font}
                      className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    Portfolio
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={form.portfolio_url}
                    onChange={handleChange}
                    placeholder="https://monportfolio.com"
                    style={font}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50 focus:bg-white font-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    LinkedIn
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <span className="px-3 text-gray-400 text-xs font-light border-r border-gray-200 py-3.5 whitespace-nowrap">
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      placeholder="votre-profil"
                      style={font}
                      className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none font-light"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-900 text-sm mb-1">Documents</h2>
              <p className="text-xs text-gray-400 font-light mb-5">Optionnel — CNI pour verification, CV pour votre profil</p>

              <div className="space-y-4">
                {/* CNI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest">
                      CNI (Verification identite)
                    </label>
                    {profil?.verifie_cni && (
                      <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                        Verifie
                      </span>
                    )}
                  </div>

                  {profil?.cni_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-600 font-light flex-1">CNI uploadee</span>
                      {!profil?.verifie_cni && (
                        <span className="text-xs text-yellow-600 font-light">En attente</span>
                      )}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-black transition-all">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-light">
                      {uploading ? 'Upload en cours...' : profil?.cni_url ? 'Remplacer la CNI' : 'Uploader la CNI'}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleUploadCNI} className="hidden" disabled={uploading} />
                  </label>
                </div>

                {/* CV */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                    CV (optionnel)
                  </label>

                  {profil?.cv_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-gray-600 font-light flex-1">CV uploade</span>
                      
                        href={profil.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-black font-medium hover:underline"
                        Voir
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-black transition-all">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-light">
                      {uploadingCV ? 'Upload en cours...' : profil?.cv_url ? 'Remplacer le CV' : 'Uploader le CV (PDF)'}
                    </span>
                    <input type="file" accept=".pdf" onChange={handleUploadCV} className="hidden" disabled={uploadingCV} />
                  </label>
                </div>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...font, letterSpacing: '0.06em' }}
              className="w-full py-3.5 bg-black text-white font-medium text-xs rounded-xl hover:bg-gray-900 transition-all uppercase disabled:opacity-40"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default MonProfil