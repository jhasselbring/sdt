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
  const setProject = (project) => setState((s) => ({ ...s, project }));
  // Example: function to update user
  const setUser = (user) => setState((s) => ({ ...s, user }));

  return (
    <AppContext.Provider value={{ state, setState, setProject, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
} 