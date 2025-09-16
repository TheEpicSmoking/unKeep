import { useAuth } from '../context/AuthContext';
import { Stack, Button, DialogContentText, FormControlLabel, Checkbox} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import AvatarField from '../components/AvatarField.jsx';
import FormField from '../components/FormField';
import FormWrapper from '../components/FormWrapper.jsx'
import ErrorLog from '../components/ErrorLog';
import DeleteDialog from '../components/DeleteDialog.jsx';

export default function MyProfile() {
  const { getMyProfile, updateProfile, deleteProfile } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const profile = await getMyProfile()
      setUser(profile)
      setAvatar(profile.avatar)
      setAvatarFile(null)
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErrors(error)
    }
    finally {
      setLoading(false)
    }
  }

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
        setAvatarFile(null);
      } else {
        await updateProfile({ username, email, avatar });
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

  const handleAccountDelete = async () => {
    setLoading(true);
    try {
      await deleteProfile(document.getElementById('migrateNotes').checked);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    setErrors(null);
  }, []);

  return (
    <FormWrapper title="My Profile" logo={false} onClose={() => navigate("/")}>
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDelete={handleAccountDelete}
        title="Delete your account"
        description="Your data will be permanently deleted. What happens to your notes depends on the option below:"
        confirmLabel="To confirm, please type your username."
        compareValue={user?.username}
        confirmValue={confirmUsername}
        setConfirmValue={setConfirmUsername}
        extraContent={
          <>
            <FormControlLabel
              control={<Checkbox defaultChecked id="migrateNotes" />}
              label={`Give ownership of each note to its first collaborator if any. Be careful, note history will be lost.`}
            />
            <DialogContentText sx={{ color: 'text.hint', pl: "30px" }}>
              If unchecked, all your notes will be deleted.
            </DialogContentText>
          </>
        }
        loading={loading}
        deleteButtonText="Delete Account"
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <AvatarField avatar={avatar} username={user?.username} onAvatarChange={handleAvatarChange} onAvatarRemove={() => { setAvatarFile(null); setAvatar(""); }} />
        <Stack direction="column" sx={{ flex: 1, justifyContent: 'start-flex' }}>
          <FormField id="username" label="Username" autoComplete="username" defaultValue={user?.username} sx={{borderRadius: 0, mt:0}}></FormField>
          <FormField id="email" label="Email" autoComplete="email" defaultValue={user?.email}></FormField>
          <Stack spacing={2} direction="row" sx={{mt:4}}>
          <Button variant="filled" sx={{ borderRadius: 0, mt:4, width: "100%", backgroundColor: 'primary.main', color: 'text.tertiary' }} onClick={handlePasswordClick} disabled={loading}>Change Password</Button>
          <Button variant="filled" sx={{ borderRadius: 0, mt:4, width: "100%", backgroundColor: 'error.main', color: 'text.tertiary'}} onClick={() => {setOpenDeleteDialog(true)}} disabled={loading}>Delete Account</Button>
          </Stack>
        </Stack>
      </Stack>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ borderRadius: 0, mt: 4, width: "100%" }} onClick={handleSubmit} disabled={loading}>Save Changes</Button>
    </FormWrapper>
  );
}