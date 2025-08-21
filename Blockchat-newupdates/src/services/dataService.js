import * as aws from './awsService';
import { OFFICIAL_WELCOME_SENDER_WALLET, OFFICIAL_GROUP_CHAT_ID } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// This service acts as a bridge between the UI and the backend (AWS).
// It translates UI actions into backend calls and normalizes the data.

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
export const toggleUserVerification = (walletAddress, currentStatus) => aws.updateUserProfile(walletAddress, { isVerified: !currentStatus });
export const updateUserProfile = (walletAddress, data) => aws.updateUserProfile(walletAddress, data);
export const updateUserCredits = (walletAddress, amount) => aws.updateUserCredits(walletAddress, amount);
export const searchUsers = (searchTerm) => aws.searchUsers(searchTerm);
export const followUser = (followerWallet, followedWallet) => aws.followUser(followerWallet, followedWallet);
export const unfollowUser = (unfollowerWallet, unfollowedWallet) => aws.unfollowUser(unfollowerWallet, unfollowedWallet);
export const blockUser = (blockerWallet, blockedWallet) => aws.blockUser(blockerWallet, blockedWallet);
export const unblockUser = (unblockerWallet, unblockedWallet) => aws.unblockUser(unblockerWallet, unblockedWallet);
export const resetUsername = (walletAddress) => aws.updateUserProfile(walletAddress, { displayName: `User ${walletAddress.slice(0, 6)}` });


export const updateUserChatList = async (walletAddress, chatIdentifier) => {
    const { user } = await getOrCreateUser(walletAddress);
    if (user.chatList && !user.chatList.includes(chatIdentifier)) {
        const newChatList = [chatIdentifier, ...user.chatList];
        return aws.updateUserProfile(walletAddress, { chatList: newChatList });
    }
    return user;
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
    const hasLifetime = (user.ownedNfts || []).some(nft => nft.name === 'Lifetime Messaging NFT');

    if (!hasLifetime && user.credits < mintCost) {
        throw new Error(`Not enough credits. Minting costs ${mintCost} credits.`);
    }

    const newNft = {
        id: `user-minted-${uuidv4()}`,
        ...nftData,
        isUserMinted: true,
        isListed: false,
        mintDate: new Date().toISOString(),
    };
    
    const updatedNfts = [...(user.ownedNfts || []), newNft];
    const newCredits = hasLifetime ? user.credits : user.credits - mintCost;

    return aws.updateUserProfile(walletAddress, { ownedNfts: updatedNfts, credits: newCredits });
};


// --- Chat ---
export const getMessages = (chatId) => aws.getMessages(chatId);
export const sendMessage = (chatId, messageData) => aws.sendMessage(chatId, messageData);
export const deleteMessage = (messageId) => aws.deleteMessage(messageId);
export const subscribeToMessages = (chatId, callback) => aws.subscribeToMessages(chatId, callback);

export const getChatMetadata = async (chatId) => {
    // There is a race condition where metadata might not exist yet.
    try {
        const meta = await aws.getChatMetadata(chatId);
        if (meta) return meta;
    } catch (e) { /* Not found is expected */ }

    if (chatId === OFFICIAL_GROUP_CHAT_ID) {
        return { name: OFFICIAL_GROUP_CHAT_ID, logo: 'https://i.imgur.com/siB8l8m.png', isOfficial: true };
    }
    return null;
};

export const createGroupChat = async (creatorWallet, groupData) => {
    const chatId = uuidv4();
    const metadata = {
        id: chatId,
        creator: creatorWallet,
        ...groupData,
        isOfficial: false
    };
    await aws.createChatMetadata(metadata);
    await updateUserChatList(creatorWallet, chatId);
    return { ...metadata, chatId };
};

export const updateMessageReactions = async (message, emoji) => {
    const reactions = { ...(message.reactions || {}) };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    await aws.updateMessage(message.id, { reactions });
};

export const voteOnPoll = async (message, walletAddress, option) => {
    const poll = { ...message.poll };
    if (Object.values(poll.votes).some(voters => voters.includes(walletAddress))) {
        return; // Already voted
    }
    poll.votes[option] = [...(poll.votes[option] || []), walletAddress];
    await aws.updateMessage(message.id, { poll });
};


// --- Marketplace ---
export const getMarketplaceNfts = async () => (await aws.getNfts('standard')).data.nftsByMarketType.items;
export const getVipMarketplaceNfts = async () => (await aws.getNfts('vip')).data.nftsByMarketType.items;

export const listNft = (nftData, marketType) => {
    const input = {
        ...nftData,
        id: `nft-${uuidv4()}`,
        marketType,
        isListed: true,
    };
    delete input.mintDate; // this field is not in the NFT model
    return aws.createNft(input);
};

export const buyFeatureNft = async (nft, buyerWallet) => {
    const { user: buyer } = await getOrCreateUser(buyerWallet);
    const updatedNfts = [...(buyer.ownedNfts || []), { id: nft.id, name: nft.name, image: nft.image, description: nft.description }];
    await aws.updateUserProfile(buyerWallet, { ownedNfts: updatedNfts });

    if (nft.quantity > 1) {
        await aws.updateNft(nft.id, { quantity: nft.quantity - 1 });
    } else {
        await aws.deleteNft(nft.id);
    }
};

export const buyP2PNft = async (nft, buyerWallet) => {
    const { user: buyer } = await getOrCreateUser(buyerWallet);
    const { user: seller } = await getOrCreateUser(nft.seller);

    // Remove from seller, add to buyer
    const newSellerNfts = (seller.ownedNfts || []).filter(n => n.id !== nft.id);
    const newBuyerNfts = [...(buyer.ownedNfts || []), { ...nft, isListed: false }];

    await aws.updateUserProfile(seller.walletAddress, { ownedNfts: newSellerNfts });
    await aws.updateUserProfile(buyer.walletAddress, { ownedNfts: newBuyerNfts });

    // Remove from marketplace
    await aws.deleteNft(nft.id);
};


// --- Activity Feed ---
export const getActivityFeed = () => aws.getActivityFeed();
export const addActivityFeedItem = (item) => aws.addActivityFeedItem(item);
export const updateActivityFeedItem = (itemId, data) => aws.updateActivityFeedItem(itemId, data);

// --- Token Performance Feed ---
export const getTokenPerformanceUpdates = () => aws.getTokenPerformanceUpdates();


// --- Admin ---
export const getAdminSettings = async () => {
    const settings = await aws.getAdminSettings();
    return settings || {
        messagingCosts: { text: 1, media: 3, groupCreation: 100, nftMinting: 50, pollCreation: 5 },
        featureToggles: { p2pMarketplace: true, statusUpdates: true },
    };
};
export const updateAdminSettings = (data) => aws.updateAdminSettings(data);
export const getBanners = () => aws.getBanners();
export const updateBanners = (banners) => aws.updateBanners(banners);

// --- Reports ---
export const addReport = (reportData) => {
    const input = { ...reportData, status: 'PENDING', content: reportData.content || reportData.text || `Item ID: ${reportData.id}` };
    delete input.id;
    return aws.createReport(input);
};
export const getReports = () => aws.listReports();
export const resolveReport = (reportId, status) => aws.updateReport(reportId, status);


// --- File Storage ---
export const performFileAction = async (walletAddress, path, action) => {
    const { user } = await getOrCreateUser(walletAddress);
    let fileTree = user.files;
    let storageUsed = user.storageUsed;

    const findParentNode = (node, path) => {
        let parent = node;
        for (const id of path.slice(0, -1)) {
            parent = parent.children.find(child => child.id === id);
        }
        return parent;
    };
    
    const currentFolder = path.reduce((acc, curr) => acc.children.find(f => f.id === curr), fileTree);

    switch (action.type) {
        case 'UPLOAD': {
            const { name, size, file } = action.payload;
            const fileId = `file-${uuidv4()}`;
            const filePath = `public/${walletAddress}/${fileId}-${name}`;
            await aws.uploadFile(filePath, file);

            const newFile = {
                id: fileId, name, type: 'file', size,
                lastModified: new Date().toLocaleDateString(),
                path: filePath,
            };
            currentFolder.children.push(newFile);
            storageUsed += size;
            break;
        }
        case 'DELETE': {
            const itemToDelete = currentFolder.children.find(c => c.id === action.payload.id);
            if (itemToDelete?.type === 'file') storageUsed -= itemToDelete.size;
            currentFolder.children = currentFolder.children.filter(c => c.id !== action.payload.id);
            break;
        }
        case 'RENAME': {
            const itemToRename = currentFolder.children.find(c => c.id === action.payload.id);
            if (itemToRename) itemToRename.name = action.payload.newName;
            break;
        }
        default: break;
    }

    return await aws.updateUserProfile(walletAddress, { files: fileTree, storageUsed });
};