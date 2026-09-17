// utils/api.js

/**
 * @description Sends a login request and returns authentication data.
 * @param {string} email - User corporate email.
 * @param {string} password - User password.
 * @returns {Promise<Object>} Resolves with { jwt, userId, orgId, email, role, jwtExpiry }.
 * @throws {{status:number, message:string}} On HTTP error.
 */
async function apiLogin(email, password) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { status: response.status, message: err.message || 'Login failed' };
    }
    return await response.json();
  } catch (e) {
    if (e instanceof TypeError) {
      throw { status: 0, message: 'Network error' };
    }
    throw e;
  }
}

/**
 * @description Sends a batch of session objects to the backend.
 * @param {Array<Object>} sessions - Sessions to sync.
 * @param {string} jwt - Authentication token.
 * @returns {Promise<Object>} Resolves with { synced: number }.
 * @throws {{status:number, message:string}} On HTTP error.
 */
async function apiSyncSessions(sessions, jwt) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/sessions/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ sessions })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { status: response.status, message: err.message || 'Sync failed' };
    }
    return await response.json();
  } catch (e) {
    if (e instanceof TypeError) {
      throw { status: 0, message: 'Network error' };
    }
    throw e;
  }
}

/**
 * @description Retrieves the list of blocked domains for the user.
 * @param {string} jwt - Authentication token.
 * @returns {Promise<Object>} Resolves with { blockedDomains: string[] }.
 * @throws {{status:number, message:string}} On HTTP error.
 */
async function apiGetBlockedDomains(jwt) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/me/blocked-domains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { status: response.status, message: err.message || 'Failed to fetch blocked domains' };
    }
    return await response.json();
  } catch (e) {
    if (e instanceof TypeError) {
      throw { status: 0, message: 'Network error' };
    }
    throw e;
  }
}

// Expose globally for importScripts (service worker) environment
self.apiLogin = apiLogin;
self.apiSyncSessions = apiSyncSessions;
self.apiGetBlockedDomains = apiGetBlockedDomains;
