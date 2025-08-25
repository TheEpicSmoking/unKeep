import { useAuth } from '../context/AuthContext';
import { Stack, Button, ButtonBase} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import CustomAvatar from '../components/CustomAvatar.jsx';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'
import ErrorLog from '../components/ErrorLog';

export default function MyProfile() {
  const { getMyProfile, updateProfile} = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  const [errors, setErrors] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const profile = await getMyProfile()
      setUser(profile)
      setAvatar(profile.profilePicture)
      setAvatarFile(null)
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErrors(error)
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    const username = document.getElementById('username').value
    const email = document.getElementById('email').value

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('avatar', avatarFile);
        await updateProfile(formData);
      } else {
        await updateProfile({ username, email });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordClick = () => {
    navigate('/me/change-password')
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AuthFormWrapper title="My Profile" logo={false}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <ButtonBase component="label" tabIndex={-1} sx={{ pr: "20px", pb: "20px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CustomAvatar src={avatar} alt={user?.username} variant="square" color="white" sx={{ height: 255, width: 255, maxWidth: '100%', outline: 3, boxShadow: "20px 20px 0px 0px", outlineColor: 'primary.main', color: 'primary.main' }}/>
            <input
              type="file"
              accept="image/*"
              style={{
                border: 0,
                clip: 'rect(0 0 0 0)',
                height: '1px',
                margin: '-1px',
                overflow: 'hidden',
                padding: 0,
                position: 'absolute',
                whiteSpace: 'nowrap',
                width: '1px',
              }}
              onChange={handleAvatarChange}
            />
        </ButtonBase>
        <Stack direction="column" sx={{ flex: 1, justifyContent: 'start-flex' }}>
          <FormField id="username" label="Username" autoComplete="username" defaultValue={user?.username} sx={{borderRadius: 0, mt:0}}></FormField>
          <FormField id="email" label="Email" autoComplete="email" defaultValue={user?.email}></FormField>
          <Button variant="filled" sx={{ borderRadius: 0, mt:4, width: "100%", backgroundColor: 'primary.main', color: 'text.tertiary' }} onClick={handlePasswordClick} disabled={loading}>Change Password</Button>
        </Stack>
      </Stack>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ borderRadius: 0, mt: 4, width: "100%" }} onClick={handleSubmit} disabled={loading}>Update Profile</Button>
    </AuthFormWrapper>
  );
}