import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import ListNftModal from './ListNftModal';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as dataService from './services/dataService';

const pageStyle = {
    padding: '20px',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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


const VipMarketplacePage = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(null);
    const nftRefs = useRef({});
    const [searchParams] = useSearchParams();

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { vipMarketplaceNfts, setVipMarketplaceNfts, setFeedItems, setUserData, user, isAdmin } = useOutletContext();

    useEffect(() => {
        const nftId = searchParams.get('nft_id');
        if (nftId && vipMarketplaceNfts.length > 0 && nftRefs.current[nftId]) {
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
    }, [searchParams, vipMarketplaceNfts]);

    const handleListNft = async (newNftData, shareToFeed) => {
        if (!publicKey) {
            alert("Please connect your wallet to list an NFT.");
            return;
        }
        const newNft = { ...newNftData, seller: publicKey.toBase58()};
        const listedNft = await dataService.listVipNft(newNft);

        setVipMarketplaceNfts(prev => [...prev, listedNft]);

        if (shareToFeed) {
            const feedItem = {
                type: 'nft_listing',
                user: { 
                    name: user?.displayName || `User ${publicKey.toBase58().slice(0, 6)}`,
                    avatar: `https://i.pravatar.cc/150?u=${publicKey.toBase58()}`,
                    isVip: true
                },
                nft: {...listedNft, description: `(VIP Market) ${listedNft.description}`},
            };
            const postedItem = await dataService.addActivityFeedItem(feedItem);
            setFeedItems(prev => [postedItem, ...prev]);
        }
    };

    const handleShare = (nftId) => {
        const url = `${window.location.origin}/vip-marketplace?nft_id=${nftId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }, () => {
            alert('Failed to copy link.');
        });
    };

    const handleBuy = async (nft) => {
        if (!publicKey) {
            alert('Please connect your wallet first.');
            return;
        }
        if (nft.seller === publicKey.toBase58()) {
            alert("You can't buy your own NFT.");
            return;
        }

        setLoading(nft.id);
        
        try {
            const priceSol = parseFloat(nft.price);
            const lamports = priceSol * LAMPORTS_PER_SOL;
            const toWallet = new PublicKey(nft.seller);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: toWallet,
                    lamports,
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            
            const { updatedUser, removedNftId } = await dataService.buyVipNft(nft, publicKey.toBase58());
            setUserData(updatedUser);
            setVipMarketplaceNfts(prev => prev.filter(item => item.id !== removedNftId));
            
            alert(`Purchase successful! You sent ${priceSol} SOL for "${nft.name}".`);

        } catch (error) {
            console.error('Purchase failed:', error);
            alert(`Purchase failed: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleAdminDelete = async (nftId) => {
        if (!isAdmin) {
            alert("Only admins can perform this action.");
            return;
        }
        if (window.confirm("Are you sure you want to remove this VIP NFT listing? This cannot be undone.")) {
            await dataService.deleteVipNft(nftId);
            setVipMarketplaceNfts(prev => prev.filter(item => item.id !== nftId));
            alert("NFT listing removed.");
        }
    };

    return (
        <div style={pageStyle}>
            <ListNftModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onListNft={handleListNft} ownedNfts={user?.ownedNfts} />
            <div style={headerStyle}>
                <div>
                    <h1 style={{color: 'var(--text-color)', margin: 0}}>VIP Marketplace</h1>
                    <p style={{color: 'var(--text-secondary)', margin: '5px 0 0 0'}}>Exclusive NFTs for VIP members.</p>
                </div>
                <button style={listButtonStyle} onClick={() => setModalOpen(true)}>List an NFT</button>
            </div>
            
            <div style={gridStyle}>
                {vipMarketplaceNfts.map(nft => (
                    <div key={nft.id} style={nftCardStyle} ref={el => nftRefs.current[nft.id] = el}>
                        <img src={nft.image} alt={nft.name} style={nftImageStyle} />
                        <div style={nftInfoStyle}>
                            <h3 style={nftNameStyle}>{nft.name}</h3>
                            <p style={nftPriceStyle}>{nft.price}</p>
                            <div style={sellerInfoStyle}>
                                Seller:
                                <span style={sellerAddressStyle}>{nft.seller}</span>
                            </div>
                            <button 
                                style={buyButtonStyle} 
                                onClick={() => handleBuy(nft)}
                                disabled={loading === nft.id || nft.seller === publicKey?.toBase58()}
                            >
                                {loading === nft.id ? 'Processing...' : 'Buy Now'}
                            </button>
                        </div>
                        <div style={shareIconStyle} onClick={() => handleShare(nft.id)} title="Share">🔗</div>
                        {isAdmin && (
                            <div style={adminDeleteIconStyle} onClick={() => handleAdminDelete(nft.id)} title="Admin: Delete Listing">🗑️</div>
                        )}
                    </div>
                ))}
            </div>
             {vipMarketplaceNfts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                    <h2>The VIP Marketplace is Empty</h2>
                    <p>Be the first to list a VIP-exclusive NFT!</p>
                </div>
            )}
        </div>
    );
};

export default VipMarketplacePage;