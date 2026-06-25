/**
 * AssetFlow - Staff Asset Requests
 * View requests and submit new asset requests
 */

let staffRequests = [];
let filteredRequests = [];

async function loadStaffRequests() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/requests/staff');
    staffRequests = data || [];
  } catch (error) {
    // Demo data
    staffRequests = [
      {
        id: 601,
        item: "MacBook Air M3",
        category: "laptop",
        reason: "Current laptop is slow and outdated",
        requestDate: "2026-06-10",
        status: "approved"
      },
      {
        id: 602,
        item: "27\" External Monitor",
        category: "peripheral",
        reason: "Need second screen for development",
        requestDate: "2026-06-15",
        status: "under-review"
      },
      {
        id: 603,
        item: "Wireless Noise-Cancelling Headphones",
        category: "peripheral",
        reason: "For better focus during calls",
        requestDate: "2026-06-18",
        status: "pending"
      }
    ];
  }

  filteredRequests = [...staffRequests];
  renderStaffRequests();
  updateStaffRequestsStats();
}

function updateStaffRequestsStats() {
  const pending = staffRequests.filter(r => r.status === 'pending').length;
  const review = staffRequests.filter(r => r.status === 'under-review').length;
  const approved = staffRequests.filter(r => r.status === 'approved').length;

  document.getElementById('pendingRequests').textContent = pending;
  document.getElementById('reviewRequests').textContent = review;
  document.getElementById('approvedRequests').textContent = approved;
}

function renderStaffRequests() {
  const tbody = document.getElementById('requestsTable');
  const showingText = document.getElementById('showingText');

  if (filteredRequests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>You have not made any requests yet.</p>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 requests";
    return;
  }

  tbody.innerHTML = filteredRequests.map(request => `
    <tr>
      <td><strong>${request.item}</strong></td>
      <td>${request.category}</td>
      <td>${request.reason}</td>
      <td>${request.requestDate}</td>
      <td><span class="status-badge ${request.status}">${getStatusLabel(request.status)}</span></td>
      <td>
        <button onclick="viewRequest(${request.id})" class="btn btn-secondary">View</button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredRequests.length} requests`;
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending',
    'under-review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return labels[status] || status;
}

// Modal Functions
window.openNewRequestModal = function() {
  const modal = document.getElementById('newRequestModal');
  if (modal) {
    modal.showModal();
    document.getElementById('requestItem').focus();
  }
};

window.closeNewRequestModal = function() {
  const modal = document.getElementById('newRequestModal');
  if (modal) modal.close();
};

document.addEventListener('DOMContentLoaded', () => {
  loadStaffRequests();

  // Handle form submission
  const requestForm = document.getElementById('newRequestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const item = document.getElementById('requestItem').value.trim();
      const category = document.getElementById('requestCategory').value;
      const reason = document.getElementById('requestReason').value.trim();

      if (!item || !category || !reason) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      // Simulate submission
      const newRequest = {
        id: Date.now(),
        item: item,
        category: category,
        reason: reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      staffRequests.unshift(newRequest);
      filteredRequests = [...staffRequests];

      renderStaffRequests();
      updateStaffRequestsStats();

      showToast("Request submitted successfully! A manager will review it.", "success");
      closeNewRequestModal();
      requestForm.reset();
    });
  }
});

window.viewRequest = function(id) {
  showToast(`Viewing details for request #${id} (coming soon)`, "info");
};