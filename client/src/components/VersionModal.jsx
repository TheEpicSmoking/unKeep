import { Modal, Typography, Box, Button } from '@mui/material';
import FormWrapper from './FormWrapper.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function versionModal({ open, onClose, version, note, fetchNote, loading, id }) {
  const { revertNoteToVersion, rebaseNoteToVersion } = useAuth();

  const revertToVersion = async (versionId) => {
    try {
      await revertNoteToVersion(id, versionId);
      fetchNote();
    } catch (error) {
      console.error('Failed to revert note to version:', error);
    }
  };

  const rebaseToVersion = async (versionId) => {
    try {
      await rebaseNoteToVersion(id, versionId);
      fetchNote();
    } catch (error) {
      console.error('Failed to rebase note to version:', error);
    }
  };
  
  return (
    <Modal
      disableScrollLock
      open={open}
    >
      <FormWrapper title={loading ? "Loading..." : `Version: ${version?.currentVersion}`} onClose={onClose} logo={false} sx={{ display: "flex", flexDirection: "column", gap: 2, width: "95%", height: "80%" }}>
        {loading ? <Typography>Loading...</Typography> : (
          <>
            <Typography variant="subtitle2" align="left" sx={{ color: 'text.disabled', fontSize: { xs: '0.8rem', md: '1.3rem' } }}>
              {new Date(version?.updatedAt).toLocaleString()}
            </Typography>
            <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
              <Typography variant="h6" sx={{ pb: 2, overflowWrap: "break-word" }}>{version?.title}</Typography>
              <Typography variant="body2" component="p" color="text.primary" sx={{ overflowWrap: "break-word", whiteSpace: "pre-line"}}>{version?.content}</Typography>
            </Box>
            <Button onClick={() => { revertToVersion(version?.currentVersion); onClose(); }} disabled={loading || version?.currentVersion === note?.currentVersion} sx={{bgcolor: 'primary.main', color: "text.tertiary", "&.Mui-disabled": { bgcolor: 'action.disabled', color: 'text.disabled' }}}> Revert to this version </Button>
            <Button onClick={() => { rebaseToVersion(version?.currentVersion); onClose(); }} disabled={loading || version?.currentVersion === 0} sx={{bgcolor: 'primary.main', color: "text.tertiary", "&.Mui-disabled": { bgcolor: 'action.disabled', color: 'text.disabled' }}}> Rebase to this version </Button>
          </>
        )}
      </FormWrapper>
    </Modal>
  );
}