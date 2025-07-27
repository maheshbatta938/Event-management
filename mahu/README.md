# Event Management System

A comprehensive event management platform with a modern frontend and robust backend API built with Node.js, Express, MongoDB, and vanilla JavaScript. This system provides full CRUD operations for events, user authentication, registration management, and admin functionality.

## 🎨 Frontend Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **User Authentication**: Login and registration functionality
- **Event Management**: Browse, search, filter, and register for events
- **Event Creation**: Create new events (for authenticated users)
- **Mobile Responsive**: Works perfectly on all device sizes
- **Real-time Updates**: Dynamic content loading and updates

## 🔧 Backend Features

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (User/Admin)
- Password hashing with bcrypt
- Protected routes with middleware

### 📅 Event Management
- Create, read, update, and delete events
- Event approval system for admins
- Rich event details (title, description, date, time, location, capacity)
- Event categories and tags
- Image support for events
- Registration deadlines

### 👥 User Registration System
- Register for events with capacity validation
- Cancel registrations
- Waitlist functionality when events are full
- Registration status tracking
- User registration history

### 🔍 Advanced Filtering & Search
- Filter events by date, location, category
- Search events by title and description
- Pagination support
- Sorting options

### 👨‍💼 Admin Dashboard
- User management (view, update, deactivate)
- Event approval/rejection system
- System statistics and analytics
- Pending events management

### 🛡️ Security Features
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Error handling middleware

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid/Flexbox
- **JavaScript (ES6+)**: Vanilla JS with modern features
- **Font Awesome**: Icons
- **Responsive Design**: Mobile-first approach

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/event-management-system
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - API Documentation: Available in the routes files
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User Profile
```http
GET /auth/me
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /auth/me
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890"
}
```

### Event Endpoints

#### Get All Events (Public)
```http
GET /events?page=1&limit=10&category=technology&location=New York&dateFrom=2024-01-01&dateTo=2024-12-31&search=conference
```

#### Get Single Event (Public)
```http
GET /events/:eventId
```

#### Create Event (Authenticated)
```http
POST /events
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference featuring industry leaders",
  "date": "2024-06-15",
  "time": "09:00",
  "location": "Convention Center, New York",
  "capacity": 500,
  "category": "technology",
  "price": 99.99,
  "tags": ["tech", "conference", "networking"],
  "registrationDeadline": "2024-06-10"
}
```

#### Update Event (Owner/Admin)
```http
PUT /events/:eventId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Tech Conference 2024",
  "capacity": 600
}
```

#### Delete Event (Owner/Admin)
```http
DELETE /events/:eventId
Authorization: Bearer <jwt-token>
```

#### Approve/Reject Event (Admin Only)
```http
PUT /events/:eventId/approve
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "approved",
  "reason": "Event meets all requirements"
}
```

### Registration Endpoints

#### Register for Event
```http
POST /registrations
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "eventId": "event-id-here",
  "notes": "Looking forward to attending!"
}
```

#### Cancel Registration
```http
PUT /registrations/:registrationId/cancel
Authorization: Bearer <jwt-token>
```

#### Get User's Registrations
```http
GET /registrations/my?status=confirmed&page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Get Event Registrations (Organizer/Admin)
```http
GET /registrations/event/:eventId?status=confirmed&page=1&limit=20
Authorization: Bearer <jwt-token>
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /users?page=1&limit=20&role=user&isActive=true&search=john
Authorization: Bearer <jwt-token>
```

#### Update User (Admin Only)
```http
PUT /users/:userId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "role": "admin",
  "isActive": true
}
```

#### Get System Statistics (Admin Only)
```http
GET /users/stats/overview
Authorization: Bearer <jwt-token>
```

#### Get Pending Events (Admin Only)
```http
GET /users/pending-events?page=1&limit=20
Authorization: Bearer <jwt-token>
```

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  phone: String,
  isActive: Boolean (default: true),
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required, future date),
  time: String (required, HH:MM format),
  location: String (required),
  capacity: Number (required, 1-10000),
  organizer: ObjectId (ref: User, required),
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  category: String (enum: ['business', 'technology', 'health', 'education', 'entertainment', 'sports', 'other']),
  price: Number (default: 0),
  image: String,
  tags: [String],
  isPublic: Boolean (default: true),
  registrationDeadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Registration Model
```javascript
{
  event: ObjectId (ref: Event, required),
  user: ObjectId (ref: User, required),
  status: String (enum: ['confirmed', 'cancelled', 'waitlist']),
  registrationDate: Date (default: now),
  cancelledAt: Date,
  cancelledBy: ObjectId (ref: User),
  notes: String,
  paymentStatus: String (enum: ['pending', 'paid', 'refunded']),
  paymentAmount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Prevents abuse with request limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **Error Handling**: Centralized error handling middleware

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

1. **Set environment variables for production**
2. **Use a production MongoDB instance**
3. **Set up proper logging and monitoring**
4. **Configure reverse proxy (nginx)**
5. **Use PM2 or similar process manager**

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "event-management-api"

# Monitor application
pm2 monit
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team. 