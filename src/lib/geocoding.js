// Géocodage inversé : convertit des coordonnées GPS en adresse lisible
// Utilise l'API gratuite BigDataCloud (pas de clé requise, pensée pour un usage côté client)
export async function reverseGeocode(latitude, longitude) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
    )
    if (!res.ok) return null
    const data = await res.json()

    const quartier = data.locality || null
    const ville = data.city || data.principalSubdivision || null

    if (quartier && ville && quartier !== ville) return `${ville}, ${quartier}`
    return quartier || ville || null
  } catch {
    return null
  }
}
