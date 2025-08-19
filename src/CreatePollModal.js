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
const optionInputContainer = { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' };

const CreatePollModal = ({ isOpen, onClose, onCreatePoll }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

    const handleCreate = () => {
        const filledOptions = options.map(o => o.trim()).filter(o => o);
        if (!question.trim() || filledOptions.length < 2) {
            alert('Please provide a question and at least two non-empty options.');
            return;
        }
        onCreatePoll({ question: question.trim(), options: filledOptions });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>Create a New Poll</h2>
                <input style={inputStyle} placeholder="Poll Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
                <h4 style={{marginTop: '20px', marginBottom: '5px'}}>Options</h4>
                {options.map((option, index) => (
                    <div key={index} style={optionInputContainer}>
                        <input style={{...inputStyle, marginTop: 0, flex: 1}} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />
                        <button onClick={() => removeOption(index)} disabled={options.length <= 2}>&times;</button>
                    </div>
                ))}
                <button onClick={addOption} style={{...buttonStyle, fontSize: '0.9rem', padding: '8px', width: 'auto', marginTop: '10px', backgroundColor: 'var(--primary-color)'}}>+ Add Option</button>
                <button style={buttonStyle} onClick={handleCreate}>Create Poll</button>
            </div>
        </div>
    );
};

export default CreatePollModal;