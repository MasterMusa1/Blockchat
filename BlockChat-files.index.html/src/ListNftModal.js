import React, { useState, useEffect, useMemo } from 'react';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'var(--surface-color)',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    color: 'var(--text-color)',
};

const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.5rem',
    position: 'absolute',
    top: '15px',
    right: '20px',
    cursor: 'pointer',
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
};

const nftPreviewStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    margin: '20px 0',
    padding: '15px',
    backgroundColor: 'var(--background-color)',
    borderRadius: '8px',
};

const nftPreviewImageStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
};

const ListNftModal = ({ isOpen, onClose, onListNft, ownedNfts = [], nftToList: initialNftToList }) => {
    const [selectedNft, setSelectedNft] = useState(null);
    const [price, setPrice] = useState('');
    const [shareToFeed, setShareToFeed] = useState(true);

    const listableNfts = useMemo(() => {
        return (ownedNfts || []).filter(nft => nft.isUserMinted && !nft.isListed);
    }, [ownedNfts]);

    useEffect(() => {
        if (initialNftToList) {
            const found = listableNfts.find(n => n.id === initialNftToList.id);
            setSelectedNft(found);
        } else if (listableNfts.length > 0) {
            setSelectedNft(listableNfts[0]);
        } else {
            setSelectedNft(null);
        }
    }, [initialNftToList, listableNfts, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setPrice('');
            setShareToFeed(true);
        }
    }, [isOpen]);

    const handleList = () => {
        if (!selectedNft || !price || parseFloat(price) <= 0) {
            alert('Please select an NFT and set a valid price.');
            return;
        }
        onListNft({ ...selectedNft, price: `${price} SOL` }, shareToFeed);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={{...modalContentStyle, position: 'relative'}} onClick={e => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2>List Your NFT for Sale</h2>

                {listableNfts.length === 0 ? (
                    <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0'}}>
                        You have no minted NFTs available to list. Go to the Mint page to create one!
                    </p>
                ) : (
                    <>
                        {!initialNftToList && (
                            <>
                                <label>Select NFT to List</label>
                                <select style={inputStyle} onChange={e => setSelectedNft(listableNfts.find(n => n.id === e.target.value))} value={selectedNft?.id || ''}>
                                    {listableNfts.map(nft => (
                                        <option key={nft.id} value={nft.id}>{nft.name}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {selectedNft && (
                            <div style={nftPreviewStyle}>
                                <img src={selectedNft.image} alt={selectedNft.name} style={nftPreviewImageStyle} />
                                <div>
                                    <h4 style={{margin: 0}}>{selectedNft.name}</h4>
                                    <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '5px 0 0 0'}}>{selectedNft.description}</p>
                                </div>
                            </div>
                        )}
                        
                        <label style={{marginTop: '10px', display: 'block'}}>Price</label>
                        <input style={inputStyle} placeholder="Price in SOL" type="number" value={price} onChange={e => setPrice(e.target.value)} />

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', gap: '10px' }}>
                            <input type="checkbox" id="share-feed" checked={shareToFeed} onChange={e => setShareToFeed(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }}/>
                            <label htmlFor="share-feed" style={{ cursor: 'pointer', color: 'var(--text-color)' }}>Share this listing to my activity feed</label>
                        </div>

                        <button style={buttonStyle} onClick={handleList} disabled={!selectedNft}>List NFT</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ListNftModal;