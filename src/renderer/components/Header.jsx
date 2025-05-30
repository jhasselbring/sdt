// Header.jsx
// This file defines the top menu/header bar for the application, styled to look like a classic app menu bar.
// It uses styled-components for styling and supports a logo, app name, and menu items.

import React from 'react';
import styled from 'styled-components';
import theme from '../theme';
import Logo from '../assets/react.svg';
import { useAppContext } from '../context/AppContext.jsx';

// Styled container for the header bar
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  background: transparent;
  color: #e0e0e0;
  height: 32px;
  padding: 0 20px;
  user-select: none;
  box-shadow: none;
  border-bottom: 1px solid rgba(255,255,255,0.04);
`;

// Container for the logo and app name
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
`;

// Logo image styling
const LogoImg = styled.img`
  height: 18px;
  width: 18px;
  filter: drop-shadow(0 0 2px #0008);
`;

// App name styling
const AppName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  font-family: ${theme.fonts.main};
  color: #e0e0e0;
  letter-spacing: 0.5px;
`;

// Menu bar container for menu items
const MenuBar = styled.nav`
  display: flex;
  align-items: center;
  gap: 22px;
`;

// Individual menu item styling
const MenuItem = styled.span`
  color: #e0e0e0;
  font-size: 0.98rem;
  font-family: ${theme.fonts.main};
  padding: 3px 12px 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
  &:active {
    background: rgba(255,255,255,0.16);
    color: #fff;
  }
`;

// List of menu items to display in the header
const menuItems = [
  'File',
  'Edit',
  'Selection',
  'View',
  'Go',
  'Run',
  'Terminal',
  'Help',
];

// Add SVG icon components for toggles (matching screenshot style)
const LeftDrawerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#a09ba8"/>
    <rect x="5" y="6" width="4" height="12" rx="1" fill="#231c2b"/>
  </svg>
);
const ConsoleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#a09ba8"/>
    <rect x="5" y="14" width="14" height="4" rx="1" fill="#231c2b"/>
  </svg>
);
const RightDrawerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#a09ba8"/>
    <rect x="15" y="6" width="4" height="12" rx="1" fill="#231c2b"/>
  </svg>
);

// Styled icon button
const IconButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  margin-left: 8px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background 0.18s;
  &:hover, &:focus {
    background: rgba(255,255,255,0.08);
    outline: none;
  }
`;

/**
 * Header component for the app.
 * Displays the app logo, name, and a row of menu items.
 */
export default function Header() {
  const {
    state,
    toggleLeftDrawer,
    toggleRightDrawer,
    toggleConsole
  } = useAppContext();
  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoImg src={Logo} alt="App Logo" />
        <AppName>SDT</AppName>
      </LogoContainer>
      <MenuBar>
        {menuItems.map((item) => (
          <MenuItem key={item}>{item}</MenuItem>
        ))}
      </MenuBar>
      <div>
        <IconButton onClick={toggleLeftDrawer} title="Toggle Left Drawer" aria-label="Toggle Left Drawer">
          <LeftDrawerIcon />
        </IconButton>
        <IconButton onClick={toggleConsole} title="Toggle Console" aria-label="Toggle Console">
          <ConsoleIcon />
        </IconButton>
        <IconButton onClick={toggleRightDrawer} title="Toggle Right Drawer" aria-label="Toggle Right Drawer">
          <RightDrawerIcon />
        </IconButton>
      </div>
    </HeaderContainer>
  );
}
