"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token") || getTokenFromUrl()

      if (token) {
        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        try {
          const response = await axios.get("/api/auth/me")
          setUser(response.data)
        } catch (error) {
          console.error("Auth initialization error:", error)
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")
    if (token) {
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    return token
  }

  const login = (userData, token) => {
    localStorage.setItem("token", token)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
      setUser(null)
      window.location.href = "/login"
    }
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
