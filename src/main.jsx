import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/index'
import InstallPrompt from './components/ui/InstallPrompt'
import { registerServiceWorker } from './lib/registerServiceWorker'
import './index.css'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
      <InstallPrompt />
    </AuthProvider>
  </React.StrictMode>
)