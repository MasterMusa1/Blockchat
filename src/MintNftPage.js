import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import * as mockService from './services/mockService';

const pageStyle = {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px',
};

const formStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '1rem',
    marginTop: '10px',
};

const buttonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
    fontWeight: 'bold',
    width: '100%',
    transition: 'background-color 0.2s',
};

const MintNftPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { publicKey } = useWallet();
    const { setUserData, credits, messagingCosts, ownedNfts } = useOutletContext();
    const navigate = useNavigate();
    
    const hasLifetimeAccess = ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
    const mintCost = messagingCosts?.nftMinting || 0;

    const handleMint = async (e) => {
        e.preventDefault();
        if (!publicKey) {
            alert('Please connect your wallet first.');
            return;
        }
        if (!name || !image || !description) {
            alert('Please fill out all fields.');
            return;
        }

        if (!hasLifetimeAccess && credits < mintCost) {
            alert(`You do not have enough credits to mint an NFT. It costs ${mintCost} credits.`);
            return;
        }

        setLoading(true);
        try {
            const nftData = { name, description, image };
            const updatedUser = await mockService.mintUserNft(publicKey.toBase58(), nftData);
            setUserData(updatedUser);
            alert(`NFT successfully minted! ${!hasLifetimeAccess ? `It cost ${mintCost} credits.` : ''} It has been added to your profile gallery.`);
            navigate('/profile');
        } catch (error) {
            console.error('Minting failed:', error);
            alert(`Minting failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <div style={formStyle}>
                <h1 style={{ textAlign: 'center', marginTop: 0 }}>Mint a New NFT</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Create a new, unique NFT on the blockchain. This will be added to your personal collection. 
                    Cost: {hasLifetimeAccess ? "Free" : `${mintCost} credits`}
                </p>
                <form onSubmit={handleMint}>
                    <input style={inputStyle} placeholder="NFT Name (e.g., 'My First Creation')" value={name} onChange={e => setName(e.target.value)} />
                    <textarea style={{...inputStyle, resize: 'vertical', minHeight: '100px'}} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                    <input style={inputStyle} placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} />
                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {loading ? 'Minting...' : 'Mint NFT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MintNftPage;