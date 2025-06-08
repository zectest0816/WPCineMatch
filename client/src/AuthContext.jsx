"use client"

// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is logged in when the app starts
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")

    // If email exists, user is logged in (we'll get userId later when needed)
    if (userEmail) {
      setIsLoggedIn(true)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
  }

  return <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
