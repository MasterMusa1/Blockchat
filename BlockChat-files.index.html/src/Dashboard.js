import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BuyCreditsModal from './BuyCreditsModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { ADMIN_WALLET_ADDRESS } from './constants';
import * as dataService from './services/dataService';
import { PublicKey } from '@solana/web3.js';

const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: 'var(--background-color)',
};

const mainContentStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const bannerStyle = {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '12px 20px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: '500',
};

const isWalletAddress = (str) => {
    if (!str) return false;
    try { new PublicKey(str); return true; } catch (e) { return false; }
};

const Dashboard = () => {
    const { publicKey } = useWallet();
    const [isCreditsModalOpen, setCreditsModalOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [marketplaceNfts, setMarketplaceNfts] = useState([]);
    const [vipMarketplaceNfts, setVipMarketplaceNfts] = useState([]);
    const [feedItems, setFeedItems] = useState([]);
    const [messagingCosts, setMessagingCosts] = useState({ text: 1, media: 3, groupCreation: 100 });
    const [promotionalBanners, setPromotionalBanners] = useState([]);
    const [featureToggles, setFeatureToggles] = useState({ p2pMarketplace: true, statusUpdates: true });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        if (!publicKey) {
            setLoading(true);
            return;
        }

        const walletAddress = publicKey.toBase58();

        const fetchInitialData = async () => {
            try {
                // Using data service which now points to AWS
                const { user: initialUser, isNew } = await dataService.getOrCreateUser(walletAddress);
                
                if (isNew) {
                    await dataService.sendWelcomeMessage(walletAddress);
                }

                // Re-fetch user to get the latest state after potential welcome message
                const { user } = await dataService.getOrCreateUser(walletAddress);
                
                const settings = await dataService.getAdminSettings();
                const banners = await dataService.getBanners();
                const nfts = await dataService.getMarketplaceNfts();
                const vipNfts = await dataService.getVipMarketplaceNfts();
                const feed = await dataService.getActivityFeed();

                setUserData(user);
                if (settings) {
                    setMessagingCosts(settings.messagingCosts);
                    setFeatureToggles(settings.featureToggles);
                }
                setPromotionalBanners(banners);
                setMarketplaceNfts(nfts);
                setVipMarketplaceNfts(vipNfts);
                setFeedItems(feed);
                setLoading(false);
            } catch (err) {
                console.error("Data Service Error:", err);
                setError("Could not load data from the backend. Please ensure your AWS services are configured correctly and check the console for errors.");
                setLoading(false);
            }
        };

        fetchInitialData();

    }, [publicKey]);

    // Simulate receiving new messages for notifications
    useEffect(() => {
        if (!userData || !userData.chatList || userData.chatList.length === 0) return;

        const intervalId = setInterval(() => {
            const chatList = userData.chatList;
            const randomChatId = chatList[Math.floor(Math.random() * chatList.length)];
            
            if (isWalletAddress(randomChatId) && randomChatId === publicKey?.toBase58()) {
                return;
            }

            setUnreadCounts(prev => ({
                ...prev,
                [randomChatId]: (prev[randomChatId] || 0) + 1,
            }));
        }, 15000); // Simulate new message every 15s

        return () => clearInterval(intervalId);
    }, [userData, publicKey]);

    const clearUnread = useCallback((chatId) => {
        setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    }, []);

    const handlePurchaseSuccess = async (creditAmount) => {
        if (publicKey) {
            const updatedUser = await dataService.updateUserCredits(publicKey.toBase58(), creditAmount);
            setUserData(updatedUser);
        }
    };
    
    const setCredits = async (newCreditTotal) => {
        if(publicKey && userData) {
            const creditDifference = newCreditTotal - userData.credits;
            const updatedUser = await dataService.updateUserCredits(publicKey.toBase58(), creditDifference);
            setUserData(updatedUser);
        }
    };

    const isAdmin = publicKey?.toBase58() === ADMIN_WALLET_ADDRESS;
    const isVip = isAdmin || userData?.ownedNfts?.some(nft => nft.name === 'VIP Access NFT');

    const outletContext = useMemo(() => ({
        user: userData,
        setUserData,
        credits: userData?.credits || 0,
        setCredits,
        setCreditsModalOpen,
        ownedNfts: userData?.ownedNfts || [],
        isAdmin,
        isVip,
        marketplaceNfts,
        setMarketplaceNfts,
        vipMarketplaceNfts,
        setVipMarketplaceNfts,
        feedItems,
        setFeedItems,
        messagingCosts,
        setMessagingCosts,
        promotionalBanners,
        setPromotionalBanners,
        featureToggles,
        setFeatureToggles,
        userFiles: userData?.files,
        storageUsed: userData?.storageUsed || 0,
        storageCapacity: userData?.storageCapacity || 0,
        unreadCounts,
        clearUnread,
    }), [
        userData, setUserData, userData?.credits, setCredits, setCreditsModalOpen,
        userData?.ownedNfts, isAdmin, isVip, marketplaceNfts, setMarketplaceNfts,
        vipMarketplaceNfts, setVipMarketplaceNfts, feedItems, setFeedItems,
        messagingCosts, setMessagingCosts, promotionalBanners, setPromotionalBanners,
        featureToggles, setFeatureToggles, userData?.files, userData?.storageUsed,
        userData?.storageCapacity, unreadCounts, clearUnread
    ]);


    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading BlockChat...</div>;
    }
    
    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center', backgroundColor: 'var(--background-color)' }}>
                <h2 style={{color: 'var(--button-alert-color)'}}>Something went wrong</h2>
                <p style={{color: 'var(--text-color)', maxWidth: '600px', lineHeight: '1.6'}}>{error}</p>
            </div>
        );
    }
  
    const activeBanner = promotionalBanners.find(b => b.active);

    return (
        <div style={dashboardStyle}>
            <Navbar onBuyCreditsClick={() => setCreditsModalOpen(true)} credits={userData?.credits || 0} ownedNfts={userData?.ownedNfts || []} unreadCounts={unreadCounts} />
            {activeBanner && (
                <div style={bannerStyle}>
                    <strong>{activeBanner.title}:</strong> {activeBanner.message}
                </div>
            )}
            <main style={mainContentStyle}>
                 <Outlet context={outletContext} />
            </main>
            <BuyCreditsModal 
                isOpen={isCreditsModalOpen} 
                onClose={() => setCreditsModalOpen(false)} 
                onPurchaseSuccess={handlePurchaseSuccess}
            />
        </div>
    );
};

export default Dashboard;