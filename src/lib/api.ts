import { auth } from './firebase';

// API base URL - In production, this should be your backend URL
const API_BASE = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:5000/api';
  // : 'https://nfc-business-card-be.onrender.com/api';

// Track ongoing token refresh to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Set auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// Remove auth token
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

// Refresh auth token using Firebase with concurrency control
export async function refreshAuthToken(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    console.log('Token refresh already in progress, waiting...');
    return refreshPromise;
  }
  
  isRefreshing = true;
  refreshPromise = performTokenRefresh();
  
  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

// Internal function to perform the actual token refresh
async function performTokenRefresh(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('Refreshing Firebase token...');
    
    // Force refresh the token
    const newToken = await user.getIdToken(true);
    setAuthToken(newToken);
    
    console.log('Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

// Handle authentication failure
export async function handleAuthFailure(): Promise<void> {
  try {
    // Clear stored token
    removeAuthToken();
    
    // Sign out from Firebase
    if (auth.currentUser) {
      await auth.signOut();
    }
    
    // Redirect to login page (for client-side)
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error handling auth failure:', error);
  }
}

// API request helper with automatic token refresh interceptor
export async function apiRequest(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // Handle token expiration (401 Unauthorized)
    if (response.status === 401 && !isRetry) {
      console.log('Token expired, attempting to refresh...');
      
      try {
        // Attempt to refresh the token
        const newToken = await refreshAuthToken();
        
        if (newToken) {
          console.log('Token refreshed successfully, retrying request...');
          
          // Update the authorization header with the new token
          const retryOptions: RequestInit = {
            ...mergedOptions,
            headers: {
              ...mergedOptions.headers,
              'Authorization': `Bearer ${newToken}`
            }
          };
          
          // Retry the original request with the new token
          return await apiRequest(endpoint, { ...options, headers: retryOptions.headers }, true);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Token refresh failed, redirect to login
        await handleAuthFailure();
        throw new Error('Session expired. Please login again.');
      }
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    // Check if response is binary (image, etc.)
    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
      return await response.arrayBuffer();
    }
    
    // Default to JSON
    return await response.json();
  } catch (error: any) {
    console.error('API request failed:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Connection failed. Please check if the backend server is running and if any browser extensions are blocking the request.');
    }
    
    throw error;
  }
}

// User profile functions
export async function getUserProfile() {
  return await apiRequest('/users/profile');
}

export async function updateUserProfile(profileData: any) {
  return await apiRequest('/users/profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
}

export async function createUserProfile(profileData: any) {
  return await apiRequest('/users/profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
}

// Connection functions
export async function getConnections() {
  return await apiRequest('/connections');
}

export async function getReceivedConnections(page: number = 1, limit: number = 20) {
  return await apiRequest(`/connections/received?page=${page}&limit=${limit}`);
}

export async function getSentConnections(page: number = 1, limit: number = 20) {
  return await apiRequest(`/connections/sent?page=${page}&limit=${limit}`);
}

export async function addConnection(connectionData: any) {
  return await apiRequest('/connections/save', {
    method: 'POST',
    body: JSON.stringify(connectionData)
  });
}

export async function getConnectionStats() {
  return await apiRequest('/connections/stats');
}

export async function deleteConnection(connectionId: string) {
  return await apiRequest(`/connections/${connectionId}`, {
    method: 'DELETE'
  });
} 