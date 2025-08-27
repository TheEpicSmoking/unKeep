import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import NoteList from '../components/NoteList.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import AddNoteFab from '../components/AddNoteFab.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function Dashboard() {
  const { createNote, getNotes } = useAuth();
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote()
      navigate(`/notes/${newNote.id}`)
    } catch (error) {
      console.error('Failed to create note:', error)
      setError(error)
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const fetchedNotes = await getNotes()
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes])
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setError(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [])
  return (
    <>
      <Navbar />
      <ErrorBanner error={error} />
      {!error && (
        <NoteList notes={notes} loading={loading} />
      )}
      <AddNoteFab onClick={() => handleCreateNote()} />
    </>
  );
}