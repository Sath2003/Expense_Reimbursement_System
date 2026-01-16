// API utility for handling authenticated requests with token management

// Try to determine the correct API URL
const getAPIBaseURL = () => {
  // If we're in the browser, try to use the current hostname/port
  if (typeof window !== 'undefined') {
    // In development, connect to localhost:8000
    // In production, would use the same hostname as the frontend
    return 'http://localhost:8000/api';
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getAPIBaseURL();

console.log('API Base URL:', API_BASE_URL);

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const headers: Record<string, string> = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Don't set Content-Type if FormData is being used (browser will set it automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`API Call: ${options.method || 'GET'} ${url}${attempt > 0 ? ` (Attempt ${attempt + 1}/${maxRetries})` : ''}`);
      console.log('Headers:', headers);
      
      let response = await fetch(url, {
        ...options,
        headers,
      }).catch(err => {
        console.error(`Fetch failed (attempt ${attempt + 1}):`, err);
        throw err;
      });

      // If token is invalid or expired, try to refresh
      if (response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        const refreshed = await refreshToken();
        
        if (refreshed) {
          const newToken = localStorage.getItem('token');
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          response = await fetch(url, {
            ...options,
            headers: newHeaders,
          });
        } else {
          // Redirect to login if refresh fails
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        console.error(`All ${maxRetries} attempts failed. Final error:`, lastError);
        throw new Error(`Unable to connect to server at ${API_BASE_URL}. Please ensure the backend is running. Error: ${lastError.message}`);
      }
      
      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delayMs = 500 * Math.pow(2, attempt);
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Unknown API error');
}

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      console.log('Token refreshed successfully');
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
}

export async function fetchJSON<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await apiCall(endpoint, options);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function testConnection(): Promise<boolean> {
  try {
    console.log('Testing connection to:', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    console.log('Health check response:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}
