# School Management System - Backend Documentation

## Database Setup

This application uses **MongoDB** as the primary database. Follow these steps to set up the backend:

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) or local MongoDB instance
- Cloudinary account (optional, for image uploads): https://cloudinary.com

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_db

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### MongoDB Collections

The application automatically creates the following collections:

1. **users** - All user accounts (students, teachers, admins, helpers)
2. **students** - Student-specific profile information
3. **teachers** - Teacher-specific profile information
4. **classes** - Class information
5. **subjects** - Subject information
6. **assignments** - Assignment details
7. **attendance** - Attendance records
8. **grades** - Grade records
9. **timetables** - Class timetables
10. **materials** - Study materials
11. **messages** - Private messages between users
12. **notices** - Admin announcements
13. **quizzes** - Quiz questions and answers
14. **tickets** - Support tickets

## Authentication Flow

### Login Process
1. User submits email and password to `/api/auth/login`
2. Backend verifies credentials against MongoDB users collection
3. Server creates JWT token and sets HTTP-only cookie
4. Frontend stores session and redirects to role-based dashboard

### Session Management
- JWT tokens are stored in HTTP-only cookies (secure, sameSite)
- Tokens have 7-day expiration
- All API routes validate token before processing requests
- Failed authentication returns 401 Unauthorized

### Password Security
- Passwords are hashed using bcrypt (10 salt rounds)
- Never stored as plain text
- Password reset requires verification email

## API Endpoints

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/reset-password` - Reset forgot password

### Admin Routes (`/api/admin/*`)
- `GET/POST /api/admin/users` - Manage all users
- `GET/PUT/DELETE /api/admin/users/[id]` - Manage specific user
- `GET/POST /api/admin/classes` - Manage classes
- `GET/PUT/DELETE /api/admin/classes/[id]` - Manage specific class
- `GET/POST /api/admin/subjects` - Manage subjects
- `GET/PUT/DELETE /api/admin/subjects/[id]` - Manage specific subject
- `GET/POST /api/admin/notices` - Create system notices
- `GET/PUT/DELETE /api/admin/notices/[id]` - Manage notices
- `GET /api/admin/stats` - Get school statistics
- `GET/PUT /api/admin/settings` - Manage system settings

### Teacher Routes (`/api/teacher/*`)
- `GET /api/teacher/dashboard` - Teacher dashboard stats
- `GET /api/teacher/classes` - Get assigned classes
- `GET /api/teacher/students` - Get students in classes
- `GET/POST /api/teacher/attendance` - Mark attendance
- `GET/POST /api/teacher/assignments` - Create/manage assignments
- `GET/PUT /api/teacher/assignments/[id]` - Manage specific assignment
- `POST /api/teacher/assignments/[id]/grade` - Grade student submission
- `GET/POST /api/teacher/quizzes` - Create/manage quizzes
- `GET/PUT /api/teacher/quizzes/[id]` - Manage specific quiz
- `GET/POST /api/teacher/materials` - Upload study materials
- `GET /api/teacher/grades` - View all student grades

### Student Routes (`/api/student/*`)
- `GET /api/student/dashboard` - Student dashboard stats
- `GET /api/student/assignments` - View assignments
- `POST /api/student/assignments/[id]/submit` - Submit assignment
- `GET /api/student/attendance` - View attendance records
- `GET /api/student/grades` - View grades
- `GET /api/student/quizzes` - View available quizzes
- `POST /api/student/quizzes/[id]/attempt` - Take quiz
- `GET /api/student/materials` - Download materials
- `GET /api/student/timetable` - View class timetable
- `GET /api/student/messages` - View messages

### Helper Routes (`/api/helper/*`)
- `GET /api/helper/dashboard` - Helper dashboard stats
- `GET/PUT /api/helper/tickets` - Manage support tickets
- `GET /api/helper/tickets/[id]` - View specific ticket
- `POST /api/helper/tickets/[id]/reply` - Reply to ticket
- `GET /api/helper/users` - Search/manage users

### Shared Routes
- `GET/PUT /api/profile` - Get/update user profile
- `POST /api/profile/password` - Change password
- `POST /api/upload` - Upload file to Cloudinary
- `GET/POST /api/messages` - Send/receive messages
- `GET /api/notices` - View all notices

## Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@school.com",
  "password": "securepassword"
}

Response:
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "student@school.com",
    "role": "student",
    "avatar": "cloudinary_url"
  }
}
```

### Create Assignment (Teacher)
```bash
POST /api/teacher/assignments
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Math Assignment 1",
  "description": "Chapter 5 exercises",
  "classId": "class_id",
  "subjectId": "subject_id",
  "dueDate": "2024-02-20T23:59:59Z",
  "marks": 100
}

Response: Created assignment object with _id
```

### Submit Assignment (Student)
```bash
POST /api/student/assignments/[id]/submit
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- file: PDF/Document
- content: "Student submission text"

Response: Submission record with status "submitted"
```

### Take Quiz (Student)
```bash
POST /api/student/quizzes/[id]/attempt
Content-Type: application/json
Authorization: Bearer {token}

{
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": "A"
    }
  ]
}

Response: Quiz attempt with score and results
```

## Database Schema Examples

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/teacher/admin/helper),
  avatar: String (Cloudinary URL),
  phone: String,
  address: String,
  city: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  classId: ObjectId (ref: Class),
  subjectId: ObjectId (ref: Subject),
  teacherId: ObjectId (ref: User),
  dueDate: Date,
  marks: Number,
  submissions: [{
    studentId: ObjectId,
    submittedAt: Date,
    status: String (pending/submitted/graded),
    marks: Number,
    feedback: String,
    fileUrl: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All API responses follow this format:

### Success Response (2xx)
```json
{
  "data": {},
  "message": "Success message"
}
```

### Error Response (4xx/5xx)
```json
{
  "error": "Error message",
  "status": 400
}
```

### Common Error Codes
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Security Features

1. **Password Hashing** - Bcrypt with 10 salt rounds
2. **JWT Authentication** - Secure token-based auth
3. **HTTP-Only Cookies** - Prevents XSS attacks
4. **Input Validation** - All inputs validated on server
5. **Rate Limiting** - Recommended to add (not implemented)
6. **CORS** - Configure based on deployment
7. **SQL Injection Prevention** - MongoDB parameterized queries
8. **File Upload Security** - File type validation, size limits, Cloudinary storage

## Development

### Running Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Testing API Routes
Use Postman or similar tool:
1. Login to get JWT token
2. Include token in Authorization header: `Authorization: Bearer {token}`
3. Make requests to API endpoints

## Troubleshooting

### MongoDB Connection Error
- Check MONGODB_URI in .env.local
- Verify MongoDB Atlas cluster is active
- Check IP whitelist in MongoDB Atlas

### Authentication Failing
- Clear cookies in browser DevTools
- Check JWT_SECRET is set correctly
- Verify user exists in database

### File Upload Errors
- Verify Cloudinary credentials
- Check file size limits
- Ensure valid file types

## Next Steps

1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Test authentication flow
4. Implement frontend API calls using `fetch` or `axios`
5. Add rate limiting and additional security
6. Set up CI/CD pipeline
7. Deploy to production
