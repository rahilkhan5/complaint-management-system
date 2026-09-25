import { useCallback, useEffect, useMemo, useState } from 'react'
import { tokenStore } from '../api/client.js'
import { authApi } from '../api/services.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true while we check a saved token on first load
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()))

  // On first load, turn a saved token back into a logged in user
  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then((data) => setUser(data.user))
      // Only forget the token when the server rejects it, not when the server is just unreachable
      .catch((error) => {
        if (error.status === 401) tokenStore.clear()
      })
      .finally(() => setChecking(false))
  }, [])

  // The API client fires this when the server says the token is no longer valid
  useEffect(() => {
    const handleExpired = () => setUser(null)
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (form) => {
    const data = await authApi.register(form)
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, checking, login, register, logout }),
    [user, checking, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
