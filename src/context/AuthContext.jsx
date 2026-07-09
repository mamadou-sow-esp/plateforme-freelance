import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { saveAccountProfile, clearActiveAccountForThisTab } from '../lib/multiAccountStorage'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
      if (data) {
        // Alimente le sélecteur de compte (nom/avatar/rôle affichés au switch)
        saveAccountProfile(userId, {
          nom: data.nom,
          email: data.email,
          avatar_url: data.avatar_url,
          role: data.role,
        })
      }
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }, [])

  useEffect(() => {
    // Récupère la session persistée dans le localStorage
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('initAuth error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Ne déconnecte pas le compte (il reste enregistré sur le navigateur),
  // libère juste cet onglet pour afficher le sélecteur de compte.
  const switchAccount = () => {
    clearActiveAccountForThisTab()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, switchAccount, fetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)