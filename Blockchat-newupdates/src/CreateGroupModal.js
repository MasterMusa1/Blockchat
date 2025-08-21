import React, { useState, useEffect, useCallback } from 'react';

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
const tokenInfoStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', minHeight: '40px' };
const tokenLogoStyle = { width: '40px', height: '40px', borderRadius: '50%' };

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [contractAddress, setContractAddress] = useState('');
    const [tokenInfo, setTokenInfo] = useState({ name: '', logo: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const fetchTokenData = useCallback(async (address) => {
        if (!address) {
            setTokenInfo({ name: '', logo: '' });
            setError('');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}`);
            if (!response.ok) throw new Error('Token not found or API error.');
            const data = await response.json();
            const { name, image_url } = data.data.attributes;
            setTokenInfo({ name, logo: image_url });
            setGroupName(name); // Auto-fill group name
        } catch (err) {
            setError(err.message);
            setTokenInfo({ name: '', logo: '' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce(fetchTokenData, 500), [fetchTokenData]);

    useEffect(() => {
        debouncedFetch(contractAddress);
    }, [contractAddress, debouncedFetch]);

    const handleCreate = () => {
        if (!groupName || !contractAddress || !tokenInfo.name) {
            alert('Please provide a valid token contract address and a group name.');
            return;
        }
        onCreateGroup({ name: groupName, contractAddress, logo: tokenInfo.logo });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>Create Token-Gated Group</h2>
                <input style={inputStyle} placeholder="Enter token contract address" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
                <div style={tokenInfoStyle}>
                    {isLoading && <span>Loading token info...</span>}
                    {error && <span style={{ color: 'var(--button-alert-color)' }}>{error}</span>}
                    {tokenInfo.logo && <img src={tokenInfo.logo} alt="Token Logo" style={tokenLogoStyle} />}
                    {tokenInfo.name && <span style={{ fontWeight: '500' }}>{tokenInfo.name}</span>}
                </div>
                <input style={inputStyle} placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                <button style={buttonStyle} onClick={handleCreate} disabled={isLoading || !tokenInfo.name}>Create Group</button>
            </div>
        </div>
    );
};

export default CreateGroupModal;