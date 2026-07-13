import { Link } from 'react-router-dom'
import InfoLayout from '../../components/layout/InfoLayout'

const SUPPORT_EMAIL = 'contact.aliciasen@gmail.com'

const Guide = ({ icon, title, children }) => (
  <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
      <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
)

const icon = (path) => (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
)

const CentreAide = () => {
  return (
    <InfoLayout title="Centre d'aide" subtitle="Guides pratiques pour bien utiliser Alicia">

      <Guide icon={icon('M12 4.5v15m7.5-7.5h-15')} title="Créer un compte client ou prestataire">
        <p>
          Depuis "S'inscrire", renseignez vos informations, choisissez votre rôle (client ou
          prestataire), puis confirmez votre email via le lien reçu avant de créer votre mot de passe.
          Photo de profil, localisation et informations d'activité peuvent être complétées tout de
          suite après ou plus tard dans "Mon profil".
        </p>
      </Guide>

      <Guide icon={icon('M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z')} title="Vérification d'identité (CNI)">
        <p>
          Les prestataires peuvent uploader leur CNI depuis "Mon profil" pour obtenir un badge vérifié.
          Le document est examiné par l'équipe Alicia. Une fois vérifiée, la CNI ne peut plus être
          remplacée directement dans l'application — contactez le support pour toute correction.
        </p>
      </Guide>

      <Guide icon={icon('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')} title="Changer de type de compte (client ↔ prestataire)">
        <p>
          Ce changement n'est pas disponible en libre-service depuis l'application, pour éviter
          toute erreur sur les données déjà associées à votre compte (missions, avis, vérification CNI...).
        </p>
        <p>
          Pour passer d'un compte client à prestataire (ou l'inverse), écrivez au support à{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>{' '}
          en précisant l'email de votre compte et le rôle souhaité. L'équipe effectue le changement
          manuellement après vérification.
        </p>
      </Guide>

      <Guide icon={icon('M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25')} title="Publier ou assigner une mission">
        <p>
          En tant que client, créez une mission publique visible par tous les prestataires
          correspondants, ou assignez-la directement à un prestataire depuis son profil. Vous pouvez
          suivre l'avancement dans "Suivi des missions".
        </p>
      </Guide>

      <Guide icon={icon('M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z')} title="Messagerie">
        <p>
          Chaque mission a sa propre conversation entre le client et le prestataire concernés, en
          temps réel, accessible depuis "Messages".
        </p>
      </Guide>

      <Guide icon={icon('M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z')} title="Mot de passe oublié">
        <p>
          Depuis la page de connexion, cliquez sur "Mot de passe oublié ?" et suivez le lien reçu
          par email pour en choisir un nouveau.
        </p>
      </Guide>

      <div className="pt-5 text-center">
        <p className="text-sm text-gray-400">
          Vous ne trouvez pas ce que vous cherchez ?{' '}
          <Link to="/app/contact" className="text-gray-900 font-semibold hover:underline">Contactez le support</Link>
          {' '}ou consultez la{' '}
          <Link to="/app/faq" className="text-gray-900 font-semibold hover:underline">FAQ</Link>.
        </p>
      </div>
    </InfoLayout>
  )
}

export default CentreAide
