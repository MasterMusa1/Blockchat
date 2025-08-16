import React, { useState } from 'react';

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const modalContentStyle = {
    backgroundColor: 'var(--surface-color)', padding: '30px', borderRadius: '12px',
    width: '90%', maxWidth: '500px', color: 'var(--text-color)', position: 'relative',
};
const closeButtonStyle = {
    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
    fontSize: '1.5rem', position: 'absolute', top: '15px', right: '20px', cursor: 'pointer',
};
const inputStyle = {
    width: '100%', padding: '12px', backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)',
    fontSize: '1rem', marginTop: '10px',
};
const buttonStyle = {
    backgroundColor: 'var(--button-alert-color)', color: 'white', border: 'none',
    padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
    marginTop: '20px', fontWeight: 'bold', width: '100%',
};

const reportReasons = [
    'Spam',
    'Harassment or Hate Speech',
    'Threats or Violence',
    'Inappropriate Content',
    'Impersonation',
    'Other'
];

const ReportModal = ({ isOpen, onClose, onSubmit, itemToReport }) => {
    const [reason, setReason] = useState(reportReasons[0]);
    const [details, setDetails] = useState('');

    const handleSubmit = () => {
        if (!reason) {
            alert('Please select a reason for the report.');
            return;
        }
        onSubmit({ ...itemToReport, reason, details });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>Report Content</h2>
                <p style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>You are reporting: <strong>{itemToReport.content}</strong></p>
                
                <label>Reason</label>
                <select style={inputStyle} value={reason} onChange={e => setReason(e.target.value)}>
                    {reportReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <label>Additional Details (optional)</label>
                <textarea style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} value={details} onChange={e => setDetails(e.target.value)} />

                <button style={buttonStyle} onClick={handleSubmit}>Submit Report</button>
            </div>
        </div>
    );
};

export default ReportModal;