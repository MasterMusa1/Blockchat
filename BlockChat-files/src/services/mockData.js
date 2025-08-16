import { ADMIN_WALLET_ADDRESS, OFFICIAL_WELCOME_SENDER_WALLET, OFFICIAL_GROUP_CHAT_ID } from '../constants';

export const initialMockUsers = {
    [ADMIN_WALLET_ADDRESS]: {
        walletAddress: ADMIN_WALLET_ADDRESS,
        displayName: 'Admin',
        bio: 'The owner and administrator of BlockChat.',
        credits: 999999,
        ownedNfts: [
            { id: 'owned-feature-1', name: 'Lifetime Messaging NFT', image: 'https://i.imgur.com/pUmTaaZ.png', description: 'Grants unlimited messaging.' },
            { id: 'owned-feature-2', name: 'VIP Access NFT', image: 'https://i.imgur.com/REECv7A.png', description: 'Grants VIP status, all features, and a gold badge.' },
        ],
        socialLinks: { twitter: 'blockchat', discord: 'blockchat' },
        chatList: [OFFICIAL_GROUP_CHAT_ID],
        blockedUsers: [],
        storageCapacity: 10737418240, // 10 GB
        storageUsed: 12345678,
        files: {
            id: 'root',
            name: 'My Drive',
            type: 'folder',
            children: [
                { id: 'folder-1', name: 'Project Files', type: 'folder', children: [], lastModified: '5/20/2024' },
                { id: 'file-1', name: 'welcome.txt', type: 'file', size: 1024, lastModified: '5/20/2024' },
            ]
        }
    },
    [OFFICIAL_WELCOME_SENDER_WALLET]: {
        walletAddress: OFFICIAL_WELCOME_SENDER_WALLET,
        displayName: 'Official BlockChat',
        bio: 'Official announcements and welcome messages.',
        credits: 0,
        ownedNfts: [],
        socialLinks: {},
        chatList: [],
        blockedUsers: [],
    }
};

export const initialMockMarketplaceNfts = [
    { id: 'feature-1', name: 'Lifetime Messaging NFT', price: '2.5 SOL', image: 'https://i.imgur.com/pUmTaaZ.png', description: 'Grants unlimited messaging.', seller: ADMIN_WALLET_ADDRESS, isFeatureNft: true, quantity: 10, featureName: 'Lifetime Messaging NFT' },
    { id: 'feature-2', name: 'VIP Access NFT', price: '5 SOL', image: 'https://i.imgur.com/REECv7A.png', description: 'Grants VIP status, all features, and a gold badge.', seller: ADMIN_WALLET_ADDRESS, isFeatureNft: true, quantity: 5, featureName: 'VIP Access NFT' },
    { id: 'user-1', name: 'Cool Cat #123', price: '1.2 SOL', image: 'https://i.imgur.com/JAs4VfF.png', description: 'A very cool cat.', seller: 'USER_WALLET_ADDRESS_1', isFeatureNft: false },
];

export const initialVipMarketplaceNfts = [
    { id: 'vip-1', name: 'Golden Block', price: '10 SOL', image: 'https://i.imgur.com/aurkQ87.png', description: 'A rare golden block for true VIPs.', seller: 'USER_WALLET_ADDRESS_VIP_1', isFeatureNft: false },
    { id: 'vip-2', name: 'Diamond Chat Theme', price: '15 SOL', image: 'https://i.imgur.com/s6f2a8q.png', description: 'Unlock an exclusive diamond-studded chat theme.', seller: 'USER_WALLET_ADDRESS_VIP_2', isFeatureNft: false },
];

export const initialMockActivityFeed = [
    { id: '1', type: 'nft_listing', user: { name: 'BlockChat', avatar: 'https://i.imgur.com/siB8l8m.png', isAdmin: true }, nft: initialMockMarketplaceNfts[0], timestamp: '2 days ago', likes: 25, comments: 2, commentData: [
        { user: { name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob' }, content: 'Wow, lifetime messaging!', timestamp: '2024-05-20T12:00:00Z' },
        { user: { name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' }, content: 'Definitely getting this.', timestamp: '2024-05-20T14:30:00Z' },
    ] },
    { id: '2', type: 'status_update', user: { name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', isVip: true }, content: 'Just joined BlockChat, looks awesome!', likes: 15, comments: 0, commentData: [], timestamp: '1 day ago' },
];

export const initialMockChats = {
    [OFFICIAL_GROUP_CHAT_ID]: [
        { id: 'official-welcome-1', sender: OFFICIAL_WELCOME_SENDER_WALLET, text: 'Welcome to the official BlockChat group! Feel free to chat, ask questions, and share feedback here.', timestamp: { toDate: () => new Date(Date.now() - 86400000) } },
        { id: 'official-welcome-2', isSystem: true, text: 'This is a public channel for all BlockChat users.', timestamp: { toDate: () => new Date(Date.now() - 86300000) } }
    ],
};

export const initialMockChatMetadata = {
    [OFFICIAL_GROUP_CHAT_ID]: {
        contractAddress: null, // Not a real token-gated group
        logo: 'https://i.imgur.com/siB8l8m.png', // BlockChat logo
        creator: ADMIN_WALLET_ADDRESS,
        name: OFFICIAL_GROUP_CHAT_ID,
        isOfficial: true // custom flag
    }
};

export const initialMockAdminSettings = {
    messagingCosts: { text: 1, media: 3, groupCreation: 100, nftMinting: 50, pollCreation: 5 },
    featureToggles: { p2pMarketplace: true, statusUpdates: true },
};

export const initialMockBanners = [
    { id: 1, title: 'Welcome!', message: 'Thanks for joining the BlockChat alpha.', active: true }
];

export const initialMockReports = [
    { id: 1, type: 'Profile Bio', content: 'Inappropriate bio content here.', reporter: 'user2wallet...' },
];