import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'

const AuthContext = createContext()

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
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

  const signup = async (username, email, password) => {
    let res = await api.post('auth/register', { username, email, password })
    const emailOrUsername = email
    res = await api.post('auth/login', { emailOrUsername, password })
    setAccessToken(res.data.accessToken)
    localStorage.setItem('accessToken', res.data.accessToken)
  }

  const login = async (emailOrUsername, password) => {
    const res = await api.post('auth/login', { emailOrUsername, password })
    setAccessToken(res.data.accessToken)
    localStorage.setItem('accessToken', res.data.accessToken)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setAccessToken(null)
    navigate('/login')
  }

  const refresh = async () => {
    const res = await api.post('auth/refresh')
    setAccessToken(res.data.accessToken)
    localStorage.setItem('accessToken', res.data.accessToken)
    return res.data.accessToken
  }

  const createNote = async (title, content) => {
    const res = await api.post('notes', { title, content }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    return res.data
  }

  const setupInterceptor = () => {
    api.interceptors.response.use(
      res => res,
      async error => {
        const originalRequest = error.config
        originalRequest.__retry = true
        console.log('Error response:', error.response)
        console.log(originalRequest.__retry)
        if (error.response?.status === 401 && !originalRequest._retry) {

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
        return error
      }
    )
  }

  return (
    <AuthContext.Provider value={{ login, logout, signup, createNote, accessToken, loading, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
