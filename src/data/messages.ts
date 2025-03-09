import { Message, MessageData } from '../types';

let messages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "2",
    content: "Hey Hanumanth, how are you?",
    timestamp: "2023-01-10T09:30:00.000Z",
    isReply: false,
    replyToId: null,
    read: false
  },
  {
    id: "2",
    senderId: "2",
    receiverId: "1",
    content: "Hi Bharath! I'm good, thanks for asking!",
    timestamp: "2023-01-10T09:32:00.000Z",
    isReply: false,
    replyToId: null,
    read: false
  },
  {
    id: "3",
    senderId: "3",
    receiverId: "1",
    content: "Arvind, do you have time for a meeting today?",
    timestamp: "2023-01-10T10:00:00.000Z",
    isReply: false,
    replyToId: null,
    read: false
  },
  {
    id: "4",
    senderId: "1",
    receiverId: "3",
    content: "Sure Bhartah, how about 2 PM?",
    timestamp: "2023-01-10T10:05:00.000Z",
    isReply: true,
    replyToId: "3",
    read: false
  }
];

export const getAllMessages = (): Message[] => {
  return [...messages];
};

export const getMessageById = (id: string): Message | null => {
  return messages.find(message => message.id === id) || null;
};

export const getMessagesForUsers = (user1Id: string, user2Id: string): Message[] => {
  return messages.filter(message => 
    (message.senderId === user1Id && message.receiverId === user2Id) ||
    (message.senderId === user2Id && message.receiverId === user1Id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const addMessage = (messageData: MessageData): Message => {
  const newMessage: Message = {
    id: (messages.length + 1).toString(),
    ...messageData
  };
  
  messages.push(newMessage);
  return newMessage;
};

export const getUserConversations = (userId: string): string[] => {
  const conversationUserIds = new Set<string>();
  
  messages.forEach(message => {
    if (message.senderId === userId) {
      conversationUserIds.add(message.receiverId);
    } else if (message.receiverId === userId) {
      conversationUserIds.add(message.senderId);
    }
  });
  
  return Array.from(conversationUserIds);
};