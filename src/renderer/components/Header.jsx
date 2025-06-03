// Header.jsx
// This file defines the top menu/header bar for the application, styled to look like a classic app menu bar.
// It uses styled-components for styling and supports a logo, app name, and menu items.

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import '@vscode/codicons/dist/codicon.css';
import theme from '../theme';
import HeaderControls from './HeaderComponents/HeaderControls.jsx';


// Styled container for the header bar
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  background: transparent;
  color: #e0e0e0;
  height: 32px;
  user-select: none;
  box-shadow: none;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  -webkit-app-region: drag;
`;

// Container for the logo and app name
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
  -webkit-app-region: no-drag
`;

// Logo image styling
const LogoImg = styled.img`
  height: 18px;
  width: 18px;
  filter: drop-shadow(0 0 2px #0008);
  -webkit-app-region: no-drag
`;


// Menu bar container for menu items
const MenuBar = styled.nav`
  display: flex;
  align-items: center;
  gap: 22px;
  -webkit-app-region: no-drag
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
    -webkit-app-region: no-drag
`;

// Dropdown menu styling
const DropdownMenu = styled.div`
  position: absolute;
  top: 32px;
  left: 0;
  background: #23232a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  box-shadow: 0 2px 8px #0006;
  min-width: 160px;
  z-index: 1000;
  padding: 6px 0;
`;
const DropdownItem = styled.div`
  color: #e0e0e0;
  font-size: 0.97rem;
  font-family: ${theme.fonts.main};
  padding: 7px 20px 7px 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: rgba(255,255,255,0.10);
    color: #fff;
  }
`;

// List of menu items to display in the header  'View',

const menuItems = [
  'File',
  'Edit',
  'Help',
];

// Codicon-based icon components




/**
 * Header component for the app.
 * Displays the app logo, name, and a row of menu items.
 */
export default function Header() {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const fileMenuRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    if (!fileMenuOpen) return;
    function handleClick(e) {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setFileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [fileMenuOpen]);

  // Dropdown menu options for File
  const handleNewProject = () => {
    setFileMenuOpen(false);
    // TODO: Implement New Project logic
    alert('New Project clicked');
  };
  const handleOpenProject = () => {
    setFileMenuOpen(false);
    // TODO: Implement Open Project logic
    alert('Open Project clicked');
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <span className="codicon codicon-symbol-event" style={{ fontSize: 30, padding:'2px', color: '#fff', backgroundColor: '#115f99' }}></span>
      </LogoContainer>
      <MenuBar style={{ position: 'relative' }}>
        {menuItems.map((item) =>
          item === 'File' ? (
            <div key={item} style={{ position: 'relative' }} ref={fileMenuRef}>
              <MenuItem
                onClick={() => setFileMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={fileMenuOpen}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setFileMenuOpen((open) => !open);
                  if (e.key === 'Escape') setFileMenuOpen(false);
                }}
              >
                {item}
              </MenuItem>
              {fileMenuOpen && (
                <DropdownMenu>
                  <DropdownItem onClick={handleNewProject}>New Project</DropdownItem>
                  <DropdownItem onClick={handleOpenProject}>Open Project</DropdownItem>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <MenuItem key={item}>{item}</MenuItem>
          )
        )}
      </MenuBar>
      <HeaderControls />
    </HeaderContainer>
  );
}
