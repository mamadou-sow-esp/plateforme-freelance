import { supabase } from './supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

const MESSAGE_INAPPROPRIE = "Ce contenu a été détecté comme inapproprié (langage insultant ou déplacé). Merci de le reformuler."

/**
 * Insère un avis ou une mission après passage par la modération IA (edge function
 * "moderate-content"). Lance une Error avec un message utilisateur si le contenu
 * est jugé inapproprié, ou si l'insertion échoue pour une autre raison.
 *
 * @param {'avis'|'mission'} resource
 * @param {object} payload - les champs à insérer dans la table correspondante
 * @returns {Promise<object>} la ligne insérée
 */
export async function insertModere(resource, payload) {
  const { data, error } = await supabase.functions.invoke('moderate-content', {
    body: { resource, payload },
  })

  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => null)
    if (body?.error === 'contenu_inapproprie') {
      throw new Error(MESSAGE_INAPPROPRIE)
    }
    throw new Error(body?.error || 'Une erreur est survenue lors de l\'envoi.')
  }

  if (error) {
    throw new Error('Une erreur est survenue lors de l\'envoi. Réessaie dans un instant.')
  }

  if (data?.error) {
    throw new Error(data.error === 'contenu_inapproprie' ? MESSAGE_INAPPROPRIE : data.error)
  }

  return data?.data
}
