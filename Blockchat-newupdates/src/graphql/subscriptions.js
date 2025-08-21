export const onCreateMessageByChatId = /* GraphQL */ `
  subscription OnCreateMessageByChatId($chatId: ID!) {
    onCreateMessage(filter: { chatId: { eq: $chatId } }) {
      id
      chatId
      sender
      text
      image
      reactions
      poll
      timestamp
    }
  }
`;

export const onUpdateMessageByChatId = /* GraphQL */ `
  subscription OnUpdateMessageByChatId($chatId: ID!) {
    onUpdateMessage(filter: { chatId: { eq: $chatId } }) {
      id
      chatId
      sender
      text
      image
      reactions
      poll
      timestamp
    }
  }
`;

export const onDeleteMessageByChatId = /* GraphQL */ `
  subscription OnDeleteMessageByChatId($chatId: ID!) {
    onDeleteMessage(filter: { chatId: { eq: $chatId } }) {
      id
      chatId
    }
  }
`;