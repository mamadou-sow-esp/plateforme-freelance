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
        // Un lien de réinitialisation de mot de passe atterrit avec
        // #...&type=recovery dans l'URL : la session qui en découle est
        // temporaire (juste pour poser un nouveau mot de passe), pas une
        // vraie connexion. On ne doit pas la refléter dans le contexte
        // global sous peine d'être redirigé direct vers le dashboard.
        if (window.location.hash.includes('type=recovery')) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // Filet de sécurité : sur certains réseaux (surtout au tout premier
        // chargement d'un nom de domaine, DNS/TLS pas encore "chauds"),
        // supabase.auth.getSession() peut rester bloqué anormalement
        // longtemps. Comme tout l'app attend que `loading` passe à false
        // pour s'afficher, un blocage ici = page blanche jusqu'au refresh.
        // On borne donc l'attente à 8s.
        const timeout = new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), 8000))
        const result = await Promise.race([
          supabase.auth.getSession().then((r) => ({ ...r, timedOut: false })),
          timeout,
        ])

        if (result.timedOut) {
          console.error('initAuth: getSession a expiré (8s), poursuite sans session')
          setUser(null)
          setProfile(null)
          return
        }

        const { data: { session } } = result

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

        // PASSWORD_RECOVERY établit une session Supabase temporaire (nécessaire
        // pour pouvoir appeler updateUser({ password })), mais ce n'est PAS une
        // vraie connexion : on ne doit surtout pas remplir le contexte global
        // (user/profile), sinon getHome() la traite comme un login et redirige
        // direct vers le dashboard au lieu de laisser la page de réinitialisation
        // s'afficher. La page ResetPassword gère cette session elle-même, en
        // direct via supabase.auth, indépendamment de ce contexte.
        if (event === 'PASSWORD_RECOVERY') {
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
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)