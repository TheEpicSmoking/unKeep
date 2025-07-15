import { Card } from '@mui/material';
import { Typography } from '@mui/material';

export default function Note({ title, children }) {
  return (
    <Card variant="outlined" sx={{ padding: 2, width: '85%', maxWidth: 450, margin: 'auto', mt: 2 }}>
      <Typography variant="h4" >{title}</Typography>
      <Typography variant="h5">{children}</Typography>
    </Card>
  );
}