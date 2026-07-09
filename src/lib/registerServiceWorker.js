export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  if (import.meta.env.DEV) {
    // En dev, on ne veut AUCUN service worker actif : un SW enregistré lors
    // d'un test précédent (ex: `npm run preview`) reste actif sur cette
    // origine et continue de servir des fichiers JS mis en cache (cache-first),
    // même après un rechargement forcé (Ctrl+Shift+R ne contourne pas un SW
    // déjà installé). On le désenregistre donc proactivement pour éviter de
    // déboguer un bug qui n'existe déjà plus dans le code.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
    })
    if (window.caches?.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
    }
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('SW registration failed:', err))
  })
}
