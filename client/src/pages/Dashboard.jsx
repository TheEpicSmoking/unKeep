import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Note from '../components/Note.jsx';
import { Grid, Typography, Stack, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { createNote, getNotes } = useAuth();
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const fetchedNotes = await getNotes()
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes])
      console.log('Fetched notes:', fetchedNotes)
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes(Array.isArray(error) ? error : [error.message]);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [])
  return (
    <>
      <Navbar />
      <Grid container spacing={2} sx={{ m: 3, mt: 10, justifyContent: 'center', alignItems: 'start' }}>
        <Grid container size={6} sx={{ alignItems: 'stretch' }}>
        {notes.map((note, index) => (
          index % 2 === 0 ? (
            <Note key={note.id} title={note.title}>
              {note.content}
            </Note>
          ) : null
        ))}
        </Grid>
        <Grid container size={6} sx={{ alignItems: 'stretch' }}>
        {notes.map((note, index) => (
          index % 2 === 1 ? (
            <Note key={note.id} title={note.title}>
              {note.content}
            </Note>
          ) : null
        ))}
        </Grid>
      </Grid>
      <Fab sx={{ position: 'fixed', bottom: 24, right: 30 }} size="large" variant="contained" color="primary" onClick={() => createNote('Where does it come from?', 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.')}>
        <AddIcon />
      </Fab>
    </>
  );
}