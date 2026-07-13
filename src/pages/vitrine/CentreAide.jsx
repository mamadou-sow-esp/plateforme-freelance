import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'

const SUPPORT_EMAIL = 'contact.aliciasen@gmail.com'

const icon = (path) => (
  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
)

const Guide = ({ iconPath, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
      {icon(iconPath)}
    </div>
    <h2 className="font-bold text-gray-900 text-base mb-2">{title}</h2>
    <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
  </div>
)

const CentreAidePage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Centre d'aide</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Comment pouvons-nous vous aider ?</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Guides pratiques pour bien démarrer et utiliser Alicia au quotidien.
        </p>
      </section>

      <section className="px-4 md:px-6 max-w-5xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Guide iconPath="M12 4.5v15m7.5-7.5h-15" title="Créer un compte">
            <p>
              Inscrivez-vous en choisissant votre rôle (client ou prestataire), confirmez votre email
              via le lien reçu, puis créez votre mot de passe. Photo de profil, localisation et
              informations d'activité peuvent être complétées tout de suite après ou plus tard.
            </p>
          </Guide>

          <Guide iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" title="Vérification d'identité (CNI)">
            <p>
              Les prestataires peuvent uploader leur CNI depuis leur profil pour obtenir un badge
              vérifié, gage de confiance auprès des clients. Le document est examiné par l'équipe Alicia.
            </p>
          </Guide>

          <Guide iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" title="Changer de type de compte">
            <p>
              Passer d'un compte client à prestataire (ou l'inverse) ne se fait pas en libre-service,
              pour protéger les données déjà associées à votre compte.
            </p>
            <p>
              Écrivez au support à{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>{' '}
              avec l'email de votre compte et le rôle souhaité : l'équipe effectue le changement manuellement.
            </p>
          </Guide>

          <Guide iconPath="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25" title="Publier ou assigner une mission">
            <p>
              Un client peut créer une mission publique visible par tous les prestataires
              correspondants, ou l'assigner directement à un prestataire depuis son profil.
            </p>
          </Guide>

          <Guide iconPath="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" title="Messagerie">
            <p>
              Chaque mission a sa propre conversation entre le client et le prestataire concernés,
              en temps réel.
            </p>
          </Guide>

          <Guide iconPath="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" title="Mot de passe oublié">
            <p>
              Depuis la page de connexion, cliquez sur "Mot de passe oublié ?" et suivez le lien reçu
              par email pour en choisir un nouveau.
            </p>
          </Guide>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Vous ne trouvez pas ce que vous cherchez ?{' '}
            <Link to="/contact" className="text-gray-900 font-semibold hover:underline">Contactez le support</Link>
            {' '}ou consultez la{' '}
            <Link to="/faq" className="text-gray-900 font-semibold hover:underline">FAQ</Link>
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default CentreAidePage
