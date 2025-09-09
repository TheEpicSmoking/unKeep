import { Typography } from '@mui/material';

export default function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <Typography
      sx={{ padding: 2, outline: 3, width: { xs: '80%', md: '50%' }, alignSelf: 'center', boxShadow: "10px 10px 0px 2px", borderRadius: 0, mt: 10 }}
      variant="h4"
      align="center"
      backgroundColor="error.main"
    >
      {error.response ? error.response.status : error.code ? error.code : 'Unknown Error'}: {error.response ? error.response.statusText : error.message ? error.message : ""}
    </Typography>
  );
}
