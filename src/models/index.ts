import sequelize from '../config/database';
import User from './Users';
import Message from './Message';

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

export {
  User,
  Message
};

export default sequelize;