import React, { useState, useEffect } from 'react';
import BondingCurveDisplay from './BondingCurveDisplay';

const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '15px 20px',
    backgroundColor: 'var(--background-color)',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
};

const leftSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
    minWidth: '300px',
};

const rightSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const tokenInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
};

const tokenLogoStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
};

const tokenNameStyle = {
    fontWeight: 'bold',
    fontSize: '1.1rem',
};

const statsContainerStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
};

const statStyle = {
    fontSize: '0.9rem',
};

const statLabelStyle = {
    color: 'var(--text-secondary)',
    marginRight: '5px',
};

const statValueStyle = {
    fontWeight: '500',
};

const geckoLinkStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    marginTop: '5px',
};

const TokenInfoBar = ({ contractAddress, logo, name }) => {
    const [tokenData, setTokenData] = useState(null);
    const [bondingCurvePosition, setBondingCurvePosition] = useState(0);
    const [error, setError] = useState(null);

    // Simple hash function to generate a deterministic value from a string
    const stringToHash = (str) => {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    useEffect(() => {
        if (!contractAddress) return;

        const fetchTokenData = async () => {
            try {
                const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${contractAddress}`);
                if (!response.ok) {
                    throw new Error('Token not found on GeckoTerminal');
                }
                const data = await response.json();
                setTokenData(data.data.attributes);

                // Simulate bonding curve position based on contract address
                const hash = stringToHash(contractAddress);
                const mockPercentage = 10 + (Math.abs(hash) % 81); // Generate a value between 10% and 90%
                setBondingCurvePosition(mockPercentage);

                setError(null);
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch token data:", err);
            }
        };

        fetchTokenData();
        const interval = setInterval(fetchTokenData, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, [contractAddress]);

    if (error) {
        return <div style={barStyle}><span style={{color: 'var(--button-alert-color)'}}>Could not load token data.</span></div>;
    }

    if (!tokenData) {
        return <div style={barStyle}><span>Loading token info...</span></div>;
    }

    const price = parseFloat(tokenData.price_usd);
    const marketCap = parseFloat(tokenData.fdv_usd);
    const volume = parseFloat(tokenData.volume_usd.h24);

    return (
        <div style={barStyle}>
            <div style={leftSectionStyle}>
                <div style={tokenInfoStyle}>
                    <img src={logo || tokenData.image_url} alt={name} style={tokenLogoStyle} />
                    <span style={tokenNameStyle}>{name || tokenData.name} ({tokenData.symbol})</span>
                </div>
                <div style={statsContainerStyle}>
                    <div style={statStyle}>
                        <span style={statLabelStyle}>Price:</span>
                        <span style={statValueStyle}>${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    </div>
                    <div style={statStyle}>
                        <span style={statLabelStyle}>Market Cap:</span>
                        <span style={statValueStyle}>${marketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={statStyle}>
                        <span style={statLabelStyle}>Volume (24h):</span>
                        <span style={statValueStyle}>${volume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
                <a href={`https://www.geckoterminal.com/solana/tokens/${contractAddress}`} target="_blank" rel="noopener noreferrer" style={geckoLinkStyle}>
                    View on GeckoTerminal 🦎
                </a>
            </div>
            <div style={rightSectionStyle}>
                <BondingCurveDisplay percentage={bondingCurvePosition} />
            </div>
        </div>
    );
};

export default TokenInfoBar;