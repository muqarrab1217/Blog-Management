# Blog Management Backend

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory with:
```
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://localhost:27017/blog_management
JWT_EXPIRE=1h
```

### 3. Start the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/status` - Get all users with online status (Admin only)
- `GET /api/users/status/:id` - Get user status by ID
- `PUT /api/users/activity/:id` - Update user activity

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create blog (Authenticated)
- `GET /api/blogs/:id` - Get blog by ID
- `PUT /api/blogs/:id` - Update blog (Author only)
- `DELETE /api/blogs/:id` - Delete blog (Author only)
- `GET /api/blogs/search` - Search blogs

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change password

## Socket.IO Events

### Client to Server
- `user_activity` - Send user activity heartbeat

### Server to Client
- `user_status_change` - User online/offline status changed

## Database

The application uses MongoDB. Make sure MongoDB is running on your system.

### Default Database
- Database: `blog_management`
- Collections: `users`, `blogs`