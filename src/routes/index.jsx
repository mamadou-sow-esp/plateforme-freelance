import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LandingPage from '../pages/LandingPage'

// Auth
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ResetPassword from '../pages/auth/ResetPassword'
import ConfirmerInscription from '../pages/auth/ConfirmerInscription'
import CompleterProfil from '../pages/auth/CompleterProfil'

// Paramètres (espace connecté)
import Parametres from '../pages/Parametres'

// Pages d'info connectées, dans Paramètres (/app/...)
import FAQApp from '../pages/info/FAQ'
import CentreAideApp from '../pages/info/CentreAide'
import ConfidentialiteApp from '../pages/info/Confidentialite'
import AProposApp from '../pages/info/APropos'
import ContactApp from '../pages/info/Contact'

// Pages d'info vitrine (publiques, non connecté), depuis le footer de la landing
import FAQPublic from '../pages/vitrine/FAQ'
import CentreAidePublic from '../pages/vitrine/CentreAide'
import ConfidentialitePublic from '../pages/vitrine/Confidentialite'
import AProposPublic from '../pages/vitrine/APropos'
import ContactPublic from '../pages/vitrine/Contact'

// Client
import ClientDashboard from '../pages/client/Dashboard'
import RechercherPrestataire from '../pages/client/RechercherPrestataire'
import CreerMission from '../pages/client/CreerMission'
import MesMissions from '../pages/client/MesMissions'
import ClientMessages from '../pages/client/Messages'
import ProfilPrestataire from '../pages/client/ProfilPrestataire'
import MonProfilClient from '../pages/client/MonProfil'
import SuiviMissions from '../pages/client/SuiviMissions'

// Prestataire
import PrestataireDashboard from '../pages/prestataire/Dashboard'
import RechercherMission from '../pages/prestataire/RechercherMission'
import MonProfil from '../pages/prestataire/MonProfil'
import Statistiques from '../pages/prestataire/Statistiques'
import Historique from '../pages/prestataire/Historique'
import PrestataireMessages from '../pages/prestataire/Messages'

// Admin
import AdminDashboard from '../pages/admin/Dashboard'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

const AppRoutes = () => {
  const { user, profile } = useAuth()

  const getHome = () => {
    // Filet de sécurité : si un lien de réinitialisation de mot de passe
    // atterrit sur "/" (ex. Site URL Supabase mal configurée côté
    // dashboard), on redirige quand même vers la page dédiée au lieu
    // d'afficher la landing page ou le dashboard.
    if (window.location.hash.includes('type=recovery')) {
      return <Navigate to={`/reinitialiser-mot-de-passe${window.location.hash}`} replace />
    }
    if (window.location.hash.includes('type=signup') || window.location.hash.includes('type=magiclink')) {
      return <Navigate to={`/confirmer-inscription${window.location.hash}`} replace />
    }
    // Si pas connecté → landing page
    if (!user) return <LandingPage />
    // Si connecté → redirection selon le rôle
    if (profile?.role === 'client') return <Navigate to="/client/dashboard" replace />
    if (profile?.role === 'prestataire') return <Navigate to="/prestataire/dashboard" replace />
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <LandingPage />
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Landing page si non connecté, dashboard si connecté */}
        <Route path="/" element={getHome()} />

        {/* Page vitrine accessible directement */}
        <Route path="/accueil" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/confirmer-inscription" element={<ConfirmerInscription />} />
        <Route path="/completer-profil" element={
          <ProtectedRoute><CompleterProfil /></ProtectedRoute>
        } />

        {/* Pages d'information — vitrine, publiques (non connecté) */}
        <Route path="/faq" element={<FAQPublic />} />
        <Route path="/centre-aide" element={<CentreAidePublic />} />
        <Route path="/confidentialite" element={<ConfidentialitePublic />} />
        <Route path="/a-propos" element={<AProposPublic />} />
        <Route path="/contact" element={<ContactPublic />} />

        {/* Pages d'information — espace connecté, via Paramètres */}
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

        {/* Client */}
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

        {/* Prestataire */}
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

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        {/* 404 — redirige vers accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes