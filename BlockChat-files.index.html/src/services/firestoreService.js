import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, collectionGroup } from 'firebase/firestore';
import { ADMIN_WALLET_ADDRESS } from '../constants';

/*
Data Structure:
- users/{walletAddress} -> { displayName, bio, credits, ownedNfts, files, storageUsed, storageCapacity, ... }
- chats/{chatId}/messages/{messageId} -> { sender, text, timestamp, ... }
- marketplace/{nftId} -> { name, price, seller, ... }
- activity_feed/{itemId} -> { type, user, content, ... }
- admin/settings -> { messagingCosts, featureToggles, ... }
- admin/banners -> { promotionalBanners }
*/

// --- User Management ---
export const getOrCreateUser = async (walletAddress) => {
    const userRef = doc(db, 'users', walletAddress);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    } else {
        const newUser = {
            walletAddress,
            displayName: `User ${walletAddress.slice(0, 6)}`,
            bio: 'No bio yet.',
            credits: 0,
            ownedNfts: [],
            socialLinks: { twitter: '', discord: '' },
            createdAt: serverTimestamp(),
            storageCapacity: 5368709120, // 5 GB
            storageUsed: 0,
            files: {
                id: 'root',
                name: 'My Drive',
                type: 'folder',
                children: []
            }
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
};

export const updateUserProfile = async (walletAddress, data) => {
    const userRef = doc(db, 'users', walletAddress);
    await updateDoc(userRef, data);
};

export const updateUserCredits = async (walletAddress, amount) => {
    const userRef = doc(db, 'users', walletAddress);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const currentCredits = userSnap.data().credits || 0;
        await updateDoc(userRef, { credits: currentCredits + amount });
    }
};

export const updateUserFileSystem = async (walletAddress, files, storageUsed) => {
    const userRef = doc(db, 'users', walletAddress);
    await updateDoc(userRef, {
        files,
        storageUsed
    });
};


// --- Chat ---
export const getMessages = (chatId, callback, onError) => {
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    }, onError);
};

export const sendMessage = async (chatId, messageData) => {
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCollection, {
        ...messageData,
        timestamp: serverTimestamp(),
    });
};

// --- Marketplace ---
export const getMarketplaceNfts = (callback, onError) => {
    const nftsCollection = collection(db, 'marketplace');
    const q = query(nftsCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const nfts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(nfts);
    }, onError);
};

export const listNft = async (nftData) => {
    await addDoc(collection(db, 'marketplace'), {
        ...nftData,
        createdAt: serverTimestamp(),
    });
};

export const buyNft = async (nft, buyerAddress) => {
    const batch = writeBatch(db);

    const nftRef = doc(db, 'marketplace', nft.id);
    batch.delete(nftRef);

    const buyerRef = doc(db, 'users', buyerAddress);
    const buyerSnap = await getDoc(buyerRef);
    const buyerData = buyerSnap.data();
    const newOwnedNfts = [...(buyerData.ownedNfts || []), nft.featureName || nft.name];
    batch.update(buyerRef, { ownedNfts: newOwnedNfts });

    await batch.commit();
};


// --- Activity Feed ---
export const getActivityFeed = (callback, onError) => {
    const feedCollection = collection(db, 'activity_feed');
    const q = query(feedCollection, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    }, onError);
};

export const addActivityFeedItem = async (item) => {
    await addDoc(collection(db, 'activity_feed'), {
        ...item,
        timestamp: serverTimestamp(),
    });
};

// --- Admin ---
export const getAdminSettings = async () => {
    const settingsRef = doc(db, 'admin', 'settings');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
        return settingsSnap.data();
    }
    return null;
};

export const updateAdminSettings = async (data) => {
    const settingsRef = doc(db, 'admin', 'settings');
    await setDoc(settingsRef, data, { merge: true });
};

export const getBanners = async () => {
    const bannersRef = doc(db, 'admin', 'banners');
    const bannersSnap = await getDoc(bannersRef);
    if (bannersSnap.exists()) {
        return bannersSnap.data().promotionalBanners || [];
    }
    return [];
};

export const updateBanners = async (banners) => {
    const bannersRef = doc(db, 'admin', 'banners');
    await setDoc(bannersRef, { promotionalBanners: banners });
};