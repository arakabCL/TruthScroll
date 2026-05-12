import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [remoteProgress, setRemoteProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Boot: if a token exists, try to restore the session
  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!getToken()) { setLoading(false); return }
      try {
        const { user: u, progress } = await api.me()
        if (cancelled) return
        setUser(u)
        setRemoteProgress(progress)
      } catch {
        setToken(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  const finishLogin = useCallback(async (data) => {
    setToken(data.token)
    setUser(data.user)
    try {
      const { progress } = await api.me()
      setRemoteProgress(progress)
    } catch {
      setRemoteProgress(null)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    setError(null)
    try {
      const data = await api.login(username.trim(), password)
      await finishLogin(data)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [finishLogin])

  const signup = useCallback(async (username, password) => {
    setError(null)
    try {
      const data = await api.signup(username.trim(), password)
      await finishLogin(data)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [finishLogin])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setRemoteProgress(null)
    setError(null)
  }, [])

  const syncProgress = useCallback(async (progress) => {
    if (!user) return null
    try {
      const { progress: p } = await api.syncProgress(progress)
      setRemoteProgress(p)
      return p
    } catch (e) {
      // Network blips shouldn't break the game — keep local state
      console.warn('progress sync failed:', e.message)
      return null
    }
  }, [user])

  // Stable identity so consumers that depend on it in effects don't loop
  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(() => ({
    user,
    remoteProgress,
    loading,
    error,
    login,
    signup,
    logout,
    syncProgress,
    clearError,
  }), [user, remoteProgress, loading, error, login, signup, logout, syncProgress, clearError])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}
