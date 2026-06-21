/**
 * AssetFlow - Staff Dashboard
 * Personal overview with alerts and quick actions
 */

let staffDashboardData = {};

async function loadStaffDashboard() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/dashboard/staff');
    staffDashboardData = data || {};
  } catch (error) {
    // Demo data for Staff
    staffDashboardData = {
      myAssetsCount: 2,
      dueSoonCount: 1,
      overdueCount: 0,
      returnedCount: 3,
      alerts: [
        {
          id: 1,
          message: "MacBook Pro return due in 3 days",
          type: "warning",
          time: "2 hours ago"
        },
        {
          id: 2,
          message: "New company policy on asset returns",
          type: "info",
          time: "Yesterday"
        }
      ],
      currentAssets: [
        {
          id: 501,
          name: "Dell Latitude Laptop",
          status: "in-use",
          dueDate: "2026-06-28"
        },
        {
          id: 502,
          name: "Logitech Wireless Mouse",
          status: "in-use",
          dueDate: "2026-07-05"
        }
      ]
    };
  }

  renderStaffDashboard();
}

function renderStaffDashboard() {
  // Update Stats
  document.getElementById('myAssetsCount').textContent = staffDashboardData.myAssetsCount || 0;
  document.getElementById('dueSoonCount').textContent = staffDashboardData.dueSoonCount || 0;
  document.getElementById('overdueCount').textContent = staffDashboardData.overdueCount || 0;
  document.getElementById('returnedCount').textContent = staffDashboardData.returnedCount || 0;

  // Render Alerts
  renderStaffAlerts();

  // Render Current Assets
  renderCurrentAssets();
}

function renderStaffAlerts() {
  const container = document.getElementById('staffAlerts');
  if (!container) return;

  const alerts = staffDashboardData.alerts || [];

  if (alerts.length === 0) {
    container.innerHTML = `<p class="activity-empty">No alerts at the moment.</p>`;
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: ${alert.type === 'warning' ? '#fee2e2' : '#dbeafe'}; color: ${alert.type === 'warning' ? '#dc2626' : '#2563eb'};">
        ${alert.type === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div class="activity-content">
        <p>${alert.message}</p>
        <time class="activity-time">${alert.time}</time>
      </div>
    </div>
  `).join('');
}

function renderCurrentAssets() {
  const container = document.getElementById('staffAssets');
  if (!container) return;

  const assets = staffDashboardData.currentAssets || [];

  if (assets.length === 0) {
    container.innerHTML = `<p class="activity-empty">You have no assets currently assigned.</p>`;
    return;
  }

  container.innerHTML = assets.map(asset => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: #dbeafe; color: #2563eb;">
        💻
      </div>
      <div class="activity-content">
        <p><strong>${asset.name}</strong></p>
        <span class="status-badge ${asset.status}">In Use</span>
        <time class="activity-time">Return by ${asset.dueDate}</time>
      </div>
    </div>
  `).join('');
}

window.requestNewAsset = function() {
  showToast("Asset Request form opened (coming soon)", "info");
};

// Initialize
document.addEventListener('DOMContentLoaded', loadStaffDashboard);