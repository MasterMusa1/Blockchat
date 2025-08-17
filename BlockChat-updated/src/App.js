import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ChatPage from './ChatPage';
import ActivityFeedPage from './ActivityFeedPage';
import MarketplacePage from './MarketplacePage';
import VipMarketplacePage from './VipMarketplacePage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import AdminPage from './AdminPage';
import AdminRoute from './AdminRoute';
import VipRoute from './VipRoute';
import StoragePage from './StoragePage';
import MintNftPage from './MintNftPage';
import TokenPerformanceFeed from './TokenPerformanceFeed';
import DiscoverPage from './DiscoverPage';

function App() {
    const { connected, publicKey } = useWallet();

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!connected ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/" element={connected ? <Dashboard /> : <Navigate to="/login" />}>
                    <Route index element={<ChatPage />} />
                    <Route path="feed" element={<ActivityFeedPage />} />
                    <Route 
                        path="token-feed"
                        element={
                            <VipRoute>
                                <TokenPerformanceFeed />
                            </VipRoute>
                        }
                    />
                    <Route path="discover" element={<DiscoverPage />} />
                    <Route path="marketplace" element={<MarketplacePage />} />
                    <Route 
                        path="vip-marketplace" 
                        element={
                            <VipRoute>
                                <VipMarketplacePage />
                            </VipRoute>
                        } 
                    />
                    <Route path="mint" element={<MintNftPage />} />
                    <Route path="profile/:walletAddress" element={<ProfilePage />} />
                    <Route path="profile" element={<Navigate to={publicKey ? `/profile/${publicKey.toBase58()}`: '/'} />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="storage" element={<StoragePage />} />
                    <Route 
                        path="admin" 
                        element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        } 
                    />
                </Route>
                <Route path="*" element={<Navigate to={connected ? "/" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;