import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, onAction, onClose, item }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleAction = (action) => {
        onAction(action, item);
        onClose();
    };

    return (
        <div className="context-menu" style={{ top: y, left: x }} ref={menuRef}>
            <button className="context-menu-item" onClick={() => handleAction('rename')}>
                <span>✏️</span> Rename
            </button>
            <button className="context-menu-item" onClick={() => handleAction('share')}>
                <span>🔗</span> Share
            </button>
            <button className="context-menu-item" onClick={() => handleAction('download')}>
                <span>⬇️</span> Download
            </button>
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
            <button className="context-menu-item delete" onClick={() => handleAction('delete')}>
                <span>🗑️</span> Delete
            </button>
        </div>
    );
};

export default ContextMenu;