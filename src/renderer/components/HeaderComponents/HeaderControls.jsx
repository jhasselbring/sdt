import WindowControls from './WindowControls.jsx';
import LayoutControls from './LayoutControls.jsx';

const ResetIcon = () => (
    <span style={{ WebkitAppRegion: 'no-drag', fontSize: 22, color: '#a09ba8' }} className='codicon codicon-issue-reopened'></span>
);


export default function HeaderControls() {

    return (
        <>
            <div style={{ background: 'none', border: 'none', padding: 0, marginLeft: 8, borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.18s', WebkitAppRegion: 'no-drag' }} title="Reset App" aria-label="Reset App" onClick={() => {
                window.electronAPI?.data?.clearUserData?.();
            }}>
                <ResetIcon />
            </div>
            <LayoutControls />
            <WindowControls />
        </>
    );
}