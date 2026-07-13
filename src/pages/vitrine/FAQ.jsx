import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'

const faqs = [
  {
    q: 'Est-ce que Alicia est gratuit ?',
    a: "Oui, l'inscription et l'utilisation de la plateforme sont entièrement gratuites pour les clients comme pour les prestataires.",
  },
  {
    q: 'Comment fonctionne la vérification CNI ?',
    a: "Le prestataire uploade une photo ou un scan de sa CNI depuis son profil. L'équipe Alicia examine le document et attribue un badge vérifié visible sur son profil si tout est conforme.",
  },
  {
    q: 'Puis-je utiliser Alicia sur mon téléphone ?',
    a: "Oui, Alicia est une Progressive Web App (PWA). Vous pouvez l'installer directement depuis votre navigateur mobile, sans passer par le Play Store ou l'App Store.",
  },
  {
    q: 'Comment fonctionne le système de mission ?',
    a: "Un client peut publier une mission publique ou l'assigner directement à un prestataire. Le prestataire peut accepter, refuser ou négocier le prix avant que la mission ne commence.",
  },
  {
    q: 'La messagerie est-elle sécurisée ?',
    a: 'Oui, la messagerie est intégrée à la plateforme et fonctionne en temps réel. Les conversations sont privées entre le client et le prestataire concernés.',
  },
  {
    q: 'Comment sont calculées les notes des prestataires ?',
    a: "Après chaque mission validée, le client peut laisser une note de 1 à 5 étoiles et un commentaire. La note moyenne est automatiquement recalculée et affichée sur le profil du prestataire.",
  },
  {
    q: 'Puis-je changer mon compte de client à prestataire (ou l\'inverse) ?',
    a: "Ce n'est pas automatique depuis l'application. Il suffit d'écrire au support avec l'email du compte et le rôle souhaité, l'équipe s'en occupe manuellement.",
  },
]

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">FAQ</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Questions fréquentes</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Tout ce qu'il faut savoir avant de se lancer sur Alicia.
        </p>
      </section>

      <section className="px-4 md:px-6 max-w-3xl mx-auto pb-24">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Vous ne trouvez pas de réponse ?{' '}
            <Link to="/contact" className="text-gray-900 font-semibold hover:underline">Contactez le support</Link>
            {' '}ou consultez le{' '}
            <Link to="/centre-aide" className="text-gray-900 font-semibold hover:underline">Centre d'aide</Link>
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default FAQPage
