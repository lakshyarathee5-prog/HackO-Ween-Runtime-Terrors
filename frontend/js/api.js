/**
 * FoodResQ AI — Universal REST API Client Layer
 * Connects all frontend views to the Node/Express MongoDB backend
 * Features automatic base URL detection, JWT authorization, error interception & fallback tolerance.
 */

const ApiClient = (function() {
  // Determine backend base URL candidates for rock-solid local & cross-origin resolution
  const candidateUrls = [];
  if (typeof window !== 'undefined') {
    if (window.location.port === '5001') {
      candidateUrls.push('/api');
    } else if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      candidateUrls.push(`${window.location.protocol}//${window.location.hostname}:5001/api`);
    }
  }
  // Standard development ports — 127.0.0.1 first to bypass macOS IPv6 localhost resolution delays
  candidateUrls.push('http://127.0.0.1:5001/api');
  candidateUrls.push('http://localhost:5001/api');

  let activeBaseIndex = 0;
  let baseURL = candidateUrls[0];

  const TOKEN_KEY = 'foodresq_jwt_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function getBaseUrl() {
    return candidateUrls[activeBaseIndex] || baseURL;
  }

  /**
   * Core HTTP request wrapper with automatic failover between localhost and 127.0.0.1
   */
  async function request(endpoint, options = {}, retryCandidate = true) {
    const currentBase = getBaseUrl();
    const url = `${currentBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('[ApiClient] Unauthorized session / token expired.');
        }
        const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.details = data.details;
        throw err;
      }

      return data;
    } catch (err) {
      // If network error (e.g. Failed to fetch) and we have alternative candidate URLs, try the next candidate
      if (!err.status && retryCandidate && activeBaseIndex < candidateUrls.length - 1) {
        activeBaseIndex++;
        console.warn(`[ApiClient] Retrying request on alternative URL: ${candidateUrls[activeBaseIndex]}`);
        return request(endpoint, options, false);
      }

      // Re-throw with network error indicator
      if (!err.status) {
        err.isNetworkError = true;
      }
      throw err;
    }
  }

  return {
    get baseURL() { return getBaseUrl(); },
    healthCheck: async () => {
      try {
        const res = await request('/health', { method: 'GET' });
        return { online: true, data: res };
      } catch (e) {
        return { online: false, error: e.message };
      }
    },
    getToken,
    setToken,
    getToken,
    setToken,

    // Authentication API
    auth: {
      register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
      login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
      getProfile: () => request('/auth/profile', { method: 'GET' }),
      logout: () => {
        setToken(null);
        return request('/auth/logout', { method: 'POST' }).catch(() => ({}));
      },
      simulatePersona: (role) => request(`/auth/simulate-persona/${role}`, { method: 'POST' })
    },

    // Food Surplus Listings API
    listings: {
      getAll: (params = '') => request(`/food-listings${params ? `?${params}` : ''}`, { method: 'GET' }),
      getById: (id) => request(`/food-listings/${id}`, { method: 'GET' }),
      create: (payload) => request('/food-listings', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/food-listings/${id}`, { method: 'PATCH', body: payload }),
      delete: (id) => request(`/food-listings/${id}`, { method: 'DELETE' })
    },

    // Recipient Demand API
    demand: {
      getAll: (params = '') => request(`/demand${params ? `?${params}` : ''}`, { method: 'GET' }),
      getById: (id) => request(`/demand/${id}`, { method: 'GET' }),
      create: (payload) => request('/demand', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/demand/${id}`, { method: 'PATCH', body: payload }),
      delete: (id) => request(`/demand/${id}`, { method: 'DELETE' })
    },

    // Smart Matching Engine API
    matching: {
      getSuggestions: () => request('/matching/suggestions', { method: 'GET' }),
      confirmPlan: (proposals) => request('/matching/confirm', { method: 'POST', body: { proposals } })
    },

    // Delivery Operations API
    deliveries: {
      getAll: (params = '') => request(`/deliveries${params ? `?${params}` : ''}`, { method: 'GET' }),
      getById: (id) => request(`/deliveries/${id}`, { method: 'GET' }),
      updateStatus: (id, status, note) => request(`/deliveries/${id}/status`, { method: 'PATCH', body: { status, note } }),
      assignDriver: (id, driverId) => request(`/deliveries/${id}/assign-driver`, { method: 'POST', body: { driverId } }),
      reassign: (id, payload) => request(`/deliveries/${id}/reassign`, { method: 'POST', body: payload }),
      reportIncident: (id, payload) => request(`/deliveries/${id}/report-incident`, { method: 'POST', body: payload }),
      proofOfDelivery: (id, payload) => request(`/deliveries/${id}/proof-of-delivery`, { method: 'POST', body: payload })
    },

    // Notifications System API
    notifications: {
      getAll: (params = '') => request(`/notifications${params ? `?${params}` : ''}`, { method: 'GET' }),
      getUnreadCount: () => request('/notifications/unread-count', { method: 'GET' }),
      markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
      markAllRead: () => request('/notifications/mark-all-read', { method: 'PATCH' })
    },

    // Fleet Drivers API
    drivers: {
      getAll: (params = '') => request(`/drivers${params ? `?${params}` : ''}`, { method: 'GET' }),
      getById: (id) => request(`/drivers/${id}`, { method: 'GET' }),
      updateStatus: (id, payload) => request(`/drivers/${id}/status`, { method: 'PATCH', body: payload })
    },

    // Stakeholder Organisations Directory API
    organisations: {
      getAll: (params = '') => request(`/organisations${params ? `?${params}` : ''}`, { method: 'GET' }),
      getById: (id) => request(`/organisations/${id}`, { method: 'GET' }),
      create: (payload) => request('/organisations', { method: 'POST', body: payload }),
      verify: (id) => request(`/organisations/${id}/verify`, { method: 'PATCH' }),
      suspend: (id) => request(`/organisations/${id}/suspend`, { method: 'PATCH' })
    },

    // AI Coordinator & Recovery Simulator API
    aiCoordinator: {
      getStatus: () => request('/ai-coordinator/status', { method: 'GET' }),
      getAnalysis: () => request('/ai-coordinator/summary-analysis', { method: 'GET' }),
      explainMatch: (payload = {}) => request('/ai-coordinator/explain-match', { method: 'POST', body: payload }),
      runExpiryCheck: () => request('/ai-coordinator/run-expiry-check', { method: 'POST' }),
      simulateRecovery: (payload = {}) => request('/ai-coordinator/simulate-recovery', { method: 'POST', body: payload }),
      resetSimulation: () => request('/ai-coordinator/reset-simulation', { method: 'POST' }),
      getIncidents: () => request('/incidents', { method: 'GET' }),
      getIncidentById: (id) => request(`/incidents/${id}`, { method: 'GET' })
    },

    // Dashboard & Analytics API
    analytics: {
      getSummary: () => request('/analytics/summary', { method: 'GET' }),
      getRoleSummary: (role = '') => request(`/analytics/role-summary?role=${encodeURIComponent(role)}`, { method: 'GET' }),
      getCategories: () => request('/analytics/categories', { method: 'GET' }),
      exportCsvUrl: () => `${baseURL}/analytics/export-csv`
    },

    // Forecasts API
    forecasts: {
      getAll: (horizon = 7) => request(`/forecasts?horizon=${horizon}`, { method: 'GET' })
    }
  };
})();

// Attach to window
if (typeof window !== 'undefined') {
  window.ApiClient = ApiClient;
}
