import * as aws from './awsService';
import * as mockService from './mockService';
import { ADMIN_WALLET_ADDRESS, OFFICIAL_WELCOME_SENDER_WALLET, OFFICIAL_GROUP_CHAT_ID } from '../constants';
import { initialMockChatMetadata } from './mockData'; // Keep for non-DB metadata

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
    // Using mock service for unique username check as an example
    logMockWarning('updateUserProfile (using mock for username validation)');
    return mockService.updateUserProfile(walletAddress, data);
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

// --- Chat ---
export const getMessages = (chatId) => aws.getMessages(chatId);
export const sendMessage = (chatId, messageData) => aws.sendMessage(chatId, messageData);
export const getChatMetadata = async (chatId) => {
    // This is mock data because there's no chat metadata table in the AWS schema.
    logMockWarning('getChatMetadata');
    return mockService.getChatMetadata(chatId);
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
    logMockWarning('resetUsername');
    return mockService.resetUsername(walletAddress);
};

// --- File Storage ---
// This logic is complex and remains here, calling the simple AWS functions.
export const performFileAction = async (walletAddress, path, action) => {
    const { user } = await getOrCreateUser(walletAddress);
    let fileTree = user.files;
    let storageUsed = user.storageUsed;

    const findParent = (root, itemPath) => {
        let current = root;
        for (const id of itemPath.slice(0, -1)) {
            current = current.children.find(child => child.id === id);
        }
        return current;
    };

    switch (action.type) {
        case 'UPLOAD': {
            const { name, size, file } = action.payload;
            const filePath = `${walletAddress}/${Date.now()}-${name}`;
            await aws.uploadFile(filePath, file);

            const newFile = {
                id: filePath,
                name,
                type: 'file',
                size,
                lastModified: new Date().toLocaleDateString(),
            };
            const parent = path.length > 0 ? findParent(fileTree, [...path, filePath]) : fileTree;
            parent.children.push(newFile);
            storageUsed += size;
            break;
        }
        // Other cases like DELETE, RENAME would be implemented here
        default:
            logMockWarning(`File action ${action.type}`);
            // Let mock service handle it
            return mockService.performFileAction(walletAddress, path, action);
    }

    await aws.updateUserProfile(walletAddress, { files: fileTree, storageUsed: storageUsed });
    return getOrCreateUser(walletAddress).then(res => res.user);
};

// --- Token Holder Ranks (Mocked) ---
export const getTokenHolders = (contractAddress) => {
    logMockWarning(`getTokenHolders`);
    return mockService.getTokenHolders(contractAddress);
};
export const calculateHolderRanks = (holders) => {
    logMockWarning(`calculateHolderRanks`);
    return mockService.calculateHolderRanks(holders);
};


// --- Functions not implemented in AWS backend ---
export const searchUsers = (searchTerm) => {
    logMockWarning('searchUsers');
    return mockService.searchUsers(searchTerm);
};
export const followUser = (followerWallet, followedWallet) => {
    logMockWarning('followUser');
    return mockService.followUser(followerWallet, followedWallet);
};
export const unfollowUser = (unfollowerWallet, unfollowedWallet) => {
    logMockWarning('unfollowUser');
    return mockService.unfollowUser(unfollowerWallet, unfollowedWallet);
};
export const createGroup = (creator, groupData) => {
    logMockWarning('createGroup');
    return mockService.createGroup(creator, groupData);
};
export const blockUser = (blocker, blocked) => {
    logMockWarning('blockUser');
    return mockService.blockUser(blocker, blocked);
};
export const unblockUser = (unblocker, unblocked) => {
    logMockWarning('unblockUser');
    return mockService.unblockUser(unblocker, unblocked);
};
export const addReport = (reportData) => {
    logMockWarning('addReport');
    return mockService.addReport(reportData);
};
export const getReports = () => {
    logMockWarning('getReports');
    return mockService.getReports();
};
export const resolveReport = (reportId) => {
    logMockWarning('resolveReport');
    return mockService.resolveReport(reportId);
};