import { Card, Typography, Box } from '@mui/material';

export default function DashboardBanner({ title, message, children, sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        mt: 5,
        width: { xs: '90%', md: '52%' },
        alignSelf: 'center',
        gap: 3,
        ...sx,
      }}
    >
      <Card
        color="secondary"
        variant="solid"
        sx={{
          width: '100%',
          boxShadow: "10px 10px 0px 2px",
          outline: 3,
          outlineColor: 'primary.main',
          borderRadius: 0,
        }}
      >
        {title && (
          <Typography variant="h5" align="center" sx={{ p: 2 }}>
            {title}
          </Typography>
        )}
        {message && (
          <Typography variant="h6" align="center" sx={{ p: 2, color: 'text.secondary' }}>
            {message}
          </Typography>
        )}
      </Card>
      {children}
    </Box>
  );
}