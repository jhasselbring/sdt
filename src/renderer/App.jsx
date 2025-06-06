import Layout from './components/Layout.jsx';
import './App.css';

import Header from './components/Header';
import Nav from './components/Nav';
import InputFileViewer from './components/drawers/InputFileViewer';

import { useAppContext } from './context/AppContext.jsx';
import { useEffect, useRef } from 'react';

function App() {
  const { state, setState, mountComponent } = useAppContext();
  const mountedRef = useRef(false);

  useEffect(() => {
    setState(s => ({
      ...s,
      componentSections: {
        ...s.componentSections,
        Header: Header,
        Nav: Nav,
      }
    }));
  }, [setState]);

  // Poll for input directories until found, then mount InputFileViewer once
  useEffect(() => {
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
        mountComponent(InputFileViewer, 'PrimaryDrawer');
        mountedRef.current = true;
        clearInterval(interval);
      }
    }
    interval = setInterval(checkAndMount, 1000);
    return () => clearInterval(interval);
  }, [mountComponent]);

  return (
    <Layout
      layoutConfig={{ components: state.componentSections }}
      drawerState={state.componentSections.state}
    />
  );
}

export default App;
