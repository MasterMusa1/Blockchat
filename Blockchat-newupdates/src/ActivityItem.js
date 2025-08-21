import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VerificationBadge from './components/VerificationBadge';

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
        switch(item.type) {
            case 'status_update': 
                return <p style={bodyStyle}>{item.content}</p>;
            case 'nft_listing':
                return (
                    <div>
                        <p style={{...actionTextStyle, marginBottom: '10px'}}>
                            listed a new NFT for sale:
                        </p>
                        <div style={nftCardStyle}>
                            <img src={item.nft.image} alt={item.nft.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}/>
                            <div>
                                <h4 style={{margin: 0, color: 'var(--text-color)'}}>{item.nft.name}</h4>
                                <p style={{margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{item.nft.description}</p>
                                <strong style={{color: 'var(--primary-color)'}}>{item.nft.price}</strong>
                            </div>
                        </div>
                        <Link to={`/marketplace?nft_id=${item.nft.id}`} style={viewInMarketplaceStyle}>
                            View in Marketplace
                        </Link>
                    </div>
                );
            case 'new_friend':
                return <p style={bodyStyle}>{item.user.name} is now friends with {item.friend.name}.</p>;
            case 'achievement':
                 return <p style={bodyStyle}><strong>{item.achievement}</strong></p>;
            case 'shared_content':
                return (
                    <div>
                        <p style={bodyStyle}>{item.comment}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={linkCardStyle}>
                            <p style={{margin:0, fontWeight: 'bold'}}>{item.title}</p>
                            <p style={{margin:'5px 0 0', fontSize: '0.9rem'}}>{item.description}</p>
                        </a>
                    </div>
                );
            default:
                return <p style={bodyStyle}>{item.content}</p>;
        }
    }
    
    // Normalize user object
    const user = typeof item.user === 'string' ? { name: item.user, avatar: 'https://i.imgur.com/siB8l8m.png' } : item.user;

    return (
        <div style={finalItemStyle}>
            {user.avatar && <img src={user.avatar} alt="avatar" style={avatarStyle} />}
            <div style={contentStyle}>
                <div style={headerStyle}>
                    <Link to={`/profile/${user.walletAddress}`} style={{textDecoration: 'none'}}>
                        <span style={userNameStyle}>
                            {user.name}
                            <VerificationBadge isVip={user.isVip} isVerified={user.isVerified} />
                        </span>
                    </Link>
                    <span style={actionTextStyle}>{renderActionText()}</span>
                    {item.timestamp && <span style={timestampStyle}>· {new Date(item.timestamp).toLocaleDateString()}</span>}
                </div>
                
                {renderContent()}

                <div style={footerStyle}>
                    <span style={{...footerActionStyle, color: item.liked ? 'var(--primary-color)' : 'inherit'}} onClick={() => onLike(item.id)}>👍 {item.likes}</span>
                    <span style={footerActionStyle} onClick={() => setCommentsVisible(!commentsVisible)}>💬 {item.comments}</span>
                </div>
                
                {commentsVisible && (
                     <div style={commentSectionStyle}>
                        <form onSubmit={handleCommentSubmit}>
                            <input style={commentInputStyle} placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                        </form>
                        {(item.commentData || []).map((comment, index) => (
                            <div key={index} style={commentStyle}>
                                <img src={comment.user.avatar} alt={comment.user.name} style={{...avatarStyle, width:'30px', height:'30px'}}/>
                                <div style={{backgroundColor: 'var(--background-color)', padding: '8px 12px', borderRadius: '12px'}}>
                                    <strong style={{fontSize: '0.9rem'}}>{comment.user.name}</strong>
                                    <p style={{fontSize: '0.9rem', margin: '4px 0 0'}}>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
            <div ref={menuRef}>
                <button style={menuButtonStyle} onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
                {menuOpen && (
                    <div style={dropdownMenuStyle}>
                        <button style={dropdownItemStyle} onClick={() => onReport(item)}>Report</button>
                        <button style={dropdownItemStyle} onClick={() => onNotInterested(item.id)}>Not interested</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityItem;