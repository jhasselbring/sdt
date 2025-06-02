// Nav.jsx
// This file defines a placeholder navigation component for the app's sidebar or navigation area.
// Now enhanced with VSCode-like navigation icons.
// You can replace or extend this with your actual navigation logic later.

import React from 'react';

// Simple SVG icons for VSCode-like navigation (for demonstration)
const icons = [
  { label: 'Explorer', icon: (
    <svg width="24" height="24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>
  ) },
  { label: 'Search', icon: (
    <svg width="24" height="24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ) },
  { label: 'Source Control', icon: (
    <svg width="24" height="24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v6a3 3 0 0 0 3 3h6"/></svg>
  ) },
  { label: 'Run', icon: (
    <svg width="24" height="24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ) },
  { label: 'Extensions', icon: (
    <svg width="24" height="24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M14 7v3a2 2 0 0 0 2 2h3"/></svg>
  ) },
];

/**
 * Nav component (VSCode-style placeholder)
 * Displays a vertical set of navigation icons with labels as tooltips.
 */
export default function Nav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', color: '#aaa', gap: '1.5rem', backgroundColor: 'red' }}>
      {/* VSCode-like navigation icons */}
      {icons.map(({ label, icon }) => (
        <div key={label} title={label} style={{ margin: '0.5rem 0', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '6px', padding: '6px' }}
          tabIndex={0}
          onFocus={e => e.currentTarget.style.background = '#222'}
          onBlur={e => e.currentTarget.style.background = 'transparent'}
          onMouseOver={e => e.currentTarget.style.background = '#222'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          {icon}
        </div>
      ))}
    </nav>
  );
} 