import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import Avatar from '../../components/ui/Avatar'

const RechercherPrestataire = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [prestataires, setPrestataires] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtres, setFiltres] = useState({
    categorie: '',
    localisation: '',
    prix_max: '',
    disponible: false,
  })

  const font = { fontFamily: "'DM Sans', sans-serif" }

  useEffect(() => {
    fetchCategories()
    fetchPrestataires()
  }, [])

  useEffect(() => {
    fetchPrestataires()
  }, [filtres, search])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchPrestataires = async () => {
    setLoading(true)
    let query = supabase
      .from('prestataires')
      .select(`*, profile:profiles(id, nom, localisation, avatar_url)`)

    if (filtres.disponible) query = query.eq('disponible', true)
    if (filtres.prix_max) query = query.lte('prix_max', filtres.prix_max)

    const { data } = await query
    let result = data || []

    if (search) {
      result = result.filter(p =>
        p.metier?.toLowerCase().includes(search.toLowerCase()) ||
        p.profile?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        p.competences?.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (filtres.localisation) {
      result = result.filter(p =>
        p.profile?.localisation?.toLowerCase().includes(filtres.localisation.toLowerCase())
      )
    }

    setPrestataires(result)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={font}>
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Alicia" className="w-16 h-16 object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/client/dashboard"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link to="/client/rechercher"
              className="text-sm font-medium text-black border-b-2 border-black pb-0.5">
              Rechercher
            </Link>
            <Link to="/client/missions"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Mes missions
            </Link>
            <Link to="/client/messages"
              className="text-sm text-gray-400 hover:text-black transition-colors">
              Messages
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
            <button onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-black transition-colors font-light">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight"
            style={{ letterSpacing: '-0.02em' }}>
            Trouver un prestataire
          </h1>
          <p className="text-gray-400 text-sm font-light mt-1">
            {prestataires.length} prestataire{prestataires.length > 1 ? 's' : ''} trouve{prestataires.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par metier, nom ou competence..."
            style={font}
            className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white font-light"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <select
            value={filtres.categorie}
            onChange={(e) => setFiltres({ ...filtres, categorie: e.target.value })}
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-black transition-all bg-white font-light"
          >
            <option value="">Toutes categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>

          <input
            type="text"
            value={filtres.localisation}
            onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
            placeholder="Localisation"
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-black transition-all bg-white font-light"
          />

          <input
            type="number"
            value={filtres.prix_max}
            onChange={(e) => setFiltres({ ...filtres, prix_max: e.target.value })}
            placeholder="Budget max (FCFA)"
            style={font}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-black transition-all bg-white font-light"
          />

          <button
            onClick={() => setFiltres({ ...filtres, disponible: !filtres.disponible })}
            className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              filtres.disponible
                ? 'border-black bg-black text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            Disponible
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">Chargement...</p>
          </div>
        ) : prestataires.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-900 font-medium text-sm mb-1">Aucun prestataire trouve</p>
            <p className="text-gray-400 text-xs font-light">Essayez d'elargir vos criteres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prestataires.map((p) => (
              <div key={p.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar url={p.profile?.avatar_url} nom={p.profile?.nom} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.profile?.nom}</p>
                      <p className="text-xs text-gray-400 font-light">{p.metier}</p>
                    </div>
                  </div>
                  {p.verifie_cni && (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                      Verifie
                    </span>
                  )}
                </div>

                {p.competences?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.competences.slice(0, 3).map((c, i) => (
                      <span key={i}
                        className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-light">
                        {c}
                      </span>
                    ))}
                    {p.competences.length > 3 && (
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full font-light">
                        +{p.competences.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 font-light">{p.profile?.localisation || 'Dakar'}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {p.prix_min?.toLocaleString()} — {p.prix_max?.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.note_moyenne > 0 && (
                      <span className="text-xs text-gray-500 font-medium">{p.note_moyenne}/5</span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${p.disponible ? 'bg-green-400' : 'bg-gray-300'}`} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/client/prestataire/${p.profile?.id}`}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-all text-center"
                  >
                    Voir profil
                  </Link>
                  <button
                    onClick={() => navigate(`/client/creer-mission?prestataire=${p.id}`)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default RechercherPrestataire