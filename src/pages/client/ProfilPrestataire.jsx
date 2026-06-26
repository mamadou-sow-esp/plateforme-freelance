import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'

const ProfilPrestataire = () => {
  const { id } = useParams()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [prestataire, setPrestataire] = useState(null)
  const [profilData, setProfilData] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    const { data: prestData } = await supabase
      .from('prestataires')
      .select('*')
      .eq('id', id)
      .single()

    const { data: avisData } = await supabase
      .from('avis')
      .select(`*, auteur:profiles!avis_auteur_id_fkey(nom, avatar_url)`)
      .eq('prestataire_id', id)
      .order('created_at', { ascending: false })

    setPrestataire(profileData)
    setProfilData(prestData)
    setAvis(avisData || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const renderStars = (note) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < note ? 'text-yellow-400' : 'text-gray-200'}`}>
        ★
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={font}>
        <p className="text-gray-400 text-sm font-light">Chargement...</p>
      </div>
    )
  }

  if (!prestataire || !profilData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={font}>
        <div className="text-center">
          <p className="text-gray-900 font-medium text-sm mb-2">Prestataire introuvable</p>
          <Link to="/client/rechercher" className="text-xs text-gray-400 hover:text-black">
            Retour a la recherche
          </Link>
        </div>
      </div>
    )
  }

  const hasLinks = profilData.github_url || profilData.portfolio_url || profilData.linkedin_url || profilData.cv_url

  return (
    <div className="min-h-screen bg-gray-50" style={font}>

      {/* Header */}
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Retour */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors font-light mb-6">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        {/* Header profil */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">

          {/* Infos principales */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              <Avatar url={prestataire.avatar_url} nom={prestataire.nom} size="xl" />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-semibold text-gray-900">{prestataire.nom}</h1>
                  {profilData.verifie_cni ? (
                    <span className="text-xs px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                      Verifie
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500 font-light">{profilData.metier}</p>
                <p className="text-xs text-gray-400 font-light mt-1">{prestataire.localisation}</p>
                {profilData.note_moyenne > 0 ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">{renderStars(Math.round(profilData.note_moyenne))}</div>
                    <span className="text-xs text-gray-500 font-medium">
                      {profilData.note_moyenne}/5 ({avis.length} avis)
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${profilData.disponible ? 'bg-green-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500 font-light">
                {profilData.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {prestataire.bio ? (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">A propos</p>
              <p className="text-sm text-gray-700 font-light leading-relaxed">{prestataire.bio}</p>
            </div>
          ) : null}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">{profilData.nb_missions}</p>
              <p className="text-xs text-gray-400 font-light mt-0.5">Missions</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-xl font-semibold text-gray-900">
                {profilData.note_moyenne > 0 ? profilData.note_moyenne + '/5' : '—'}
              </p>
              <p className="text-xs text-gray-400 font-light mt-0.5">Note</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">{avis.length}</p>
              <p className="text-xs text-gray-400 font-light mt-0.5">Avis</p>
            </div>
          </div>

          {/* Prix + CTA */}
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl mb-6">
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Fourchette de prix</p>
              <p className="text-sm font-semibold text-gray-900">
                {profilData.prix_min?.toLocaleString()} — {profilData.prix_max?.toLocaleString()} FCFA
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/client/messages"
                className="px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:border-black hover:text-black transition-all">
                Envoyer un message
              </Link>
              <button
                onClick={() => navigate('/client/creer-mission?prestataire=' + id)}
                className="px-4 py-2.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-all">
                Assigner une mission
              </button>
            </div>
          </div>

          {/* Competences */}
          {profilData.competences && profilData.competences.length > 0 ? (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Competences</p>
              <div className="flex flex-wrap gap-2">
                {profilData.competences.map((c, i) => (
                  <span key={i}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-light">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Liens */}
          {hasLinks ? (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Liens</p>
              <div className="flex flex-wrap gap-3">
                {profilData.github_url ? (
                  <a href={'https://github.com/' + profilData.github_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:border-black hover:text-black transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                ) : null}
                {profilData.portfolio_url ? (
                  <a href={profilData.portfolio_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:border-black hover:text-black transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Portfolio
                  </a>
                ) : null}
                {profilData.linkedin_url ? (
                  <a href={'https://linkedin.com/in/' + profilData.linkedin_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:border-black hover:text-black transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                ) : null}
                {profilData.cv_url ? (
                  <a href={profilData.cv_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:border-black hover:text-black transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Voir CV
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Avis */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-medium text-gray-900 text-sm mb-5">
            Avis clients ({avis.length})
          </h2>

          {avis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm font-light">Aucun avis pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avis.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar url={a.auteur?.avatar_url} nom={a.auteur?.nom} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.auteur?.nom}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {renderStars(a.note)}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400 font-light">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  {a.commentaire ? (
                    <p className="text-sm text-gray-600 font-light leading-relaxed">{a.commentaire}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProfilPrestataire