import { Link } from 'react-router-dom'
import {
  Search, Star, Shield, MessageCircle, MapPin, CheckCircle,
  Briefcase, Users, TrendingUp, ArrowRight, Smartphone, Clock,
  Award, Zap
} from 'lucide-react'
import PublicHeader from '../components/layout/PublicHeader'
import PublicFooter from '../components/layout/PublicFooter'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      <PublicHeader />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Plateforme freelance du Sénégal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            Trouvez le bon talent,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              près de vous
            </span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Alicia connecte clients et prestataires de services informels au Sénégal.
            Recherche par proximité, vérification d'identité, messagerie intégrée et suivi de mission en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all text-sm">
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#fonctionnement"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all text-sm">
              Voir comment ça marche
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { value: '100%', label: 'Gratuit à l\'inscription' },
            { value: 'GPS', label: 'Recherche par proximité' },
            { value: 'CNI', label: 'Prestataires vérifiés' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="fonctionnement" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Comment ça marche ?</h2>
            <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
              De la création de compte à la mission validée, tout se fait en quelques étapes simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Pour les clients</p>
                  <p className="text-xs text-gray-400">Trouvez et gérez vos prestataires</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Users, title: 'Créez votre compte', desc: 'Inscription rapide en 3 étapes. Choisissez le rôle Client.' },
                  { icon: Search, title: 'Recherchez un prestataire', desc: 'Filtrez par métier, localisation, budget, proximité GPS ou certification.' },
                  { icon: Briefcase, title: 'Publiez ou assignez une mission', desc: 'Créez une mission publique ou assignez-la directement à un prestataire.' },
                  { icon: CheckCircle, title: 'Validez et notez', desc: 'Validez la livraison et laissez un avis pour renforcer la confiance.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                      <step.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all">
                Je suis client <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Pour les prestataires</p>
                  <p className="text-xs text-gray-400">Développez votre activité</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Users, title: 'Créez votre profil', desc: 'Renseignez vos compétences, tarifs et uploadez votre CNI pour être vérifié.' },
                  { icon: MapPin, title: 'Partagez votre position', desc: 'Enregistrez votre position GPS pour apparaître dans les recherches par proximité.' },
                  { icon: Zap, title: 'Acceptez les missions', desc: 'Postulez aux missions publiques ou acceptez celles qui vous sont assignées directement.' },
                  { icon: TrendingUp, title: 'Suivez vos statistiques', desc: 'Gains, missions par mois, note moyenne : tout est visible dans votre tableau de bord.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                      <step.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="mt-8 flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-900 transition-all">
                Je suis prestataire <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fonctionnalités</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Une plateforme complète pensée pour le marché sénégalais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: MapPin, title: 'Recherche par proximité', desc: 'Trouvez des prestataires autour de vous grâce à la géolocalisation GPS en temps réel.', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Shield, title: 'Vérification d\'identité', desc: 'Les prestataires vérifiés CNI obtiennent un badge bleu de confiance visible sur leur profil.', color: 'bg-blue-50 text-blue-600' },
            { icon: MessageCircle, title: 'Messagerie temps réel', desc: 'Communiquez directement avec votre client ou prestataire sans quitter la plateforme.', color: 'bg-violet-50 text-violet-600' },
            { icon: Briefcase, title: 'Gestion de missions', desc: 'Cycle de vie complet : création, acceptation, livraison, validation ou contestation.', color: 'bg-amber-50 text-amber-600' },
            { icon: Star, title: 'Système d\'avis', desc: 'Notes et commentaires post-mission pour évaluer la qualité des prestataires.', color: 'bg-orange-50 text-orange-600' },
            { icon: Smartphone, title: 'Application mobile PWA', desc: 'Installez Alicia sur votre mobile directement depuis votre navigateur, sans passer par un store.', color: 'bg-gray-100 text-gray-600' },
            { icon: TrendingUp, title: 'Statistiques détaillées', desc: 'Gains, missions par mois, note moyenne et répartition par catégorie pour les prestataires.', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Clock, title: 'Suivi en temps réel', desc: 'Tableau de bord de suivi avec timeline pour chaque mission en cours.', color: 'bg-blue-50 text-blue-600' },
            { icon: Search, title: 'Filtres avancés', desc: 'Filtrez par catégorie, localisation, budget, disponibilité, proximité ou certification CNI.', color: 'bg-violet-50 text-violet-600' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Prêt à rejoindre Alicia ?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Que vous soyez client ou prestataire, créez votre compte en moins de 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm">
              Créer mon compte <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-500 transition-all text-sm">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

export default LandingPage