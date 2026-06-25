/**
 * AssetFlow - Maintenance Manager (Asset Manager View)
 */

let maintenanceRecords = [];
let filteredRecords = [];

async function loadMaintenanceManager() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/maintenance');
    maintenanceRecords = data || [];
  } catch (error) {
    // Demo Data for Asset Manager
    maintenanceRecords = [
      {
        id: 101,
        asset: "HP EliteDesk 800 G9",
        issue: "Overheating during heavy load",
        type: "Corrective",
        status: "in-progress",
        priority: "high",
        dueDate: "2026-06-22",
        reportedBy: "Sarah Chen",
        technician: "James Wilson"
      },
      {
        id: 102,
        asset: "Dell PowerEdge Server",
        issue: "Routine hardware check",
        type: "Preventive",
        status: "scheduled",
        priority: "medium",
        dueDate: "2026-06-28",
        reportedBy: "System",
        technician: "Maria Garcia"
      },
      {
        id: 103,
        asset: "Canon imageCLASS Printer",
        issue: "Frequent paper jams",
        type: "Corrective",
        status: "overdue",
        priority: "high",
        dueDate: "2026-06-15",
        reportedBy: "Emily Davis",
        technician: "Robert Lee"
      },
      {
        id: 104,
        asset: "MacBook Pro 16\" M3 Max",
        issue: "Battery degradation",
        type: "Inspection",
        status: "completed",
        priority: "medium",
        dueDate: "2026-06-10",
        reportedBy: "Mike Johnson",
        technician: "James Wilson"
      }
    ];
  }

  filteredRecords = [...maintenanceRecords];
  renderMaintenanceTable();
  updateMaintenanceStats();
}

function updateMaintenanceStats() {
  const scheduled = maintenanceRecords.filter(r => r.status === 'scheduled').length;
  const inProgress = maintenanceRecords.filter(r => r.status === 'in-progress').length;
  const overdue = maintenanceRecords.filter(r => r.status === 'overdue').length;
  const completed = maintenanceRecords.filter(r => r.status === 'completed').length;

  document.getElementById('scheduledCount').textContent = scheduled;
  document.getElementById('overdueCount').textContent = overdue;
  document.getElementById('inProgressCount').textContent = inProgress;
  document.getElementById('completedCount').textContent = completed;
}

function renderMaintenanceTable() {
  const tbody = document.getElementById('maintenanceTable');
  const showingText = document.getElementById('showingText');

  if (filteredRecords.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <p>No maintenance requests found.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 requests";
    return;
  }

  tbody.innerHTML = filteredRecords.map(record => `
    <tr>
      <td><strong>${record.asset}</strong></td>
      <td>${record.issue}</td>
      <td>${record.reportedBy}</td>
      <td>${record.dueDate}</td>
      <td><span class="status-badge ${record.priority}">${record.priority.toUpperCase()}</span></td>
      <td><span class="status-badge ${record.status}">${getStatusLabel(record.status)}</span></td>
      <td>${record.technician}</td>
      <td>
        <button onclick="updateMaintenanceStatus(${record.id})" class="btn btn-secondary">Update</button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredRecords.length} requests`;
}

function getStatusLabel(status) {
  const labels = {
    'scheduled': 'Scheduled',
    'in-progress': 'In Progress',
    'overdue': 'Overdue',
    'completed': 'Completed'
  };
  return labels[status] || status;
}

function searchMaintenance() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter').value;
  const priorityFilter = document.getElementById('priorityFilter').value;

  filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = !query || 
      record.asset.toLowerCase().includes(query) ||
      record.issue.toLowerCase().includes(query) ||
      record.technician.toLowerCase().includes(query);

    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesPriority = !priorityFilter || record.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  renderMaintenanceTable();
}

window.openScheduleModal = function() {
  showToast("Schedule Maintenance modal is ready for full form implementation", "info");
};

window.updateMaintenanceStatus = function(id) {
  showToast(`Updating maintenance record #${id}`, "info");
};

// Initialize Page
document.addEventListener('DOMContentLoaded', loadMaintenanceManager);