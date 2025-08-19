import React from 'react';

const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    marginLeft: '8px',
    verticalAlign: 'middle',
    background: 'linear-gradient(145deg, #00BFFF, #1E90FF)', // Deep Sky Blue to Dodger Blue
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px',
    textShadow: '0 0 3px rgba(0,0,0,0.4)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
};

const VerificationBadge = ({ isVip, isVerified }) => {
    if (!isVip || !isVerified) {
        return null;
    }

    return (
        <span style={badgeStyle} title="Verified VIP">
            ✔
        </span>
    );
};

export default VerificationBadge;