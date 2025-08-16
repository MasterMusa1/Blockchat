export const getUser = /* GraphQL */ `
  query GetUser($walletAddress: ID!) {
    getUser(walletAddress: $walletAddress) {
      walletAddress
      displayName
      bio
      credits
      ownedNfts
      socialLinks {
        twitter
        discord
      }
      storageCapacity
      storageUsed
      files
      createdAt
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