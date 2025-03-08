import bcrypt from 'bcryptjs';
import { User } from '../models';
import { UserRegistrationData, UserStatus, UserWithoutPassword } from '../types';

export const getAllUsers = async (): Promise<UserWithoutPassword[]> => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  
  return users.map((user: any) => user.get({ plain: true })) as UserWithoutPassword[];
};
export const getUserById = async (id: string): Promise<UserWithoutPassword | null> => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) return null;
  
  return user.get({ plain: true }) as unknown as UserWithoutPassword;
};
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  return user ? user.get({ plain: true }) : null;
};
export const getUserByUsername = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  return user ? user.get({ plain: true }) : null;
};

export const createUser = async (userData: UserRegistrationData) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);
  
  const newUser = await User.create({
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    status: 'Offline'
  });
  
  const userObj = newUser.get({ plain: true });
  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
  
};

export const updateUserStatus = async (userId: string, status: UserStatus): Promise<boolean> => {
  const [updated] = await User.update(
    { status },
    { where: { id: userId } }
  );
  
  return updated > 0;
};