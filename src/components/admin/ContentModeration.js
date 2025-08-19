import React, { useState, useEffect } from 'react';
import * as dataService from '../../services/dataService';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reports = await dataService.getReports();
                setItems(reports.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                alert("Could not fetch reports from the backend.");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleAction = async (report, action) => {
        const originalItems = [...items];
        setItems(prev => prev.filter(item => item.id !== report.id));

        try {
            if (action === 'remove') {
                await dataService.resolveReport(report.id, 'REMOVED_RESOLVED');
                alert(`Report for item resolved. Content should be manually removed.`);
            } else {
                 await dataService.resolveReport(report.id, 'APPROVED_RESOLVED');
                 alert(`Report for item resolved. Content was approved.`);
            }
        } catch (error) {
            console.error("Failed to resolve report:", error);
            alert("Failed to resolve report. It has been added back to the queue.");
            setItems(originalItems);
        }
    };
    
    if (loading) return <p>Loading moderation queue...</p>;

    return (
        <div style={sectionStyle}>
            <h2>Content Moderation Queue</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Oversee user-generated content and enforce guidelines.</p>
            
            {items.length > 0 ? items.map(item => (
                <div key={item.id} style={itemStyle}>
                    <div style={itemHeaderStyle}>
                        <div>
                            <strong>Reported: {item.type}</strong>
                            <small style={smallTextStyle}>Reason: {item.reason}</small>
                            <small style={smallTextStyle}>Reported by: {item.reporterWallet}</small>
                            {item.reportedUserWallet && <small style={smallTextStyle}>Content by: {item.reportedUserWallet}</small>}
                        </div>
                        <div>
                            <button style={{...buttonStyle, backgroundColor: 'var(--accent-color)', color: 'white'}} onClick={() => handleAction(item, 'approve')}>Approve</button>
                            <button style={{...buttonStyle, backgroundColor: 'var(--button-alert-color)', color: 'white'}} onClick={() => handleAction(item, 'remove')}>Remove Content</button>
                        </div>
                    </div>
                    <div style={contentBodyStyle}>
                        <p><strong>Content:</strong> {item.content}</p>
                        {item.details && <small style={smallTextStyle}>Details: {item.details}</small>}
                    </div>
                </div>
            )) : <p>The moderation queue is empty.</p>}
        </div>
    );
};

export default ContentModeration;