import React, { useEffect, useRef } from 'react';

const menuStyle = {
    position: 'absolute',
    top: '50px',
    right: '20px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10,
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    minWidth: '180px',
};

const itemStyle = {
    padding: '12px 18px',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const itemHoverStyle = {
    backgroundColor: 'var(--background-color)',
};

const deleteItemStyle = {
    ...itemStyle,
    color: 'var(--button-alert-color)',
};

const ChatHeaderMenu = ({ items, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div style={menuStyle} ref={menuRef}>
            {items.map((item, index) => (
                <button
                    key={index}
                    style={item.isDestructive ? deleteItemStyle : itemStyle}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--background-color)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default ChatHeaderMenu;