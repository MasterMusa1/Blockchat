import React from 'react';
import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';

const resultStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
};

const avatarStyle = { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' };
const infoStyle = { flex: 1 };
const nameStyle = { fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' };
const walletStyle = { color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' };
const followButtonStyle = {
    padding: '8px 16px',
    border: '1px solid var(--primary-color)',
    borderRadius: '20px',
    backgroundColor: 'transparent',
    color: 'var(--primary-color)',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const followingButtonStyle = {
    ...followButtonStyle,
    backgroundColor: 'var(--primary-color)',
    color: 'white',
};

const UserSearchResult = ({ user, currentUser, onFollowToggle }) => {
    const isFollowing = currentUser?.following?.includes(user.walletAddress);

    return (
        <div style={resultStyle}>
            <img src={`https://i.pravatar.cc/150?u=${user.walletAddress}`} alt={user.displayName} style={avatarStyle} />
            <div style={infoStyle}>
                <Link to={`/profile/${user.walletAddress}`} style={{ textDecoration: 'none', color: 'var(--text-color)' }}>
                    <div style={nameStyle}>
                        {user.displayName}
                        <VerificationBadge isVip={user.isVip} isVerified={user.isVerified} />
                    </div>
                </Link>
                <div style={walletStyle}>{user.walletAddress}</div>
            </div>
            <button
                style={isFollowing ? followingButtonStyle : followButtonStyle}
                onClick={() => onFollowToggle(user)}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        </div>
    );
};

export default UserSearchResult;