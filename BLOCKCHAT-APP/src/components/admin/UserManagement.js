import React, { useState, useEffect } from 'react';
import * as dataService from '../../services/dataService';

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

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await dataService.listAllUsers();
            setUsers(allUsers);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleResetUsername = async (walletAddress) => {
        if(window.confirm("Are you sure you want to reset this user's name? This cannot be undone.")) {
            const updatedUser = await dataService.resetUsername(walletAddress);
            setUsers(prev => prev.map(u => u.walletAddress === walletAddress ? updatedUser : u));
            alert("Username has been reset.");
        }
    };
    
    const handleToggleVerify = async (walletAddress, currentStatus) => {
        const updatedUser = await dataService.toggleUserVerification(walletAddress, currentStatus);
        setUsers(prev => prev.map(u => u.walletAddress === walletAddress ? updatedUser : u));
    }

    const filteredUsers = users.filter(user =>
        user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (loading) return <p>Loading users...</p>;

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
                            <th style={thStyle}>Verified</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.walletAddress}>
                                <td style={tdStyle}>{user.walletAddress}</td>
                                <td style={tdStyle}>{user.displayName}</td>
                                <td style={tdStyle}>{user.isVerified ? 'Yes' : 'No'}</td>
                                <td style={tdStyle}>
                                    <button style={actionButtonStyle} onClick={() => handleToggleVerify(user.walletAddress, user.isVerified)}>
                                        {user.isVerified ? 'Un-verify' : 'Verify'}
                                    </button>
                                    <button style={actionButtonStyle} onClick={() => handleResetUsername(user.walletAddress)}>Reset Name</button>
                                    <button style={actionButtonStyle}>Mute</button>
                                    <button style={actionButtonStyle}>Ban</button>
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