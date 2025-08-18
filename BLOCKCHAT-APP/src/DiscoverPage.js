import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import * as dataService from './services/dataService';
import UserSearchResult from './components/UserSearchResult';

const pageStyle = {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
};

const searchContainerStyle = {
    position: 'relative',
    marginBottom: '30px',
};

const searchInputStyle = {
    width: '100%',
    padding: '15px 20px',
    fontSize: '1.1rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-color)',
};

const resultsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
};

const DiscoverPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user: currentUser, setUserData } = useOutletContext();
    const { publicKey } = useWallet();

    useEffect(() => {
        const handleSearch = async () => {
            if (searchTerm.trim() === '') {
                setResults([]);
                return;
            }
            setLoading(true);
            const users = await dataService.searchUsers(searchTerm);
            setResults(users.filter(u => u.walletAddress !== publicKey?.toBase58()));
            setLoading(false);
        };

        const debounce = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, publicKey]);

    const handleFollowToggle = async (targetUser) => {
        const isFollowing = currentUser.following?.includes(targetUser.walletAddress);
        const action = isFollowing ? 'unfollowUser' : 'followUser';
        
        const updatedUser = await dataService[action](publicKey.toBase58(), targetUser.walletAddress);
        setUserData(updatedUser);
    };

    return (
        <div style={pageStyle}>
            <h1 style={{ color: 'var(--text-color)' }}>Discover Users</h1>
            <div style={searchContainerStyle}>
                <input
                    type="text"
                    style={searchInputStyle}
                    placeholder="Search by unique display name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && <p>Searching...</p>}

            <div style={resultsContainerStyle}>
                {!loading && results.map(user => (
                    <UserSearchResult
                        key={user.walletAddress}
                        user={user}
                        currentUser={currentUser}
                        onFollowToggle={handleFollowToggle}
                    />
                ))}
                {!loading && searchTerm && results.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</p>
                )}
            </div>
        </div>
    );
};

export default DiscoverPage;