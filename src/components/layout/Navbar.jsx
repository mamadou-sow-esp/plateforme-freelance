import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import logo from '../../assets/logo.png'

const Navbar = () => {
  const { profile, signOut, switchAccount } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const clientLinks = [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/rechercher', label: 'Rechercher' },
    { to: '/client/missions', label: 'Missions' },
    { to: '/client/suivi', label: 'Suivi' },
    { to: '/client/messages', label: 'Messages' },
    { to: '/client/parametres', label: 'Paramètres' },
  ]

  const prestataireLinks = [
    { to: '/prestataire/dashboard', label: 'Dashboard' },
    { to: '/prestataire/missions', label: 'Missions' },
    { to: '/prestataire/statistiques', label: 'Statistiques' },
    { to: '/prestataire/historique', label: 'Historique' },
    { to: '/prestataire/messages', label: 'Messages' },
    { to: '/prestataire/parametres', label: 'Paramètres' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Administration' },
  ]

  const links = profile?.role === 'client'
    ? clientLinks
    : profile?.role === 'prestataire'
    ? prestataireLinks
    : adminLinks

  const isActive = (path) => location.pathname === path

  const homeLink = profile?.role === 'client'
    ? '/client/dashboard'
    : profile?.role === 'prestataire'
    ? '/prestataire/dashboard'
    : '/admin/dashboard'

  return (
    <header className={`bg-white sticky top-0 z-40 transition-all duration-200 ${
      scrolled ? 'shadow-card border-b border-gray-100' : 'border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={homeLink} className="flex-shrink-0">
          <img src={logo} alt="Alicia" className="h-12 w-auto object-contain" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(link.to)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{profile?.nom}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
            <button
              onClick={switchAccount}
              className="ml-1 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
              Changer de compte
            </button>
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
              Quitter
            </button>
          </div>

          {/* Mobile avatar */}
          <div className="lg:hidden">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all"
          >
            {menuOpen ? (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{profile?.nom}</p>
                <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={() => { switchAccount() }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Changer de compte
            </button>
            <button
              onClick={() => { signOut(); setMenuOpen(false) }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all">
              Se deconnecter
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar