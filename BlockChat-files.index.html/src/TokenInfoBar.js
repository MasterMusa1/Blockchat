import React, { useState, useEffect } from 'react';

const barStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '10px 20px',
    backgroundColor: 'var(--background-color)',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
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
    marginLeft: 'auto',
};

const TokenInfoBar = ({ contractAddress, logo, name }) => {
    const [tokenData, setTokenData] = useState(null);
    const [error, setError] = useState(null);

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
    const volume = parseFloat(tokenData.volume_usd.h24);

    return (
        <div style={barStyle}>
            <div style={tokenInfoStyle}>
                <img src={logo || tokenData.image_url} alt={name} style={tokenLogoStyle} />
                <span style={tokenNameStyle}>{name || tokenData.name} ({tokenData.symbol})</span>
            </div>
            <div style={statStyle}>
                <span style={statLabelStyle}>Price:</span>
                <span style={statValueStyle}>${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
            </div>
            <div style={statStyle}>
                <span style={statLabelStyle}>Volume (24h):</span>
                <span style={statValueStyle}>${volume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
             <a href={`https://www.geckoterminal.com/solana/tokens/${contractAddress}`} target="_blank" rel="noopener noreferrer" style={geckoLinkStyle}>
                View on GeckoTerminal 🦎
            </a>
        </div>
    );
};

export default TokenInfoBar;