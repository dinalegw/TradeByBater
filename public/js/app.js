const state = {
  token: localStorage.getItem('tradebybater-token'),
  user: null,
  categories: [],
  listings: [],
  trades: [],
  currentListingId: null
};

const elements = {
  authSection: document.getElementById('auth-section'),
  listingsView: document.getElementById('listings-view'),
  createView: document.getElementById('create-view'),
  tradesView: document.getElementById('trades-view'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  createListingForm: document.getElementById('create-listing-form'),
  categoryFilter: document.getElementById('category-filter'),
  searchInput: document.getElementById('search-input'),
  listingsGrid: document.getElementById('listings-grid'),
  tradesGrid: document.getElementById('trades-grid'),
  userName: document.getElementById('user-name'),
  logoutButton: document.getElementById('logout-button'),
  navButtons: document.querySelectorAll('[data-view]'),
  categorySelect: document.querySelector('#create-listing-form select[name="category"]'),
  modal: document.getElementById('modal'),
  modalHeading: document.getElementById('modal-heading'),
  tradeForm: document.getElementById('trade-form'),
  cancelTrade: document.getElementById('cancel-trade'),
  listingTemplate: document.getElementById('listing-card-template'),
  tradeTemplate: document.getElementById('trade-card-template')
};

function apiRequest(url, options = {}) {
  const headers = options.headers || {};
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
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

function setView(viewId) {
  elements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewId);
  });
  elements.authSection.classList.toggle('hidden', viewId !== 'auth');
  elements.listingsView.classList.toggle('hidden', viewId !== 'listings');
  elements.createView.classList.toggle('hidden', viewId !== 'create');
  elements.tradesView.classList.toggle('hidden', viewId !== 'trades');
}

function setUser(user) {
  state.user = user;
  if (user) {
    elements.userName.textContent = `Signed in as ${user.fullName}`;
    elements.logoutButton.classList.remove('hidden');
  } else {
    elements.userName.textContent = 'Not signed in';
    elements.logoutButton.classList.add('hidden');
  }
}

function openModal(listing) {
  state.currentListingId = listing.id;
  elements.modalHeading.textContent = `${listing.title} — ${listing.ownerName}`;
  elements.modal.classList.remove('hidden');
}

function closeModal() {
  state.currentListingId = null;
  elements.modal.classList.add('hidden');
  elements.tradeForm.reset();
}

function renderCategories() {
  elements.categoryFilter.innerHTML = '<option value="">All categories</option>';
  elements.categorySelect.innerHTML = '<option value="" disabled>Select a category</option>';
  state.categories.forEach((category) => {
    elements.categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    elements.categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
  });
}

function renderListings() {
  const query = elements.searchInput.value.toLowerCase();
  const category = elements.categoryFilter.value;
  const filtered = state.listings.filter((listing) => {
    const matchesCategory = !category || listing.category === category;
    const text = `${listing.title} ${listing.description} ${listing.wants} ${listing.location}`.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    return matchesCategory && matchesSearch;
  });

  elements.listingsGrid.innerHTML = '';
  if (!filtered.length) {
    elements.listingsGrid.innerHTML = '<div class="empty-state">No listings match your search.</div>';
    return;
  }

  filtered.forEach((listing) => {
    const node = elements.listingTemplate.content.cloneNode(true);
    node.querySelector('.listing-title').textContent = listing.title;
    node.querySelector('.listing-meta').textContent = `${listing.category} • ${listing.location} • ${listing.ownerName}`;
    node.querySelector('.listing-description').textContent = listing.description;
    node.querySelector('.listing-wants').textContent = `Wants: ${listing.wants}`;

    const button = node.querySelector('.trade-button');
    const reportButton = node.querySelector('.report-button');

    if (!state.user || listing.ownerId === state.user.id) {
      button.textContent = 'View listing';
      button.disabled = true;
      reportButton.disabled = true;
    } else {
      button.addEventListener('click', () => openModal(listing));
      reportButton.addEventListener('click', () => reportListing(listing.id));
    }

    elements.listingsGrid.appendChild(node);
  });
}

function reportListing(listingId) {
  if (!state.user) {
    alert('Sign in before reporting listings.');
    return;
  }

  apiRequest(`/api/listings/${listingId}/report`, { method: 'POST' })
    .then(() => alert('Listing reported. Moderators will review it.'))
    .catch((error) => alert(error.message));
}

function renderTrades() {
  elements.tradesGrid.innerHTML = '';
  if (!state.trades.length) {
    elements.tradesGrid.innerHTML = '<div class="empty-state">No trade requests yet.</div>';
    return;
  }

  state.trades.forEach((trade) => {
    const node = elements.tradeTemplate.content.cloneNode(true);
    node.querySelector('.listing-title').textContent = trade.listingTitle;
    node.querySelector('.listing-meta').textContent = `From: ${trade.buyerName} → ${trade.sellerName}`;
    node.querySelector('.listing-description').textContent = trade.message;
    node.querySelector('.listing-wants').textContent = `Status: ${trade.status}`;
    node.querySelector('.status-pill').textContent = trade.status.toUpperCase();
    elements.tradesGrid.appendChild(node);
  });
}

function refreshApp() {
  renderListings();
  renderTrades();
}

function loadAppData() {
  Promise.all([
    apiRequest('/api/categories'),
    apiRequest('/api/listings')
  ])
    .then(([categories, listings]) => {
      state.categories = categories;
      state.listings = listings;
      renderCategories();
      refreshApp();
    })
    .catch((error) => {
      console.error('Failed to load app data:', error.message);
    });
}

function loadTrades() {
  apiRequest('/api/trades')
    .then((trades) => {
      state.trades = trades;
      renderTrades();
    })
    .catch((error) => {
      console.error('Trade list error:', error.message);
    });
}

function loadProfile() {
  if (!state.token) {
    setUser(null);
    return;
  }

  apiRequest('/api/auth/me')
    .then((user) => {
      setUser(user);
      loadTrades();
    })
    .catch(() => {
      localStorage.removeItem('tradebybater-token');
      state.token = null;
      setUser(null);
    });
}

function showApp() {
  if (!state.user) {
    setView('auth');
    return;
  }
  setView('listings');
}

window.addEventListener('DOMContentLoaded', () => {
  if (state.token) {
    loadProfile();
  }
  loadAppData();
  showApp();
});

elements.navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    if (view === 'auth' && state.user) {
      return;
    }
    setView(view);
    if (view === 'trades') {
      loadTrades();
    }
  });
});

elements.logoutButton.addEventListener('click', () => {
  localStorage.removeItem('tradebybater-token');
  state.token = null;
  state.user = null;
  setUser(null);
  setView('auth');
});

elements.loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const username = formData.get('username').trim();
  const password = formData.get('password').trim();

  apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then((data) => {
      state.token = data.token;
      localStorage.setItem('tradebybater-token', data.token);
      setUser(data.user);
      loadTrades();
      loadAppData();
      setView('listings');
    })
    .catch((error) => {
      alert(error.message);
    });
});

elements.registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(elements.registerForm);
  const fullName = formData.get('fullName').trim();
  const username = formData.get('username').trim();
  const password = formData.get('password').trim();

  apiRequest('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, username, password })
  })
    .then((data) => {
      state.token = data.token;
      localStorage.setItem('tradebybater-token', data.token);
      setUser(data.user);
      loadTrades();
      loadAppData();
      setView('listings');
    })
    .catch((error) => {
      alert(error.message);
    });
});

elements.createListingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(elements.createListingForm);
  const payload = {
    title: formData.get('title').trim(),
    category: formData.get('category'),
    location: formData.get('location').trim(),
    description: formData.get('description').trim(),
    wants: formData.get('wants').trim()
  };

  apiRequest('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then((listing) => {
      state.listings.unshift(listing);
      renderListings();
      elements.createListingForm.reset();
      setView('listings');
    })
    .catch((error) => {
      alert(error.message);
    });
});

elements.tradeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!state.currentListingId) {
    return;
  }

  const formData = new FormData(elements.tradeForm);
  const message = formData.get('message').trim();

  apiRequest('/api/trades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId: state.currentListingId, message })
  })
    .then((trade) => {
      state.trades.unshift(trade);
      closeModal();
      setView('trades');
      renderTrades();
    })
    .catch((error) => {
      alert(error.message);
    });
});

elements.cancelTrade.addEventListener('click', () => {
  closeModal();
});

elements.categoryFilter.addEventListener('change', renderListings);
elements.searchInput.addEventListener('input', renderListings);
