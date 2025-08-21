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
                    {showReactionAdder && !isMyMessage && <ReactionAdder onAddReaction={(emoji) => onAddReaction(message, emoji)} />}
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

    const hasLifetimeAccess = useMemo(() => {
        return isAdmin || ownedNfts?.some(nft => nft.name === 'Lifetime Messaging NFT');
    }, [isAdmin, ownedNfts]);

    const handleSelectChat = useCallback(async (chatId) => {
        setActiveChat(chatId);
        if (isMobile) setMobileView('chat');
        clearUnread(chatId);

        try {
            const fetchedMessages = await dataService.getMessages(chatId);
            setMessages(fetchedMessages);
            if (!isWalletAddress(chatId)) {
                const meta = await dataService.getChatMetadata(chatId);
                setActiveChatMetadata(meta);
            } else {
                setActiveChatMetadata(null);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([{ isSystem: true, text: "Could not load messages for this chat.", isError: true }]);
        }
    }, [isMobile, clearUnread]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessageWrapper = useCallback(async (messageData, cost) => {
        if (!publicKey || !activeChat) return;
        if (!hasLifetimeAccess && credits < cost) {
            setMessages(prev => [...prev, { isSystem: true, text: `Not enough credits. This action costs ${cost} credits.`, isError: true }]);
            return;
        }

        try {
            await dataService.sendMessage(activeChat, { sender: publicKey.toBase58(), ...messageData });
            if (!hasLifetimeAccess) setCredits(credits - cost);
            const newMessages = await dataService.getMessages(activeChat);
            setMessages(newMessages);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, { isSystem: true, text: "Failed to send message.", isError: true }]);
        }
    }, [publicKey, activeChat, credits, hasLifetimeAccess, setCredits, messagingCosts]);
    
    const handleSendMessage = async () => {
        if (!message.trim() && !imageToSend) return;
        
        let cost = messagingCosts.text;
        const messageData = {};
        
        if (message.trim()) messageData.text = message;
        if (imageToSend) {
            messageData.image = imageToSend;
            cost = messagingCosts.media;
        }

        await sendMessageWrapper(messageData, cost);

        setMessage('');
        setImageToSend(null);
    };

    const handleCreateGroup = async (groupData) => {
        const cost = messagingCosts.groupCreation;
        if (!hasLifetimeAccess && credits < cost) {
            alert(`You need ${cost} credits to create a group.`);
            return;
        }

        try {
            const newGroup = await dataService.createGroupChat(publicKey.toBase58(), groupData);
            if (!hasLifetimeAccess) setCredits(credits - cost);
            const updatedUser = await dataService.updateUserChatList(publicKey.toBase58(), newGroup.id);
            setUserData(updatedUser);
            setChatListTab('groups');
            handleSelectChat(newGroup.id);
        } catch (error) {
            console.error("Failed to create group:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleStartDM = async () => {
        if (!searchAddress || !isWalletAddress(searchAddress)) {
            alert("Please enter a valid Solana wallet address.");
            return;
        }
        if (searchAddress === publicKey.toBase58()) {
            alert("You cannot start a chat with yourself.");
            return;
        }
        const dmChatId = getDmChatId(publicKey.toBase58(), searchAddress);
        const updatedUser = await dataService.updateUserChatList(publicKey.toBase58(), searchAddress);
        setUserData(updatedUser);
        handleSelectChat(dmChatId);
        setSearchAddress('');
    };
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setImageToSend(loadEvent.target.result);
                handleSendMessage();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddReaction = async (message, emoji) => {
        if (!publicKey) return;
        const updatedMessages = await dataService.updateMessageReactions(activeChat, message, publicKey.toBase58(), emoji);
        setMessages(updatedMessages);
    };

    const handleCreatePoll = async (pollData) => {
        const cost = messagingCosts.pollCreation || 5;
        const pollMessage = {
            text: `Poll: ${pollData.question}`,
            poll: {
                question: pollData.question,
                options: pollData.options,
                votes: pollData.options.reduce((acc, option) => ({ ...acc, [option]: [] }), {})
            }
        };
        await sendMessageWrapper(pollMessage, cost);
    };

    const handleVote = async (message, option) => {
        if (!publicKey || !activeChat) return;
        const newMessages = await dataService.voteOnPoll(activeChat, message, publicKey.toBase58(), option);
        setMessages(newMessages);
    };

    const handleOpenMessageMenu = (e, message) => {
        e.preventDefault();
        e.stopPropagation();
        setMessageMenu({ x: e.clientX, y: e.clientY, message });
    };

    const handleMessageMenuAction = async (action, message) => {
        switch(action) {
            case 'delete':
                if (window.confirm("Are you sure you want to delete this message? This cannot be undone.")) {
                    try {
                        await dataService.deleteMessage(message.id);
                        setMessages(prev => prev.filter(m => m.id !== message.id));
                    } catch (error) {
                        console.error("Failed to delete message:", error);
                        alert("Could not delete the message.");
                    }
                }
                break;
            case 'report':
                setItemToReport({ type: 'Message', content: message.text, reportedUserWallet: message.sender });
                setReportModalOpen(true);
                break;
            case 'block':
                 if (window.confirm(`Are you sure you want to block this user? You will no longer see their messages.`)) {
                    await dataService.blockUser(publicKey.toBase58(), message.sender);
                    alert("User blocked.");
                    // Optionally, filter out messages from this user in the current view
                }
                break;
            default:
                break;
        }
    };
    
    const handleReportSubmit = async (reportData) => {
        try {
            await dataService.addReport(reportData);
            alert("Report submitted successfully.");
        } catch (error) {
            console.error("Failed to submit report:", error);
            alert("Failed to submit report.");
        }
    };

    const getChatName = (chatId) => {
        if (isWalletAddress(chatId)) {
            const otherUserAddress = chatId.split('_').find(addr => addr !== publicKey?.toBase58()) || chatId;
            return `DM with ${otherUserAddress.slice(0, 4)}...${otherUserAddress.slice(-4)}`;
        }
        return chatMetadata[chatId]?.name || chatId;
    };
    
    const getChatLogo = (chatId) => {
        if (isWalletAddress(chatId)) {
            const otherUserAddress = chatId.split('_').find(addr => addr !== publicKey?.toBase58()) || chatId;
            return `https://i.pravatar.cc/150?u=${otherUserAddress}`;
        }
        return chatMetadata[chatId]?.logo || 'https://i.imgur.com/siB8l8m.png';
    };

    const chatHeaderMenuItems = useMemo(() => {
        const items = [];
        if (activeChat) {
            if (isWalletAddress(activeChat)) {
                items.push({ label: 'View Profile', icon: '👤', onClick: () => alert("Go to profile") });
                items.push({ label: 'Clear History', icon: '🧹', onClick: () => alert("Clear history") });
                items.push({ label: 'Block User', icon: '🚫', isDestructive: true, onClick: () => alert("Block user") });
            } else {
                items.push({ label: 'View Members', icon: '👥', onClick: () => alert("View members") });
                items.push({ label: 'Notifications', icon: '🔔', onClick: () => alert("Manage notifications") });
                items.push({ label: 'Leave Group', icon: '🚪', isDestructive: true, onClick: () => alert("Leave group") });
            }
        }
        return items;
    }, [activeChat]);

    const renderChatList = () => (
        <div style={listStyle}>
            <div style={chatListTabContainerStyle}>
                <button style={chatListTabStyle(chatListTab === 'dms')} onClick={() => setChatListTab('dms')}>DMs</button>
                <button style={chatListTabStyle(chatListTab === 'groups')} onClick={() => setChatListTab('groups')}>Groups</button>
            </div>
            <div style={searchContainerStyle}>
                <input style={searchInputStyle} placeholder="Start new DM..." value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
                <button style={startChatButtonStyle} onClick={handleStartDM}>Go</button>
            </div>
            <div style={{ padding: '0 10px', flex: 1, overflowY: 'auto' }}>
                <h3 style={listHeaderStyle}>{chatListTab === 'dms' ? 'Direct Messages' : 'Groups'}</h3>
                {filteredChats.map(chatId => (
                    <div key={chatId} style={activeChat === chatId ? activeChatItem : chatItemStyle} onClick={() => handleSelectChat(chatId)}>
                        <img src={getChatLogo(chatId)} alt="chat-logo" style={chatItemLogoStyle} />
                        <span style={chatNameStyle}>{getChatName(chatId)}</span>
                        {unreadCounts[chatId] > 0 && <span style={chatItemUnreadBadgeStyle}>{unreadCounts[chatId]}</span>}
                    </div>
                ))}
                {filteredChats.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        No {chatListTab} yet.
                    </div>
                )}
            </div>
            <button style={createGroupBtnStyle} onClick={() => setGroupModalOpen(true)}>+ Create New Group</button>
        </div>
    );
    
    const renderChatWindow = () => (
        <div style={chatWindowStyle}>
            {activeChat ? (
                <>
                    {isMobile && (
                        <div style={mobileChatHeaderStyle}>
                            <button onClick={() => setMobileView('list')} style={backButtonStyle}>‹</button>
                            <img src={getChatLogo(activeChat)} alt="chat-logo" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
                            <h2 style={{...chatHeaderNameStyle, fontSize: '1.1rem'}}>{getChatName(activeChat)}</h2>
                            <button onClick={() => setHeaderMenuOpen(p => !p)} style={headerMenuButtonStyle}>&#x22EE;</button>
                            {isHeaderMenuOpen && <ChatHeaderMenu items={chatHeaderMenuItems} onClose={() => setHeaderMenuOpen(false)} />}
                        </div>
                    )}
                    {!isMobile && (
                         <div style={chatHeaderStyle}>
                             <img src={getChatLogo(activeChat)} alt="chat-logo" style={{width: '45px', height: '45px', borderRadius: '50%'}} />
                            <h2 style={chatHeaderNameStyle}>{getChatName(activeChat)}</h2>
                            <button onClick={() => setHeaderMenuOpen(p => !p)} style={headerMenuButtonStyle}>&#x22EE;</button>
                            {isHeaderMenuOpen && <ChatHeaderMenu items={chatHeaderMenuItems} onClose={() => setHeaderMenuOpen(false)} />}
                        </div>
                    )}
                    {activeChatMetadata && !activeChatMetadata.isOfficial && <TokenInfoBar contractAddress={activeChatMetadata.contractAddress} logo={activeChatMetadata.logo} name={activeChatMetadata.name} />}
                    <div style={messageAreaStyle} ref={messageAreaRef}>
                        {messages.map(msg => {
                            if (msg.isSystem) return <SystemMessage key={msg.id || Math.random()} text={msg.text} isError={msg.isError} />;
                            if (msg.poll) return <PollMessage key={msg.id} message={msg} onVote={handleVote} />;
                            return (
                                <div key={msg.id} onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)}>
                                     <MessageBubble message={msg} onAddReaction={handleAddReaction} onOpenMenu={handleOpenMessageMenu} isHovered={hoveredMessageId === msg.id} />
                                </div>
                            );
                        })}
                    </div>
                    <div style={inputAreaStyle}>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                        <button style={imageUploadButtonStyle} onClick={() => fileInputRef.current.click()} title="Send Image">🖼️</button>
                        <button style={pollButtonStyle} onClick={() => setPollModalOpen(true)} title="Create Poll">📊</button>
                        <textarea
                            style={inputStyle}
                            placeholder="Type your message..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        />
                    </div>
                </>
            ) : (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    Select a chat to start messaging
                </div>
            )}
        </div>
    );

    return (
        <>
            <div style={chatPageStyle}>
                {isMobile ? (
                    mobileView === 'list' ? renderChatList() : renderChatWindow()
                ) : (
                    <>
                        {renderChatList()}
                        {renderChatWindow()}
                    </>
                )}
            </div>
            <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onCreateGroup={handleCreateGroup} />
            <CreatePollModal isOpen={isPollModalOpen} onClose={() => setPollModalOpen(false)} onCreatePoll={handleCreatePoll} />
            {messageMenu && (
                <MessageContextMenu
                    x={messageMenu.x}
                    y={messageMenu.y}
                    message={messageMenu.message}
                    onClose={() => setMessageMenu(null)}
                    onAction={handleMessageMenuAction}
                    isMyMessage={messageMenu.message.sender === publicKey?.toBase58()}
                    isGroupChat={!isWalletAddress(activeChat)}
                />
            )}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                itemToReport={itemToReport}
            />
        </>
    );
};

export default ChatPage;