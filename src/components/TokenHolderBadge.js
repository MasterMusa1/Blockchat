import React from 'react';

const badgeStyle = {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    marginLeft: '6px',
    verticalAlign: 'middle',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
};

const badgeContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '10px',
    textShadow: '0 0 2px rgba(0,0,0,0.5)',
};

const ranks = {
    gold: {
        background: 'linear-gradient(145deg, #FFD700, #FBB034)',
        character: '✔',
    },
    silver: {
        background: 'linear-gradient(145deg, #C0C0C0, #A9A9A9)',
        character: '✔',
    },
    bronze: {
        background: 'linear-gradient(145deg, #CD7F32, #A0522D)',
        character: '✔',
    }
};

const TokenHolderBadge = ({ rank }) => {
    if (!rank || !ranks[rank]) {
        return null;
    }

    const { background, character } = ranks[rank];

    return (
        <span style={{ ...badgeStyle, background }} title={`Top ${rank.charAt(0).toUpperCase() + rank.slice(1)} Holder`}>
            <span style={badgeContentStyle}>{character}</span>
        </span>
    );
};

export default TokenHolderBadge;