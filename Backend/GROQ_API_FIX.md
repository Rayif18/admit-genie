# Groq API Fix Guide

## Issues Fixed

1. **Updated Model Name**: Changed from `llama-3.1-70b-versatile` to `llama-3.1-8b-instant` (more reliable and faster)
2. **Better Error Handling**: Added detailed error messages for common API errors
3. **API Key Validation**: Added warnings when API key is missing
4. **Improved Logging**: Added console logs to help debug issues

## How to Fix Your Groq API Issues

### Step 1: Verify Your API Key

1. Go to https://console.groq.com/
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key or copy your existing one

### Step 2: Update Your .env File

Make sure your `Backend/.env` file has:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with your actual Groq API key.

### Step 3: Optional - Set a Specific Model

If you want to use a different model, add this to your `.env`:

```env
GROQ_MODEL=llama-3.1-8b-instant
```

Available Groq models:
- `llama-3.1-8b-instant` (fast, recommended)
- `llama-3.1-70b-versatile` (more powerful, slower)
- `llama-3.3-70b-versatile` (newest, if available)
- `mixtral-8x7b-32768` (alternative)

### Step 4: Test the API Connection

Run the test script:

```bash
cd Backend
node scripts/check-llm.js
```

This will verify:
- Your API key is set correctly
- The API is accessible
- The model is working

### Step 5: Restart Your Server

After updating the `.env` file, restart your backend server:

```bash
cd Backend
npm run dev
```

## Common Error Messages and Solutions

### Error: "API key not configured"
**Solution**: Add `GROQ_API_KEY=your_key` to your `.env` file

### Error: "401 Unauthorized"
**Solution**: Your API key is invalid. Get a new one from https://console.groq.com/

### Error: "400 Bad Request" with model error
**Solution**: The model name might be incorrect. Try setting `GROQ_MODEL=llama-3.1-8b-instant` in `.env`

### Error: "429 Too Many Requests"
**Solution**: You've exceeded the rate limit. Wait a few minutes and try again.

### Error: "Network error"
**Solution**: Check your internet connection and firewall settings.

## Testing the Chatbot

1. Start your backend server
2. Open your frontend application
3. Navigate to the Chatbot page
4. Send a test message like "What are the top engineering colleges?"

If it works, you should get an AI-generated response. If not, check the backend console for error messages.

## Testing the Predictor

**Note**: The predictor does NOT use the Groq API. It only queries your database.

If the predictor isn't working:
1. Make sure your database has cutoff data
2. Check the backend console for database errors
3. Run the sample data script: `mysql -u root -p admit_genie < scripts/add-sample-data.sql`

## Still Having Issues?

1. Check the backend console logs for detailed error messages
2. Run `node scripts/check-llm.js` to test the API connection
3. Verify your API key is active at https://console.groq.com/
4. Make sure your `.env` file is in the `Backend` directory (not the root)
5. Restart your server after changing `.env` file

