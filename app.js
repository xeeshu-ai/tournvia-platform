// Tournvia Main Application Logic

// Application State (using JavaScript variables instead of localStorage/sessionStorage)
const AppState = {
  currentUser: null,
  currentPage: 'dashboard',
  currentTournament: null,
  filters: {
    mode: 'All',
    type: 'All',
    size: 'All'
  },
  transactionFilter: 'all',
  isLoggedIn: false
};

// Initialize Application
function initApp() {
  // Check if user is logged in (using in-memory state)
  if (AppState.isLoggedIn && AppState.currentUser) {
    showApp();
  } else {
    showLoginPage();
  }

  // Set up event listeners
  setupEventListeners();
}

// Event Listeners Setup
function setupEventListeners() {
  // Auth forms
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterPage();
  });
  document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
  });

  // Navigation
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      navigateToPage(page);
    });
  });

  // Mobile menu toggle
  document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);

  // Notification panel
  document.getElementById('notification-btn')?.addEventListener('click', toggleNotificationPanel);
  document.getElementById('close-notifications')?.addEventListener('click', closeNotificationPanel);

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);


  // Modal
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });

  // Tournament search
  document.getElementById('tournament-search')?.addEventListener('input', handleTournamentSearch);

  // Clear filters
  document.getElementById('clear-filters')?.addEventListener('click', clearFilters);

  // Wallet tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchWalletTab(tab);
    });
  });

  // Wallet forms
  document.getElementById('add-money-form')?.addEventListener('submit', handleAddMoney);
  document.getElementById('withdraw-form')?.addEventListener('submit', handleWithdraw);

  // Support forms
  document.getElementById('contact-form')?.addEventListener('submit', handleContactForm);
  document.getElementById('report-form')?.addEventListener('submit', handleReportForm);

  // Back button
  document.getElementById('back-to-tournaments')?.addEventListener('click', () => {
    navigateToPage('tournaments');
  });
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-uid').value.trim(); // Reusing uid field for email
    const password = document.getElementById('login-password').value;
    
    try {
        // Login with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) throw profileError;
        
        // Update app state
        AppState.currentUser = profile;
        AppState.isLoggedIn = true;
        
        // Update last login
        await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        
        showApp();
        loadDashboard();
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}


async function handleRegister(e) {
    e.preventDefault();
    
    const ign = document.getElementById('register-ign').value.trim();
    const uid = document.getElementById('register-uid').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }
    
    if (!CONFIG.validation.uid.pattern.test(uid)) {
        alert('Invalid UID format! Must be 9-10 digits.');
        return;
    }
    
    if (!CONFIG.validation.email.pattern.test(email)) {
        alert('Invalid email format!');
        return;
    }
    
    try {
        // Register user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    ign: ign,
                    uid: uid
                }
            }
        });
        
        if (error) throw error;
        
        // Update profile with UID
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ uid: uid, ign: ign })
                .eq('id', data.user.id);
            
            if (profileError) throw profileError;
        }
        
        alert('Registration successful! You can now login.');
        showLoginPage();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}


async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Clear app state
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        
        showLoginPage();
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
}


// Page Navigation
function showLoginPage() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('register-page').classList.remove('active');
  document.getElementById('app-container').classList.remove('active');
}

function showRegisterPage() {
  document.getElementById('register-page').classList.add('active');
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-container').classList.remove('active');
}

function showApp() {
  document.getElementById('app-container').classList.add('active');
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('register-page').classList.remove('active');
  
  // Load dashboard by default
  navigateToPage('dashboard');
  updateNotificationBadge();
}

function navigateToPage(page) {
  AppState.currentPage = page;
  
  // Hide all content pages
  document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
  
  // Show selected page
  document.getElementById(`${page}-page`)?.classList.add('active');
  
  // Update navigation active states
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    tournaments: 'Tournaments',
    wallet: 'Wallet',
    team: 'My Team',
    profile: 'Profile',
    support: 'Support'
  };
  document.getElementById('page-title').textContent = titles[page] || 'Tournvia';
  
  // Load page content
  switch(page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'tournaments':
      loadTournaments();
      break;
    case 'wallet':
      loadWallet();
      break;
    case 'team':
      loadTeamPage();
      break;
    case 'profile':
      loadProfile();
      break;
    case 'support':
      loadSupport();
      break;
  }
  
  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

// Dashboard Functions
function loadDashboard() {
  const user = AppState.currentUser;
  
  // Load stats
  const statsGrid = document.getElementById('stats-grid');
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Tournaments</div>
      <div class="stat-value">${user.total_tournaments}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Win Rate</div>
      <div class="stat-value primary">${user.win_rate}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Earnings</div>
      <div class="stat-value">${CONFIG.settings.currency}${user.total_earnings}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Current Balance</div>
      <div class="stat-value primary">${CONFIG.settings.currency}${user.current_balance}</div>
    </div>
  `;
  
  // Load quick actions
  const quickActions = document.getElementById('quick-actions');
  quickActions.innerHTML = `
    <a href="#" class="action-btn" data-page="tournaments">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      </div>
      <span>Browse Tournaments</span>
    </a>
    <a href="#" class="action-btn" data-page="wallet">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <span>Add Money</span>
    </a>
    <a href="#" class="action-btn" data-page="profile">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <span>View Profile</span>
    </a>
    <a href="#" class="action-btn" data-page="team">
      <div class="action-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <span>My Team</span>
    </a>
  `;
  
  // Re-attach event listeners for quick actions
  quickActions.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(e.currentTarget.dataset.page);
    });
  });
  
  // Load upcoming matches
  loadUpcomingMatches();
}

function loadUpcomingMatches() {
  const container = document.getElementById('upcoming-matches');
  const upcomingTournaments = DATA.tournaments
    .filter(t => t.status === 'open')
    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
    .slice(0, 3);
  
  if (upcomingTournaments.length === 0) {
    container.innerHTML = '<p class="empty-state">No upcoming matches</p>';
    return;
  }
  
  container.innerHTML = upcomingTournaments.map(tournament => {
    const matchDate = new Date(tournament.date + ' ' + tournament.time);
    const now = new Date();
    const diff = matchDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `
      <div class="match-card">
        <div class="match-info">
          <h4>${tournament.name}</h4>
          <div class="match-details">
            <span>${tournament.type}</span>
            <span>•</span>
            <span>${tournament.team_size}</span>
            <span>•</span>
            <span>${new Date(tournament.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="countdown">
          <div class="countdown-label">Starts in</div>
          <div class="countdown-time">${hours}h ${minutes}m</div>
        </div>
      </div>
    `;
  }).join('');
}

// Tournaments Functions
function loadTournaments() {
  // Load filters
  loadTournamentFilters();
  
  // Display tournaments
  displayTournaments();
}

function loadTournamentFilters() {
  // Mode filters
  const modeFilters = document.getElementById('mode-filters');
  modeFilters.innerHTML = CONFIG.tournament.modes.map(mode => 
    `<button class="filter-pill ${AppState.filters.mode === mode ? 'active' : ''}" data-filter-type="mode" data-filter="${mode}">${mode}</button>`
  ).join('');
  
  // Type filters
  const typeFilters = document.getElementById('type-filters');
  typeFilters.innerHTML = CONFIG.tournament.gameTypes.map(type => 
    `<button class="filter-pill ${AppState.filters.type === type ? 'active' : ''}" data-filter-type="type" data-filter="${type}">${type}</button>`
  ).join('');
  
  // Size filters
  const sizeFilters = document.getElementById('size-filters');
  sizeFilters.innerHTML = CONFIG.tournament.teamSizes.map(size => 
    `<button class="filter-pill ${AppState.filters.size === size ? 'active' : ''}" data-filter-type="size" data-filter="${size}">${size}</button>`
  ).join('');
  
  // Add event listeners
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const filterType = e.target.dataset.filterType;
      const filterValue = e.target.dataset.filter;
      
      if (filterType === 'mode') AppState.filters.mode = filterValue;
      if (filterType === 'type') AppState.filters.type = filterValue;
      if (filterType === 'size') AppState.filters.size = filterValue;
      
      loadTournamentFilters();
      displayTournaments();
    });
  });
}

function displayTournaments() {
  const grid = document.getElementById('tournaments-grid');
  const searchTerm = document.getElementById('tournament-search')?.value.toLowerCase() || '';
  
  let filtered = DATA.tournaments.filter(t => {
    const matchesMode = AppState.filters.mode === 'All' || t.mode === AppState.filters.mode;
    const matchesType = AppState.filters.type === 'All' || t.type === AppState.filters.type;
    const matchesSize = AppState.filters.size === 'All' || t.team_size === AppState.filters.size;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm);
    
    return matchesMode && matchesType && matchesSize && matchesSearch && t.status === 'open';
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No tournaments found</p></div>';
    return;
  }
  
  grid.innerHTML = filtered.map(tournament => {
    const fillPercentage = (tournament.slots_filled / tournament.slots_total) * 100;
    
    return `
      <div class="tournament-card" data-tournament-id="${tournament.id}">
        <div class="tournament-header">
          <span class="tournament-type">${tournament.type}</span>
          <h3 class="tournament-name">${tournament.name}</h3>
        </div>
        <div class="tournament-body">
          <div class="tournament-info">
            <div class="info-item">
              <span class="info-label">Entry Fee</span>
              <span class="info-value">${CONFIG.settings.currency}${tournament.entry_fee}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Prize Pool</span>
              <span class="info-value">${CONFIG.settings.currency}${tournament.prize_pool}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Mode</span>
              <span class="info-value">${tournament.mode}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Team Size</span>
              <span class="info-value">${tournament.team_size}</span>
            </div>
          </div>
          <div class="slots-bar">
            <div class="slots-progress">
              <div class="slots-fill" style="width: ${fillPercentage}%"></div>
            </div>
            <div class="slots-text">${tournament.slots_filled}/${tournament.slots_total} slots filled</div>
          </div>
          <div class="info-item">
            <span class="info-label">Date & Time</span>
            <span class="info-value">${new Date(tournament.date).toLocaleDateString()} at ${tournament.time}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click listeners
  grid.querySelectorAll('.tournament-card').forEach(card => {
    card.addEventListener('click', () => {
      const tournamentId = card.dataset.tournamentId;
      showTournamentDetail(tournamentId);
    });
  });
}

function handleTournamentSearch(e) {
  displayTournaments();
}

function clearFilters() {
  AppState.filters = {
    mode: 'All',
    type: 'All',
    size: 'All'
  };
  document.getElementById('tournament-search').value = '';
  loadTournamentFilters();
  displayTournaments();
}

function showTournamentDetail(tournamentId) {
  const tournament = DATA.getTournamentById(tournamentId);
  if (!tournament) return;
  
  AppState.currentTournament = tournament;
  
  const content = document.getElementById('tournament-detail-content');
  const canJoin = AppState.currentUser.current_balance >= tournament.entry_fee;
  const slotsAvailable = tournament.slots_filled < tournament.slots_total;
  
  content.innerHTML = `
    <div class="tournament-detail">
      <div class="detail-header">
        <h2 class="detail-title">${tournament.name}</h2>
        <div class="detail-tags">
          <span class="tag">${tournament.type}</span>
          <span class="tag">${tournament.mode}</span>
          <span class="tag">${tournament.team_size}</span>
        </div>
        <p>${tournament.description}</p>
        <div class="detail-grid">
          <div class="info-item">
            <span class="info-label">Entry Fee</span>
            <span class="info-value">${CONFIG.settings.currency}${tournament.entry_fee}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Prize Pool</span>
            <span class="info-value">${CONFIG.settings.currency}${tournament.prize_pool}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Slots</span>
            <span class="info-value">${tournament.slots_filled}/${tournament.slots_total}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date & Time</span>
            <span class="info-value">${new Date(tournament.date).toLocaleDateString()} ${tournament.time}</span>
          </div>
        </div>
        ${canJoin && slotsAvailable ? `
          <button class="btn btn--primary" onclick="joinTournament('${tournament.id}')">Join Tournament</button>
        ` : !canJoin ? `
          <p style="color: var(--color-error); margin-top: 16px;">Insufficient balance. Please add money to your wallet.</p>
        ` : `
          <p style="color: var(--color-error); margin-top: 16px;">Tournament is full!</p>
        `}
      </div>
      
      ${tournament.room_id ? `
        <div class="detail-card">
          <h3 class="card-title">Room Details</h3>
          <div class="info-item">
            <span class="info-label">Room ID</span>
            <span class="info-value">${tournament.room_id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Password</span>
            <span class="info-value">${tournament.room_password}</span>
          </div>
        </div>
      ` : ''}
      
      <div class="detail-card">
        <h3 class="card-title">Prize Distribution</h3>
        <div class="prize-breakdown">
          <div class="prize-item">
            <span>1st Place</span>
            <span>${CONFIG.settings.currency}${Math.floor(tournament.prize_pool * 0.5)}</span>
          </div>
          <div class="prize-item">
            <span>2nd Place</span>
            <span>${CONFIG.settings.currency}${Math.floor(tournament.prize_pool * 0.3)}</span>
          </div>
          <div class="prize-item">
            <span>3rd Place</span>
            <span>${CONFIG.settings.currency}${Math.floor(tournament.prize_pool * 0.15)}</span>
          </div>
          <div class="prize-item">
            <span>4th Place</span>
            <span>${CONFIG.settings.currency}${Math.floor(tournament.prize_pool * 0.05)}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-card">
        <h3 class="card-title">Tournament Rules</h3>
        <ul>
          ${tournament.rules.map(rule => `<li>${rule}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  navigateToPage('tournament-detail');
}

function joinTournament(tournamentId) {
  const tournament = DATA.getTournamentById(tournamentId);
  const user = AppState.currentUser;
  
  if (user.current_balance < tournament.entry_fee) {
    alert('Insufficient balance!');
    return;
  }
  
  // TODO: Replace with actual API call
  if (confirm(`Join ${tournament.name} for ${CONFIG.settings.currency}${tournament.entry_fee}?`)) {
    user.current_balance -= tournament.entry_fee;
    tournament.slots_filled += 1;
    
    // Add transaction
    DATA.transactions.push({
      id: 'txn_' + Date.now(),
      uid: user.uid,
      type: 'entry_fee',
      amount: -tournament.entry_fee,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      description: `Tournament Entry - ${tournament.name}`,
      tournament_id: tournament.id
    });
    
    alert('Successfully joined tournament!');
    showTournamentDetail(tournamentId);
  }
}

// Wallet Functions
function loadWallet() {
  const user = AppState.currentUser;
  
  // Balance card
  const balanceCard = document.getElementById('balance-card');
  balanceCard.innerHTML = `
    <div class="balance-label">Current Balance</div>
    <div class="balance-amount">${CONFIG.settings.currency}${user.current_balance}</div>
  `;
  
  // UPI ID
  document.getElementById('upi-id').textContent = CONFIG.payment.upiId;
  
  // Load transactions
  displayTransactions();
  
  // Transaction filter buttons
  document.querySelectorAll('#history-tab .filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#history-tab .filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      AppState.transactionFilter = e.target.dataset.filter;
      displayTransactions();
    });
  });
}

function displayTransactions() {
  const container = document.getElementById('transactions-list');
  const userTransactions = DATA.getUserTransactions(AppState.currentUser.uid);
  
  let filtered = userTransactions;
  if (AppState.transactionFilter !== 'all') {
    filtered = userTransactions.filter(t => t.type === AppState.transactionFilter);
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No transactions found</p></div>';
    return;
  }
  
  container.innerHTML = filtered.map(txn => `
    <div class="transaction-item">
      <div class="transaction-info">
        <h4>${txn.description}</h4>
        <div class="transaction-date">${new Date(txn.date).toLocaleDateString()} ${txn.time}</div>
      </div>
      <div class="transaction-amount">
        <div class="amount ${txn.amount > 0 ? 'positive' : 'negative'}">
          ${txn.amount > 0 ? '+' : ''}${CONFIG.settings.currency}${Math.abs(txn.amount)}
        </div>
        <span class="status ${txn.status}">${txn.status}</span>
      </div>
    </div>
  `).join('');
}

function switchWalletTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });
  
  // Show selected tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}-tab`).classList.add('active');
}

function handleAddMoney(e) {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById('add-amount').value);
  const transactionId = document.getElementById('transaction-id').value;
  const screenshot = document.getElementById('payment-screenshot').files[0];
  
  if (amount < CONFIG.payment.minDeposit) {
    alert(`Minimum deposit is ${CONFIG.settings.currency}${CONFIG.payment.minDeposit}`);
    return;
  }
  
  // TODO: Replace with actual API call
  const user = AppState.currentUser;
  user.current_balance += amount;
  
  // Add transaction
  DATA.transactions.push({
    id: 'txn_' + Date.now(),
    uid: user.uid,
    type: 'deposit',
    amount: amount,
    status: 'completed',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    description: 'UPI Payment - Added money',
    transaction_id: transactionId
  });
  
  alert('Money added successfully!');
  e.target.reset();
  loadWallet();
}

function handleWithdraw(e) {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById('withdraw-amount').value);
  const upiId = document.getElementById('withdraw-upi').value;
  const user = AppState.currentUser;
  
  if (amount < CONFIG.payment.minWithdraw) {
    alert(`Minimum withdrawal is ${CONFIG.settings.currency}${CONFIG.payment.minWithdraw}`);
    return;
  }
  
  if (amount > user.current_balance) {
    alert('Insufficient balance!');
    return;
  }
  
  // TODO: Replace with actual API call
  user.current_balance -= amount;
  
  // Add transaction
  DATA.transactions.push({
    id: 'txn_' + Date.now(),
    uid: user.uid,
    type: 'withdrawal',
    amount: -amount,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    description: 'Withdrawal to UPI ID',
    upi_id: upiId
  });
  
  alert('Withdrawal request submitted! It will be processed within 24-48 hours.');
  e.target.reset();
  loadWallet();
}

// Team Functions
function loadTeamPage() {
  const user = AppState.currentUser;
  const teamContent = document.getElementById('team-content');
  
  if (user.team_id) {
    const team = DATA.getTeamById(user.team_id);
    teamContent.innerHTML = renderTeamSection(team, user);
  } else {
    teamContent.innerHTML = renderNoTeamSection();
  }
  
  attachTeamEventListeners();
}

function renderTeamSection(team, user) {
  return `
    <div class="team-section">
      <div class="team-header">
        <h3>${team.name}</h3>
        ${user.is_team_admin ? `
          <button class="btn btn--sm btn--outline" onclick="dissolveTeam()">Dissolve Team</button>
        ` : `
          <button class="btn btn--sm btn--outline" onclick="leaveTeam()">Leave Team</button>
        `}
      </div>
      
      <div class="team-code">
        <div class="team-code-label">Team Code</div>
        <div class="team-code-value">${team.team_code}</div>
        <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin-top: 8px;">
          Share this code with players to invite them
        </p>
      </div>
      
      <h4>Team Members (${team.members.length}/${CONFIG.team.maxMembers})</h4>
      <div class="members-list">
        ${team.members.map(member => `
          <div class="member-card">
            <div class="member-info">
              <div class="member-avatar">${DATA.getUserByUID(member.uid)?.avatar || member.ign.substring(0, 2)}</div>
              <div class="member-details">
                <h4>${member.ign}</h4>
                <div class="member-uid">UID: ${member.uid}</div>
              </div>
            </div>
            <div>
              ${member.role === 'admin' ? `
                <span class="member-role">Admin</span>
              ` : user.is_team_admin ? `
                <button class="btn btn--sm btn--outline" onclick="removeMember('${member.uid}')">Remove</button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      ${user.is_team_admin && team.members.length < CONFIG.team.maxMembers ? `
        <div class="team-section" style="margin-top: 24px;">
          <h4>Invite Player</h4>
          <form id="search-player-form" onsubmit="searchPlayer(event)">
            <div class="form-group">
              <label class="form-label">Search by UID</label>
              <input type="text" id="search-uid" class="form-control" placeholder="Enter player UID" required>
            </div>
            <button type="submit" class="btn btn--primary">Search</button>
          </form>
          <div id="search-result" style="margin-top: 16px;"></div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderNoTeamSection() {
  return `
    <div class="team-section">
      <h3>Create a Team</h3>
      <form id="create-team-form" onsubmit="createTeam(event)">
        <div class="form-group">
          <label class="form-label">Team Name</label>
          <input type="text" id="team-name" class="form-control" placeholder="Enter team name" required>
        </div>
        <button type="submit" class="btn btn--primary">Create Team</button>
      </form>
    </div>
    
    <div class="team-section">
      <h3>Join a Team</h3>
      <form id="join-team-form" onsubmit="joinTeamByCode(event)">
        <div class="form-group">
          <label class="form-label">Team Code</label>
          <input type="text" id="join-team-code" class="form-control" placeholder="Enter team code" required maxlength="6">
        </div>
        <button type="submit" class="btn btn--primary">Join Team</button>
      </form>
      <div id="join-team-result" style="margin-top: 16px;"></div>
    </div>
  `;
}

function attachTeamEventListeners() {
  // Event listeners are attached via onclick in HTML for simplicity
}

function createTeam(e) {
  e.preventDefault();
  
  const teamName = document.getElementById('team-name').value.trim();
  const user = AppState.currentUser;
  
  // Generate team code
  const teamCode = generateTeamCode();
  
  // TODO: Replace with actual API call
  const newTeam = {
    id: 'team_' + Date.now(),
    name: teamName,
    admin_uid: user.uid,
    team_code: teamCode,
    created_date: new Date().toISOString().split('T')[0],
    members: [
      {
        uid: user.uid,
        ign: user.ign,
        role: 'admin',
        joined_date: new Date().toISOString().split('T')[0]
      }
    ]
  };
  
  DATA.teams.push(newTeam);
  user.team_id = newTeam.id;
  user.is_team_admin = true;
  
  alert('Team created successfully!');
  loadTeamPage();
}

function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function joinTeamByCode(e) {
  e.preventDefault();
  
  const teamCode = document.getElementById('join-team-code').value.toUpperCase().trim();
  const user = AppState.currentUser;
  const result = document.getElementById('join-team-result');
  
  // Find team by code
  const team = DATA.teams.find(t => t.team_code === teamCode);
  
  if (!team) {
    result.innerHTML = '<p style="color: var(--color-error);">Team not found!</p>';
    return;
  }
  
  if (team.members.length >= CONFIG.team.maxMembers) {
    result.innerHTML = '<p style="color: var(--color-error);">Team is full!</p>';
    return;
  }
  
  result.innerHTML = `
    <div class="detail-card">
      <h4>${team.name}</h4>
      <p>Admin: ${team.members.find(m => m.role === 'admin').ign}</p>
      <p>Members: ${team.members.length}/${CONFIG.team.maxMembers}</p>
      <button class="btn btn--primary" onclick="sendJoinRequest('${team.id}')">Send Join Request</button>
    </div>
  `;
}

function sendJoinRequest(teamId) {
  const team = DATA.getTeamById(teamId);
  const user = AppState.currentUser;
  
  // TODO: Replace with actual API call
  // Add notification to team admin
  DATA.notifications.push({
    id: 'notif_' + Date.now(),
    uid: team.admin_uid,
    type: 'team_request',
    title: 'Team Join Request',
    message: `${user.ign} requested to join ${team.name}`,
    timestamp: new Date().toISOString(),
    read: false,
    action_required: true,
    data: {
      team_id: team.id,
      from_uid: user.uid,
      from_ign: user.ign
    }
  });
  
  alert('Join request sent to team admin!');
  loadTeamPage();
}

function searchPlayer(e) {
  e.preventDefault();
  
  const searchUid = document.getElementById('search-uid').value.trim();
  const result = document.getElementById('search-result');
  const user = AppState.currentUser;
  const team = DATA.getTeamById(user.team_id);
  
  const player = DATA.getUserByUID(searchUid);
  
  if (!player) {
    result.innerHTML = '<p style="color: var(--color-error);">Player not found!</p>';
    return;
  }
  
  if (player.uid === user.uid) {
    result.innerHTML = '<p style="color: var(--color-error);">Cannot invite yourself!</p>';
    return;
  }
  
  if (player.team_id) {
    result.innerHTML = '<p style="color: var(--color-error);">Player is already in a team!</p>';
    return;
  }
  
  if (team.members.length >= CONFIG.team.maxMembers) {
    result.innerHTML = '<p style="color: var(--color-error);">Team is full!</p>';
    return;
  }
  
  result.innerHTML = `
    <div class="detail-card">
      <div class="member-info">
        <div class="member-avatar">${player.avatar}</div>
        <div class="member-details">
          <h4>${player.ign}</h4>
          <div class="member-uid">UID: ${player.uid}</div>
          <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-top: 4px;">
            ${player.total_tournaments} tournaments | ${player.win_rate}% win rate
          </div>
        </div>
      </div>
      <button class="btn btn--primary" onclick="invitePlayer('${player.uid}')">Send Invite</button>
    </div>
  `;
}

function invitePlayer(playerUid) {
  const user = AppState.currentUser;
  const team = DATA.getTeamById(user.team_id);
  
  // TODO: Replace with actual API call
  // Add notification to player
  DATA.notifications.push({
    id: 'notif_' + Date.now(),
    uid: playerUid,
    type: 'team_invite',
    title: 'Team Invitation',
    message: `${user.ign} invited you to join ${team.name}`,
    timestamp: new Date().toISOString(),
    read: false,
    action_required: true,
    data: {
      team_id: team.id,
      from_uid: user.uid,
      from_ign: user.ign
    }
  });
  
  alert('Invitation sent!');
  document.getElementById('search-result').innerHTML = '';
  document.getElementById('search-uid').value = '';
}

function removeMember(memberUid) {
  const user = AppState.currentUser;
  const team = DATA.getTeamById(user.team_id);
  
  if (!user.is_team_admin) {
    alert('Only admin can remove members!');
    return;
  }
  
  if (confirm('Remove this member from the team?')) {
    // TODO: Replace with actual API call
    team.members = team.members.filter(m => m.uid !== memberUid);
    
    // Update removed user
    const removedUser = DATA.getUserByUID(memberUid);
    if (removedUser) {
      removedUser.team_id = null;
      removedUser.is_team_admin = false;
    }
    
    loadTeamPage();
  }
}

function leaveTeam() {
  if (confirm('Are you sure you want to leave the team?')) {
    const user = AppState.currentUser;
    const team = DATA.getTeamById(user.team_id);
    
    // TODO: Replace with actual API call
    team.members = team.members.filter(m => m.uid !== user.uid);
    user.team_id = null;
    user.is_team_admin = false;
    
    loadTeamPage();
  }
}

function dissolveTeam() {
  if (confirm('Are you sure you want to dissolve the team? All members will be removed.')) {
    const user = AppState.currentUser;
    const team = DATA.getTeamById(user.team_id);
    
    // TODO: Replace with actual API call
    // Remove team from all members
    team.members.forEach(member => {
      const memberUser = DATA.getUserByUID(member.uid);
      if (memberUser) {
        memberUser.team_id = null;
        memberUser.is_team_admin = false;
      }
    });
    
    // Remove team
    DATA.teams = DATA.teams.filter(t => t.id !== team.id);
    
    alert('Team dissolved successfully!');
    loadTeamPage();
  }
}

// Profile Functions
function loadProfile() {
  const user = AppState.currentUser;
  
  // Profile header
  const profileHeader = document.getElementById('profile-header');
  profileHeader.innerHTML = `
    <div class="profile-avatar">${user.avatar}</div>
    <h2 class="profile-name">${user.ign}</h2>
    <div class="profile-uid">UID: ${user.uid}</div>
    <div style="color: var(--color-text-secondary);">Member since ${new Date(user.joined_date).toLocaleDateString()}</div>
  `;
  
  // Stats cards
  const profileStats = document.getElementById('profile-stats');
  profileStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Tournaments</div>
      <div class="stat-value">${user.total_tournaments}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Wins</div>
      <div class="stat-value primary">${user.wins}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Win Rate</div>
      <div class="stat-value">${user.win_rate}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Earnings</div>
      <div class="stat-value primary">${CONFIG.settings.currency}${user.total_earnings}</div>
    </div>
  `;
  
  // Tournament history table
  const historyTable = document.getElementById('tournament-history-table');
  const history = DATA.getUserTournamentHistory(user.uid);
  
  historyTable.innerHTML = `
    <thead>
      <tr>
        <th>Tournament</th>
        <th>Date</th>
        <th>Position</th>
        <th>Prize</th>
      </tr>
    </thead>
    <tbody>
      ${history.map(h => `
        <tr>
          <td>${h.tournament_name}</td>
          <td>${new Date(h.date).toLocaleDateString()}</td>
          <td>${h.position}/${h.participants}</td>
          <td>${h.prize_won > 0 ? CONFIG.settings.currency + h.prize_won : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

// Support Functions
function loadSupport() {
  // Load rules accordion
  const rulesAccordion = document.getElementById('rules-accordion');
  rulesAccordion.innerHTML = DATA.rules.map((rule, index) => `
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <span>${rule.title}</span>
        <span>+</span>
      </div>
      <div class="accordion-content">
        <div class="accordion-body">${rule.content}</div>
      </div>
    </div>
  `).join('');
  
  // Load FAQs
  const faqAccordion = document.getElementById('faq-accordion');
  faqAccordion.innerHTML = DATA.faqs.map((faq, index) => `
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <span>${faq.question}</span>
        <span>+</span>
      </div>
      <div class="accordion-content">
        <div class="accordion-body">${faq.answer}</div>
      </div>
    </div>
  `).join('');
}

function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const isActive = content.classList.contains('active');
  
  // Close all accordions
  document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.accordion-header span:last-child').forEach(s => s.textContent = '+');
  
  // Open clicked accordion if it wasn't active
  if (!isActive) {
    content.classList.add('active');
    header.querySelector('span:last-child').textContent = '-';
  }
}

function handleContactForm(e) {
  e.preventDefault();
  // TODO: Replace with actual API call
  alert('Your message has been sent! We will get back to you soon.');
  e.target.reset();
}

function handleReportForm(e) {
  e.preventDefault();
  // TODO: Replace with actual API call
  alert('Your report has been submitted. We will investigate and take appropriate action.');
  e.target.reset();
}

// Notification Functions
function updateNotificationBadge() {
  const notifications = DATA.getUserNotifications(AppState.currentUser.uid);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const badge = document.getElementById('notification-badge');
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

function toggleNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  panel.classList.toggle('active');
  
  if (panel.classList.contains('active')) {
    loadNotifications();
  }
}

function closeNotificationPanel() {
  document.getElementById('notification-panel').classList.remove('active');
}

function loadNotifications() {
  const notifications = DATA.getUserNotifications(AppState.currentUser.uid);
  const container = document.getElementById('notification-list');
  
  // Filter out expired notifications (48 hours)
  const now = new Date();
  const validNotifications = notifications.filter(n => {
    const notifTime = new Date(n.timestamp);
    const hoursDiff = (now - notifTime) / (1000 * 60 * 60);
    return hoursDiff < CONFIG.notifications.expiryHours;
  });
  
  if (validNotifications.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
    return;
  }
  
  // Sort by timestamp (newest first)
  validNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  container.innerHTML = validNotifications.map(notif => {
    const timeAgo = getTimeAgo(new Date(notif.timestamp));
    
    return `
      <div class="notification-item ${notif.read ? '' : 'unread'}">
        <div class="notification-item-header">
          <div>
            <div class="notification-title">${notif.title}</div>
            <div class="notification-time">${timeAgo}</div>
          </div>
        </div>
        <div class="notification-message">${notif.message}</div>
        ${notif.action_required ? `
          <div class="notification-actions">
            ${notif.type === 'team_invite' ? `
              <button class="btn btn--sm btn--primary" onclick="acceptTeamInvite('${notif.id}', '${notif.data.team_id}')">Accept</button>
              <button class="btn btn--sm btn--outline" onclick="declineTeamInvite('${notif.id}')">Decline</button>
            ` : notif.type === 'team_request' ? `
              <button class="btn btn--sm btn--primary" onclick="acceptTeamRequest('${notif.id}', '${notif.data.from_uid}')">Accept</button>
              <button class="btn btn--sm btn--outline" onclick="declineTeamRequest('${notif.id}')">Decline</button>
            ` : ''}
          </div>
        ` : ''}
        ${!notif.read ? `
          <button class="btn btn--sm btn--outline" onclick="markAsRead('${notif.id}')" style="margin-top: 8px;">Mark as Read</button>
        ` : ''}
      </div>
    `;
  }).join('');
}

function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

function markAsRead(notifId) {
  // TODO: Replace with actual API call
  const notif = DATA.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
  }
  loadNotifications();
  updateNotificationBadge();
}

function acceptTeamInvite(notifId, teamId) {
  const user = AppState.currentUser;
  const team = DATA.getTeamById(teamId);
  
  if (!team) {
    alert('Team not found!');
    return;
  }
  
  if (user.team_id) {
    alert('You are already in a team! Leave your current team first.');
    return;
  }
  
  if (team.members.length >= CONFIG.team.maxMembers) {
    alert('Team is full!');
    return;
  }
  
  // TODO: Replace with actual API call
  team.members.push({
    uid: user.uid,
    ign: user.ign,
    role: 'member',
    joined_date: new Date().toISOString().split('T')[0]
  });
  
  user.team_id = team.id;
  
  // Remove notification
  DATA.notifications = DATA.notifications.filter(n => n.id !== notifId);
  
  alert('Successfully joined team!');
  loadNotifications();
  updateNotificationBadge();
}

function declineTeamInvite(notifId) {
  // TODO: Replace with actual API call
  DATA.notifications = DATA.notifications.filter(n => n.id !== notifId);
  loadNotifications();
  updateNotificationBadge();
}

function acceptTeamRequest(notifId, playerUid) {
  const user = AppState.currentUser;
  const team = DATA.getTeamById(user.team_id);
  const player = DATA.getUserByUID(playerUid);
  
  if (!team || !player) {
    alert('Invalid request!');
    return;
  }
  
  if (team.members.length >= CONFIG.team.maxMembers) {
    alert('Team is full!');
    return;
  }
  
  if (player.team_id) {
    alert('Player is already in another team!');
    return;
  }
  
  // TODO: Replace with actual API call
  team.members.push({
    uid: player.uid,
    ign: player.ign,
    role: 'member',
    joined_date: new Date().toISOString().split('T')[0]
  });
  
  player.team_id = team.id;
  
  // Remove notification
  DATA.notifications = DATA.notifications.filter(n => n.id !== notifId);
  
  alert('Player added to team!');
  loadNotifications();
  updateNotificationBadge();
}

function declineTeamRequest(notifId) {
  // TODO: Replace with actual API call
  DATA.notifications = DATA.notifications.filter(n => n.id !== notifId);
  loadNotifications();
  updateNotificationBadge();
}

// Utility Functions
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function showModal(content) {
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal').classList.add('active');
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}