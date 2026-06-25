/**
 * AssetFlow - Technician Dashboard
 * Personal overview with alerts and quick actions
 */

let technicianDashboardData = {};

async function loadTechnicianDashboard() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/dashboard/technician');
    technicianDashboardData = data || {};
  } catch (error) {
    // Demo data for Technician
    technicianDashboardData = {
      myAssetsCount: 3,
      pendingTasks: 4,
      overdueTasks: 1,
      completedThisWeek: 6,
      urgentAlerts: [
        {
          id: 1,
          asset: "HP EliteDesk 800 G9",
          message: "Overheating reported - Check cooling system",
          priority: "high",
          time: "2 hours ago"
        },
        {
          id: 2,
          asset: "Canon Printer",
          message: "Frequent paper jams",
          priority: "medium",
          time: "Yesterday"
        }
      ],
      myTasks: [
        {
          id: 101,
          asset: "Dell UltraSharp Monitor",
          issue: "Screen flickering",
          status: "in-progress",
          dueDate: "Tomorrow"
        },
        {
          id: 102,
          asset: "Logitech Mouse",
          issue: "Battery not charging",
          status: "pending",
          dueDate: "Jun 23"
        }
      ]
    };
  }

  renderTechnicianDashboard();
}

function renderTechnicianDashboard() {
  // Update Stats
  document.getElementById('myAssetsCount').textContent = technicianDashboardData.myAssetsCount || 0;
  document.getElementById('pendingTasks').textContent = technicianDashboardData.pendingTasks || 0;
  document.getElementById('overdueTasks').textContent = technicianDashboardData.overdueTasks || 0;
  document.getElementById('completedThisWeek').textContent = technicianDashboardData.completedThisWeek || 0;

  // Render Urgent Alerts
  renderUrgentAlerts();

  // Render My Open Tasks
  renderMyTasks();
}

function renderUrgentAlerts() {
  const container = document.getElementById('urgentAlerts');
  if (!container) return;

  const alerts = technicianDashboardData.urgentAlerts || [];

  if (alerts.length === 0) {
    container.innerHTML = `<p class="activity-empty">No urgent alerts at the moment.</p>`;
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: #fee2e2; color: #dc2626;">
        ⚠️
      </div>
      <div class="activity-content">
        <p><strong>${alert.asset}</strong></p>
        <p style="margin-top: 4px; color: var(--color-gray-700);">${alert.message}</p>
        <time class="activity-time">${alert.time}</time>
      </div>
    </div>
  `).join('');
}

function renderMyTasks() {
  const container = document.getElementById('myTasks');
  if (!container) return;

  const tasks = technicianDashboardData.myTasks || [];

  if (tasks.length === 0) {
    container.innerHTML = `<p class="activity-empty">No open tasks.</p>`;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="activity-item">
      <div class="activity-avatar" style="background: #dbeafe; color: #2563eb;">
        🛠️
      </div>
      <div class="activity-content">
        <p><strong>${task.asset}</strong> — ${task.issue}</p>
        <span class="status-badge ${task.status}">${task.status === 'in-progress' ? 'In Progress' : 'Pending'}</span>
        <time class="activity-time">Due: ${task.dueDate}</time>
      </div>
    </div>
  `).join('');
}

window.reportIssue = function() {
  showToast("Report New Issue - Feature ready for implementation", "info");
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTechnicianDashboard);