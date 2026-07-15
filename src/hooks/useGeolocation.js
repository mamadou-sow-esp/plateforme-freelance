import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const useGeolocation = (profileId, autoSave = false) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const watchIdRef = useRef(null)
  const lastSaveRef = useRef(null)

  const saveToDatabase = async (lat, lon) => {
    if (!profileId) return
    // Évite de sauvegarder trop souvent (max 1 fois par 30 secondes)
    const now = Date.now()
    if (lastSaveRef.current && now - lastSaveRef.current < 30000) return
    lastSaveRef.current = now

    await supabase
      .from('profiles')
      .update({ latitude: lat, longitude: lon })
      .eq('id', profileId)
  }

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur')
      return
    }

    setLoading(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const newLocation = { lat: latitude, lon: longitude, accuracy }
        setLocation(newLocation)
        setLoading(false)

        if (autoSave) {
          await saveToDatabase(latitude, longitude)
        }
      },
      (err) => {
        setLoading(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permission refusée. Activez la localisation dans les paramètres.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Position indisponible.')
            break
          case err.TIMEOUT:
            setError('Délai dépassé. Réessayez.')
            break
          default:
            setError('Erreur de géolocalisation.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const saveManually = async () => {
    if (!location || !profileId) return
    lastSaveRef.current = null // Force la sauvegarde
    await saveToDatabase(location.lat, location.lon)
  }

  useEffect(() => {
    return () => stopWatching()
  }, [])

  return {
    location,
    error,
    loading,
    startWatching,
    stopWatching,
    saveManually,
    isWatching: watchIdRef.current !== null,
  }
}

export default useGeolocation