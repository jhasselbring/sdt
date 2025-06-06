// Nav.jsx
// This file defines a placeholder navigation component for the app's sidebar or navigation area.
// Now enhanced with VSCode-like navigation icons using @vscode/codicons.
// You can replace or extend this with your actual navigation logic later.

import React from 'react';
import '@vscode/codicons/dist/codicon.css';
import InputFileViewer from './drawers/InputFileViewer';
import GlobalStateViewer from './drawers/GlobalStateViewer';
import { useAppContext } from '../context/AppContext';




/**
 * Nav component (VSCode-style placeholder)
 * Displays a vertical set of navigation icons with labels as tooltips.
 */
export default function Nav() {
  const { mountComponent } = useAppContext();
  // Codicon icon class names for VSCode-like navigation
  const navItems = [
    { label: 'Explorer', iconClass: 'codicon codicon-files', onClick: () => mountComponent(InputFileViewer, 'PrimaryDrawer') },
    { label: 'State', iconClass: 'codicon codicon-database', onClick: () => mountComponent(GlobalStateViewer, 'PrimaryDrawer') },
    { label: 'Search', iconClass: 'codicon codicon-search' },
    { label: 'Source Control', iconClass: 'codicon codicon-source-control' },
    { label: 'Run', iconClass: 'codicon codicon-run' },
    { label: 'Extensions', iconClass: 'codicon codicon-extensions' },
  ];
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', color: '#aaa', gap: '1.5rem' }}>
      {/* VSCode-like navigation icons using codicons */}
      {navItems.map(({ label, iconClass, onClick }) => (
        <div
          key={label}
          title={label}
          style={{ margin: '0.5rem 0', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '6px', padding: '6px' }}
          tabIndex={0}
          onFocus={e => e.currentTarget.style.background = '#222'}
          onBlur={e => e.currentTarget.style.background = 'transparent'}
          onMouseOver={e => e.currentTarget.style.background = '#222'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          onClick={onClick}
        >
          <span className={iconClass} style={{ fontSize: 24, display: 'block' }} />
        </div>
      ))}
    </nav>
  );
} 