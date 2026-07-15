import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// La landing page est le point d'entrée public le plus fréquent : on la garde
// en import direct (eager) pour qu'elle s'affiche sans délai supplémentaire.
// Toutes les autres pages sont chargées à la demande (lazy) : le navigateur ne
// télécharge le code d'une page qu'au moment où l'utilisateur y accède. Cela
// évite qu'un simple visiteur télécharge tout le code de l'app (dashboards,
// graphiques, messagerie…) dès le premier chargement.
import LandingPage from '../pages/LandingPage'

// Auth
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))
const ConfirmerInscription = lazy(() => import('../pages/auth/ConfirmerInscription'))
const CompleterProfil = lazy(() => import('../pages/auth/CompleterProfil'))

// Paramètres (espace connecté)
const Parametres = lazy(() => import('../pages/Parametres'))

// Pages d'info connectées, dans Paramètres (/app/...)
const FAQApp = lazy(() => import('../pages/info/FAQ'))
const CentreAideApp = lazy(() => import('../pages/info/CentreAide'))
const ConfidentialiteApp = lazy(() => import('../pages/info/Confidentialite'))
const AProposApp = lazy(() => import('../pages/info/APropos'))
const ContactApp = lazy(() => import('../pages/info/Contact'))

// Pages d'info vitrine (publiques, non connecté), depuis le footer de la landing
const FAQPublic = lazy(() => import('../pages/vitrine/FAQ'))
const CentreAidePublic = lazy(() => import('../pages/vitrine/CentreAide'))
const ConfidentialitePublic = lazy(() => import('../pages/vitrine/Confidentialite'))
const AProposPublic = lazy(() => import('../pages/vitrine/APropos'))
const ContactPublic = lazy(() => import('../pages/vitrine/Contact'))

// Client
const ClientDashboard = lazy(() => import('../pages/client/Dashboard'))
const RechercherPrestataire = lazy(() => import('../pages/client/RechercherPrestataire'))
const CreerMission = lazy(() => import('../pages/client/CreerMission'))
const MesMissions = lazy(() => import('../pages/client/MesMissions'))
const ClientMessages = lazy(() => import('../pages/client/Messages'))
const ProfilPrestataire = lazy(() => import('../pages/client/ProfilPrestataire'))
const MonProfilClient = lazy(() => import('../pages/client/MonProfil'))
const SuiviMissions = lazy(() => import('../pages/client/SuiviMissions'))

// Prestataire
const PrestataireDashboard = lazy(() => import('../pages/prestataire/Dashboard'))
const RechercherMission = lazy(() => import('../pages/prestataire/RechercherMission'))
const MonProfil = lazy(() => import('../pages/prestataire/MonProfil'))
const Statistiques = lazy(() => import('../pages/prestataire/Statistiques'))
const Historique = lazy(() => import('../pages/prestataire/Historique'))
const PrestataireMessages = lazy(() => import('../pages/prestataire/Messages'))

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))

// Affiché brièvement pendant le téléchargement du code d'une page à la demande.
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
  </div>
)

// Cle de session ou l'on retient la page que l'utilisateur voulait voir avant
// d'etre redirige vers /login (ex. un profil prestataire partage). Consommee
// par getHome() une fois connecte. sessionStorage => propre a cet onglet.
const POST_LOGIN_REDIRECT_KEY = 'alicia_post_login_redirect'

// N'autorise que des chemins internes ("/xxx"), jamais une URL absolue ou
// protocole-relative ("//evil.com"), pour eviter toute redirection ouverte.
const isSafeInternalPath = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile } = useAuth()
  const location = useLocation()
  if (!user) {
    // On garde la page demandee pour y revenir apres connexion.
    const wanted = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(wanted)}`} replace />
  }
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

const AppRoutes = () => {
  const { user, profile } = useAuth()

  const getHome = () => {
    if (window.location.hash.includes('type=recovery')) {
      return <Navigate to={`/reinitialiser-mot-de-passe${window.location.hash}`} replace />
    }
    if (window.location.hash.includes('type=signup') || window.location.hash.includes('type=magiclink')) {
      return <Navigate to={`/confirmer-inscription${window.location.hash}`} replace />
    }
    if (!user) return <LandingPage />
    // Connecte + profil charge : si une page etait demandee avant la connexion
    // (lien partage), on y va directement. On attend `profile` pour ne pas se
    // faire rediriger par ProtectedRoute pendant que le role se charge encore.
    if (profile) {
      const pending = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
      if (pending) {
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
        if (isSafeInternalPath(pending)) return <Navigate to={pending} replace />
      }
    }
    if (profile?.role === 'client') return <Navigate to="/client/dashboard" replace />
    if (profile?.role === 'prestataire') return <Navigate to="/prestataire/dashboard" replace />
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <LandingPage />
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>

          <Route path="/" element={getHome()} />

          <Route path="/accueil" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route path="/confirmer-inscription" element={<ConfirmerInscription />} />
          <Route path="/completer-profil" element={
            <ProtectedRoute><CompleterProfil /></ProtectedRoute>
          } />

          <Route path="/faq" element={<FAQPublic />} />
          <Route path="/centre-aide" element={<CentreAidePublic />} />
          <Route path="/confidentialite" element={<ConfidentialitePublic />} />
          <Route path="/a-propos" element={<AProposPublic />} />
          <Route path="/contact" element={<ContactPublic />} />

          <Route path="/app/faq" element={
            <ProtectedRoute><FAQApp /></ProtectedRoute>
          } />
          <Route path="/app/centre-aide" element={
            <ProtectedRoute><CentreAideApp /></ProtectedRoute>
          } />
          <Route path="/app/confidentialite" element={
            <ProtectedRoute><ConfidentialiteApp /></ProtectedRoute>
          } />
          <Route path="/app/a-propos" element={
            <ProtectedRoute><AProposApp /></ProtectedRoute>
          } />
          <Route path="/app/contact" element={
            <ProtectedRoute><ContactApp /></ProtectedRoute>
          } />

          <Route path="/client/dashboard" element={
            <ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>
          } />
          <Route path="/client/rechercher" element={
            <ProtectedRoute allowedRoles={['client']}><RechercherPrestataire /></ProtectedRoute>
          } />
          <Route path="/client/creer-mission" element={
            <ProtectedRoute allowedRoles={['client']}><CreerMission /></ProtectedRoute>
          } />
          <Route path="/client/missions" element={
            <ProtectedRoute allowedRoles={['client']}><MesMissions /></ProtectedRoute>
          } />
          <Route path="/client/messages" element={
            <ProtectedRoute allowedRoles={['client']}><ClientMessages /></ProtectedRoute>
          } />
          <Route path="/client/messages/:missionId" element={
            <ProtectedRoute allowedRoles={['client']}><ClientMessages /></ProtectedRoute>
          } />
          <Route path="/client/prestataire/:id" element={
            <ProtectedRoute allowedRoles={['client']}><ProfilPrestataire /></ProtectedRoute>
          } />
          <Route path="/client/profil" element={
            <ProtectedRoute allowedRoles={['client']}><MonProfilClient /></ProtectedRoute>
          } />
          <Route path="/client/suivi" element={
            <ProtectedRoute allowedRoles={['client']}><SuiviMissions /></ProtectedRoute>
          } />
          <Route path="/client/parametres" element={
            <ProtectedRoute allowedRoles={['client']}><Parametres /></ProtectedRoute>
          } />

          <Route path="/prestataire/dashboard" element={
            <ProtectedRoute allowedRoles={['prestataire']}><PrestataireDashboard /></ProtectedRoute>
          } />
          <Route path="/prestataire/missions" element={
            <ProtectedRoute allowedRoles={['prestataire']}><RechercherMission /></ProtectedRoute>
          } />
          <Route path="/prestataire/profil" element={
            <ProtectedRoute allowedRoles={['prestataire']}><MonProfil /></ProtectedRoute>
          } />
          <Route path="/prestataire/messages" element={
            <ProtectedRoute allowedRoles={['prestataire']}><PrestataireMessages /></ProtectedRoute>
          } />
          <Route path="/prestataire/messages/:missionId" element={
            <ProtectedRoute allowedRoles={['prestataire']}><PrestataireMessages /></ProtectedRoute>
          } />
          <Route path="/prestataire/statistiques" element={
            <ProtectedRoute allowedRoles={['prestataire']}><Statistiques /></ProtectedRoute>
          } />
          <Route path="/prestataire/historique" element={
            <ProtectedRoute allowedRoles={['prestataire']}><Historique /></ProtectedRoute>
          } />
          <Route path="/prestataire/parametres" element={
            <ProtectedRoute allowedRoles={['prestataire']}><Parametres /></ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRoutes
