// auth/login.js

/**
 * Authentication state machine and UI logic for ShadowSentinel.
 */

const API_BASE = self.CONFIG?.API_BASE_URL || 'http://localhost:8080/api';

const state = {
  view: 'loading', // loading, login, register, forgot-password, verify
  isAuthenticating: false
};

const elements = {
  views: {
    loading: document.getElementById('view-loading'),
    login: document.getElementById('view-login'),
    register: document.getElementById('view-register'),
    forgotPassword: document.getElementById('view-forgot-password'),
    verify: document.getElementById('view-verify')
  },
  forms: {
    login: document.getElementById('login-form'),
    register: document.getElementById('register-form'),
    forgot: document.getElementById('forgot-form')
  }
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindEvents();
  await checkSession();
}

function switchView(viewName) {
  state.view = viewName;
  Object.values(elements.views).forEach(el => {
    if (el) el.classList.add('hidden');
  });
  if (elements.views[viewName]) {
    elements.views[viewName].classList.remove('hidden');
  }
}

async function checkSession() {
  try {
    const res = await new Promise(resolve => chrome.storage.local.get([CONFIG.STORAGE_KEYS.AUTH], resolve));
    const auth = res[CONFIG.STORAGE_KEYS.AUTH];
    if (auth && auth.jwt) {
      // Validate expiry
      const payload = JSON.parse(atob(auth.jwt.split('.')[1] || ''));
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp > nowSec) {
        // Valid session, go to dashboard
        goToDashboard();
        return;
      } else {
        // Expired
        await new Promise(resolve => chrome.storage.local.remove([CONFIG.STORAGE_KEYS.AUTH], resolve));
      }
    }
  } catch (e) {
    if (CONFIG.DEBUG) console.error('Session check error', e);
  }
  switchView('login');
}

function goToDashboard() {
  window.location.href = chrome.runtime.getURL('popup/popup.html');
}

function bindEvents() {
  // Navigation links
  document.getElementById('link-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('register');
  });
  document.getElementById('link-forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('forgot-password');
  });
  document.getElementById('back-from-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
  });
  document.getElementById('link-back-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
  });
  document.getElementById('link-back-from-forgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
  });

  // Password toggles
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const input = e.currentTarget.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = 'password';
      }
    });
  });

  // Forms
  elements.forms.login?.addEventListener('submit', handleLogin);
  elements.forms.register?.addEventListener('submit', handleRegister);
  elements.forms.forgot?.addEventListener('submit', handleForgot);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function setError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  if (state.isAuthenticating) return;
  
  clearErrors('login-form');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  
  let valid = true;
  if (!email) { setError('login-email-error', 'Enter your email.'); valid = false; }
  else if (!validateEmail(email)) { setError('login-email-error', 'Enter a valid email address.'); valid = false; }
  
  if (!password) { setError('login-password-error', 'Enter your password.'); valid = false; }
  
  if (!valid) return;

  const btn = document.getElementById('btn-login');
  setLoadingState(btn, 'Signing in...', true);
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Incorrect email or password.');
      }
      throw new Error('Unable to connect. Check your connection and try again.');
    }
    
    const data = await response.json();
    if (data.token) {
      await new Promise(resolve => {
        chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.AUTH]: { jwt: data.token, email } }, resolve);
      });
      goToDashboard();
    } else {
      throw new Error('Invalid server response.');
    }
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      setError('login-password-error', 'Unable to connect. Check your connection and try again.');
    } else {
      setError('login-password-error', err.message);
    }
  } finally {
    setLoadingState(btn, 'Sign in', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  if (state.isAuthenticating) return;
  
  clearErrors('register-form');
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const terms = document.getElementById('register-terms').checked;
  
  let valid = true;
  if (!email) { setError('register-email-error', 'Enter your email.'); valid = false; }
  else if (!validateEmail(email)) { setError('register-email-error', 'Enter a valid email address.'); valid = false; }
  
  if (!password) { setError('register-password-error', 'Enter your password.'); valid = false; }
  
  if (password && confirm && password !== confirm) {
    setError('register-confirm-error', 'Passwords do not match.');
    valid = false;
  }
  
  if (!terms) { setError('register-terms-error', 'You must agree to the Terms.'); valid = false; }
  
  if (!valid) return;

  const btn = document.getElementById('btn-register');
  setLoadingState(btn, 'Creating account...', true);
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Registration failed. Please try again.');
    
    // Switch to verification screen
    switchView('verify');
  } catch (err) {
    setError('register-password-error', err.message === 'Failed to fetch' ? 'Network error.' : err.message);
  } finally {
    setLoadingState(btn, 'Create account', false);
  }
}

async function handleForgot(e) {
  e.preventDefault();
  if (state.isAuthenticating) return;
  
  clearErrors('forgot-form');
  const email = document.getElementById('forgot-email').value.trim();
  
  let valid = true;
  if (!email) { setError('forgot-email-error', 'Enter your email.'); valid = false; }
  else if (!validateEmail(email)) { setError('forgot-email-error', 'Enter a valid email address.'); valid = false; }
  
  if (!valid) return;

  const btn = document.getElementById('btn-forgot');
  setLoadingState(btn, 'Sending...', true);
  
  try {
    await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    // Always show success to prevent email enumeration
    document.getElementById('forgot-form').classList.add('hidden');
    document.getElementById('forgot-desc').classList.add('hidden');
    document.getElementById('forgot-success').classList.remove('hidden');
  } catch (err) {
    setError('forgot-email-error', 'Network error. Try again.');
  } finally {
    setLoadingState(btn, 'Send reset link', false);
  }
}

function setLoadingState(btn, text, isLoading) {
  state.isAuthenticating = isLoading;
  if (btn) {
    btn.textContent = text;
    btn.disabled = isLoading;
  }
}
