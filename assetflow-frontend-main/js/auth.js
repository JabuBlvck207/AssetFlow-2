const AUTH_TOKEN_KEY = 'token';
const LEGACY_TOKEN_KEY = 'assetflow_token';

function setAuthToken(token) {
  if (!token) return;
  api.setToken?.(token);
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function saveUserProfile(user) {
  if (!user) return;

  const profile = {
    name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    email: user.email,
    role: user.role || user.user_role || user.role_name,
    initials: user.initials || (user.name || user.email || 'AssetFlow User')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase()
  };

  localStorage.setItem('user', JSON.stringify(profile));
}

function hydrateUserProfile() {
  const user = api.getCurrentUser?.();
  if (!user) return;

  document.getElementById('userInitials')?.textContent = user.initials || 'US';
  document.getElementById('userName')?.textContent = user.name || user.email || 'AssetFlow User';
  document.getElementById('userRole')?.textContent = user.role || 'Staff';
}

function highlightActiveSidebarLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isActive = href === currentPage || (href === 'dashboard.html' && currentPage === '') || (href === 'dashboard.html' && currentPage === 'dashboard.html');
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function setupSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (!sidebar || !toggle) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('open');
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', (!expanded).toString());
  });
}

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach((button) => {
    const input = button.closest('.password-wrapper')?.querySelector('input');
    if (!input) return;
    button.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
    });
  });
}

function setupCurrencySelector() {
  const currencySelect = document.getElementById('currencySelect');
  if (!currencySelect || !api.getCurrencyOptions) return;

  currencySelect.innerHTML = api.getCurrencyOptions()
    .map(option => `<option value="${option.code}">${option.label}</option>`)
    .join('');
  currencySelect.value = api.getSelectedCurrency();

  currencySelect.addEventListener('change', (event) => {
    const value = event.target.value;
    api.setSelectedCurrency(value);
    showToast(`Currency set to ${value}`, 'success');

    if (typeof loadReports === 'function') {
      loadReports();
    }
    if (typeof loadMaintenance === 'function') {
      loadMaintenance();
    }
  });
}

function redirectAuthenticatedUser() {
  const currentPage = window.location.pathname.split('/').pop();
  const token = api.getCurrentUser?.() && api.isAuthenticated?.();
  if (token && (currentPage === 'index.html' || currentPage === 'register.html' || currentPage === '')) {
    window.location.href = 'dashboard.html';
  }
}

function attachAuthForms() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn?.classList.add('loading');
      submitBtn?.setAttribute('disabled', 'true');

      const email = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password')?.value;

      try {
        const result = await api.post('/auth/login', { email, password });
        const token = result?.access_token || result?.token || result?.data?.token;
        if (!token) throw new Error('Login did not return a valid token.');
        setAuthToken(token);
        const user = result?.user || result?.data?.user || result?.data || null;
        saveUserProfile(user);
        showToast('Signed in successfully!', 'success');
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Login error', error);
        showToast(error.message || 'Login failed. Please try again.', 'error');
      } finally {
        submitBtn?.classList.remove('loading');
        submitBtn?.removeAttribute('disabled');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn?.classList.add('loading');
      submitBtn?.setAttribute('disabled', 'true');

      const firstName = document.getElementById('firstName')?.value.trim();
      const lastName = document.getElementById('lastName')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password')?.value;
      const confirmPassword = document.getElementById('confirmPassword')?.value;

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        submitBtn?.classList.remove('loading');
        submitBtn?.removeAttribute('disabled');
        return;
      }

      try {
        const result = await api.post('/auth/register', { first_name: firstName, last_name: lastName, email, password });
        const token = result?.access_token || result?.token || result?.data?.token;
        if (!token) throw new Error('Registration did not return a valid token.');
        setAuthToken(token);
        const user = result?.user || result?.data?.user || result?.data || { name: `${firstName} ${lastName}`.trim(), email, role: 'Staff' };
        saveUserProfile(user);
        showToast('Account created successfully!', 'success');
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Register error', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
      } finally {
        submitBtn?.classList.remove('loading');
        submitBtn?.removeAttribute('disabled');
      }
    });
  }
}

function setupGlobalUI() {
  hydrateUserProfile();
  highlightActiveSidebarLink();
  setupSidebarToggle();
  setupPasswordToggles();
  setupCurrencySelector();
  attachAuthForms();
  redirectAuthenticatedUser();
}

document.addEventListener('DOMContentLoaded', setupGlobalUI);
