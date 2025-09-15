import { createTheme, ThemeProvider } from '@mui/material/styles';

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
		error: {
			main: '#ff4a4aff',
		},
		background: {
			default: '#fff08fff',
			paper: '#fbe23dff',
		},
	},
	typography: {
		//pixelated font
		fontFamily: 'Roboto, sans-serif',
		button: {
			textTransform: 'none',
		},
	},
	components: {
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: "#fbe23dff", // colore di sfondo
					color: "#000000ff",           // testo
					fontSize: "0.9rem",
					borderRadius: 0,
					outline: "3px solid #000000ff",
					boxShadow: "5px 5px 0px 2px",
				},
			},
		},
		MuiPopover: {
			styleOverrides: {
				paper: {
					borderRadius: 0,
					boxShadow: "5px 5px 0px 2px",
					outline: "3px solid #000000ff",
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
		},
	}
});

export default function CustomThemeProvider({ children }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
