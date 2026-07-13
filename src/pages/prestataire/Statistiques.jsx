import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import BackButton from '../../components/ui/BackButton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Statistiques = () => {
  const { profile } = useAuth()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('6mois')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*, categorie:categories(nom), client:profiles!missions_client_id_fkey(nom, avatar_url), avis(note)')
      .eq('prestataire_id', profile?.id)
      .eq('conversation', false)
      .order('created_at', { ascending: true })
    setMissions(data || [])
    setLoading(false)
  }

  const missionsValidees = missions.filter(m => m.statut === 'valide')
  const missionsEnCours = missions.filter(m => m.statut === 'en_cours')
  const totalGagne = missionsValidees.reduce((acc, m) => acc + (m.budget || 0), 0)
  const gainMoyen = missionsValidees.length > 0 ? totalGagne / missionsValidees.length : 0
  const tousLesAvis = missions.flatMap(m => m.avis || [])
  const noteMoyenne = tousLesAvis.length > 0 ? tousLesAvis.reduce((acc, a) => acc + a.note, 0) / tousLesAvis.length : 0

  const getChartData = () => {
    const now = new Date()
    const mois = periode === '3mois' ? 3 : periode === '6mois' ? 6 : 12
    const data = []
    for (let i = mois - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      const moisMissions = missionsValidees.filter(m => {
        const mDate = new Date(m.created_at)
        return mDate.getMonth() === date.getMonth() && mDate.getFullYear() === date.getFullYear()
      })
      data.push({
        mois: label,
        gains: moisMissions.reduce((acc, m) => acc + (m.budget || 0), 0),
        missions: moisMissions.length,
      })
    }
    return data
  }

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
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-modal">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-bold text-gray-900">
              {p.name === 'gains' ? p.value.toLocaleString() + ' FCFA' : p.value + ' mission' + (p.value > 1 ? 's' : '')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Statistiques</h1>
            <p className="text-gray-400 text-sm mt-1">Suivez votre performance et vos gains</p>
          </div>
          <div className="flex gap-2">
            {[{ key: '3mois', label: '3 mois' }, { key: '6mois', label: '6 mois' }, { key: '12mois', label: '1 an' }].map(p => (
              <button key={p.key} onClick={() => setPeriode(p.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  periode === p.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400 shadow-card'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-5">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total gagné', value: totalGagne.toLocaleString(), unit: 'FCFA', color: 'text-emerald-600' },
                { label: 'Missions terminées', value: missionsValidees.length, unit: 'sur ' + missions.length + ' total', color: 'text-gray-900' },
                { label: 'Gain moyen', value: Math.round(gainMoyen).toLocaleString(), unit: 'FCFA / mission', color: 'text-blue-600' },
                { label: 'Note moyenne', value: noteMoyenne > 0 ? noteMoyenne.toFixed(1) : '—', unit: tousLesAvis.length + ' avis', color: 'text-amber-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card">
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.unit}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Évolution des gains</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Gains par mois en FCFA</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold text-gray-900">{totalGagne.toLocaleString()} FCFA</p>
                  <p className="text-xs text-gray-400">total sur la période</p>
                </div>
              </div>
              {missionsValidees.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Complétez des missions pour voir vos gains</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="gains" stroke="#111111" strokeWidth={2.5} dot={{ fill: '#111111', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                <h2 className="font-bold text-gray-900 text-sm mb-1">Missions par mois</h2>
                <p className="text-xs text-gray-400 mb-5">Nombre de missions terminées</p>
                {missionsValidees.length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-gray-400 text-xs">Aucune mission terminée</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="missions" fill="#111111" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                <h2 className="font-bold text-gray-900 text-sm mb-1">Gains par catégorie</h2>
                <p className="text-xs text-gray-400 mb-5">Répartition de vos revenus</p>
                {categorieData.length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-gray-400 text-xs">Aucune donnée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categorieData.map((cat, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-600 font-medium truncate mr-2">{cat.nom}</span>
                          <span className="text-xs font-bold text-gray-900 flex-shrink-0">{cat.gains.toLocaleString()} FCFA</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-gray-900 h-2 rounded-full transition-all"
                            style={{ width: totalGagne > 0 ? (cat.gains / totalGagne * 100) + '%' : '0%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {missionsEnCours.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
                <h2 className="font-bold text-gray-900 text-sm mb-4">Missions en cours ({missionsEnCours.length})</h2>
                <div className="space-y-3">
                  {missionsEnCours.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <Avatar url={m.client?.avatar_url} nom={m.client?.nom} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{m.titre}</p>
                          <p className="text-xs text-gray-400 truncate">{m.client?.nom}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{m.budget?.toLocaleString()} FCFA</p>
                        <StatusBadge statut={m.statut} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Statistiques