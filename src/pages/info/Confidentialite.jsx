import { Link } from 'react-router-dom'
import InfoLayout from '../../components/layout/InfoLayout'

const SUPPORT_EMAIL = 'contact.aliciasen@gmail.com'

const Section = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h2 className="font-bold text-gray-900 text-sm mb-2">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
)

const Confidentialite = () => {
  return (
    <InfoLayout
      title="Politique de confidentialité"
      subtitle="Dernière mise à jour : juillet 2026">

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
          <li>Vous envoyer des notifications liées à votre activité (nouvelle mission, changement de statut, nouveau message, vérification de CNI)</li>
        </ul>
      </Section>

      <Section title="4. Partage des données">
        <p>
          Nous ne vendons ni ne louons vos données à des tiers. Elles sont partagées uniquement
          avec les prestataires techniques nécessaires au fonctionnement d'Alicia :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Supabase : hébergement de la base de données, de l'authentification et des fichiers (CNI, CV, photos)</li>
          <li>Resend : envoi des emails transactionnels (notifications, réinitialisation de mot de passe)</li>
          <li>Vercel : hébergement du site</li>
        </ul>
        <p>Ces partenaires n'utilisent vos données que pour exécuter ces services, pas à des fins publicitaires.</p>
      </Section>

      <Section title="5. Conservation des données">
        <p>
          Vos données sont conservées tant que votre compte est actif. Si vous demandez la suppression
          de votre compte, vos informations personnelles et documents (CNI, CV) sont supprimés dans
          un délai raisonnable, sauf obligation légale de conservation.
        </p>
      </Section>

      <Section title="6. Sécurité">
        <p>
          L'accès à vos données est protégé par des règles de sécurité au niveau de la base de données
          (chaque utilisateur ne peut voir que ce qui le concerne), un chiffrement des mots de passe,
          et des documents d'identité stockés dans un espace privé, non accessible publiquement.
        </p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données
          personnelles en nous écrivant à{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>.
          La plupart des informations de profil restent modifiables directement depuis votre espace
          "Mon profil".
        </p>
      </Section>

      <Section title="8. Cookies et stockage local">
        <p>
          Alicia utilise le stockage local de votre navigateur uniquement pour maintenir votre session
          connectée. Nous n'utilisons pas de cookies publicitaires ou de traceurs tiers à des fins marketing.
        </p>
      </Section>

      <Section title="9. Modifications de cette politique">
        <p>
          Cette politique peut évoluer avec les fonctionnalités de la plateforme. La date de dernière
          mise à jour est indiquée en haut de cette page.
        </p>
      </Section>

      <Section title="10. Nous contacter">
        <p>
          Pour toute question sur cette politique ou vos données personnelles :{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-900 font-semibold hover:underline">{SUPPORT_EMAIL}</a>
          {' '}ou via la page{' '}
          <Link to="/app/contact" className="text-gray-900 font-semibold hover:underline">Contact</Link>.
        </p>
      </Section>
    </InfoLayout>
  )
}

export default Confidentialite
