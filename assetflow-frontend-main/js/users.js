/**
 * AssetFlow Users Management Module (Admin Only)
 */

let allUsers = [];

/**
 * Load all users (Admin only)
 */
async function loadUsers() {
  if (!isAuthenticated() || !api.permissions.isAdmin()) {
    showToast("Access denied. Admin privileges required.", "error");
    window.location.href = "dashboard.html";
    return;
  }

  try {
    // In real backend: await api.get('/users');
    allUsers = [
      { id: 1, name: "Sarah Chen", email: "sarah@company.com", role: "manager", status: "active" },
      { id: 2, name: "Mike Johnson", email: "mike@company.com", role: "staff", status: "active" },
      { id: 3, name: "Emily Davis", email: "emily@company.com", role: "technician", status: "active" },
      { id: 4, name: "Alex Wilson", email: "alex@company.com", role: "staff", status: "inactive" }
    ];

    renderUsers();
  } catch (error) {
    showToast("Unable to load users", "error");
  }
}

function renderUsers() {
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;

  tbody.innerHTML = allUsers.map(user => `
    <tr>
      <td><strong>${user.name}</strong></td>
      <td>${user.email}</td>
      <td><span class="status-badge ${user.role}">${user.role.toUpperCase()}</span></td>
      <td><span class="status-badge ${user.status}">${user.status.toUpperCase()}</span></td>
      <td>
        <button onclick="editUser(${user.id})" class="btn btn-secondary btn-sm">Edit</button>
        <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openNewUserModal() {
  showToast("Add new user form - Coming soon (Admin only)", "info");
}

function editUser(id) {
  showToast(`Edit user ${id} - Coming soon`, "info");
}

function deleteUser(id) {
  if (confirm("Delete this user?")) {
    allUsers = allUsers.filter(u => u.id !== id);
    renderUsers();
    showToast("User deleted successfully", "success");
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadUsers);