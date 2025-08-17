import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'

const AuthContext = createContext()

const api = axios.create({
  baseURL: 'http://192.168.1.168:8000/api/',
  withCredentials: true
})

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setupInterceptor()
    setLoading(false)
  }, [])

  const register = async (username, email, password) => {
    try {
      let res = await api.post('auth/register', { username, email, password })
      const emailOrUsername = email
      res = await api.post('auth/login', { emailOrUsername, password })
      setAccessToken(res.data.accessToken)
      localStorage.setItem('accessToken', res.data.accessToken)
    } catch (error) {
      throw error
    }
  }

  const login = async (emailOrUsername, password) => {
    try {
      const res = await api.post('auth/login', { emailOrUsername, password })
      setAccessToken(res.data.accessToken)
      localStorage.setItem('accessToken', res.data.accessToken)
      /* SOLO IN PRODUZIONE */
      localStorage.setItem('refreshToken', res.data.refreshToken)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('accessToken')
      /* SOLO IN PRODUZIONE */
      localStorage.removeItem('refreshToken')
      setAccessToken(null)
    } catch (error) {
      throw error
    }
  }

  const refresh = async () => {
    try {
      const res = await api.post('auth/refresh', {
      /* SOLO IN PRODUZIONE */
        'refreshToken': `${localStorage.getItem('refreshToken')}`
    })
      setAccessToken(res.data.accessToken)
      localStorage.setItem('accessToken', res.data.accessToken)
      return res.data.accessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  // NOTES

  const getNotes = async () => {
    try {
      const res = await api.get('notes', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const createNote = async (title, content, collaborators, tags) => {
    try {
      const res = await api.post('notes', { title, content, collaborators, tags }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const getUsers = async (id) => {
    try {
      const res = await api.get(`users/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const setupInterceptor = () => {
    api.interceptors.response.use(
      res => res,
      async error => {
        const originalRequest = error.config
        originalRequest.__retry = false
        if (originalRequest.headers.Authorization && error.response?.status === 401 && !originalRequest._retry) {

          originalRequest._retry = true

          try {
            const newToken = await refresh()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          } catch (err) {
            logout()
            return Promise.reject(err)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  return (
    <AuthContext.Provider value={{ login, logout, register, createNote, getNotes, getUsers, accessToken, loading, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
