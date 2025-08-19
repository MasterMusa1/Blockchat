import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOutletContext } from 'react-router-dom';
import StatusUpdateForm from './StatusUpdateForm';
import ActivityItem from './ActivityItem';
import * as dataService from './services/dataService';

const pageStyle = {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
};

const ActivityFeedPage = () => {
    const { publicKey } = useWallet();
    const { feedItems, setFeedItems, user, isVip, isVerified, isAdmin, featureToggles } = useOutletContext();

    const handlePostUpdate = async (content) => {
        if (!publicKey || !user) return;

        const newPost = {
            type: 'status_update',
            user: { 
                name: user.displayName || 'You', 
                avatar: `https://i.pravatar.cc/150?u=${publicKey.toBase58()}`, 
                isVip, 
                isVerified,
                isAdmin 
            },
            content: content,
            likes: 0,
            comments: 0,
            commentData: [],
        };
        const postedItem = await dataService.addActivityFeedItem(newPost);
        setFeedItems(prev => [postedItem, ...prev]);
    };

    const handleLike = async (itemId) => {
        const item = feedItems.find(i => i.id === itemId);
        if (!item) return;

        // Optimistic update for better UX
        const originalItems = [...feedItems];
        const updatedItems = feedItems.map(i => 
            i.id === itemId ? { ...i, likes: i.likes + 1 } : i
        );
        setFeedItems(updatedItems);
        
        try {
            await dataService.updateActivityFeedItem(itemId, { likes: item.likes + 1 });
        } catch (error) {
            console.error("Failed to like post:", error);
            alert("Couldn't like the post. Please try again.");
            setFeedItems(originalItems); // Revert on failure
        }
    };

    const handleAddComment = async (itemId, content) => {
        if (!publicKey || !user || !content.trim()) return;

        const item = feedItems.find(i => i.id === itemId);
        if (!item) return;

        const newComment = {
            user: {
                name: user.displayName || `User ${publicKey.toBase58().slice(0,4)}...`,
                avatar: `https://i.pravatar.cc/150?u=${publicKey.toBase58()}`,
            },
            content: content,
            timestamp: new Date().toISOString(),
        };

        const originalItems = [...feedItems];
        const newCommentData = [...(item.commentData || []), newComment];

        const updatedItems = feedItems.map(i => {
            if (i.id === itemId) {
                return { ...i, commentData: newCommentData, comments: newCommentData.length };
            }
            return i;
        });
        setFeedItems(updatedItems);
        
        try {
            await dataService.updateActivityFeedItem(itemId, { commentData: newCommentData });
        } catch (error) {
            console.error("Failed to add comment:", error);
            setFeedItems(originalItems);
            alert("Couldn't add comment. Please try again.");
        }
    };

    const handleReportPost = async (item) => {
        if (!publicKey) {
            alert("Please connect your wallet to report a post.");
            return;
        }
        if (window.confirm(`Are you sure you want to report this post?`)) {
            try {
                await dataService.addReport({
                    ...item,
                    reporterWallet: publicKey.toBase58()
                });
                alert("Thank you for your report. Our moderators will review this post shortly.");
            } catch (error) {
                console.error("Report failed:", error);
                alert("Failed to submit report.");
            }
        }
    };

    const handleNotInterested = (itemId) => {
        setFeedItems(prev => prev.filter(item => item.id !== itemId));
        // In a real app, this preference could be saved to the user's profile
    };

    return (
        <div style={pageStyle}>
            <h1 style={{color: 'var(--text-color)'}}>Activity Feed</h1>
            {featureToggles.statusUpdates && <StatusUpdateForm onPostUpdate={handlePostUpdate} />}
            <div style={{marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                 {feedItems.length === 0 ? (
                     <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                        <h2>Your Feed is Empty</h2>
                        <p>Start interacting with friends, joining groups, or posting updates to see activity here.</p>
                    </div>
                ) : (
                    feedItems.map(item => (
                        <ActivityItem 
                            key={item.id} 
                            item={item} 
                            onLike={handleLike}
                            onAddComment={handleAddComment}
                            onReport={handleReportPost}
                            onNotInterested={handleNotInterested}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeedPage;