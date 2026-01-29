import * as React from 'react'

import { clearSelectedRole } from '../../services/storage/roleStorage'
import { clearToken, getToken, setToken } from '../../services/storage/tokenStorage'
import { refreshAccessToken } from '../../services/auth/authClient'


type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  signIn: (token: string, opts?: { persist?: boolean }) => void
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(() => getToken())

  const signIn = React.useCallback((newToken: string, opts?: { persist?: boolean }) => {
    setToken(newToken, opts)
    setTokenState(newToken)
  }, [])

  const signOut = React.useCallback(async () => {
    // Server sign out removed
    const currentToken = getToken()
    if (currentToken) {
      // logic removed
    }

    clearToken()
    clearSelectedRole()
    setTokenState(null)
  }, [])


  const refresh = React.useCallback(async () => {
    const newToken = await refreshAccessToken()
    if (newToken) {
      setTokenState(newToken)
      // setToken is handled inside refreshAccessToken
    } else {
      // If refresh fails, we might want to sign out, or just leave it expired
      // Usually better to sign out if we can't refresh
      setTokenState(null)
      // We don't call signOut() here to avoid infinite loops or side effects, 
      // but clearToken logic is in refreshAccessToken catch block usually? 
      // authClient.refreshAccessToken calls clearToken() on error.
    }
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({ token, isAuthenticated: Boolean(token), signIn, signOut, refresh }),
    [signIn, signOut, refresh, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider />')
  return ctx
}
