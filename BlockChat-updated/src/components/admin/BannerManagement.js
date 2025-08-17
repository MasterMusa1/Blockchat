import React, { useState } from 'react';
import * as mockService from '../../services/mockService';

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

const BannerManagement = ({ promotionalBanners, setPromotionalBanners }) => {
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerMessage, setBannerMessage] = useState('');

    const handleSetBanner = async (e) => {
        e.preventDefault();
        if(!bannerTitle || !bannerMessage) {
            alert('Please provide a title and message for the banner.');
            return;
        }
        const newBanner = { id: Date.now(), title: bannerTitle, message: bannerMessage, active: true };
        const bannersToUpdate = promotionalBanners.map(b => ({ ...b, active: false }));
        bannersToUpdate.push(newBanner);
        
        const updatedBanners = await mockService.updateBanners(bannersToUpdate);
        setPromotionalBanners(updatedBanners);
        alert('New promotional banner has been set!');
        setBannerTitle('');
        setBannerMessage('');
    };
    
    const handleDeactivateBanner = async () => {
        const deactivatedBanners = promotionalBanners.map(b => ({...b, active: false}));
        const updatedBanners = await mockService.updateBanners(deactivatedBanners);
        setPromotionalBanners(updatedBanners);
        alert('All promotional banners have been deactivated.');
    };
    
    const activeBanner = promotionalBanners.find(b => b.active);

    return (
        <div>
            <form onSubmit={handleSetBanner} style={formSectionStyle}>
                <h2>Set Promotional Banner</h2>
                <input style={inputStyle} placeholder="Banner Title (e.g., 'Special Offer')" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
                <textarea style={{...inputStyle, resize: 'vertical'}} placeholder="Banner Message (e.g., 'Get 20% bonus credits!')" value={bannerMessage} onChange={(e) => setBannerMessage(e.target.value)} />
                <button type="submit" style={buttonStyle}>Set Active Banner</button>
            </form>

            {activeBanner && (
                <div style={formSectionStyle}>
                    <h2>Current Active Banner</h2>
                    <p><strong>{activeBanner.title}:</strong> {activeBanner.message}</p>
                    <button style={buttonStyle} onClick={handleDeactivateBanner}>Deactivate Banner</button>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;