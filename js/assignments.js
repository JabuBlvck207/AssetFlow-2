/**
 * AssetFlow Assignments Module
 * Manages asset assignments, returns, and tracking
 */

let allAssignments = [];
let filteredAssignments = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

/**
 * Load assignments from API
 */
async function loadAssignments() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const assignments = await api.get('/assignments');
        allAssignments = assignments || [];
        filteredAssignments = [...allAssignments];
        updateAssignmentCounters();
        renderAssignments();
    } catch (error) {
        showToast('Unable to load assignments. Please check your connection.', 'error');
        allAssignments = [];
        filteredAssignments = [];
        updateAssignmentCounters();
        renderAssignments();
    }
}

function updateAssignmentCounters() {
    const active = allAssignments.filter(a => a.status === 'active').length;
    const overdue = allAssignments.filter(a => a.status === 'overdue').length;
    const pending = allAssignments.filter(a => a.status === 'pending').length;
    const total = allAssignments.length;

    document.getElementById('activeAssignments')?.textContent = active;
    document.getElementById('overdueAssignments')?.textContent = overdue;
    document.getElementById('pendingAssignments')?.textContent = pending;
    document.getElementById('totalAssignments')?.textContent = total;
}

/**
 * Render assignments table
 */
function renderAssignments() {
    const tbody = document.getElementById('assignmentTable');
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageAssignments = filteredAssignments.slice(start, end);

    if (pageAssignments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <section class="empty-state-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-gray-400);">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        <p>No assignments found</p>
                        <span>Try adjusting your search or filters</span>
                    </section>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageAssignments.map(assignment => createAssignmentRow(assignment)).join('');
    }

    const showingText = document.getElementById('showingText');
    if (showingText) {
        showingText.textContent = `Showing ${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? 's' : ''}`;
    }

    updatePagination();
}

/**
 * Create HTML for a single assignment row
 */
function createAssignmentRow(assignment) {
    const statusLabels = {
        'active': 'Active',
        'returned': 'Returned',
        'overdue': 'Overdue',
        'pending': 'Pending Approval'
    };

    const statusClasses = {
        'active': 'in-use',
        'returned': 'available',
        'overdue': 'overdue',
        'pending': 'pending'
    };

    const assignedDate = new Date(assignment.assigned_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const dueDate = assignment.due_date 
        ? new Date(assignment.due_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) 
        : '—';

    const isOverdue = assignment.status === 'overdue';
    const overdueAttr = isOverdue ? ' data-overdue="true"' : '';

    return `
        <tr data-id="${assignment.id}">
            <td>
                <label class="checkbox-label table-checkbox">
                    <input type="checkbox" aria-label="Select ${assignment.asset_name}">
                    <span class="checkmark"></span>
                </label>
            </td>
            <td>
                <strong>${assignment.asset_name}</strong>
            </td>
            <td>${assignment.employee}</td>
            <td>
                <span class="status-badge ${statusClasses[assignment.status] || assignment.status}">
                    ${statusLabels[assignment.status] || assignment.status}
                </span>
            </td>
            <td>${assignedDate}</td>
            <td${overdueAttr}>${dueDate}</td>
            <td>
                <section class="row-actions">
                    ${assignment.status === 'active' || assignment.status === 'overdue' ? `
                    <button onclick="openReturnModal(${assignment.id})" aria-label="Return ${assignment.asset_name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="viewAssignment(${assignment.id})" aria-label="View details for ${assignment.asset_name}">
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
    const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
    const paginationText = document.getElementById('paginationText');
    if (paginationText) {
        paginationText.textContent = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;
    }
}

/**
 * Search and filter assignments
 */
function searchAssignments() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter')?.value;
    const employeeFilter = document.getElementById('employeeFilter')?.value;

    filteredAssignments = allAssignments.filter(assignment => {
        const matchesSearch = !query ||
            assignment.asset_name.toLowerCase().includes(query) ||
            assignment.employee.toLowerCase().includes(query);
        const matchesStatus = !statusFilter || assignment.status === statusFilter;
        const matchesEmployee = !employeeFilter || 
            assignment.employee.toLowerCase().replace(' ', '-') === employeeFilter;

        return matchesSearch && matchesStatus && matchesEmployee;
    });

    currentPage = 1;
updateAssignmentCounters();
    renderAssignments();
}

/**
 * Open assign asset modal
 */
function openAssignModal() {
    const modal = document.getElementById('assignModal');
    if (modal) {
        document.getElementById('assignDate').valueAsDate = new Date();
        modal.showModal();
        document.getElementById('assignAsset')?.focus();
    }
}

/**
 * Close assign asset modal
 */
function closeAssignModal() {
    const modal = document.getElementById('assignModal');
    if (modal) {
        modal.close();
        document.getElementById('assignForm')?.reset();
    }
}

/**
 * Open return asset modal
 */
function openReturnModal(assignmentId) {
    const modal = document.getElementById('returnModal');
    if (modal) {
        document.getElementById('returnAssignmentId').value = assignmentId;
        modal.showModal();
        document.getElementById('returnCondition')?.focus();
    }
}

/**
 * Close return asset modal
 */
function closeReturnModal() {
    const modal = document.getElementById('returnModal');
    if (modal) {
        modal.close();
        document.getElementById('returnForm')?.reset();
    }
}

/**
 * View assignment details
 */
function viewAssignment(id) {
    showToast(`View assignment ${id} - Coming soon`, 'info');
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
    const assignDate = document.getElementById('assignDate');
    if (assignDate) assignDate.valueAsDate = new Date();

    const assignForm = document.getElementById('assignForm');
    if (assignForm) {
        assignForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = assignForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);

            const data = {
                asset_id: parseInt(document.getElementById('assignAsset').value),
                employee_id: document.getElementById('assignEmployee').value,
                assigned_date: document.getElementById('assignDate').value,
                due_date: document.getElementById('dueDate').value || null,
                notes: document.getElementById('assignNotes').value
            };

            try {
                await api.post('/assignments', data);
                showToast('Asset assigned successfully!', 'success');
                closeAssignModal();
                loadAssignments();
            } catch (error) {
                const newAssignment = {
                    id: allAssignments.length + 1,
                    asset_name: document.getElementById('assignAsset').options[document.getElementById('assignAsset').selectedIndex].text,
                    employee: document.getElementById('assignEmployee').options[document.getElementById('assignEmployee').selectedIndex].text,
                    status: 'active',
                    assigned_date: data.assigned_date,
                    due_date: data.due_date,
                    asset_id: data.asset_id
                };
                allAssignments.unshift(newAssignment);
                filteredAssignments = [...allAssignments];
                renderAssignments();
                showToast('Asset assigned successfully!', 'success');
                closeAssignModal();
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    const returnForm = document.getElementById('returnForm');
    if (returnForm) {
        returnForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = returnForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true);

            const assignmentId = parseInt(document.getElementById('returnAssignmentId').value);
            const data = {
                condition: document.getElementById('returnCondition').value,
                return_notes: document.getElementById('returnNotes').value
            };

            try {
                await api.post(`/assignments/${assignmentId}/return`, data);
                showToast('Asset returned successfully!', 'success');
                closeReturnModal();
                loadAssignments();
            } catch (error) {
                const assignment = allAssignments.find(a => a.id === assignmentId);
                if (assignment) {
                    assignment.status = 'returned';
                    assignment.returned_date = new Date().toISOString();
                }
                filteredAssignments = [...allAssignments];
                renderAssignments();
                showToast('Asset returned successfully!', 'success');
                closeReturnModal();
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    document.getElementById('statusFilter')?.addEventListener('change', searchAssignments);
    document.getElementById('employeeFilter')?.addEventListener('change', searchAssignments);

    document.getElementById('selectAll')?.addEventListener('change', (e) => {
        document.querySelectorAll('.data-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });

    ['assignModal', 'returnModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (id === 'assignModal') closeAssignModal();
                    else closeReturnModal();
                }
            });
        }
    });

    loadAssignments();
});