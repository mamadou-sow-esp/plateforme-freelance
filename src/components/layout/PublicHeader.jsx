import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logo from '../../assets/logo.png'

// En-tête partagé par la page vitrine (landing) et ses pages annexes
// (FAQ, centre d'aide, confidentialité, à propos, contact). Les liens
// d'ancre pointent vers "/accueil#..." (et pas juste "/#...") car pour un
// utilisateur connecté, "/" redirige automatiquement vers son dashboard
// (voir getHome() dans routes/index.jsx) — "/accueil" affiche toujours
// la landing page, peu importe l'état de connexion.
const PublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/accueil">
          <img src={logo} alt="Alicia" className="h-10 w-auto object-contain" />
        </Link>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/accueil#fonctionnement" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            Comment ça marche
          </a>
          <a href="/accueil#fonctionnalites" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            Fonctionnalités
          </a>
          <Link to="/faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            FAQ
          </Link>
        </div>

        {/* Boutons desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            Connexion
          </Link>
          <Link to="/register"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all">
            S'inscrire
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all">
          {menuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          <a href="/accueil#fonctionnement"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
            Comment ça marche
          </a>
          <a href="/accueil#fonctionnalites"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
            Fonctionnalités
          </a>
          <Link to="/faq"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
            FAQ
          </Link>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="w-full px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Connexion
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              className="w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black transition-all">
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default PublicHeader
