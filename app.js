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
// Initialize Application
async function initApp() {
    try {
        // Check if user has an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            // User is logged in - get their profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profileError) throw profileError;
            
            // Set app state
            AppState.currentUser = profile;
            AppState.isLoggedIn = true;
            
            // Update last login
            await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);
            
            showApp();
            loadDashboard();
        } else {
            // No active session - show login page
            showLoginPage();
        }
        
    } catch (error) {
        console.error('Session check error:', error);
        showLoginPage();
    }
    
    // Set up event listeners
    setupEventListeners();
}


// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    
    if (event === 'SIGNED_IN' && session) {
        // User just logged in
        AppState.isLoggedIn = true;
    } else if (event === 'SIGNED_OUT') {
        // User just logged out
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        showLoginPage();
    } else if (event === 'TOKEN_REFRESHED') {
        // Token was automatically refreshed
        console.log('Session refreshed');
    }
});


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

// Add this line after line 140
document.getElementById('edit-profile-btn')?.addEventListener('click', showEditProfileModal);



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
        // Step 1: Check if UID already exists
        const { data: existingUID, error: uidError } = await supabase
            .from('profiles')
            .select('uid')
            .eq('uid', uid)
            .maybeSingle();
        
        // Step 2: Check if email already exists
        const { data: existingEmail, error: emailError } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.toLowerCase())
            .maybeSingle();
        
        // Handle different scenarios
        if (existingUID && existingEmail) {
            alert('User already exists! Both UID and email are already registered.');
            return;
        }
        
        if (existingUID) {
            alert('UID already exists! Please use a different Free Fire UID.');
            return;
        }
        
        if (existingEmail) {
            alert('Email already exists! Please use a different email or login.');
            return;
        }
        
        // Step 3: Register user with Supabase Auth
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
        
        if (error) {
            // Handle Supabase auth errors
            if (error.message.includes('already registered')) {
                alert('Email already exists! Please login instead.');
            } else {
                throw error;
            }
            return;
        }
        
        // Check if signup was successful (when email confirmation is disabled)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            alert('Email already exists! Please login instead.');
            return;
        }
        
        alert('Registration successful! You can now login with your email and password.');
        showLoginPage();
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle unique constraint violations at database level
        if (error.code === '23505') {
            if (error.message.includes('uid')) {
                alert('UID already exists! Please use a different Free Fire UID.');
            } else if (error.message.includes('email')) {
                alert('Email already exists! Please use a different email.');
            } else {
                alert('User already exists!');
            }
        } else {
            alert('Registration failed: ' + error.message);
        }
    }
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const ign = document.getElementById('edit-ign').value.trim();
    const uid = document.getElementById('edit-uid').value.trim();
    const avatarFile = document.getElementById('edit-avatar').files[0];
    const user = AppState.currentUser;
    
    // Validation
    if (!CONFIG.validation.uid.pattern.test(uid)) {
        alert('Invalid UID format! Must be 9-10 digits.');
        return;
    }
    
    try {
        let avatarUrl = user.avatar;
        
        // Step 1: Upload profile picture if provided
        if (avatarFile) {
            // Check file size (2MB max)
            if (avatarFile.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            
            // Upload to Supabase Storage
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, {
                    cacheControl: '3600',
                    upsert: true // Overwrite if exists
                });
            
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            avatarUrl = data.publicUrl;
        }
        
        // Step 2: Check if UID changed and if it's already taken
        if (uid !== user.uid) {
            const { data: existingUID } = await supabase
                .from('profiles')
                .select('uid')
                .eq('uid', uid)
                .maybeSingle();
            
            if (existingUID) {
                alert('This UID is already taken by another user!');
                return;
            }
        }
        
        // Step 3: Update profile in database
        const { error } = await supabase
            .from('profiles')
            .update({
                ign: ign,
                uid: uid,
                avatar: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        
        if (error) throw error;
        
        // Step 4: Update local state
        AppState.currentUser.ign = ign;
        AppState.currentUser.uid = uid;
        AppState.currentUser.avatar = avatarUrl;
        
        alert('Profile updated successfully!');
        loadProfile(); // Reload profile page
        
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile: ' + error.message);
    }
}

async function handleDeleteAccount() {
    // Confirmation prompts
    const confirm1 = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirm1) return;
    
    const confirm2 = confirm('All your data including tournament history, wallet balance, and team memberships will be permanently deleted. Continue?');
    if (!confirm2) return;
    
    const user = AppState.currentUser;
    
    try {
        // Note: Deleting from auth.users requires service_role key
        // For now, we'll delete profile and sign out
        // You'll need to set up a backend function for complete deletion
        
        // Delete profile picture from storage if exists
        if (user.avatar && user.avatar !== 'default.jpg') {
            const fileName = user.avatar.split('/').pop();
            await supabase.storage
                .from('avatars')
                .remove([fileName]);
        }
        
        // Delete profile (will cascade delete related data due to foreign keys)
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
        
        if (deleteError) throw deleteError;
        
        // Sign out
        await supabase.auth.signOut();
        
        // Clear app state
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        
        alert('Account deleted successfully. We\'re sorry to see you go!');
        showLoginPage();
        
    } catch (error) {
        console.error('Account deletion error:', error);
        alert('Failed to delete account: ' + error.message);
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
  updateNotificationBadge(); // This line calls the badge update
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

async function loadTeamPage() {
    const user = AppState.currentUser;
    const teamContent = document.getElementById('team-content');
    
    try {
        if (!user.team_id) {
            // User has no team
            teamContent.innerHTML = renderNoTeamSection();
        } else {
            // Get team details
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select('*')
                .eq('id', user.team_id)
                .maybeSingle();
            
            // Team was dissolved - clear user's team_id
            if (!team || teamError) {
                console.log('Team no longer exists, clearing team_id');
                
                // Clear team_id from user profile
                await supabase
                    .from('profiles')
                    .update({
                        team_id: null,
                        is_team_admin: false
                    })
                    .eq('id', user.id);
                
                // Update local state
                AppState.currentUser.team_id = null;
                AppState.currentUser.is_team_admin = false;
                
                // Show no team section
                teamContent.innerHTML = renderNoTeamSection();
                attachTeamEventListeners();
                return;
            }
            
            // Get team members
            const { data: members, error: membersError } = await supabase
                .from('profiles')
                .select('id, uid, ign, avatar, total_tournaments, wins, win_rate, is_team_admin')
                .eq('team_id', user.team_id);
            
            if (membersError) throw membersError;
            
            team.members = members.map(m => ({
                uid: m.uid,
                ign: m.ign,
                role: m.is_team_admin ? 'admin' : 'member',
                avatar: m.avatar,
                total_tournaments: m.total_tournaments,
                win_rate: m.win_rate
            }));
            
            teamContent.innerHTML = renderTeamSection(team, user);
        }
    } catch (error) {
        console.error('Load team error:', error);
        teamContent.innerHTML = '<p style="color: var(--color-error);">Error loading team data</p>';
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

async function createTeam(e) {
    e.preventDefault();
    
    // The correct ID from your HTML is 'team-name'
    const teamNameInput = document.getElementById('team-name');
    
    if (!teamNameInput) {
        console.error('Team name input not found');
        alert('Error: Cannot find team name input field');
        return;
    }
    
    const teamName = teamNameInput.value.trim();
    const user = AppState.currentUser;
    
    if (!teamName) {
        alert('Please enter a team name');
        return;
    }
    
    if (user.team_id) {
        alert('You are already in a team! Leave your current team first.');
        return;
    }
    
    try {
        // Generate team code
        const { data: teamCode, error: codeError } = await supabase.rpc('generate_team_code');
        if (codeError) throw codeError;
        
        // Create team
        const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert({
                name: teamName,
                admin_uid: user.id,
                team_code: teamCode,
                member_count: 1,
                max_members: 6
            })
            .select()
            .single();
        
        if (teamError) throw teamError;
        
        // Update user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                team_id: newTeam.id,
                is_team_admin: true
            })
            .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        // Update local state
        AppState.currentUser.team_id = newTeam.id;
        AppState.currentUser.is_team_admin = true;
        
        alert(`Team "${teamName}" created successfully!\n\nTeam Code: ${teamCode}\n\nShare this code with players to invite them.`);
        loadTeamPage();
        
    } catch (error) {
        console.error('Create team error:', error);
        alert('Failed to create team: ' + error.message);
    }
}



function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function joinTeamByCode(e) {
    if (e) e.preventDefault(); // Handle both onclick and onsubmit calls
    
    // The correct ID from your HTML is 'join-team-code'
    const codeInput = document.getElementById('join-team-code');
    
    if (!codeInput) {
        console.error('Team code input not found');
        alert('Error: Cannot find team code input field');
        return;
    }
    
    const teamCode = codeInput.value.trim().toUpperCase();
    const user = AppState.currentUser;
    
    if (!teamCode) {
        alert('Please enter a team code');
        return;
    }
    
    if (user.team_id) {
        alert('You are already in a team! Leave your current team first.');
        return;
    }
    
    try {
        // Find team by code
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('team_code', teamCode)
            .single();
        
        if (teamError || !team) {
            alert('Invalid team code! Please check and try again.');
            return;
        }
        
        // Check if team is full
        if (team.member_count >= team.max_members) {
            alert('This team is full! Maximum members reached.');
            return;
        }
        
        // Get team admin info
        const { data: admin, error: adminError } = await supabase
            .from('profiles')
            .select('ign')
            .eq('id', team.admin_uid)
            .single();
        
        if (adminError) throw adminError;
        
        // Send join request notification to admin
        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: team.admin_uid,
                type: 'team_request',
                title: 'Team Join Request',
                message: `${user.ign} wants to join your team "${team.name}"`,
                action_required: true,
                action_data: {
                    type: 'team_request',
                    team_id: team.id,
                    player_id: user.id,
                    player_ign: user.ign
                }
            });
        
        if (notifError) throw notifError;
        
        alert(`Join request sent to team admin (${admin.ign})!\nWait for approval.`);
        codeInput.value = '';
        
    } catch (error) {
        console.error('Join team error:', error);
        alert('Failed to join team: ' + error.message);
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
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

async function searchPlayer(e) {
    if (e) e.preventDefault(); // Handle both onclick and onsubmit calls
    
    // The correct ID from your HTML is 'search-uid'
    const uidInput = document.getElementById('search-uid');
    
    if (!uidInput) {
        console.error('Search UID input not found');
        alert('Error: Cannot find search input field');
        return;
    }
    
    const uid = uidInput.value.trim();
    const user = AppState.currentUser;
    
    if (!uid) {
        alert('Please enter a player UID');
        return;
    }
    
    if (!user.team_id || !user.is_team_admin) {
        alert('Only team admins can search and invite players!');
        return;
    }
    
    try {
        // Search player
        const { data: player, error: playerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('uid', uid)
            .single();
        
        if (playerError || !player) {
            alert('Player not found! Please check the UID.');
            return;
        }
        
        if (player.id === user.id) {
            alert('You cannot invite yourself!');
            return;
        }
        
        if (player.team_id) {
            alert('This player is already in a team!');
            return;
        }
        
        // Check team capacity
        const { data: team } = await supabase
            .from('teams')
            .select('member_count, max_members')
            .eq('id', user.team_id)
            .single();
        
        if (team.member_count >= team.max_members) {
            alert('Your team is full! Cannot invite more players.');
            return;
        }
        
        // Display player - the correct ID from your HTML is 'search-result'
        const searchResults = document.getElementById('search-result');
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="player-search-card" style="background: var(--color-surface-light); padding: 16px; border-radius: 8px; margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div class="player-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                            ${player.avatar || player.ign.substring(0, 2).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0;">${player.ign}</h4>
                            <p style="margin: 0; color: var(--color-text-secondary); font-size: 0.9rem;">UID: ${player.uid}</p>
                            <p style="margin: 4px 0 0 0; font-size: 0.85rem;">Tournaments: ${player.total_tournaments} | Wins: ${player.wins} | Win Rate: ${player.win_rate}%</p>
                        </div>
                        <button class="btn btn--primary" onclick="invitePlayer('${player.id}', '${player.ign}')">
                            Invite
                        </button>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Search player error:', error);
        alert('Failed to search player: ' + error.message);
    }
}




async function invitePlayer(playerId, playerIgn) {
    const user = AppState.currentUser;
    
    try {
        // Get team info
        const { data: team } = await supabase
            .from('teams')
            .select('*')
            .eq('id', user.team_id)
            .single();
        
        // Check existing invitation
        const { data: existingInvite } = await supabase
            .from('team_invitations')
            .select('id')
            .eq('team_id', team.id)
            .eq('invited_user_id', playerId)
            .eq('status', 'pending')
            .maybeSingle();
        
        if (existingInvite) {
            alert('You have already sent an invitation to this player!');
            return;
        }
        
        // Create invitation
        const { error: inviteError } = await supabase
            .from('team_invitations')
            .insert({
                team_id: team.id,
                invited_user_id: playerId,
                invited_by_uid: user.id,
                status: 'pending'
            });
        
        if (inviteError) throw inviteError;
        
        // Send notification
        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: playerId,
                type: 'team_invite',
                title: 'Team Invitation',
                message: `${user.ign} invited you to join team "${team.name}"`,
                action_required: true,
                action_data: {
                    type: 'team_invite',
                    team_id: team.id,
                    team_name: team.name,
                    team_code: team.team_code,
                    invited_by: user.ign
                }
            });
        
        if (notifError) throw notifError;
        
        alert(`Invitation sent to ${playerIgn}!`);
        
        // Clear search results - use the correct ID from your HTML
        const searchResult = document.getElementById('search-result');
        const searchUid = document.getElementById('search-uid');
        
        if (searchResult) searchResult.innerHTML = '';
        if (searchUid) searchUid.value = '';
        
    } catch (error) {
        console.error('Invite player error:', error);
        alert('Failed to send invitation: ' + error.message);
    }
}



async function removeMember(memberUid) {
    const user = AppState.currentUser;
    
    if (!user.is_team_admin) {
        alert('Only team admins can remove members!');
        return;
    }
    
    try {
        // Get member's details by UID (Free Fire UID, not user id)
        const { data: member, error: memberError } = await supabase
            .from('profiles')
            .select('id, ign, uid')
            .eq('uid', memberUid)
            .single();
        
        if (memberError || !member) {
            console.error('Member lookup error:', memberError);
            alert('Could not find member. Please try again.');
            return;
        }
        
        const confirm1 = confirm(`Are you sure you want to remove ${member.ign} from the team?`);
        if (!confirm1) return;
        
        // Remove from team
        const { error: removeError } = await supabase
            .from('profiles')
            .update({
                team_id: null,
                is_team_admin: false
            })
            .eq('id', member.id);
        
        if (removeError) throw removeError;
        
        // Send notification to removed member
        await supabase
            .from('notifications')
            .insert({
                user_id: member.id,
                type: 'team',
                title: 'Removed from Team',
                message: `You have been removed from the team by ${user.ign}`,
                action_required: false
            });
        
        alert(`${member.ign} has been removed from the team.`);
        loadTeamPage();
        
    } catch (error) {
        console.error('Remove member error:', error);
        alert('Failed to remove member: ' + error.message);
    }
}




async function leaveTeam() {
    const user = AppState.currentUser;
    
    if (user.is_team_admin) {
        alert('Team admins cannot leave! Please dissolve the team or transfer admin rights first.');
        return;
    }
    
    const confirm1 = confirm('Are you sure you want to leave the team?');
    if (!confirm1) return;
    
    try {
        // Leave team
        const { error } = await supabase
            .from('profiles')
            .update({
                team_id: null,
                is_team_admin: false
            })
            .eq('id', user.id);
        
        if (error) throw error;
        
        // Update local state
        AppState.currentUser.team_id = null;
        AppState.currentUser.is_team_admin = false;
        
        alert('You have left the team.');
        loadTeamPage();
        
    } catch (error) {
        console.error('Leave team error:', error);
        alert('Failed to leave team: ' + error.message);
    }
}

async function dissolveTeam() {
    const user = AppState.currentUser;
    
    if (!user.is_team_admin) {
        alert('Only team admins can dissolve the team!');
        return;
    }
    
    const confirm1 = confirm('Are you sure you want to dissolve the team? This will remove all members and delete the team permanently.');
    if (!confirm1) return;
    
    const confirm2 = confirm('This action cannot be undone. Are you absolutely sure?');
    if (!confirm2) return;
    
    try {
        // Get all team members
        const { data: members } = await supabase
            .from('profiles')
            .select('id, ign')
            .eq('team_id', user.team_id);
        
        // Remove all members from team
        const { error: removeError } = await supabase
            .from('profiles')
            .update({
                team_id: null,
                is_team_admin: false
            })
            .eq('team_id', user.team_id);
        
        if (removeError) throw removeError;
        
        // Send notifications to all members
        for (const member of members) {
            if (member.id !== user.id) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: member.id,
                        type: 'team',
                        title: 'Team Dissolved',
                        message: `Your team has been dissolved by ${user.ign}`,
                        action_required: false
                    });
            }
        }
        
        // Delete team
        const { error: deleteError } = await supabase
            .from('teams')
            .delete()
            .eq('id', user.team_id);
        
        if (deleteError) throw deleteError;
        
        // Update local state
        AppState.currentUser.team_id = null;
        AppState.currentUser.is_team_admin = false;
        
        alert('Team has been dissolved.');
        loadTeamPage();
        
    } catch (error) {
        console.error('Dissolve team error:', error);
        alert('Failed to dissolve team: ' + error.message);
    }
}


// Profile Functions
function loadProfile() {
    const user = AppState.currentUser;
    
    if (!user) {
        console.error('No user data available!');
        return;
    }
    
    // Profile header
    const profileHeader = document.getElementById('profile-header');
    if (profileHeader) {
        profileHeader.innerHTML = `
            <div class="profile-avatar">${user.avatar || user.ign.substring(0, 2).toUpperCase()}</div>
            <h2 class="profile-name">${user.ign}</h2>
            <div class="profile-uid">UID: ${user.uid}</div>
            <div style="color: var(--color-text-secondary)">Member since ${new Date(user.joined_date).toLocaleDateString()}</div>
        `;
    }
    
    // DON'T pre-fill edit form here - it's done in the modal function
    // REMOVE THESE LINES:
    // document.getElementById('edit-ign').value = user.ign;
    // document.getElementById('edit-uid').value = user.uid;
    
    // Stats cards
    const profileStats = document.getElementById('profile-stats');
    if (profileStats) {
        profileStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Tournaments</div>
                <div class="stat-value">${user.total_tournaments || 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Wins</div>
                <div class="stat-value primary">${user.wins || 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Win Rate</div>
                <div class="stat-value">${user.win_rate || 0}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Earnings</div>
                <div class="stat-value primary">${CONFIG.settings.currency}${user.total_earnings || 0}</div>
            </div>
        `;
    }
    


    // Tournament history table
    const historyTable = document.getElementById('tournament-history-table');
    if (historyTable) {
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
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                        No tournament history yet. Join tournaments to see your history here!
                    </td>
                </tr>
            </tbody>
        `;
    }
}

// <-- This is the end of loadProfile function

// Show Edit Profile Modal - ADD THIS OUTSIDE loadProfile
function showEditProfileModal() {
    const user = AppState.currentUser;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 24px; text-align: center;">Edit Profile</h2>
        
        <form id="edit-profile-form-modal" class="support-form" style="max-width: 100%; padding: 0;">
            <div class="form-group">
                <label for="edit-ign-modal" class="form-label">In-Game Name (IGN)</label>
                <input type="text" id="edit-ign-modal" class="form-control" value="${user.ign}" required>
            </div>
            
            <div class="form-group">
                <label for="edit-uid-modal" class="form-label">Free Fire UID</label>
                <input type="text" id="edit-uid-modal" class="form-control" value="${user.uid}" required pattern="\\d{9,10}">
            </div>
            
            <div class="form-group">
                <label for="edit-avatar-modal" class="form-label">Profile Picture</label>
                <input type="file" id="edit-avatar-modal" class="form-control" accept="image/*">
                <p style="color: var(--color-text-secondary); font-size: 0.875rem; margin-top: 4px;">
                    Max 2MB, JPG/PNG only
                </p>
            </div>
            
            <button type="submit" class="btn btn--primary btn--full-width" style="margin-bottom: 16px;">
                Save Changes
            </button>
        </form>
        
        <hr style="margin: 32px 0; border: none; border-top: 1px solid var(--color-border);">
        
        <div style="background: rgba(255, 84, 89, 0.1); border: 1px solid rgba(255, 84, 89, 0.3); border-radius: 8px; padding: 20px;">
            <h3 style="margin-bottom: 8px; color: #FF5459;">Danger Zone</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 16px; font-size: 0.9rem;">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <button id="delete-account-btn-modal" class="btn btn--outline" style="color: #FF5459; border-color: #FF5459; width: 100%;">
                Delete My Account
            </button>
        </div>
    `;
    
    // Show modal
    document.getElementById('modal').classList.add('active');
    
    // Attach event listeners
    document.getElementById('edit-profile-form-modal').addEventListener('submit', handleEditProfileModal);
    document.getElementById('delete-account-btn-modal').addEventListener('click', handleDeleteAccountModal);
}

// Handle Edit Profile Modal Submit - ADD THIS OUTSIDE loadProfile
async function handleEditProfileModal(e) {
    e.preventDefault();
    
    const ign = document.getElementById('edit-ign-modal').value.trim();
    const uid = document.getElementById('edit-uid-modal').value.trim();
    const avatarFile = document.getElementById('edit-avatar-modal').files[0];
    const user = AppState.currentUser;
    
    if (!CONFIG.validation.uid.pattern.test(uid)) {
        alert('Invalid UID format! Must be 9-10 digits.');
        return;
    }
    
    try {
        let avatarUrl = user.avatar;
        
        if (avatarFile) {
            if (avatarFile.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }
            
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) throw uploadError;
            
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            avatarUrl = data.publicUrl;
        }
        
        if (uid !== user.uid) {
            const { data: existingUID } = await supabase
                .from('profiles')
                .select('uid')
                .eq('uid', uid)
                .maybeSingle();
            
            if (existingUID) {
                alert('This UID is already taken!');
                return;
            }
        }
        
        const { error } = await supabase
            .from('profiles')
            .update({
                ign: ign,
                uid: uid,
                avatar: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        
        if (error) throw error;
        
        AppState.currentUser.ign = ign;
        AppState.currentUser.uid = uid;
        AppState.currentUser.avatar = avatarUrl;
        
        alert('Profile updated successfully!');
        closeModal();
        loadProfile();
        
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile: ' + error.message);
    }
}

// Handle Delete Account from Modal - ADD THIS OUTSIDE loadProfile
async function handleDeleteAccountModal() {
    const confirm1 = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirm1) return;
    
    const confirm2 = confirm('All data will be permanently deleted. Continue?');
    if (!confirm2) return;
    
    const user = AppState.currentUser;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
        
        if (error) throw error;
        
        await supabase.auth.signOut();
        
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        
        alert('Account deleted successfully.');
        closeModal();
        showLoginPage();
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete account: ' + error.message);
    }
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



function toggleNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  panel.classList.toggle('active');
  
  if (panel.classList.contains('active')) {
    loadNotifications();
    // Update badge when panel opens
    setTimeout(() => updateNotificationBadge(), 500);
  }
}


function closeNotificationPanel() {
  document.getElementById('notification-panel').classList.remove('active');
}

async function loadNotifications() {
    const user = AppState.currentUser;
    const notifList = document.getElementById('notification-list');
    
    try {
        // Get notifications from database
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        if (!notifications || notifications.length === 0) {
            notifList.innerHTML = '<div class="empty-state">No notifications</div>';
            return;
        }
        
        notifList.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}">
                <div class="notification-icon ${notif.type}"></div>
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <span class="notification-time">${formatTime(notif.created_at)}</span>
                </div>
                ${notif.action_required ? `
                    <div class="notification-actions">
                        ${notif.action_data && notif.action_data.type === 'team_invite' ? `
                            <button class="btn btn--primary btn--small" onclick="acceptTeamInvite('${notif.id}', '${notif.action_data.team_id}')">Accept</button>
                            <button class="btn btn--outline btn--small" onclick="declineTeamInvite('${notif.id}')">Decline</button>
                        ` : notif.action_data && notif.action_data.type === 'team_request' ? `
                            <button class="btn btn--primary btn--small" onclick="acceptTeamRequest('${notif.id}', '${notif.action_data.player_id}', '${notif.action_data.team_id}')">Accept</button>
                            <button class="btn btn--outline btn--small" onclick="declineTeamRequest('${notif.id}')">Decline</button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Load notifications error:', error);
        notifList.innerHTML = '<div class="error-state">Error loading notifications</div>';
    }
}

async function updateNotificationBadge() {
    const user = AppState.currentUser;
    const badgeMobile = document.getElementById('notification-badge-mobile');
    const badgeDesktop = document.getElementById('notification-badge-desktop');
    
    if (!user) return;
    
    try {
        // Get unread notification count
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);
        
        if (error) throw error;
        
        const unreadCount = count || 0;
        
        // Update both badges (mobile + desktop)
        if (badgeMobile) {
            badgeMobile.textContent = unreadCount;
            badgeMobile.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        if (badgeDesktop) {
            badgeDesktop.textContent = unreadCount;
            badgeDesktop.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Update badge error:', error);
    }
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

async function acceptTeamInvite(notificationId, teamId) {
    const user = AppState.currentUser;
    
    if (user.team_id) {
        alert('You are already in a team! Leave your current team first.');
        return;
    }
    
    try {
        // Get team info
        const { data: team } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();
        
        // Check if team is full
        if (team.member_count >= team.max_members) {
            alert('This team is full! Cannot join.');
            await supabase.from('notifications').delete().eq('id', notificationId);
            loadNotifications();
            return;
        }
        
        // Join team
        const { error: joinError } = await supabase
            .from('profiles')
            .update({
                team_id: teamId,
                is_team_admin: false
            })
            .eq('id', user.id);
        
        if (joinError) throw joinError;
        
        // Update invitation status
        await supabase
            .from('team_invitations')
            .update({ status: 'accepted' })
            .eq('team_id', teamId)
            .eq('invited_user_id', user.id);
        
        // Delete notification
        await supabase.from('notifications').delete().eq('id', notificationId);
        
        // Notify team admin
        await supabase
            .from('notifications')
            .insert({
                user_id: team.admin_uid,
                type: 'team',
                title: 'Member Joined',
                message: `${user.ign} has joined your team "${team.name}"`,
                action_required: false
            });
        
        // Update local state
        AppState.currentUser.team_id = teamId;
        AppState.currentUser.is_team_admin = false;
        
        alert(`You have joined team "${team.name}"!`);
        loadNotifications();
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Accept invite error:', error);
        alert('Failed to accept invitation: ' + error.message);
    }
}


async function declineTeamInvite(notificationId) {
    try {
        // Delete notification
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);
        
        if (error) throw error;
        
        alert('Invitation declined.');
        loadNotifications();
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Decline invite error:', error);
        alert('Failed to decline invitation: ' + error.message);
    }
}


async function acceptTeamRequest(notificationId, playerId, teamId) {
    const user = AppState.currentUser;
    
    if (!user.is_team_admin) {
        alert('Only team admins can accept join requests!');
        return;
    }
    
    try {
        // Get team info
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();
        
        if (teamError) throw teamError;
        
        // Check if team is full
        if (team.member_count >= team.max_members) {
            alert('Your team is full! Cannot accept more members.');
            await supabase.from('notifications').delete().eq('id', notificationId);
            loadNotifications();
            updateNotificationBadge();
            return;
        }
        
        // Get player info
        const { data: player, error: playerError } = await supabase
            .from('profiles')
            .select('ign, team_id')
            .eq('id', playerId)
            .single();
        
        if (playerError) throw playerError;
        
        // Check if player already in a team
        if (player.team_id) {
            alert('This player has already joined another team!');
            await supabase.from('notifications').delete().eq('id', notificationId);
            loadNotifications();
            updateNotificationBadge();
            return;
        }
        
        // Add player to team - THIS IS THE CRITICAL PART
        const { error: addError } = await supabase
            .from('profiles')
            .update({
                team_id: teamId,
                is_team_admin: false
            })
            .eq('id', playerId);
        
        if (addError) {
            console.error('Error adding player to team:', addError);
            throw addError;
        }
        
        // Verify the update was successful
        const { data: verifyPlayer } = await supabase
            .from('profiles')
            .select('team_id')
            .eq('id', playerId)
            .single();
        
        console.log('Player team_id after update:', verifyPlayer.team_id);
        
        // Delete notification
        await supabase.from('notifications').delete().eq('id', notificationId);
        
        // Notify player
        await supabase
            .from('notifications')
            .insert({
                user_id: playerId,
                type: 'team',
                title: 'Join Request Accepted',
                message: `Your request to join team "${team.name}" has been accepted! Refresh the page to see your team.`,
                action_required: false
            });
        
        alert(`${player.ign} has been added to your team!`);
        loadNotifications();
        updateNotificationBadge();
        loadTeamPage(); // Reload team page to show new member
        
    } catch (error) {
        console.error('Accept request error:', error);
        alert('Failed to accept request: ' + error.message);
    }
}

async function declineTeamRequest(notificationId) {
    try {
        // Delete notification
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);
        
        if (error) throw error;
        
        alert('Join request declined.');
        loadNotifications();
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Decline request error:', error);
        alert('Failed to decline request: ' + error.message);
    }
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