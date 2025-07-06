import Layout from './components/Layout.jsx';
import './App.css';

import Header from './components/Header';
import Nav from './components/Nav';
import InputFileViewer from './components/drawers/InputFileViewer';

import { useAppContext } from './context/AppContext.jsx';
import { useEffect, useRef } from 'react';
import frontendLogger from './utils/frontendLogger.js';

function App() {
  const { state, setState, mountComponent } = useAppContext();
  const mountedRef = useRef(false);

  useEffect(() => {
    frontendLogger.info('🔄 [FRONTEND] App component initializing', { 
      context: 'App.useEffect',
      process: 'renderer'
    });
    
    setState(s => ({
      ...s,
      componentSections: {
        ...s.componentSections,
        Header: Header,
        Nav: Nav,
      }
    }));
    
    frontendLogger.info('✅ [FRONTEND] App component initialized with Header and Nav', { 
      context: 'App.useEffect',
      process: 'renderer'
    });
  }, [setState]);

  // Poll for input directories until found, then mount InputFileViewer once
  useEffect(() => {
    frontendLogger.info('🔄 [FRONTEND] Starting input directory polling', { 
      context: 'App.inputDirectoryPolling',
      process: 'renderer'
    });
    
    let interval;
    async function checkAndMount() {
      const result = await window.electronAPI?.data?.getAllInputDirectories?.();
      if (
        result &&
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0 &&
        !mountedRef.current
      ) {
        frontendLogger.info('✅ [FRONTEND] Input directories found, mounting InputFileViewer', { 
          context: 'App.inputDirectoryPolling',
          process: 'renderer',
          directoryCount: result.data.length
        });
        
        mountComponent(InputFileViewer, 'PrimaryDrawer');
        mountedRef.current = true;
        clearInterval(interval);
      }
    }
    interval = setInterval(checkAndMount, 1000);
    return () => {
      clearInterval(interval);
      frontendLogger.info('🔄 [FRONTEND] Input directory polling stopped', { 
        context: 'App.inputDirectoryPolling',
        process: 'renderer'
      });
    };
  }, [mountComponent]);

  return (
    <Layout
      layoutConfig={{ components: state.componentSections }}
      drawerState={state.componentSections.state}
    />
  );
}

export default App;
