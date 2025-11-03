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
    baseUrl: 'https://api.tournvia.com',
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

  // Tournament Settings - FRONTEND FILTERS (Keep as is)
  tournament: {
    modes: ['All', 'Normal', 'Headshot'],
    gameTypes: ['All', 'Battle Royale', 'Clash Squad', 'Lone Wolf'],
    teamSizes: ['Solo', 'Duo', 'Squad'],
    statuses: ['open', 'ongoing', 'completed', 'cancelled'],
    
    // BACKEND CONFIGURATION - Detailed team size setups
    gameModes: {
      battle_royale: {
        name: 'Battle Royale',
        description: 'Classic BR mode',
        maps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
        teamModes: {
          solo: {
            name: 'Solo',
            teamSize: 1,
            options: [
              { teams: 20, players: 20, label: '20 Players' },
              { teams: 32, players: 32, label: '32 Players' },
              { teams: 48, players: 48, label: '48 Players' }
            ]
          },
          duo: {
            name: 'Duo',
            teamSize: 2,
            options: [
              { teams: 10, players: 20, label: '10 Teams (20 Players)' },
              { teams: 16, players: 32, label: '16 Teams (32 Players)' },
              { teams: 24, players: 48, label: '24 Teams (48 Players)' }
            ]
          },
          squad: {
            name: 'Squad',
            teamSize: 4,
            options: [
              { teams: 5, players: 20, label: '5 Teams (20 Players)' },
              { teams: 8, players: 32, label: '8 Teams (32 Players)' },
              { teams: 12, players: 48, label: '12 Teams (48 Players)' }
            ]
          }
        }
      },
      clash_squad: {
        name: 'Clash Squad',
        description: '4v4 tactical mode',
        teamModes: {
          solo: {
            name: 'Solo (1v1)',
            teamSize: 1,
            options: [{ teams: 2, players: 2, label: '1v1 (2 Players)' }]
          },
          duo: {
            name: 'Duo (2v2)',
            teamSize: 2,
            options: [{ teams: 2, players: 4, label: '2v2 (4 Players)' }]
          },
          squad: {
            name: 'Squad (4v4)',
            teamSize: 4,
            options: [{ teams: 2, players: 8, label: '4v4 (8 Players)' }]
          },
          '6v6': {
            name: '6v6',
            teamSize: 6,
            options: [{ teams: 2, players: 12, label: '6v6 (12 Players)' }]
          }
        }
      },
      lone_wolf: {
        name: 'Lone Wolf',
        description: 'Solo survival mode',
        teamModes: {
          solo: {
            name: 'Solo (1v1)',
            teamSize: 1,
            options: [{ teams: 2, players: 2, label: '1v1 (2 Players)' }]
          },
          duo: {
            name: 'Duo (2v2)',
            teamSize: 2,
            options: [{ teams: 2, players: 4, label: '2v2 (4 Players)' }]
          }
        }
      }
    },
    
    status: {
      upcoming: { label: 'Upcoming', color: '#3B82F6' },
      registration_open: { label: 'Registration Open', color: '#10B981' },
      registration_closed: { label: 'Registration Closed', color: '#F59E0B' },
      ongoing: { label: 'Live', color: '#EF4444' },
      completed: { label: 'Completed', color: '#6B7280' },
      cancelled: { label: 'Cancelled', color: '#DC2626' }
    }
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
      pattern: /^\d{9,10}$/,
      message: 'UID must be 9-10 digits'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
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
