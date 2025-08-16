import React from 'react';

const systemMessageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0',
};

const systemMessageStyle = {
    padding: '8px 15px',
    backgroundColor: 'var(--background-color)',
    color: 'var(--text-secondary)',
    borderRadius: '20px',
    textAlign: 'center',
    fontSize: '0.85rem',
    maxWidth: '80%',
    lineHeight: '1.4',
};

const errorStyle = {
    ...systemMessageStyle,
    backgroundColor: 'rgba(255, 99, 71, 0.15)', // Light Coral background
    color: 'var(--button-alert-color)',
    border: '1px solid var(--button-alert-color)',
    fontWeight: '500',
};

const SystemMessage = ({ text, isError = false }) => {
    return (
        <div style={systemMessageContainerStyle}>
            <div style={isError ? errorStyle : systemMessageStyle}>
                {text}
            </div>
        </div>
    );
};

export default SystemMessage;