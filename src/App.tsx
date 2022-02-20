import './App.css';
import { Instrument } from './features/instrument';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar } from '@mui/material';
import { teal, common } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: common.white
    },
    secondary: teal,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: common.white,
          color: common.black,
          borderRadius: '0',
          fontSize: 'large',
          margin: '0.1em',
          paddingTop: '1em',
          paddingBottom: '1em',
          fontWeight: '800',
          width: '10em',
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
        <AppBar className="Bar" color="secondary" enableColorOnDark position="static"><h1 className="BarText">My instrument</h1></AppBar>
        <Instrument></Instrument>
      </div>
    </ThemeProvider>
  );
}

export default App;
