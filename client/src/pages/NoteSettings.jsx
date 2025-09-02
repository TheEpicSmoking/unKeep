import { useAuth } from '../context/AuthContext';
import { Stack, Button, OutlinedInput, Box, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Slide, Chip, Tab, Typography} from '@mui/material';
import {  TabContext, TabList, TabPanel } from '@mui/lab'; 
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'
import ErrorLog from '../components/ErrorLog';
import Close from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';


export default function MyProfile() {
  const { getNote, updateNoteSettings } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [errors, setErrors] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmDelete, setconfirmDelete] = useState("");
  const [tabValue, setTabValue] = useState("1");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [collaborators, setCollaborators] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNewTag = () => {
    if (newTag) {
      if (tags.includes(newTag)) return;
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const fetchNote = async () => {
    setLoading(true);
    try {
      const fetchedNote = await getNote(id);
      setNote(fetchedNote);
    } catch (error) {
      console.error('Failed to fetch note:', error);
      setErrors(error);
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchNote();
    setErrors(null)
  }, []);

  useEffect(() => {
    if (note) {
      setTags(note.tags || []);
      setCollaborators(note.collaborators || []);
    }
  }, [note]);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    try {
      await updateNoteSettings(id, collaborators, tags);
    } catch (error) {
      console.error('Failed to update note settings:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  const handleNoteDelete = async () => {
    setLoading(true);
    try {
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note:", error);
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="Note Settings" logo={false} onClose={() => navigate("/")} sx={{ height: '50%',  display: "flex", flexDirection: "column" }}>
      <Dialog
        disableScrollLock
        open={openDeleteDialog}
        slots={{ transition: Slide }}
        slotProps={{ paper: { sx: { boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0}}}}
      >
        <DialogTitle>Delete your note</DialogTitle>
        <DialogContent>
          <IconButton
                sx={{ position:"absolute", top: 5, right: 5, color: "text.primary" }}
                onClick={() => setOpenDeleteDialog(false)}
                aria-label="close"
            >
                <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
          </IconButton>
          <DialogContentText sx={{fontSize: '1.4rem'}}>
            Your note will be permanently deleted.
          </DialogContentText>
          <FormField label='To confirm, please type "DELETE"' placeholder="DELETE" onChange={(e) => setconfirmDelete(e.target.value)}></FormField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteDelete} sx={{ color: 'error.main' }} disabled={confirmDelete !== "DELETE"}>Delete Note</Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6">
        {note?.title || 'Loading...'}
      </Typography>
      <TabContext value={tabValue} >
        <TabList variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} onChange={handleTabChange}>
          <Tab label="Note History" sx={{ textTransform: 'none', fontSize: '1.2rem' }} value="1"/>
          <Tab label="Collaborators" sx={{ textTransform: 'none', fontSize: '1.2rem' }} value="2"/>
          <Tab label="Tags" sx={{fontSize: '1.2rem' }} value="3"/>

        </TabList>
        <TabPanel value="1" sx={{p:0, pt:2}}>
        </TabPanel>
        <TabPanel value="2" sx={{p:0, pt:2}}>
        </TabPanel>
        <TabPanel value="3" sx={{p:0, pt:2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Stack direction="row">
            <OutlinedInput placeholder="Add a tag" value={newTag} sx={{borderRadius: 0, width: '100%' }} onChange={(e) => setNewTag(e.target.value)} />
            <Button variant="contained" sx={{ borderRadius: 0 }} onClick={handleNewTag}><AddIcon /></Button>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyItems: 'flex-start', overflow: 'none', gap: 2, width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} deleteIcon={<Close />} sx={{bgcolor: "black", color: 'text.tertiary', outline: 3, outlineColor: 'primary.main', borderRadius: 0, "& .MuiChip-deleteIcon": { color: "text.tertiary", "&:hover": { color: "text.tertiary" }}}} />
            ))}
            </Box>
        </TabPanel>
      </TabContext>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ borderRadius: 0, mt: 2, width: "100%" }} onClick={handleSubmit} disabled={loading}>Update Note</Button>
    </AuthFormWrapper>
  );
}