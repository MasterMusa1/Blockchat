import React from 'react';

const sectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
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

const mockTickets = [
    { id: 'T001', user: 'user1wallet...', subject: 'Cannot buy credits', status: 'Open' },
    { id: 'T002', user: 'user2wallet...', subject: 'NFT not showing in profile', status: 'In Progress' },
    { id: 'T003', user: 'user3wallet...', subject: 'Feature request: Gifs', status: 'Closed' },
];

const Support = () => {
    const tickets = mockTickets;

    return (
        <div style={sectionStyle}>
            <h2>Support Tickets</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage user inquiries and feedback.</p>
            <div style={{overflowX: 'auto'}}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Ticket ID</th>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Subject</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td style={tdStyle}>{ticket.id}</td>
                                <td style={tdStyle}>{ticket.user}</td>
                                <td style={tdStyle}>{ticket.subject}</td>
                                <td style={tdStyle}>{ticket.status}</td>
                                <td style={tdStyle}>
                                    <button style={actionButtonStyle}>View</button>
                                    <button style={actionButtonStyle}>Close</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Support;