import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

const StyledHeader = styled.header`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;
const StyledHeaderShadow = styled.header`
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
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  editor-group {
    flex: 1;
    height: 100%;
    display: flex;
    width: 100%;
    overflow: hidden;

    primary-drawer,
    secondary-drawer {
      height: 100%;
      overflow: hidden;
    }

    editors-container {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      editor-window {
        overflow: auto;
        /* height set dynamically */
      }

      .horizontal-resizer {
        height: 5px;
        background: rgba(255, 255, 255, 0.05);
        cursor: row-resize;
        z-index: 1;
        user-select: none;
      }

      .horizontal-resizer:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      console-window {
        overflow: hidden;
        /* height set dynamically */
      }
    }

    .resizer {
      width: 5px;
      background: rgba(255, 255, 255, 0.05);
      cursor: col-resize;
      z-index: 1;
      user-select: none;
    }

    .resizer:hover {
      background: rgba(255, 255, 255, 0.1);
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

  // Log whenever isPrimaryDrawerOpen updates
  useEffect(() => {
    console.log('isPrimaryDrawerOpen updated:', drawerState.isPrimaryDrawerOpen);
  }, [drawerState.isPrimaryDrawerOpen]);

  // Log whenever isSecondaryDrawerOpen updates
  useEffect(() => {
    console.log('isSecondaryDrawerOpen updated:', drawerState.isSecondaryDrawerOpen);
  }, [drawerState.isSecondaryDrawerOpen]);

  // Log whenever isConsoleOpen updates
  useEffect(() => {
    console.log('isConsoleOpen updated:', drawerState.isConsoleOpen);
  }, [drawerState.isConsoleOpen]);

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

  useEffect(() => {
    if (!primaryDrawerRef.current) return;

    if (!drawerState.isPrimaryDrawerOpen) {
      // Collapse, but do NOT overwrite stored width
      primaryDrawerRef.current.style.width = '0px';
      setDrawerWidths((prev) => ({ ...prev, left: 0 }));
    } else {
      // Restore to previous width (fallback to 200 if not set)
      const storedWidth = parseInt(localStorage.getItem('layout2-primary-drawer-width') || '200', 10);
      const width = storedWidth > 0 ? storedWidth : 200;

      primaryDrawerRef.current.style.width = `${width}px`;
      setDrawerWidths((prev) => ({ ...prev, left: width }));
    }
  }, [drawerState.isPrimaryDrawerOpen]);

  useEffect(() => {
    if (!secondaryDrawerRef.current) return;

    if (!drawerState.isSecondaryDrawerOpen) {
      // Collapse, but do NOT overwrite stored width
      secondaryDrawerRef.current.style.width = '0px';
      setDrawerWidths((prev) => ({ ...prev, right: 0 }));
    } else {
      // Restore to previous width (fallback to 200 if not set)
      const storedWidth = parseInt(localStorage.getItem('layout2-secondary-drawer-width') || '200', 10);
      const width = storedWidth > 0 ? storedWidth : 200;

      secondaryDrawerRef.current.style.width = `${width}px`;
      setDrawerWidths((prev) => ({ ...prev, right: width }));
    }
  }, [drawerState.isSecondaryDrawerOpen]);

  useEffect(() => {
    const editorsEl = editorsRef.current;
    const editorEl = editorWindowRef.current;
    const consoleEl = consoleWindowRef.current;

    if (!editorsEl || !editorEl || !consoleEl) return;

    const editorsHeight = editorsEl.clientHeight;

    if (!drawerState.isConsoleOpen) {
      // Collapse console
      consoleEl.style.height = '0px';
      editorEl.style.height = `${editorsHeight}px`;
      // Do NOT overwrite the stored percent!
      setEditorHeightPercent(100);
    } else {
      // Restore previous height percent
      requestAnimationFrame(() => {
        // Use the last stored percent, but if it's 100, fallback to 70
        let storedPercent = parseFloat(localStorage.getItem('layout2-editor-height-percent') || '70');
        if (storedPercent === 100) storedPercent = 70;
        const newEditorHeight = (storedPercent / 100) * editorsHeight;
        const newConsoleHeight = editorsHeight - newEditorHeight;

        editorEl.style.height = `${newEditorHeight}px`;
        consoleEl.style.height = `${newConsoleHeight}px`;

        setEditorHeightPercent(storedPercent);
      });
    }
  }, [drawerState.isConsoleOpen]);


  return (
    <>
      <StyledHeaderShadow style={layoutConfig?.components?.styles?.HeaderShadow}>
      </StyledHeaderShadow>
      <StyledHeader style={layoutConfig?.components?.styles?.Header}>
        {renderSection(layoutConfig?.components, 'Header')}
      </StyledHeader>
      <StyledMain style={layoutConfig?.components?.styles?.Main}>
        <nav style={layoutConfig?.components?.styles?.Nav}>{renderSection(layoutConfig?.components, 'Nav')}</nav>
        <editor-group style={layoutConfig?.components?.styles?.EditorGroup} ref={editorGroupRef}>
          <primary-drawer
            ref={primaryDrawerRef}
            style={{ width: `${drawerWidths.left}px`, ...(layoutConfig?.components?.styles?.PrimaryDrawer || {}) }}
          >
            {renderSection(layoutConfig?.components, 'PrimaryDrawer')}
          </primary-drawer>
          <div style={layoutConfig?.components?.styles?.VerticalResizer} className="resizer" data-position="left" />
          <editors-container ref={editorsRef} style={layoutConfig?.components?.styles?.EditorsContainer}>
            <editor-window ref={editorWindowRef} style={layoutConfig?.components?.styles?.EditorWindow}>
              {renderSection(layoutConfig?.components, 'EditorWindow')}
            </editor-window>
            <div style={layoutConfig?.components?.styles?.HorizontalResizer} className="horizontal-resizer" />
            <console-window ref={consoleWindowRef} style={layoutConfig?.components?.styles?.Console}>
              {renderSection(layoutConfig?.components, 'ConsoleWindow')}
            </console-window>
          </editors-container>
          <div style={layoutConfig?.components?.styles?.VerticalResizer} className="resizer" data-position="right" />
          <secondary-drawer
            ref={secondaryDrawerRef}
            style={{ width: `${drawerWidths.right}px`, ...(layoutConfig?.components?.styles?.SecondaryDrawer || {}) }}
          >
            {renderSection(layoutConfig?.components, 'SecondaryDrawer')}
          </secondary-drawer>
        </editor-group>
      </StyledMain>
      <StyledFooter style={layoutConfig?.components?.styles?.Footer}>
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
