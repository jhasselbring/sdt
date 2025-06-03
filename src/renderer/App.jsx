import Layout from './components/Layout2.jsx';
import './App.css';

import Header from './components/Header';
import Nav from './components/Nav';

import { useAppContext } from './context/AppContext.jsx';
import { useEffect } from 'react';

function App() {
  const { state, setState } = useAppContext();

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

  return (
    <Layout
      layoutConfig={{ components: state.componentSections }}
      drawerState={state.componentSections.state}
    />
  );
}

export default App;
