import { Link } from 'react-router-dom'
import InfoLayout from '../../components/layout/InfoLayout'

const faqs = [
  {
    q: 'Est-ce que Alicia est gratuit ?',
    a: "Oui, l'inscription et l'utilisation de la plateforme sont entièrement gratuites pour les clients comme pour les prestataires.",
  },
  {
    q: 'Comment fonctionne la vérification CNI ?',
    a: "Le prestataire uploade une photo ou un scan de sa CNI depuis son profil. L'équipe Alicia examine le document et attribue un badge vérifié visible sur son profil si tout est conforme. Une fois vérifiée, la CNI ne peut plus être remplacée directement — contactez le support en cas d'erreur.",
  },
  {
    q: 'Puis-je changer mon compte de client à prestataire (ou l\'inverse) ?',
    a: "Ce n'est pas automatique depuis l'application. Écrivez au support (contact.aliciasen@gmail.com) avec l'email de votre compte et le rôle souhaité, l'équipe s'en occupe manuellement.",
  },
  {
    q: 'Comment fonctionne le système de mission ?',
    a: "Un client peut publier une mission publique ou l'assigner directement à un prestataire. Le prestataire peut accepter, refuser ou négocier le prix avant que la mission ne commence.",
  },
  {
    q: 'Comment sont calculées les notes des prestataires ?',
    a: "Après chaque mission validée, le client peut laisser une note de 1 à 5 étoiles et un commentaire. La note moyenne est recalculée et affichée automatiquement sur le profil du prestataire.",
  },
  {
    q: 'La messagerie est-elle sécurisée ?',
    a: 'Oui, la messagerie est intégrée à la plateforme et fonctionne en temps réel. Les conversations sont privées entre le client et le prestataire concernés.',
  },
  {
    q: "J'ai oublié mon mot de passe, comment faire ?",
    a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?" et suivez le lien reçu par email pour en choisir un nouveau.',
  },
  {
    q: 'Puis-je utiliser Alicia sur mon téléphone ?',
    a: "Oui, Alicia est une Progressive Web App (PWA) : vous pouvez l'installer directement depuis votre navigateur mobile, sans passer par un store d'applications.",
  },
  {
    q: 'Comment supprimer mon compte ou mes données ?',
    a: 'Contactez le support à contact.aliciasen@gmail.com, votre demande sera traitée dans les meilleurs délais.',
  },
]

const FAQ = () => {
  return (
    <InfoLayout title="Questions fréquentes" subtitle="Les réponses aux questions les plus courantes sur Alicia">
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
              <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none flex-shrink-0">+</span>
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400">
          Vous ne trouvez pas de réponse ?{' '}
          <Link to="/app/contact" className="text-gray-900 font-semibold hover:underline">Contactez le support</Link>
        </p>
      </div>
    </InfoLayout>
  )
}

export default FAQ
