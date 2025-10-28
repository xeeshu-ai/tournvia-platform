// Tournvia Configuration
const CONFIG = {
  // Application Info
  app: {
    name: 'Tournvia',
    version: '1.0.0',
    description: 'Free Fire Tournament Platform'
  },

  // API Configuration (for future backend integration)
  api: {
    baseUrl: 'https://api.tournvia.com', // TODO: Replace with actual API URL
    endpoints: {
      // Authentication
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      
      // Users
      getUser: '/users/:uid',
      updateUser: '/users/:uid',
      searchUser: '/users/search',
      
      // Tournaments
      getTournaments: '/tournaments',
      getTournament: '/tournaments/:id',
      joinTournament: '/tournaments/:id/join',
      
      // Teams
      createTeam: '/teams',
      getTeam: '/teams/:id',
      joinTeam: '/teams/join',
      leaveTeam: '/teams/:id/leave',
      invitePlayer: '/teams/:id/invite',
      respondToInvite: '/teams/invite/:id/respond',
      
      // Wallet
      getBalance: '/wallet/balance',
      getTransactions: '/wallet/transactions',
      addMoney: '/wallet/deposit',
      withdraw: '/wallet/withdraw',
      
      // Notifications
      getNotifications: '/notifications',
      markAsRead: '/notifications/:id/read',
      deleteNotification: '/notifications/:id'
    }
  },

  // App Settings
  settings: {
    currency: '₹',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    language: 'en'
  },

  // Team Settings
  team: {
    maxMembers: 6,
    codeLength: 6,
    roles: ['admin', 'member']
  },

  // Notification Settings
  notifications: {
    expiryHours: 48,
    types: {
      TEAM_INVITE: 'team_invite',
      TEAM_REQUEST: 'team_request',
      TOURNAMENT_UPDATE: 'tournament_update',
      TOURNAMENT_RESULT: 'tournament_result',
      PAYMENT: 'payment',
      GENERAL: 'general'
    }
  },

  // Payment Settings
  payment: {
    upiId: 'tournvia@paytm',
    merchantName: 'Tournvia Gaming',
    minDeposit: 100,
    maxDeposit: 10000,
    minWithdraw: 500,
    maxWithdraw: 50000
  },

  // Tournament Settings
  tournament: {
    modes: ['All', 'Normal', 'Headshot'],
    gameTypes: ['All', 'Battle Royale', 'Clash Squad', 'Lone Wolf'],
    teamSizes: ['Solo', 'Duo', 'Squad'],
    statuses: ['open', 'ongoing', 'completed', 'cancelled']
  },

  // Feature Toggles
  features: {
    teamManagement: true,
    walletSystem: true,
    notifications: true,
    tournaments: true,
    statistics: true,
    support: true
  },

  // Validation Rules
  validation: {
    uid: {
      minLength: 9,
      maxLength: 10,
      pattern: /^[0-9]{9,10}$/
    },
    phone: {
      pattern: /^\+91[0-9]{10}$/
    },
    password: {
      minLength: 6,
      maxLength: 20
    },
    teamCode: {
      length: 6,
      pattern: /^[A-Z0-9]{6}$/
    }
  },

  // Storage Keys
  storage: {
    currentUser: 'tournvia_current_user',
    authToken: 'tournvia_auth_token',
    preferences: 'tournvia_preferences'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}