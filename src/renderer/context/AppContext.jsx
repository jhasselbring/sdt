import React, { createContext, useContext, useState, useEffect } from 'react';
import GetStarted from '../components/GetStarted';
import EmptyDrawer from '../components/drawers/EmptyDrawer';
import '@vscode/codicons/dist/codicon.css';

// import SecondaryDrawer from '../components/SecondaryDrawer';
// Define your initial global state shape here
function emptyComponent() {
  return (<></>);
}
const initialState = {
  componentSections: {
    Header: emptyComponent,
    Nav: emptyComponent,
    PrimaryDrawer: EmptyDrawer,
    SecondaryDrawer: EmptyDrawer,
    EditorWindow: GetStarted,
    ConsolePanel: GetStarted,
    ConsoleWindow: GetStarted,
    Modal: null,
    Footer: function () {
      return (<><span className="codicon codicon-account" style={{ fontSize: 18, padding: '2px', color: '#fff', backgroundColor: '#115f99' }}></span></>);
    },
    styles: {
      Container: {
        height: '100vh',
        overflow: 'hidden',
      },
      Header: {
        color: '#fff',
        fontSize: '16px',
        padding: '0',
        height: 'var(--header-height)',
      },
      Main: {
        height: 'var(--main-height)',
      },
      Nav: {
        backgroundColor: '#171520',
        width: "41px"
      },
      PrimaryDrawer: {
        backgroundColor: 'var(--background-color)',
      },
      SecondaryDrawer: {
        backgroundColor: 'var(--background-color)',
      },
      Footer: {
        color: '#fff',
        fontSize: '16px',
        height: 'var(--footer-height)',
        lineHeight: '16px',
        padding: '0',
        backgroundColor: '#262335'
      }
    },
    state: {
      isPrimaryDrawerOpen: true,
      isSecondaryDrawerOpen: true,
      isConsoleOpen: true,
    }
  },
  projectData: {
    meta: [
      /**
      * {
       *  key: 'name',
       *  value: 'Dev'
       * },
       * {
       *  key: 'inputDir',
       *  value: 'full/path/to/input/dir1'
       * },       * {
       *  key: 'inputDir',
       *  value: 'full/path/to/input/dir2'
       * }
       */
    ],
    files: [],
    tokens: []
  },
  projectMeta: {
    name: '',
    inputDirs: [],
    outputDir: '',
  }
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

  // Mount a new component to a target section
  const mountComponent = (NewComponent, target) => {
    setState((s) => {
      const before = s;
      const after = {
        ...s,
        componentSections: {
          ...s.componentSections,
          [target]: NewComponent,
        },
      };
      console.log('mountComponent', { target, before, after });
      return after;
    });
  };

  // Update state from DB data sent via IPC
  const updateFromDb = (dbData) => {
    setState((s) => ({
      ...s,
      projectData: {
        ...s.projectData,
        meta: dbData.meta || [],
        files: dbData.files || [],
      },
      projectMeta: {
        ...s.projectMeta,
        inputDirs: dbData.inputDirs?.map(d => d.path) || [],
      }
    }));
  };

  useEffect(() => {
    if (window.electronAPI?.onDbUpdated) {
      window.electronAPI.onDbUpdated(updateFromDb);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      setState,
      setProject,
      setUser,
      togglePrimaryDrawer,
      toggleSecondaryDrawer,
      toggleConsole,
      mountComponent,
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