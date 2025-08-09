import { Card, Typography, Grid } from '@mui/material';

export default function Note({ title, children }) {
  return (
    <Grid item size={{ xs: 12 }}>
      <Card color="danger" variant="outlined" sx={{ padding: 2, width: '100%' }}>
        <Typography variant="h4" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical"}}>{title}</Typography>
        <Typography variant="h5" sm="h7" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical"}}>{children}</Typography>
      </Card>
    </Grid>
  );
}