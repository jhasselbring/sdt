import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AppProvider } from './context/AppContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AppProvider>
  </StrictMode>,
)
