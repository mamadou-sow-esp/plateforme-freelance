// Composant réutilisable pour afficher le statut géoloc et sauvegarder la position du prestataire
import { useEffect } from 'react'
import useGeolocation from '../../hooks/useGeolocation'
import { useAuth } from '../../context/AuthContext'

const GeoWidget = ({ className = '' }) => {
  const { profile } = useAuth()
  // autoSave = true → sauvegarde les coordonnées du prestataire en base toutes les 30s
  const geo = useGeolocation(profile?.id, true)

  useEffect(() => {
    // Démarre automatiquement la géoloc dès que le prestataire ouvre son dashboard
    geo.startWatching()
    return () => geo.stopWatching()
  }, [])

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      geo.location ? 'bg-emerald-50 border-emerald-200'
      : geo.loading ? 'bg-amber-50 border-amber-200'
      : geo.error ? 'bg-red-50 border-red-200'
      : 'bg-gray-50 border-gray-200'
    } ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          geo.location ? 'bg-emerald-500 animate-pulse'
          : geo.loading ? 'bg-amber-400 animate-pulse'
          : geo.error ? 'bg-red-400'
          : 'bg-gray-300'
        }`} />
        <p className={`text-xs font-bold ${
          geo.location ? 'text-emerald-800'
          : geo.loading ? 'text-amber-700'
          : geo.error ? 'text-red-700'
          : 'text-gray-600'
        }`}>
          {geo.location ? 'Position partagée'
            : geo.loading ? 'Localisation...'
            : geo.error ? 'Localisation indisponible'
            : 'Position non partagée'}
        </p>
      </div>
      {geo.location && (
        <p className="text-xs text-emerald-600 leading-relaxed">
          Votre position est visible par les clients. Précision : {Math.round(geo.location.accuracy)} m.
        </p>
      )}
      {geo.error && (
        <div>
          <p className="text-xs text-red-500 leading-relaxed mb-2">{geo.error}</p>
          <button onClick={() => geo.startWatching()}
            className="text-xs text-red-600 font-semibold hover:underline">
            Réessayer
          </button>
        </div>
      )}
      {!geo.location && !geo.loading && !geo.error && (
        <div>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Partagez votre position pour apparaître dans les résultats des clients proches
          </p>
          <button onClick={() => geo.startWatching()}
            className="text-xs text-gray-700 font-semibold hover:underline">
            Activer la localisation
          </button>
        </div>
      )}
    </div>
  )
}

export default GeoWidget