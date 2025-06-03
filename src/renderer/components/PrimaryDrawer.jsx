import React from 'react';

const PrimaryDrawer = () => (
  <div style={{
    color: '#d4d4d4',
    height: '100%',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: 13,
    padding: '8px 0 0 0',
    width: '100vw',
  }}>
    <div style={{
      fontWeight: 600,
      letterSpacing: 1,
      fontSize: 12,
      color: '#bdbdbd',
      padding: '0 16px 8px 16px',
      borderBottom: '1px solid #23232a',
      marginBottom: 8,
    }}>
      EXPLORER
    </div>
    <div style={{ padding: '0 16px', flex: 1 }}>
      <div style={{ marginBottom: 6, color: '#d7ba7d' }}>project-root/</div>
      <div style={{ marginLeft: 16, color: '#9cdcfe' }}>src/</div>
      <div style={{ marginLeft: 32, color: '#b5cea8' }}>index.js</div>
      <div style={{ marginLeft: 32, color: '#b5cea8' }}>App.jsx</div>
      <div style={{ marginLeft: 16, color: '#9cdcfe' }}>public/</div>
      <div style={{ marginLeft: 32, color: '#b5cea8' }}>index.html</div>
      <div style={{ marginTop: 12, color: '#808080', fontStyle: 'italic', fontSize: 12 }}>
        (Provide <code>components.PrimaryDrawer</code> to customize)
      </div>
    </div>
  </div>
);

export default PrimaryDrawer;
