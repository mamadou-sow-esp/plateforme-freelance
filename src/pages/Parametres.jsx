import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import BackButton from '../components/ui/BackButton'
import Avatar from '../components/ui/Avatar'

const icon = (path) => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
)

const chevron = (
  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const MenuItem = ({ to, iconPath, title, desc }) => (
  <Link to={to}
    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-300 transition-all">
    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
      {icon(iconPath)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
    {chevron}
  </Link>
)

const Parametres = () => {
  const { profile, signOut, switchAccount } = useAuth()
  const profilPath = profile?.role === 'prestataire' ? '/prestataire/profil' : '/client/profil'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
          <p className="text-gray-400 text-sm mt-1">Aide, informations légales et gestion de votre compte</p>
        </div>

        {/* Compte */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar url={profile?.avatar_url} nom={profile?.nom} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{profile?.nom}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
            <Link to={profilPath}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all flex-shrink-0">
              Mon profil
            </Link>
          </div>
        </div>

        {/* Aide & informations */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Aide & informations</p>
        <div className="space-y-3 mb-6">
          <MenuItem to="/app/centre-aide"
            iconPath="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            title="Centre d'aide" desc="Guides et explications pas à pas" />
          <MenuItem to="/app/faq"
            iconPath="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 17.25h.007v.008H12v-.008z"
            title="FAQ" desc="Questions fréquentes sur Alicia" />
          <MenuItem to="/app/contact"
            iconPath="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            title="Contacter le support" desc="contact.aliciasen@gmail.com" />
          <MenuItem to="/app/confidentialite"
            iconPath="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z"
            title="Politique de confidentialité" desc="Données collectées et vos droits" />
          <MenuItem to="/app/a-propos"
            iconPath="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            title="À propos d'Alicia" desc="Notre mission et nos valeurs" />
        </div>

        {/* Compte actions */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Compte</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <button onClick={switchAccount}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all border-b border-gray-100">
            Changer de compte
            {chevron}
          </button>
          <button onClick={signOut}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
            Se déconnecter
            {chevron}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Parametres
