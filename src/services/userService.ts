import bcrypt from 'bcryptjs';
import { User } from '../models';
import { UserRegistrationData, UserStatus, UserWithoutPassword } from '../types';

// Get all users without exposing passwords
export const getAllUsers = async (): Promise<UserWithoutPassword[]> => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  
  return users.map((user: any) => user.get({ plain: true })) as UserWithoutPassword[];
};

// Get user by ID without exposing password
export const getUserById = async (id: string): Promise<UserWithoutPassword | null> => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) return null;
  
  return user.get({ plain: true }) as unknown as UserWithoutPassword;
};

// Get user by email (for authentication - includes password)
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  return user ? user.get({ plain: true }) : null;
};

// Get user by username
export const getUserByUsername = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  return user ? user.get({ plain: true }) : null;
};

// Create a new user
export const createUser = async (userData: UserRegistrationData) => {
  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);
  
  // Create new user
  const newUser = await User.create({
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    status: 'Offline'
  });
  
  // Return without password
  const userObj = newUser.get({ plain: true });
  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
  
};

// Update user status
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<boolean> => {
  const [updated] = await User.update(
    { status },
    { where: { id: userId } }
  );
  
  return updated > 0;
};