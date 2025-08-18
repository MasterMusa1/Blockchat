import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import * as dataService from './services/dataService';
import TokenPerformanceItem from './components/TokenPerformanceItem';

const pageStyle = {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
};

const TokenPerformanceFeed = () => {
    const { publicKey } = useWallet();
    const { user } = useOutletContext();
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (publicKey && user) {
            const fetchFeed = async () => {
                setLoading(true);
                const items = await dataService.getTokenPerformanceUpdates(publicKey.toBase58(), user);
                setFeedItems(items);
                setLoading(false);
            };
            fetchFeed();
        }
    }, [publicKey, user]);

    const handleLike = (itemId) => {
        // Mock implementation for now
        setFeedItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, likes: (item.likes || 0) + 1 } : item
            )
        );
    };

    const handleAddComment = (itemId, content) => {
        // Mock implementation for now
        console.log(`Commenting on ${itemId}: ${content}`);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Token Feed...</div>;
    }

    return (
        <div style={pageStyle}>
            <h1 style={{ color: 'var(--text-color)' }}>Token Performance Feed</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '-10px', marginBottom: '30px' }}>
                Updates from traders and analysts for tokens you hold. (VIP Only)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {feedItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                        <h2>No Performance Updates</h2>
                        <p>This feed will show updates related to the tokens in your wallet.</p>
                    </div>
                ) : (
                    feedItems.map(item => (
                        <TokenPerformanceItem
                            key={item.id}
                            item={item}
                            onLike={handleLike}
                            onAddComment={handleAddComment}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TokenPerformanceFeed;