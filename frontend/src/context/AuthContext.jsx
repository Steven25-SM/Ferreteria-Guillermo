import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      return response.data
    } catch {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    setUser(response.data)
    return response.data
  }

  const updatePhone = async (phone) => {
    const response = await api.put('/auth/phone', { phone })
    setUser(response.data)
    return response.data
  }

  const updateProfile = async (payload) => {
    const response = await api.put('/auth/profile', payload)
    setUser(response.data)
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updatePhone, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
