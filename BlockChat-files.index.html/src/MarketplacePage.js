import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import ListNftModal from './ListNftModal';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BLOCKCHAT_WALLET_ADDRESS, ADMIN_WALLET_ADDRESS } from './constants';
import * as dataService from './services/dataService';

const pageStyle = {
    padding: '20px',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
};

const listButtonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
};

const nftCardStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    position: 'relative',
};

const nftImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: 'var(--background-color)',
};

const nftInfoStyle = {
    padding: '15px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
};

const nftNameStyle = {
    margin: '0 0 10px 0',
    fontSize: '1.2rem',
    color: 'var(--text-color)',
};

const nftPriceStyle = {
    margin: '0',
    fontSize: '1rem',
    color: 'var(--primary-color)',
    fontWeight: 'bold',
};

const sellerInfoStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: 'auto',
    paddingTop: '10px',
};

const sellerAddressStyle = {
    color: 'var(--text-color)',
    fontWeight: '500',
    wordBreak: 'break-all',
    backgroundColor: 'var(--background-color)',
    padding: '4px 6px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    display: 'block',
    marginTop: '4px',
    fontFamily: 'monospace',
};

const buyButtonStyle = {
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '15px',
    width: '100%',
    transition: 'background-color 0.2s',
};

const shareIconStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    color: 'var(--text-color)',
    zIndex: 2,
};

const adminDeleteIconStyle = {
    position: 'absolute',
    top: '10px',
    right: '52px',
    background: 'rgba(220, 53, 69, 0.9)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    color: 'white',
    zIndex: 2,
};

const filterContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
};

const filterButtonStyle = {
    padding: '8px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
};

const activeFilterStyle = {
    ...filterButtonStyle,
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
    fontWeight: 'bold',
};


const MarketplacePage = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(null); // Store ID of loading item
    const [filter, setFilter] = useState('all'); // 'all', 'blockchat', 'user'
    const nftRefs = useRef({});
    const [searchParams] = useSearchParams();

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { marketplaceNfts, setMarketplaceNfts, setFeedItems, user, setUserData, isAdmin, isVip, featureToggles } = useOutletContext();

    useEffect(() => {
        const nftId = searchParams.get('nft_id');
        if (nftId && marketplaceNfts.length > 0 && nftRefs.current[nftId]) {
            setTimeout(() => {
                const element = nftRefs.current[nftId];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.boxShadow = '0 0 15px 5px var(--accent-color)';
                    setTimeout(() => {
                        element.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    }, 2500);
                }
            }, 100);
        }
    }, [searchParams, marketplaceNfts]);

    const handleListNft = async (nftObject, shareToFeed) => {
        if (!publicKey) {
            alert('Please connect your wallet to list an NFT.');
            return;
        }

        const listedNft = { ...nftObject, seller: publicKey.toBase58(), isFeatureNft: false };
        await dataService.listNft(listedNft);
        const allNfts = await dataService.getMarketplaceNfts();
        setMarketplaceNfts(allNfts);
        
        const updatedUser = await dataService.updateUserProfile(publicKey.toBase58(), {
            ownedNfts: user.ownedNfts.map(n => n.id === nftObject.id ? { ...n, isListed: true } : n)
        });
        setUserData(updatedUser);

        if (shareToFeed) {
            const feedItem = {
                type: 'nft_listing',
                user: JSON.stringify({ name: user.displayName || 'You', avatar: `https://i.pravatar.cc/150?u=${publicKey.toBase58()}`, isVip, isAdmin }),
                nft: JSON.stringify(listedNft),
            };
            await dataService.addActivityFeedItem(feedItem);
            const feed = await dataService.getActivityFeed();
            setFeedItems(feed);
        }
    };
    
    // ... rest of the component
    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--text-color)' }}>Marketplace</h1>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)' }}>Buy and sell NFTs from BlockChat and other users.</p>
                </div>
                {featureToggles.p2pMarketplace && <button style={listButtonStyle} onClick={() => setModalOpen(true)}>+ List Your NFT</button>}
            </div>
            {/* Filtering UI */}
            <div style={gridStyle}>
                {/* Map over filtered NFTs */}
            </div>
            <ListNftModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onListNft={handleListNft} ownedNfts={user?.ownedNfts} />
        </div>
    );
};

export default MarketplacePage;