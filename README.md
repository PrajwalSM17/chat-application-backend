# Chat Application Backend (TypeScript with MySQL)

This is the backend for a real-time chat application implemented with Node.js, Express, Socket.io, TypeScript, and MySQL.

## Features

- User authentication (register, login)
- User status management (Available, Busy, Away, Offline)
- Real-time messaging using WebSockets
- One-to-one chat functionality
- Reply to messages feature
- Message history

## Project Structure

```
/
├── src/                        # Source files
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database connection
│   │   └── dbInit.ts           # Database initialization
│   ├── data/                   # Legacy data files (no longer used)
│   ├── middleware/             # Middleware functions
│   │   └── auth.ts             # Authentication middleware
│   ├── models/                 # Sequelize models
│   │   ├── User.ts             # User model
│   │   ├── Message.ts          # Message model
│   │   └── index.ts            # Models export and associations
│   ├── routes/                 # API routes
│   │   ├── auth.ts             # Authentication routes
│   │   ├── users.ts            # User management routes
│   │   └── messages.ts         # Message handling routes
│   ├── services/               # Business logic layer
│   │   ├── userService.ts      # User-related operations
│   │   └── messageService.ts   # Message-related operations
│   ├── socket/                 # WebSocket handlers
│   │   └── socketHandler.ts    # Socket.io event handlers
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Shared types and interfaces
│   └── server.ts               # Main application entry point
├── dist/                       # Compiled JavaScript files (generated)
├── .env                        # Environment variables
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- TypeScript (v4.5 or later)
- MySQL (v5.7 or later)

### Database Setup

1. Install MySQL if you haven't already:
   ```bash
   # For Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # For macOS with Homebrew
   brew install mysql
   brew services start mysql
   ```

2. Set up the MySQL database and user:
   ```bash
   # Log in to MySQL
   sudo mysql -u root
   
   # In the MySQL shell, run these commands:
   CREATE DATABASE chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'chat_user'@'localhost' IDENTIFIED BY 'chat_password';
   GRANT ALL PRIVILEGES ON chat_app.* TO 'chat_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Configure environment variables:
   ```
   # Copy the sample .env file
   cp .env.example .env
   
   # Edit the .env file with your database credentials
   nano .env
   ```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chat-app-backend.git
   cd chat-app-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the TypeScript files:
   ```
   npm run build
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The server will start on port 5000 by default. You can access the API at `http://localhost:5000`.

The first time you run the server, it will:
1. Connect to the MySQL database
2. Create necessary tables (users and messages)
3. Seed the database with sample data if no users exist

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user status
- `GET /api/users/:id/conversations` - Get user's conversations

### Messages

- `GET /api/messages/conversation/:userId/:otherUserId` - Get conversation between two users
- `POST /api/messages` - Send a new message

## WebSocket Events

### Client to Server

- `login` - User logs in
- `statusChange` - User changes status
- `privateMessage` - User sends a private message
- `replyMessage` - User replies to a message
- `getConversation` - Get conversation history

### Server to Client

- `userStatusChanged` - Notifies when a user's status changes
- `onlineUsers` - Sends list of online users
- `newMessage` - Sends a new message
- `messageSent` - Confirms message delivery
- `conversationHistory` - Sends conversation history

## Next Steps

1. **Dockerization**
   - Create Dockerfile for containerization
   - Set up Docker Compose for multi-container deployment (Node.js + MySQL)
   - Configure environment variables for different deployment environments

2. **Testing**
   - Implement unit tests and integration tests
   - Set up CI/CD pipeline

3. **Performance Improvements**
   - Add caching for frequently accessed data
   - Optimize database queries
   - Implement connection pooling

4. **Security Enhancements**
   - Add rate limiting
   - Implement CSRF protection
   - Enhanced input validation and sanitization

## License

This project is licensed under the MIT License.