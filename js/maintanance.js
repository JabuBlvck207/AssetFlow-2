/**
 * AssetFlow Maintenance Module
 * Manages maintenance scheduling, tracking, and history
 */

let allRecords = [];
let filteredRecords = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

/**
 * Load maintenance records from API
 */
async function loadMaintenance() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const records = await api.get('/maintenance');
        allRecords = records || [];
        filteredRecords = [...allRecords];
        updateStats();
        renderRecords();
        loadUpcoming();
        loadHistory();
    } catch (error) {
        showToast('Unable to load maintenance records.', 'error');
        allRecords = [];
        filteredRecords = [];
        updateStats();
        renderRecords();
        loadUpcoming();
        loadHistory();
    }
}

/**
 * Update statistics cards
 */
function updateStats() {
    const scheduled = allRecords.filter(r => r.status === 'scheduled').length;
    const overdue = allRecords.filter(r => r.status === 'overdue').length;
    const inProgress = allRecords.filter(r => r.status === 'in-progress').length;
    const completed = allRecords.filter(r => r.status === 'completed').length;

    animateValue('scheduledCount', scheduled);
    animateValue('overdueCount', overdue);
    animateValue('inProgressCount', inProgress);
    animateValue('completedCount', completed);
}

/**
 * Animate number counting
 */
function animateValue(id, end) {
    const el = document.getElementById(id);
    if (!el) return;

    const duration = 1000;
    const start = parseInt(el.textContent) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        el.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Render maintenance records table
 */
function renderRecords() {
    const tbody = document.getElementById('maintenanceTable');
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageRecords = filteredRecords.slice(start, end);

    if (pageRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <section class="empty-state-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-gray-400);">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p>No maintenance records found</p>
                        <span>Try adjusting your search or filters</span>
                    </section>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageRecords.map(record => createRecordRow(record)).join('');
    }

    const showingText = document.getElementById('showingText');
    if (showingText) {
        showingText.textContent = `Showing ${filteredRecords.length} record${filteredRecords.length !== 1 ? 's' : ''}`;
    }

    updatePagination();
}

/**
 * Create HTML for a single maintenance record row
 */
function createRecordRow(record) {
    const statusLabels = {
        'scheduled': 'Scheduled',
        'in-progress': 'In Progress',
        'overdue': 'Overdue',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };

    const statusClasses = {
        'scheduled': 'maintenance',
        'in-progress': 'in-use',
        'overdue': 'overdue',
        'completed': 'available',
        'cancelled': 'retired'
    };

    const priorityLabels = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
    };

    const priorityClasses = {
        'low': 'available',
        'medium': 'maintenance',
        'high': 'overdue',
        'critical': 'retired'
    };

    const dueDate = new Date(record.due_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    const isOverdue = record.status === 'overdue';
    const dueDateStyle = isOverdue ? 'color: var(--color-danger); font-weight: 600;' : '';

    const canUpdate = record.status === 'scheduled' || record.status === 'in-progress' || record.status === 'overdue';

    return `
        <tr data-id="${record.id}">
            <td>
                <label class="checkbox-label table-checkbox">
                    <input type="checkbox" aria-label="Select ${record.asset_name}">
                    <span class="checkmark"></span>
                </label>
            </td>
            <td>
                <strong>${record.asset_name}</strong>
            </td>
            <td>${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
            <td>
                <span class="status-badge ${statusClasses[record.status] || record.status}">
                    ${statusLabels[record.status] || record.status}
                </span>
            </td>
            <td>
                <span class="status-badge ${priorityClasses[record.priority] || record.priority}">
                    ${priorityLabels[record.priority] || record.priority}
                </span>
            </td>
            <td style="${dueDateStyle}">${dueDate}</td>
            <td>${record.technician}</td>
            <td>
                <section class="row-actions">
                    ${canUpdate ? `
                    <button onclick="openUpdateModal(${record.id})" aria-label="Update ${record.asset_name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="viewRecord(${record.id})" aria-label="View details for ${record.asset_name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </section>
            </td>
        </tr>
    `;
}

/**
 * Update pagination display
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
    const paginationText = document.getElementById('paginationText');
    if (paginationText) {
        paginationText.textContent = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;
    }
}

/**
 * Search and filter maintenance records
 */
function searchMaintenance() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter')?.value;
    const priorityFilter = document.getElementById('priorityFilter')?.value;

    filteredRecords = allRecords.filter(record => {
        const matchesSearch = !query ||
            record.asset_name.toLowerCase().includes(query) ||
            record.technician.toLowerCase().includes(query) ||
            record.type.toLowerCase().includes(query);
        const matchesStatus = !statusFilter || record.status === statusFilter;
        const matchesPriority = !priorityFilter || record.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    currentPage = 1;
    renderRecords();
}

/**
 * Load upcoming maintenance list
 */
function loadUpcoming() {
    const container = document.getElementById('upcomingList');
    if (!container) return;

    const upcoming = allRecords
        .filter(r => r.status === 'scheduled' || r.status === 'in-progress')
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 4);

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="maintenance-empty">No upcoming maintenance</p>';
        return;
    }

    container.innerHTML = upcoming.map(record => createMaintenanceItem(record, 'upcoming')).join('');
}

/**
 * Load recent maintenance history
 */
function loadHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;

    const history = allRecords
        .filter(r => r.status === 'completed' || r.status === 'cancelled')
        .sort((a, b) => new Date(b.completed_date || b.due_date) - new Date(a.completed_date || a.due_date))
        .slice(0, 4);

    if (history.length === 0) {
        container.innerHTML = '<p class="maintenance-empty">No recent history</p>';
        return;
    }

    container.innerHTML = history.map(record => createMaintenanceItem(record, 'history')).join('');
}

/**
 * Create maintenance list item
 */
function createMaintenanceItem(record, type) {
    const dueDate = new Date(record.due_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });

    const statusColor = {
        'scheduled': 'var(--color-warning)',
        'in-progress': 'var(--color-primary)',
        'overdue': 'var(--color-danger)',
        'completed': 'var(--color-success)',
        'cancelled': 'var(--color-gray-400)'
    };

    const metaText = type === 'upcoming' 
        ? `Due ${dueDate} • ${record.technician}`
        : `${record.completed_date ? 'Completed ' + new Date(record.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Cancelled'} • ${record.technician}`;

    return `
        <article class="maintenance-item">
            <span class="maintenance-indicator" style="background: ${statusColor[record.status] || 'var(--color-gray-400)'};"></span>
            <section class="maintenance-info">
                <strong class="maintenance-asset">${record.asset_name}</strong>
                <p class="maintenance-meta">${record.type.charAt(0).toUpperCase() + record.type.slice(1)} • ${metaText}</p>
            </section>
            <span class="maintenance-cost">
                ${record.actual_cost ? api.formatCurrency(record.actual_cost) : record.estimated_cost ? '~' + api.formatCurrency(record.estimated_cost) : ''}
            </span>
        </article>
    `;
}

/**
 * Open schedule maintenance modal
 */
function openScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) {
        document.getElementById('maintDueDate').valueAsDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        modal.showModal();
        document.getElementById('maintAsset')?.focus();
    }
}

/**
 * Close schedule maintenance modal
 */
function closeScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) {
        modal.close();
        document.getElementById('scheduleForm')?.reset();
    }
}

/**
 * Open update maintenance modal
 */
function openUpdateModal(recordId) {
    const modal = document.getElementById('updateModal');
    const record = allRecords.find(r => r.id === recordId);
    if (!modal || !record) return;

    document.getElementById('updateRecordId').value = recordId;
    document.getElementById('updateStatus').value = record.status;
    document.getElementById('updateActualCost').value = record.actual_cost || '';
    document.getElementById('updateNotes').value = '';
    modal.showModal();
    document.getElementById('updateStatus')?.focus();
}

/**
 * Close update maintenance modal
 */
function closeUpdateModal() {
    const modal = document.getElementById('updateModal');
    if (modal) {
        modal.close();
        document.getElementById('updateForm')?.reset();
    }
}

/**
 * View record details
 */
function viewRecord(id) {
    showToast(`View record ${id} - Coming soon`, 'info');
}

/**
 * View all upcoming
 */
function viewAllUpcoming() {
    document.getElementById('statusFilter').value = 'scheduled';
    searchMaintenance();
    showToast('Filtered to show scheduled maintenance', 'info');
}

/**
 * View all history
 */
function viewAllHistory() {
    document.getElementById('statusFilter').value = 'completed';
    searchMaintenance();
    showToast('Filtered to show completed maintenance', 'info');
}

/**
 * Set loading state on button
 */
function setLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * Initialize page on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = scheduleForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);

            const data = {
                asset_id: parseInt(document.getElementById('maintAsset').value),
                type: document.getElementById('maintType').value,
                priority: document.getElementById('maintPriority').value,
                technician_id: document.getElementById('maintTechnician').value,
                due_date: document.getElementById('maintDueDate').value,
                estimated_cost: parseFloat(document.getElementById('maintEstimatedCost').value) || null,
                description: document.getElementById('maintDescription').value
            };

            try {
                await api.post('/maintenance', data);
                showToast('Maintenance scheduled successfully!', 'success');
                closeScheduleModal();
                loadMaintenance();
            } catch (error) {
                showToast('Could not schedule maintenance. Please try again.', 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = updateForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);

            const recordId = parseInt(document.getElementById('updateRecordId').value);
            const data = {
                status: document.getElementById('updateStatus').value,
                actual_cost: parseFloat(document.getElementById('updateActualCost').value) || null,
                notes: document.getElementById('updateNotes').value
            };

            try {
                await api.put(`/maintenance/${recordId}`, data);
                showToast('Maintenance record updated!', 'success');
                closeUpdateModal();
                loadMaintenance();
            } catch (error) {
                showToast('Could not update maintenance record. Please try again.', 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    document.getElementById('statusFilter')?.addEventListener('change', searchMaintenance);
    document.getElementById('priorityFilter')?.addEventListener('change', searchMaintenance);

    document.getElementById('selectAll')?.addEventListener('change', (e) => {
        document.querySelectorAll('.data-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });

    ['scheduleModal', 'updateModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (id === 'scheduleModal') closeScheduleModal();
                    else closeUpdateModal();
                }
            });
        }
    });

    loadMaintenance();
});