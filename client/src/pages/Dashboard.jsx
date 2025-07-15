import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import NoteList from '../components/NoteList.jsx';
import { Typography } from '@mui/material';
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
      <Typography>Dashboard</Typography>
      <NoteList notes={notes} />
      <Button variant="contained" color="primary" onClick={() => createNote('New Note', 'This is a new note.')}>
        Create Note
      </Button>
    </>
  );
}