import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router'
import AuthFormWrapper from '../components/AuthFormWrapper'
import FormField from '../components/FormField'
import ErrorLog from '../components/ErrorLog'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [passwordValue, setPasswordValue] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)
    const usernamemail = document.getElementById('usernamemail').value
    const password = document.getElementById('password').value

    try {
      await login(usernamemail, password)
      navigate('/')
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormWrapper title="Log In">
      <FormField id="usernamemail" label="Email or Username" autoComplete="email" />
      <FormField type="password" value={passwordValue} onChange={e => setPasswordValue(e.target.value)} />
      <ErrorLog errors={errors} />
      <Button variant="contained" sx={{ borderRadius: 0 }} fullWidth onClick={handleSubmit} disabled={loading}>
        <Typography variant="button" sx={{ textTransform: 'none' }}>
          {loading ? 'Logging in...' : 'Log In'}
        </Typography>
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account? <Link className='link' to="/register">Sign Up</Link>
      </Typography>
    </AuthFormWrapper>
  )
}
