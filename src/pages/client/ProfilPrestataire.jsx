import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getSignedDocUrl } from '../../lib/documents'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import VerifiedBadge from '../../components/ui/VerifiedBadge'

const ProfilPrestataire = () => {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [prestataire, setPrestataire] = useState(null)
  const [profilData, setProfilData] = useState(null)
  const [avis, setAvis] = useState([])
  const [statsReelles, setStatsReelles] = useState({ nb_missions: 0, note_moyenne: 0 })
  const [loading, setLoading] = useState(true)
  const [cvSignedUrl, setCvSignedUrl] = useState(null)

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    // Profil de base
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', id).single()

    // Profil prestataire
    const { data: prestData } = await supabase
      .from('prestataires').select('*').eq('id', id).single()

    // Avis reçus (les avis masqués par l'administration ne sont pas affichés publiquement)
    const { data: avisData } = await supabase
      .from('avis')
      .select('*, auteur:profiles!avis_auteur_id_fkey(nom, avatar_url)')
      .eq('prestataire_id', id)
      .eq('masque', false)
      .order('created_at', { ascending: false })

    // Stats réelles calculées depuis les missions (pas depuis la table prestataires)
    const { count: nbMissions } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('prestataire_id', id)
      .eq('statut', 'valide')

    const avisListe = avisData || []
    const noteMoyenne = avisListe.length > 0
      ? avisListe.reduce((acc, a) => acc + a.note, 0) / avisListe.length
      : 0

    setPrestataire(profileData)
    setProfilData(prestData)
    setAvis(avisListe)
    setStatsReelles({
      nb_missions: nbMissions || 0,
      note_moyenne: Math.round(noteMoyenne * 10) / 10,
    })
    // Le bucket "documents" est privé : URL signée temporaire pour le CV.
    setCvSignedUrl(prestData?.cv_url ? await getSignedDocUrl(prestData.cv_url) : null)

    // Synchronise aussi la table prestataires avec les vraies valeurs
    if (prestData) {
      await supabase.from('prestataires').update({
        nb_missions: nbMissions || 0,
        note_moyenne: Math.round(noteMoyenne * 10) / 10,
      }).eq('id', id)
    }

    setLoading(false)
  }

  const handleEnvoyerMessage = async () => {
    const { data } = await supabase
      .from('missions')
      .select('id')
      .eq('client_id', profile?.id)
      .eq('prestataire_id', id)
      .not('prestataire_id', 'is', null)
      .limit(1)
      .maybeSingle()

    if (data) {
      navigate('/client/messages/' + data.id)
    } else {
      navigate('/client/creer-mission?prestataire=' + id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!prestataire || !profilData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-gray-900 font-semibold text-sm mb-2">Prestataire introuvable</p>
            <Link to="/client/rechercher" className="text-xs text-gray-400 hover:text-gray-900">
              Retour à la recherche
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const hasLinks = profilData.github_url || profilData.portfolio_url || profilData.linkedin_url || profilData.cv_url

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium mb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6 mb-4">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar url={prestataire.avatar_url} nom={prestataire.nom} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">{prestataire.nom}</h1>
                  {profilData.verifie_cni && <VerifiedBadge size="md" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{profilData.metier}</p>
                <p className="text-xs text-gray-400 mt-0.5">{prestataire.localisation}</p>
                {statsReelles.note_moyenne > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating note={Math.round(statsReelles.note_moyenne)} size="sm" />
                    <span className="text-xs text-gray-500 font-medium">
                      {statsReelles.note_moyenne}/5 ({avis.length} avis)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${profilData.disponible ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500 font-medium">
                {profilData.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {prestataire.bio && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">À propos</p>
              <p className="text-sm text-gray-700 leading-relaxed">{prestataire.bio}</p>
            </div>
          )}

          {/* Stats — calculées en temps réel */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statsReelles.nb_missions}</p>
              <p className="text-xs text-gray-400 mt-0.5">Missions</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {statsReelles.note_moyenne > 0 ? statsReelles.note_moyenne + '/5' : 'Nouveau'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Note</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{avis.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Avis</p>
            </div>
          </div>

          {/* Prix + CTA */}
          <div className="p-4 border border-gray-100 rounded-xl mb-6">
            <p className="text-xs text-gray-400 mb-1">Prix</p>
            <p className="text-base font-bold text-gray-900 mb-4">
              À partir de {profilData.prix_min?.toLocaleString()} FCFA
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleEnvoyerMessage}
                className="flex-1 py-2.5 text-center border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all">
                Envoyer un message
              </button>
              <button onClick={() => navigate('/client/creer-mission?prestataire=' + id)}
                className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                Assigner une mission
              </button>
            </div>
          </div>

          {/* Compétences */}
          {profilData.competences && profilData.competences.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Compétences</p>
              <div className="flex flex-wrap gap-2">
                {profilData.competences.map((c, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Liens */}
          {hasLinks && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Liens</p>
              <div className="flex flex-wrap gap-2">
                {profilData.github_url && (
                  <a href={'https://github.com/' + profilData.github_url} target="_blank" rel="noreferrer"
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 transition-all">
                    GitHub
                  </a>
                )}
                {profilData.portfolio_url && /^https?:\/\//i.test(profilData.portfolio_url) && (
                  <a href={profilData.portfolio_url} target="_blank" rel="noreferrer"
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 transition-all">
                    Portfolio
                  </a>
                )}
                {profilData.linkedin_url && (
                  <a href={'https://linkedin.com/in/' + profilData.linkedin_url} target="_blank" rel="noreferrer"
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 transition-all">
                    LinkedIn
                  </a>
                )}
                {profilData.cv_url && cvSignedUrl && (
                  <a href={cvSignedUrl} target="_blank" rel="noreferrer"
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 transition-all">
                    Voir CV
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avis */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5">Avis clients ({avis.length})</h2>
          {avis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Aucun avis pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avis.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar url={a.auteur?.avatar_url} nom={a.auteur?.nom} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.auteur?.nom}</p>
                      <StarRating note={a.note} size="sm" />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  {a.commentaire && (
                    <p className="text-sm text-gray-600 leading-relaxed">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilPrestataire