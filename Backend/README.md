# Admit Genie Backend API

Backend API server for Admit Genie - AI-Powered Admission Assistant Chatbot.

## Features

- ✅ User authentication (JWT)
- ✅ Admin authentication and CRUD operations
- ✅ AI Chatbot integration (Comet, Groq, Cohere, OpenAI, Hugging Face)
- ✅ CET Rank-based college prediction
- ✅ College, Course, Admission, and Exam data management
- ✅ Chat history and prediction history
- ✅ Saved colleges functionality
- ✅ Secure API with rate limiting and validation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **AI/LLM**: Configurable (Comet, Groq, Cohere, OpenAI, Hugging Face)

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and API keys

4. **Set up MySQL database**
   - Create a MySQL database
   - Run the SQL schema file:
   ```bash
   mysql -u root -p < config/dbSchema.sql
   ```
   Or import it using MySQL Workbench or phpMyAdmin

5. **Configure .env file**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=admit_genie
   JWT_SECRET=your_super_secret_jwt_key
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key
   FRONTEND_URL=http://localhost:5173
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `POST /api/admin/login` - Admin login

### Chatbot
- `POST /api/chatbot/query` - Send query to chatbot
- `GET /api/chatbot/history` - Get chat history (Protected)
- `DELETE /api/chatbot/history/:id` - Delete chat entry (Protected)

### Predictor
- `POST /api/predictor/predict` - Predict colleges based on rank
- `GET /api/predictor/history` - Get prediction history (Protected)
- `GET /api/predictor/history/:id` - Get specific prediction (Protected)

### Public Data
- `GET /api/colleges` - Get all colleges (with search/filter)
- `GET /api/colleges/:id` - Get college details
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `GET /api/exams` - Get exam schedules
- `GET /api/exams/:id` - Get exam details
- `GET /api/admissions` - Get admission information
- `GET /api/cutoffs` - Get cutoff data

### Saved Colleges
- `POST /api/saved` - Save a college (Protected)
- `GET /api/saved` - Get saved colleges (Protected)
- `DELETE /api/saved/:id` - Remove saved college (Protected)

### Admin (Protected - Admin only)
- `GET /api/admin/colleges` - Get all colleges (with pagination)
- `POST /api/admin/colleges` - Create college
- `PUT /api/admin/colleges/:id` - Update college
- `DELETE /api/admin/colleges/:id` - Delete college
- Similar CRUD for courses, admissions, cutoffs, exams
- `GET /api/admin/analytics` - Get dashboard analytics

## LLM Provider Configuration

The backend supports multiple LLM providers. Configure in `.env`:

### Groq (Recommended for speed)
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
```

### OpenAI
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

### Cohere
```env
LLM_PROVIDER=cohere
COHERE_API_KEY=your_cohere_api_key
```

### Comet
```env
LLM_PROVIDER=comet
COMET_API_KEY=your_comet_api_key
COMET_API_URL=your_comet_api_url
```

### Hugging Face
```env
LLM_PROVIDER=huggingface
HF_API_KEY=your_hf_api_key
HF_API_URL=your_hf_model_url
```

## Default Admin Credentials

On first startup, a default admin is created:
- **Username**: `admin` (or from `DEFAULT_ADMIN_USERNAME`)
- **Password**: `admin123` (or from `DEFAULT_ADMIN_PASSWORD`)

⚠️ **Important**: Change the default password immediately after first login!

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `admins` - Admin accounts
- `colleges` - College information
- `courses` - Course details
- `admissions` - Admission information
- `cutoff_data` - Historical cutoff ranks
- `exam_schedules` - Exam schedules
- `chat_history` - Chatbot conversation history
- `rank_predictions` - User predictions
- `saved_colleges` - User saved colleges
- `chatbot_intents` - Chatbot intents/FAQs

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting
- Helmet.js for security headers
- CORS configuration
- SQL injection prevention (parameterized queries)
- XSS prevention

## Error Handling

All errors are handled centrally through the error handler middleware. Errors return JSON responses with:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

### Project Structure
```
Backend/
├── config/
│   ├── database.js       # Database connection
│   └── dbSchema.sql      # Database schema
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Error handling
├── routes/
│   ├── userRoutes.js     # User routes
│   ├── adminRoutes.js    # Admin routes
│   ├── chatbotRoutes.js  # Chatbot routes
│   ├── predictorRoutes.js # Predictor routes
│   ├── publicRoutes.js   # Public data routes
│   └── savedRoutes.js    # Saved colleges routes
├── services/
│   └── llmService.js     # LLM integration service
├── utils/
│   └── jwt.js            # JWT utilities
├── server.js             # Main server file
├── package.json
└── README.md
```

## Testing

Test the API using tools like Postman, Insomnia, or curl:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE admit_genie;`

### LLM API Issues
- Verify API key is correct
- Check API provider status
- Review rate limits
- Check network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

## License

ISC

## Support

For issues or questions, please refer to the project documentation or contact the development team.

