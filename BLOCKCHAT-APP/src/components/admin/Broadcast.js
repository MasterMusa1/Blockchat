import React, { useState } from 'react';
import * as mockService from '../../services/mockService';

const formSectionStyle = {
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
    marginBottom: '10px'
};

const buttonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const Broadcast = () => {
    const [segment, setSegment] = useState('all');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            alert('Please enter a message to broadcast.');
            return;
        }
        setLoading(true);
        try {
            const count = await mockService.sendBroadcastMessage(segment, message);
            alert(`Broadcast successfully sent to ${count} user(s).`);
            setMessage('');
        } catch (error) {
            alert('Failed to send broadcast message.');
            console.error('Broadcast error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={formSectionStyle}>
            <h2>Broadcast Message</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Send a message to a segment of users. Messages will be from 'Official BlockChat'.</p>
            
            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>User Segment</label>
            <select style={inputStyle} value={segment} onChange={e => setSegment(e.target.value)}>
                <option value="all">All Users</option>
                <option value="new">New Users (last 24h)</option>
                <option value="vip">VIPs</option>
                <option value="frequent">Frequent Users (Mock)</option>
            </select>

            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Message</label>
            <textarea 
                style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Your message here..." 
            />
            
            <button style={buttonStyle} onClick={handleSend} disabled={loading}>
                {loading ? 'Sending...' : `Send to ${segment} users`}
            </button>
        </div>
    );
};

export default Broadcast;