/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Verificar si hay una sesión activa al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('session_token')
      const userData = localStorage.getItem('userData')
      if (token && userData) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/validar-sesion`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.valida) {
              setIsAuthenticated(true)
              setUser(JSON.parse(userData))
            } else {
              localStorage.removeItem('session_token')
              localStorage.removeItem('userData')
              localStorage.removeItem('isAuthenticated')
            }
          } else {
            localStorage.removeItem('session_token')
            localStorage.removeItem('userData')
            localStorage.removeItem('isAuthenticated')
          }
        } catch (error) {
          console.error('Error al validar sesión:', error)
          localStorage.removeItem('session_token')
          localStorage.removeItem('userData')
          localStorage.removeItem('isAuthenticated')
        }
      }
      setLoading(false)
    }

    verificarSesion()
  }, [])

  const login = async (usuario, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Guardar el token
        localStorage.setItem('session_token', data.token)
        console.log('Login exitoso, token guardado')
        
        // Guardar datos del usuario
        const userData = {
          usuario: data.usuario,
          nombre: data.nombre,
          perfil: data.perfil
        }
        
        setIsAuthenticated(true)
        setUser(userData)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userData', JSON.stringify(userData))
        
        return { success: true, data }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          success: false, 
          error: errorData.mensaje || errorData.message || 'Usuario o contraseña incorrectos' 
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      return { 
        success: false, 
        error: 'Error de conexión. Por favor, intente nuevamente.' 
      }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('session_token')
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem('session_token')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userData')
    }
  }

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
