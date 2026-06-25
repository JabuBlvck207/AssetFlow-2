/**
 * AssetFlow - Staff Maintenance Page
 * Allows staff to view their requests and report new issues
 */

let staffMaintenanceRequests = [];
let filteredRequests = [];

async function loadStaffMaintenance() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/maintenance/staff');
    staffMaintenanceRequests = data || [];
  } catch (error) {
    // Demo data for Staff
    staffMaintenanceRequests = [
      {
        id: 501,
        asset: "MacBook Pro 16\" M3 Max",
        issue: "Battery drains too fast",
        reportedDate: "2026-06-10",
        priority: "medium",
        status: "in-progress"
      },
      {
        id: 502,
        asset: "Dell Latitude Laptop",
        issue: "Keyboard keys not responding",
        reportedDate: "2026-06-15",
        priority: "high",
        status: "pending"
      },
      {
        id: 503,
        asset: "Logitech MX Master 3S",
        issue: "Scroll wheel stuck",
        reportedDate: "2026-06-18",
        priority: "low",
        status: "completed"
      }
    ];
  }

  filteredRequests = [...staffMaintenanceRequests];
  renderStaffMaintenance();
  updateStaffMaintenanceStats();
}

function updateStaffMaintenanceStats() {
  const pending = staffMaintenanceRequests.filter(r => r.status === 'pending').length;
  const inProgress = staffMaintenanceRequests.filter(r => r.status === 'in-progress').length;
  const completed = staffMaintenanceRequests.filter(r => r.status === 'completed').length;

  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('inProgressCount').textContent = inProgress;
  document.getElementById('completedCount').textContent = completed;
}

function renderStaffMaintenance() {
  const tbody = document.getElementById('staffMaintenanceTable');
  const showingText = document.getElementById('showingText');

  if (filteredRequests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>You have no maintenance requests yet.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 requests";
    return;
  }

  tbody.innerHTML = filteredRequests.map(request => `
    <tr>
      <td><strong>${escapeHtml(request.asset)}</strong></td>
      <td>${escapeHtml(request.issue)}</td>
      <td>${escapeHtml(request.reportedDate)}</td>
      <td><span class="status-badge ${request.priority}">${request.priority.toUpperCase()}</span></td>
      <td><span class="status-badge ${request.status}">${getStatusLabel(request.status)}</span></td>
      <td>
        <button onclick="viewRequestDetails(${request.id})" class="btn btn-secondary">Details</button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredRequests.length} requests`;
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed'
  };
  return labels[status] || status;
}

// --- MODAL AND FORM SUBMISSION FUNCTIONALITY ---

window.openReportIssueModal = function() {
  const modal = document.getElementById('reportIssueModal');
  if (modal) {
    modal.showModal();
  }
};

window.closeReportIssueModal = function() {
  const modal = document.getElementById('reportIssueModal');
  const form = document.getElementById('reportIssueForm');
  if (modal) {
    modal.close();
  }
  if (form) {
    form.reset();
  }
};

async function handleReportIssueSubmit(event) {
  event.preventDefault();

  const assetSelect = document.getElementById('maintenanceAsset');
  const assetName = assetSelect.options[assetSelect.selectedIndex].text;
  const issueType = document.getElementById('issueCategory').value;
  const priority = document.getElementById('issuePriority').value;
  const description = document.getElementById('issueDescription').value;

  const payload = {
    asset: assetName,
    issue: `${issueType.toUpperCase()}: ${description}`,
    reportedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    priority: priority,
    status: 'pending'
  };

  try {
    const newRequest = await api.post('/maintenance/staff', payload);
    staffMaintenanceRequests.unshift(newRequest || payload);
    showToast("Maintenance issue reported successfully!", "success");
  } catch (error) {
    console.warn("API Error, falling back to local simulation:", error);
    // Push client-side simulated object if endpoint is unmapped
    payload.id = Date.now();
    staffMaintenanceRequests.unshift(payload);
    showToast("Issue reported locally!", "success");
  }

  // Refresh user interface elements
  filteredRequests = [...staffMaintenanceRequests];
  renderStaffMaintenance();
  updateStaffMaintenanceStats();
  closeReportIssueModal();
}

// --- HELPER FUNCTIONS ---

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.viewRequestDetails = function(id) {
  showToast(`Viewing details for request #${id}`, "info");
};

// Initialize listeners and fetch context arrays
document.addEventListener('DOMContentLoaded', () => {
  loadStaffMaintenance();

  const reportForm = document.getElementById('reportIssueForm');
  if (reportForm) {
    reportForm.addEventListener('submit', handleReportIssueSubmit);
  }
});