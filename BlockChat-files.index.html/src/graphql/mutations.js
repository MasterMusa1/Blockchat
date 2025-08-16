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