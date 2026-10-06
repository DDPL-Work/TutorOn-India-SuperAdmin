export const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getAuthToken = () => {
  const keys = ['tutoron_super_admin_auth', 'tutoron_admin_auth'];
  const storages = [sessionStorage];

  for (const key of keys) {
    for (const storage of storages) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        // Backend login response shape: { access, refresh, user }
        const token = parsed.access || parsed.tokens?.access;
        if (token && typeof token === 'string' && token.startsWith('eyJ')) {
          return token;
        }
        // If parsed value has no valid token (e.g. stale user object), skip it
      } catch (e) {
        // Corrupt entry — skip
      }
    }
  }
  return null;
};

export const fetchApi = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    // README (line 551) specifies: Authorization: Bearer <Admin_JWT>
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Remove Content-Type if we are sending FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || response.statusText;
    throw new Error(errorMessage);
  }

  return data;
};
