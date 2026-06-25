/**
 * AssetFlow - All Assets Manager (Asset Manager View)
 */

let allAssetsManager = [];
let filteredAssetsManager = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

async function loadAllAssets() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const assets = await api.get('/assets');
    allAssetsManager = assets || [];
  } catch (error) {
    // Demo data
    allAssetsManager = [
      { id: 1, name: "MacBook Pro 16\" M3 Max", category: "laptop", status: "in-use", location: "hq", assigned_to: "Sarah Chen", updated_at: "2026-06-18" },
      { id: 2, name: "Dell UltraSharp 27\" Monitor", category: "peripheral", status: "available", location: "branch-a", assigned_to: null, updated_at: "2026-06-17" },
      { id: 3, name: "iPhone 15 Pro 256GB", category: "mobile", status: "in-use", location: "remote", assigned_to: "Mike Johnson", updated_at: "2026-06-16" },
      { id: 4, name: "HP EliteDesk 800 G9", category: "desktop", status: "maintenance", location: "hq", assigned_to: null, updated_at: "2026-06-15" },
      { id: 5, name: "Logitech MX Master 3S", category: "peripheral", status: "available", location: "branch-b", assigned_to: null, updated_at: "2026-06-14" },
      { id: 6, name: "Sony WH-1000XM5", category: "peripheral", status: "in-use", location: "hq", assigned_to: "Emily Davis", updated_at: "2026-06-13" },
    ];
  }

  filteredAssetsManager = [...allAssetsManager];
  renderAssetsTable();
}

function renderAssetsTable() {
  const tbody = document.getElementById('assetTable');
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageAssets = filteredAssetsManager.slice(start, end);

  if (pageAssets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <p>No assets found matching your criteria.</p>
        </td>
      </tr>`;
  } else {
    tbody.innerHTML = pageAssets.map(asset => `
      <tr>
        <td><input type="checkbox" class="asset-checkbox" data-id="${asset.id}"></td>
        <td><strong>${asset.name}</strong></td>
        <td>${asset.category || '—'}</td>
        <td><span class="status-badge ${asset.status}">${getStatusLabel(asset.status)}</span></td>
        <td>${getLocationLabel(asset.location)}</td>
        <td>${asset.assigned_to || '<span style="color:#9ca3af;">—</span>'}</td>
        <td>${asset.updated_at}</td>
        <td class="actions-col">
          <button onclick="editAsset(${asset.id})" class="btn btn-secondary" style="padding:4px 10px; font-size:0.85rem;">Edit</button>
          <button onclick="deleteAsset(${asset.id})" class="btn btn-secondary" style="padding:4px 10px; font-size:0.85rem; color:#dc2626;">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  updateShowingText();
}

function getStatusLabel(status) {
  const labels = {
    'available': 'Available',
    'in-use': 'In Use',
    'maintenance': 'Maintenance',
    'retired': 'Retired'
  };
  return labels[status] || status;
}

function getLocationLabel(loc) {
  const labels = {
    'hq': 'Headquarters',
    'branch-a': 'Branch A',
    'branch-b': 'Branch B',
    'remote': 'Remote'
  };
  return labels[loc] || loc;
}

function updateShowingText() {
  const showing = document.getElementById('showingText');
  if (showing) {
    showing.textContent = `Showing ${filteredAssetsManager.length} assets`;
  }
}

function searchAssets() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter').value;
  const categoryFilter = document.getElementById('categoryFilter').value;

  filteredAssetsManager = allAssetsManager.filter(asset => {
    const matchesSearch = !query || 
      asset.name.toLowerCase().includes(query) ||
      (asset.assigned_to && asset.assigned_to.toLowerCase().includes(query));

    const matchesStatus = !statusFilter || asset.status === statusFilter;
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  currentPage = 1;
  renderAssetsTable();
}

// Modal Functions
function openCreateAsset() {
  showToast("Add New Asset modal - Ready for implementation", "info");
  // You can reuse or expand the modal from assets.html
}

function editAsset(id) {
  showToast(`Edit asset #${id} - Feature coming soon`, "info");
}

function deleteAsset(id) {
  if (confirm("Delete this asset?")) {
    allAssetsManager = allAssetsManager.filter(a => a.id !== id);
    filteredAssetsManager = filteredAssetsManager.filter(a => a.id !== id);
    renderAssetsTable();
    showToast("Asset deleted successfully", "success");
  }
}

function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('.asset-checkbox');
  const selectAll = document.getElementById('selectAll');
  checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function exportAssets() {
  showToast("Exporting assets to CSV...", "success");
  // Future: Actual CSV download
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAllAssets();

  // Select all checkbox
  const selectAll = document.getElementById('selectAll');
  if (selectAll) selectAll.addEventListener('change', toggleSelectAll);
});