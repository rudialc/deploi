import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { store } from './store/store'
import App from './App'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b6bff',
    },
    secondary: {
      main: '#7dd3fc',
    },
    background: {
      default: '#05060c',
      paper: 'rgba(17, 25, 40, 0.85)',
    },
    text: {
      primary: '#f9fafb',
      secondary: 'rgba(226, 232, 240, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: '1.8rem',
          paddingBlock: '0.75rem',
          boxShadow: '0 18px 40px rgba(139, 107, 255, 0.3)',
          ':hover': {
            boxShadow: '0 24px 45px rgba(139, 107, 255, 0.45)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'linear-gradient(145deg, rgba(17,25,40,0.95) 0%, rgba(17,25,40,0.75) 100%)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          '& .MuiFilledInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            ':hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
            },
          },
        },
      },
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline enableColorScheme />
    <Provider store={store}>
      <App />
    </Provider>
  </ThemeProvider>,
)