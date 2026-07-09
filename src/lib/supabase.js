import { createClient } from '@supabase/supabase-js'
import { createMultiAccountStorage } from './multiAccountStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Stockage multi-comptes : les sessions sont persistées dans localStorage
// (elles survivent à la fermeture du navigateur) mais chaque onglet garde
// son propre compte "actif" via sessionStorage, ce qui permet à deux
// comptes différents d'être connectés simultanément dans deux onglets.
// Voir src/lib/multiAccountStorage.js pour le détail.
//
// IMPORTANT : par défaut, supabase-js resynchronise automatiquement tous les
// onglets entre eux via un BroadcastChannel interne nommé d'après
// `storageKey` (pratique pour un seul compte partagé, mais ça détruit le
// multi-compte : changer de compte dans un onglet "contaminerait" les
// autres onglets ouverts). On donne donc à chaque onglet une storageKey
// unique pour que ce canal de synchronisation ne soit jamais partagé entre
// onglets, et que chacun reste totalement indépendant.
const tabStorageKey = `sb-alicia-auth-${Math.random().toString(36).slice(2)}-${Date.now()}`

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // On lie l'adaptateur à CETTE storageKey précise : lui seul route vers la
    // logique multi-comptes ; toute autre clé technique (ex: code-verifier PKCE)
    // passe par un stockage normal, propre à cet onglet. Voir multiAccountStorage.js.
    storage: createMultiAccountStorage(tabStorageKey),
    storageKey: tabStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})