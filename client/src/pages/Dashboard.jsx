import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { createNote } = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <Button variant="contained" color="primary" onClick={() => createNote('New Note', 'This is a new note.')}>
        Create Note
      </Button>
    </div>
  );
}