import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c41230' },
    error:   { main: '#d32f2f' },
    success: { main: '#2e7d32' },
    background: {
      default: '#c8c8c8',
      paper:   '#ffffff',
    },
  },
  shape: { borderRadius: 8 },
  components: {
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
