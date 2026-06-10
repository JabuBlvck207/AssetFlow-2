/**
 * AssetFlow API Wrapper with Role-Based Access Control
 */

const API_URL = "http://localhost:8000/api";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Get stored JWT token
 */
function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("assetflow_token");
}

function setToken(token) {
  if (!token) return;
  localStorage.setItem("token", token);
  localStorage.removeItem("assetflow_token");
}

/**
 * Decode JWT and get user info (including role)
 */
function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const firstName = payload.first_name || payload.given_name || payload.name?.split(' ')[0] || storedUser?.name?.split(' ')[0] || payload.email?.split('@')[0] || '';
    const lastName = payload.last_name || payload.family_name || (payload.name ? payload.name.split(' ').slice(1).join(' ') : storedUser?.name?.split(' ').slice(1).join(' ') || '');
    const fullName = payload.name || storedUser?.name || [firstName, lastName].filter(Boolean).join(' ') || payload.email || 'AssetFlow User';
    const normalizedRole = (payload.role || payload.user_role || payload.role_name || storedUser?.role || 'staff').toString().toLowerCase();
    const roleLabel = normalizedRole === 'admin' || normalizedRole === 'administrator'
      ? 'Administrator'
      : normalizedRole === 'manager'
        ? 'Manager'
        : 'Staff';
    const initials = (storedUser?.initials || fullName)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(namePart => namePart[0])
      .join('')
      .toUpperCase() || 'US';

    return {
      id: payload.sub || payload.user_id,
      email: payload.email || storedUser?.email,
      name: fullName,
      role: roleLabel,
      initials
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const user = getCurrentUser();
  if (!user) return false;

  try {
    const payload = JSON.parse(atob(getToken().split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Role-based permission checks
 */
const userPermissions = {
  canCreateAsset: () => ['admin', 'manager'].includes(getCurrentUser()?.role),
  canEditAsset: () => ['admin', 'manager'].includes(getCurrentUser()?.role),
  canDeleteAsset: () => getCurrentUser()?.role === 'admin',
  canViewAllAssets: () => true,
  isAdmin: () => getCurrentUser()?.role === 'admin'
};

const DEFAULT_CURRENCY = 'ZAR';
const CURRENCY_CONFIG = {
  ZAR: { locale: 'en-ZA', currency: 'ZAR', name: 'South African Rand' },
  USD: { locale: 'en-US', currency: 'USD', name: 'US Dollar' },
  EUR: { locale: 'de-DE', currency: 'EUR', name: 'Euro' },
  GBP: { locale: 'en-GB', currency: 'GBP', name: 'British Pound' },
  JPY: { locale: 'ja-JP', currency: 'JPY', name: 'Japanese Yen' },
  CNY: { locale: 'zh-CN', currency: 'CNY', name: 'Chinese Yuan' }
};

function getSelectedCurrency() {
  const stored = localStorage.getItem('currency');
  return stored && CURRENCY_CONFIG[stored] ? stored : DEFAULT_CURRENCY;
}

function setSelectedCurrency(currency) {
  if (!CURRENCY_CONFIG[currency]) return;
  localStorage.setItem('currency', currency);
}

function formatCurrency(amount, currency = getSelectedCurrency()) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getCurrencyOptions() {
  return Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
    code,
    label: `${code} — ${config.name}`
  }));
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
  toast.querySelector('.toast-close').onclick = () => toast.remove();
}

/**
 * Main API request function
 */
async function request(endpoint, method = "GET", data = null, retries = MAX_RETRIES) {
  const token = getToken();
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(API_URL + endpoint, options);

    if (res.status === 401) {
      localStorage.removeItem("token");
      showToast("Session expired. Please sign in again.", "error");
      window.location.href = "index.html";
      return null;
    }

    if (res.status === 403) {
      showToast("You don't have permission to perform this action.", "error");
      return null;
    }

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.detail || `Error ${res.status}`);
    }

    return result;

  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return request(endpoint, method, data, retries - 1);
    }

    showToast(error.message || "Request failed", "error");
    throw error;
  }
}

// Public API
const api = {
  get: (endpoint) => request(endpoint, "GET"),
  post: (endpoint, data) => request(endpoint, "POST", data),
  put: (endpoint, data) => request(endpoint, "PUT", data),
  delete: (endpoint) => request(endpoint, "DELETE"),
  setToken,
  // Expose user info and permissions
  getCurrentUser,
  isAuthenticated,
  permissions: userPermissions,
  getSelectedCurrency,
  setSelectedCurrency,
  formatCurrency,
  getCurrencyOptions
};