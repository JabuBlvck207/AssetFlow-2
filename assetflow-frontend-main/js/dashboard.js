/**
 * AssetFlow Dashboard Module
 * Loads and displays dashboard data
 */

async function loadDashboard() {
  // Check auth
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // Fetch dashboard stats
    const stats = await api.get('/dashboard/stats');

    // Update stat cards with animation
    animateValue('totalAssets', stats.total_assets || 0);
    animateValue('inUse', stats.in_use || 0);
    animateValue('available', stats.available || 0);
    animateValue('overdue', stats.overdue || 0);

    // Update asset count badge
    const assetCount = document.getElementById('assetCount');
    if (assetCount) assetCount.textContent = stats.total_assets || 0;

    // Load recent activity
    await loadRecentActivity();

  } catch (error) {
    console.error('Dashboard load failed:', error);
    showToast('Unable to load dashboard data. Please check your connection.', 'error');
    animateValue('totalAssets', 0);
    animateValue('inUse', 0);
    animateValue('available', 0);
    animateValue('overdue', 0);
    const assetCount = document.getElementById('assetCount');
    if (assetCount) assetCount.textContent = '0';
    await loadRecentActivity();
  }
}

/**
 * Animate number counting
 */
function animateValue(id, end) {
  const el = document.getElementById(id);
  if (!el) return;

  const duration = 1000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Load recent activity feed
 */
async function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  try {
    const activities = await api.get('/dashboard/activity');

    if (!activities || activities.length === 0) {
      container.innerHTML = '<p class="activity-empty">No recent activity</p>';
      return;
    }

    container.innerHTML = activities.map(activity => createActivityItem(activity)).join('');

  } catch {
    showToast('Unable to load recent activity.', 'error');
    container.innerHTML = '<p class="activity-empty">No recent activity available.</p>';
  }
}

function createActivityItem(activity) {
  const initials = activity.user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const actionColors = {
    assignment: 'var(--color-primary)',
    return: 'var(--color-success)',
    create: 'var(--color-purple)',
    update: 'var(--color-warning)',
    maintenance: 'var(--color-danger)'
  };

  return `
    <article class="activity-item">
      <div class="activity-avatar" style="background: ${actionColors[activity.type] || 'var(--color-primary)'}20; color: ${actionColors[activity.type] || 'var(--color-primary)'};">
        ${initials}
      </div>
      <div class="activity-content">
        <p><strong>${activity.user}</strong> ${activity.action} <strong>${activity.target}</strong></p>
        <time class="activity-time" datetime="${activity.time}">${activity.time}</time>
      </div>
    </article>
  `;
}

