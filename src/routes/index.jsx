import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Pages auth
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// Pages client
import ClientDashboard from '../pages/client/Dashboard'
import RechercherPrestataire from '../pages/client/RechercherPrestataire'
import CreerMission from '../pages/client/CreerMission'
import MessMissions from '../pages/client/MesMissions'

// Pages prestataire
import PrestataireDashboard from '../pages/prestataire/Dashboard'
import RechercherMission from '../pages/prestataire/RechercherMission'
import MonProfil from '../pages/prestataire/MonProfil'

// Pages admin
import AdminDashboard from '../pages/admin/Dashboard'

// Route protégée
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect selon le rôle */}
        <Route path="/" element={
          !user ? <Navigate to="/login" replace /> :
          profile?.role === 'client' ? <Navigate to="/client/dashboard" replace /> :
          profile?.role === 'prestataire' ? <Navigate to="/prestataire/dashboard" replace /> :
          <Navigate to="/admin/dashboard" replace />
        } />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/rechercher" element={
          <ProtectedRoute allowedRoles={['client']}>
            <RechercherPrestataire />
          </ProtectedRoute>
        } />
        <Route path="/client/creer-mission" element={
          <ProtectedRoute allowedRoles={['client']}>
            <CreerMission />
          </ProtectedRoute>
        } />
        <Route path="/client/missions" element={
          <ProtectedRoute allowedRoles={['client']}>
            <MessMissions />
          </ProtectedRoute>
        } />

        {/* Prestataire */}
        <Route path="/prestataire/dashboard" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <PrestataireDashboard />
          </ProtectedRoute>
        } />
        <Route path="/prestataire/missions" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <RechercherMission />
          </ProtectedRoute>
        } />
        <Route path="/prestataire/profil" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <MonProfil />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes