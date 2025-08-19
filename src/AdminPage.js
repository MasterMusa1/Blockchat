import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import NftManagement from './components/admin/NftManagement';
import PlatformSettings from './components/admin/PlatformSettings';
import BannerManagement from './components/admin/BannerManagement';
import Broadcast from './components/admin/Broadcast';
import Analytics from './components/admin/Analytics';
import UserManagement from './components/admin/UserManagement';
import ContentModeration from './components/admin/ContentModeration';
import SystemLogs from './components/admin/SystemLogs';
import Support from './components/admin/Support';

const adminPageStyle = {
    padding: '20px',
};

const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
    flexWrap: 'wrap',
};

const tabStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    borderBottom: '3px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
};

const activeTabStyle = {
    ...tabStyle,
    color: 'var(--primary-color)',
    borderBottom: '3px solid var(--primary-color)',
    fontWeight: 'bold',
};

const contentContainerStyle = {
    // The individual components have their own styling, so this container is minimal
};

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('nft');
    const outletContext = useOutletContext();

    const tabs = {
        'nft': 'NFT Management',
        'settings': 'Platform Settings',
        'banners': 'Banners',
        'broadcast': 'Broadcast',
        'analytics': 'Analytics',
        'users': 'User Management',
        'moderation': 'Moderation',
        'logs': 'System Logs',
        'support': 'Support'
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'nft':
                return <NftManagement {...outletContext} />;
            case 'settings':
                return <PlatformSettings {...outletContext} />;
            case 'banners':
                return <BannerManagement {...outletContext} />;
            case 'broadcast':
                return <Broadcast {...outletContext} />;
            case 'analytics':
                return <Analytics />;
            case 'users':
                return <UserManagement />;
            case 'moderation':
                return <ContentModeration />;
            case 'logs':
                return <SystemLogs />;
            case 'support':
                return <Support />;
            default:
                return <NftManagement {...outletContext} />;
        }
    };

    return (
        <div style={adminPageStyle}>
            <h1 style={{ color: 'var(--text-color)' }}>Admin Dashboard</h1>
            <div style={tabContainerStyle} className="admin-tabs">
                {Object.entries(tabs).map(([key, name]) => (
                    <button
                        key={key}
                        style={activeTab === key ? activeTabStyle : tabStyle}
                        onClick={() => setActiveTab(key)}
                    >
                        {name}
                    </button>
                ))}
            </div>
            <div style={contentContainerStyle}>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPage;