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
    width: 50px;
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
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
        background-color: #ffaaaa;
        overflow: auto;
        /* height set dynamically */
      }

      .horizontal-resizer {
        height: 5px;
        background: rgba(255, 255, 255, 0.3);
        cursor: row-resize;
        z-index: 1;
        user-select: none;
      }

      .horizontal-resizer:hover {
        background: rgba(255, 255, 255, 0.6);
      }

      console-window {
        background-color: #aaaaff;
        overflow: hidden;
        /* height set dynamically */
      }
    }

    .resizer {
      width: 5px;
      background: rgba(255, 255, 255, 0.3);
      cursor: col-resize;
      z-index: 1;
      user-select: none;
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
  drawerState = { isPrimaryDrawerOpen: false, isSecondaryDrawerOpen: false, isConsoleOpen: false },
}) => {
  const primaryDrawerRef = useRef(null);
  const secondaryDrawerRef = useRef(null);
  const editorGroupRef = useRef(null);
  const editorsRef = useRef(null);
  const editorWindowRef = useRef(null);
  const consoleWindowRef = useRef(null);

  // Initialize drawer widths from localStorage or default 200px
  const [drawerWidths, setDrawerWidths] = useState(() => ({
    left: parseInt(localStorage.getItem('layout2-primary-drawer-width') || '200', 10),
    right: parseInt(localStorage.getItem('layout2-secondary-drawer-width') || '200', 10),
  }));

  // Initialize editor window height percentage from localStorage or default 70%
  const [editorHeightPercent, setEditorHeightPercent] = useState(() => {
    const stored = localStorage.getItem('layout2-editor-height-percent');
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val)) return val;
    }
    return 70;
  });

  // Set explicit heights on editor-window and console-window refs after render
  useEffect(() => {
    if (editorsRef.current && editorWindowRef.current && consoleWindowRef.current) {
      const totalHeight = editorsRef.current.clientHeight;
      const editorHeightPx = (editorHeightPercent / 100) * totalHeight;
      const consoleHeightPx = totalHeight - editorHeightPx;

      editorWindowRef.current.style.height = `${editorHeightPx}px`;
      consoleWindowRef.current.style.height = `${consoleHeightPx}px`;
    }
  }, [editorHeightPercent]);

  useEffect(() => {
    const editorGroup = editorGroupRef.current;
    const editorsContainer = editorsRef.current;

    if (!editorGroup || !editorsContainer) return;

    // Left and right drawer resizers
    const leftResizer = editorGroup.querySelector('.resizer[data-position="left"]');
    const rightResizer = editorGroup.querySelector('.resizer[data-position="right"]');

    // Horizontal resizer for vertical resizing (editor-console)
    const horizontalResizer = editorsContainer.querySelector('.horizontal-resizer');

    // Helper for drawer resizing (left/right)
    const createMouseDownHandler = (direction) => (e) => {
      e.preventDefault();
      const isLeft = direction === 'left';
      const drawer = isLeft ? primaryDrawerRef.current : secondaryDrawerRef.current;
      const startX = e.clientX;
      const startWidth = drawer.offsetWidth;

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const newWidth = isLeft ? startWidth + dx : startWidth - dx;
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

    // Mouse down handler for vertical resize between editor and console
    const onHorizontalResizerMouseDown = (e) => {
      e.preventDefault();

      if (!editorsContainer || !editorWindowRef.current || !consoleWindowRef.current) return;

      const totalHeight = editorsContainer.clientHeight;
      const startY = e.clientY;
      const startEditorHeight = editorWindowRef.current.offsetHeight;

      // Keep track of height percent locally during drag
      let newEditorHeightPercent = editorHeightPercent;

      const onMouseMove = (e) => {
        const dy = e.clientY - startY;
        let newEditorHeight = startEditorHeight + dy;

        // Clamp height between 0 and totalHeight
        newEditorHeight = Math.max(0, Math.min(newEditorHeight, totalHeight));

        newEditorHeightPercent = (newEditorHeight / totalHeight) * 100;

        setEditorHeightPercent(newEditorHeightPercent);

        editorWindowRef.current.style.height = `${newEditorHeight}px`;
        consoleWindowRef.current.style.height = `${totalHeight - newEditorHeight}px`;
      };

      const onMouseUp = (e) => {
        // Persist final size in localStorage from local variable, not state
        localStorage.setItem('layout2-editor-height-percent', newEditorHeightPercent.toString());

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    leftResizer?.addEventListener('mousedown', createMouseDownHandler('left'));
    rightResizer?.addEventListener('mousedown', createMouseDownHandler('right'));
    horizontalResizer?.addEventListener('mousedown', onHorizontalResizerMouseDown);

    return () => {
      leftResizer?.removeEventListener('mousedown', createMouseDownHandler('left'));
      rightResizer?.removeEventListener('mousedown', createMouseDownHandler('right'));
      horizontalResizer?.removeEventListener('mousedown', onHorizontalResizerMouseDown);
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
          <editors ref={editorsRef}>
            <editor-window ref={editorWindowRef}>
              {renderSection(layoutConfig?.components, 'EditorWindow')}
            </editor-window>
            <div className="horizontal-resizer" />
            <console-window ref={consoleWindowRef}>
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
