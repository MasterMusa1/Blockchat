export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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

export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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

export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      chatId
      sender
      text
      image
      reactions
      timestamp
    }
  }
`;

export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
    }
  }
`;

export const createNft = /* GraphQL */ `
  mutation CreateNft(
    $input: CreateNftInput!
    $condition: ModelNftConditionInput
  ) {
    createNft(input: $input, condition: $condition) {
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
  }
`;

export const deleteNft = /* GraphQL */ `
  mutation DeleteNft(
    $input: DeleteNftInput!
    $condition: ModelNftConditionInput
  ) {
    deleteNft(input: $input, condition: $condition) {
      id
    }
  }
`;

export const createActivityFeedItem = /* GraphQL */ `
  mutation CreateActivityFeedItem(
    $input: CreateActivityFeedItemInput!
    $condition: ModelActivityFeedItemConditionInput
  ) {
    createActivityFeedItem(input: $input, condition: $condition) {
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
  }
`;

export const updateActivityFeedItem = /* GraphQL */ `
  mutation UpdateActivityFeedItem(
    $input: UpdateActivityFeedItemInput!
    $condition: ModelActivityFeedItemConditionInput
  ) {
    updateActivityFeedItem(input: $input, condition: $condition) {
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
  }
`;

export const updateAdminSettings = /* GraphQL */ `
  mutation UpdateAdminSettings(
    $input: UpdateAdminSettingsInput!
    $condition: ModelAdminSettingsConditionInput
  ) {
    updateAdminSettings(input: $input, condition: $condition) {
      id
      messagingCosts
      featureToggles
    }
  }
`;

export const updateBanners = /* GraphQL */ `
  mutation UpdateBanners(
    $input: UpdateBannersInput!
    $condition: ModelBannersConditionInput
  ) {
    updateBanners(input: $input, condition: $condition) {
      id
      promotionalBanners
    }
  }
`;

export const createReport = /* GraphQL */ `
  mutation CreateReport(
    $input: CreateReportInput!
    $condition: ModelReportConditionInput
  ) {
    createReport(input: $input, condition: $condition) {
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
  }
`;

export const updateReport = /* GraphQL */ `
  mutation UpdateReport(
    $input: UpdateReportInput!
    $condition: ModelReportConditionInput
  ) {
    updateReport(input: $input, condition: $condition) {
      id
      status
    }
  }
`;