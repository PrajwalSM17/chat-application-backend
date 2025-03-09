import bcrypt from 'bcryptjs';
import { User, UserRegistrationData, UserStatus, UserWithoutPassword } from '../types';

let users: User[] = [
  {
    id: "1",
    username: "Bharathh",
    email: "bharath@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2",
    status: "Offline",
    createdAt: "2023-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    username: "vignesh",
    email: "vignesh@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2", 
    status: "Offline",
    createdAt: "2023-01-02T00:00:00.000Z"
  },
  {
    id: "3",
    username: "jitin",
    email: "jitin@example.com",
    password: "$2a$10$XveVlxESCNlXa4nQ9wosD.QRtrcz7J3vJwrR4wJ19kfg9MZXAr8N2",
    status: "Offline",
    createdAt: "2023-01-03T00:00:00.000Z"
  }
];

export const getAllUsers = (): UserWithoutPassword[] => {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

export const getUserById = (id: string): UserWithoutPassword | null => {
  const user = users.find(user => user.id === id);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByEmail = (email: string): User | null => {
  return users.find(user => user.email === email) || null;
};

export const getUserByUsername = (username: string): User | null => {
  return users.find(user => user.username === username) || null;
};

export const createUser = (userData: UserRegistrationData): UserWithoutPassword => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);
  
  const newUser: User = {
    id: (users.length + 1).toString(),
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    status: "Offline",
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUserStatus = (userId: string, status: UserStatus): boolean => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].status = status;
    return true;
  }
  return false;
};