// Centralized API client connecting to TutorOn India backend
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://tutoron.drdesigntech.com').replace(/\/+$/, '');

export const ACCESS_TOKEN_KEY = 'tutoron_access_token';
export const REFRESH_TOKEN_KEY = 'tutoron_refresh_token';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAuthTokens = (access, refresh, rememberMe = true) => {
  if (access) {
    if (rememberMe) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
    }
  }
  if (refresh) {
    if (rememberMe) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = { ...options.headers };
  const token = getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // 401 Unauthorized handling with token refresh
    if (response.status === 401 && !options._retry && getRefreshToken()) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          return request(endpoint, { ...options, _retry: true });
        });
      }

      options._retry = true;
      isRefreshing = true;

      const refresh = getRefreshToken();
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });

        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok && refreshData?.data?.access) {
          const newAccess = refreshData.data.access;
          setAuthTokens(newAccess, refresh, true);
          processQueue(null, newAccess);
          config.headers.Authorization = `Bearer ${newAccess}`;
          isRefreshing = false;
          return request(endpoint, options);
        } else {
          processQueue(new Error('Refresh token expired'));
          clearAuthTokens();
          isRefreshing = false;
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        clearAuthTokens();
        isRefreshing = false;
      }
    }

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.errors?.detail || (typeof data?.errors === 'string' ? data?.errors : JSON.stringify(data?.errors || '')) || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint;
    return request(finalUrl, { method: 'GET' });
  },

  post: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'POST', body, ...options });
  },

  put: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'PUT', body, ...options });
  },

  patch: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'PATCH', body, ...options });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  },
};

export default api;
