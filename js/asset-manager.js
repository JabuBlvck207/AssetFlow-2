/**
 * AssetFlow - Manage Assignments (Asset Manager)
 */

let activeAssignments = [];
let filteredAssignments = [];

async function loadAssignments() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/assignments');
    activeAssignments = data || [];
  } catch (error) {
    // Demo data
    activeAssignments = [
      {
        id: 1,
        asset: "MacBook Pro 16\" M3 Max",
        assignedTo: "Sarah Chen",
        assignedDate: "2026-06-10",
        expectedReturn: "2026-07-10",
        status: "active"
      },
      {
        id: 2,
        asset: "Dell UltraSharp 27\" Monitor",
        assignedTo: "Mike Johnson",
        assignedDate: "2026-06-12",
        expectedReturn: "2026-06-28",
        status: "active"
      },
      {
        id: 3,
        asset: "iPhone 15 Pro 256GB",
        assignedTo: "Emily Davis",
        assignedDate: "2026-06-15",
        expectedReturn: "2026-08-01",
        status: "active"
      },
      {
        id: 4,
        asset: "Sony WH-1000XM5 Headphones",
        assignedTo: "Alex Wilson",
        assignedDate: "2026-06-18",
        expectedReturn: "2026-06-25",
        status: "active"
      }
    ];
  }

  filteredAssignments = [...activeAssignments];
  renderAssignments();
}

function renderAssignments() {
  const tbody = document.getElementById('assignmentsTable');
  const showingText = document.getElementById('showingText');

  if (filteredAssignments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>No active assignments found.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 assignments";
    return;
  }

  tbody.innerHTML = filteredAssignments.map(assignment => `
    <tr>
      <td><strong>${assignment.asset}</strong></td>
      <td>${assignment.assignedTo}</td>
      <td>${assignment.assignedDate}</td>
      <td>${assignment.expectedReturn}</td>
      <td><span class="status-badge ${assignment.status}">${assignment.status === 'active' ? 'Active' : assignment.status}</span></td>
      <td class="actions-col">
        <button onclick="revokeAssignment(${assignment.id})" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem; color: #dc2626;">
          Revoke
        </button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredAssignments.length} active assignment${filteredAssignments.length !== 1 ? 's' : ''}`;
}

function searchAssignments() {
  const query = document.getElementById('search').value.toLowerCase().trim();

  filteredAssignments = activeAssignments.filter(assignment => 
    assignment.asset.toLowerCase().includes(query) ||
    assignment.assignedTo.toLowerCase().includes(query)
  );

  renderAssignments();
}

window.revokeAssignment = function(id) {
  if (!confirm("Are you sure you want to revoke this assignment?")) return;

  activeAssignments = activeAssignments.filter(a => a.id !== id);
  filteredAssignments = filteredAssignments.filter(a => a.id !== id);
  renderAssignments();
  showToast("Assignment revoked successfully", "success");
};

// New Assignment Modal (Simple version)
window.openAssignModal = function() {
  showToast("New Assignment Modal - Ready for full implementation", "info");
  // You can expand this later with a full form modal
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAssignments();
});