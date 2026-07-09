// Stockage de session multi-comptes pour Supabase.
//
// Objectif : permettre à plusieurs comptes différents de rester connectés en
// même temps sur le même navigateur (comme Google), tout en gardant les
// sessions persistantes (pas de reconnexion à chaque fermeture d'onglet).
//
// Principe :
// - Chaque session (token Supabase) est sauvegardée dans localStorage,
//   indexée par l'id de l'utilisateur. localStorage survit à la fermeture
//   du navigateur → la session ne se perd pas.
// - Chaque ONGLET retient dans sessionStorage quel compte il affiche
//   ("compte actif de cet onglet") → deux onglets peuvent donc afficher
//   deux comptes différents en simultané.
// - S'il n'y a qu'un seul compte enregistré, il est utilisé automatiquement
//   dans tout nouvel onglet (cas le plus courant, zéro friction). S'il y en
//   a plusieurs, l'onglet demande explicitement lequel utiliser (sélecteur
//   de compte affiché par AccountSwitcher).

const ACCOUNTS_KEY = 'alicia_saved_accounts'
const ACTIVE_KEY = 'alicia_active_account_id'

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}
  } catch {
    return {}
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function extractUserId(rawValue) {
  try {
    const parsed = JSON.parse(rawValue)
    return parsed?.user?.id || null
  } catch {
    return null
  }
}

/**
 * Fabrique un adaptateur de stockage à passer à createClient(...).auth.storage.
 *
 * IMPORTANT : GoTrue (supabase-js) n'utilise pas storage.getItem/setItem/removeItem
 * UNIQUEMENT pour la session principale (la clé `mainKey` = storageKey passé à
 * createClient). Il s'en sert aussi pour des clés techniques annexes, dérivées de
 * storageKey, par ex. `${storageKey}-code-verifier` (PKCE) ou `${storageKey}-user`.
 * En particulier, `_saveSession()` appelle SYSTÉMATIQUEMENT
 * `removeItem(storageKey + '-code-verifier')` au tout début de CHAQUE connexion,
 * inscription ou rafraîchissement de token — même quand ce flow PKCE n'est pas
 * utilisé et que cette clé n'a jamais été écrite.
 *
 * Le bug corrigé ici : l'ancienne implémentation ignorait totalement quelle clé
 * on lui demandait de supprimer et supprimait à chaque fois "le compte actif de
 * cet onglet" — donc CHAQUE connexion/rafraîchissement dans N'IMPORTE QUEL onglet
 * effaçait le compte actif de cet onglet du stockage partagé, avant même de le
 * réécrire. Comme le stockage des comptes est partagé entre onglets, ça pouvait
 * effacer le compte d'un AUTRE onglet quand deux onglets avaient auto-adopté le
 * même compte au chargement, ce qui donnait l'impression que les onglets se
 * "synchronisaient" l'un sur l'autre après un changement de compte.
 *
 * Le correctif : on ne route vers la logique multi-comptes QUE pour la clé
 * principale (mainKey). Toute autre clé est traitée comme un stockage normal,
 * propre à cet onglet (sessionStorage, sous son vrai nom), sans toucher aux
 * comptes enregistrés.
 */
export function createMultiAccountStorage(mainKey) {
  return {
    getItem: (key) => {
      if (key !== mainKey) {
        return sessionStorage.getItem(key)
      }

      const accounts = readAccounts()
      const ids = Object.keys(accounts)
      let activeId = sessionStorage.getItem(ACTIVE_KEY)

      if (activeId && !accounts[activeId]) activeId = null // pointeur obsolète

      if (!activeId) {
        if (ids.length === 1) {
          // Un seul compte connu sur ce navigateur → aucune ambiguïté, on l'utilise directement.
          activeId = ids[0]
          sessionStorage.setItem(ACTIVE_KEY, activeId)
        } else {
          // 0 ou plusieurs comptes : on laisse l'UI (AccountSwitcher) décider explicitement.
          return null
        }
      }

      return accounts[activeId]?.raw ?? null
    },

    setItem: (key, value) => {
      if (key !== mainKey) {
        sessionStorage.setItem(key, value)
        return
      }

      const userId = extractUserId(value)
      if (!userId) return
      const accounts = readAccounts()
      accounts[userId] = {
        ...(accounts[userId] || {}),
        raw: value,
        savedAt: Date.now(),
      }
      writeAccounts(accounts)
      sessionStorage.setItem(ACTIVE_KEY, userId)
    },

    removeItem: (key) => {
      if (key !== mainKey) {
        sessionStorage.removeItem(key)
        return
      }

      const activeId = sessionStorage.getItem(ACTIVE_KEY)
      if (activeId) {
        const accounts = readAccounts()
        delete accounts[activeId]
        writeAccounts(accounts)
      }
      sessionStorage.removeItem(ACTIVE_KEY)
    },
  }
}

/** Liste des comptes enregistrés sur ce navigateur, pour affichage dans le sélecteur. */
export function getSavedAccounts() {
  const accounts = readAccounts()
  return Object.entries(accounts).map(([id, data]) => ({
    id,
    nom: data.nom || 'Compte',
    email: data.email || '',
    avatar_url: data.avatar_url || null,
    role: data.role || null,
  }))
}

/** Enrichit un compte sauvegardé avec les infos de profil (pour l'affichage du switcher). */
export function saveAccountProfile(userId, { nom, email, avatar_url, role }) {
  if (!userId) return
  const accounts = readAccounts()
  if (!accounts[userId]) return // pas de session brute associée, rien à enrichir
  accounts[userId] = { ...accounts[userId], nom, email, avatar_url, role }
  writeAccounts(accounts)
}

export function getActiveAccountId() {
  return sessionStorage.getItem(ACTIVE_KEY)
}

export function setActiveAccountId(userId) {
  sessionStorage.setItem(ACTIVE_KEY, userId)
}

/** Libère cet onglet de son compte actif sans supprimer le compte du navigateur. */
export function clearActiveAccountForThisTab() {
  sessionStorage.removeItem(ACTIVE_KEY)
}
