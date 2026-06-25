/**
 * AssetFlow - Technician Schedule
 * Upcoming maintenance jobs and calendar view
 */

let scheduleJobs = [];
let filteredJobs = [];

async function loadTechnicianSchedule() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/schedule/technician');
    scheduleJobs = data || [];
  } catch (error) {
    // Demo data for Technician Schedule
    scheduleJobs = [
      {
        id: 401,
        date: "2026-06-22",
        asset: "HP EliteDesk 800 G9",
        description: "Preventive maintenance & cleaning",
        priority: "medium",
        status: "scheduled"
      },
      {
        id: 402,
        date: "2026-06-23",
        asset: "Canon imageCLASS Printer",
        description: "Fix paper jam mechanism",
        priority: "high",
        status: "scheduled"
      },
      {
        id: 403,
        date: "2026-06-25",
        asset: "Dell UltraSharp Monitor",
        description: "Check for screen flickering issue",
        priority: "low",
        status: "scheduled"
      },
      {
        id: 404,
        date: "2026-06-20",
        asset: "Fluke Multimeter 117",
        description: "Calibration check",
        priority: "medium",
        status: "overdue"
      }
    ];
  }

  filteredJobs = [...scheduleJobs];
  renderSchedule();
  updateScheduleStats();
}

function updateScheduleStats() {
  const thisWeek = scheduleJobs.length; // Demo
  const tomorrow = 3;
  const dueSoon = scheduleJobs.filter(j => j.priority === 'high').length;
  const completed = 11;

  document.getElementById('thisWeekCount').textContent = thisWeek;
  document.getElementById('tomorrowCount').textContent = tomorrow;
  document.getElementById('dueSoonCount').textContent = dueSoon;
  document.getElementById('completedCount').textContent = completed;
}

function renderSchedule() {
  const tbody = document.getElementById('scheduleTable');
  const showingText = document.getElementById('showingText');

  if (filteredJobs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>No upcoming maintenance jobs scheduled.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 jobs";
    return;
  }

  tbody.innerHTML = filteredJobs.map(job => `
    <tr>
      <td><strong>${job.date}</strong></td>
      <td>${job.asset}</td>
      <td>${job.description}</td>
      <td><span class="status-badge ${job.priority}">${job.priority.toUpperCase()}</span></td>
      <td><span class="status-badge ${job.status}">${getStatusLabel(job.status)}</span></td>
      <td>
        <button onclick="startJob(${job.id})" class="btn btn-secondary">Start Job</button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredJobs.length} jobs`;
}

function getStatusLabel(status) {
  const labels = {
    'scheduled': 'Scheduled',
    'overdue': 'Overdue'
  };
  return labels[status] || status;
}

window.startJob = function(id) {
  const job = scheduleJobs.find(j => j.id === id);
  if (job) {
    showToast(`Started job for ${job.asset}`, "success");
    // In real app, move to maintenance page or update status
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTechnicianSchedule);