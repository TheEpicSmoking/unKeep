import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const theme = createTheme({
	palette: {
		text: {
			primary: '#000000ff',
			secondary: '#090909ff',
			tertiary: '#ffffffff',
			disabled: '#2d2d2dff',
			hint: '#00000080',
		},
		primary: {
			main:  '#000000ff',
		},
		secondary: {
			main: '#D8BFD8',
		},
		error: {
			main: '#ff4a4aff',
		},
		background: {
			default: '#fff08fff',
			paper: '#fbe23dff',
		},
	},
	typography: {
		fontFamily: 'Roboto, sans-serif',
		button: {
			textTransform: 'none',
		},
	},
});

export default function CustomThemeProvider({ children }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
