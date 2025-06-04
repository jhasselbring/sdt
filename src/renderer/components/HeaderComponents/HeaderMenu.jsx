import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import theme from '../../theme';
import { useAppContext } from '../../context/AppContext.jsx';
import NewProjectForm from '../NewProjectForm.jsx';
// Menu bar container for menu items
const MenuBar = styled.nav`
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 22px;
  position: relative;
  & > div{  
    position: relative;
    & > span{
          color: #e0e0e0;
          font-size: 0.98rem;
          font-family: ${theme.fonts.main};
          padding: 3px 12px 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          &:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
          }
          &:active {
            background: rgba(255,255,255,0.16);
            color: #fff;
        }
    }
    & > div {
        position: absolute;
        top: 32px;
        left: 0;
        background: #23232a;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        box-shadow: 0 2px 8px #0006;
        width: 180px;
        z-index: 1000;
        padding: 6px 0;
        & > div {
                color: #e0e0e0;
                font-size: 0.97rem;
                font-family: ${theme.fonts.main};
                padding: 7px 20px 7px 18px;
                cursor: pointer;
                transition: background 0.18s, color 0.18s;
                &:hover {
                    background: rgba(255,255,255,0.10);
                    color: #fff;
                }
        }
    }
  }
`;

export default function HeaderMenu() {
    const [openMenu, setOpenMenu] = useState(null);
    const menuRefs = useRef({});
    const { setState } = useAppContext();

    const menuItems = {
        "File": {
            "New Project": () => {
                setState(s => ({
                    ...s,
                    componentSections: {
                        ...s.componentSections,
                        Modal: (props) => <NewProjectForm {...props} onClose={() => setState(s2 => ({
                            ...s2,
                            componentSections: {
                                ...s2.componentSections,
                                Modal: null
                            }
                        }))} />
                    }
                }));
            },
            "Open Project": () => {
                // TODO: Implement Open Project logic
                alert('Open Project clicked');
            }
        },
        "View": {
            "Primary Sidebar": () => {
                // TODO: Implement Toggle Sidebar logic
                alert('Toggle Sidebar clicked');
            },
            "Secondary Sidebar": () => {
                // TODO: Implement Toggle Sidebar logic
                alert('Toggle Sidebar clicked');
            },
            "Console": () => {
                // TODO: Implement Toggle Console logic
                alert('Toggle Console clicked');
            }
        },
        "Help": {
            "About": () => {
                // TODO: Implement About logic
                alert('About clicked');
            },
            "Check for Updates": () => {
                // TODO: Implement Check for Updates logic
                alert('Check for Updates clicked');
            }
        }
    };
    useEffect(() => {
        if (!openMenu) return;
        function handleClick(e) {
            const ref = menuRefs.current[openMenu];
            if (ref && !ref.contains(e.target)) {
                setOpenMenu(null);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [openMenu]);


    return (<MenuBar>
        {Object.keys(menuItems).map((menu) => (
            <div key={menu} ref={el => menuRefs.current[menu] = el}>
                <span
                    onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
                    aria-haspopup="true"
                    aria-expanded={openMenu === menu}
                    tabIndex={0}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') setOpenMenu(openMenu === menu ? null : menu);
                        if (e.key === 'Escape') setOpenMenu(null);
                    }}
                >
                    {menu}
                </span>
                {openMenu === menu && (
                    <div>
                        {Object.entries(menuItems[menu]).map(([label, handler]) => (
                            <div key={label} onClick={() => { setOpenMenu(null); handler(); }} >
                                {label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}
    </MenuBar>
    );
}