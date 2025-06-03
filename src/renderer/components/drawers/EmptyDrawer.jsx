import React from 'react';
import GetStarted from '../GetStarted';
const PrimaryDrawer = () => (
  <div style={{
    color: '#d4d4d4',
    height: '100%',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: 13,
    padding: '8px 0 0 0',
    width: '100%',
    marginBottom: 0,
  }}>
    <div style={{
      fontWeight: 600,
      letterSpacing: 1,
      fontSize: 12,
      color: '#bdbdbd',
      padding: '0 16px 8px 16px',
      borderBottom: '1px solid #23232a', 
      marginBottom: 0,
    }}>
      EXPLORER
    </div>
    <GetStarted />
  </div>
);

export default PrimaryDrawer;
