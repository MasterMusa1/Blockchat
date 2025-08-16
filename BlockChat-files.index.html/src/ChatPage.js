import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import CreateGroupModal from './CreateGroupModal';
import * as dataService from './services/dataService';
import { OFFICIAL_WELCOME_SENDER_WALLET } from './constants';
import SystemMessage from './SystemMessage';
import TokenInfoBar from './TokenInfoBar';
import CreatePollModal from './CreatePollModal';
import PollMessage from './PollMessage';
import MessageContextMenu from './MessageContextMenu';
import ChatHeaderMenu from './ChatHeaderMenu';
import ReportModal from './ReportModal';

const chatPageStyle = { display: 'flex', height: 'calc(100vh - 65px)', backgroundColor: 'var(--border-color)', flex: 1 };
const listStyle = { width: '300px', backgroundColor: 'var(--surface-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' };
const chatWindowStyle = { flex: 1, backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column' };
const messageAreaStyle = { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' };
const inputAreaStyle = { padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' };
const inputStyle = { flex: 1, padding: '12px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '1rem', resize: 'none' };
const chatItemStyle = { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', transition: 'background-color 0.2s', fontWeight: '500', gap: '12px' };
const chatNameStyle = { flex: 1, wordBreak: 'break-all', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const activeChatItem = { ...chatItemStyle, backgroundColor: 'var(--primary-color)', color: 'white' };
const createGroupBtnStyle = { backgroundColor: 'var(--button-alert-color)', color: 'white', border: 'none', padding: '12px', margin: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' };
const chatListTabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 10px',
    backgroundColor: 'var(--surface-color)',
};
const chatListTabStyle = (isActive) => ({
    flex: 1,
    padding: '12px 5px',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
    borderBottom: `3px solid ${isActive ? 'var(--primary-color)' : 'transparent'}`,
    transition: 'all 0.2s',
    background: 'none',
    border: 'none',
    fontSize: '0.9rem'
});
const searchContainerStyle = { padding: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '5px', alignItems: 'center' };
const searchInputStyle = { flex: 1, padding: '10px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '0.9rem' };
const startChatButtonStyle = { padding: '8px 15px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' };
const messageBubbleStyle = { padding: '10px 15px', borderRadius: '18px', maxWidth: '70%', position: 'relative', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' };
const myMessageStyle = { ...messageBubbleStyle, backgroundColor: 'var(--primary-color)', color: 'white' };
const theirMessageStyle = { ...messageBubbleStyle, backgroundColor: 'var(--background-color)', color: 'var(--text-color)' };
const officialMessageStyle = { ...messageBubbleStyle, backgroundColor: '#004d4d', color: 'white' };
const imageUploadButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' };
const pollButtonStyle = { ...imageUploadButtonStyle };
const messageImageStyle = { maxWidth: '100%', borderRadius: '8px', marginTop: '5px' };
const reactionsStyle = { position: 'absolute', bottom: '-10px', right: '10px', backgroundColor: 'var(--surface-color)', borderRadius: '10px', padding: '2px 4px', fontSize: '0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' };
const mobileChatHeaderStyle = { display: 'flex', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid var(--border-color)', gap: '10px', position: 'relative' };
const backButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-color)' };
const messageContainerStyle = { display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative' };
const myMessageContainerStyle = { ...messageContainerStyle, justifyContent: 'flex-end' };
const theirMessageContainerStyle = { ...messageContainerStyle, justifyContent: 'flex-start' };
const messageMenuButtonStyle = { cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px', fontSize: '1.2rem', lineHeight: 1, userSelect: 'none', background: 'none', border: 'none', position: 'absolute', top: '50%', transform: 'translateY(-50%)' };
const senderNameStyle = { fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '10px' };
const chatItemLogoStyle = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', backgroundColor: 'var(--background-color)' };
const listHeaderStyle = { color: 'var(--text-secondary)', padding: '10px 10px 5px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 };
const chatItemUnreadBadgeStyle = { backgroundColor: 'var(--button-alert-color)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', minWidth: '20px', textAlign: 'center', fontWeight: 'bold' };
const chatHeaderStyle = { display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', gap: '15px', position: 'relative' };
const chatHeaderNameStyle = { margin: 0, fontSize: '1.3rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const headerMenuButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-color)', padding: '5px' };


const getDmChatId = (address1, address2) => {
    if (!address1 || !address2) return null;
    return [address1, address2].sort().join('_');
};
const isWalletAddress = (str) => {
    if (!str) return false;
    try { new PublicKey(str); return true; } catch (e) { return false; }
};

const ReactionAdder = ({ onAddReaction }) => {
    const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
    const style = { position: 'absolute', top: '-20px', right: '20px', backgroundColor: 'var(--surface-color)', borderRadius: '15px', padding: '4px 8px', display: 'flex', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', zIndex: 10 };
    return (
        <div style={style}>
            {reactions.map(emoji => (
                <span key={emoji} style={{ cursor: 'pointer', fontSize: '1rem' }} onClick={() => onAddReaction(emoji)}>
                    {emoji}
                </span>
            ))}
        </div>
    );
};

const MessageBubble = React.memo(({ message, onAddReaction, onOpenMenu, isHovered }) => {
    const { publicKey } = useWallet();
    const isMyMessage = message.sender === publicKey?.toBase58();
    const isOfficialMessage = message.sender === OFFICIAL_WELCOME_SENDER_WALLET;
    const [showReactionAdder, setShowReactionAdder] = useState(false);

    const containerStyle = isMyMessage ? myMessageContainerStyle : theirMessageContainerStyle;
    const bubbleStyle = isMyMessage ? myMessageStyle : (isOfficialMessage ? officialMessageStyle : theirMessageStyle);
    const senderAvatar = isOfficialMessage ? "https://i.imgur.com/siB8l8m.png" : `https://i.pravatar.cc/150?u=${message.sender}`;
    const senderName = isOfficialMessage ? "Official BlockChat" : `User ${message.sender.slice(0, 4)}...`;

    return (
        <div style={containerStyle} onMouseEnter={() => setShowReactionAdder(true)} onMouseLeave={() => setShowReactionAdder(false)}>
            {!isMyMessage && <img src={senderAvatar} alt="avatar" style={{width: '40px', height: '40px', borderRadius: '50%', marginTop: '15px'}} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', position: 'relative' }}>
                {!isMyMessage && <span style={senderNameStyle}>{senderName}</span>}
                <div style={bubbleStyle}>
                    {showReactionAdder && !isMyMessage && <ReactionAdder onAddReaction={(emoji) => onAddReaction(message.id, emoji)} />}
                    {message.text}
                    {message.image && <img src={message.image} alt="uploaded content" style={messageImageStyle} />}
                    {Object.keys(message.reactions || {}).length > 0 && (
                        <div style={reactionsStyle}>{Object.entries(message.reactions).map(([emoji, count]) => `${emoji} ${count}`).join(' ')}</div>
                    )}
                </div>
            </div>
             {isHovered && (
                <button 
                    style={{...messageMenuButtonStyle, [isMyMessage ? 'left' : 'right']: '-35px'}}
                    onClick={(e) => onOpenMenu(e, message)}
                >
                    &#x22EE;
                </button>
            )}
        </div>
    );
});

const ChatPage = () => {
    const [isGroupModalOpen, setGroupModalOpen] = useState(false);
    const [isPollModalOpen, setPollModalOpen] = useState(false);
    const [chats, setChats] = useState([]);
    const [chatMetadata, setChatMetadata] = useState({});
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatMetadata, setActiveChatMetadata] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchAddress, setSearchAddress] = useState('');
    const [message, setMessage] = useState('');
    const [imageToSend, setImageToSend] = useState(null);
    const { user, setUserData, credits, setCredits, isAdmin, ownedNfts, messagingCosts, unreadCounts, clearUnread } = useOutletContext();
    const { publicKey } = useWallet();
    const fileInputRef = useRef(null);
    const messageAreaRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState('list');
    const [messageMenu, setMessageMenu] = useState(null);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [chatListTab, setChatListTab] = useState('dms'); // 'dms' or 'groups'
    const [isHeaderMenuOpen, setHeaderMenuOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [itemToReport, setItemToReport] = useState(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (user?.chatList) {
            setChats(user.chatList);
            const fetchAllMetadata = async () => {
                const metadata = {};
                for (const chatIdentifier of user.chatList) {
                    if (!isWalletAddress(chatIdentifier)) {
                        const meta = await dataService.getChatMetadata(chatIdentifier);
                        if (meta) metadata[chatIdentifier] = meta;
                    }
                }
                setChatMetadata(metadata);
            };
            fetchAllMetadata();
        }
    }, [user]);

    const filteredChats = useMemo(() => {
        if (!chats) return [];
    
        const filtered = chats.filter(chatId => {
            const isDM = isWalletAddress(chatId);
            if (chatListTab === 'dms') return isDM;
            if (chatListTab === 'groups') return !isDM;
            return false;
        });

        return filtered.sort((a, b) => {
            const unreadA = unreadCounts[a] || 0;
            const unreadB = unreadCounts[b] || 0;
            if (unreadA > 0 && unreadB === 0) return -1;
            if (unreadB > 0 && unreadA === 0) return 1;

            const nameA = isWalletAddress(a) ? a : (chatMetadata[a]?.name || a);
            const nameB = isWalletAddress(b) ? b : (chatMetadata[b]?.name || b);
            
            return nameA.localeCompare(nameB);
        });
    }, [chats, chatListTab, unreadCounts, chatMetadata]);

    const selectChat = useCallback(async (chatId) => {
        if (!chatId) return;
        setActiveChat(chatId);
        clearUnread(chatId);

        const meta = chatMetadata[chatId];
        setActiveChatMetadata(meta);

        try {
            const fetchedMessages = await dataService.getMessages(chatId);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([{ isSystem: true, text: 'Could not load messages.', isError: true }]);
        }

        if (isMobile) setMobileView('chat');
    }, [chatMetadata, clearUnread, isMobile]);


    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessageHandler = async () => {
        if (!publicKey || (!message.trim() && !imageToSend)) return;
        
        const hasLifetimeAccess = ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
        const cost = imageToSend ? messagingCosts.media : messagingCosts.text;
        
        if (!hasLifetimeAccess && credits < cost) {
            alert(`Not enough credits. This message costs ${cost} credits.`);
            return;
        }

        const messageData = {
            sender: publicKey.toBase58(),
            text: message,
            image: imageToSend, // In a real app, this would be a URL after upload
            reactions: {},
        };

        try {
            // Optimistic update
            setMessages(prev => [...prev, { ...messageData, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
            setMessage('');
            setImageToSend(null);
            if (!hasLifetimeAccess) setCredits(credits - cost);

            await dataService.sendMessage(activeChat, messageData);
            // Re-fetch could happen here if needed, or rely on subscriptions
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message. Please try again.");
            // Revert optimistic update could be implemented here
        }
    };

    const handleCreateGroup = async (groupData) => {
        if (!publicKey) return;
        try {
            const updatedUser = await dataService.createGroup(publicKey.toBase58(), groupData);
            setUserData(updatedUser);
            // Auto-select the new group
            const newGroupId = groupData.name; // Assuming name is the ID for now
            const meta = await dataService.getChatMetadata(newGroupId);
            setChatMetadata(prev => ({ ...prev, [newGroupId]: meta }));
            selectChat(newGroupId);
        } catch (error) {
            console.error("Error creating group:", error);
            alert(error.message);
        }
    };
    
    const startChat = async () => {
        if (!publicKey || !isWalletAddress(searchAddress)) {
            alert('Please enter a valid Solana wallet address.');
            return;
        }
        if (searchAddress === publicKey.toBase58()) {
            alert("You can't start a chat with yourself.");
            return;
        }

        const chatId = getDmChatId(publicKey.toBase58(), searchAddress);
        if (!chats.includes(chatId)) {
            // This is a new chat, update user's chat list
            const updatedUser = await dataService.updateUserChatList(publicKey.toBase58(), searchAddress);
            setUserData(updatedUser);
        }
        selectChat(searchAddress);
        setSearchAddress('');
    };
    
    const handleMessageMenu = (e, msg) => {
        e.preventDefault();
        setMessageMenu({ x: e.clientX, y: e.clientY, message: msg });
    };

    const handleMessageMenuAction = async (action, msg) => {
        setMessageMenu(null);
        if (action === 'delete') {
            if (window.confirm("Are you sure you want to delete this message?")) {
                setMessages(prev => prev.filter(m => m.id !== msg.id));
                await dataService.deleteMessage(activeChat, msg.id);
            }
        } else if (action === 'report') {
            setItemToReport({ type: 'Message', content: msg.text, reportedUser: msg.sender });
            setReportModalOpen(true);
        } else if (action === 'block') {
            if (window.confirm(`Are you sure you want to block this user? You will no longer see their messages.`)) {
                const updatedUser = await dataService.blockUser(publicKey.toBase58(), msg.sender);
                setUserData(updatedUser);
                alert("User blocked.");
            }
        }
    };
    
    const handleReportSubmit = async (reportData) => {
        // In a real app, this would go to a moderation backend
        console.log("Submitting report:", reportData);
        alert("Report submitted for review.");
    };

    const isGroupChat = activeChat && !isWalletAddress(activeChat);

    const chatHeaderMenuItems = [
        { label: 'View Members', onClick: () => alert('Feature coming soon!'), icon: '👥' },
        ...(isGroupChat ? [{ label: 'Group Settings', onClick: () => alert('Feature coming soon!'), icon: '⚙️' }] : []),
        { label: 'Clear Chat', onClick: () => alert('Feature coming soon!'), icon: '🧹', isDestructive: true },
        ...(isGroupChat ? [{ label: 'Leave Group', onClick: () => alert('Feature coming soon!'), icon: '🚪', isDestructive: true }] : []),
    ];

    const chatList = (
        <div style={{ ...listStyle, display: isMobile && mobileView === 'chat' ? 'none' : 'flex' }}>
            <div style={searchContainerStyle}>
                <input style={searchInputStyle} placeholder="Start DM by wallet address" value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
                <button style={startChatButtonStyle} onClick={startChat}>Go</button>
            </div>
            <div style={chatListTabContainerStyle}>
                <button style={chatListTabStyle(chatListTab === 'dms')} onClick={() => setChatListTab('dms')}>DMs</button>
                <button style={chatListTabStyle(chatListTab === 'groups')} onClick={() => setChatListTab('groups')}>Groups</button>
            </div>
            <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
                <h3 style={listHeaderStyle}>{chatListTab === 'dms' ? 'Direct Messages' : 'Groups'}</h3>
                {filteredChats.map(chatId => {
                    const meta = chatMetadata[chatId];
                    const displayName = meta ? meta.name : `${chatId.slice(0, 4)}...${chatId.slice(-4)}`;
                    const logo = meta ? meta.logo : `https://i.pravatar.cc/150?u=${chatId}`;
                    const unreadCount = unreadCounts[chatId] || 0;

                    return (
                        <div key={chatId} style={activeChat === chatId ? activeChatItem : chatItemStyle} onClick={() => selectChat(chatId)}>
                            <img src={logo} alt="avatar" style={chatItemLogoStyle} />
                            <span style={chatNameStyle}>{displayName}</span>
                            {unreadCount > 0 && <span style={chatItemUnreadBadgeStyle}>{unreadCount}</span>}
                        </div>
                    );
                })}
            </div>
            <button style={createGroupBtnStyle} onClick={() => setGroupModalOpen(true)}>Create Token-Gated Group</button>
        </div>
    );

    const chatWindow = (
        <div style={{...chatWindowStyle, display: isMobile && mobileView === 'list' ? 'none' : 'flex'}}>
            {activeChat ? (
                <>
                    {isMobile && (
                        <div style={mobileChatHeaderStyle}>
                            <button style={backButtonStyle} onClick={() => setMobileView('list')}>&larr;</button>
                            <img src={activeChatMetadata?.logo || `https://i.pravatar.cc/150?u=${activeChat}`} alt="avatar" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
                            <h2 style={{...chatHeaderNameStyle, fontSize: '1.1rem'}}>{activeChatMetadata?.name || `${activeChat.slice(0, 6)}...`}</h2>
                             <button style={headerMenuButtonStyle} onClick={() => setHeaderMenuOpen(true)}>&#x22EE;</button>
                             {isHeaderMenuOpen && <ChatHeaderMenu items={chatHeaderMenuItems} onClose={() => setHeaderMenuOpen(false)} />}
                        </div>
                    )}
                    {!isMobile && (
                        <div style={chatHeaderStyle}>
                            <img src={activeChatMetadata?.logo || `https://i.pravatar.cc/150?u=${activeChat}`} alt="avatar" style={{width: '45px', height: '45px', borderRadius: '50%'}} />
                            <h2 style={chatHeaderNameStyle}>{activeChatMetadata?.name || `${activeChat.slice(0, 6)}...`}</h2>
                            <button style={headerMenuButtonStyle} onClick={() => setHeaderMenuOpen(true)}>&#x22EE;</button>
                            {isHeaderMenuOpen && <ChatHeaderMenu items={chatHeaderMenuItems} onClose={() => setHeaderMenuOpen(false)} />}
                        </div>
                    )}
                    {activeChatMetadata?.contractAddress && <TokenInfoBar {...activeChatMetadata} />}
                    <div style={messageAreaStyle} ref={messageAreaRef} onClick={() => setMessageMenu(null)}>
                        {messages.map(msg => {
                             if (msg.isSystem) {
                                return <SystemMessage key={msg.id || msg.text} text={msg.text} isError={msg.isError} />;
                            }
                            if (msg.poll) {
                                return <PollMessage key={msg.id} message={msg} onVote={() => {}} />;
                            }
                            return (
                                <div key={msg.id} onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)}>
                                    <MessageBubble 
                                        message={msg} 
                                        onAddReaction={() => {}}
                                        onOpenMenu={handleMessageMenu}
                                        isHovered={hoveredMessageId === msg.id}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div style={inputAreaStyle}>
                        <button style={imageUploadButtonStyle} onClick={() => fileInputRef.current.click()}>🖼️</button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => setImageToSend(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null)} />
                        {isGroupChat && <button style={pollButtonStyle} onClick={() => setPollModalOpen(true)}>📊</button>}
                        <textarea style={inputStyle} placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessageHandler())} />
                        <button style={startChatButtonStyle} onClick={sendMessageHandler}>Send</button>
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <img src="https://i.imgur.com/siB8l8m.png" alt="BlockChat Logo" style={{ width: '100px', height: '100px', opacity: 0.5, marginBottom: '20px' }} />
                    <h2>Welcome to BlockChat</h2>
                    <p>Select a chat on the left to start messaging.</p>
                </div>
            )}
        </div>
    );

    return (
        <div style={chatPageStyle}>
            {chatList}
            {chatWindow}
            <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onCreateGroup={handleCreateGroup} />
            <CreatePollModal isOpen={isPollModalOpen} onClose={() => setPollModalOpen(false)} onCreatePoll={() => {}} />
            {messageMenu && <MessageContextMenu {...messageMenu} onAction={handleMessageMenuAction} onClose={() => setMessageMenu(null)} isMyMessage={messageMenu.message.sender === publicKey?.toBase58()} isGroupChat={isGroupChat} />}
            <ReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={handleReportSubmit} itemToReport={itemToReport} />
        </div>
    );
};

export default ChatPage;