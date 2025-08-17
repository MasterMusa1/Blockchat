import React, { useEffect, useRef } from 'react';

const MessageContextMenu = ({ x, y, onAction, onClose, message, isMyMessage, isGroupChat }) => {
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
        onAction(action, message);
        onClose();
    };

    return (
        <div className="context-menu" style={{ top: y, left: x }} ref={menuRef}>
            {isMyMessage ? (
                <button className="context-menu-item delete" onClick={() => handleAction('delete')}>
                    <span>🗑️</span> Delete
                </button>
            ) : (
                <>
                    <button className="context-menu-item" onClick={() => handleAction('report')}>
                        <span>🚩</span> Report
                    </button>
                    {!isGroupChat && (
                         <button className="context-menu-item delete" onClick={() => handleAction('block')}>
                            <span>🚫</span> Block User
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default MessageContextMenu;