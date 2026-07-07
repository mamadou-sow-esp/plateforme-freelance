import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Stockage custom en sessionStorage au lieu de localStorage
// → chaque onglet a sa propre session indépendante
const sessionStorageAdapter = {
  getItem: (key) => {
    return sessionStorage.getItem(key)
  },
  setItem: (key, value) => {
    sessionStorage.setItem(key, value)
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})