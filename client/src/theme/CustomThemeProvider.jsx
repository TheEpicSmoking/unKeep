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
		fontFamily: "Lexend",
		fontWeightRegular: 375,
		h6: {
			fontWeight: 450,
		},
		subtitle1: {
			fontSize: '0.9rem',
		},
		subtitle2: {
			fontSize: '0.8rem',
			fontWeight: 350,
		},
		h4: {
			fontFamily: "Tiny5",
			fontSize: '2rem',
		},
		button: {
			textTransform: 'none',
			fontFamily: "Tiny5",
		},
	},
	components: {
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: "#fbe23dff",
					color: "#000000ff",
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
		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
		},
		MuiFormLabel: {
			styleOverrides: {
				root: {
					fontFamily: 'Tiny5'
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					fontFamily: 'Tiny5',
					fontSize: '1.5rem',
				},
			},
		},
	}
});

export default function CustomThemeProvider({ children }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
