// Header.jsx
// This file defines the top menu/header bar for the application, styled to look like a classic app menu bar.
// It uses styled-components for styling and supports a logo, app name, and menu items.


import styled from 'styled-components';
import '@vscode/codicons/dist/codicon.css';
import theme from '../theme';
import HeaderControls from './HeaderComponents/HeaderControls.jsx';
import HeaderMenu from './HeaderComponents/HeaderMenu.jsx';

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

export default function Header() {
  return (
    <HeaderContainer>
      <LogoContainer>
        <span className="codicon codicon-symbol-event" style={{ fontSize: 30, padding: '2px', color: '#fff', backgroundColor: '#115f99' }}></span>
      </LogoContainer>
      <HeaderMenu />
      <HeaderControls />
    </HeaderContainer>
  );
}
