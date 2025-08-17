import React from 'react';
import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';

const itemStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    borderLeft: '4px solid var(--accent-color)',
};

const headerStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' };
const userNameStyle = { fontWeight: 'bold', color: 'var(--text-color)', display: 'flex', alignItems: 'center' };
const tokenTagStyle = { backgroundColor: 'var(--background-color)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', color: 'var(--primary-color)' };
const contentStyle = { margin: '10px 0', color: 'var(--text-color)', whiteSpace: 'pre-wrap' };
const footerStyle = { display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '15px' };
const footerActionStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };

const TokenPerformanceItem = ({ item, onLike, onAddComment }) => {
    return (
        <div style={itemStyle}>
            <div style={headerStyle}>
                <img src={item.user.avatar} alt={item.user.name} style={avatarStyle} />
                <div>
                    <Link to={`/profile/${item.user.walletAddress}`} style={{ textDecoration: 'none' }}>
                        <span style={userNameStyle}>
                            {item.user.name}
                            <VerificationBadge isVip={item.user.isVip} isVerified={item.user.isVerified} />
                        </span>
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>shared an update for</span>
                </div>
                <span style={tokenTagStyle}>${item.tokenSymbol}</span>
            </div>
            <p style={contentStyle}>{item.content}</p>
            <div style={footerStyle}>
                <span style={footerActionStyle} onClick={() => onLike(item.id)}>
                    ❤️ {item.likes || 0} Likes
                </span>
                <span style={footerActionStyle} onClick={() => onAddComment(item.id, 'New comment')}>
                    💬 {item.comments || 0} Comments
                </span>
            </div>
        </div>
    );
};

export default TokenPerformanceItem;