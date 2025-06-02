import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledHeader = styled.header`
height: 30px;
margin: 0;
padding: 0;
box-sizing: border-box;
overflow: hidden;
`;
const StyledMain = styled.main`
height: calc(100vh - 60px);
margin: 0;
padding: 0;
box-sizing: border-box;
overflow: hidden;
display: flex;

nav{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  width: 50px;
  height: 100%;
}

editor-group{
  flex: 1;
  height: 100%;
  background-color: blue;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;

  primary-drawer,
  secondary-drawer {
    resize: horizontal;
    overflow: auto;
    background-color: green;
    height: 100%;
    overflow: hidden;
  }

  editors{
    flex: 1;
    height: 100%;
    background-color: pink;
  }
}`;
const StyledFooter = styled.footer`
height: 30px;
margin: 0;
padding: 0;
box-sizing: border-box;
overflow: hidden;
`;



const Layout2 = ({
  layoutConfig = {},
  drawerState = { isLeftDrawerOpen: false, isRightDrawerOpen: false, isConsoleOpen: false }
}) => {
  return (
    <>
      <StyledHeader style={layoutConfig?.components?.styles?.Header}>{renderSection(layoutConfig?.components, 'Header')}</StyledHeader>
      <StyledMain>
        <nav>
          {renderSection(layoutConfig?.components, 'Nav')}
        </nav>
        <editor-group>
          <primary-drawer> {renderSection(layoutConfig?.components, 'PrimaryDrawer')} </primary-drawer>
          <editors> {renderSection(layoutConfig?.components, 'PrimaryDrawer')} </editors>
          <secondary-drawer> {renderSection(layoutConfig?.components, 'SecondaryDrawer')} </secondary-drawer>
        </editor-group>
      </StyledMain>
      <StyledFooter>{renderSection(layoutConfig?.components, 'Footer')}</StyledFooter>
    </>
  );
};

export default Layout2;

// Utility: Render a layout section by name
function renderSection(components, section) {
  const SectionComponent = components?.[section];
  const sectionStyles = components?.styles?.[section];
  if (!SectionComponent) {
    return (
      <div style={{ color: 'white', padding: '0' }}>
        Please provide <code>components.{section}</code> to customize this component to the Layout component.
      </div>
    );
  }
  return <SectionComponent className="section-component" {...(sectionStyles ? { style: sectionStyles } : {})} />;
}
