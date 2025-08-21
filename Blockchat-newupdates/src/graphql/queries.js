export const getUser = /* GraphQL */ `
  query GetUser($walletAddress: ID!) {
    getUser(walletAddress: $walletAddress) {
      walletAddress
      displayName
      bio
      credits
      ownedNfts
      socialLinks
      storageCapacity
      storageUsed
      files
      isVerified
      chatList
      following
      followers
      blockedUsers
      createdAt
    }
  }
`;

export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        walletAddress
        displayName
        bio
        credits
        ownedNfts
        isVerified
        createdAt
        following
        followers
      }
      nextToken
    }
  }
`;

export const messagesByChat = /* GraphQL */ `
  query MessagesByChat(
    $chatId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByChat(
      chatId: $chatId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        chatId
        sender
        text
        image
        reactions
        poll
        timestamp
      }
      nextToken
    }
  }
`;

export const nftsByMarketType = /* GraphQL */ `
  query NftsByMarketType(
    $marketType: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelNftFilterInput
    $limit: Int
    $nextToken: String
  ) {
    nftsByMarketType(
      marketType: $marketType
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        marketType
        name
        price
        image
        description
        seller
        isFeatureNft
        quantity
        featureName
        isUserMinted
        isListed
        mintDate
        createdAt
      }
      nextToken
    }
  }
`;

export const activityFeedByTimestamp = /* GraphQL */ `
  query ActivityFeedByTimestamp(
    $type: String!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelActivityFeedItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    activityFeedByTimestamp(
      type: $type
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        user
        content
        nft
        likes
        comments
        commentData
        timestamp
      }
      nextToken
    }
  }
`;


export const getChatMetadata = /* GraphQL */ `
  query GetChatMetadata($id: ID!) {
    getChatMetadata(id: $id) {
      id
      name
      logo
      creator
      contractAddress
      isOfficial
    }
  }
`;

export const listTokenPerformanceUpdates = /* GraphQL */ `
  query ListTokenPerformanceUpdates(
    $filter: ModelTokenPerformanceUpdateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTokenPerformanceUpdates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        user
        tokenSymbol
        content
        likes
        comments
        createdAt
      }
      nextToken
    }
  }
`;


export const getAdminSettings = /* GraphQL */ `
  query GetAdminSettings($id: ID!) {
    getAdminSettings(id: $id) {
      id
      messagingCosts
      featureToggles
    }
  }
`;

export const getBanners = /* GraphQL */ `
  query GetBanners($id: ID!) {
    getBanners(id: $id) {
      id
      promotionalBanners
    }
  }
`;

export const listReports = /* GraphQL */ `
  query ListReports(
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        reason
        details
        content
        reporterWallet
        reportedUserWallet
        status
        createdAt
      }
      nextToken
    }
  }
`;