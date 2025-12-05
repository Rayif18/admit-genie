# Backend Fixes and Testing Guide

## Issues Fixed

### 1. ✅ SQL Query Errors
**Problem:** 
- `Incorrect arguments to mysqld_stmt_execute` - LIMIT/OFFSET can't be parameters in MySQL
- `Malformed communication packet` - JSON parsing errors

**Fixed:**
- Changed LIMIT/OFFSET to use template literals instead of parameters
- Added safe JSON parsing with try-catch
- Fixed all SQL queries in chatbotRoutes and predictorRoutes

### 2. ✅ LLM API 400 Errors
**Problem:** API returning 400 status code

**Fixed:**
- Improved error handling and logging
- Better API request format validation
- Added detailed error messages
- Removed hardcoded API keys (now uses .env only)

### 3. ✅ Predictor Empty Results
**Problem:** Predictor returning empty when no data in database

**Fixed:**
- Added proper message when no cutoff data found
- Better error handling
- Graceful fallback

## Testing the Backend

### Step 1: Add Sample Data to Database

Run the sample data script to populate your database:

```bash
cd Backend
mysql -u root -p admit_genie < scripts/add-sample-data.sql
```

This will add:
- 5 sample colleges
- 7 sample courses
- 10 sample cutoff records
- 3 exam schedules
- 4 admission records

### Step 2: Test API Endpoints

Run the test script:

```bash
cd Backend
node scripts/test-api.js
```

This will test:
- Health endpoint
- User registration
- Chatbot API
- Predictor API
- LLM configuration

### Step 3: Test LLM API Connection

```bash
cd Backend
node scripts/check-llm.js
```

This will verify your LLM API key is working.

## Setting Up LLM API

### Option 1: Groq (Recommended - Free & Fast)

1. Go to https://console.groq.com/
2. Sign up (free)
3. Create API key
4. Add to `.env`:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Option 2: OpenAI

1. Go to https://platform.openai.com/
2. Create account and add credits
3. Create API key
4. Add to `.env`:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Option 3: Comet API

1. Get API key from Comet
2. Add to `.env`:
   ```env
   LLM_PROVIDER=comet
   COMET_API_KEY=your_comet_api_key_here
   COMET_API_URL=https://api.cometapi.com/v1/chat/completions
   ```

## Current Status

### ✅ Working
- User registration/login
- Database connections
- SQL queries (fixed)
- API structure

### ⚠️ Needs Configuration
- **LLM API Key** - Must be set in `.env` for chatbot to work
- **Sample Data** - Database needs sample data for predictor to return results

### 🔧 Fixed Issues
- SQL LIMIT/OFFSET parameter errors
- JSON parsing errors
- LLM API error handling
- Predictor empty result handling

## Next Steps

1. **Add Sample Data:**
   ```bash
   mysql -u root -p admit_genie < Backend/scripts/add-sample-data.sql
   ```

2. **Configure LLM API:**
   - Get API key from Groq/OpenAI/Comet
   - Add to `.env` file
   - Restart backend

3. **Test Everything:**
   ```bash
   node Backend/scripts/test-api.js
   ```

4. **Verify Chatbot:**
   - Send a test query
   - Check backend logs for API errors
   - If 400 error, verify API key is correct

## Troubleshooting

### Chatbot returns fallback responses
- **Cause:** LLM API key not set or invalid
- **Fix:** Set correct API key in `.env` and restart server

### Predictor returns no results
- **Cause:** No cutoff data in database
- **Fix:** Run `add-sample-data.sql` script

### SQL errors in logs
- **Cause:** Query parameter issues (should be fixed now)
- **Fix:** Restart server after fixes

### API 400 errors
- **Cause:** Invalid API request format or API key
- **Fix:** Check API key, verify provider URL is correct

## Verification Checklist

- [ ] Database has sample data (colleges, courses, cutoffs)
- [ ] LLM API key is set in `.env`
- [ ] Backend server is running
- [ ] Test script passes all checks
- [ ] Chatbot returns real AI responses (not fallback)
- [ ] Predictor returns college predictions
- [ ] No SQL errors in logs

