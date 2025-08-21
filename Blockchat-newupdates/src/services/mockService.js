import { 
    initialMockUsers,
    initialMockMarketplaceNfts,
    initialVipMarketplaceNfts,
    initialMockActivityFeed,
    initialMockChats,
    initialMockChatMetadata,
    initialMockAdminSettings,
    initialMockBanners,
    initialMockReports,
    initialTokenPerformanceFeed
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
            tokenPerformanceFeed: JSON.parse(JSON.stringify(initialTokenPerformanceFeed)),
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
            followers: [],
            following: [],
            isVerified: false,
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
    if (!user.followers) user.followers = [];
    if (!user.following) user.following = [];

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

export const resetUsername = async (walletAddress) => {
    const store = getStore();
    const { user } = await getOrCreateUser(walletAddress);
    user.displayName = `User ${walletAddress.slice(0, 6)}`;
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

export const searchUsers = async (searchTerm) => {
    const store = getStore();
    if (!searchTerm || searchTerm.trim() === '') {
        return Promise.resolve([]);
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    const allUsers = Object.values(store.users);
    const results = allUsers.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(lowercasedTerm)) ||
        (user.walletAddress && user.walletAddress.toLowerCase().includes(lowercasedTerm))
    );
    return Promise.resolve(results);
};

export const followUser = async (followerWallet, followedWallet) => {
    const store = getStore();
    const { user: follower } = await getOrCreateUser(followerWallet);
    const { user: followed } = await getOrCreateUser(followedWallet);

    if (!follower.following.includes(followedWallet)) {
        follower.following.push(followedWallet);
    }

    if (!followed.followers.includes(followerWallet)) {
        followed.followers.push(followerWallet);
    }

    return Promise.resolve(follower);
};

export const unfollowUser = async (unfollowerWallet, unfollowedWallet) => {
    const store = getStore();
    const { user: unfollower } = await getOrCreateUser(unfollowerWallet);
    const { user: unfollowed } = await getOrCreateUser(unfollowedWallet);
    
    unfollower.following = unfollower.following.filter(f => f !== unfollowedWallet);
    unfollowed.followers = unfollowed.followers.filter(f => f !== unfollowerWallet);

    return Promise.resolve(unfollower);
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
    user.ownedNfts = user.ownedNfts.filter(nft => nft.id !== nftId);
    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

// --- Chat ---
export const getMessages = async (chatId) => {
    const store = getStore();
    if (!store.chats[chatId]) {
        store.chats[chatId] = [];
    }
    return Promise.resolve(store.chats[chatId]);
};

export const sendMessage = async (chatId, messageData) => {
    const store = getStore();
    if (!store.chats[chatId]) {
        store.chats[chatId] = [];
    }
    const newMessage = { ...messageData, id: Date.now().toString(), timestamp: { toDate: () => new Date() } };
    store.chats[chatId].push(newMessage);
    return Promise.resolve(newMessage);
};

export const sendWelcomeMessage = async (recipientAddress) => {
    const welcomeMessage = {
        sender: OFFICIAL_WELCOME_SENDER_WALLET,
        text: `Welcome to BlockChat! Your journey into decentralized messaging starts now. You've been given 50 free credits to get started. Enjoy!`,
    };
    const chatId = getDmChatId(recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET);
    return sendMessage(chatId, welcomeMessage);
};

export const deleteMessage = async (chatId, messageId) => {
    const store = getStore();
    if (store.chats[chatId]) {
        store.chats[chatId] = store.chats[chatId].filter(m => m.id !== messageId);
    }
    return Promise.resolve();
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

export const voteOnPoll = async (chatId, messageId, option, walletAddress) => {
    const store = getStore();
    const chat = store.chats[chatId];
    if (!chat) return Promise.reject("Chat not found");
    const message = chat.find(m => m.id === messageId);
    if (!message || !message.poll) return Promise.reject("Poll not found");

    // Prevent double voting
    const alreadyVoted = Object.values(message.poll.votes).some(voters => voters.includes(walletAddress));
    if (alreadyVoted) return Promise.resolve(message);

    if (!message.poll.votes[option]) {
        message.poll.votes[option] = [];
    }
    message.poll.votes[option].push(walletAddress);
    return Promise.resolve(message);
};


// --- Marketplace ---
export const getMarketplaceNfts = async () => {
    const store = getStore();
    return Promise.resolve(store.marketplaceNfts);
};

export const listNft = async (nftData) => {
    const store = getStore();
    const newListing = { ...nftData, id: `listed-${Date.now()}` };
    store.marketplaceNfts.push(newListing);
    return Promise.resolve(newListing);
};

export const buyNft = async (nft, buyerAddress) => {
    const store = getStore();
    store.marketplaceNfts = store.marketplaceNfts.filter(n => n.id !== nft.id);
    const { user } = await getOrCreateUser(buyerAddress);

    if (nft.isFeatureNft) {
        const featureNft = { id: `owned-feature-${Date.now()}`, name: nft.featureName, image: nft.image, description: nft.description };
        user.ownedNfts.push(featureNft);
    } else {
        user.ownedNfts.push({ ...nft, seller: undefined });
    }
    
    store.users[buyerAddress] = user;
    return Promise.resolve(user);
};

export const deleteMarketplaceNft = async (nftId) => {
    const store = getStore();
    store.marketplaceNfts = store.marketplaceNfts.filter(n => n.id !== nftId);
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

export const buyVipNft = async (nft, buyerAddress) => {
    const store = getStore();
    store.vipMarketplaceNfts = store.vipMarketplaceNfts.filter(n => n.id !== nft.id);
    const { user } = await getOrCreateUser(buyerAddress);
    user.ownedNfts.push({ ...nft, seller: undefined });
    store.users[buyerAddress] = user;
    return Promise.resolve(user);
};

export const deleteVipNft = async (nftId) => {
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
    const newItem = { ...item, id: `feed-${Date.now()}`, timestamp: new Date().toISOString(), likes: 0, comments: 0, commentData: [] };
    store.activityFeed.unshift(newItem);
    return Promise.resolve(newItem);
};

export const updateActivityFeedItem = async (itemId, data) => {
    const store = getStore();
    const itemIndex = store.activityFeed.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
        store.activityFeed[itemIndex] = { ...store.activityFeed[itemIndex], ...data };
    }
    return Promise.resolve(store.activityFeed[itemIndex]);
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

export const sendBroadcastMessage = async (segment, message) => {
    const store = getStore();
    const allUsers = Object.values(store.users);
    let targetUsers = [];

    // This is a mock segmentation logic
    switch(segment) {
        case 'vip':
            targetUsers = allUsers.filter(u => u.ownedNfts.some(nft => nft.name === 'VIP Access NFT'));
            break;
        case 'new':
            targetUsers = allUsers.filter(u => new Date(u.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000));
            break;
        case 'frequent':
             targetUsers = allUsers.slice(0, Math.ceil(allUsers.length / 2)); // Mock: first half of users
             break;
        case 'all':
        default:
            targetUsers = allUsers;
            break;
    }
    
    targetUsers = targetUsers.filter(u => u.walletAddress !== OFFICIAL_WELCOME_SENDER_WALLET && u.walletAddress !== ADMIN_WALLET_ADDRESS);

    for (const user of targetUsers) {
        const chatId = getDmChatId(user.walletAddress, OFFICIAL_WELCOME_SENDER_WALLET);
        await sendMessage(chatId, { sender: OFFICIAL_WELCOME_SENDER_WALLET, text: message });
    }
    return Promise.resolve(targetUsers.length);
};

// --- Group Chats & Tokens ---
export const createGroup = async (groupData) => {
    const store = getStore();
    const groupId = `group-${Date.now()}`;
    store.chatMetadata[groupId] = { ...groupData, id: groupId };
    store.chats[groupId] = [{ isSystem: true, text: `Group "${groupData.name}" was created.` }];
    return Promise.resolve(store.chatMetadata[groupId]);
};

export const getChatMetadata = async (chatId) => {
    const store = getStore();
    return Promise.resolve(store.chatMetadata[chatId]);
};

export const getTokenHolders = async (contractAddress) => {
    const store = getStore();
    if (!store.tokenHolders[contractAddress]) {
        // Mock a list of holders if it doesn't exist
        const holders = [];
        for (let i = 0; i < 50; i++) {
            holders.push({ walletAddress: `mockHolder${i}_${contractAddress.slice(0,4)}`, balance: Math.random() * 1000 });
        }
        store.tokenHolders[contractAddress] = holders.sort((a,b) => b.balance - a.balance);
    }
    return Promise.resolve(store.tokenHolders[contractAddress]);
};

export const calculateHolderRanks = async (contractAddress) => {
    const holders = await getTokenHolders(contractAddress);
    const totalHolders = holders.length;
    if (totalHolders === 0) return {};
    
    const goldTierCount = Math.ceil(totalHolders * 0.2);
    const silverTierCount = Math.ceil(totalHolders * 0.3);

    const ranks = {};
    holders.forEach((holder, index) => {
        if (index < goldTierCount) {
            ranks[holder.walletAddress] = 'gold';
        } else if (index < goldTierCount + silverTierCount) {
            ranks[holder.walletAddress] = 'silver';
        } else {
            ranks[holder.walletAddress] = 'bronze';
        }
    });
    return Promise.resolve(ranks);
};

export const getTokenPerformanceUpdates = async (walletAddress, user) => {
    const store = getStore();
    // In a real app, this would check user's token holdings and find relevant posts
    return Promise.resolve(store.tokenPerformanceFeed);
};


// --- File Storage ---
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
    
    const findNode = (root, itemPath) => {
        let current = root;
        for (const id of itemPath) {
            current = current.children.find(child => child.id === id);
        }
        return current;
    };

    const currentFolder = path.length > 0 ? findNode(user.files, path) : user.files;

    switch (action.type) {
        case 'UPLOAD': {
            const { name, size } = action.payload;
            const newFile = { id: `file-${Date.now()}`, name, type: 'file', size, lastModified: new Date().toLocaleDateString() };
            currentFolder.children.push(newFile);
            user.storageUsed += size;
            break;
        }
        case 'DELETE': {
            const parent = findParent(user.files, [...path, action.payload.id]);
            const itemToDelete = parent.children.find(c => c.id === action.payload.id);
            if (itemToDelete && itemToDelete.type === 'file') {
                 user.storageUsed -= itemToDelete.size;
            }
            parent.children = parent.children.filter(c => c.id !== action.payload.id);
            break;
        }
        case 'RENAME': {
            const itemToRename = findNode(user.files, [...path, action.payload.id]);
            if(itemToRename) itemToRename.name = action.payload.newName;
            break;
        }
        default:
            break;
    }

    store.users[walletAddress] = user;
    return Promise.resolve(user);
};

// --- Reports ---
export const getReports = async () => {
    const store = getStore();
    return Promise.resolve(store.reports);
};

export const addReport = async (reportData) => {
    const store = getStore();
    const newReport = { ...reportData, id: `report-${Date.now()}` };
    store.reports.push(newReport);
    return Promise.resolve(newReport);
};

export const resolveReport = async (reportId) => {
    const store = getStore();
    store.reports = store.reports.filter(r => r.id !== reportId);
    return Promise.resolve();
};