// Test script to verify API connections
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API Connections...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Endpoint...');
  try {
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check:', health.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Register a test user
  console.log('\n2. Testing User Registration...');
  try {
    const register = await axios.post(`${API_BASE}/users/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    });
    console.log('✅ Registration successful');
    const token = register.data.token;
    console.log('   Token received:', token ? 'Yes' : 'No');
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }

  // Test 3: Chatbot Query
  console.log('\n3. Testing Chatbot API...');
  try {
    const chatbot = await axios.post(`${API_BASE}/chatbot/query`, {
      query: 'What are the top engineering colleges?'
    });
    console.log('✅ Chatbot response received');
    console.log('   Response length:', chatbot.data.response?.length || 0);
    console.log('   Response preview:', chatbot.data.response?.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Chatbot failed:', error.response?.data || error.message);
  }

  // Test 4: Predictor
  console.log('\n4. Testing Predictor API...');
  try {
    const predictor = await axios.post(`${API_BASE}/predictor/predict`, {
      rank: 1500,
      category: 'General',
      course: 'Computer Science Engineering'
    });
    console.log('✅ Predictor response received');
    console.log('   Predictions found:', predictor.data.predictions?.length || 0);
    if (predictor.data.predictions && predictor.data.predictions.length > 0) {
      console.log('   First prediction:', predictor.data.predictions[0].college_name);
    } else {
      console.log('   ⚠️  No predictions found - database may need sample data');
    }
  } catch (error) {
    console.error('❌ Predictor failed:', error.response?.data || error.message);
  }

  // Test 5: Check LLM Configuration
  console.log('\n5. Checking LLM Configuration...');
  const provider = process.env.LLM_PROVIDER || 'groq';
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.COMET_API_KEY;
  console.log(`   Provider: ${provider}`);
  console.log(`   API Key: ${apiKey ? 'Set (' + apiKey.substring(0, 10) + '...)' : 'NOT SET'}`);
  
  if (!apiKey) {
    console.log('   ⚠️  WARNING: No API key found. Chatbot will use fallback responses.');
    console.log('   Set LLM_PROVIDER and corresponding API key in .env file');
  }

  console.log('\n✅ API Testing Complete!');
}

testAPI().catch(console.error);

