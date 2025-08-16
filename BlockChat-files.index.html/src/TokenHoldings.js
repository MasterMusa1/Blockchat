import React from 'react';

const sectionStyle = {
    marginBottom: '30px'
};

const sectionTitleStyle = {
    margin: '0 0 20px 0',
    color: 'var(--text-color)',
    fontSize: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
};

const tokenListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
};

const tokenItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--background-color)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
};

const tokenLogoStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '15px',
    objectFit: 'cover',
    backgroundColor: 'var(--surface-color)',
};

const tokenInfoStyle = {
    flex: 1,
    minWidth: 0,
};

const tokenNameStyle = {
    fontWeight: 'bold',
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const tokenSymbolStyle = {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
};

const tokenBalanceStyle = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'var(--text-color)',
    marginLeft: '10px',
};

const TokenHoldings = ({ tokens, isLoading }) => {
    if (isLoading) {
        return (
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Token Holdings</h2>
                <div style={{...tokenItemStyle, justifyContent: 'center', color: 'var(--text-secondary)'}}>Loading token balances...</div>
            </div>
        );
    }
    
    if (tokens.length === 0) {
        return (
             <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Token Holdings</h2>
                <div style={{...tokenItemStyle, justifyContent: 'center', color: 'var(--text-secondary)'}}>No SPL tokens found in this wallet.</div>
            </div>
        )
    }

    return (
        <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Token Holdings</h2>
            <div style={tokenListStyle}>
                {tokens.map((token) => (
                    <div key={token.mint} style={tokenItemStyle}>
                        <img src={token.logo} alt={token.name} style={tokenLogoStyle} onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/siB8l8m.png'; }} />
                        <div style={tokenInfoStyle}>
                            <div style={tokenNameStyle} title={token.name}>{token.name}</div>
                            <div style={tokenSymbolStyle}>{token.symbol}</div>
                        </div>
                        <div style={tokenBalanceStyle}>
                            {parseFloat(token.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TokenHoldings;