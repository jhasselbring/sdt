// LayoutDefaults.jsx
// Exports layout constants, styled containers, and default values for Layout.jsx

import styled from 'styled-components';
import { PanelResizeHandle } from 'react-resizable-panels';

// Layout constants
export const headerHeight = 56;
export const footerHeight = 31;
export const navWidth = 56;
export const mainHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
export const appBackgroundColor = '#252a38';
export const appSectionBackgroundColor = '#171b26';

// Styled layout containers
export const StyledContainer = styled.div`
  background-color: ${appBackgroundColor};
`;
export const StyledHeader = styled.header`
  background-color: #252a38;
  color: white;
  height: ${headerHeight}px;
`;
export const StyledFooter = styled.footer`
  background-color: #353b4b;
  color: white;
  height: ${footerHeight}px;
`;
export const StyledMain = styled.main`
  height: ${mainHeight};
  width: 100%;
  display: flex;
`;
export const StyledNav = styled.nav`
  background-color: ${appBackgroundColor};
  color: white;
  width: ${navWidth}px;
`;

// Panel wrappers
export const PanelWrapper = styled.div`
  height: 100%;
  background-color: inherit;
  overflow: auto;
  border-radius: 4px;
`;
export const LeftDrawer = styled(PanelWrapper)`
  background-color: ${appSectionBackgroundColor};
`;
export const RightDrawer = styled(PanelWrapper)`
  background-color: ${appSectionBackgroundColor};
`;
export const EditorArea = styled(PanelWrapper)`
  background-color: #171b26;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
`;
export const EditorPanel = styled.div`
  background-color: ${appSectionBackgroundColor};
  padding: 1rem;
  color: white;
  height: 100%;
`;
export const ConsolePanel = styled.div`
  background-color: #111;
  padding: 1rem;
  color: white;
  height: 100%;
`;

// Resize handles
export const HorizontalResizeHandle = styled(PanelResizeHandle)`
  background-color: #252a38;
  cursor: col-resize;
  width: 4px;
  &:hover {
    background-color: #666;
  }
`;
export const VerticalResizeHandle = styled(PanelResizeHandle)`
  height: 4px;
  background-color: #252a38;
  cursor: row-resize;
  &:hover {
    background-color: #666;
  }
`;
