import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'

const SUPPORT_EMAIL = 'contact.aliciasen@gmail.com'

const Section = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h2 className="font-bold text-gray-900 text-base mb-2">{title}</h2>
    <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
  </div>
)

const ConfidentialitePage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Confidentialité</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Politique de confidentialité</h1>
        <p className="text-gray-500 text-sm">Dernière mise à jour : juillet 2026</p>
      </section>

      <section className="px-4 md:px-6 max-w-3xl mx-auto pb-24">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-10">

          <Section title="1. Introduction">
            <p>
              Alicia est une plateforme de mise en relation entre clients et prestataires de services
              au Sénégal. Cette page explique quelles données nous collectons, pourquoi, et comment
              elles sont utilisées et protégées.
            </p>
          </Section>

          <Section title="2. Données que nous collectons">
            <p>Selon votre usage de la plateforme, nous pouvons collecter :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Informations de compte : nom, email, téléphone, mot de passe (stocké de façon chiffrée)</li>
              <li>Informations de profil : photo, bio, localisation (texte et/ou position GPS)</li>
              <li>Pour les prestataires : métier, compétences, tarifs, pièce d'identité (CNI) pour la vérification, CV et liens professionnels facultatifs</li>
              <li>Contenu que vous créez : missions, messages échangés avec d'autres utilisateurs, avis laissés après une mission</li>
            </ul>
          </Section>

          <Section title="3. Pourquoi nous collectons ces données">
            <ul className="list-disc pl-5 space-y-1">
              <li>Créer et sécuriser votre compte</li>
              <li>Mettre en relation clients et prestataires (recherche par métier, localisation, proximité GPS)</li>
              <li>Vérifier l'identité des prestataires via la CNI (badge de confiance)</li>
              <li>Permettre la messagerie et le suivi des missions</li>
              <li>Vous envoyer des notifications liées à votre activité</li>
            </ul>
          </Section>

          <Section title="4. Partage des données">
            <p>
              Nous ne vendons ni ne louons vos données à des tiers. Elles sont partagées uniquement
              avec les prestataires techniques nécessaires au fonctionnement d'Alicia : Supabase
              (hébergement, base de données, fichiers), Resend (emails transactionnels) et Vercel
              (hébergement du site). Ces partenaires n'utilisent vos données que pour exécuter ces
              services, pas à des fins publicitaires.
            </p>
          </Section>

          <Section title="5. Conservation des données">
            <p>
              Vos données sont conservées tant que votre compte est actif. En cas de suppression de
              compte, vos informations personnelles et documents (CNI, CV) sont supprimés dans un
              délai raisonnable, sauf obligation légale de conservation.
            </p>
          </Section>

          <Section title="6. Sécurité">
            <p>
              L'accès à vos données est protégé par des règles de sécurité au niveau de la base de
              données, un chiffrement des mots de passe, et des documents d'identité stockés dans un
              espace privé, non accessible publiquement.
            </p>
          </Section>

          <Section title="7. Vos droits">
            <p>
              Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos
              données personnelles en écrivant à{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
          </Section>

          <Section title="8. Cookies et stockage local">
            <p>
              Alicia utilise le stockage local du navigateur uniquement pour maintenir votre session
              connectée. Pas de cookies publicitaires ni de traceurs tiers à des fins marketing.
            </p>
          </Section>

          <Section title="9. Nous contacter">
            <p>
              Pour toute question sur cette politique :{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>
              {' '}ou via la page{' '}
              <Link to="/contact" className="text-gray-900 font-semibold hover:underline">Contact</Link>.
            </p>
          </Section>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default ConfidentialitePage
