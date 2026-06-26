import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'

const MonProfilPrestataire = () => {
  const { profile, fetchProfile } = useAuth()
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('prestataires').select('*').eq('id', profile?.id).single()
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
      const competencesArray = form.competences.split(',').map(c => c.trim()).filter(c => c !== '')
      const { error: prestError } = await supabase.from('prestataires').update({
        metier: form.metier,
        competences: competencesArray,
        prix_min: parseFloat(form.prix_min) || 0,
        prix_max: parseFloat(form.prix_max) || 0,
        disponible: form.disponible,
        github_url: form.github_url || null,
        portfolio_url: form.portfolio_url || null,
        linkedin_url: form.linkedin_url || null,
      }).eq('id', profile?.id)
      if (prestError) throw prestError
      const { error: profileError } = await supabase.from('profiles').update({
        localisation: form.localisation,
        bio: form.bio,
      }).eq('id', profile?.id)
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
    try {
      const ext = file.name.split('.').pop()
      const fileName = profile?.id + '/avatar.' + ext
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile?.id)
      await fetchProfile(profile?.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Erreur lors de l upload de l avatar.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUploadCNI = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'cni_' + profile?.id + '.' + ext
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('prestataires').update({ cni_url: urlData.publicUrl, verifie_cni: false }).eq('id', profile?.id)
      fetchData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Erreur lors de l upload de la CNI.")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingCV(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'cv_' + profile?.id + '.' + ext
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('prestataires').update({ cv_url: urlData.publicUrl }).eq('id', profile?.id)
      fetchData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Erreur lors de l upload du CV.")
    } finally {
      setUploadingCV(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mon profil</h1>
          <p className="text-gray-400 text-sm mt-1">Gerez vos informations et vos services</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            Profil mis a jour avec succes
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Photo de profil</h2>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {profile?.nom?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-900 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-card">
                    {uploadingAvatar ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" disabled={uploadingAvatar} />
                  </label>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{profile?.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.email}</p>
                  <p className="text-xs text-gray-400 mt-2">Cliquez sur l icone pour changer la photo</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Informations personnelles</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localisation</label>
                  <input type="text" name="localisation" value={form.localisation} onChange={handleChange}
                    placeholder="Dakar, Plateau"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                    placeholder="Decrivez-vous en quelques mots..."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-5">Mes services</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Metier</label>
                  <input type="text" name="metier" value={form.metier} onChange={handleChange}
                    placeholder="Developpeur Web"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Competences (separees par des virgules)
                  </label>
                  <input type="text" name="competences" value={form.competences} onChange={handleChange}
                    placeholder="React, Node.js, Supabase"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prix min (FCFA)</label>
                    <input type="number" name="prix_min" value={form.prix_min} onChange={handleChange}
                      placeholder="5000"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prix max (FCFA)</label>
                    <input type="number" name="prix_max" value={form.prix_max} onChange={handleChange}
                      placeholder="50000"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Disponibilite</p>
                    <p className="text-xs text-gray-400 mt-0.5">Indiquez si vous acceptez de nouvelles missions</p>
                  </div>
                  <button onClick={() => setForm({ ...form, disponible: !form.disponible })}
                    className={`relative w-11 h-6 rounded-full transition-all ${form.disponible ? 'bg-gray-900' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.disponible ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Liens professionnels</h2>
              <p className="text-xs text-gray-400 mb-5">Optionnel — renforcez la credibilite de votre profil</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">GitHub</label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10 transition-all">
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
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">LinkedIn</label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10 transition-all">
                    <span className="px-3 text-gray-400 text-xs font-medium border-r border-gray-200 py-3.5 whitespace-nowrap">linkedin.com/in/</span>
                    <input type="text" name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                      placeholder="votre-profil"
                      className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-sm mb-1">Documents</h2>
              <p className="text-xs text-gray-400 mb-5">CNI pour verification, CV pour votre profil</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CNI</label>
                    {profil?.verifie_cni && (
                      <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                        Verifie
                      </span>
                    )}
                  </div>
                  {profil?.cni_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
                      <p className="text-xs text-gray-600 flex-1">CNI uploadee</p>
                      {!profil?.verifie_cni && (
                        <span className="text-xs text-amber-600 font-medium">En attente de verification</span>
                      )}
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">
                      {uploading ? 'Upload en cours...' : profil?.cni_url ? 'Remplacer la CNI' : 'Uploader la CNI'}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleUploadCNI} className="hidden" disabled={uploading} />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CV (optionnel)</label>
                  {profil?.cv_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
                      <p className="text-xs text-gray-600 flex-1">CV uploade</p>
                      <a href={profil.cv_url} target="_blank" rel="noreferrer"
                        className="text-xs text-gray-900 font-semibold hover:underline">Voir</a>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-900 transition-all">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">
                      {uploadingCV ? 'Upload en cours...' : profil?.cv_url ? 'Remplacer le CV' : 'Uploader le CV (PDF)'}
                    </span>
                    <input type="file" accept=".pdf" onChange={handleUploadCV} className="hidden" disabled={uploadingCV} />
                  </label>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-40">
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MonProfilPrestataire