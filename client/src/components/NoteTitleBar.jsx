import { TextField, Typography, IconButton } from "@mui/material";
import TuneSharpIcon from '@mui/icons-material/TuneSharp';

export default function NoteTitleBar({ 
  isAuthor, 
  loading, 
  note, 
  onTitleChange, 
  onSettings, 
  canEdit 
}) {
  return isAuthor ? (
    <>
      <TextField
        id="noteTitle"
        variant="standard"
        defaultValue={loading ? 'Loading...' : note?.title || ''}
        onChange={onTitleChange}
        type="text"
        sx={{ width: '90%', "& .MuiInputBase-input": { fontSize: '1.4rem' } }}
        disabled={!canEdit}
      />
      <IconButton
        size="small"
        sx={{ position: 'absolute', top: 43, right: 7 }}
        color="primary"
        onClick={onSettings}
      >
        <TuneSharpIcon fontSize="large" />
      </IconButton>
    </>
  ) : (
    <Typography
      variant="h5"
      component="h2"
      sx={{
        fontSize: '1.4rem',
        maxWidth: '90%',
        height: 60,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {loading ? 'Loading...' : note?.title}
    </Typography>
  );
}