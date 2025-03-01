// Dummy data and functions for users
import bcrypt from 'bcryptjs';
import { User, UserRegistrationData, UserStatus, UserWithoutPassword } from '../types';

// In-memory storage for users
let users: User[] = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2", // hashed "password123"
    status: "Offline",
    createdAt: "2023-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2", // hashed "password123"
    status: "Offline",
    createdAt: "2023-01-02T00:00:00.000Z"
  },
  {
    id: "3",
    username: "mike_johnson",
    email: "mike@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2", // hashed "password123"
    status: "Offline",
    createdAt: "2023-01-03T00:00:00.000Z"
  }
];

// Get all users
export const getAllUsers = (): UserWithoutPassword[] => {
  // Return users without exposing passwords
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Get user by ID
export const getUserById = (id: string): UserWithoutPassword | null => {
  const user = users.find(user => user.id === id);
  if (!user) return null;
  
  // Return without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get user by email (for authentication)
export const getUserByEmail = (email: string): User | null => {
  return users.find(user => user.email === email) || null;
};

// Get user by username
export const getUserByUsername = (username: string): User | null => {
  return users.find(user => user.username === username) || null;
};

// Create a new user
export const createUser = (userData: UserRegistrationData): UserWithoutPassword => {
  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);
  
  // Create new user
  const newUser: User = {
    id: (users.length + 1).toString(),
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    status: "Offline",
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Update user status
export const updateUserStatus = (userId: string, status: UserStatus): boolean => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].status = status;
    return true;
  }
  return false;
};