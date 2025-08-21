import { IconButton, Stack, Card, Typography, Grid } from '@mui/material'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Close from '@mui/icons-material/Close'
import Icon from './Icon'

export default function AuthFormWrapper({ title, children, showLogo = true}) {
    const theme = useTheme();
    const navigate = useNavigate();
    return (
        <Grid container sx={{ height: '100vh', width: '100vw', backgroundColor: theme.palette.background.default, overflow: "hidden" }}  alignItems="center" justifyContent="center">
            <Stack direction="column" sx={{ width: '100%', padding: 2, margin:"0px 20px 20px 0px"}} alignItems="center">
                <Card variant="outlined" sx={{position:"relative", padding: 2, width: '85%', maxWidth: 800, maxHeight: 800, boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
                    <IconButton
                        sx={{ position:"absolute", top: 5, right: 5, color: theme.palette.primary.main }}
                        onClick={() => navigate('/')}
                        aria-label="close"
                    >
                        <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
                    </IconButton>
                    {showLogo && <Icon sx={{ fontSize: '5vw', color: 'primary.main', mb: 2,}} align="center" />}
                    <Typography variant="h4" component='h1' align="start" gutterBottom>
                        {title}
                    </Typography>
                    {children}
                </Card>
            </Stack>
        </Grid>
    )
}
