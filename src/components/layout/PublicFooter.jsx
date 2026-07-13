import { Link } from 'react-router-dom'

// Footer partagé par la page vitrine (landing) et ses pages annexes.
const PublicFooter = () => {
  return (
    <footer className="bg-gray-900 py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Marque */}
          <div>
            <p className="text-white font-bold text-lg tracking-tight mb-2">Alicia</p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Plateforme de mise en relation entre clients et prestataires de services au Sénégal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Navigation</p>
            <div className="flex flex-col gap-3">
              <a href="/accueil#fonctionnement" className="text-sm text-gray-400 hover:text-white transition-colors">Comment ça marche</a>
              <a href="/accueil#fonctionnalites" className="text-sm text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
              <Link to="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>

          {/* Aide & légal */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Aide & légal</p>
            <div className="flex flex-col gap-3">
              <Link to="/centre-aide" className="text-sm text-gray-400 hover:text-white transition-colors">Centre d'aide</Link>
              <Link to="/a-propos" className="text-sm text-gray-400 hover:text-white transition-colors">À propos</Link>
              <Link to="/confidentialite" className="text-sm text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Contact</p>
            <a href="mailto:contact.aliciasen@gmail.com"
              className="text-sm text-gray-400 hover:text-white transition-colors break-all">
              contact.aliciasen@gmail.com
            </a>
            <Link to="/contact"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-white font-semibold hover:underline">
              Contacter le support
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 Alicia — Tous droits réservés</p>
          <img src="/founder-logo.png" alt="Keba Foundation" className="h-5 w-auto object-contain" />
          <p className="text-xs text-gray-500">Plateforme freelance du Sénégal</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
