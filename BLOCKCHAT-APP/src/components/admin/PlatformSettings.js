import React, { useState, useEffect } from 'react';
import * as dataService from '../../services/dataService';

const formSectionStyle = {
    padding: '25px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
    marginBottom: '10px'
};

const buttonStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const ToggleSwitch = ({ checked, onChange }) => {
    const toggleSwitchStyle = {
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '28px',
    };
    const sliderStyle = {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ccc',
        transition: '.4s',
        borderRadius: '34px',
    };
    return (
         <label style={toggleSwitchStyle}>
            <input type="checkbox" checked={checked} onChange={onChange} style={{opacity: 0, width: 0, height: 0}}/>
            <span style={{...sliderStyle, backgroundColor: checked ? 'var(--accent-color)' : '#E0E0E0'}}>
                <span style={{position: 'absolute', height: '20px', width: '20px', left: '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: checked ? 'translateX(22px)' : 'translateX(0)'}} />
            </span>
        </label>
    );
};

const PlatformSettings = ({ messagingCosts, featureToggles, setMessagingCosts, setFeatureToggles }) => {
    const [localCosts, setLocalCosts] = useState(messagingCosts);
    const [localToggles, setLocalToggles] = useState(featureToggles);

    useEffect(() => {
        setLocalCosts(messagingCosts);
        setLocalToggles(featureToggles);
    }, [messagingCosts, featureToggles]);

    const handleCostChange = (e) => {
        const { name, value } = e.target;
        setLocalCosts(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleToggleChange = (key) => {
        setLocalToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleSaveSettings = async () => {
        try {
            const settingsToUpdate = {
                messagingCosts: localCosts,
                featureToggles: localToggles,
            };
            const updatedSettings = await dataService.updateAdminSettings(settingsToUpdate);
            setMessagingCosts(updatedSettings.messagingCosts);
            setFeatureToggles(updatedSettings.featureToggles);
            alert('Platform settings updated!');
        } catch (error) {
            console.error('Failed to save settings: ', error);
            alert('Error saving settings.');
        }
    };

    if (!localCosts || !localToggles) {
        return <div>Loading settings...</div>;
    }

    return (
        <div>
            <div style={formSectionStyle}>
                <h2>Messaging Credit Costs</h2>
                <label>Text Message Cost</label>
                <input style={inputStyle} type="number" name="text" value={localCosts.text} onChange={handleCostChange} />
                <label>Media Message Cost</label>
                <input style={inputStyle} type="number" name="media" value={localCosts.media} onChange={handleCostChange} />
                <label>Group Creation Cost</label>
                <input style={inputStyle} type="number" name="groupCreation" value={localCosts.groupCreation} onChange={handleCostChange} />
                <label>NFT Minting Cost</label>
                <input style={inputStyle} type="number" name="nftMinting" value={localCosts.nftMinting || 0} onChange={handleCostChange} />
                <label>Poll Creation Cost</label>
                <input style={inputStyle} type="number" name="pollCreation" value={localCosts.pollCreation || 0} onChange={handleCostChange} />
            </div>
            
            <div style={formSectionStyle}>
                <h2>Feature Toggles</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span>P2P Marketplace</span>
                    <ToggleSwitch checked={localToggles.p2pMarketplace} onChange={() => handleToggleChange('p2pMarketplace')} />
                </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Status Updates</span>
                    <ToggleSwitch checked={localToggles.statusUpdates} onChange={() => handleToggleChange('statusUpdates')} />
                </div>
            </div>

            <button style={buttonStyle} onClick={handleSaveSettings}>Save All Settings</button>
        </div>
    );
};

export default PlatformSettings;