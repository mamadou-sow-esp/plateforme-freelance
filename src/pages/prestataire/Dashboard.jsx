import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import StarRating from '../../components/ui/StarRating'

const PrestataireDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: missionsData } = await supabase
      .from('missions')
      .select(`*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, avatar_url)`)
      .eq('prestataire_id', profile?.id)
      .order('created_at', { ascending: false })

    const { data: profilData } = await supabase
      .from('prestataires').select('*').eq('id', profile?.id).single()

    setMissions(missionsData || [])
    setProfil(profilData)
    setLoading(false)
  }

  const handleLivrer = async (missionId) => {
    await supabase.from('missions').update({ statut: 'livre' }).eq('id', missionId)
    fetchData()
  }

  const stats = {
    total: missions.length,
    en_cours: missions.filter(m => m.statut === 'en_cours').length,
    valide: missions.filter(m => m.statut === 'valide').length,
    en_attente: missions.filter(m => m.statut === 'en_attente').length,
  }

  const totalGagne = missions.filter(m => m.statut === 'valide').reduce((acc, m) => acc + (m.budget || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* Hero */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Bonjour, {profile?.nom?.split(' ')[0]}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {profil?.metier || 'Prestataire'}
              </p>
            </div>
          </div>
          <Link to="/prestataire/missions"
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all shadow-card">
            Trouver des missions
          </Link>
        </div>

        {/* Alerte profil incomplet */}
        {profil && !profil.verifie_cni && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Completez votre profil</p>
                <p className="text-xs text-amber-600 mt-0.5">Uploadez votre CNI pour obtenir le badge verifie</p>
              </div>
            </div>
            <Link to="/prestataire/profil"
              className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition-all ml-4 whitespace-nowrap">
              Completer
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total gains', value: totalGagne.toLocaleString() + ' FCFA', color: 'text-emerald-600' },
            { label: 'Missions total', value: stats.total, color: 'text-gray-900' },
            { label: 'En cours', value: stats.en_cours, color: 'text-blue-600' },
            { label: 'Terminees', value: stats.valide, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-2 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Missions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Mes missions</h2>
              <Link to="/prestataire/historique"
                className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">
                Historique complet
              </Link>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
              </div>
            ) : missions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission assignee</p>
                <p className="text-gray-400 text-xs mb-4">Parcourez les missions disponibles</p>
                <Link to="/prestataire/missions"
                  className="inline-flex px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                  Voir les missions
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {missions.slice(0, 6).map((mission) => (
                  <div key={mission.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{mission.titre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {mission.categorie?.nom} · {mission.budget?.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        {mission.client && (
                          <div className="hidden md:flex items-center gap-2">
                            <Avatar url={mission.client.avatar_url} nom={mission.client.nom} size="xs" />
                            <p className="text-xs text-gray-400">{mission.client.nom}</p>
                          </div>
                        )}
                        <StatusBadge statut={mission.statut} />
                      </div>
                    </div>
                    {mission.statut === 'en_cours' && (
                      <button
                        onClick={() => handleLivrer(mission.id)}
                        className="mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-all">
                        Marquer comme livre
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Profil card */}
            {profil && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">Mon profil</h3>
                  <Link to="/prestataire/profil"
                    className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
                    Modifier
                  </Link>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar url={profile?.avatar_url} nom={profile?.nom} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{profile?.nom}</p>
                    <p className="text-xs text-gray-400">{profil.metier}</p>
                  </div>
                </div>

                {profil.note_moyenne > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating note={Math.round(profil.note_moyenne)} size="sm" />
                    <span className="text-xs text-gray-500 font-medium">{profil.note_moyenne}/5</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Prix</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {profil.prix_min?.toLocaleString()} — {profil.prix_max?.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Statut</span>
                    <span className={`text-xs font-semibold ${profil.disponible ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {profil.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>

                {profil.competences?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex flex-wrap gap-1.5">
                      {profil.competences.slice(0, 4).map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acces rapide */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Acces rapide</h3>
              <div className="space-y-1">
                {[
                  { to: '/prestataire/statistiques', label: 'Mes statistiques' },
                  { to: '/prestataire/historique', label: 'Historique' },
                  { to: '/prestataire/messages', label: 'Messages' },
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium transition-colors">
                      {item.label}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <h3 className="font-semibold text-base mb-1">Nouvelles missions</h3>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Parcourez les missions disponibles et postulez
              </p>
              <Link to="/prestataire/missions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all">
                Parcourir
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrestataireDashboard