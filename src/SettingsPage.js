import React, { useState } from 'react';
import { useSettings } from './contexts/SettingsContext';
import { useOutletContext, Link } from 'react-router-dom';

const settingsPageStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    color: 'var(--text-color)',
};

const sectionStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'background-color 0.3s',
};

const sectionTitleStyle = {
    marginTop: 0,
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    transition: 'border-color 0.3s',
};

const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid var(--border-color)',
    transition: 'border-color 0.3s',
    flexWrap: 'wrap',
    gap: '10px'
};

const lastSettingItemStyle = {
    ...settingItemStyle,
    borderBottom: 'none',
};

const controlContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
};

const selectStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--background-color)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontWeight: '500',
};

const colorInputStyle = {
    width: '40px',
    height: '40px',
    border: 'none',
    padding: 0,
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    overflow: 'hidden',
};

const themeButtonStyle = (isActive) => ({
    padding: '8px 16px',
    border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
    borderRadius: '6px',
    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-color)',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
});

const fontOptions = [
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Orbitron', value: "'Orbitron', sans-serif" },
    { name: 'Share Tech Mono', value: "'Share Tech Mono', monospace" },
    { name: 'VT323', value: "'VT323', monospace" },
    { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
];

const buyCreditsButtonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const ToggleSwitch = ({ checked, onChange }) => {
    const toggleSwitchStyle = { position: 'relative', display: 'inline-block', width: '50px', height: '28px' };
    const sliderStyle = { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px' };
    return (
         <label style={toggleSwitchStyle}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{opacity: 0, width: 0, height: 0}}/>
            <span style={{...sliderStyle, backgroundColor: checked ? 'var(--accent-color)' : '#E0E0E0'}}>
                <span style={{position: 'absolute', height: '20px', width: '20px', left: '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: checked ? 'translateX(22px)' : 'translateX(0)'}} />
            </span>
        </label>
    );
};

const SettingsPage = () => {
    const { settings, saveSettings } = useSettings();
    const [nftVisibility, setNftVisibility] = useState(true);
    const { user, setCreditsModalOpen, marketplaceNfts } = useOutletContext();
    const hasLifetimeAccess = user?.ownedNfts?.some(nft => nft.name === 'Lifetime Messaging NFT');
    const lifetimeNft = marketplaceNfts?.find(nft => nft.name === 'Lifetime Messaging NFT');

    const handleSettingChange = (key, value) => {
        saveSettings({ [key]: value });
    };

    if (!user) {
        return <div>Loading settings...</div>
    }

    return (
        <div style={settingsPageStyle}>
            <h1 style={{color: 'var(--text-color)'}}>Settings</h1>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Messaging Credits</h2>
                <div style={settingItemStyle}>
                    <span>Your Balance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {hasLifetimeAccess ? "Unlimited ✨" : `${(user.credits || 0).toLocaleString()} Credits`}
                    </span>
                </div>
                {!hasLifetimeAccess && (
                    <div style={settingItemStyle}>
                        <span>Need more credits?</span>
                        <button style={buyCreditsButtonStyle} onClick={() => setCreditsModalOpen(true)}>Buy Credits</button>
                    </div>
                )}
                 {lifetimeNft && !hasLifetimeAccess && (
                    <div style={settingItemStyle}>
                        <span>Go unlimited!</span>
                        <Link to={`/marketplace?nft_id=${lifetimeNft.id}`} style={{...buyCreditsButtonStyle, backgroundColor: 'var(--accent-color)', textDecoration: 'none'}}>
                            Get Lifetime Messaging NFT
                        </Link>
                    </div>
                )}
                <div style={lastSettingItemStyle}>
                    <span>Transaction History</span>
                    <span style={{color: 'var(--text-secondary)'}}>Coming soon...</span>
                </div>
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Appearance</h2>
                <div style={settingItemStyle}>
                    <span>Theme</span>
                    <div style={controlContainerStyle}>
                        <button style={themeButtonStyle(settings.theme === 'light')} onClick={() => handleSettingChange('theme', 'light')}>Light</button>
                        <button style={themeButtonStyle(settings.theme === 'dark')} onClick={() => handleSettingChange('theme', 'dark')}>Dark</button>
                    </div>
                </div>
                 <div style={settingItemStyle}>
                    <span>Primary Color</span>
                    <input type="color" style={colorInputStyle} value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} />
                </div>
                 <div style={settingItemStyle}>
                    <span>Accent Color</span>
                    <input type="color" style={colorInputStyle} value={settings.accentColor} onChange={(e) => handleSettingChange('accentColor', e.target.value)} />
                </div>
                <div style={lastSettingItemStyle}>
                    <span>Font Family</span>
                     <select style={selectStyle} value={settings.font} onChange={(e) => handleSettingChange('font', e.target.value)}>
                        {fontOptions.map(font => (
                            <option key={font.name} value={font.value}>{font.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Interface</h2>
                <div style={settings.backgroundTransparencyEnabled ? settingItemStyle : lastSettingItemStyle}>
                    <span>Transparent Background</span>
                    <ToggleSwitch checked={settings.backgroundTransparencyEnabled} onChange={() => handleSettingChange('backgroundTransparencyEnabled', !settings.backgroundTransparencyEnabled)} />
                </div>
                {settings.backgroundTransparencyEnabled && (
                    <div style={lastSettingItemStyle}>
                        <span>Transparency Level</span>
                        <div style={{...controlContainerStyle, flex: 1, maxWidth: '50%'}}>
                            <input type="range" min="5" max="95" value={(settings.backgroundTransparencyLevel || 0.15) * 100} onChange={(e) => handleSettingChange('backgroundTransparencyLevel', e.target.value / 100)} style={{flex: 1, cursor: 'pointer'}} />
                            <span style={{width: '45px', textAlign: 'right', color: 'var(--text-secondary)'}}>{Math.round((settings.backgroundTransparencyLevel || 0.15) * 100)}%</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Privacy & Content</h2>
                <div style={settingItemStyle}>
                    <span>Public NFT Gallery</span>
                     <ToggleSwitch checked={nftVisibility} onChange={() => setNftVisibility(!nftVisibility)} />
                </div>
                <div style={lastSettingItemStyle}>
                    <span>Blocked Users</span>
                    <a href="#/profile" style={{color: 'var(--primary-color)'}}>Manage</a>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;