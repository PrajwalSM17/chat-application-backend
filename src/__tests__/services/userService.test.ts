// // src/__tests__/services/userService.test.ts
// import { getUserById, getAllUsers, updateUserStatus } from '../../services/userService';
// import { User } from '../../models/Users';

// // Mock the User model
// jest.mock('../../models/User', () => ({
//   findByPk: jest.fn(),
//   findAll: jest.fn(),
//   update: jest.fn()
// }));

// describe('User Service', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('getUserById', () => {
//     it('should return a user without password when user exists', async () => {
//       // Mock data
//       const mockUser = {
//         id: '123',
//         username: 'testuser',
//         email: 'test@example.com',
//         status: 'Available',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         password: 'hashedPassword',
//         get: jest.fn().mockReturnValue({
//           id: '123',
//           username: 'testuser',
//           email: 'test@example.com',
//           status: 'Available',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           password: 'hashedPassword'
//         })
//       };

//       // Setup mock
//       (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

//       // Execute
//       const result = await getUserById('123');

//       // Assert
//       expect(User.findByPk).toHaveBeenCalledWith('123', {
//         attributes: { exclude: ['password'] }
//       });
//       expect(result).toBeDefined();
//       expect(result?.id).toBe('123');
//       expect(result?.username).toBe('testuser');
//       expect((result as any).password).toBeUndefined();
//     });

//     it('should return null when user does not exist', async () => {
//       // Setup mock
//       (User.findByPk as jest.Mock).mockResolvedValue(null);

//       // Execute
//       const result = await getUserById('nonexistent');

//       // Assert
//       expect(User.findByPk).toHaveBeenCalledWith('nonexistent', {
//         attributes: { exclude: ['password'] }
//       });
//       expect(result).toBeNull();
//     });
//   });

//   describe('getAllUsers', () => {
//     it('should return all users without passwords', async () => {
//       // Mock data
//       const mockUsers = [
//         {
//           id: '123',
//           username: 'user1',
//           email: 'user1@example.com',
//           status: 'Available',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           password: 'hashedPassword1',
//           get: jest.fn().mockReturnValue({
//             id: '123',
//             username: 'user1',
//             email: 'user1@example.com',
//             status: 'Available',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             password: 'hashedPassword1'
//           })
//         },
//         {
//           id: '456',
//           username: 'user2',
//           email: 'user2@example.com',
//           status: 'Busy',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           password: 'hashedPassword2',
//           get: jest.fn().mockReturnValue({
//             id: '456',
//             username: 'user2',
//             email: 'user2@example.com',
//             status: 'Busy',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             password: 'hashedPassword2'
//           })
//         }
//       ];

//       // Setup mock
//       (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

//       // Execute
//       const result = await getAllUsers();

//       // Assert
//       expect(User.findAll).toHaveBeenCalledWith({
//         attributes: { exclude: ['password'] }
//       });
//       expect(result).toHaveLength(2);
//       expect(result[0].id).toBe('123');
//       expect(result[1].id).toBe('456');
//       expect((result[0] as any).password).toBeUndefined();
//       expect((result[1] as any).password).toBeUndefined();
//     });
//   });

//   describe('updateUserStatus', () => {
//     it('should update user status and return true on success', async () => {
//       // Setup mock
//       (User.update as jest.Mock).mockResolvedValue([1]);

//       // Execute
//       const result = await updateUserStatus('123', 'Busy');

//       // Assert
//       expect(User.update).toHaveBeenCalledWith(
//         { status: 'Busy' },
//         { where: { id: '123' } }
//       );
//       expect(result).toBe(true);
//     });

//     it('should return false when user not found', async () => {
//       // Setup mock
//       (User.update as jest.Mock).mockResolvedValue([0]);

//       // Execute
//       const result = await updateUserStatus('nonexistent', 'Away');

//       // Assert
//       expect(User.update).toHaveBeenCalledWith(
//         { status: 'Away' },
//         { where: { id: 'nonexistent' } }
//       );
//       expect(result).toBe(false);
//     });

//     it('should handle errors and return false', async () => {
//       // Setup mock
//       (User.update as jest.Mock).mockRejectedValue(new Error('Database error'));

//       // Execute
//       const result = await updateUserStatus('123', 'Away');

//       // Assert
//       expect(User.update).toHaveBeenCalled();
//       expect(result).toBe(false);
//     });
//   });
// });