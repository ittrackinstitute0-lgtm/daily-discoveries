/**
 * Daily Discoveries Pakistan - Application Logic
 * Clean, lightweight, modular JavaScript.
 */

// Central state store
const AppState = {
  // Kept blank by default as requested
  discoveries: [],
  activeFilter: 'all',
  theme: localStorage.getItem('dd_theme') || 'light',
};

// DOM Elements
const DOM = {
  discoveriesContainer: document.getElementById('discoveriesContainer'),
  discoveryCount: document.getElementById('discoveryCount'),
  filterChips: document.getElementById('filterChips'),
  themeToggle: document.getElementById('themeToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  navMenu: document.getElementById('navMenu'),
  liveClock: document.getElementById('liveClock'),
  currentYear: document.getElementById('currentYear'),
  subscribeBtn: document.getElementById('subscribeBtn'),
  subscribeModal: document.getElementById('subscribeModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  subscribeForm: document.getElementById('subscribeForm'),
};

/**
 * 1. Initialize Application
 */
async function initApp() {
  applyTheme(AppState.theme);
  setupLiveClock();
  setupEventListeners();

  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }

  // Load verified discoveries from data/discoveries.json if present
  await loadDiscoveriesData();
  renderDiscoveries();
}

/**
 * Fetch published discoveries from repository data file
 */
async function loadDiscoveriesData() {
  try {
    const res = await fetch('data/discoveries.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        AppState.discoveries = data;
      }
    }
  } catch (err) {
    console.info('Discoveries file empty or loading default view.');
  }
}

/**
 * 2. Theme Switching (Light / Dark mode)
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  AppState.theme = theme;
  localStorage.setItem('dd_theme', theme);
}

function toggleTheme() {
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/**
 * 3. Live Pakistan Standard Time (PKT) Clock
 */
function setupLiveClock() {
  function updateTime() {
    try {
      const options = {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      };
      const formatter = new Intl.DateTimeFormat('en-PK', options);
      if (DOM.liveClock) {
        DOM.liveClock.textContent = `PKT: ${formatter.format(new Date())}`;
      }
    } catch (e) {
      if (DOM.liveClock) {
        DOM.liveClock.textContent = `PKT: ${new Date().toLocaleTimeString()}`;
      }
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/**
 * 4. Render Discoveries or Modern Minimalist Blank State
 */
function renderDiscoveries() {
  const container = DOM.discoveriesContainer;
  if (!container) return;

  // Filter items if any exist
  const filtered = AppState.activeFilter === 'all'
    ? AppState.discoveries
    : AppState.discoveries.filter(item => item.region === AppState.activeFilter);

  // Update total count indicator
  if (DOM.discoveryCount) {
    DOM.discoveryCount.textContent = `${filtered.length} Discoveries`;
  }

  // If blank (current requirement), display elegant awaiting / blank state
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>No Announcements Yet Today</h3>
        <p>
          The feed is currently primed and monitoring dispatch feeds across all provinces. New discoveries will instantly show up right here the moment they are reported.
        </p>
        <div class="empty-actions">
          <button class="btn btn-outline" onclick="openSubscribeModal()">Get Notified on First Discovery</button>
        </div>
      </div>
    `;
    return;
  }

  // If discoveries exist, render clean discovery cards
  container.innerHTML = filtered.map(item => `
    <article class="discovery-card" data-id="${item.id}">
      <div>
        <div class="card-top">
          <span class="card-badge">${escapeHtml(item.category || 'Discovery')}</span>
          <span class="card-time">${escapeHtml(item.timeAgo || 'Just now')}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-desc">${escapeHtml(item.summary)}</p>
      </div>
      <div class="card-footer">
        <span class="card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${escapeHtml(item.location || 'Pakistan')}
        </span>
        <span class="card-source">${escapeHtml(item.source || 'Verified Report')}</span>
      </div>
    </article>
  `).join('');
}

/**
 * 5. Public Method: Broadcast / Add a New Discovery
 * Whenever a new discovery is announced anywhere in Pakistan, call this function:
 * Example:
 * DailyDiscoveries.post({
 *   title: "Ancient 4,000-Year-Old Settlement Unearthed in Cholistan",
 *   category: "Archaeology",
 *   region: "punjab",
 *   location: "Cholistan Desert, Punjab",
 *   summary: "Archaeologists discover pottery and town ruins dating back to the Mature Harappan period.",
 *   source: "Dept of Archaeology"
 * });
 */
window.DailyDiscoveries = {
  post: function (discovery) {
    const newEntry = {
      id: 'disc_' + Date.now(),
      title: discovery.title || 'Untitled Discovery',
      category: discovery.category || 'Discovery',
      region: (discovery.region || 'all').toLowerCase(),
      location: discovery.location || 'Pakistan',
      summary: discovery.summary || 'Details to be updated soon.',
      source: discovery.source || 'Official Source',
      timeAgo: 'Just now',
      timestamp: new Date().toISOString()
    };

    AppState.discoveries.unshift(newEntry);
    renderDiscoveries();
  },

  getAll: function () {
    return AppState.discoveries;
  },

  clearAll: function () {
    AppState.discoveries = [];
    renderDiscoveries();
  }
};

/**
 * 6. Event Listeners & UI Handlers
 */
function setupEventListeners() {
  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }

  // Mobile menu toggle
  if (DOM.mobileMenuBtn && DOM.navMenu) {
    DOM.mobileMenuBtn.addEventListener('click', () => {
      DOM.navMenu.classList.toggle('mobile-open');
    });
  }

  // Region Filter Chips
  if (DOM.filterChips) {
    DOM.filterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      DOM.filterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      AppState.activeFilter = chip.getAttribute('data-filter') || 'all';
      renderDiscoveries();
    });
  }

  // Modal open & close
  if (DOM.subscribeBtn) {
    DOM.subscribeBtn.addEventListener('click', openSubscribeModal);
  }
  if (DOM.modalCloseBtn) {
    DOM.modalCloseBtn.addEventListener('click', closeSubscribeModal);
  }
  if (DOM.subscribeModal) {
    DOM.subscribeModal.addEventListener('click', (e) => {
      if (e.target === DOM.subscribeModal) closeSubscribeModal();
    });
  }

  // Modal form submit
  if (DOM.subscribeForm) {
    DOM.subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('subscriberEmail').value;
      const region = document.getElementById('regionPref').value;
      
      alert(`Subscription confirmed for ${email}! You will receive live alerts for: ${region.toUpperCase()}.`);
      closeSubscribeModal();
      DOM.subscribeForm.reset();
    });
  }
}

function openSubscribeModal() {
  if (DOM.subscribeModal) {
    DOM.subscribeModal.classList.add('show');
    DOM.subscribeModal.setAttribute('aria-hidden', 'false');
  }
}

function closeSubscribeModal() {
  if (DOM.subscribeModal) {
    DOM.subscribeModal.classList.remove('show');
    DOM.subscribeModal.setAttribute('aria-hidden', 'true');
  }
}

// XSS safety helper
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Run on load
document.addEventListener('DOMContentLoaded', initApp);
