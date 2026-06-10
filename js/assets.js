/**
 * AssetFlow Assets Module
 * Manages asset listing, search, and CRUD operations
 */

let allAssets = [];
let filteredAssets = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

async function loadAssets() {
  // Check auth
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const assets = await api.get('/assets');
    allAssets = assets || [];
    filteredAssets = [...allAssets];

    // Update asset count badge
    const assetCount = document.getElementById('assetCount');
    if (assetCount) assetCount.textContent = allAssets.length;

    renderAssets();
  } catch (error) {
    showToast('Unable to load assets. Please check your connection.', 'error');
    allAssets = [];
    filteredAssets = [];

    const assetCount = document.getElementById('assetCount');
    if (assetCount) assetCount.textContent = '0';

    renderAssets();
  }
}

function renderAssets() {
  const tbody = document.getElementById('assetTable');
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageAssets = filteredAssets.slice(start, end);

  if (pageAssets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-gray-400);">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <p>No assets found</p>
            <span>Try adjusting your search or filters</span>
          </div>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = pageAssets.map(asset => createAssetRow(asset)).join('');
  }

  // Update meta
  const showingText = document.getElementById('showingText');
  if (showingText) {
    showingText.textContent = `Showing ${filteredAssets.length} asset${filteredAssets.length !== 1 ? 's' : ''}`;
  }

  // Update pagination
  updatePagination();
}

function createAssetRow(asset) {
  const statusLabels = {
    'available': 'Available',
    'in-use': 'In Use',
    'maintenance': 'Maintenance',
    'retired': 'Retired'
  };

  const locationLabels = {
    'hq': 'Headquarters',
    'branch-a': 'Branch A',
    'branch-b': 'Branch B',
    'remote': 'Remote'
  };

  const date = new Date(asset.updated_at);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `
    <tr data-id="${asset.id}">
      <td>
        <label class="checkbox-label table-checkbox">
          <input type="checkbox" aria-label="Select ${asset.name}">
          <span class="checkmark"></span>
        </label>
      </td>
      <td>
        <strong>${asset.name}</strong>
      </td>
      <td>
        <span class="status-badge ${asset.status}">${statusLabels[asset.status] || asset.status}</span>
      </td>
      <td>${locationLabels[asset.location] || asset.location}</td>
      <td>${asset.assigned_to || '<span style="color: var(--color-gray-400);">—</span>'}</td>
      <td>${formattedDate}</td>
      <td>
        <div class="row-actions">
          <button onclick="editAsset(${asset.id})" aria-label="Edit ${asset.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onclick="deleteAsset(${asset.id})" aria-label="Delete ${asset.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function updatePagination() {
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginationText = document.getElementById('paginationText');
  if (paginationText) {
    paginationText.textContent = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;
  }
}

function searchAssets() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter')?.value;
  const locationFilter = document.getElementById('locationFilter')?.value;

  filteredAssets = allAssets.filter(asset => {
    const matchesSearch = !query || 
      asset.name.toLowerCase().includes(query) ||
      (asset.location && asset.location.toLowerCase().includes(query)) ||
      (asset.assigned_to && asset.assigned_to.toLowerCase().includes(query));

    const matchesStatus = !statusFilter || asset.status === statusFilter;
    const matchesLocation = !locationFilter || asset.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  currentPage = 1;
  renderAssets();
}

function openCreateAsset() {
  const modal = document.getElementById('createAssetModal');
  if (modal) {
    modal.showModal();
    document.getElementById('assetName')?.focus();
  }
}

function closeCreateAsset() {
  const modal = document.getElementById('createAssetModal');
  if (modal) {
    modal.close();
    document.getElementById('createAssetForm')?.reset();
  }
}

// Handle create asset form
document.addEventListener('DOMContentLoaded', () => {
  const createForm = document.getElementById('createAssetForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = createForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      const data = {
        name: document.getElementById('assetName').value,
        category: document.getElementById('assetCategory').value,
        status: document.getElementById('assetStatus').value,
        location: document.getElementById('assetLocation').value,
        description: document.getElementById('assetDescription').value
      };

      try {
        await api.post('/assets', data);
        showToast('Asset created successfully!', 'success');
        closeCreateAsset();
        loadAssets();
      } catch (error) {
        showToast('Could not create asset. Please try again.', 'error');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // Filter change listeners
  document.getElementById('statusFilter')?.addEventListener('change', searchAssets);
  document.getElementById('locationFilter')?.addEventListener('change', searchAssets);

  // Select all checkbox
  document.getElementById('selectAll')?.addEventListener('change', (e) => {
    document.querySelectorAll('.data-table tbody input[type="checkbox"]').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  // Close modal on backdrop click
  const modal = document.getElementById('createAssetModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCreateAsset();
    });
  }
});

function editAsset(id) {
  showToast(`Edit asset ${id} - Coming soon`, 'info');
}

function deleteAsset(id) {
  if (!confirm('Are you sure you want to delete this asset?')) return;

  api.delete(`/assets/${id}`)
    .then(() => {
      allAssets = allAssets.filter(a => a.id !== id);
      filteredAssets = [...allAssets];
      renderAssets();
      showToast('Asset deleted successfully', 'success');
    })
    .catch(() => {
      showToast('Could not delete asset. Please try again.', 'error');
    });
}
