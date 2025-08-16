import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ADMIN_WALLET_ADDRESS } from './constants';

const navStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 10,
};

const logoStyle = {
    width: '45px',
    height: '45px',
    marginRight: '15px',
    transition: 'transform 0.2s',
};

const navLinksStyle = {
    flex: 1,
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
};

const navLink = {
    color: '#888',
    fontWeight: '500',
    fontSize: '1rem',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.2s, color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
}

const activeLink = {
    ...navLink,
    color: 'var(--surface-color)',
    backgroundColor: 'var(--primary-color)',
}

const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
};

const creditsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--background-color)',
    padding: '8px 15px',
    borderRadius: '8px',
};

const creditsTextStyle = {
    color: 'var(--text-color)',
    fontWeight: 'bold',
    fontSize: '0.9rem',
};

const buyCreditsButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
};

const coinIconStyle = {
    fontSize: '1.2rem',
    color: 'var(--accent-color)', // Lime Green
};

const hamburgerStyle = {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '2rem',
    height: '2rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 20,
};

const hamburgerLineStyle = {
    width: '2rem',
    height: '0.25rem',
    background: 'var(--text-color)',
    borderRadius: '10px',
    transition: 'all 0.3s linear',
    position: 'relative',
    transformOrigin: '1px',
};

const mobileNavOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: 'var(--surface-color)',
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    transition: 'transform 0.3s ease-in-out',
};

const unreadBadgeStyle = {
    backgroundColor: 'var(--button-alert-color)',
    color: 'white',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
};

const Navbar = ({ onBuyCreditsClick, credits, ownedNfts = [], unreadCounts = {} }) => {
    const { publicKey } = useWallet();
    const isAdmin = publicKey && publicKey.toBase58() === ADMIN_WALLET_ADDRESS;
    const hasLifetimeAccess = isAdmin || ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const NavLinks = () => (
        <>
            <NavLink to="/" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)} end>
                Chat
                {totalUnread > 0 && <span style={unreadBadgeStyle}>{totalUnread}</span>}
            </NavLink>
            <NavLink to="/feed" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Feed</NavLink>
            <NavLink to="/marketplace" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Marketplace</NavLink>
            <NavLink to="/mint" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Mint NFT</NavLink>
            <NavLink to="/profile" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
            <NavLink to="/settings" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Settings</NavLink>
            {isAdmin && (
                <NavLink to="/admin" style={({ isActive }) => isActive ? activeLink : navLink} onClick={() => setMobileMenuOpen(false)}>Admin</NavLink>
            )}
        </>
    );

    return (
        <nav style={navStyle}>
            <img src="https://i.imgur.com/siB8l8m.png" alt="Logo" style={logoStyle} />
            <div style={{...navLinksStyle, display: isMobile ? 'none' : 'flex'}}>
                <NavLinks />
            </div>
             <div style={{...rightSectionStyle, display: isMobile ? 'none' : 'flex'}}>
                <div style={creditsContainerStyle}>
                    <span style={creditsTextStyle}>{hasLifetimeAccess ? "Unlimited" : credits.toLocaleString()} Credits</span>
                    {!hasLifetimeAccess && (
                         <button onClick={onBuyCreditsClick} style={buyCreditsButtonStyle} title="Buy Credits">
                            <span style={coinIconStyle}>🪙</span>
                        </button>
                    )}
                </div>
                <WalletMultiButton />
            </div>
            
            <button style={{...hamburgerStyle, display: isMobile ? 'flex' : 'none'}} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                <div style={{...hamburgerLineStyle, transform: isMobileMenuOpen ? 'rotate(45deg)' : 'rotate(0)'}} />
                <div style={{...hamburgerLineStyle, opacity: isMobileMenuOpen ? 0 : 1 }} />
                <div style={{...hamburgerLineStyle, transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0)'}} />
            </button>

            {isMobile && isMobileMenuOpen && (
                <div style={{...mobileNavOverlayStyle, transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'}}>
                    <NavLinks />
                    <div style={creditsContainerStyle}>
                        <span style={creditsTextStyle}>{hasLifetimeAccess ? "Unlimited" : credits.toLocaleString()} Credits</span>
                        {!hasLifetimeAccess && (
                             <button onClick={onBuyCreditsClick} style={buyCreditsButtonStyle} title="Buy Credits">
                                <span style={coinIconStyle}>🪙</span>
                            </button>
                        )}
                    </div>
                    <WalletMultiButton />
                </div>
            )}
        </nav>
    );
};

export default Navbar;