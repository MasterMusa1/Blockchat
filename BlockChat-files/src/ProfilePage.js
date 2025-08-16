import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useOutletContext } from 'react-router-dom';
import * as mockService from './services/mockService';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from './constants';
import TokenHoldings from './TokenHoldings';
import NftGalleryItem from './components/NftGalleryItem';
import ReportModal from './ReportModal';
import ListNftModal from './ListNftModal';

const profilePageStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
};

const headerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '30px',
    position: 'relative',
};

const avatarContainerStyle = {
    position: 'relative',
};

const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--primary-color)',
    backgroundColor: 'var(--background-color)',
};

const avatarEditButtonStyle = {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
};

const infoStyle = {
    flex: 1,
};

const nameContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
};

const nameStyle = {
    margin: '0',
    fontSize: '2rem',
    color: 'var(--text-color)',
};

const bioStyle = {
    margin: '0 0 10px 0',
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
};

const addressStyle = {
    fontSize: '0.9rem',
    color: 'var(--primary-color)',
    wordBreak: 'break-all',
    backgroundColor: 'var(--background-color)',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
};

const editButtonStyle = {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'var(--text-color)',
};

const saveButtonStyle = {
    ...editButtonStyle,
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    borderColor: 'var(--accent-color)',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '1rem',
    marginBottom: '10px',
};

const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
};

const socialLinksContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
};

const socialLinkStyle = {
    color: 'var(--text-secondary)',
    fontWeight: '500',
};

const sectionStyle = {
    marginBottom: '30px'
};

const sectionTitleStyle = {
    margin: '0 0 20px 0',
    color: 'var(--text-color)',
    fontSize: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px',
};

const ProfilePage = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const { user, setUserData, isVip, setMarketplaceNfts, setFeedItems, isAdmin } = useOutletContext();
    const [isEditing, setIsEditing] = useState(false);
    
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        socialLinks: { twitter: '', discord: '' },
    });

    const [tokens, setTokens] = useState([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [itemToReport, setItemToReport] = useState(null);
    const [isListModalOpen, setListModalOpen] = useState(false);
    const [nftToList, setNftToList] = useState(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                socialLinks: user.socialLinks || { twitter: '', discord: '' },
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchTokens = async () => {
            if (publicKey && connection && isVip) {
                try {
                    setIsLoadingTokens(true);
                    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey(TOKEN_PROGRAM_ID) });
                    const tokenDetailsPromises = tokenAccounts.value.map(async accountInfo => {
                        const { mint, tokenAmount } = accountInfo.account.data.parsed.info;
                        if (tokenAmount.decimals > 0 && parseInt(tokenAmount.amount, 10) > 0) {
                            try {
                                const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${mint}`);
                                if (response.ok) {
                                    const data = await response.json();
                                    const attrs = data.data.attributes;
                                    return {
                                        mint,
                                        amount: tokenAmount.uiAmountString,
                                        name: attrs.name,
                                        symbol: attrs.symbol,
                                        logo: attrs.image_url,
                                    };
                                }
                            } catch (e) {
                                console.warn(`Could not fetch metadata for token ${mint}`, e);
                            }
                        }
                        return null;
                    });
                    const tokens = (await Promise.all(tokenDetailsPromises)).filter(Boolean);
                    setTokens(tokens);
                } catch (error) {
                    console.error('Failed to fetch tokens:', error);
                } finally {
                    setIsLoadingTokens(false);
                }
            } else {
                setIsLoadingTokens(false);
            }
        };

        fetchTokens();
    }, [publicKey, connection, isVip]);
    
    if (!user) {
        return <div>Loading profile...</div>;
    }

    // ... rest of the component
    return (
        <div style={profilePageStyle}>
            {/* Header, NFT Gallery, Token Holdings sections */}
            <div style={headerStyle}>
                {/* ... */}
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>NFT Gallery</h2>
                <div style={gridStyle}>
                    {(user.ownedNfts || []).map(nft => (
                        <NftGalleryItem key={nft.id} nft={nft} onDelete={() => {}} onReport={() => {}} onList={() => {}} />
                    ))}
                </div>
            </div>

            {isVip && <TokenHoldings tokens={tokens} isLoading={isLoadingTokens} />}

            <ReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={() => {}} itemToReport={itemToReport} />
            <ListNftModal isOpen={isListModalOpen} onClose={() => setListModalOpen(false)} onListNft={() => {}} ownedNfts={user.ownedNfts} nftToList={nftToList} />
        </div>
    );
};

export default ProfilePage;