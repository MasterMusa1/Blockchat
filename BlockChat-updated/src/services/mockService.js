import { 
    initialMockUsers,
    initialMockMarketplaceNfts,
    initialVipMarketplaceNfts,
    initialMockActivityFeed,
    initialMockChats,
    initialMockChatMetadata,
    initialMockAdminSettings,
    initialMockBanners,
    initialMockReports
} from './mockData';
import { ADMIN_WALLET_ADDRESS, OFFICIAL_WELCOME_SENDER_WALLET, OFFICIAL_GROUP_CHAT_ID } from '../constants';

// This function initializes a persistent data store on the window object
// to prevent data loss during development with hot-reloading.
const getStore = () => {
    if (!window.mockDataStore) {
        console.log("Initializing persistent mock data store...");
        window.mockDataStore = {
            users: JSON.parse(JSON.stringify(initialMockUsers)),
            marketplaceNfts: JSON.parse(JSON.stringify(initialMockMarketplaceNfts)),
            vipMarketplaceNfts: JSON.parse(JSON.stringify(initialVipMarketplaceNfts)),
            activityFeed: JSON.parse(JSON.stringify(initialMockActivityFeed)),
            chats: JSON.parse(JSON.stringify(initialMockChats)),
            chatMetadata: JSON.parse(JSON.stringify(initialMockChatMetadata)),
            adminSettings: JSON.parse(JSON.stringify(initialMockAdminSettings)),
            banners: JSON.parse(JSON.stringify(initialMockBanners)),
            reports: JSON.parse(JSON.stringify(initialMockReports)),
            tokenHolders: {},
        };
    }
    return window.mockDataStore;
}

const getDmChatId = (address1, address2) => {
    if (!address1 || !address2) return null;
    return [address1, address2].sort().join('_');
};

// --- User Management ---
export const getOrCreateUser = async (walletAddress) => {
    const store = getStore();
    let isNew = false;
    if (!store.users[walletAddress]) {
        isNew = true;
        const newUser = {
            walletAddress,
            displayName: `User ${walletAddress.slice(0, 6)}`,
            bio: 'No bio yet.',
            credits: 50, // Start with some credits
            ownedNfts: [],
            socialLinks: { twitter: '', discord: '' },
            chatList: [], // Start with empty list
            blockedUsers: [],
            createdAt: new Date().toISOString(),
            storageCapacity: 5368709120, // 5 GB
            storageUsed: 0,
            files: {
                id: 'root',
                name: 'My Drive',
                type: 'folder',
                children: []
            }
        };
        store.users[walletAddress] = newUser;
    }
    
    const user = store.users[walletAddress];

    // Ensure default chats exist for all users (new and existing)
    if (!user.chatList) user.chatList = [];
    if (!user.blockedUsers) user.blockedUsers = [];

    // Add official group chat if not present
    if (!user.chatList.includes(OFFICIAL_GROUP_CHAT_ID)) {
        user.chatList.unshift(OFFICIAL_GROUP_CHAT_ID);
    }

    return Promise.resolve({ user, isNew });
};

export const updateUserProfile = async (walletAddress, data) => {
    const store = getStore();
    if (store.users[walletAddress]) {
        store.users[walletAddress] = { ...store.users[walletAddress], ...data };
    }
    return Promise.resolve(store.users[walletAddress]);
};

export const updateUserCredits = async (walletAddress, amount) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    user.credits += amount;
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

export const updateUserChatList = async (walletAddress, chatIdentifier) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    if (!user.chatList.includes(chatIdentifier)) {
        user.chatList.unshift(chatIdentifier);
    }
    return Promise.resolve(user);
};

export const blockUser = async (blockerWallet, blockedWallet) => {
    const store = getStore();
    const { user } = await getOrCreateUser(blockerWallet);
    if (!user.blockedUsers.includes(blockedWallet)) {
        user.blockedUsers.push(blockedWallet);
    }
    store.users[blockerWallet] = user;
    return Promise.resolve(user);
};

export const unblockUser = async (unblockerWallet, unblockedWallet) => {
    const store = getStore();
    const { user } = await getOrCreateUser(unblockerWallet);
    user.blockedUsers = user.blockedUsers.filter(u => u !== unblockedWallet);
    return Promise.resolve(user);
};

export const mintUserNft = async (walletAddress, nftData) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    const settings = await getAdminSettings();
    const mintCost = settings.messagingCosts.nftMinting || 0;
    const hasLifetime = user.ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');

    if (!hasLifetime && user.credits < mintCost) {
        throw new Error(`Not enough credits. Minting costs ${mintCost} credits.`);
    }

    if (!hasLifetime) {
        user.credits -= mintCost;
    }

    const newNft = {
        id: `user-minted-${Date.now()}`,
        ...nftData,
        isUserMinted: true,
        mintDate: new Date().toISOString(),
    };
    if (!user.ownedNfts) {
        user.ownedNfts = [];
    }
    user.ownedNfts.push(newNft);
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

export const deleteUserNft = async (walletAddress, nftId) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    
    const nftToDelete = user.ownedNfts.find(nft => nft.id === nftId);
    if (!nftToDelete) {
        throw new Error("NFT not found in user's gallery.");
    }
    if (!nftToDelete.isUserMinted) {
        throw new Error("Cannot delete feature NFTs or NFTs purchased from the marketplace.");
    }

    user.ownedNfts = user.ownedNfts.filter(nft => nft.id !== nftId);
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};


// --- Chat ---
export const getMessages = async (chatId) => {
    const store = getStore();
    return Promise.resolve(store.chats[chatId] || []);
};

export const sendMessage = async (chatId, messageData, recipientAddress) => {
    const store = getStore();
    const senderAddress = messageData.sender;
    const { user: sender } = await getOrCreateUser(senderAddress);
    const hasLifetime = sender.ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');

    if (store.users[recipientAddress]) { // It's a DM
        const { user: receiver } = await getOrCreateUser(recipientAddress);
        if(receiver.blockedUsers?.includes(senderAddress)) {
            return Promise.reject(new Error('This user has blocked you.'));
        }
        if (!sender.chatList.includes(recipientAddress)) {
            sender.chatList.unshift(recipientAddress);
        }
        if (!receiver.chatList.includes(senderAddress)) {
            receiver.chatList.unshift(senderAddress);
        }
    }

    // Handle credit deduction for polls
    if (messageData.poll) {
        const settings = await getAdminSettings();
        const pollCost = settings.messagingCosts.pollCreation || 0;
        
        if (!hasLifetime && sender.credits < pollCost) {
            throw new Error(`Not enough credits to create a poll. Cost: ${pollCost}`);
        }
        if (!hasLifetime) {
            sender.credits -= pollCost;
        }
    } else { // Handle credit deduction for regular messages
        const settings = await getAdminSettings();
        const cost = messageData.image ? settings.messagingCosts.media : settings.messagingCosts.text;
        
        if (!hasLifetime && sender.credits < cost) {
            throw new Error('Not enough credits to send a message.');
        }
        if (!hasLifetime) {
            sender.credits -= cost;
        }
    }

    const newMessage = {
        id: Date.now().toString(),
        ...messageData,
        timestamp: { toDate: () => new Date() }
    };
    if (!store.chats[chatId]) {
        store.chats[chatId] = [];
    }
    store.chats[chatId].push(newMessage);
    return Promise.resolve(newMessage);
};

export const sendWelcomeMessage = async (recipientAddress) => {
    const store = getStore();
    const chatId = getDmChatId(recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET);
    const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        sender: OFFICIAL_WELCOME_SENDER_WALLET,
        text: `Welcome to BlockChat! Your journey into decentralized messaging starts now. You've been given 50 free credits to get started. Enjoy!`,
        timestamp: { toDate: () => new Date() },
    };
    if (!store.chats[chatId]) store.chats[chatId] = [];
    store.chats[chatId].push(welcomeMessage);
    
    // Add chat to user lists
    await updateUserChatList(recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET);
    await updateUserChatList(OFFICIAL_WELCOME_SENDER_WALLET, recipientAddress);

    return Promise.resolve(welcomeMessage);
};

export const createGroup = async (creatorWallet, groupData) => {
    const store = getStore();
    const { user: creator } = await getOrCreateUser(creatorWallet);
    const settings = await getAdminSettings();
    const cost = settings.messagingCosts.groupCreation || 0;
    const hasLifetime = creator.ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');

    if (!hasLifetime && creator.credits < cost) {
        throw new Error(`Not enough credits to create a group. Cost: ${cost}`);
    }
    if (!hasLifetime) {
        creator.credits -= cost;
    }

    const newGroup = {
        ...groupData,
        creator: creatorWallet,
        id: `group-${Date.now()}`
    };

    store.chatMetadata[newGroup.id] = newGroup;
    store.chats[newGroup.id] = [{
        id: 'system-1',
        isSystem: true,
        text: `${creator.displayName} created the group "${newGroup.name}".`,
        timestamp: { toDate: () => new Date() }
    }];
    
    await updateUserChatList(creatorWallet, newGroup.id);
    return Promise.resolve(newGroup);
};

export const getChatMetadata = async (chatId) => {
    const store = getStore();
    return Promise.resolve(store.chatMetadata[chatId]);
};

export const updateMessageReactions = async (chatId, messageId, newReactions) => {
    const store = getStore();
    const chat = store.chats[chatId];
    if (chat) {
        const message = chat.find(m => m.id === messageId);
        if (message) {
            message.reactions = newReactions;
        }
    }
    return Promise.resolve();
};

export const deleteMessage = async (chatId, messageId) => {
    const store = getStore();
    if (store.chats[chatId]) {
        store.chats[chatId] = store.chats[chatId].filter(m => m.id !== messageId);
    }
    return Promise.resolve();
};

export const voteOnPoll = async (chatId, messageId, poll, newVotes) => {
    const store = getStore();
    const chat = store.chats[chatId];
    if (chat) {
        const message = chat.find(m => m.id === messageId);
        if (message && message.poll) {
            message.poll.votes = newVotes;
        }
    }
    return Promise.resolve();
};

// --- Marketplace ---
export const getMarketplaceNfts = async () => {
    const store = getStore();
    return Promise.resolve(store.marketplaceNfts);
};

export const listNft = async (nftData) => {
    const store = getStore();
    const newListing = { ...nftData, id: `user-listed-${Date.now()}` };
    store.marketplaceNfts.push(newListing);
    // Mark the user's owned NFT as listed
    const { user } = await getOrCreateUser(nftData.seller);
    const ownedNft = user.ownedNfts.find(n => n.id === nftData.id);
    if (ownedNft) {
        ownedNft.isListed = true;
    }
    return Promise.resolve(newListing);
};

export const buyNft = async (nft, buyerAddress) => {
    const store = getStore();
    // Remove from marketplace
    store.marketplaceNfts = store.marketplaceNfts.filter(n => n.id !== nft.id);
    
    // Add to buyer's collection
    const { user: buyer } = await getOrCreateUser(buyerAddress);
    const newOwnedNft = { ...nft, id: `bought-${Date.now()}`, isUserMinted: false };
    delete newOwnedNft.price;
    delete newOwnedNft.seller;
    buyer.ownedNfts.push(newOwnedNft);

    if (nft.seller !== ADMIN_WALLET_ADDRESS) {
        // Remove from seller's collection
        const { user: seller } = await getOrCreateUser(nft.seller);
        seller.ownedNfts = seller.ownedNfts.filter(n => n.id !== nft.id);
    } else {
        // Decrement quantity for BlockChat NFTs
        const blockchatNft = store.marketplaceNfts.find(n => n.name === nft.name && n.isFeatureNft);
        if (blockchatNft) {
            blockchatNft.quantity -= 1;
        }
    }
    
    return Promise.resolve(buyer);
};

export const deleteMarketplaceNft = async (nftId) => {
    const store = getStore();
    const nft = store.marketplaceNfts.find(n => n.id === nftId);
    if(nft && nft.seller === ADMIN_WALLET_ADDRESS) {
        store.marketplaceNfts = store.marketplaceNfts.filter(n => n.id !== nftId);
    }
    return Promise.resolve();
};

// --- VIP Marketplace ---
export const getVipMarketplaceNfts = async () => {
    const store = getStore();
    return Promise.resolve(store.vipMarketplaceNfts);
};
export const listVipNft = async (nftData) => {
    const store = getStore();
    const newListing = { ...nftData, id: `vip-listed-${Date.now()}` };
    store.vipMarketplaceNfts.push(newListing);
    return Promise.resolve(newListing);
};
export const buyVipNft = (nft, buyerAddress) => {
    // Similar logic to buyNft, but for the VIP market.
    // This is simplified for the mock service.
    const store = getStore();
    store.vipMarketplaceNfts = store.vipMarketplaceNfts.filter(n => n.id !== nft.id);
    const { user: buyer } = getOrCreateUser(buyerAddress);
    buyer.ownedNfts.push({ ...nft, id: `vip-bought-${Date.now()}` });
    return Promise.resolve(buyer);
};
export const deleteVipNft = (nftId) => {
    const store = getStore();
    store.vipMarketplaceNfts = store.vipMarketplaceNfts.filter(n => n.id !== nftId);
    return Promise.resolve();
};

// --- Activity Feed ---
export const getActivityFeed = async () => {
    const store = getStore();
    return Promise.resolve(store.activityFeed);
};

export const addActivityFeedItem = async (item) => {
    const store = getStore();
    const newItem = { ...item, id: `feed-${Date.now()}`, timestamp: new Date().toISOString() };
    store.activityFeed.unshift(newItem);
    return Promise.resolve(newItem);
};

export const updateActivityFeedItem = async (itemId, data) => {
    const store = getStore();
    const item = store.activityFeed.find(i => i.id === itemId);
    if (item) {
        Object.assign(item, data);
    }
    return Promise.resolve(item);
};

// --- Token Performance ---
export const getTokenPerformanceUpdates = async (walletAddress, user) => {
    const store = getStore();
    if (!store.tokenPerformanceFeed) {
        store.tokenPerformanceFeed = [
            {
                id: `token-perf-mock-1-${new Date().toISOString().slice(0,10)}`,
                type: 'token_performance_update',
                user: { name: 'Your Wallet', avatar: `https://i.pravatar.cc/150?u=${walletAddress}` },
                token: {
                    mint: 'So11111111111111111111111111111111111111112',
                    name: 'Wrapped SOL',
                    symbol: 'SOL',
                    logo: 'https://coin-images.coingecko.com/coins/images/21629/large/solana.jpg?1696520989',
                    balance: 10.5,
                    change24h: 3.45,
                },
                likes: 5,
                comments: 1,
                commentData: [{ user: { name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' }, content: 'Nice pump!', timestamp: new Date().toISOString() }],
                timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: `token-perf-mock-2-${new Date().toISOString().slice(0,10)}`,
                type: 'token_performance_update',
                user: { name: 'Your Wallet', avatar: `https://i.pravatar.cc/150?u=${walletAddress}` },
                token: {
                    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                    name: 'USD Coin',
                    symbol: 'USDC',
                    logo: 'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
                    balance: 520.11,
                    change24h: -0.01,
                },
                likes: 1,
                comments: 0,
                commentData: [],
                timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            {
                id: `token-perf-mock-3-${new Date().toISOString().slice(0,10)}`,
                type: 'token_performance_update',
                user: { name: 'Your Wallet', avatar: `https://i.pravatar.cc/150?u=${walletAddress}` },
                token: {
                    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
                    name: 'BONK',
                    symbol: 'BONK',
                    logo: 'https://img.fotofolio.xyz/?url=https%3A%2F%2Farweave.net%2FhQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
                    balance: 15000000,
                    change24h: -8.92,
                },
                likes: 2,
                comments: 2,
                commentData: [
                    { user: { name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' }, content: 'Oof, rough day for BONK', timestamp: new Date().toISOString() }, 
                    { user: { name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' }, content: 'HODL!', timestamp: new Date().toISOString() }
                ],
                timestamp: new Date(Date.now() - 10800000).toISOString(),
            }
        ];
    }
    // Make sure user object is correct for ActivityItem
    return Promise.resolve(store.tokenPerformanceFeed.map(item => ({
        ...item,
        user: {
            ...item.user,
            isVip: user?.ownedNfts?.some(nft => nft.name === 'VIP Access NFT'),
            isVerified: user?.isVerified,
            isAdmin: walletAddress === ADMIN_WALLET_ADDRESS
        }
    })));
};


// --- Admin ---
export const getAdminSettings = async () => {
    const store = getStore();
    return Promise.resolve(store.adminSettings);
};

export const updateAdminSettings = async (data) => {
    const store = getStore();
    store.adminSettings = { ...store.adminSettings, ...data };
    return Promise.resolve(store.adminSettings);
};

export const getBanners = async () => {
    const store = getStore();
    return Promise.resolve(store.banners);
};

export const updateBanners = async (banners) => {
    const store = getStore();
    store.banners = banners;
    return Promise.resolve(store.banners);
};

export const addReport = async (reportData) => {
    const store = getStore();
    const newReport = { ...reportData, id: `report-${Date.now()}` };
    store.reports.push(newReport);
    return Promise.resolve(newReport);
};

export const getReports = async () => {
    const store = getStore();
    return Promise.resolve(store.reports);
};

export const resolveReport = async (reportId) => {
    const store = getStore();
    store.reports = store.reports.filter(r => r.id !== reportId);
    return Promise.resolve();
};

export const sendBroadcastMessage = async (segment, message) => {
    const store = getStore();
    const allUsers = Object.values(store.users);
    let targetUsers = [];
    
    switch(segment) {
        case 'all':
            targetUsers = allUsers;
            break;
        case 'vip':
            targetUsers = allUsers.filter(u => u.ownedNfts.some(n => n.name === 'VIP Access NFT'));
            break;
        // Other segments would be implemented here
        default:
            targetUsers = allUsers;
    }

    const broadcastChatId = (userAddress) => getDmChatId(userAddress, OFFICIAL_WELCOME_SENDER_WALLET);

    targetUsers.forEach(user => {
        if (user.walletAddress === OFFICIAL_WELCOME_SENDER_WALLET || user.walletAddress === ADMIN_WALLET_ADDRESS) return;
        
        const chatId = broadcastChatId(user.walletAddress);
        if (!store.chats[chatId]) {
            store.chats[chatId] = [];
        }
        store.chats[chatId].push({
            id: `broadcast-${Date.now()}-${user.walletAddress}`,
            sender: OFFICIAL_WELCOME_SENDER_WALLET,
            text: message,
            timestamp: { toDate: () => new Date() }
        });
        updateUserChatList(user.walletAddress, OFFICIAL_WELCOME_SENDER_WALLET);
    });

    return Promise.resolve(targetUsers.length);
};

// --- Storage ---
export const performFileAction = async (walletAddress, path, action) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    let fileTree = user.files;
    
    const findParent = (root, itemPath) => {
        let current = root;
        for (const id of itemPath.slice(0, -1)) {
            current = current.children.find(child => child.id === id);
        }
        return current;
    };
    
    const parentFolder = path.length > 0 ? findParent(fileTree, [...path, action.payload.id || 'new']) : fileTree;

    switch (action.type) {
        case 'UPLOAD': {
            const { name, size } = action.payload;
            const newFile = {
                id: `file-${Date.now()}`,
                name,
                type: 'file',
                size,
                lastModified: new Date().toLocaleDateString(),
            };
            parentFolder.children.push(newFile);
            user.storageUsed += size;
            break;
        }
        case 'DELETE': {
            const itemToDelete = parentFolder.children.find(c => c.id === action.payload.id);
            if (itemToDelete && itemToDelete.type === 'file') {
                user.storageUsed -= itemToDelete.size;
            }
            parentFolder.children = parentFolder.children.filter(c => c.id !== action.payload.id);
            break;
        }
        case 'RENAME': {
            const itemToRename = parentFolder.children.find(c => c.id === action.payload.id);
            if (itemToRename) {
                itemToRename.name = action.payload.newName;
            }
            break;
        }
        default:
            break;
    }
    
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

// --- Token Holders (Mocked) ---
export const getTokenHolders = async (contractAddress) => {
    const store = getStore();
    if (!store.tokenHolders[contractAddress]) {
        // Generate mock holders
        const mockHolders = [];
        for (let i = 0; i < 100; i++) {
            mockHolders.push({
                address: `mockwallet${i}...`,
                amount: Math.random() * 10000,
            });
        }
        store.tokenHolders[contractAddress] = mockHolders.sort((a,b) => b.amount - a.amount);
    }
    return Promise.resolve(store.tokenHolders[contractAddress]);
};

export const calculateHolderRanks = (holders) => {
    const totalHolders = holders.length;
    const goldLimit = Math.floor(totalHolders * 0.2);
    const silverLimit = goldLimit + Math.floor(totalHolders * 0.3);

    const ranks = {};
    holders.forEach((holder, index) => {
        if (index < goldLimit) {
            ranks[holder.address] = 'gold';
        } else if (index < silverLimit) {
            ranks[holder.address] = 'silver';
        } else {
            ranks[holder.address] = 'bronze';
        }
    });
    return ranks;
};