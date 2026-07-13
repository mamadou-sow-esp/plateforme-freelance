import { Link } from 'react-router-dom'
import BackButton from '../ui/BackButton'
import logo from '../../assets/logo.png'

const InfoLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-16 flex items-center">
          <Link to="/">
            <img src={logo} alt="Alicia" className="h-9 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8">
        <BackButton />

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-4 text-center">
        <p className="text-xs text-gray-400">© 2026 Alicia — By KEBA FOUNDATION</p>
      </footer>
    </div>
  )
}

export default InfoLayout
