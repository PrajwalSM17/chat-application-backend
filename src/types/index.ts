// User related types
export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    status: UserStatus;
    createdAt: string;
  }
  
  export type UserStatus = 'Available' | 'Busy' | 'Away' | 'Offline';
  
  export interface UserWithoutPassword {
    id: string;
    username: string;
    email: string;
    status: UserStatus;
    createdAt: string;
  }
  
  export interface UserRegistrationData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface DecodedUser {
    id: string;
    username: string;
    iat?: number;
    exp?: number;
  }
  
  // Message related types
  export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isReply: boolean;
    replyToId: string | null;
  }
  
  export interface MessageData {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isReply: boolean;
    replyToId: string | null;
  }
  
  // Socket related types
  export interface PrivateMessagePayload {
    senderId: string;
    receiverId: string;
    message: string;
  }
  
  export interface ReplyMessagePayload {
    senderId: string;
    receiverId: string;
    message: string;
    replyToId: string;
  }
  
  export interface StatusChangePayload {
    userId: string;
    status: UserStatus;
  }
  
  export interface ConversationPayload {
    userId: string;
    otherUserId: string;
  }