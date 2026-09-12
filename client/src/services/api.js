const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('villagemart_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const safeParseJson = async (res) => {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    // Return empty fallback if JSON parsing fails
  }
  return null;
};

export const api = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: getHeaders()
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        return { success: false, message: data?.message || 'API request failed' };
      }
      return data || { success: true };
    } catch (err) {
      console.warn(`API GET ${endpoint} failed:`, err.message);
      return { success: false, message: err.message };
    }
  },

  async post(endpoint, body, isFormData = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body)
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        return { success: false, message: data?.message || 'API request failed' };
      }
      return data || { success: true };
    } catch (err) {
      console.warn(`API POST ${endpoint} failed:`, err.message);
      return { success: false, message: err.message };
    }
  },

  async put(endpoint, body, isFormData = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body)
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        return { success: false, message: data?.message || 'API request failed' };
      }
      return data || { success: true };
    } catch (err) {
      console.warn(`API PUT ${endpoint} failed:`, err.message);
      return { success: false, message: err.message };
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        return { success: false, message: data?.message || 'API request failed' };
      }
      return data || { success: true };
    } catch (err) {
      console.warn(`API DELETE ${endpoint} failed:`, err.message);
      return { success: false, message: err.message };
    }
  }
};
