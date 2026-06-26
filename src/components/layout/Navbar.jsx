import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import logo from '../../assets/logo.png'

const Navbar = () => {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const clientLinks = [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/rechercher', label: 'Rechercher' },
    { to: '/client/missions', label: 'Mes missions' },
    { to: '/client/suivi', label: 'Suivi' },
    { to: '/client/messages', label: 'Messages' },
    { to: '/client/profil', label: 'Mon profil' },
  ]

  const prestataireLinks = [
    { to: '/prestataire/dashboard', label: 'Dashboard' },
    { to: '/prestataire/missions', label: 'Missions' },
    { to: '/prestataire/statistiques', label: 'Statistiques' },
    { to: '/prestataire/historique', label: 'Historique' },
    { to: '/prestataire/profil', label: 'Mon profil' },
    { to: '/prestataire/messages', label: 'Messages' },
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

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to={
          profile?.role === 'client' ? '/client/dashboard'
          : profile?.role === 'prestataire' ? '/prestataire/dashboard'
          : '/admin/dashboard'
        }>
          <img src={logo} alt="Alicia" className="w-14 h-14 object-contain" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                isActive(link.to)
                  ? 'font-semibold text-black bg-gray-100'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Avatar url={profile?.avatar_url} nom={profile?.nom} size="sm" />
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-black transition-colors font-light hidden md:block">
            Deconnexion
          </button>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
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
        <div className="md:hidden mt-3 pb-3 border-t border-gray-100 pt-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                isActive(link.to)
                  ? 'font-semibold text-black bg-gray-100'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all mt-2"
          >
            Deconnexion
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar