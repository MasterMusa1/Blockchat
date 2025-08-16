import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const itemStyle = {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    gap: '15px',
    transition: 'background-color 0.3s, border-color 0.3s',
    position: 'relative',
};

const avatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover',
};

const contentStyle = {
    flex: 1,
};

const headerStyle = {
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const userNameStyle = {
    fontWeight: 'bold',
    color: 'var(--text-color)',
    marginRight: '5px',
    display: 'inline-flex',
    alignItems: 'center',
};

const actionTextStyle = {
    color: 'var(--text-secondary)',
};

const timestampStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginLeft: '5px'
};

const bodyStyle = {
    color: 'var(--text-color)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginBottom: '10px',
};

const footerStyle = {
    display: 'flex',
    gap: '20px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '15px'
};

const footerActionStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
};

const linkCardStyle = {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '10px',
    textDecoration: 'none',
    display: 'block',
    color: 'var(--primary-color)'
};

const nftCardStyle = {
    display: 'flex',
    gap: '15px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '10px',
    backgroundColor: 'var(--background-color)'
};

const viewInMarketplaceStyle = {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
};

const menuButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    padding: '5px',
    zIndex: 2,
    lineHeight: 1,
};

const dropdownMenuStyle = {
    position: 'absolute',
    top: '35px',
    right: '10px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10,
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
};

const dropdownItemStyle = {
    padding: '10px 15px',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--text-color)',
    fontSize: '0.9rem'
};

const commentSectionStyle = {
    marginTop: '15px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '15px',
};
const commentInputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-color)', color: 'var(--text-color)'};
const commentStyle = { display: 'flex', gap: '10px', marginTop: '10px' };

const ActivityItem = ({ item, onLike, onAddComment, onReport, onNotInterested }) => {
    const isBroadcast = item.user.name === 'BlockChat' || item.user.isAdmin;
    const [menuOpen, setMenuOpen] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentText, setCommentText] = useState('');
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        onAddComment(item.id, commentText);
        setCommentText('');
    };

    const finalItemStyle = {
        ...itemStyle,
        paddingLeft: '20px',
        ...(isBroadcast && {
            backgroundColor: 'var(--background-color)',
            borderLeft: `4px solid var(--primary-color)`,
        })
    };

    const renderActionText = () => {
        switch(item.type) {
            case 'status_update':
                return 'posted an update';
            case 'new_friend':
                return ''; // text is already in renderContent
            case 'achievement':
                return 'unlocked an achievement:';
            case 'shared_content':
                return 'shared a link';
            case 'nft_listing':
                return ''; // text is already in renderContent
            default:
                return '';
        }
    }

    const renderContent = () => {
        switch (item.type) {
            case 'status_update':
                return <p style={bodyStyle}>{item.content}</p>;
            case 'new_friend':
                return (
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <img src={item.friend.avatar} alt={item.friend.name} style={{...avatarStyle, width: '35px', height: '35px'}} />
                        <span>is now friends with <strong>{item.friend.name}</strong></span>
                    </div>
                );
            case 'achievement':
                return <p style={bodyStyle}>{item.icon} {item.achievement}</p>;
            case 'shared_content':
                return (
                    <>
                       <p style={bodyStyle}>{item.content}</p>
                       {item.link && (
                            <a href={item.link.url} target="_blank" rel="noopener noreferrer" style={linkCardStyle}>
                                <strong>{item.link.title}</strong>
                                <p style={{margin: '5px 0 0', fontSize: '0.9rem'}}>{item.link.description}</p>
                            </a>
                        )}
                    </>
                );
            case 'nft_listing':
                return (
                    <>
                        <p style={bodyStyle}>listed a new NFT:</p>
                        <div style={nftCardStyle}>
                            <img src={item.nft.image} alt={item.nft.name} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}}/>
                            <div>
                                <strong style={{color: 'var(--text-color)'}}>{item.nft.name}</strong>
                                <p style={{margin: '5px 0', fontSize: '0.9rem'}}>{item.nft.description}</p>
                                <span style={{fontWeight: 'bold', color: 'var(--primary-color)'}}>{item.nft.price}</span>
                            </div>
                        </div>
                        <Link to={`/marketplace?nft_id=${item.nft.id}`} style={viewInMarketplaceStyle}>View in Marketplace</Link>
                    </>
                );
            default:
                return null;
        }
    };
    
    return (
        <div style={finalItemStyle} ref={menuRef}>
            <img src={item.user.avatar} alt={item.user.name} style={avatarStyle} />
            <div style={contentStyle}>
                <button style={menuButtonStyle} onClick={() => setMenuOpen(prev => !prev)}>&#x22EE;</button>
                {menuOpen && (
                    <div style={dropdownMenuStyle}>
                        <button style={dropdownItemStyle} onClick={() => { onReport(item); setMenuOpen(false); }}>Report Post</button>
                        <button style={dropdownItemStyle} onClick={() => { onNotInterested(item.id); setMenuOpen(false); }}>Not Interested</button>
                    </div>
                )}
                <div style={headerStyle}>
                    <span style={userNameStyle}>
                        {item.user.name}
                        {item.user.isVip && <span title="VIP User" style={{color: '#FFD700', marginLeft: '5px'}}>⭐</span>}
                        {item.user.isAdmin && <span title="Admin" style={{color: 'var(--button-alert-color)', marginLeft: '5px'}}>🛡️</span>}
                    </span>
                    <span style={actionTextStyle}>
                        &nbsp;{renderActionText()}
                    </span>
                    <span style={timestampStyle}>&middot; {item.timestamp}</span>
                </div>
                
                {renderContent()}

                <div style={footerStyle}>
                    <span style={{...footerActionStyle, color: 'var(--primary-color)'}} onClick={() => onLike(item.id)}>👍 Like ({item.likes})</span>
                    <span style={footerActionStyle} onClick={() => setCommentsVisible(!commentsVisible)}>💬 Comment ({item.comments || 0})</span>
                </div>

                {commentsVisible && (
                    <div style={commentSectionStyle}>
                        {item.commentData && item.commentData.map((comment, index) => (
                            <div key={index} style={commentStyle}>
                                <img src={comment.user.avatar} alt={comment.user.name} style={{...avatarStyle, width: '35px', height: '35px'}} />
                                <div style={{backgroundColor: 'var(--background-color)', padding: '8px 12px', borderRadius: '12px', flex: 1}}>
                                    <strong style={{color: 'var(--text-color)'}}>{comment.user.name}</strong>
                                    <p style={{margin: '4px 0 0', color: 'var(--text-color)'}}>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                        <form onSubmit={handleCommentSubmit} style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <input 
                                style={commentInputStyle} 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                            />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityItem;