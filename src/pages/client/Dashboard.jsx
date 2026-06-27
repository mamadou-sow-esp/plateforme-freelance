import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'

const ClientDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMissions() }, [])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`*, categorie:categories(nom), prestataire:profiles!missions_prestataire_id_fkey(nom, avatar_url)`)
      .eq('client_id', profile?.id)
      .order('created_at', { ascending: false })
    setMissions(data || [])
    setLoading(false)
  }

  const stats = {
    total: missions.length,
    en_cours: missions.filter(m => m.statut === 'en_cours').length,
    valide: missions.filter(m => m.statut === 'valide').length,
    en_attente: missions.filter(m => m.statut === 'en_attente').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="lg" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Bonjour, {profile?.nom?.split(' ')[0]}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">Voici un aperçu de votre activité</p>
            </div>
          </div>
          <Link to="/client/creer-mission"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all shadow-card self-start sm:self-auto">
            + Nouvelle mission
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total missions', value: stats.total, color: 'text-gray-900' },
            { label: 'En attente', value: stats.en_attente, color: 'text-amber-600' },
            { label: 'En cours', value: stats.en_cours, color: 'text-blue-600' },
            { label: 'Terminées', value: stats.valide, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card">
              <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Missions récentes</h2>
              <Link to="/client/missions" className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors">
                Voir tout
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : missions.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-gray-900 font-semibold text-sm mb-1">Aucune mission pour l'instant</p>
                <p className="text-gray-400 text-xs mb-4">Créez votre première mission</p>
                <Link to="/client/creer-mission"
                  className="inline-flex px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all">
                  Créer une mission
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {missions.slice(0, 5).map((mission) => (
                  <div key={mission.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/client/missions')}>
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">{mission.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {mission.categorie?.nom} · {mission.budget?.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mission.prestataire && (
                        <div className="hidden md:flex items-center gap-2">
                          <Avatar url={mission.prestataire.avatar_url} nom={mission.prestataire.nom} size="xs" />
                          <p className="text-xs text-gray-400">{mission.prestataire.nom}</p>
                        </div>
                      )}
                      <StatusBadge statut={mission.statut} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <h3 className="font-bold text-base mb-1">Trouver un talent</h3>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Parcourez notre catalogue de prestataires vérifiés
              </p>
              <Link to="/client/rechercher"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all">
                Rechercher
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Accès rapide</h3>
              <div className="space-y-1">
                {[
                  { to: '/client/suivi', label: 'Suivi des missions' },
                  { to: '/client/messages', label: 'Mes messages' },
                  { to: '/client/profil', label: 'Mon profil' },
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ClientDashboard