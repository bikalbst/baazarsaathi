import { createContext, useContext, useMemo, useState } from 'react'
import { apiRequest } from '../services/api'

const AUTH_STORAGE_KEY = 'bazaarsathi_auth'
const AuthContext = createContext(null)

function readStoredSession() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const storedSession = storage.getItem(AUTH_STORAGE_KEY)

      if (storedSession) {
        const session = JSON.parse(storedSession)

        if (session?.token && session?.user) {
          return session
        }
      }
    } catch {
      storage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  return null
}

function storeSession(session, remember) {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const login = async ({ email, password, remember }) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    const nextSession = response.data
    storeSession(nextSession, remember)
    setSession(nextSession)
    return nextSession.user
  }

  const register = async ({ name, email, password }) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    const nextSession = response.data
    storeSession(nextSession, true)
    setSession(nextSession)
    return nextSession.user
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }

  const value = useMemo(() => ({
    token: session?.token || null,
    user: session?.user || null,
    isAuthenticated: Boolean(session?.token && session?.user),
    login,
    register,
    logout,
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
