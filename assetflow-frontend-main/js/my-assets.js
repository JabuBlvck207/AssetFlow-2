/**
 * AssetFlow My Assets Module
 * Shows only assets assigned to the current logged-in user (Staff focus)
 */

let myAssets = [];

/**
 * Load user's assigned assets
 */
async function loadMyAssets() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // In real backend: await api.get('/my-assets');
    myAssets = [
      {
        id: 101,
        name: "MacBook Pro 16\" M3 Max",
        status: "in-use",
        assignedDate: "2026-05-28",
        expectedReturn: "2026-07-15",
        location: "hq"
      },
      {
        id: 102,
        name: "iPhone 15 Pro 256GB",
        status: "in-use",
        assignedDate: "2026-06-01",
        expectedReturn: "2026-08-01",
        location: "remote"
      }
    ];

    renderMyAssets();
  } catch (error) {
    showToast("Unable to load your assets", "error");
    myAssets = [];
    renderMyAssets();
  }
}

function renderMyAssets() {
  const tbody = document.getElementById('myAssetsTable');
  if (!tbody) return;

  if (myAssets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <p>No assets currently assigned to you.</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = myAssets.map(asset => `
    <tr>
      <td><strong>${asset.name}</strong></td>
      <td><span class="status-badge ${asset.status}">${asset.status.toUpperCase()}</span></td>
      <td>${asset.assignedDate}</td>
      <td>${asset.expectedReturn}</td>
      <td>
        <button onclick="requestMaintenance(${asset.id})" class="btn btn-secondary btn-sm">Request Maintenance</button>
        <button onclick="requestTransfer(${asset.id})" class="btn btn-secondary btn-sm">Request Transfer</button>
      </td>
    </tr>
  `).join('');
}

// Staff can request maintenance for their own asset
function requestMaintenance(assetId) {
  if (confirm("Request maintenance for this asset?")) {
    showToast("Maintenance request submitted successfully!", "success");
    // In real app: api.post('/maintenance', { asset_id: assetId, requested_by: 'self' });
  }
}

function requestTransfer(assetId) {
  if (confirm("Request asset transfer / movement?")) {
    showToast("Transfer request submitted. Manager will review.", "success");
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadMyAssets();
});