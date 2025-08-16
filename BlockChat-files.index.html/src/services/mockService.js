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
            credits: 100, // Start with some credits
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
            throw new Error(`Not enough credits. Poll creation costs ${pollCost} credits.`);
        }
        if (!hasLifetime) {
            sender.credits -= pollCost;
        }
    } else { // Handle credit deduction for regular/media messages
        const settings = await getAdminSettings();
        const cost = messageData.image ? settings.messagingCosts.media : settings.messagingCosts.text;

        if (!hasLifetime && sender.credits < cost) {
            throw new Error(`Not enough credits. This message costs ${cost} credits.`);
        }
        if (!hasLifetime) {
            sender.credits -= cost;
        }
    }
    
    const newMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        ...messageData,
        timestamp: { toDate: () => new Date() },
    };

    if (!store.chats[chatId]) {
        store.chats[chatId] = [];
    }
    store.chats[chatId].push(newMessage);
    
    return Promise.resolve(sender);
};

export const sendWelcomeMessage = async (recipientAddress) => {
    const welcomeMessage = {
        id: `msg-welcome-${Date.now()}`,
        sender: OFFICIAL_WELCOME_SENDER_WALLET,
        text: `Welcome to BlockChat! Your journey into decentralized messaging starts now. You've been given 100 free credits to get started. Enjoy!`,
        timestamp: { toDate: () => new Date() },
    };
    const chatId = getDmChatId(recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET);
    if (!store.chats[chatId]) {
        store.chats[chatId] = [];
    }
    store.chats[chatId].push(welcomeMessage);
    
    // Add chat to user's list
    await updateUserChatList(recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET);
};


// --- Marketplace ---
export const getMarketplaceNfts = async () => Promise.resolve(getStore().marketplaceNfts);
export const getVipMarketplaceNfts = async () => Promise.resolve(getStore().vipMarketplaceNfts);

export const listNft = async (nftData) => {
    const store = getStore();
    const newListing = { ...nftData, id: `user-listed-${Date.now()}` };
    store.marketplaceNfts.push(newListing);
    return Promise.resolve(newListing);
};

export const listVipNft = async (nftData) => {
    const store = getStore();
    const newListing = { ...nftData, id: `vip-listed-${Date.now()}` };
    store.vipMarketplaceNfts.push(newListing);
    return Promise.resolve(newListing);
};

export const buyNft = async (nft, buyerAddress) => {
    const store = getStore();
    
    // Remove from marketplace
    store.marketplaceNfts = store.marketplaceNfts.filter(item => item.id !== nft.id);
    
    // Add to buyer's collection
    const { user: buyer } = await getOrCreateUser(buyerAddress);
    if (!buyer.ownedNfts.some(owned => owned.name === nft.name)) {
        buyer.ownedNfts.push({
            id: `owned-${nft.id}`,
            name: nft.name,
            image: nft.image,
            description: nft.description,
        });
    }
    
    return Promise.resolve({
        updatedNfts: store.marketplaceNfts,
        updatedUser: buyer,
    });
};

export const buyVipNft = async (nft, buyerAddress) => {
    const store = getStore();
    store.vipMarketplaceNfts = store.vipMarketplaceNfts.filter(item => item.id !== nft.id);
    const { user: buyer } = await getOrCreateUser(buyerAddress);
     if (!buyer.ownedNfts.some(owned => owned.name === nft.name)) {
        buyer.ownedNfts.push({
            id: `owned-vip-${nft.id}`,
            name: nft.name,
            image: nft.image,
            description: nft.description,
        });
    }
    return Promise.resolve({
        updatedNfts: store.vipMarketplaceNfts,
        updatedUser: buyer,
    });
};

export const deleteMarketplaceNft = async (nftId) => {
    const store = getStore();
    store.marketplaceNfts = store.marketplaceNfts.filter(nft => nft.id !== nftId);
    return Promise.resolve(store.marketplaceNfts);
};

// --- Activity Feed ---
export const getActivityFeed = async () => Promise.resolve(getStore().activityFeed);

export const addActivityFeedItem = async (item) => {
    const store = getStore();
    const newItem = {
        ...item,
        id: `feed-${Date.now()}`,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        commentData: [],
    };
    store.activityFeed.unshift(newItem);
    return Promise.resolve(newItem);
};

export const updateActivityFeedItem = async (itemId, updates) => {
    const store = getStore();
    const itemIndex = store.activityFeed.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        store.activityFeed[itemIndex] = { ...store.activityFeed[itemIndex], ...updates };
        return Promise.resolve(store.activityFeed[itemIndex]);
    }
    return Promise.reject(new Error("Item not found"));
};

export const addCommentToFeedItem = async (itemId, comment) => {
    const store = getStore();
    const itemIndex = store.activityFeed.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = store.activityFeed[itemIndex];
        if (!item.commentData) item.commentData = [];
        item.commentData.push(comment);
        item.comments = item.commentData.length;
        return Promise.resolve(item);
    }
    return Promise.reject(new Error("Item not found"));
};


// --- Admin ---
export const getAdminSettings = async () => Promise.resolve(getStore().adminSettings);

export const updateAdminSettings = async (data) => {
    const store = getStore();
    store.adminSettings = { ...store.adminSettings, ...data };
    return Promise.resolve(store.adminSettings);
};

export const getBanners = async () => Promise.resolve(getStore().banners);

export const updateBanners = async (banners) => {
    getStore().banners = banners;
    return Promise.resolve(banners);
};

export const sendBroadcastMessage = async (segment, message) => {
    const store = getStore();
    let targetUsers = [];
    switch(segment) {
        case 'all':
            targetUsers = Object.keys(store.users);
            break;
        case 'vip':
            targetUsers = Object.values(store.users)
                .filter(u => u.ownedNfts.some(n => n.name === 'VIP Access NFT'))
                .map(u => u.walletAddress);
            break;
        default: // Mock for other segments
             targetUsers = Object.keys(store.users).slice(0, 2);
    }

    const broadcastMessage = {
        sender: OFFICIAL_WELCOME_SENDER_WALLET,
        text: message,
    };
    
    targetUsers.forEach(userId => {
        if (userId !== OFFICIAL_WELCOME_SENDER_WALLET) {
            const chatId = getDmChatId(userId, OFFICIAL_WELCOME_SENDER_WALLET);
            sendMessage(chatId, broadcastMessage, userId);
        }
    });

    return Promise.resolve(targetUsers.length);
};

// --- Reports & Moderation ---
export const getReports = async () => {
    return Promise.resolve(getStore().reports);
};

export const addReport = async (reportData) => {
    const store = getStore();
    const newReport = { ...reportData, id: `report-${Date.now()}` };
    store.reports.unshift(newReport);
    return Promise.resolve(newReport);
};

export const resolveReport = async (reportId) => {
    const store = getStore();
    store.reports = store.reports.filter(r => r.id !== reportId);
    return Promise.resolve(true);
};


// --- Chat Groups ---
export const getChatMetadata = async (chatId) => {
    return Promise.resolve(getStore().chatMetadata[chatId]);
};

export const createGroup = async (groupData, creatorAddress) => {
    const store = getStore();
    const { user } = await getOrCreateUser(creatorAddress);
    const settings = await getAdminSettings();
    const cost = settings.messagingCosts.groupCreation;
    const hasLifetime = user.ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');

    if (!hasLifetime && user.credits < cost) {
        throw new Error(`Not enough credits. Group creation costs ${cost} credits.`);
    }

    if (!hasLifetime) {
        user.credits -= cost;
    }

    const newChatId = `${groupData.name}-${Date.now()}`;
    store.chatMetadata[newChatId] = {
        ...groupData,
        creator: creatorAddress,
        id: newChatId,
    };
    store.chats[newChatId] = [
        { id: `sys-${Date.now()}`, isSystem: true, text: `Group created by ${creatorAddress.slice(0,6)}...` }
    ];

    await updateUserChatList(creatorAddress, newChatId);
    return Promise.resolve({ user, newChatId });
};

// --- File Storage (Mock) ---
export const performFileAction = async (walletAddress, path, action) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);

    const findParent = (root, itemPath) => {
        let current = root;
        for (const id of itemPath.slice(0, -1)) {
            current = current.children.find(child => child.id === id);
        }
        return current;
    };
    
    const findNodeAndParent = (root, itemPath) => {
        const parent = findParent(root, itemPath);
        const node = parent.children.find(child => child.id === itemPath[itemPath.length - 1]);
        return { node, parent };
    };

    let parentFolder;
    if (path.length > 0) {
        let current = user.files;
        for (const id of path) {
            current = current.children.find(f => f.id === id);
        }
        parentFolder = current;
    } else {
        parentFolder = user.files;
    }

    switch(action.type) {
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
            const { id } = action.payload;
            const { node, parent } = findNodeAndParent(user.files, [...path, id]);
            if (node) {
                parent.children = parent.children.filter(child => child.id !== id);
                if (node.type === 'file') {
                    user.storageUsed -= node.size;
                }
            }
            break;
        }
        case 'RENAME': {
            const { id, newName } = action.payload;
            const { node } = findNodeAndParent(user.files, [...path, id]);
            if (node) {
                node.name = newName;
            }
            break;
        }
        default:
            console.warn(`Unknown action: ${action.type}`);
    }

    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

// --- Token Holder Ranks (Mock) ---
export const getTokenHolders = async (contractAddress) => {
    const store = getStore();
    if (!store.tokenHolders[contractAddress]) {
        // Generate mock holders if they don't exist for this token
        const mockHolders = [];
        for (let i = 0; i < 100; i++) {
            mockHolders.push({
                address: `mockWallet${i}_${contractAddress.slice(0, 5)}`,
                amount: Math.floor(Math.random() * 100000) + 100,
            });
        }
        store.tokenHolders[contractAddress] = mockHolders;
    }
    return Promise.resolve(store.tokenHolders[contractAddress]);
};

export const calculateHolderRanks = (holders) => {
    if (!holders || holders.length === 0) return {};

    const sortedHolders = [...holders].sort((a, b) => b.amount - a.amount);
    const totalHolders = sortedHolders.length;
    const ranks = {};

    sortedHolders.forEach((holder, index) => {
        const percentile = (index + 1) / totalHolders;
        if (percentile <= 0.2) {
            ranks[holder.address] = 'gold';
        } else if (percentile <= 0.5) { // 20% + 30% = 50%
            ranks[holder.address] = 'silver';
        } else {
            ranks[holder.address] = 'bronze';
        }
    });

    return ranks;
};