import React, { createContext, useContext, useState } from 'react';
import Header from '../components/Header';
import Nav from '../components/Nav';
// Define your initial global state shape here
const initialState = {
  componentSections: {
    Header,
    Nav,
    styles: {
      Container: {
        height: '100vh',
        overflow: 'hidden',
      },
      Header: {
        color: '#fff',
        fontSize: '16px',
        padding: '0',
        height: '30px',
      },
      Main: {
        height: 'calc(100vh - 30px - 27px)',
      },
      Footer: {
        color: '#fff',
        fontSize: '16px',
        height: '27px',
        lineHeight: '16px',
        padding: '0',
      }
    },
    state: {
      isPrimaryDrawerOpen: true,
      isSecondaryDrawerOpen: true,
      isConsoleOpen: true,
    }
  },
  project: null, // e.g., { name: '', outputDir: '', ... }
  user: null,    // e.g., { name: '', id: '' }
  // Add more global state as needed
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState(initialState);

  // Example: function to update project
  const setProject = (project) => {
    setState((s) => {
      const before = s;
      const after = { ...s, project };
      console.log('setProject BEFORE', before);
      console.log('setProject AFTER', after);
      return after;
    });
  };
  // Example: function to update user
  const setUser = (user) => {
    setState((s) => {
      const before = s;
      const after = { ...s, user };
      console.log('setUser BEFORE', before);
      console.log('setUser AFTER', after);
      return after;
    });
  };

  // Toggle functions for drawers and console
  const togglePrimaryDrawer = () =>
    setState((s) => {
      const before = s;
      const after = {
        ...s,
        componentSections: {
          ...s.componentSections,
          state: {
            ...s.componentSections.state,
            isPrimaryDrawerOpen: !s.componentSections.state.isPrimaryDrawerOpen,
          },
        },
      };
      console.log('togglePrimaryDrawer BEFORE', before);
      console.log('togglePrimaryDrawer AFTER', after);
      return after;
    });

  const toggleSecondaryDrawer = () =>
    setState((s) => {
      const before = s;
      const after = {
        ...s,
        componentSections: {
          ...s.componentSections,
          state: {
            ...s.componentSections.state,
            isSecondaryDrawerOpen: !s.componentSections.state.isSecondaryDrawerOpen,
          },
        },
      };
      console.log('toggleSecondaryDrawer BEFORE', before);
      console.log('toggleSecondaryDrawer AFTER', after);
      return after;
    });

  const toggleConsole = () =>
    setState((s) => {
      const before = s;
      const after = {
        ...s,
        componentSections: {
          ...s.componentSections,
          state: {
            ...s.componentSections.state,
            isConsoleOpen: !s.componentSections.state.isConsoleOpen,
          },
        },
      };
      console.log('toggleConsole BEFORE', before);
      console.log('toggleConsole AFTER', after);
      return after;
    });

  return (
    <AppContext.Provider value={{
      state,
      setState,
      setProject,
      setUser,
      togglePrimaryDrawer,
      toggleSecondaryDrawer,
      toggleConsole,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
} 