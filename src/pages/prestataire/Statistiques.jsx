import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'
import Navbar from '../../components/layout/Navbar'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const Statistiques = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('6mois')

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('missions')
      .select(`
        *,
        categorie:categories(nom),
        client:profiles!missions_client_id_fkey(nom, avatar_url),
        avis(note)
      `)
      .eq('prestataire_id', profile?.id)
      .order('created_at', { ascending: true })

    setMissions(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Calculs stats
  const missionsValidees = missions.filter(m => m.statut === 'valide')
  const missionsEnCours = missions.filter(m => m.statut === 'en_cours')
  const totalGagne = missionsValidees.reduce((acc, m) => acc + (m.budget || 0), 0)
  const gainMoyen = missionsValidees.length > 0 ? totalGagne / missionsValidees.length : 0
  const tousLesAvis = missions.flatMap(m => m.avis || [])
  const noteMoyenne = tousLesAvis.length > 0
    ? tousLesAvis.reduce((acc, a) => acc + a.note, 0) / tousLesAvis.length
    : 0

  // Données graphique par mois
  const getChartData = () => {
    const now = new Date()
    const mois = periode === '3mois' ? 3 : periode === '6mois' ? 6 : 12
    const data = []

    for (let i = mois - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

      const moisMissions = missionsValidees.filter(m => {
        const mDate = new Date(m.created_at)
        return mDate.getMonth() === date.getMonth() &&
               mDate.getFullYear() === date.getFullYear()
      })

      data.push({
        mois: label,
        gains: moisMissions.reduce((acc, m) => acc + (m.budget || 0), 0),
        missions: moisMissions.length,
      })
    }
    return data
  }

  // Données par catégorie
  const getCategorieData = () => {
    const cats = {}
    missionsValidees.forEach(m => {
      const nom = m.categorie?.nom || 'Autres'
      if (!cats[nom]) cats[nom] = { nom, gains: 0, count: 0 }
      cats[nom].gains += m.budget || 0
      cats[nom].count++
    })
    return Object.values(cats).sort((a, b) => b.gains - a.gains)
  }

  const chartData = getChartData()
  const categorieData = getCategorieData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg" style={font}>
          <p className="text-xs text-gray-500 font-light mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-medium text-gray-900">
              {p.name === 'gains'
                ? p.value.toLocaleString() + ' FCFA'
                : p.value + ' mission' + (p.value > 1 ? 's' : '')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Statistiques
            </h1>
            <p className="text-gray-400 text-sm font-light mt-1">
              Suivez votre performance et vos gains
            </p>
          </div>

          {/* Sélecteur période */}
          <div className="flex gap-2">
            {[
              { key: '3mois', label: '3 mois' },
              { key: '6mois', label: '6 mois' },
              { key: '12mois', label: '1 an' },
            ].map(p => (
              <button key={p.key} onClick={() => setPeriode(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  periode === p.key
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-light mb-2">Total gagne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalGagne.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 font-light mt-1">FCFA</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-light mb-2">Missions terminees</p>
                <p className="text-2xl font-bold text-gray-900">{missionsValidees.length}</p>
                <p className="text-xs text-gray-400 font-light mt-1">sur {missions.length} total</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-light mb-2">Gain moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(gainMoyen).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 font-light mt-1">FCFA / mission</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-light mb-2">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {noteMoyenne > 0 ? noteMoyenne.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-400 font-light mt-1">
                  {tousLesAvis.length > 0 ? tousLesAvis.length + ' avis' : 'Aucun avis'}
                </p>
              </div>
            </div>

            {/* Graphique gains */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-medium text-gray-900 text-sm">Evolution des gains</h2>
                  <p className="text-xs text-gray-400 font-light mt-0.5">Gains par mois en FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{totalGagne.toLocaleString()} FCFA</p>
                  <p className="text-xs text-gray-400 font-light">total sur la periode</p>
                </div>
              </div>

              {missionsValidees.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm font-light">
                    Completez des missions pour voir vos gains
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="gains" stroke="#111827" strokeWidth={2.5}
                      dot={{ fill: '#111827', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Graphique missions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-medium text-gray-900 text-sm mb-1">Missions par mois</h2>
                <p className="text-xs text-gray-400 font-light mb-6">Nombre de missions terminees</p>

                {missionsValidees.length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-gray-400 text-xs font-light">Aucune mission terminee</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="missions" fill="#111827" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Gains par catégorie */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-medium text-gray-900 text-sm mb-1">Gains par categorie</h2>
                <p className="text-xs text-gray-400 font-light mb-5">Repartition de vos revenus</p>

                {categorieData.length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-gray-400 text-xs font-light">Aucune donnee</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorieData.map((cat, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 font-light">{cat.nom}</span>
                          <span className="text-xs font-medium text-gray-900">
                            {cat.gains.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-black h-1.5 rounded-full transition-all"
                            style={{ width: totalGagne > 0 ? (cat.gains / totalGagne * 100) + '%' : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mission en cours */}
            {missionsEnCours.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-medium text-gray-900 text-sm mb-4">
                  Missions en cours ({missionsEnCours.length})
                </h2>
                <div className="space-y-3">
                  {missionsEnCours.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar url={m.client?.avatar_url} nom={m.client?.nom} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.titre}</p>
                          <p className="text-xs text-gray-400 font-light">{m.client?.nom}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{m.budget?.toLocaleString()} FCFA</p>
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">
                          En cours
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

export default Statistiques