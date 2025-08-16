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
    if (typeof jsonString !== 'string') return jsonString; // Already parsed
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return defaultValue;
    }
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
            user.files = safeJsonParse(user.files, { id: 'root', name: 'My Drive', type: 'folder', children: [] });
            user.socialLinks = safeJsonParse(user.socialLinks, { twitter: '', discord: '' });
        } else {
            isNew = true;
            // User does not exist, create a new one
            const newUserInput = {
                walletAddress,
                displayName: `User ${walletAddress.slice(0, 6)}`,
                bio: 'No bio yet.',
                credits: 100, // Start with 100 credits
                ownedNfts: [],
                chatList: [],
                socialLinks: JSON.stringify({
                    twitter: '',
                    discord: ''
                }),
                storageCapacity: 5368709120, // 5 GB
                storageUsed: 0,
                files: JSON.stringify({
                    id: 'root',
                    name: 'My Drive',
                    type: 'folder',
                    children: []
                })
            };
            const newUserData = await client.graphql({
                query: createUser,
                variables: {
                    input: newUserInput
                }
            });
            user = newUserData.data.createUser;
            user.files = safeJsonParse(user.files, {});
            user.socialLinks = safeJsonParse(user.socialLinks, {});
        }
         return { user, isNew };
    } catch (error) {
        console.error("Error in getOrCreateUser:", error);
        throw error;
    }
};

export const updateUserProfile = async (walletAddress, data) => {
    // Only include non-undefined values in the input
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

    const updatedUser = response.data.updateUser;
    updatedUser.files = safeJsonParse(updatedUser.files, {});
    updatedUser.socialLinks = safeJsonParse(updatedUser.socialLinks, {});
    return updatedUser;
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
    const newOwnedNfts = [...(user.ownedNfts || []), nft.featureName || nft.name];
    
    await client.graphql({
        query: updateUser,
        variables: {
            input: {
                walletAddress: buyerAddress,
                ownedNfts: newOwnedNfts
            }
        }
    });

    await client.graphql({
        query: deleteNft,
        variables: {
            input: {
                id: nft.id
            }
        }
    });
    
    const updatedNfts = await getMarketplaceNfts();
    const updatedUser = await getOrCreateUser(buyerAddress);
    return { updatedNfts, updatedUser: updatedUser.user };
};

export const deleteMarketplaceNft = async (nftId) => {
     await client.graphql({
        query: deleteNft,
        variables: { input: { id: nftId } }
    });
    return await getMarketplaceNfts();
};

// --- Activity Feed ---
export const getActivityFeed = async () => {
    const response = await client.graphql({
        query: queries.listActivityFeedItems
    });
    return response.data.listActivityFeedItems.items.map(item => ({
        ...item,
        user: safeJsonParse(item.user, {}),
        nft: safeJsonParse(item.nft, {})
    }));
};

export const addActivityFeedItem = async(item) => {
    const input = {
        ...item,
        user: JSON.stringify(item.user),
        nft: item.nft ? JSON.stringify(item.nft) : null,
    };
    const response = await client.graphql({
        query: createActivityFeedItemMutation,
        variables: { input }
    });
    const newItem = response.data.createActivityFeedItem;
    return {
        ...newItem,
        user: safeJsonParse(newItem.user, {}),
        nft: safeJsonParse(newItem.nft, {})
    };
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
    } catch (e) {
        // This might fail if settings don't exist yet, return null
        return null;
    }
};

export const updateAdminSettings = async (data) => {
    const input = {
        id: ADMIN_SETTINGS_ID,
        messagingCosts: JSON.stringify(data.messagingCosts),
        featureToggles: JSON.stringify(data.featureToggles),
    };
    const response = await client.graphql({
        query: updateAdminSettingsMutation,
        variables: { input }
    });
    const settings = response.data.updateAdminSettings;
    settings.messagingCosts = safeJsonParse(settings.messagingCosts, {});
    settings.featureToggles = safeJsonParse(settings.featureToggles, {});
    return settings;
};

export const getBanners = async () => {
    try {
        const response = await client.graphql({
            query: queries.getBanners,
            variables: { id: BANNERS_ID }
        });
        const bannersData = response.data.getBanners;
        if (bannersData) {
            return safeJsonParse(bannersData.promotionalBanners, []);
        }
        return [];
    } catch (e) {
        return [];
    }
};

export const updateBanners = async (banners) => {
    const input = {
        id: BANNERS_ID,
        promotionalBanners: JSON.stringify(banners),
    };
    const response = await client.graphql({
        query: updateBannersMutation,
        variables: { input }
    });
    return safeJsonParse(response.data.updateBanners.promotionalBanners, []);
};

// --- Storage ---
export const uploadFile = async (path, file) => {
    try {
        const result = await uploadData({
            path,
            data: file,
        }).result;
        console.log('Succeeded: ', result);
        return result;
    } catch (error) {
        console.error('Error uploading file to S3 : ', error);
        throw error;
    }
};