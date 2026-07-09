import { supabase } from './supabase'

// Le bucket "documents" (CNI + CV) est privé (voir audit sécurité) : les
// fichiers ne sont plus accessibles par URL publique fixe. Il faut générer
// une URL signée, valable un temps limité, à chaque affichage.

/**
 * Extrait le nom de fichier (chemin dans le bucket) à partir de la valeur
 * stockée en base. Gère aussi bien les anciennes URLs publiques
 * (https://.../storage/v1/object/public/documents/cni_xxx.png) que les
 * chemins bruts stockés depuis le passage du bucket en privé.
 */
export function extractDocPath(value) {
  if (!value) return null
  const parts = value.split('/')
  return parts[parts.length - 1] || null
}

/** Génère une URL signée temporaire pour un document privé (CNI/CV). */
export async function getSignedDocUrl(value, expiresIn = 3600) {
  const path = extractDocPath(value)
  if (!path) return null
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, expiresIn)
  if (error) {
    console.error('getSignedDocUrl error:', error)
    return null
  }
  return data?.signedUrl ?? null
}
