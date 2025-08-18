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

    useEffect(() => {
        if (activeChat) {
            dataService.getMessages(activeChat)
                .then(setMessages)
                .catch(err => console.error("Error fetching messages:", err));
        } else {
            setMessages([]);
        }
    }, [activeChat]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectChat = (chatId) => {
        setActiveChat(chatId);
        setActiveChatMetadata(chatMetadata[chatId] || null);
        clearUnread(chatId);
        if (isMobile) {
            setMobileView('chat');
        }
    };

    const handleStartChat = async () => {
        if (!isWalletAddress(searchAddress) || searchAddress === publicKey?.toBase58()) {
            alert('Please enter a valid Solana wallet address, other than your own.');
            return;
        }
        const chatId = getDmChatId(publicKey.toBase58(), searchAddress);
        if (!chats.includes(chatId)) {
            const updatedUser = await dataService.updateUserChatList(publicKey.toBase58(), chatId);
            setUserData(updatedUser);
        }
        handleSelectChat(chatId);
        setSearchAddress('');
    };
    
    const handleSendMessage = async () => {
        if (!message.trim() && !imageToSend) return;
        const hasLifetimeAccess = ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
        const cost = (imageToSend ? messagingCosts.media : messagingCosts.text) || 1;

        if (!hasLifetimeAccess && credits < cost) {
            alert(`Not enough credits. This message costs ${cost} credits.`);
            return;
        }

        const newMessage = {
            sender: publicKey.toBase58(),
            text: message,
            image: imageToSend,
            reactions: {},
        };

        try {
            await dataService.sendMessage(activeChat, newMessage);
            setMessages(prev => [...prev, {...newMessage, id: Date.now().toString()}]); // Optimistic update
            setMessage('');
            setImageToSend(null);
            if (!hasLifetimeAccess) {
                setCredits(credits - cost);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message.');
        }
    };

    const handleCreateGroup = async (groupData) => {
        const cost = messagingCosts.groupCreation || 100;
        const hasLifetimeAccess = ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
        
        if (!hasLifetimeAccess && credits < cost) {
            alert(`Not enough credits. Creating a group costs ${cost} credits.`);
            return;
        }

        // In a real app, this would create a group on the backend.
        // Here we just add it to the local state.
        const newGroupId = groupData.name; // Use name as ID for simplicity
        const updatedUser = await dataService.updateUserChatList(publicKey.toBase58(), newGroupId);
        setUserData(updatedUser);
        setChatMetadata(prev => ({...prev, [newGroupId]: groupData}));
        
        if (!hasLifetimeAccess) {
            setCredits(credits - cost);
        }
        
        handleSelectChat(newGroupId);
    };

    const handleCreatePoll = async (pollData) => {
        const cost = messagingCosts.pollCreation || 5;
        const hasLifetimeAccess = ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');
        if (!hasLifetimeAccess && credits < cost) {
            alert(`Not enough credits. Creating a poll costs ${cost} credits.`);
            return;
        }
        
        const newMessage = {
            sender: publicKey.toBase58(),
            text: '',
            poll: {
                ...pollData,
                votes: pollData.options.reduce((acc, option) => ({ ...acc, [option]: [] }), {})
            }
        };

        try {
            await dataService.sendMessage(activeChat, newMessage);
            setMessages(prev => [...prev, {...newMessage, id: Date.now().toString()}]);
            if (!hasLifetimeAccess) setCredits(credits - cost);
        } catch (error) {
            console.error("Failed to create poll:", error);
            alert("Failed to create poll.");
        }
        setPollModalOpen(false);
    };

    const handleVote = (messageId, option) => {
        // Mock implementation
        const newMessages = messages.map(msg => {
            if (msg.id === messageId) {
                const newVotes = { ...msg.poll.votes };
                newVotes[option] = [...(newVotes[option] || []), publicKey.toBase58()];
                return { ...msg, poll: { ...msg.poll, votes: newVotes } };
            }
            return msg;
        });
        setMessages(newMessages);
    };

    const handleAddReaction = (messageId, emoji) => {
        // Mock implementation
        const newMessages = messages.map(msg => {
            if (msg.id === messageId) {
                const newReactions = { ...msg.reactions };
                newReactions[emoji] = (newReactions[emoji] || 0) + 1;
                return { ...msg, reactions: newReactions };
            }
            return msg;
        });
        setMessages(newMessages);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToSend(reader.result);
                handleSendMessage(); // This is simplified, real use might show a preview first
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleOpenMessageMenu = (event, message) => {
        event.preventDefault();
        setMessageMenu({ x: event.clientX, y: event.clientY, message });
    };

    const handleMessageMenuAction = async (action, message) => {
        setMessageMenu(null);
        switch(action) {
            case 'delete':
                if (window.confirm("Are you sure you want to delete this message?")) {
                    try {
                        await dataService.deleteMessage(message.id);
                        setMessages(prev => prev.filter(m => m.id !== message.id));
                    } catch (error) {
                        alert("Failed to delete message.");
                    }
                }
                break;
            case 'report':
                setItemToReport({ type: 'Message', content: message.text, context: `From chat: ${activeChat}`, reportedUser: message.sender });
                setReportModalOpen(true);
                break;
            case 'block':
                // Implement block logic
                alert(`Block user ${message.sender} - Not implemented`);
                break;
            default:
                break;
        }
    };
    
    const handleSubmitReport = async (reportData) => {
        // In a real app, send this to a moderation queue
        console.log("Submitting report:", reportData);
        alert("Report submitted. Thank you.");
        setReportModalOpen(false);
    };
    
    const renderChatItem = (chatId) => {
        const isDM = isWalletAddress(chatId);
        let name, logo;
        if (isDM) {
            const otherUserAddress = chatId.split('_').find(addr => addr !== publicKey?.toBase58());
            name = otherUserAddress ? `${otherUserAddress.slice(0, 4)}...${otherUserAddress.slice(-4)}` : 'DM';
            logo = `https://i.pravatar.cc/150?u=${otherUserAddress}`;
        } else {
            name = chatMetadata[chatId]?.name || chatId;
            logo = chatMetadata[chatId]?.logo || `https://i.pravatar.cc/150?u=${chatId}`;
        }
        const unreadCount = unreadCounts[chatId] || 0;

        return (
            <div key={chatId} style={activeChat === chatId ? activeChatItem : chatItemStyle} onClick={() => handleSelectChat(chatId)}>
                <img src={logo} alt="chat logo" style={chatItemLogoStyle} onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/siB8l8m.png'; }} />
                <span style={chatNameStyle}>{name}</span>
                {unreadCount > 0 && <span style={chatItemUnreadBadgeStyle}>{unreadCount}</span>}
            </div>
        );
    };
    
    const ChatList = () => (
        <div style={listStyle}>
            <div style={{ padding: '10px' }}>
                <div style={searchContainerStyle}>
                    <input style={searchInputStyle} placeholder="Find or start a conversation" value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
                    <button style={startChatButtonStyle} onClick={handleStartChat}>Go</button>
                </div>
            </div>
            <div style={chatListTabContainerStyle}>
                <button style={chatListTabStyle(chatListTab === 'dms')} onClick={() => setChatListTab('dms')}>DMs</button>
                <button style={chatListTabStyle(chatListTab === 'groups')} onClick={() => setChatListTab('groups')}>Groups</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                <h3 style={listHeaderStyle}>{chatListTab === 'dms' ? 'Direct Messages' : 'Groups'}</h3>
                {filteredChats.length > 0 ? filteredChats.map(renderChatItem) : <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px'}}>No {chatListTab} yet.</p>}
            </div>
            <button style={createGroupBtnStyle} onClick={() => setGroupModalOpen(true)}>+ Create Token-Gated Group</button>
        </div>
    );

    const ChatWindow = () => {
        if (!activeChat) {
            return (
                <div style={{ ...chatWindowStyle, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    Select a chat to start messaging
                </div>
            );
        }
        
        const isGroup = !isWalletAddress(activeChat);
        const otherUserAddress = isGroup ? null : activeChat.split('_').find(addr => addr !== publicKey?.toBase58());
        const chatName = isGroup ? (activeChatMetadata?.name || activeChat) : `DM with ${otherUserAddress?.slice(0, 6)}...`;
        const chatLogo = isGroup ? (activeChatMetadata?.logo || `https://i.pravatar.cc/150?u=${activeChat}`) : `https://i.pravatar.cc/150?u=${otherUserAddress}`;

        const menuItems = [
            { label: 'View Profile/Info', icon: 'ℹ️', onClick: () => alert('View info clicked') },
            ...(isGroup ? [{label: 'Leave Group', icon: '🚪', onClick: () => alert('Leave group clicked'), isDestructive: true }] : []),
        ];

        return (
            <div style={chatWindowStyle}>
                <div style={chatHeaderStyle}>
                    {isMobile && <button style={backButtonStyle} onClick={() => setMobileView('list')}>←</button>}
                    <img src={chatLogo} alt="chat logo" style={chatItemLogoStyle} onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/siB8l8m.png'; }} />
                    <h2 style={chatHeaderNameStyle}>{chatName}</h2>
                    <button style={headerMenuButtonStyle} onClick={() => setHeaderMenuOpen(p => !p)}>&#x22EE;</button>
                    {isHeaderMenuOpen && <ChatHeaderMenu items={menuItems} onClose={() => setHeaderMenuOpen(false)} />}
                </div>

                {activeChatMetadata?.contractAddress && <TokenInfoBar {...activeChatMetadata} />}
                
                <div style={messageAreaStyle} ref={messageAreaRef}>
                    {messages.map((msg, index) => {
                        if (msg.isSystem) return <SystemMessage key={msg.id || index} text={msg.text} />;
                        if (msg.poll) return <PollMessage key={msg.id || index} message={msg} onVote={handleVote} />;
                        return (
                            <div key={msg.id || index} onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)}>
                                <MessageBubble message={msg} onAddReaction={handleAddReaction} onOpenMenu={handleOpenMessageMenu} isHovered={hoveredMessageId === msg.id} />
                            </div>
                        );
                    })}
                </div>
                
                <div style={inputAreaStyle}>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                    <button style={imageUploadButtonStyle} onClick={() => fileInputRef.current.click()} title="Send Image">🖼️</button>
                    <button style={pollButtonStyle} onClick={() => setPollModalOpen(true)} title="Create Poll">📊</button>
                    <textarea style={inputStyle} placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} />
                    <button style={{...startChatButtonStyle, padding: '12px 20px'}} onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        );
    };

    return (
        <div style={chatPageStyle}>
            <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onCreateGroup={handleCreateGroup} />
            <CreatePollModal isOpen={isPollModalOpen} onClose={() => setPollModalOpen(false)} onCreatePoll={handleCreatePoll} />
            <ReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={handleSubmitReport} itemToReport={itemToReport} />
            {messageMenu && <MessageContextMenu {...messageMenu} onClose={() => setMessageMenu(null)} onAction={handleMessageMenuAction} isMyMessage={messageMenu.message.sender === publicKey?.toBase58()} isGroupChat={!isWalletAddress(activeChat)} />}
            
            {isMobile ? (
                mobileView === 'list' ? <ChatList /> : <ChatWindow />
            ) : (
                <>
                    <ChatList />
                    <ChatWindow />
                </>
            )}
        </div>
    );
};

export default ChatPage;