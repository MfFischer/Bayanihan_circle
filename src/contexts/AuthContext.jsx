import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth as authHelpers } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMemberData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMemberData(session.user.id)
      } else {
        setMember(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadMemberData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error loading member data:', error)
        // If member not found, it might be a new user - wait a moment and retry once
        if (error.code === 'PGRST116') {
          console.log('Member not found, retrying in 2 seconds...')
          await new Promise(resolve => setTimeout(resolve, 2000))

          const { data: retryData, error: retryError } = await supabase
            .from('members')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (retryError) {
            console.error('Retry failed:', retryError)
            setMember(null)
            setIsAdmin(false)
            setLoading(false)
            return
          }

          setMember(retryData)
          setIsAdmin(retryData?.role === 'admin')
          setLoading(false)
          return
        }

        setMember(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setMember(data)
      setIsAdmin(data?.role === 'admin')
    } catch (error) {
      console.error('Error loading member data:', error)
      setMember(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await authHelpers.signUp(email, password, userData)
      if (error) throw error

      // Member record is automatically created by database trigger
      // Wait a moment for the trigger to complete
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await loadMemberData(data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authHelpers.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await authHelpers.signOut()
      if (error) throw error
      setUser(null)
      setMember(null)
      setIsAdmin(false)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    member,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

