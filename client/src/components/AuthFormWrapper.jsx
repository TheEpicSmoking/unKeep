import { IconButton, Stack, Card, Typography, Grid } from '@mui/material'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Close from '@mui/icons-material/Close'
import Logo from './Logo'

export default function AuthFormWrapper({ title, children, logo = true, previous="/"}) {
    const theme = useTheme();
    const navigate = useNavigate();
    return (
        <Card variant="outlined" sx={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", padding: 2, width: '85%', maxWidth: 800, boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0}}>
            <IconButton
                sx={{ position:"absolute", top: 5, right: 5, color: theme.palette.primary.main }}
                onClick={() => navigate(previous)}
                aria-label="close"
            >
                <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
            </IconButton>
            {logo && <Logo sx={{mb: 2, width: {xs: 60, md: 300, justifySelf:"center"}}}/>}
            <Typography variant="h4" component='h1' align="start" gutterBottom>
                {title}
            </Typography>
            {children}
        </Card>
    )
}
