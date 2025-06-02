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
      display: flex;
      flex-direction: column;
      overflow: hidden;

      editor-window {
        height: var(--editor-height, 70%);
        background-color: #ffaaaa;
        overflow: auto;
      }

      .horizontal-resizer {
        height: 5px;
        background: rgba(255, 255, 255, 0.3);
        cursor: row-resize;
        z-index: 1;
      }

      .horizontal-resizer:hover {
        background: rgba(255, 255, 255, 0.6);
      }

      console-window {
        flex: 1;
        background-color: #aaaaff;
        overflow: auto;
      }
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
  const editorsRef = useRef(null);

  // Initialize drawer widths from localStorage or default 200px
  const [drawerWidths, setDrawerWidths] = useState(() => ({
    left: parseInt(localStorage.getItem('layout2-primary-drawer-width') || '200', 10),
    right: parseInt(localStorage.getItem('layout2-secondary-drawer-width') || '200', 10),
  }));

  // Read editor height % from localStorage synchronously for initial render
  const initialEditorHeightPercent = (() => {
    const stored = localStorage.getItem('layout2-editor-height-percent');
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val)) return val;
    }
    return 70; // default 70%
  })();

  // State for editor height %, initialized from localStorage
  const [editorHeightPercent, setEditorHeightPercent] = useState(initialEditorHeightPercent);

  // Immediately apply CSS variable inline during render to avoid flicker
  // This is done in the ref callback so that style is set before paint
  const setEditorsRef = (node) => {
    if (node) {
      node.style.setProperty('--editor-height', `${initialEditorHeightPercent}%`);
      editorsRef.current = node;
    }
  };

  useEffect(() => {
    const editorGroup = editorGroupRef.current;
    const editorsContainer = editorsRef.current;
    if (!editorGroup || !editorsContainer) return;

    const leftResizer = editorGroup.querySelector('.resizer[data-position="left"]');
    const rightResizer = editorGroup.querySelector('.resizer[data-position="right"]');
    const horizontalResizer = editorsContainer.querySelector('.horizontal-resizer');

    const createMouseDownHandler = (direction) => (e) => {
      e.preventDefault();
      const isLeft = direction === 'left';
      const drawer = isLeft ? primaryDrawerRef.current : secondaryDrawerRef.current;
      const startX = e.clientX;
      const startWidth = drawer.offsetWidth;

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const newWidth = isLeft ? startWidth + dx : startWidth - dx;
        // Removed min width of 100px to allow complete collapse
        drawer.style.width = `${Math.max(0, newWidth)}px`;
      };

      const onMouseUp = (e) => {
        const dx = e.clientX - startX;
        const newWidth = isLeft ? startWidth + dx : startWidth - dx;
        const width = Math.max(0, newWidth);

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

    const handleHorizontalResize = (e) => {
      e.preventDefault();
      const container = editorsContainer;
      const totalHeight = container.clientHeight;
      const startY = e.clientY;
      const editorWindow = container.querySelector('editor-window');
      const startHeight = editorWindow.offsetHeight;

      const onMouseMove = (e) => {
        const dy = e.clientY - startY;
        // Removed min height 100px, allowed min 0
        const newHeight = Math.min(totalHeight - 10, Math.max(0, startHeight + dy));
        const percent = (newHeight / totalHeight) * 100;
        container.style.setProperty('--editor-height', `${percent}%`);
      };

      const onMouseUp = (e) => {
        const dy = e.clientY - startY;
        const newHeight = Math.min(totalHeight - 10, Math.max(0, startHeight + dy));
        const percent = (newHeight / totalHeight) * 100;
        localStorage.setItem('layout2-editor-height-percent', percent.toString());
        setEditorHeightPercent(percent);

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    leftResizer?.addEventListener('mousedown', createMouseDownHandler('left'));
    rightResizer?.addEventListener('mousedown', createMouseDownHandler('right'));
    horizontalResizer?.addEventListener('mousedown', handleHorizontalResize);

    // Sync CSS var with current editorHeightPercent state (in case updated later)
    editorsContainer.style.setProperty('--editor-height', `${editorHeightPercent}%`);

    return () => {
      leftResizer?.removeEventListener('mousedown', createMouseDownHandler('left'));
      rightResizer?.removeEventListener('mousedown', createMouseDownHandler('right'));
      horizontalResizer?.removeEventListener('mousedown', handleHorizontalResize);
    };
  }, [editorHeightPercent]);

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
          <editors ref={setEditorsRef}>
            <editor-window>
              {renderSection(layoutConfig?.components, 'EditorWindow')}
            </editor-window>
            <div className="horizontal-resizer" />
            <console-window>
              {renderSection(layoutConfig?.components, 'ConsoleWindow')}
            </console-window>
          </editors>
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
      <div style={{ color: 'white', padding: 0 }}>
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
