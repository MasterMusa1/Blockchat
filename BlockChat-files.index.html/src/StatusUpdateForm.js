import React, { useState } from 'react';

const formStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const textareaStyle = {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '1rem',
    resize: 'vertical',
    marginBottom: '10px',
};

const buttonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    float: 'right',
    transition: 'background-color 0.2s',
};


const StatusUpdateForm = ({ onPostUpdate }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onPostUpdate(content);
        setContent('');
    };

    return (
        <form style={formStyle} onSubmit={handleSubmit}>
            <textarea
                style={textareaStyle}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit" style={buttonStyle}>Post</button>
        </form>
    );
};

export default StatusUpdateForm;