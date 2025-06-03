import styled from 'styled-components';

const WindowControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  -webkit-app-region: no-drag
`;
const WindowButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 8px;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.18s;
  &:hover:has(svg rect[fill="#e11d2b"]) svg rect {
    fill: #b3131f;
  }
    -webkit-app-region: no-drag
`;

const MinimizeIcon = () => (
    <span className="codicon codicon-chrome-minimize" style={{ fontSize: 22, color: '#a09ba8' }} />
  );
  const MaximizeIcon = () => (
    <span className="codicon codicon-chrome-maximize" style={{ fontSize: 22, color: '#a09ba8' }} />
  );
  const CloseIcon = () => (
    <span className="codicon codicon-close" style={{ fontSize: 22, color: '#e11d2b' }} />
  );

export default function WindowControls() {
    return (
        <WindowControlsContainer>
        <WindowButton title="Minimize" aria-label="Minimize" onClick={() => {
          window.electronAPI?.window?.minimize?.();
        }}>
          <MinimizeIcon />
        </WindowButton>
        <WindowButton title="Maximize" aria-label="Maximize" onClick={() => {
          window.electronAPI?.window?.maximize?.();
        }}>
          <MaximizeIcon />
        </WindowButton>
        <WindowButton title="Close" aria-label="Close" onClick={() => {
          window.electronAPI?.window?.close?.();
        }}>
          <CloseIcon />
        </WindowButton>

      </WindowControlsContainer>
    );
}