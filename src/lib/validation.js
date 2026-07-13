// Validation basique du format email côté client (juste pour guider
// l'utilisateur visuellement — la vraie validation reste côté serveur).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value) => EMAIL_REGEX.test(String(value || '').trim())
