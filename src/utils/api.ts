import { Bug, BugFormData, BugStats } from '../types/bug';
import { User, LoginFormData, RegisterFormData } from '../types/user';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message);
  }
  return response.json();
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Bug API functions
export const bugApi = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    priority?: string; 
    search?: string; 
  }): Promise<{ bugs: Bug[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/bugs?${queryParams}`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Bug> => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`);
    return handleResponse(response);
  },

  create: async (bugData: BugFormData): Promise<Bug> => {
    const response = await fetch(`${API_BASE_URL}/bugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(bugData),
    });
    return handleResponse(response);
  },

  update: async (id: string, bugData: Partial<BugFormData & { status: Bug['status'] }>): Promise<Bug> => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(bugData),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bugs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    await handleResponse(response);
  },

  getStats: async (): Promise<BugStats> => {
    const response = await fetch(`${API_BASE_URL}/bugs/stats`);
    return handleResponse(response);
  },
};

// User API functions
export const userApi = {
  register: async (userData: RegisterFormData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials: LoginFormData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

export { ApiError };