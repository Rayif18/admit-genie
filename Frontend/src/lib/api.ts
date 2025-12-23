// API Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// API Request wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    // Provide more specific error messages based on status code
    let errorMessage = data.message || 'An error occurred';
    
    if (response.status === 400) {
      errorMessage = data.message || 'Invalid request. Please check your input.';
    } else if (response.status === 401) {
      errorMessage = 'Authentication required. Please log in.';
    } else if (response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (response.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    cet_rank?: number;
    category?: string;
  }) => {
    const response = await apiRequest<{
      success: boolean;
      token: string;
      user: any;
    }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean;
      token: string;
      user: any;
    }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  getProfile: async () => {
    return apiRequest<{ success: boolean; user: any }>('/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (userData: any) => {
    return apiRequest<{ success: boolean; user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Chatbot API
export const chatbotAPI = {
  sendQuery: async (query: string) => {
    return apiRequest<{
      success: boolean;
      response: string;
      timestamp: string;
    }>('/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  getHistory: async () => {
    return apiRequest<{
      success: boolean;
      chats: any[];
      pagination: any;
    }>('/chatbot/history', {
      method: 'GET',
    });
  },
};

// Predictor API Types
export interface CourseOption {
  id: number;
  branch: string;
  fees_per_year: number | null;
  closing_rank: number | null;
  admissionProbability: number;
  category: "safe" | "moderate" | "reach" | "difficult";
  duration?: string;
  eligibility?: string;
}

export interface Prediction {
  college_id: number;
  college_name: string;
  location: string;
  ranking?: number;
  availableCourses: CourseOption[];
  defaultCourseId?: number | null;
}

export interface PredictionResponse {
  success: boolean;
  predictions: Prediction[];
  query: {
    rank: number;
    category: string;
    course: string | null;
  };
  message?: string;
}

// Predictor API
export const predictorAPI = {
  predict: async (rank: number, category: string, course?: string): Promise<PredictionResponse> => {
    return apiRequest<PredictionResponse>('/predictor/predict', {
      method: 'POST',
      body: JSON.stringify({ rank, category, course }),
    });
  },

  getHistory: async () => {
    return apiRequest<{
      success: boolean;
      predictions: any[];
    }>('/predictor/history', {
      method: 'GET',
    });
  },
};

// Colleges API
export const collegesAPI = {
  getAll: async (search?: string, location?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    
    return apiRequest<{
      success: boolean;
      colleges: any[];
      pagination: any;
    }>(`/colleges?${params.toString()}`, {
      method: 'GET',
    });
  },

  getById: async (id: number) => {
    return apiRequest<{
      success: boolean;
      college: any;
    }>(`/colleges/${id}`, {
      method: 'GET',
    });
  },
};

// Saved Colleges API
export const savedAPI = {
  save: async (collegeId: number, courseId?: number, notes?: string) => {
    return apiRequest<{
      success: boolean;
      saved: any;
    }>('/saved', {
      method: 'POST',
      body: JSON.stringify({ college_id: collegeId, course_id: courseId, notes }),
    });
  },

  getAll: async () => {
    return apiRequest<{
      success: boolean;
      saved: any[];
    }>('/saved', {
      method: 'GET',
    });
  },

  remove: async (id: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/saved/${id}`, {
      method: 'DELETE',
    });
  },
};

// Courses API
export const coursesAPI = {
  getAll: async (collegeId?: number, search?: string) => {
    const params = new URLSearchParams();
    if (collegeId) params.append('college_id', collegeId.toString());
    if (search) params.append('search', search);
    
    return apiRequest<{
      success: boolean;
      courses: any[];
    }>(`/courses?${params.toString()}`, {
      method: 'GET',
    });
  },
};

// Exams API
export const examsAPI = {
  getAll: async () => {
    return apiRequest<{
      success: boolean;
      exams: any[];
    }>('/exams', {
      method: 'GET',
    });
  },
};

export default {
  authAPI,
  chatbotAPI,
  predictorAPI,
  collegesAPI,
  savedAPI,
  coursesAPI,
  examsAPI,
};

