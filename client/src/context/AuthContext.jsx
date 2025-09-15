import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const api = axios.create({
  baseURL: 'http://192.168.1.168:8000/api/',
  withCredentials: true
})

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setupInterceptor()
    setLoading(false)
  }, [])

  const register = async (username, email, password) => {
    try {
      let res = await api.post('auth/register', { username, email, password })
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('auth/change-password', { currentPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
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

  const getNote = async (id) => {
    try {
      const res = await api.get(`notes/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const updateNote = async (id, title, content) => {
    try {
      const res = await api.put(`notes/${id}`, { title, content }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const updateNoteSettings = async (id, title, collaborators, tags) => {
    try {
      const res = await api.put(`notes/${id}`, { title, collaborators, tags }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const deleteNote = async (id) => {
    try {
      const res = await api.delete(`notes/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const createNote = async () => {
    try {
      const res = await api.post('notes', { title: "New Note", content: "", collaborators: [], tags: [] }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const getUsers = async (query) => {
    try {
      const res = await api.get(`users/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          q: query
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const getMyProfile = async () => {
    try {
      const res = await api.get('users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      if (error.response?.status === 404) {
        logout()
      }
      throw error
    }
  }

  const updateProfile = async (data) => {
    try {
      let config = {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
      let body = data;
      if (data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      const res = await api.put('users/me', body, config);
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  const deleteProfile = async (migrateNotes) => {
    try {
      let res;
      if (migrateNotes) {
        res = await api.delete('users/me?migrateNotes=true', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      } else {
        res = await api.delete('users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      }
      logout()
      return res.data
    } catch (error) {
      throw error
    }
  }

  const getNoteHistory = async (id) => {
    try {
      const res = await api.get(`/notes/${id}/versions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const getNoteVersion = async (noteId, versionId) => {
    try {
      const res = await api.get(`/notes/${noteId}/versions/${versionId}?type=full`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const revertNoteToVersion = async (noteId, versionId) => {
    try {
      const res = await api.post(`/notes/${noteId}/versions/${versionId}/revert`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return res.data
    } catch (error) {
      throw error
    }
  }

  const rebaseNoteToVersion = async (noteId, versionId) => {
    try {
      const res = await api.post(`/notes/${noteId}/versions/${versionId}/rebase`, {}, {
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
    <AuthContext.Provider value={{ login, logout, register, createNote, getNotes, getNote, updateNote, updateNoteSettings, deleteNote, getNoteHistory, getNoteVersion, revertNoteToVersion, rebaseNoteToVersion, getUsers, getMyProfile, updateProfile, deleteProfile, changePassword, accessToken, loading, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
