import { Link } from 'react-router-dom'
import InfoLayout from '../../components/layout/InfoLayout'

const APropos = () => {
  return (
    <InfoLayout title="À propos d'Alicia" subtitle="La plateforme freelance du Sénégal">

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Alicia est une plateforme de mise en relation entre particuliers et prestataires de
          services informels au Sénégal — développeurs, artisans, aides à domicile, réparateurs,
          et bien d'autres métiers. Notre objectif : rendre plus simple, plus rapide et plus sûr
          de trouver la bonne personne pour un besoin précis, où que l'on soit dans le pays.
        </p>

        <div>
          <h2 className="font-bold text-gray-900 text-sm mb-2">Notre mission</h2>
          <p>
            Beaucoup de services rendus au quotidien passent encore par le bouche-à-oreille, sans
            garantie de sérieux ni de disponibilité. Alicia structure cette mise en relation grâce
            à la recherche par proximité, la vérification d'identité des prestataires et un suivi
            clair de chaque mission, de la demande à la validation.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 text-sm mb-3">Ce qui nous guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-1">Proximité</p>
              <p className="text-xs text-gray-500">Recherche par géolocalisation pour trouver un prestataire près de chez soi.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-1">Confiance</p>
              <p className="text-xs text-gray-500">Vérification d'identité (CNI) et avis après chaque mission.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-1">Simplicité</p>
              <p className="text-xs text-gray-500">Inscription gratuite, messagerie intégrée, suivi de mission en temps réel.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 text-sm mb-2">Une plateforme en évolution</h2>
          <p>
            Alicia est encore une jeune plateforme et continue de s'améliorer avec les retours de
            ses utilisateurs, clients comme prestataires. Une remarque, une idée, un problème ?{' '}
            <Link to="/app/contact" className="text-gray-900 font-semibold hover:underline">Écrivez-nous</Link>.
          </p>
        </div>
      </div>
    </InfoLayout>
  )
}

export default APropos
