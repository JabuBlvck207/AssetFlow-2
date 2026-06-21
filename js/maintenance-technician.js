/**
 * AssetFlow - Maintenance Technician View
 * Focused on work orders assigned to the technician
 */

let technicianTasks = [];
let filteredTasks = [];

async function loadTechnicianMaintenance() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/maintenance/technician');
    technicianTasks = data || [];
  } catch (error) {
    // Demo data for Technician
    technicianTasks = [
      {
        id: 201,
        asset: "HP EliteDesk 800 G9",
        issue: "Overheating and slow performance",
        priority: "high",
        dueDate: "2026-06-22",
        status: "in-progress",
        notes: "Check cooling system"
      },
      {
        id: 202,
        asset: "Canon imageCLASS Printer",
        issue: "Paper jam and printing errors",
        priority: "medium",
        dueDate: "2026-06-23",
        status: "pending",
        notes: ""
      },
      {
        id: 203,
        asset: "Dell UltraSharp Monitor",
        issue: "Screen flickering",
        priority: "low",
        dueDate: "2026-06-25",
        status: "pending",
        notes: "Check cable connection"
      },
      {
        id: 204,
        asset: "Logitech MX Master 3S",
        issue: "Battery not holding charge",
        priority: "medium",
        dueDate: "2026-06-20",
        status: "overdue",
        notes: ""
      }
    ];
  }

  filteredTasks = [...technicianTasks];
  renderTechnicianTasks();
  updateTechnicianStats();
}

function updateTechnicianStats() {
  const pending = technicianTasks.filter(t => t.status === 'pending').length;
  const inProgress = technicianTasks.filter(t => t.status === 'in-progress').length;
  const overdue = technicianTasks.filter(t => t.status === 'overdue').length;
  const completedToday = 2; // Demo value

  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('inProgressCount').textContent = inProgress;
  document.getElementById('overdueCount').textContent = overdue;
  document.getElementById('completedToday').textContent = completedToday;
}

function renderTechnicianTasks() {
  const tbody = document.getElementById('technicianMaintenanceTable');
  const showingText = document.getElementById('showingText');

  if (filteredTasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>You have no maintenance tasks assigned.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 tasks";
    return;
  }

  tbody.innerHTML = filteredTasks.map(task => `
    <tr>
      <td><strong>${task.asset}</strong></td>
      <td>${task.issue}</td>
      <td><span class="status-badge ${task.priority}">${task.priority.toUpperCase()}</span></td>
      <td>${task.dueDate}</td>
      <td><span class="status-badge ${task.status}">${getStatusLabel(task.status)}</span></td>
      <td>
        <button onclick="startTask(${task.id})" class="btn btn-secondary">Start</button>
        <button onclick="completeTask(${task.id})" class="btn btn-primary">Complete</button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredTasks.length} tasks`;
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'overdue': 'Overdue',
    'completed': 'Completed'
  };
  return labels[status] || status;
}

function searchMaintenance() {
  // You can add search input later if needed
  renderTechnicianTasks();
}

window.startTask = function(id) {
  const task = technicianTasks.find(t => t.id === id);
  if (task) {
    task.status = 'in-progress';
    showToast(`Started work on ${task.asset}`, "success");
    renderTechnicianTasks();
    updateTechnicianStats();
  }
};

window.completeTask = function(id) {
  if (!confirm("Mark this task as completed?")) return;

  const task = technicianTasks.find(t => t.id === id);
  if (task) {
    task.status = 'completed';
    showToast(`Task completed: ${task.asset}`, "success");
    renderTechnicianTasks();
    updateTechnicianStats();
  }
};

window.markAllCompleted = function() {
  if (!confirm("Mark all pending tasks as completed?")) return;
  
  technicianTasks.forEach(task => {
    if (task.status === 'pending' || task.status === 'in-progress') {
      task.status = 'completed';
    }
  });
  
  showToast("All tasks marked as completed!", "success");
  renderTechnicianTasks();
  updateTechnicianStats();
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTechnicianMaintenance);