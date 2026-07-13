import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'

const SUPPORT_EMAIL = 'contact.aliciasen@gmail.com'

const ContactPage = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Copie manuelle si l'API clipboard est indisponible
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Contacter le support</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Une question, un problème, une demande particulière ? On vous répond par email.
        </p>
      </section>

      <section className="px-4 md:px-6 max-w-2xl mx-auto pb-24">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 mb-6">
            <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Email support</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-bold text-gray-900 hover:underline break-all">
                {SUPPORT_EMAIL}
              </a>
            </div>
            <button onClick={handleCopy}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:border-gray-900 transition-all flex-shrink-0">
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <p>
              Pour toute question sur votre compte, une mission, un paiement ou un problème technique,
              écrivez-nous directement à l'adresse ci-dessus. Pensez à préciser l'email associé à votre
              compte Alicia et, si possible, une description claire de votre demande.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm font-semibold text-amber-800 mb-1">Vous voulez passer de client à prestataire (ou l'inverse) ?</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Ce changement ne se fait pas automatiquement depuis l'application. Écrivez-nous à{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">{SUPPORT_EMAIL}</a>{' '}
                avec l'email de votre compte et le rôle souhaité. Plus de détails dans le{' '}
                <Link to="/centre-aide" className="font-semibold underline">Centre d'aide</Link>.
              </p>
            </div>

            <p>
              Avant de nous écrire, un coup d'œil à la{' '}
              <Link to="/faq" className="text-gray-900 font-semibold hover:underline">FAQ</Link>{' '}
              ou au{' '}
              <Link to="/centre-aide" className="text-gray-900 font-semibold hover:underline">Centre d'aide</Link>{' '}
              peut parfois répondre à votre question plus rapidement.
            </p>

            <p className="text-xs text-gray-400">Délai de réponse habituel : sous 48h ouvrées.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default ContactPage
