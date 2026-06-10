/**
 * AssetFlow Google Authentication
 * Handles Google OAuth login flow
 */

document.addEventListener('DOMContentLoaded', () => {
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // Show loading state
      googleBtn.classList.add('loading');
      googleBtn.disabled = true;

      // Redirect to backend OAuth endpoint
      window.location.href = "http://localhost:8000/api/auth/google/login";
    });
  }

  // Handle OAuth callback (token in URL)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    localStorage.setItem('token', token);
    showToast('Signed in with Google!', 'success');

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  }

  // Handle OAuth error
  const error = urlParams.get('error');
  if (error) {
    showToast(decodeURIComponent(error), 'error');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
