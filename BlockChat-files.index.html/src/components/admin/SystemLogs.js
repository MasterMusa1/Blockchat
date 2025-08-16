import React from 'react';

const sectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const logContainerStyle = {
    backgroundColor: '#000',
    color: '#0f0',
    fontFamily: 'monospace',
    padding: '15px',
    borderRadius: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
};

const mockLogs = [
    '2024-05-21 10:00:01 [INFO] - User user1wallet... logged in.',
    '2024-05-21 10:01:23 [TX] - User user2wallet... purchased 100 credits.',
    '2024-05-21 10:02:45 [WARN] - Failed login attempt for user3wallet....',
    '2024-05-21 10:03:11 [INFO] - Admin F73Qh... accessed admin dashboard.',
    '2024-05-21 10:05:00 [ERROR] - Failed to process NFT purchase tx: 1234abcd...',
];

const SystemLogs = () => {
    return (
        <div style={sectionStyle}>
            <h2>System Logs</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track activities and events for security and troubleshooting.</p>
            <div style={logContainerStyle}>
                {mockLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default SystemLogs;