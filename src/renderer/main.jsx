import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AppProvider } from './context/AppContext.jsx';
import frontendLogger from './utils/frontendLogger.js';

// Log renderer startup
frontendLogger.info('🟢 [FRONTEND] React renderer starting', { 
  context: 'main.jsx',
  process: 'renderer'
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AppProvider>
  </StrictMode>,
)

// Log renderer mounted
frontendLogger.info('✅ [FRONTEND] React renderer mounted successfully', { 
  context: 'main.jsx',
  process: 'renderer'
});
