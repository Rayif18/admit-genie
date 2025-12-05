import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Service - Handles communication with various AI/LLM providers
 * Supports: Comet, Groq, Cohere, OpenAI, Hugging Face
 */

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'groq';
    this.setupProvider();
  }

  setupProvider() {
    switch (this.provider.toLowerCase()) {
      case 'comet':
        this.apiKey = process.env.COMET_API_KEY;
        this.apiUrl = process.env.COMET_API_URL || 'https://api.cometapi.com/v1/chat/completions';
        break;
      case 'groq':
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
        if (!this.apiKey) {
          console.warn('[LLM Service] GROQ_API_KEY not found in environment variables.');
          console.warn('[LLM Service] Please add GROQ_API_KEY=your_key_here to your .env file');
          console.warn('[LLM Service] Get your API key from: https://console.groq.com/');
        }
        break;
      case 'cohere':
        this.apiKey = process.env.COHERE_API_KEY;
        this.apiUrl = process.env.COHERE_API_URL || 'https://api.cohere.ai/v1/generate';
        break;
      case 'openai':
        this.apiKey = process.env.OPENAI_API_KEY;
        this.apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
        break;
      case 'huggingface':
        this.apiKey = process.env.HF_API_KEY;
        this.apiUrl = process.env.HF_API_URL;
        break;
      default:
        console.warn(`[LLM Service] Unknown provider: ${this.provider}. Using Groq as default.`);
        this.provider = 'groq';
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    }
    
    console.log(`[LLM Service] Initialized with provider: ${this.provider}`);
    console.log(`[LLM Service] API Key: ${this.apiKey ? 'Set (' + this.apiKey.substring(0, 10) + '...)' : 'NOT SET'}`);
  }

  /**
   * Build context from database for the chatbot
   */
  async buildContext(userQuery, dbContext = {}) {
    let context = `You are Admit Genie, an AI-powered admission assistant chatbot specializing in INDIAN college admissions. 
You have extensive knowledge about:
- Indian Institutes of Technology (IITs) - IIT Bombay, IIT Delhi, IIT Madras, IIT Kanpur, IIT Kharagpur, etc.
- National Institutes of Technology (NITs) - NIT Trichy, NIT Surathkal, NIT Rourkela, NIT Delhi, NIT Warangal, etc.
- State engineering colleges in Karnataka (RVCE, BMS, PES, MSRIT, etc.), Maharashtra (PICT, COEP, VJTI, etc.), Tamil Nadu, etc.
- Private engineering colleges (VIT, BITS Pilani, Manipal, etc.)
- Indian entrance exams: JEE Main, JEE Advanced, KCET, MHT-CET, COMEDK, VITEEE, BITSAT
- Indian admission processes: JOSAA, CSAB, KEA counseling, CAP process
- Indian reservation categories: General, OBC, SC, ST, EWS
- Indian college rankings: NIRF rankings, state-level rankings

You help students with:
- College information and rankings (focus on Indian colleges)
- Course details, eligibility, and fees (in Indian Rupees)
- Admission deadlines and processes (Indian admission cycles)
- CET/JEE rank-based college predictions
- Exam schedules and important dates (Indian exam calendar)
- Scholarship information (Indian government and private scholarships)

IMPORTANT: Always provide information specific to Indian colleges and admission processes. Use Indian terminology and context.

Current context from database:
`;

    if (dbContext.colleges && dbContext.colleges.length > 0) {
      context += `\nColleges: ${JSON.stringify(dbContext.colleges.slice(0, 10))}\n`;
    }
    if (dbContext.courses && dbContext.courses.length > 0) {
      context += `\nCourses: ${JSON.stringify(dbContext.courses.slice(0, 10))}\n`;
    }
    if (dbContext.exams && dbContext.exams.length > 0) {
      context += `\nExams: ${JSON.stringify(dbContext.exams)}\n`;
    }
    
    // Add Mangalore/Udupi region colleges context
    context += `\n\nIMPORTANT: You have access to comprehensive information about Mangalore and Udupi region colleges including:
- St Joseph Engineering College (SJEC), Mangaluru - KCET CSE cutoff: 4500-8000
- Mangalore Institute of Technology & Engineering (MITE) - KCET CSE cutoff: 5500-9500
- Canara Engineering College, Bantwal - KCET CSE cutoff: 7000-12000
- Srinivas Institute of Technology, Valachil - KCET CSE cutoff: 8500-14000
- Bearys Institute of Technology - KCET CSE cutoff: 10000-18000
- Yenepoya Institute of Technology, Moodbidri - KCET CSE cutoff: 12000-20000
- Alva's Institute of Engineering & Technology, Moodbidri - KCET CSE cutoff: 9500-16000
- PA College of Engineering, Nadupadavu - KCET CSE cutoff: 13000-22000
- And many more colleges in Karnataka with detailed cutoff information

When users ask about colleges, especially in Mangalore/Udupi region or Karnataka, provide specific details from the database context above.`;

    context += `\nUser Query: ${userQuery}\n\nProvide a helpful, accurate, and concise response. If you don't have specific information, say so politely and suggest how the user can find it.`;

    return context;
  }

  /**
   * Call LLM API based on provider
   */
  async callLLM(userQuery, dbContext = {}) {
    if (!this.apiKey) {
      const errorMsg = `API key not configured for provider: ${this.provider}. Please set ${this.provider.toUpperCase()}_API_KEY in your .env file.`;
      console.warn(`[LLM Service] ${errorMsg} Using fallback response.`);
      console.warn(`[LLM Service] To fix: Add ${this.provider.toUpperCase()}_API_KEY=your_api_key_here to Backend/.env`);
      return this.getFallbackResponse(userQuery);
    }

    const context = await this.buildContext(userQuery, dbContext);

    try {
      let result;
      switch (this.provider.toLowerCase()) {
        case 'groq':
        case 'openai':
        case 'comet':
          result = await this.callOpenAIFormat(context);
          break;
        case 'cohere':
          result = await this.callCohere(context);
          break;
        case 'huggingface':
          result = await this.callHuggingFace(context);
          break;
        default:
          result = await this.callOpenAIFormat(context);
      }
      console.log(`[LLM Service] Successfully got response from ${this.provider}`);
      return result;
    } catch (error) {
      console.error('[LLM Service] LLM API Error Details:', {
        provider: this.provider,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: this.apiUrl
      });
      
      // Log helpful troubleshooting info
      if (this.provider === 'groq') {
        console.error('[LLM Service] Troubleshooting tips:');
        console.error('  1. Verify your GROQ_API_KEY is correct in .env file');
        console.error('  2. Get a new API key from https://console.groq.com/');
        console.error('  3. Check if the model name is correct (try GROQ_MODEL=llama-3.1-8b-instant)');
        console.error('  4. Verify your API key has not expired');
      }
      
      // Fallback response
      return this.getFallbackResponse(userQuery);
    }
  }

  /**
   * Call OpenAI-format APIs (Groq, OpenAI, Comet)
   */
  async callOpenAIFormat(context) {
    try {
      // Use more reliable model names for Groq
      let model;
      if (this.provider === 'groq') {
        // Try newer models first, fallback to older ones
        model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
      } else if (this.provider === 'comet') {
        model = 'gpt-4o-mini';
      } else {
        model = 'gpt-3.5-turbo';
      }

      const requestBody = {
        model: model,
        messages: [
            {
              role: 'system',
              content: `You are Admit Genie, a specialized AI assistant for INDIAN college admissions. You have deep knowledge of:
- All IITs, NITs, and major engineering colleges in India
- Indian entrance exams (JEE Main, JEE Advanced, KCET, MHT-CET, COMEDK, etc.)
- Indian admission processes (JOSAA, CSAB, state counseling)
- Indian college rankings (NIRF, state rankings)
- Indian reservation system (General, OBC, SC, ST, EWS)
- Indian college fees, placements, and infrastructure

Always provide accurate, context-specific information about Indian colleges. Use Indian terminology, mention specific colleges by name when relevant, and provide practical advice for Indian students.`
            },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };

      console.log(`[LLM Service] Calling ${this.provider} API with model: ${model}`);

      const response = await axios.post(
        this.apiUrl,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      } else {
        console.error('Unexpected API response format:', JSON.stringify(response.data, null, 2));
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;
        
        console.error('LLM API Error Response:', {
          status: status,
          statusText: error.response.statusText,
          data: errorData,
          provider: this.provider,
          url: this.apiUrl
        });

        // Provide helpful error messages based on status code
        let errorMessage = `API Error (${status}): `;
        
        if (status === 401) {
          errorMessage += 'Invalid or missing API key. Please check your GROQ_API_KEY in .env file.';
        } else if (status === 400) {
          errorMessage += `Bad Request. ${errorData?.error?.message || JSON.stringify(errorData)}`;
          // If model not found, suggest alternatives
          if (errorData?.error?.message && errorData.error.message.includes('model')) {
            errorMessage += '\nTip: Try setting GROQ_MODEL=llama-3.1-8b-instant or llama-3.3-70b-versatile in .env';
          }
        } else if (status === 429) {
          errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (status === 500) {
          errorMessage += 'Server error. The API service may be temporarily unavailable.';
        } else {
          errorMessage += errorData?.error?.message || JSON.stringify(errorData);
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('LLM API Request Error:', {
          message: error.message,
          provider: this.provider,
          url: this.apiUrl
        });
        throw new Error(`Network error: Unable to reach ${this.provider} API. Check your internet connection.`);
      } else {
        console.error('LLM API Unknown Error:', error.message);
        throw error;
      }
    }
  }

  /**
   * Call Cohere API
   */
  async callCohere(context) {
    const response = await axios.post(
      this.apiUrl,
      {
        prompt: context,
        max_tokens: 1000,
        temperature: 0.7,
        model: 'command'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.generations[0].text;
  }

  /**
   * Call Hugging Face API
   */
  async callHuggingFace(context) {
    const response = await axios.post(
      this.apiUrl,
      {
        inputs: context,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return Array.isArray(response.data) 
      ? response.data[0].generated_text 
      : response.data.generated_text;
  }

  /**
   * Fallback response when API fails
   */
  getFallbackResponse(userQuery) {
    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('college') || lowerQuery.includes('institute')) {
      return "I can help you with college information! Please check our college listings or use the rank predictor to find colleges matching your CET rank. For specific details, you can browse our database or ask me more specific questions.";
    }
    
    if (lowerQuery.includes('course') || lowerQuery.includes('program')) {
      return "I can provide information about various courses! Please specify which course you're interested in (e.g., Computer Engineering, Mechanical Engineering) and I'll share details about eligibility, fees, and duration.";
    }
    
    if (lowerQuery.includes('fee') || lowerQuery.includes('cost')) {
      return "Fee structures vary by college and course. Please specify the college and course you're interested in, and I can provide detailed fee information.";
    }
    
    if (lowerQuery.includes('deadline') || lowerQuery.includes('admission')) {
      return "Admission deadlines vary by college and exam. Please check our exam schedules section or specify which college/exam you're asking about for accurate deadline information.";
    }
    
    if (lowerQuery.includes('rank') || lowerQuery.includes('cutoff')) {
      return "I can help you with rank-based predictions! Use our Rank Predictor tool by entering your CET rank, category, and preferred course. I'll show you colleges where you have a good chance of admission.";
    }
    
    return "I'm here to help with your college admission queries! I can assist with college information, course details, admission deadlines, fee structures, and rank-based predictions. Please ask me a specific question, and I'll do my best to help you.";
  }
}

export default new LLMService();

