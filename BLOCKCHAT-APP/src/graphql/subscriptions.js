export const onCreateMessageByChatId = /* GraphQL */ `
  subscription OnCreateMessageByChatId($chatId: ID!) {
    onCreateMessageByChatId(chatId: $chatId) {
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