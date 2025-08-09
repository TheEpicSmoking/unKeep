import { Card, Typography, Grid, CardHeader, Divider } from '@mui/material';

export default function Note({ title, children }) {
  return (
      <Card color="secondary" variant="solid" sx={{ padding: 2, mr: 3, mb: 3, width: '100%', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
        <CardHeader title={title} />
        <Divider />
        <Typography variant="h5" sm="h7" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical"}}>{children}</Typography>
      </Card>
  );
}