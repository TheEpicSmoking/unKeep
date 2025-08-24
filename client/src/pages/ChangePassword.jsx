import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router";
import AuthFormWrapper from "../components/AuthFormWrapper";
import FormField from "../components/FormField";
import ErrorLog from "../components/ErrorLog";

export default function ChangePassword() {

  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    try {
      setLoading(true);
      if (newPassword !== confirmPassword) {
        throw { response: { data: { message: "Passwords do not match" } } };
      }
      await changePassword(currentPassword, newPassword);
      navigate('/me');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error';
      setErrors(Array.isArray(msg) ? msg : [msg]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setErrors([]);
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <AuthFormWrapper title="Change Password" logo={false} previous="/me">
        <FormField id="current-password" label="Current Password" type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
        <FormField id="new-password" label="New Password" type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <FormField id="confirm-password" label="Confirm Password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
        <Button variant="contained" sx={{ borderRadius: 0, mt: 4, width: "100%" }} onClick={handleSubmit} disabled={loading}>Change Password</Button>
    </AuthFormWrapper>
  );
}
