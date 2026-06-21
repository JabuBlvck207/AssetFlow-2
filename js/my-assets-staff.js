/**
 * AssetFlow - My Assigned Assets (Staff Version)
 */

let myAssets = [];

async function loadMyAssets() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    // Real API call would go here: await api.get('/my-assets');
    myAssets = [
      {
        id: 101,
        name: "MacBook Pro 16\" M3 Max",
        status: "in-use",
        assignedDate: "2026-05-28",
        expectedReturn: "2026-07-15"
      },
      {
        id: 103,
        name: "iPhone 15 Pro 256GB",
        status: "in-use",
        assignedDate: "2026-06-01",
        expectedReturn: "2026-08-01"
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
          <p>You currently have no assets assigned.</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = myAssets.map(asset => `
    <tr>
      <td><strong>${asset.name}</strong></td>
      <td><span class="status-badge ${asset.status}">${asset.status.toUpperCase().replace('-', ' ')}</span></td>
      <td>${asset.assignedDate}</td>
      <td>${asset.expectedReturn}</td>
      <td>
        <button onclick="returnAsset(${asset.id})" class="btn btn-secondary">Return Asset</button>
      </td>
    </tr>
  `).join('');
}

window.returnAsset = function(id) {
  if (confirm("Return this asset?")) {
    myAssets = myAssets.filter(a => a.id !== id);
    renderMyAssets();
    showToast("Asset return request submitted successfully!", "success");
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadMyAssets);