import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router'
import FormWrapper from '../components/FormWrapper.jsx'
import FormField from '../components/FormField'
import ErrorLog from '../components/ErrorLog'

export default function SignUp() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [passwordValue, setPasswordValue] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)
    const usernamemail = document.getElementById('username').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
      await register(usernamemail, email, password)
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
      <FormWrapper title="Sign Up" onClose={() => navigate("/")}>
        <FormField id="username" label="Username" autoComplete="username" placeholder="Es. JohnDoe" />
        <FormField id="email" label="Email" autoComplete="email" placeholder="your@email.com" />      
        <FormField type="password" value={passwordValue} onChange={e => setPasswordValue(e.target.value)} />
        <ErrorLog errors={errors} />
        <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={handleSubmit} disabled={loading}>
          <Typography variant="button" sx={{ textTransform: 'none' }}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Typography>
        </Button>
        <Typography variant="subtitle1" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link className="link" to="/login">Log In</Link>
        </Typography>
      </FormWrapper>
  )
}
