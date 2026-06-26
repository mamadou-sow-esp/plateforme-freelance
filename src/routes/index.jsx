import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Auth
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

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
    if (!user) return <Navigate to="/login" replace />
    if (profile?.role === 'client') return <Navigate to="/client/dashboard" replace />
    if (profile?.role === 'prestataire') return <Navigate to="/prestataire/dashboard" replace />
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={getHome()} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes