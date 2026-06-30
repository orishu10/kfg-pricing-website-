import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c11d28' },
    error:   { main: '#c11d28' },
    success: { main: '#2e7d32' },
    background: {
      default: '#757373',
      paper:   '#ffffff',
    },
    text: {
      primary:   '#000000',
      secondary: '#494445',
      disabled:  '#757373',
    },
  },
  typography: {
    fontFamily: '"Myriad Pro", sans-serif',
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  600,
    fontWeightBold:    700,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: '"Myriad Pro", sans-serif' },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiCard: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

export default theme;
