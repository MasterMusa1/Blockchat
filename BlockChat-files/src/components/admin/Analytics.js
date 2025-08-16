import React from 'react';

const sectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
};

const cardStyle = {
    backgroundColor: 'var(--background-color)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
};

const cardTitleStyle = {
    margin: '0 0 10px',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
};

const cardValueStyle = {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--text-color)',
};

const Analytics = () => {
    return (
        <div style={sectionStyle}>
            <h2>Analytics Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Overview of platform activity and engagement.</p>
            <div style={gridStyle}>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Active Users (24h)</h3>
                    <p style={cardValueStyle}>1,234</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Messages Sent (24h)</h3>
                    <p style={cardValueStyle}>56,789</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>NFT Sales (24h)</h3>
                    <p style={cardValueStyle}>12 SOL</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>New Signups</h3>
                    <p style={cardValueStyle}>88</p>
                </div>
            </div>
             {/* Placeholder for charts */}
            <div style={{...cardStyle, marginTop: '20px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <p style={{color: 'var(--text-secondary)'}}>User Activity Chart Placeholder</p>
            </div>
        </div>
    );
};

export default Analytics;