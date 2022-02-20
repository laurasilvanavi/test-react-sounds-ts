import './App.css';
import { Instrument } from './features/instrument';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import teal from '@mui/material/colors/teal';
import commonColors from '@mui/material/colors/common';
import { AppBar } from '@mui/material';
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: commonColors.white
    },
    secondary: teal,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0',
          fontSize: 'large',
          margin: '0.1em',
          paddingTop: '4em',
          paddingBottom: '4em',
          fontWeight: '800',
          '&:hover': {
            background: '#1de9b6',
        }
        },
      },
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <AppBar className="Bar" color="secondary" enableColorOnDark position="static"><h1 className="Bar-text">My instrument</h1></AppBar>
        <Instrument></Instrument>
      </div>
    </ThemeProvider>
  );
}

export default App;
