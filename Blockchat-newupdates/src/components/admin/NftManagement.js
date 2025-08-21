import React, { useState } from 'react';
import { BLOCKCHAT_WALLET_ADDRESS } from '../../constants';

const formSectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const gridFormStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
};

const fullWidthStyle = {
    gridColumn: '1 / -1'
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

const nftFunctionMap = {
    PROFILE_NFT: { name: 'Profile NFT', description: 'Unlocks free profile editing.' },
    SOCIALLINK_NFT: { name: 'SocialLink NFT', description: 'Unlocks free social link editing.' },
    GROUPCHAT_NFT: { name: 'GroupChat NFT', description: 'Unlocks free group creation.' },
    LIFETIME_MESSAGING_NFT: { name: 'Lifetime Messaging NFT', description: 'Grants unlimited messaging.' },
    VIP_NFT: { name: 'VIP Access NFT', description: 'Grants VIP status, all features, and a gold badge.' },
    NONE: { name: null, description: 'Cosmetic NFT with no special function.' }
};

const NftManagement = ({ marketplaceNfts, setMarketplaceNfts, setFeedItems }) => {
    const [newNft, setNewNft] = useState({
        name: '',
        description: '',
        image: '',
        price: '',
        quantity: '',
        functionKey: 'NONE'
    });
    const [addQuantities, setAddQuantities] = useState({});

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewNft(prev => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (id, value) => {
        setAddQuantities(prev => ({...prev, [id]: value}));
    };

    const handleCreateNft = (e) => {
        e.preventDefault();
        const { name, description, image, price, quantity, functionKey } = newNft;

        if (!name || !image || !price || !quantity || !functionKey) {
            alert('Please fill out all fields.');
            return;
        }
        if (parseFloat(price) <= 0 || parseInt(quantity, 10) <= 0) {
            alert('Price and quantity must be positive numbers.');
            return;
        }

        const selectedFunction = nftFunctionMap[functionKey];

        const newListing = {
            id: `feature-${Date.now()}`,
            name,
            price: `${price} SOL`,
            image,
            description: description || selectedFunction.description,
            seller: BLOCKCHAT_WALLET_ADDRESS,
            isFeatureNft: true,
            quantity: parseInt(quantity, 10),
            featureName: selectedFunction.name
        };

        setMarketplaceNfts(prev => [...prev, newListing]);

        const feedItem = {
            id: Date.now(),
            type: 'nft_listing',
            user: { name: 'BlockChat', avatar: 'https://i.imgur.com/siB8l8m.png' },
            nft: newListing,
            timestamp: 'Just now',
        };
        setFeedItems(prev => [feedItem, ...prev]);

        alert(`Successfully created and listed ${quantity} of "${name}". A post has been added to the activity feed.`);
        setNewNft({ name: '', description: '', image: '', price: '', quantity: '', functionKey: 'NONE' });
    };
    
    const handleAddQuantity = (nftId) => {
        const quantityToAdd = parseInt(addQuantities[nftId] || '0', 10);
        if (quantityToAdd <= 0) {
            alert("Please enter a positive quantity to add.");
            return;
        }

        setMarketplaceNfts(prev => prev.map(nft => {
            if (nft.id === nftId) {
                alert(`Added ${quantityToAdd} to "${nft.name}". New total: ${nft.quantity + quantityToAdd}.`);
                return {...nft, quantity: nft.quantity + quantityToAdd };
            }
            return nft;
        }));
        setAddQuantities(prev => ({...prev, [nftId]: ''}));
    };
    
    const featureNfts = marketplaceNfts.filter(nft => nft.isFeatureNft);

    return (
        <div>
            <form onSubmit={handleCreateNft} style={formSectionStyle}>
                <h2>Create & List a New Feature NFT</h2>
                <div style={gridFormStyle}>
                    <input style={inputStyle} name="name" placeholder="NFT Name" value={newNft.name} onChange={handleFormChange} />
                    <input style={inputStyle} name="image" placeholder="Image URL" value={newNft.image} onChange={handleFormChange} />
                    <input style={inputStyle} type="number" name="price" placeholder="Price in SOL" value={newNft.price} onChange={handleFormChange} />
                    <input style={inputStyle} type="number" name="quantity" placeholder="Initial Quantity" value={newNft.quantity} onChange={handleFormChange} />
                    <div style={fullWidthStyle}>
                        <textarea style={{...inputStyle, resize: 'vertical'}} name="description" placeholder="Description (optional)" value={newNft.description} onChange={handleFormChange} />
                    </div>
                    <div style={fullWidthStyle}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>NFT Function</label>
                        <select style={inputStyle} name="functionKey" value={newNft.functionKey} onChange={handleFormChange}>
                            {Object.entries(nftFunctionMap).map(([key, { name }]) => (
                                <option key={key} value={key}>{name || 'None (Cosmetic)'}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="submit" style={buttonStyle}>Create & List NFT</button>
            </form>
            
            <div style={formSectionStyle}>
                <h2>Manage Existing Feature NFTs</h2>
                {featureNfts.length > 0 ? (
                    featureNfts.map(nft => (
                        <div key={nft.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
                            <strong>{nft.name}</strong> - Current Stock: {nft.quantity}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input 
                                    style={{...inputStyle, marginBottom: 0, flex: 1}} 
                                    type="number" 
                                    placeholder="Quantity to add" 
                                    value={addQuantities[nft.id] || ''}
                                    onChange={(e) => handleQuantityChange(nft.id, e.target.value)}
                                />
                                <button style={buttonStyle} onClick={() => handleAddQuantity(nft.id)}>Add Stock</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No feature NFTs have been created yet.</p>
                )}
            </div>
        </div>
    );
};

export default NftManagement;