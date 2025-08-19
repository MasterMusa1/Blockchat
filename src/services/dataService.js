import * as aws from './awsService';
import * as mockService from './mockService';
import { OFFICIAL_WELCOME_SENDER_WALLET, OFFICIAL_GROUP_CHAT_ID } from '../constants';

// This service acts as a bridge between the UI and the backend (AWS).
// It translates UI actions into backend calls and normalizes the data.
// For features not yet implemented in AWS, it falls back to the mock service.

const logMockWarning = (functionName) => {
    console.warn(`${functionName} is not implemented in the AWS backend. Using mock behavior.`);
};

// --- User Management ---
export const getOrCreateUser = async (walletAddress) => {
    const { user, isNew } = await aws.getOrCreateUser(walletAddress);
    
    // Post-creation/login logic
    if (user && !user.chatList?.includes(OFFICIAL_GROUP_CHAT_ID)) {
        const newChatList = [OFFICIAL_GROUP_CHAT_ID, ...(user.chatList || [])];
        await aws.updateUserProfile(walletAddress, { chatList: newChatList });
        user.chatList = newChatList;
    }
    return { user, isNew };
};

export const listAllUsers = () => aws.listUsers();

export const toggleUserVerification = (walletAddress, currentStatus) => {
    return aws.updateUserProfile(walletAddress, { isVerified: !currentStatus });
};

export const updateUserProfile = (walletAddress, data) => {
    return aws.updateUserProfile(walletAddress, data);
};
export const updateUserCredits = (walletAddress, amount) => aws.updateUserCredits(walletAddress, amount);

export const updateUserChatList = async (walletAddress, chatIdentifier) => {
    const { user } = await getOrCreateUser(walletAddress);
    if (user.chatList && !user.chatList.includes(chatIdentifier)) {
        const newChatList = [chatIdentifier, ...user.chatList];
        return aws.updateUserProfile(walletAddress, { chatList: newChatList });
    }
    return user; // Return existing user if chat is already in the list
};

export const sendWelcomeMessage = async (recipientAddress) => {
    const welcomeMessage = {
        sender: OFFICIAL_WELCOME_SENDER_WALLET,
        text: `Welcome to BlockChat! Your journey into decentralized messaging starts now. You've been given 50 free credits to get started. Enjoy!`,
    };
    const chatId = [recipientAddress, OFFICIAL_WELCOME_SENDER_WALLET].sort().join('_');
    return aws.sendMessage(chatId, welcomeMessage);
};

export const mintUserNft = async (walletAddress, nftData) => {
    const { user } = await getOrCreateUser(walletAddress);
    const settings = await getAdminSettings();
    const mintCost = settings.messagingCosts.nftMinting || 0;
    const hasLifetime = user.ownedNfts.some(nft => nft.name === 'Lifetime Messaging NFT');

    if (!hasLifetime && user.credits < mintCost) {
        throw new Error(`Not enough credits. Minting costs ${mintCost} credits.`);
    }

    const newNft = {
        id: `user-minted-${Date.now()}`,
        ...nftData,
        isUserMinted: true,
        mintDate: new Date().toISOString(),
    };
    
    const updatedNfts = [...(user.ownedNfts || []), newNft];
    const newCredits = hasLifetime ? user.credits : user.credits - mintCost;

    return aws.updateUserProfile(walletAddress, { ownedNfts: updatedNfts, credits: newCredits });
};

export const searchUsers = (searchTerm) => {
    logMockWarning('searchUsers');
    return mockService.searchUsers(searchTerm);
};

export const followUser = (followerWallet, followedWallet) => {
    return aws.followUser(followerWallet, followedWallet);
};

export const unfollowUser = (unfollowerWallet, unfollowedWallet) => {
    return aws.unfollowUser(unfollowerWallet, unfollowedWallet);
};

export const blockUser = (blockerWallet, blockedWallet) => {
    logMockWarning('blockUser');
    return mockService.blockUser(blockerWallet, blockedWallet);
};

// --- Chat ---
export const getMessages = (chatId) => aws.getMessages(chatId);
export const sendMessage = (chatId, messageData) => aws.sendMessage(chatId, messageData);
export const deleteMessage = (messageId) => aws.deleteMessage(messageId);
export const getChatMetadata = async (chatId) => {
    // This is mock data because there's no chat metadata table in the AWS schema.
    logMockWarning('getChatMetadata');
    return mockService.getChatMetadata(chatId);
};
export const createGroupChat = (creatorWallet, groupData) => {
    logMockWarning('createGroupChat');
    return mockService.createGroupChat(creatorWallet, groupData);
};
export const updateMessageReactions = (chatId, messageId, walletAddress, emoji) => {
    logMockWarning('updateMessageReactions');
    return mockService.updateMessageReactions(chatId, messageId, walletAddress, emoji);
};
export const voteOnPoll = (chatId, messageId, walletAddress, option) => {
    logMockWarning('voteOnPoll');
    return mockService.voteOnPoll(chatId, messageId, walletAddress, option);
};


// --- Marketplace ---
export const getMarketplaceNfts = () => aws.getMarketplaceNfts();
export const listNft = (nftData) => aws.listNft(nftData);
export const buyNft = (nft, buyerAddress) => aws.buyNft(nft, buyerAddress);
export const deleteMarketplaceNft = (nftId) => aws.deleteMarketplaceNft(nftId);

// --- VIP Marketplace (Mocked) ---
export const getVipMarketplaceNfts = async () => {
    logMockWarning("getVipMarketplaceNfts");
    return mockService.getVipMarketplaceNfts();
};
export const listVipNft = async (nftData) => {
    logMockWarning("listVipNft");
    return mockService.listVipNft(nftData);
};
export const buyVipNft = (nft, buyerAddress) => {
    logMockWarning("buyVipNft");
    return mockService.buyVipNft(nft, buyerAddress);
};
export const deleteVipNft = (nftId) => {
    logMockWarning("deleteVipNft");
    return mockService.deleteVipNft(nftId);
};


// --- Activity Feed ---
export const getActivityFeed = () => aws.getActivityFeed();
export const addActivityFeedItem = (item) => aws.addActivityFeedItem(item);
export const updateActivityFeedItem = (itemId, data) => aws.updateActivityFeedItem(itemId, data);

// --- Token Performance Feed ---
export const getTokenPerformanceUpdates = (walletAddress, user) => {
    if (!user?.isVip) return Promise.resolve([]);
    logMockWarning('getTokenPerformanceUpdates');
    return mockService.getTokenPerformanceUpdates(walletAddress, user);
};


// --- Admin ---
export const getAdminSettings = async () => {
    const settings = await aws.getAdminSettings();
    if (settings) return settings;
    // Return defaults if nothing is in the DB
    return {
        messagingCosts: { text: 1, media: 3, groupCreation: 100, nftMinting: 50, pollCreation: 5 },
        featureToggles: { p2pMarketplace: true, statusUpdates: true },
    };
};
export const updateAdminSettings = (data) => aws.updateAdminSettings(data);
export const getBanners = () => aws.getBanners();
export const updateBanners = (banners) => aws.updateBanners(banners);
export const resetUsername = (walletAddress) => {
    const newName = `User ${walletAddress.slice(0, 6)}`;
    return aws.updateUserProfile(walletAddress, { displayName: newName });
};

// --- Reports ---
export const addReport = (reportData) => {
    return aws.createReport(reportData);
};
export const getReports = () => {
    return aws.listReports();
};
export const resolveReport = (reportId, status) => {
    return aws.updateReport(reportId, status);
};


// --- File Storage ---
// This logic is complex and remains here, calling the simple AWS functions.
export const performFileAction = async (walletAddress, path, action) => {
    const { user } = await getOrCreateUser(walletAddress);
    let fileTree = user.files;
    let storageUsed = user.storageUsed;

    const findNode = (node, path) => {
        let current = node;
        for (const id of path) {
            if (current && current.type === 'folder' && current.children) {
                current = current.children.find(child => child.id === id);
            } else {
                return null;
            }
        }
        return current;
    };

    const findItemAndParent = (root, itemId) => {
        const queue = [{ node: root, parent: null }];
        while (queue.length > 0) {
            const { node, parent } = queue.shift();
            if (node.id === itemId) return { item: node, parent };
            if (node.type === 'folder' && node.children) {
                for (const child of node.children) {
                    queue.push({ node: child, parent: node });
                }
            }
        }
        return { item: null, parent: null };
    };

    const calculateSize = (item) => {
        if (item.type === 'file') return item.size;
        if (item.type === 'folder' && item.children) {
            return item.children.reduce((acc, child) => acc + calculateSize(child), 0);
        }
        return 0;
    };

    switch (action.type) {
        case 'UPLOAD': {
            const { name, size } = action.payload;
            const currentFolder = findNode(fileTree, path);
            if (!currentFolder || currentFolder.type !== 'folder') throw new Error("Invalid upload location.");
            const newFile = { id: `file-${Date.now()}`, name, type: 'file', size, lastModified: new Date().toLocaleDateString() };
            if (!currentFolder.children) currentFolder.children = [];
            currentFolder.children.push(newFile);
            storageUsed += size;
            break;
        }
        case 'DELETE': {
            const { id } = action.payload;
            const { item, parent } = findItemAndParent(fileTree, id);
            if (!item || !parent) throw new Error("Item not found for deletion.");
            storageUsed -= calculateSize(item);
            parent.children = parent.children.filter(child => child.id !== id);
            break;
        }
        case 'RENAME': {
            const { id, newName } = action.payload;
            const { item } = findItemAndParent(fileTree, id);
            if (!item) throw new Error("Item not found for renaming.");
            item.name = newName;
            item.lastModified = new Date().toLocaleDateString();
            break;
        }
        default:
            throw new Error(`Unknown file action: ${action.type}`);
    }

    return await aws.updateUserProfile(walletAddress, {
        files: fileTree,
        storageUsed: Math.max(0, storageUsed)
    });
};