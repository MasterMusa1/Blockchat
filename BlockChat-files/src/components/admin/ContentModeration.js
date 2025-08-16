import React, { useState, useEffect } from 'react';
import * as mockService from '../../services/mockService';

const sectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const itemStyle = {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
};

const itemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
};

const contentBodyStyle = {
    backgroundColor: 'var(--background-color)',
    padding: '10px',
    borderRadius: '6px',
    marginTop: '10px',
    wordBreak: 'break-word'
};

const buttonStyle = {
    padding: '8px 15px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '10px'
};

const smallTextStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    display: 'block',
    wordBreak: 'break-all'
};

const ContentModeration = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            const reports = await mockService.getReports();
            setItems(reports);
        };
        fetchReports();
    }, []);

    const handleAction = async (id, action) => {
        await mockService.resolveReport(id);
        setItems(prev => prev.filter(item => item.id !== id));
        if (action === 'remove') {
            alert(`Report for item ${id} resolved. Content removal logic would go here.`);
        } else {
             alert(`Report for item ${id} resolved. Content was approved.`);
        }
    };

    return (
        <div style={sectionStyle}>
            <h2>Content Moderation Queue</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Oversee user-generated content and enforce guidelines.</p>
            
            {items.length > 0 ? items.map(item => (
                <div key={item.id} style={itemStyle}>
                    <div style={itemHeaderStyle}>
                        <div>
                            <strong>Reported: {item.type}</strong>
                            <small style={smallTextStyle}>Reported by: {item.reporterWallet || item.reporter}</small>
                            {item.reportedUser && <small style={smallTextStyle}>Content by: {item.reportedUser}</small>}
                        </div>
                        <div>
                            <button style={{...buttonStyle, backgroundColor: 'var(--accent-color)', color: 'white'}} onClick={() => handleAction(item.id, 'approve')}>Approve</button>
                            <button style={{...buttonStyle, backgroundColor: 'var(--button-alert-color)', color: 'white'}} onClick={() => handleAction(item.id, 'remove')}>Remove Content</button>
                        </div>
                    </div>
                    <div style={contentBodyStyle}>
                        <p><strong>Content:</strong> {item.content}</p>
                        {item.context && <small style={smallTextStyle}>Context: {item.context}</small>}
                    </div>
                </div>
            )) : <p>The moderation queue is empty.</p>}
        </div>
    );
};

export default ContentModeration;