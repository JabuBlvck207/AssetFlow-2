/**
 * AssetFlow - My Assigned Assets (Technician View)
 */

let technicianAssets = [];
let filteredTechnicianAssets = [];

async function loadTechnicianAssets() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await api.get('/my-assets/technician');
    technicianAssets = data || [];
  } catch (error) {
    // Demo data for Technician
    technicianAssets = [
      {
        id: 301,
        name: "HP EliteDesk 800 G9",
        category: "desktop",
        status: "in-use",
        assignedDate: "2026-06-10",
        expectedReturn: "2026-06-25",
        notes: "For field diagnostics"
      },
      {
        id: 302,
        name: "Fluke Multimeter 117",
        category: "tool",
        status: "in-use",
        assignedDate: "2026-06-12",
        expectedReturn: "2026-07-05",
        notes: ""
      },
      {
        id: 303,
        name: "Dell Latitude Laptop",
        category: "laptop",
        status: "in-use",
        assignedDate: "2026-06-15",
        expectedReturn: "2026-06-28",
        notes: "Software testing"
      }
    ];
  }

  filteredTechnicianAssets = [...technicianAssets];
  renderTechnicianAssets();
}

function renderTechnicianAssets() {
  const tbody = document.getElementById('myAssetsTable');
  const showingText = document.getElementById('showingText');

  if (filteredTechnicianAssets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <p>You currently have no assets assigned.</p>
          <span class="field-hint">New assignments will appear here.</span>
        </td>
      </tr>`;
    showingText.textContent = "Showing 0 assets";
    return;
  }

  tbody.innerHTML = filteredTechnicianAssets.map(asset => `
    <tr>
      <td><strong>${asset.name}</strong></td>
      <td>${asset.category || '—'}</td>
      <td><span class="status-badge ${asset.status}">${asset.status === 'in-use' ? 'In Use' : asset.status}</span></td>
      <td>${asset.assignedDate}</td>
      <td>${asset.expectedReturn}</td>
      <td>
        <button onclick="returnAsset(${asset.id})" class="btn btn-secondary" style="padding: 6px 14px;">
          Return Asset
        </button>
      </td>
    </tr>
  `).join('');

  showingText.textContent = `Showing ${filteredTechnicianAssets.length} asset${filteredTechnicianAssets.length !== 1 ? 's' : ''}`;
}

window.returnAsset = function(id) {
  if (!confirm("Are you sure you want to return this asset?")) return;

  technicianAssets = technicianAssets.filter(a => a.id !== id);
  filteredTechnicianAssets = filteredTechnicianAssets.filter(a => a.id !== id);

  renderTechnicianAssets();
  showToast("Asset returned successfully!", "success");
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTechnicianAssets);