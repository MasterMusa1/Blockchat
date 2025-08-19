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
      createdAt
      chatList
      following
      followers
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
        timestamp
      }
      nextToken
    }
  }
`;

export const listNfts = /* GraphQL */ `
  query ListNfts(
    $filter: ModelNftFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNfts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        price
        image
        description
        seller
        isFeatureNft
        quantity
        featureName
        sellerIsVip
        sellerIsVerified
        createdAt
      }
      nextToken
    }
  }
`;

export const listActivityFeedItems = /* GraphQL */ `
  query ListActivityFeedItems(
    $filter: ModelActivityFeedItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listActivityFeedItems(
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