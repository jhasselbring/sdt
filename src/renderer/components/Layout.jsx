// Layout.jsx
// This file defines the main layout structure for the application, including header, navigation, drawers, editor, and console areas.
// It uses styled-components for styling and supports dynamic injection of section components and styles via layoutConfig.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    PanelGroup,
    Panel,
    PanelResizeHandle,
} from 'react-resizable-panels';

// Layout constants for sizing and colors
const headerHeight = 56;
const footerHeight = 31;
const navWidth = 56;
const mainHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
const appBackgroundColor = '#252a38';
const appSectionBackgroundColor = '#171b26';

// Styled-components for each layout section
const StyledContainer = styled.div`
  background-color: ${appBackgroundColor};
`;
const StyledHeader = styled.header`
  background-color: #252a38;
  color: white;
  height: ${headerHeight}px;
`;
const StyledFooter = styled.footer`
  background-color: #353b4b;
  color: white;
  height: ${footerHeight}px;
`;
const StyledMain = styled.main`
  height: ${mainHeight};
  width: 100%;
  display: flex;
`;
const StyledNav = styled.nav`
  background-color: ${appBackgroundColor};
  color: white;
  width: ${navWidth}px;
`;
const PanelWrapper = styled.div`
  height: 100%;
  background-color: inherit;
  overflow: auto;
  border-radius: 4px;
`;
const LeftDrawer = styled(PanelWrapper)`
  background-color: ${appSectionBackgroundColor};
`;
const EditorArea = styled(PanelWrapper)`
  background-color: #171b26;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
`;
const EditorPanel = styled.div`
  background-color: ${appSectionBackgroundColor};
  padding: 1rem;
  color: white;
  height: 100%;
`;
const ConsolePanel = styled.div`
  background-color: #111;
  padding: 1rem;
  color: white;
  height: 100%;
`;
const RightDrawer = styled(PanelWrapper)`
  background-color: ${appSectionBackgroundColor};
`;
const HorizontalResizeHandle = styled(PanelResizeHandle)`
  background-color: #252a38;
  cursor: col-resize;
  width: 4px;
  &:hover {
    background-color: #666;
  }
`;
const VerticalResizeHandle = styled(PanelResizeHandle)`
  height: 4px;
  background-color: #252a38;
  cursor: row-resize;
  &:hover {
    background-color: #666;
  }
`;

/**
 * Renders a section component by name, with optional styles if defined in layoutConfig.components.styles.
 * @param {object} components - The components object from layoutConfig.
 * @param {string} section - The section/component name (e.g., 'Header', 'Nav').
 * @returns {JSX.Element} The rendered section or a fallback message.
 */
function renderSection(components, section) {
    console.log(components); // For debugging: shows what components are available
    const SectionComponent = components?.[section];
    const sectionStyles = components?.styles?.[section];
    if (!SectionComponent) {
        return (
            <div style={{ color: 'white', padding: '1rem' }}>
                Please provide <code>components.{section}</code> to customize this component to the Layout component.
            </div>
        );
    }
    // Pass style prop if defined for this section
    return (
        <SectionComponent {...(sectionStyles ? { style: sectionStyles } : {})} />
    );
}

/**
 * Main Layout component for the app. Handles header, nav, drawers, editor, and console areas.
 * Accepts a layoutConfig prop to inject custom components and styles for each section.
 */
function Layout({ layoutConfig = {} }) {
    const [defaultLayout, setDefaultLayout] = useState(undefined);
    const storageKey = 'editor-panel-layout';
    // Log the components for debugging
    console.log(layoutConfig.components);
    // Restore layout from localStorage if available
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

    // Save panel layout to localStorage
    const handleSaveLayout = (sizes) => {
        localStorage.setItem(storageKey, JSON.stringify(sizes));
    };

    return (
        <StyledContainer style={layoutConfig?.components?.styles?.Container} data-name="Container">
            {/* Header section, with optional custom styles */}
            <StyledHeader style={layoutConfig?.components?.styles?.Header} data-name="Header">
                {renderSection(layoutConfig?.components, 'Header')}
            </StyledHeader>

            <StyledMain style={layoutConfig?.components?.styles?.Main} data-name="Main">
                {/* Navigation section */}
                <StyledNav style={layoutConfig?.components?.styles?.Nav} data-name="Nav">
                    {renderSection(layoutConfig?.components, 'Nav')}
                </StyledNav>
                {/* Main panel group: left drawer, editor, console, right drawer */}
                <PanelGroup
                    direction="horizontal"
                    autoSaveId="main-panels"
                    onLayout={handleSaveLayout}
                >
                    {/* Left drawer section */}
                    <Panel minSize={1} defaultSize={15}>
                        <LeftDrawer style={layoutConfig?.components?.styles?.LeftDrawer} data-name="LeftDrawer">
                            {renderSection(layoutConfig?.components, 'LeftDrawer')}
                        </LeftDrawer>
                    </Panel>

                    <HorizontalResizeHandle />

                    {/* Editor and console panels */}
                    <Panel minSize={1}>
                        <EditorArea style={layoutConfig?.components?.styles?.Editor} data-name="Editor">
                            <PanelGroup direction="vertical">
                                <Panel minSize={20}>
                                    <EditorPanel id="editors">
                                        {renderSection(layoutConfig?.components, 'Editor')}
                                    </EditorPanel>
                                </Panel>
                                <VerticalResizeHandle />
                                <Panel minSize={10}>
                                    <ConsolePanel id="console" className="console-area" style={layoutConfig?.components?.styles?.ConsolePanel} data-name="ConsolePanel">
                                        {renderSection(layoutConfig?.components, 'ConsolePanel')}
                                    </ConsolePanel>

                                </Panel>
                            </PanelGroup>
                        </EditorArea>
                    </Panel>

                    <HorizontalResizeHandle />

                    {/* Right drawer section */}
                    <Panel minSize={1} defaultSize={15}>
                        <RightDrawer style={layoutConfig?.components?.styles?.RightDrawer} data-name="RightDrawer">
                            {renderSection(layoutConfig?.components, 'RightDrawer')}
                        </RightDrawer>
                    </Panel>
                </PanelGroup>
            </StyledMain>

            {/* Footer section */}
            <StyledFooter style={layoutConfig?.components?.styles?.Footer}>
                {renderSection(layoutConfig?.components, 'Footer')}
            </StyledFooter>
        </StyledContainer>
    );
}

export default Layout;
