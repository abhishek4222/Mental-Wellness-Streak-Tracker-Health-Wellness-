import type { Habit, HabitLog, UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface DBStatus {
  connected: boolean;
  database: string;
  error?: string;
}

const getAuthHeaders = (includeJson = false): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const apiService = {
  // Check MongoDB & Express connection status
  async checkStatus(): Promise<DBStatus> {
    try {
      const response = await fetch(`${API_URL}/status`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('Server returned error');
      const data = await response.json();
      return {
        connected: data.database === 'connected' || data.database === 'connecting',
        database: data.database,
      };
    } catch (err) {
      return {
        connected: false,
        database: 'disconnected',
        error: err instanceof Error ? err.message : 'Offline',
      };
    }
  },

  // Auth
  async register(payload: { name: string; email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Registration failed');
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Login failed');
    return data;
  },

  async verifyOTP(payload: { email: string; otp: string }) {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'OTP verification failed');
    return data;
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Habits
  async getHabits(): Promise<Habit[]> {
    const response = await fetch(`${API_URL}/habits`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch habits');
    return response.json();
  },

  async createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'isArchived' | 'currentProgress'>): Promise<Habit> {
    const response = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(habitData),
    });
    if (!response.ok) throw new Error('Failed to create habit');
    return response.json();
  },

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update habit');
    return response.json();
  },

  async deleteHabit(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete habit');
  },

  // Logs
  async getLogs(date?: string, habitId?: string): Promise<HabitLog[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (habitId) params.append('habitId', habitId);
    
    const response = await fetch(`${API_URL}/logs?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  async upsertLog(logData: {
    habitId: string;
    date: string;
    completed: boolean;
    progress: number;
    mood?: number;
    isFrozen?: boolean;
  }): Promise<HabitLog> {
    const response = await fetch(`${API_URL}/logs/upsert`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      let errBody: any = null;
      try {
        errBody = await response.json();
      } catch (e) {
        try {
          errBody = await response.text();
        } catch (e2) {
          errBody = null;
        }
      }
      const msg = errBody && errBody.error ? errBody.error : (typeof errBody === 'string' ? errBody : `HTTP ${response.status}`);
      throw new Error(`Failed to log habit: ${msg}`);
    }

    return response.json();
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};
