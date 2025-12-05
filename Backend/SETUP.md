# Quick Setup Guide

## Step 1: Install Dependencies
```bash
cd Backend
npm install
```

## Step 2: Create .env File
Create a `.env` file in the Backend directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=admit_genie
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# AI/LLM API Configuration
# Choose one provider (groq, openai, cohere, comet, huggingface)
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Or use OpenAI
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key

# Default Admin Credentials
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## Step 3: Set Up MySQL Database

1. **Create the database:**
   ```sql
   CREATE DATABASE admit_genie;
   ```

2. **Run the schema:**
   ```bash
   mysql -u root -p admit_genie < config/dbSchema.sql
   ```
   
   Or import `config/dbSchema.sql` using MySQL Workbench/phpMyAdmin.

## Step 4: Get an LLM API Key

### Option 1: Groq (Recommended - Fast & Free)
1. Go to https://console.groq.com/
2. Sign up for free
3. Create an API key
4. Add to `.env`: `GROQ_API_KEY=your_key_here`

### Option 2: OpenAI
1. Go to https://platform.openai.com/
2. Create an account and add credits
3. Create an API key
4. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### Option 3: Cohere
1. Go to https://cohere.com/
2. Sign up and get API key
3. Add to `.env`: `COHERE_API_KEY=your_key_here`

## Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Step 6: Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "cet_rank": 1500,
    "category": "General"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Chatbot (requires LLM API key)
```bash
curl -X POST http://localhost:5000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the top engineering colleges in Pune?"
  }'
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

### LLM API Error
- Verify API key is correct
- Check API provider status
- Review rate limits
- Check network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill`

## Next Steps

1. Connect the frontend to the backend API
2. Add sample data through admin panel
3. Test all features
4. Deploy to production

