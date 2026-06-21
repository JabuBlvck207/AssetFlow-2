/**
 * AssetFlow - Asset Manager Dashboard
 * Enhanced dashboard with manager-level insights
 */

let managerDashboardData = {};

// Main initialization
async function loadManagerDashboard() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // Simulate API call
    const data = await api.get('/dashboard/manager');
    managerDashboardData = data || {};
  } catch (error) {
    // Demo data for prototype
    managerDashboardData = {
      totalAssets: 248,
      inUse: 186,
      available: 52,
      overdue: 10,
      teamMembers: 42,
      recentAssignments: [
        { id: 1, asset: "MacBook Pro 16\" M3", assignedTo: "Sarah Chen", date: "2 hours ago" },
        { id: 2, asset: "Dell UltraSharp Monitor", assignedTo: "Mike Johnson", date: "Yesterday" },
        { id: 3, asset: "iPhone 15 Pro", assignedTo: "Emily Davis", date: "2 days ago" }
      ],
      maintenanceAlerts: [
        { id: 1, asset: "HP EliteDesk 800", issue: "Overheating", priority: "High", date: "Today" },
        { id: 2, asset: "Canon Printer", issue: "Paper Jam", priority: "Medium", date: "2 days ago" },
        { id: 3, asset: "Server Rack A", issue: "High CPU Usage", priority: "High", date: "3 days ago" }
      ]
    };
  }

  renderDashboard();
}

// Render all sections
function renderDashboard() {
  // Stats
  animateValue('totalAssets', managerDashboardData.totalAssets || 248);
  animateValue('inUse', managerDashboardData.inUse || 186);
  animateValue('available', managerDashboardData.available || 52);
  animateValue('overdue', managerDashboardData.overdue || 10);
  animateValue('teamMembers', managerDashboardData.teamMembers || 42);

  // Update badge counts
  const totalAssetsCount = document.getElementById('totalAssetsCount');
  if (totalAssetsCount) totalAssetsCount.textContent = managerDashboardData.totalAssets || 248;

  const maintenanceBadge = document.getElementById('maintenanceBadge');
  if (maintenanceBadge) maintenanceBadge.textContent = managerDashboardData.maintenanceAlerts?.length || 3;

  // Recent Assignments
  renderRecentAssignments();

  // Maintenance Alerts
  renderMaintenanceAlerts();
}

// Render Recent Assignments
function renderRecentAssignments() {
  const container = document.getElementById('recentAssignments');
  if (!container) return;

  const items = managerDashboardData.recentAssignments || [];
  
  if (items.length === 0) {
    container.innerHTML = `<p class="activity-empty">No recent assignments</p>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: #dbeafe; color: #2563eb;">
        📋
      </div>
      <div class="activity-content">
        <p><strong>${item.asset}</strong> assigned to <strong>${item.assignedTo}</strong></p>
        <time class="activity-time">${item.date}</time>
      </div>
    </div>
  `).join('');
}

// Render Maintenance Alerts
function renderMaintenanceAlerts() {
  const container = document.getElementById('maintenanceAlerts');
  if (!container) return;

  const alerts = managerDashboardData.maintenanceAlerts || [];
  
  if (alerts.length === 0) {
    container.innerHTML = `<p class="activity-empty">No pending maintenance</p>`;
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: #fee2e2; color: #dc2626;">
        ⚠️
      </div>
      <div class="activity-content">
        <p><strong>${alert.asset}</strong> - ${alert.issue}</p>
        <span class="status-badge ${alert.priority.toLowerCase() === 'high' ? 'maintenance' : 'in-use'}">
          ${alert.priority}
        </span>
        <time class="activity-time">${alert.date}</time>
      </div>
    </div>
  `).join('');
}

// Number animation function (reused from dashboard)
function animateValue(id, end) {
  const el = document.getElementById(id);
  if (!el) return;

  const duration = 1200;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOut);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadManagerDashboard);