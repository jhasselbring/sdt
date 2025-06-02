import React, { useEffect, useState, useRef } from 'react';
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

  nav {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
    width: 50px;
    height: 100%;
  }

  editor-group {
    flex: 1;
    height: 100%;
    background-color: blue;
    display: flex;
    width: 100%;
    overflow: hidden;

    primary-drawer,
    secondary-drawer {
      background-color: green;
      height: 100%;
      overflow: hidden;
    }

    editors {
      flex: 1;
      height: 100%;
      background-color: pink;
    }

    .resizer {
      width: 5px;
      background: rgba(255, 255, 255, 0.3);
      cursor: col-resize;
      z-index: 1;
    }

    .resizer:hover {
      background: rgba(255, 255, 255, 0.6);
    }
  }
`;

const StyledFooter = styled.footer`
  height: 30px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
`;

const Layout2 = ({
  layoutConfig = {},
  drawerState = { isLeftDrawerOpen: false, isRightDrawerOpen: false, isConsoleOpen: false },
}) => {
  const primaryDrawerRef = useRef(null);
  const secondaryDrawerRef = useRef(null);
  const editorGroupRef = useRef(null);

  const [drawerWidths, setDrawerWidths] = useState(() => ({
    left: parseInt(localStorage.getItem('layout2-primary-drawer-width') || '200', 10),
    right: parseInt(localStorage.getItem('layout2-secondary-drawer-width') || '200', 10),
  }));

  useEffect(() => {
    const editorGroup = editorGroupRef.current;
    if (!editorGroup) return;

    const leftResizer = editorGroup.querySelector('.resizer[data-position="left"]');
    const rightResizer = editorGroup.querySelector('.resizer[data-position="right"]');

    const createMouseDownHandler = (direction) => (e) => {
      e.preventDefault();
      const isLeft = direction === 'left';
      const drawer = isLeft ? primaryDrawerRef.current : secondaryDrawerRef.current;
      const startX = e.clientX;
      const startWidth = drawer.offsetWidth;

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const newWidth = isLeft ? startWidth + dx : startWidth - dx;
        drawer.style.width = `${Math.max(100, newWidth)}px`;
      };

      const onMouseUp = (e) => {
        const dx = e.clientX - startX;
        const newWidth = isLeft ? startWidth + dx : startWidth - dx;
        const width = Math.max(100, newWidth);

        const key = isLeft ? 'layout2-primary-drawer-width' : 'layout2-secondary-drawer-width';
        localStorage.setItem(key, width.toString());

        setDrawerWidths((prev) => ({
          ...prev,
          [isLeft ? 'left' : 'right']: width,
        }));

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    leftResizer?.addEventListener('mousedown', createMouseDownHandler('left'));
    rightResizer?.addEventListener('mousedown', createMouseDownHandler('right'));

    return () => {
      leftResizer?.removeEventListener('mousedown', createMouseDownHandler('left'));
      rightResizer?.removeEventListener('mousedown', createMouseDownHandler('right'));
    };
  }, []);

  return (
    <>
      <StyledHeader style={layoutConfig?.components?.styles?.Header}>
        {renderSection(layoutConfig?.components, 'Header')}
      </StyledHeader>
      <StyledMain>
        <nav>{renderSection(layoutConfig?.components, 'Nav')}</nav>
        <editor-group ref={editorGroupRef}>
          <primary-drawer
            ref={primaryDrawerRef}
            style={{ width: `${drawerWidths.left}px` }}
          >
            {renderSection(layoutConfig?.components, 'PrimaryDrawer')}
          </primary-drawer>
          <div className="resizer" data-position="left" />
          <editors>{renderSection(layoutConfig?.components, 'Editors')}</editors>
          <div className="resizer" data-position="right" />
          <secondary-drawer
            ref={secondaryDrawerRef}
            style={{ width: `${drawerWidths.right}px` }}
          >
            {renderSection(layoutConfig?.components, 'SecondaryDrawer')}
          </secondary-drawer>
        </editor-group>
      </StyledMain>
      <StyledFooter>
        {renderSection(layoutConfig?.components, 'Footer')}
      </StyledFooter>
    </>
  );
};

export default Layout2;

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
  return (
    <SectionComponent
      className="section-component"
      {...(sectionStyles ? { style: sectionStyles } : {})}
    />
  );
}
