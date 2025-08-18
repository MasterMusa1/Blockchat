import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useOutletContext, useParams } from 'react-router-dom';
import * as dataService from './services/dataService';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from './constants';
import TokenHoldings from './TokenHoldings';
import NftGalleryItem from './components/NftGalleryItem';
import ReportModal from './ReportModal';
import ListNftModal from './ListNftModal';
import VerificationBadge from './components/VerificationBadge';

const profilePageStyle = { maxWidth: '900px', margin: '0 auto', padding: '20px' };
const headerStyle = { display: 'flex', alignItems: 'flex-start', gap: '30px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', position: 'relative' };
const avatarContainerStyle = { position: 'relative' };
const avatarStyle = { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', backgroundColor: 'var(--background-color)' };
const avatarEditButtonStyle = { position: 'absolute', bottom: '5px', right: '5px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' };
const infoStyle = { flex: 1 };
const nameContainerStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' };
const nameStyle = { margin: '0', fontSize: '2rem', color: 'var(--text-color)' };
const bioStyle = { margin: '0 0 10px 0', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' };
const addressStyle = { fontSize: '0.9rem', color: 'var(--primary-color)', wordBreak: 'break-all', backgroundColor: 'var(--background-color)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' };
const actionButtonStyle = { position: 'absolute', top: '0', right: '0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const editButtonStyle = { ...actionButtonStyle, backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' };
const followButtonStyle = { ...actionButtonStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: '1px solid var(--primary-color)' };
const followingButtonStyle = { ...actionButtonStyle, backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' };
const saveButtonStyle = { ...actionButtonStyle, backgroundColor: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' };
const inputStyle = { width: '100%', padding: '10px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '1rem', marginBottom: '10px' };
const textareaStyle = { ...inputStyle, minHeight: '80px', resize: 'vertical' };
const socialLinksContainerStyle = { display: 'flex', gap: '15px', marginTop: '10px' };
const socialLinkStyle = { color: 'var(--text-secondary)', fontWeight: '500' };
const sectionStyle = { marginBottom: '30px' };
const sectionTitleStyle = { margin: '0 0 20px 0', color: 'var(--text-color)', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' };
const statsContainerStyle = { display: 'flex', gap: '20px', marginTop: '10px' };
const statItemStyle = { textAlign: 'center' };
const statValueStyle = { fontSize: '1.2rem', fontWeight: 'bold' };
const statLabelStyle = { color: 'var(--text-secondary)', fontSize: '0.9rem' };

const ProfilePage = () => {
    const { walletAddress } = useParams();
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const { user: currentUser, setUserData: setCurrentUserData, setMarketplaceNfts, setFeedItems, isVip: isCurrentUserVip } = useOutletContext();
    
    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ displayName: '', bio: '' });
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isListModalOpen, setListModalOpen] = useState(false);
    const [nftToList, setNftToList] = useState(null);

    const isMyProfile = profileUser?.walletAddress === publicKey?.toBase58();
    const isFollowing = currentUser?.following?.includes(profileUser?.walletAddress);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!walletAddress) return;
            setIsLoading(true);
            try {
                const { user } = await dataService.getOrCreateUser(walletAddress);
                setProfileUser(user);
                setEditData({ displayName: user.displayName || '', bio: user.bio || '' });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setProfileUser(null);
            }
            setIsLoading(false);
        };
        fetchProfileData();
    }, [walletAddress]);

    useEffect(() => {
        const fetchTokens = async () => {
            if (profileUser?.walletAddress && connection && isCurrentUserVip) {
                try {
                    const pubKey = new PublicKey(profileUser.walletAddress);
                    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, { programId: new PublicKey(TOKEN_PROGRAM_ID) });
                    const tokenDetailsPromises = tokenAccounts.value.map(async accountInfo => {
                        const { mint, tokenAmount } = accountInfo.account.data.parsed.info;
                        if (tokenAmount.decimals > 0 && parseInt(tokenAmount.amount, 10) > 0) {
                            // This part remains unchanged as it fetches external data
                            return { mint, amount: tokenAmount.uiAmountString, name: `Token ${mint.slice(0,6)}`, symbol: 'TKN', logo: `https://i.pravatar.cc/150?u=${mint}` };
                        }
                        return null;
                    }).filter(Boolean);
                    setTokens(await Promise.all(tokenDetailsPromises));
                } catch (e) { console.error("Could not fetch tokens", e); }
            }
        };
        fetchTokens();
    }, [profileUser, connection, isCurrentUserVip]);

    const handleSave = async () => {
        try {
            const updatedUser = await dataService.updateUserProfile(publicKey.toBase58(), { displayName: editData.displayName, bio: editData.bio });
            setProfileUser(updatedUser);
            setCurrentUserData(updatedUser);
            setIsEditing(false);
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    };
    
    const handleFollowToggle = async () => {
        const action = isFollowing ? 'unfollowUser' : 'followUser';
        const updatedCurrentUser = await dataService[action](publicKey.toBase58(), profileUser.walletAddress);
        setCurrentUserData(updatedCurrentUser); // Update current user's following list
        // Also update the followers count on the viewed profile
        setProfileUser(prev => ({ ...prev, followers: isFollowing ? prev.followers.filter(f => f !== publicKey.toBase58()) : [...(prev.followers || []), publicKey.toBase58()] }));
    };

    if (isLoading) return <div>Loading profile...</div>;
    if (!profileUser) return <div>Profile not found.</div>;

    const { displayName, bio, ownedNfts = [], followers = [], following = [] } = profileUser;

    return (
        <div style={profilePageStyle}>
            <ListNftModal isOpen={isListModalOpen} onClose={() => setListModalOpen(false)} onListNft={() => {}} ownedNfts={ownedNfts} nftToList={nftToList} />
            <div style={headerStyle}>
                <div style={avatarContainerStyle}>
                    <img src={`https://i.pravatar.cc/150?u=${profileUser.walletAddress}`} alt="Avatar" style={avatarStyle} />
                    {isMyProfile && isEditing && <button style={avatarEditButtonStyle}>✏️</button>}
                </div>
                <div style={infoStyle}>
                    {isEditing ? (
                        <input style={{...inputStyle, ...nameStyle, fontSize: '2rem', marginBottom: '10px'}} value={editData.displayName} onChange={e => setEditData({...editData, displayName: e.target.value})} />
                    ) : (
                        <div style={nameContainerStyle}>
                            <h1 style={nameStyle}>{displayName}</h1>
                            <VerificationBadge isVip={profileUser.isVip} isVerified={profileUser.isVerified} />
                        </div>
                    )}
                    {isEditing ? (
                        <textarea style={textareaStyle} value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} />
                    ) : (
                        <p style={bioStyle}>{bio}</p>
                    )}
                    <span style={addressStyle}>{profileUser.walletAddress}</span>
                    <div style={statsContainerStyle}>
                        <div style={statItemStyle}><span style={statValueStyle}>{ownedNfts.length}</span><div style={statLabelStyle}>NFTs</div></div>
                        <div style={statItemStyle}><span style={statValueStyle}>{followers.length}</span><div style={statLabelStyle}>Followers</div></div>
                        <div style={statItemStyle}><span style={statValueStyle}>{following.length}</span><div style={statLabelStyle}>Following</div></div>
                    </div>
                </div>
                {isMyProfile ? (
                    isEditing ? <button style={saveButtonStyle} onClick={handleSave}>Save</button> : <button style={editButtonStyle} onClick={() => setIsEditing(true)}>Edit Profile</button>
                ) : (
                    <button style={isFollowing ? followingButtonStyle : followButtonStyle} onClick={handleFollowToggle}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>NFT Gallery</h2>
                <div style={gridStyle}>
                    {ownedNfts.map(nft => <NftGalleryItem key={nft.id} nft={nft} onList={() => { setNftToList(nft); setListModalOpen(true); }} onDelete={()=>{}} onReport={()=>{}}/>)}
                </div>
                {ownedNfts.length === 0 && <p style={{color: 'var(--text-secondary)'}}>This user's gallery is empty.</p>}
            </div>

            {isCurrentUserVip && <TokenHoldings tokens={tokens} isLoading={isLoading} />}
        </div>
    );
};

export default ProfilePage;