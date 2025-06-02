// Layout.jsx
// This file defines the main layout structure for the application, including header, navigation, drawers, editor, and console areas.
// It uses styled-components for styling and supports dynamic injection of section components and styles via layoutConfig.

import React, { useEffect, useState } from 'react';
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from 'react-resizable-panels';
import {
  StyledContainer,
  StyledHeader,
  StyledFooter,
  StyledMain,
  StyledNav,
  LeftDrawer,
  RightDrawer,
  EditorArea,
  EditorPanel,
  ConsolePanel,
  HorizontalResizeHandle,
  VerticalResizeHandle,
} from './LayoutDefaults.jsx';

// Utility: Render a layout section by name
function renderSection(components, section) {
  const SectionComponent = components?.[section];
  const sectionStyles = components?.styles?.[section];
  if (!SectionComponent) {
    return (
      <div style={{ color: 'white', padding: '1rem' }}>
        Please provide <code>components.{section}</code> to customize this component to the Layout component.
      </div>
    );
  }
  return <SectionComponent className="section-component" {...(sectionStyles ? { style: sectionStyles } : {})} />;
}

/**
 * Layout Component
 * @param layoutConfig - object containing custom components and styles
 * @param drawerState - object with booleans for leftDrawer, rightDrawer, and console visibility
 * @param onToggleLeftDrawer - toggle callback
 * @param onToggleRightDrawer - toggle callback
 * @param onToggleConsole - toggle callback
 */
function Layout({
  layoutConfig = {},
  drawerState = { isLeftDrawerOpen: false, isRightDrawerOpen: false, isConsoleOpen: false }
}) {
  const [defaultLayout, setDefaultLayout] = useState(undefined);
  const storageKey = 'editor-panel-layout';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDefaultLayout(JSON.parse(saved));
      } catch {
        // fallback to default layout
      }
    }
  }, []);

  const handleSaveLayout = (sizes) => {
    localStorage.setItem(storageKey, JSON.stringify(sizes));
  };

  return (
    <StyledContainer style={layoutConfig?.components?.styles?.Container} data-name="Container">
      <StyledHeader style={layoutConfig?.components?.styles?.Header} data-name="Header"> {renderSection(layoutConfig?.components, 'Header')} </StyledHeader>

      <StyledMain style={layoutConfig?.components?.styles?.Main} data-name="Main">
        <StyledNav style={layoutConfig?.components?.styles?.Nav} data-name="Nav"> {renderSection(layoutConfig?.components, 'Nav')} </StyledNav>

        <PanelGroup direction="horizontal" autoSaveId="main-panels" onLayout={handleSaveLayout} data-name="MainPanelGroup">
          {drawerState.isLeftDrawerOpen && (
            <>
              <Panel minSize={1} defaultSize={15} order={1} collapsible={true} collapsedSize={0} data-name="LeftDrawerPanel" >
                <LeftDrawer style={layoutConfig?.components?.styles?.LeftDrawer} data-name="LeftDrawer"> {renderSection(layoutConfig?.components, 'LeftDrawer')} </LeftDrawer>
              </Panel>
              <HorizontalResizeHandle />
            </>
          )}

          <Panel minSize={1} order={2}>
            <EditorArea style={layoutConfig?.components?.styles?.Editor} data-name="EditorArea">
              <PanelGroup direction="vertical" className="panel-group-vertical">
                <Panel minSize={20}>
                  <EditorPanel id="editors"> {renderSection(layoutConfig?.components, 'Editor')} </EditorPanel>
                </Panel>

                {drawerState.isConsoleOpen && (
                  <>
                    <VerticalResizeHandle />
                    <Panel minSize={10}>
                      <ConsolePanel
                        id="console"
                        className="console-area"
                        style={layoutConfig?.components?.styles?.ConsolePanel}
                        data-name="ConsolePanel"
                      >
                        {renderSection(layoutConfig?.components, 'ConsolePanel')}
                      </ConsolePanel>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </EditorArea>
          </Panel>

          {drawerState.isRightDrawerOpen && (
            <>
              <HorizontalResizeHandle />
              <Panel minSize={1} defaultSize={15} order={3} collapsible={true} collapsedSize={0} data-name="RightDrawerPanel">
                <RightDrawer style={layoutConfig?.components?.styles?.RightDrawer} data-name="RightDrawer"> {renderSection(layoutConfig?.components, 'RightDrawer')} </RightDrawer>
              </Panel>
            </>
          )}
        </PanelGroup>
      </StyledMain>

      <StyledFooter style={layoutConfig?.components?.styles?.Footer} data-name="Footer"> {renderSection(layoutConfig?.components, 'Footer')} </StyledFooter>
    </StyledContainer>
  );
}

export default Layout;
