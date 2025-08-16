import React, { useState } from 'react';

const sectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
    marginBottom: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};

const thStyle = {
    borderBottom: '2px solid var(--border-color)',
    padding: '12px',
    textAlign: 'left',
    color: 'var(--text-secondary)',
};

const tdStyle = {
    borderBottom: '1px solid var(--border-color)',
    padding: '12px',
    color: 'var(--text-color)',
    wordBreak: 'break-all',
};

const actionButtonStyle = {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '5px'
};

const mockUsers = [
    { id: '1', address: 'user1walletaddress...', name: 'Alice', role: 'User', status: 'Active' },
    { id: '2', address: 'user2walletaddress...', name: 'Bob', role: 'User', status: 'Active' },
    { id: '3', address: 'user3walletaddress...', name: 'Charlie', role: 'Moderator', status: 'Active' },
    { id: '4', address: 'user4walletaddress...', name: 'David', role: 'User', status: 'Banned' },
];

const UserManagement = () => {
    const [users, setUsers] = useState(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user => 
        user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={sectionStyle}>
            <h2>User Management</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Control roles, permissions, and user accounts.</p>
            <input 
                style={inputStyle}
                placeholder="Search by wallet address or display name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div style={{overflowX: 'auto'}}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Address</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td style={tdStyle}>{user.address}</td>
                                <td style={tdStyle}>{user.name}</td>
                                <td style={tdStyle}>{user.role}</td>
                                <td style={tdStyle}>{user.status}</td>
                                <td style={tdStyle}>
                                    <button style={actionButtonStyle}>Mute</button>
                                    <button style={actionButtonStyle}>Ban</button>
                                    <button style={actionButtonStyle}>Set Role</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;