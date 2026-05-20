const adminState = { token: localStorage.getItem('tradebybater-token') };
const adminElements = {
  stats: document.getElementById('admin-stats'),
  listingsTable: document.querySelector('#admin-listings-table tbody'),
  usersTable: document.querySelector('#admin-users-table tbody'),
  refreshButton: document.getElementById('refresh-admin')
};

function apiRequest(url, options = {}) {
  const headers = options.headers || {};
  if (adminState.token) {
    headers['Authorization'] = `Bearer ${adminState.token}`;
  }
  return fetch(url, { headers, ...options }).then(async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = data && data.error ? data.error : response.statusText;
      throw new Error(error);
    }
    return data;
  });
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderStats(stats) {
  adminElements.stats.innerHTML = `
    <div class="stat-card"><div class="stat-title">Total Users</div><div class="stat-value">${stats.users}</div></div>
    <div class="stat-card"><div class="stat-title">Total Listings</div><div class="stat-value">${stats.listings}</div></div>
    <div class="stat-card"><div class="stat-title">Total Trades</div><div class="stat-value">${stats.trades}</div></div>
  `;
}

function handleListingAction(listingId, action) {
  return apiRequest(`/api/admin/listings/${listingId}/${action}`, { method: 'POST' })
    .then(() => loadAdminDashboard())
    .catch((error) => alert(`Failed to ${action}: ${error.message}`));
}

function renderListings(listings) {
  adminElements.listingsTable.innerHTML = '';
  listings.slice(0, 20).forEach((listing) => {
    const row = document.createElement('tr');
    const status = listing.status || 'pending';
    const flags = listing.flags != null ? listing.flags : 0;
    row.innerHTML = `
      <td>${listing.title}</td>
      <td>${listing.category}</td>
      <td>${listing.ownerName}</td>
      <td>${listing.location}</td>
      <td>${status}</td>
      <td>${flags}</td>
      <td>${formatDate(listing.createdAt)}</td>
      <td>
        <button class="admin-action-button" data-listing-id="${listing.id}" data-action="approve">Approve</button>
        <button class="admin-action-button" data-listing-id="${listing.id}" data-action="reject">Reject</button>
        <button class="admin-action-button danger" data-listing-id="${listing.id}" data-action="ban">Ban Owner</button>
      </td>
    `;
    adminElements.listingsTable.appendChild(row);
  });

  adminElements.listingsTable.querySelectorAll('.admin-action-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const listingId = event.target.dataset.listingId;
      const action = event.target.dataset.action;
      handleListingAction(listingId, action);
    });
  });
}

function renderUsers(users) {
  adminElements.usersTable.innerHTML = '';
  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.fullName}</td>
      <td>${user.role || 'user'}</td>
      <td>${formatDate(user.createdAt)}</td>
    `;
    adminElements.usersTable.appendChild(row);
  });
}

function loadAdminDashboard() {
  Promise.all([
    apiRequest('/api/admin/stats'),
    apiRequest('/api/admin/users'),
    apiRequest('/api/admin/listings')
  ])
    .then(([stats, users, listings]) => {
      renderStats(stats);
      renderUsers(users);
      renderListings(listings);
    })
    .catch((error) => {
      if (error.message === 'Admin access required') {
        adminElements.stats.innerHTML = '<div class="empty-state danger">Admin access required. Sign in with an admin account.</div>';
      } else {
        adminElements.stats.innerHTML = `<div class="empty-state danger">${error.message}</div>`;
      }
      adminElements.listingsTable.innerHTML = '';
      adminElements.usersTable.innerHTML = '';
    });
}

adminElements.refreshButton.addEventListener('click', loadAdminDashboard);

window.addEventListener('DOMContentLoaded', loadAdminDashboard);
