import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'

const APropos = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">À propos</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">À propos d'Alicia</h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Alicia est une plateforme de mise en relation entre particuliers et prestataires de
          services informels au Sénégal — développeurs, artisans, aides à domicile, réparateurs,
          et bien d'autres métiers.
        </p>
      </section>

      <section className="px-4 md:px-6 max-w-3xl mx-auto pb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-10 text-sm text-gray-600 leading-relaxed space-y-6">
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-2">Notre mission</h2>
            <p>
              Beaucoup de services rendus au quotidien passent encore par le bouche-à-oreille, sans
              garantie de sérieux ni de disponibilité. Alicia structure cette mise en relation grâce
              à la recherche par proximité, la vérification d'identité des prestataires et un suivi
              clair de chaque mission, de la demande à la validation.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-2">Une plateforme en évolution</h2>
            <p>
              Alicia est encore une jeune plateforme et continue de s'améliorer avec les retours de
              ses utilisateurs, clients comme prestataires. Une remarque, une idée, un problème ?{' '}
              <Link to="/contact" className="text-gray-900 font-semibold hover:underline">Écrivez-nous</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 max-w-6xl mx-auto pb-24">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Ce qui nous guide</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-base font-bold text-gray-900 mb-2">Proximité</p>
            <p className="text-sm text-gray-500 leading-relaxed">Recherche par géolocalisation pour trouver un prestataire près de chez soi.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-base font-bold text-gray-900 mb-2">Confiance</p>
            <p className="text-sm text-gray-500 leading-relaxed">Vérification d'identité (CNI) et avis après chaque mission.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-base font-bold text-gray-900 mb-2">Simplicité</p>
            <p className="text-sm text-gray-500 leading-relaxed">Inscription gratuite, messagerie intégrée, suivi de mission en temps réel.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default APropos
