import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((currentUser) => active && setUser(currentUser))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const currentUser = await authApi.login(credentials)
        setUser(currentUser)
        return currentUser
      },
      async register(details) {
        const currentUser = await authApi.register(details)
        setUser(currentUser)
        return currentUser
      },
      async logout() {
        try {
          await authApi.logout()
        } finally {
          setUser(null)
        }
      },
      updateUser(nextUser) {
        setUser(nextUser)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
