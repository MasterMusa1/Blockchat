import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl } from 'aws-amplify/storage';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import * as subscriptions from '../graphql/subscriptions';

const client = generateClient();

// --- Constants ---
const ADMIN_SETTINGS_ID = 'admin-settings';
const BANNERS_ID = 'admin-banners';


// Helper to safely parse JSON
const safeJsonParse = (jsonString, defaultValue) => {
    if (typeof jsonString !== 'string') return jsonString;
    try { return JSON.parse(jsonString); } catch (e) { return defaultValue; }
};

// Helper to normalize a user object by parsing its JSON fields
const normalizeUser = (user) => {
    if (!user) return null;
    return {
        ...user,
        files: safeJsonParse(user.files, { id: 'root', name: 'My Drive', type: 'folder', children: [] }),
        socialLinks: safeJsonParse(user.socialLinks, { twitter: '', discord: '' }),
        ownedNfts: safeJsonParse(user.ownedNfts, []),
        chatList: safeJsonParse(user.chatList, []),
        following: safeJsonParse(user.following, []),
        followers: safeJsonParse(user.followers, []),
        blockedUsers: safeJsonParse(user.blockedUsers, []),
    };
};

const normalizeMessage = (message) => {
    if (!message) return null;
    return {
        ...message,
        reactions: safeJsonParse(message.reactions, {}),
        poll: safeJsonParse(message.poll, null),
    };
};

// --- User Management ---
export const getOrCreateUser = async (walletAddress) => {
    try {
        const { data } = await client.graphql({ query: queries.getUser, variables: { walletAddress } });
        let user = data.getUser;
        let isNew = false;
        if (user) {
            user = normalizeUser(user);
        } else {
            isNew = true;
            const newUserInput = {
                walletAddress,
                displayName: `User ${walletAddress.slice(0, 6)}`,
                bio: 'No bio yet.',
                credits: 50,
                ownedNfts: '[]',
                chatList: '[]',
                following: '[]',
                followers: '[]',
                blockedUsers: '[]',
                isVerified: false,
                socialLinks: JSON.stringify({ twitter: '', discord: '' }),
                storageCapacity: 5368709120, // 5 GB
                storageUsed: 0,
                files: JSON.stringify({ id: 'root', name: 'My Drive', type: 'folder', children: [] })
            };
            const { data: newUserData } = await client.graphql({ query: mutations.createUser, variables: { input: newUserInput } });
            user = normalizeUser(newUserData.createUser);
        }
        return { user, isNew };
    } catch (error) { console.error("Error in getOrCreateUser:", error); throw error; }
};

export const listUsers = async (filter) => {
    try {
        const { data } = await client.graphql({ query: queries.listUsers, variables: { filter } });
        return data.listUsers.items.map(normalizeUser);
    } catch (error) { console.error("Error listing users:", error); throw error; }
};

export const searchUsers = async (searchTerm) => {
    const filter = { or: [{ displayName: { contains: searchTerm } }, { walletAddress: { contains: searchTerm } }] };
    return listUsers(filter);
};

export const updateUserProfile = async (walletAddress, data) => {
    const input = { walletAddress };
    for (const key in data) {
        if (data[key] !== undefined) {
            input[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
        }
    }
    const { data: responseData } = await client.graphql({ query: mutations.updateUser, variables: { input } });
    return normalizeUser(responseData.updateUser);
};

export const updateUserCredits = async (walletAddress, amount) => {
    const { user } = await getOrCreateUser(walletAddress);
    return await updateUserProfile(walletAddress, { credits: (user.credits || 0) + amount });
};

export const followUser = async (followerWallet, followedWallet) => {
    const { user: follower } = await getOrCreateUser(followerWallet);
    const { user: followed } = await getOrCreateUser(followedWallet);
    await updateUserProfile(followerWallet, { following: [...(follower.following || []), followedWallet] });
    await updateUserProfile(followedWallet, { followers: [...(followed.followers || []), followerWallet] });
    const { user } = await getOrCreateUser(followerWallet);
    return user;
};

export const unfollowUser = async (unfollowerWallet, unfollowedWallet) => {
    const { user: unfollower } = await getOrCreateUser(unfollowerWallet);
    const { user: unfollowed } = await getOrCreateUser(unfollowedWallet);
    await updateUserProfile(unfollowerWallet, { following: (unfollower.following || []).filter(f => f !== unfollowedWallet) });
    await updateUserProfile(unfollowedWallet, { followers: (unfollowed.followers || []).filter(f => f !== unfollowerWallet) });
    const { user } = await getOrCreateUser(unfollowerWallet);
    return user;
};

export const blockUser = async (blockerWallet, blockedWallet) => {
    const { user: blocker } = await getOrCreateUser(blockerWallet);
    if (!blocker.blockedUsers.includes(blockedWallet)) {
        const newBlocked = [...blocker.blockedUsers, blockedWallet];
        return await updateUserProfile(blockerWallet, { blockedUsers: newBlocked });
    }
    return blocker;
};

export const unblockUser = async (unblockerWallet, unblockedWallet) => {
    const { user: unblocker } = await getOrCreateUser(unblockerWallet);
    const newBlocked = unblocker.blockedUsers.filter(u => u !== unblockedWallet);
    return await updateUserProfile(unblockerWallet, { blockedUsers: newBlocked });
};


// --- Chat ---
export const getMessages = async (chatId) => {
    const { data } = await client.graphql({ query: queries.messagesByChat, variables: { chatId, sortDirection: 'ASC' } });
    return data.messagesByChat.items.map(normalizeMessage);
};

export const sendMessage = (chatId, messageData) => {
    const input = { ...messageData, chatId, timestamp: new Date().toISOString() };
    if (input.poll) input.poll = JSON.stringify(input.poll);
    return client.graphql({ query: mutations.createMessage, variables: { input } });
};

export const deleteMessage = (messageId) => client.graphql({ query: mutations.deleteMessage, variables: { input: { id: messageId } } });

export const updateMessage = (id, data) => {
    const input = { id };
    if (data.reactions) input.reactions = JSON.stringify(data.reactions);
    if (data.poll) input.poll = JSON.stringify(data.poll);
    return client.graphql({ query: mutations.updateMessage, variables: { input } });
};

export const subscribeToMessages = (chatId, callback) => {
    const createSub = client.graphql({ query: subscriptions.onCreateMessageByChatId, variables: { chatId } })
        .subscribe({ next: ({ data }) => callback({ type: 'CREATE', message: normalizeMessage(data.onCreateMessage) }) });

    const updateSub = client.graphql({ query: subscriptions.onUpdateMessageByChatId, variables: { chatId } })
        .subscribe({ next: ({ data }) => callback({ type: 'UPDATE', message: normalizeMessage(data.onUpdateMessage) }) });
        
    const deleteSub = client.graphql({ query: subscriptions.onDeleteMessageByChatId, variables: { chatId } })
        .subscribe({ next: ({ data }) => callback({ type: 'DELETE', message: data.onDeleteMessage }) });

    return () => {
        createSub.unsubscribe();
        updateSub.unsubscribe();
        deleteSub.unsubscribe();
    };
};

export const getChatMetadata = async (chatId) => {
    const { data } = await client.graphql({ query: queries.getChatMetadata, variables: { id: chatId } });
    return data.getChatMetadata;
};

export const createChatMetadata = async (metadata) => {
    const { data } = await client.graphql({ query: mutations.createChatMetadata, variables: { input: metadata } });
    return data.createChatMetadata;
};

// --- Marketplace ---
export const getNfts = (marketType) => client.graphql({ query: queries.nftsByMarketType, variables: { marketType, sortDirection: 'DESC' } });
export const createNft = (nftData) => client.graphql({ query: mutations.createNft, variables: { input: { ...nftData, createdAt: new Date().toISOString()} } });
export const updateNft = (id, data) => client.graphql({ query: mutations.updateNft, variables: { input: { id, ...data } } });
export const deleteNft = (nftId) => client.graphql({ query: mutations.deleteNft, variables: { input: { id: nftId } } });


// --- Activity Feed ---
export const getActivityFeed = async () => {
    const { data } = await client.graphql({ query: queries.listActivityFeedItems, variables: { limit: 50, sortDirection: 'DESC' } });
    return data.listActivityFeedItems.items.map(item => ({
        ...item,
        user: safeJsonParse(item.user, {}),
        nft: safeJsonParse(item.nft, {}),
        commentData: safeJsonParse(item.commentData, []),
    }));
};

export const addActivityFeedItem = (item) => {
    const input = {
        ...item,
        user: JSON.stringify(item.user),
        nft: JSON.stringify(item.nft),
        commentData: JSON.stringify(item.commentData),
        timestamp: new Date().toISOString(),
    };
    return client.graphql({ query: mutations.createActivityFeedItem, variables: { input } });
};

export const updateActivityFeedItem = (itemId, data) => {
    const input = { id: itemId };
    if (data.likes) input.likes = data.likes;
    if (data.comments) input.comments = data.comments;
    if (data.commentData) input.commentData = JSON.stringify(data.commentData);
    return client.graphql({ query: mutations.updateActivityFeedItem, variables: { input } });
};


// --- Token Performance Feed ---
export const getTokenPerformanceUpdates = async () => {
    const { data } = await client.graphql({ query: queries.listTokenPerformanceUpdates });
    return data.listTokenPerformanceUpdates.items.map(item => ({
        ...item,
        user: safeJsonParse(item.user, {}),
    }));
};

// --- Admin ---
export const getAdminSettings = async () => {
    const { data } = await client.graphql({ query: queries.getAdminSettings, variables: { id: ADMIN_SETTINGS_ID } });
    if (data.getAdminSettings) {
        return {
            messagingCosts: safeJsonParse(data.getAdminSettings.messagingCosts, {}),
            featureToggles: safeJsonParse(data.getAdminSettings.featureToggles, {}),
        };
    }
    return null;
};

export const updateAdminSettings = async (settings) => {
    const input = {
        id: ADMIN_SETTINGS_ID,
        messagingCosts: JSON.stringify(settings.messagingCosts),
        featureToggles: JSON.stringify(settings.featureToggles),
    };
    const { data } = await client.graphql({ query: mutations.updateAdminSettings, variables: { input } });
    return {
        messagingCosts: safeJsonParse(data.updateAdminSettings.messagingCosts, {}),
        featureToggles: safeJsonParse(data.updateAdminSettings.featureToggles, {}),
    };
};

export const getBanners = async () => {
    const { data } = await client.graphql({ query: queries.getBanners, variables: { id: BANNERS_ID } });
    return data.getBanners ? safeJsonParse(data.getBanners.promotionalBanners, []) : [];
};

export const updateBanners = async (banners) => {
    const input = { id: BANNERS_ID, promotionalBanners: JSON.stringify(banners) };
    const { data } = await client.graphql({ query: mutations.updateBanners, variables: { input } });
    return safeJsonParse(data.updateBanners.promotionalBanners, []);
};

// --- Reports ---
export const createReport = (reportData) => client.graphql({ query: mutations.createReport, variables: { input: reportData } });
export const listReports = async () => {
    const { data } = await client.graphql({ query: queries.listReports, variables: { filter: { status: { eq: 'PENDING' } } } });
    return data.listReports.items;
};
export const updateReport = (reportId, status) => client.graphql({ query: mutations.updateReport, variables: { input: { id: reportId, status } } });


// --- Storage ---
export const uploadFile = async (filePath, file) => {
    try {
        const result = await uploadData({
            path: filePath,
            data: file,
        }).result;
        console.log('Succeeded: ', result);
        return result;
    } catch (error) {
        console.log('Error : ', error);
        throw error;
    }
};

export const getFileUrl = async (filePath) => {
    try {
        const result = await getUrl({ path: filePath });
        return result.url;
    } catch (error) {
        console.log('Error getting file URL: ', error);
        throw error;
    }
};