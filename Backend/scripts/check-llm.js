// Quick script to test LLM API connection
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const provider = process.env.LLM_PROVIDER || 'groq';
let apiKey, apiUrl;

switch (provider.toLowerCase()) {
  case 'groq':
    apiKey = process.env.GROQ_API_KEY;
    apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    break;
  case 'comet':
    apiKey = process.env.COMET_API_KEY;
    apiUrl = process.env.COMET_API_URL || 'https://api.cometapi.com/v1/chat/completions';
    break;
  case 'openai':
    apiKey = process.env.OPENAI_API_KEY;
    apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    break;
  default:
    console.error('Unknown provider:', provider);
    process.exit(1);
}

console.log('Testing LLM API Connection...');
console.log('Provider:', provider);
console.log('API URL:', apiUrl);
console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');

if (!apiKey) {
  console.error('\n❌ ERROR: API key not set!');
  console.log('Please set the API key in your .env file:');
  console.log(`  ${provider.toUpperCase()}_API_KEY=your_api_key_here`);
  process.exit(1);
}

// Use more reliable model for Groq
const model = provider === 'groq' 
  ? (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')
  : 'gpt-3.5-turbo';

const testQuery = {
  model: model,
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Say hello in one sentence.'
    }
  ],
  temperature: 0.7,
  max_tokens: 100
};

console.log('Model:', model);

console.log('\nSending test request...');

axios.post(apiUrl, testQuery, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
})
  .then(response => {
    console.log('\n✅ SUCCESS! API is working.');
    console.log('Response:', response.data.choices[0].message.content);
  })
  .catch(error => {
    console.error('\n❌ ERROR: API call failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  });

