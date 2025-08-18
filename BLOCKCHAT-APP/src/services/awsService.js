import { generateClient } from 'aws-amplify/api';
import { uploadData } from 'aws-amplify/storage';
import {
    getUser
} from '../graphql/queries';
import {
    createUser,
    updateUser,
    createMessage,
    deleteMessage as deleteMessageMutation,
    createNft,
    deleteNft,
    createActivityFeedItem as createActivityFeedItemMutation,
    updateActivityFeedItem as updateActivityFeedItemMutation,
    updateAdminSettings as updateAdminSettingsMutation,
    updateBanners as updateBannersMutation,
    createReport as createReportMutation,
    updateReport as updateReportMutation,
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
        chatList: safeJsonParse(user.chatList, []),
        following: safeJsonParse(user.following, []),
        followers: safeJsonParse(user.followers, []),
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
                chatList: JSON.stringify([]),
                following: JSON.stringify([]),
                followers: JSON.stringify([]),
                isVerified: false,
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

export const followUser = async (followerWallet, followedWallet) => {
    const { user: follower } = await getOrCreateUser(followerWallet);
    const { user: followed } = await getOrCreateUser(followedWallet);

    const newFollowerFollowing = [...(follower.following || []), followedWallet];
    const newFollowedFollowers = [...(followed.followers || []), followerWallet];

    await updateUserProfile(followerWallet, { following: newFollowerFollowing });
    await updateUserProfile(followedWallet, { followers: newFollowedFollowers });

    const updatedFollower = await getOrCreateUser(followerWallet);
    return updatedFollower.user;
};

export const unfollowUser = async (unfollowerWallet, unfollowedWallet) => {
    const { user: unfollower } = await getOrCreateUser(unfollowerWallet);
    const { user: unfollowed } = await getOrCreateUser(unfollowedWallet);
    
    const newUnfollowerFollowing = (unfollower.following || []).filter(f => f !== unfollowedWallet);
    const newUnfollowedFollowers = (unfollowed.followers || []).filter(f => f !== unfollowedWallet);

    await updateUserProfile(unfollowerWallet, { following: newUnfollowerFollowing });
    await updateUserProfile(unfollowedWallet, { followers: newUnfollowedFollowers });
    
    const updatedUnfollower = await getOrCreateUser(unfollowerWallet);
    return updatedUnfollower.user;
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

export const deleteMessage = async (messageId) => {
    try {
        await client.graphql({
            query: deleteMessageMutation,
            variables: { input: { id: messageId } }
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
};

// --- Marketplace ---
export const getMarketplaceNfts = async () => {
    const response = await client.graphql({
        query: queries.listNfts
    });
    return response.data.listNfts.items.map(nft => ({...nft, seller: nft.seller || ''}));
};

export const listNft = async (nftData) => {
    const response = await client.graphql({
        query: createNft,
        variables: { input: nftData }
    });
    return response.data.createNft;
};

export const deleteMarketplaceNft = async (nftId) => {
    try {
        const response = await client.graphql({
            query: deleteNft,
            variables: { input: { id: nftId } }
        });
        return response.data.deleteNft;
    } catch (error) {
        console.error("Error deleting marketplace NFT:", error);
        throw error;
    }
};

// ... (file continues)