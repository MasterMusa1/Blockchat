import { generateClient } from 'aws-amplify/api';
import { uploadData } from 'aws-amplify/storage';
import {
    getUser
} from '../graphql/queries';
import {
    createUser,
    updateUser,
    createMessage,
    createNft,
    deleteNft,
    createActivityFeedItem as createActivityFeedItemMutation,
    updateActivityFeedItem as updateActivityFeedItemMutation,
    updateAdminSettings as updateAdminSettingsMutation,
    updateBanners as updateBannersMutation
} from '../graphql/mutations';
import * as queries from '../graphql/queries';

const client = generateClient();

// --- Constants ---
const ADMIN_SETTINGS_ID = 'admin-settings';
const BANNERS_ID = 'admin-banners';


// Helper to safely parse JSON
const safeJsonParse = (jsonString, defaultValue) => {
    if (typeof jsonString !== 'string') {
        return jsonString; // Already an object, return as is
    }
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return defaultValue;
    }
};

// Helper to normalize a user object by parsing its JSON fields
const normalizeUser = (user) => {
    if (!user) return null;
    return {
        ...user,
        files: safeJsonParse(user.files, { id: 'root', name: 'My Drive', type: 'folder', children: [] }),
        socialLinks: safeJsonParse(user.socialLinks, { twitter: '', discord: '' }),
        ownedNfts: safeJsonParse(user.ownedNfts, []),
    };
};

// --- User Management ---
export const getOrCreateUser = async (walletAddress) => {
    try {
        const userData = await client.graphql({
            query: getUser,
            variables: {
                walletAddress
            }
        });

        let user = userData.data.getUser;
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
                ownedNfts: JSON.stringify([]),
                chatList: [],
                isVerified: true,
                socialLinks: JSON.stringify({ twitter: '', discord: '' }),
                storageCapacity: 5368709120, // 5 GB
                storageUsed: 0,
                files: JSON.stringify({ id: 'root', name: 'My Drive', type: 'folder', children: [] })
            };
            const newUserData = await client.graphql({
                query: createUser,
                variables: {
                    input: newUserInput
                }
            });
            user = normalizeUser(newUserData.data.createUser);
        }
         return { user, isNew };
    } catch (error) {
        console.error("Error in getOrCreateUser:", error);
        throw error;
    }
};

export const listUsers = async () => {
    try {
        const response = await client.graphql({
            query: queries.listUsers
        });
        return response.data.listUsers.items.map(normalizeUser);
    } catch (error) {
        console.error("Error listing users:", error);
        throw error;
    }
};

export const updateUserProfile = async (walletAddress, data) => {
    const input = { walletAddress };
    for (const key in data) {
        if (data[key] !== undefined) {
             if (typeof data[key] === 'object' && data[key] !== null) {
                input[key] = JSON.stringify(data[key]);
            } else {
                input[key] = data[key];
            }
        }
    }

    const response = await client.graphql({
        query: updateUser,
        variables: {
            input
        }
    });

    return normalizeUser(response.data.updateUser);
};

export const updateUserCredits = async (walletAddress, amount) => {
    const { user } = await getOrCreateUser(walletAddress);
    const currentCredits = user.credits || 0;
    const newCredits = currentCredits + amount;
    
    return await updateUserProfile(walletAddress, { credits: newCredits });
};

// --- Chat ---
export const getMessages = async (chatId) => {
    const response = await client.graphql({
        query: queries.messagesByChat,
        variables: {
            chatId: chatId,
            sortDirection: 'ASC'
        }
    });
    return response.data.messagesByChat.items.map(msg => ({...msg, reactions: safeJsonParse(msg.reactions, {})}));
};

export const sendMessage = async (chatId, messageData) => {
    const input = { ...messageData,
        chatId,
        reactions: JSON.stringify(messageData.reactions || {})
    };
    const response = await client.graphql({
        query: createMessage,
        variables: {
            input
        }
    });
    const createdMessage = response.data.createMessage;
    createdMessage.reactions = safeJsonParse(createdMessage.reactions, {});
    return createdMessage;
};

// --- Marketplace ---
export const getMarketplaceNfts = async () => {
    const response = await client.graphql({
        query: queries.listNfts
    });
    return response.data.listNfts.items;
};

export const listNft = async (nftData) => {
    const response = await client.graphql({
        query: createNft,
        variables: {
            input: nftData
        }
    });
    return response.data.createNft;
};

export const buyNft = async (nft, buyerAddress) => {
    const { user } = await getOrCreateUser(buyerAddress);
    
    const newOwnedNft = {
        id: nft.id,
        name: nft.name,
        image: nft.image,
        description: nft.description,
        isUserMinted: false,
        purchaseDate: new Date().toISOString(),
        featureName: nft.featureName
    };

    const newOwnedNfts = [...(user.ownedNfts || []), newOwnedNft];
    
    await client.graphql({
        query: updateUser,
        variables: {
            input: {
                walletAddress: buyerAddress,
                ownedNfts: JSON.stringify(newOwnedNfts)
            }
        }
    });

    await client.graphql({
        query: deleteNft,
        variables: {
            input: { id: nft.id }
        }
    });
};

export const deleteMarketplaceNft = async (nftId) => {
    return client.graphql({
        query: deleteNft,
        variables: { input: { id: nftId } }
    });
};

// --- Activity Feed ---
const normalizeActivityFeedItem = (item) => {
    if (!item) return null;
    return {
        ...item,
        user: safeJsonParse(item.user, {}),
        nft: safeJsonParse(item.nft, null),
        commentData: safeJsonParse(item.commentData, []),
    };
}

export const getActivityFeed = async () => {
    const response = await client.graphql({
        query: queries.listActivityFeedItems
    });
    const items = response.data.listActivityFeedItems.items;
    return items.map(normalizeActivityFeedItem);
};

export const addActivityFeedItem = async (item) => {
    const input = {
        ...item,
        user: JSON.stringify(item.user),
        nft: item.nft ? JSON.stringify(item.nft) : null,
        commentData: JSON.stringify(item.commentData || []),
        comments: (item.commentData || []).length,
    };
    const response = await client.graphql({
        query: createActivityFeedItemMutation,
        variables: { input }
    });
    return normalizeActivityFeedItem(response.data.createActivityFeedItem);
};

export const updateActivityFeedItem = async (itemId, data) => {
    const input = { id: itemId };
    if (data.likes !== undefined) input.likes = data.likes;
    if (data.commentData !== undefined) {
        input.commentData = JSON.stringify(data.commentData);
        input.comments = data.commentData.length;
    }
    
    const response = await client.graphql({
        query: updateActivityFeedItemMutation,
        variables: { input }
    });
    return normalizeActivityFeedItem(response.data.updateActivityFeedItem);
};


// --- Admin ---
export const getAdminSettings = async () => {
    try {
        const response = await client.graphql({
            query: queries.getAdminSettings,
            variables: { id: ADMIN_SETTINGS_ID }
        });
        const settings = response.data.getAdminSettings;
        if (settings) {
            settings.messagingCosts = safeJsonParse(settings.messagingCosts, {});
            settings.featureToggles = safeJsonParse(settings.featureToggles, {});
            return settings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        return null; // Return null on error, default will be used in dataService
    }
};

export const updateAdminSettings = async (data) => {
    const input = {
        id: ADMIN_SETTINGS_ID,
        messagingCosts: JSON.stringify(data.messagingCosts),
        featureToggles: JSON.stringify(data.featureToggles)
    };
    const response = await client.graphql({
        query: updateAdminSettingsMutation,
        variables: { input }
    });
    return response.data.updateAdminSettings;
};

export const getBanners = async () => {
    try {
        const response = await client.graphql({
            query: queries.getBanners,
            variables: { id: BANNERS_ID }
        });
        const banners = response.data.getBanners;
        return safeJsonParse(banners?.promotionalBanners, []);
    } catch (e) {
        return [];
    }
};

export const updateBanners = async (banners) => {
    const input = {
        id: BANNERS_ID,
        promotionalBanners: JSON.stringify(banners)
    };
    const response = await client.graphql({
        query: updateBannersMutation,
        variables: { input }
    });
    return safeJsonParse(response.data.updateBanners.promotionalBanners, []);
};

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