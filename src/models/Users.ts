import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserStatus } from '../types';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public status!: UserStatus;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Available', 'Busy', 'Away', 'Offline'),
      allowNull: false,
      defaultValue: 'Offline',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;