import { useAppContext } from '../../context/AppContext.jsx';
import styled from 'styled-components';

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  margin-left: 8px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background 0.18s;
  &:hover, &:focus {
    background: rgba(255,255,255,0.08);
    outline: none;
  }
    -webkit-app-region: no-drag
`;
const LeftDrawerIcon = () => (
    <span className="codicon codicon-layout-sidebar-left" style={{ fontSize: 22, color: '#a09ba8' }} />
  );
  const ConsoleIcon = () => (
    <span className="codicon codicon-layout-panel" style={{ fontSize: 22, color: '#a09ba8' }} />
  );
  const RightDrawerIcon = () => (
    <span className="codicon codicon-layout-sidebar-right" style={{ fontSize: 22, color: '#a09ba8' }} />
  );
  
export default function LayoutControls() {
    const {
        state,
        togglePrimaryDrawer,
        toggleSecondaryDrawer,
        toggleConsole
      } = useAppContext();
    return (
        <div>
            <IconButton onClick={togglePrimaryDrawer} title="Toggle Primary Drawer" aria-label="Toggle Primary Drawer">
                <LeftDrawerIcon />
            </IconButton>
            <IconButton onClick={toggleConsole} title="Toggle Console" aria-label="Toggle Console">
                <ConsoleIcon />
            </IconButton>
            <IconButton onClick={toggleSecondaryDrawer} title="Toggle Secondary Drawer" aria-label="Toggle Secondary Drawer">
                <RightDrawerIcon />
            </IconButton>
        </div>
    );
}
