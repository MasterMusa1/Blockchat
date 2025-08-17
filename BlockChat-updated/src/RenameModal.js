import React, { useState, useEffect } from 'react';

const RenameModal = ({ item, onClose, onRename }) => {
    const [newName, setNewName] = useState(item.name);

    const handleSubmit = (e) => {
        e.preventDefault();
        onRename(item, newName.trim());
    };

    // Select text on mount for quick editing
    useEffect(() => {
        const input = document.getElementById('rename-input');
        if (input) {
            input.focus();
            input.select();
        }
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Rename Item</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        id="rename-input"
                        className="modal-input"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <button type="submit" className="modal-submit-btn">Save</button>
                </form>
            </div>
        </div>
    );
};

export default RenameModal;