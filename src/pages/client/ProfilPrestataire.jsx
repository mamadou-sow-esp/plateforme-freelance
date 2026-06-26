import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'

const ProfilPrestataire = () => {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [prestataire, setPrestataire] = useState(null)
  const [profilData, setProfilData] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', id).single()
    const { data: prestData } = await supabase
      .from('prestataires').select('*').eq('id', id).single()
    const { data: avisData } = await supabase
      .from('avis')
      .select('*, auteur:profiles!avis_auteur_id_fkey(nom, avatar_url)')
      .eq('prestataire_id', id)
      .order('created_at', { ascending: false })

    setPrestataire(profileData)
    setProfilData(prestData)
    setAvis(avisData || [])
    setLoading(false)
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
              Retour a la recherche
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium mb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-4">

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              <Avatar url={prestataire.avatar_url} nom={prestataire.nom} size="xl" />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{prestataire.nom}</h1>
                  {profilData.verifie_cni ? (
                    <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                      Verifie
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">{profilData.metier}</p>
                <p className="text-xs text-gray-400 mt-1">{prestataire.localisation}</p>
                {profilData.note_moyenne > 0 ? (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating note={Math.round(profilData.note_moyenne)} size="sm" />
                    <span className="text-xs text-gray-500 font-medium">
                      {profilData.note_moyenne}/5 ({avis.length} avis)
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${profilData.disponible ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500 font-medium">
                {profilData.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {prestataire.bio ? (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">A propos</p>
              <p className="text-sm text-gray-700 leading-relaxed">{prestataire.bio}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profilData.nb_missions}</p>
              <p className="text-xs text-gray-400 mt-0.5">Missions</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-2xl font-bold text-gray-900">
                {profilData.note_moyenne > 0 ? profilData.note_moyenne + '/5' : 'Nouveau'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Note</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{avis.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Avis</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Fourchette de prix</p>
              <p className="text-base font-bold text-gray-900">
                {profilData.prix_min?.toLocaleString()} — {profilData.prix_max?.toLocaleString()} FCFA
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/client/messages"
                className="px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all">
                Envoyer un message
              </Link>
              <button onClick={() => navigate('/client/creer-mission?prestataire=' + id)}
                className="px-4 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                Assigner une mission
              </button>
            </div>
          </div>

          {profilData.competences && profilData.competences.length > 0 ? (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Competences</p>
              <div className="flex flex-wrap gap-2">
                {profilData.competences.map((c, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {hasLinks ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Liens</p>
              <div className="flex flex-wrap gap-3">
                {profilData.github_url ? (
                  <a href={'https://github.com/' + profilData.github_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 hover:text-gray-900 transition-all">
                    GitHub
                  </a>
                ) : null}
                {profilData.portfolio_url ? (
                  <a href={profilData.portfolio_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 hover:text-gray-900 transition-all">
                    Portfolio
                  </a>
                ) : null}
                {profilData.linkedin_url ? (
                  <a href={'https://linkedin.com/in/' + profilData.linkedin_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 hover:text-gray-900 transition-all">
                    LinkedIn
                  </a>
                ) : null}
                {profilData.cv_url ? (
                  <a href={profilData.cv_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold hover:border-gray-900 hover:text-gray-900 transition-all">
                    Voir CV
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5">
            Avis clients ({avis.length})
          </h2>

          {avis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Aucun avis pour l instant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avis.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar url={a.auteur?.avatar_url} nom={a.auteur?.nom} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.auteur?.nom}</p>
                      <StarRating note={a.note} size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  {a.commentaire ? (
                    <p className="text-sm text-gray-600 leading-relaxed">{a.commentaire}</p>
                  ) : null}
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