// Sample Data for Tournvia
// TODO: Replace with actual API calls to Supabase

const DATA = {
  // Current logged-in user (simulated)
  currentUser: {
    uid: '2847593021',
    ign: 'ProGamerX',
    phone: '+919876543210',
    email: 'progamer@example.com',
    password: 'demo123', // In production, never store passwords in frontend
    current_balance: 2450,
    total_tournaments: 47,
    wins: 23,
    total_earnings: 18500,
    win_rate: 48.9,
    team_id: 'team_001',
    is_team_admin: true,
    avatar: 'avatar1.jpg',
    joined_date: '2024-01-15'
  },

  // All users data
  users: [
    {
      uid: '2847593021',
      ign: 'ProGamerX',
      phone: '+919876543210',
      email: 'progamer@example.com',
      password: 'demo123',
      current_balance: 2450,
      total_tournaments: 47,
      wins: 23,
      total_earnings: 18500,
      win_rate: 48.9,
      team_id: 'team_001',
      is_team_admin: true,
      avatar: 'PG',
      joined_date: '2024-01-15'
    },
    {
      uid: '3947281056',
      ign: 'SniperKing',
      phone: '+919876543211',
      password: 'demo123',
      current_balance: 1200,
      total_tournaments: 32,
      wins: 18,
      total_earnings: 12300,
      win_rate: 56.3,
      team_id: 'team_001',
      is_team_admin: false,
      avatar: 'SK',
      joined_date: '2024-02-10'
    },
    {
      uid: '4738291047',
      ign: 'HeadHunter',
      phone: '+919876543212',
      password: 'demo123',
      current_balance: 850,
      total_tournaments: 29,
      wins: 11,
      total_earnings: 8900,
      win_rate: 37.9,
      team_id: null,
      is_team_admin: false,
      avatar: 'HH',
      joined_date: '2024-03-05'
    },
    {
      uid: '5839472018',
      ign: 'FireStorm',
      phone: '+919876543213',
      password: 'demo123',
      current_balance: 1500,
      total_tournaments: 38,
      wins: 16,
      total_earnings: 14200,
      win_rate: 42.1,
      team_id: 'team_001',
      is_team_admin: false,
      avatar: 'FS',
      joined_date: '2024-02-20'
    },
    {
      uid: '6749382056',
      ign: 'EliteLeader',
      phone: '+919876543214',
      password: 'demo123',
      current_balance: 3200,
      total_tournaments: 55,
      wins: 28,
      total_earnings: 25000,
      win_rate: 50.9,
      team_id: 'team_002',
      is_team_admin: true,
      avatar: 'EL',
      joined_date: '2024-01-10'
    },
    {
      uid: '7849302847',
      ign: 'QuickShot',
      phone: '+919876543215',
      password: 'demo123',
      current_balance: 980,
      total_tournaments: 25,
      wins: 10,
      total_earnings: 8500,
      win_rate: 40.0,
      team_id: 'team_002',
      is_team_admin: false,
      avatar: 'QS',
      joined_date: '2024-03-01'
    },
    {
      uid: '8592847103',
      ign: 'NightRider',
      phone: '+919876543216',
      password: 'demo123',
      current_balance: 1750,
      total_tournaments: 42,
      wins: 19,
      total_earnings: 16800,
      win_rate: 45.2,
      team_id: null,
      is_team_admin: false,
      avatar: 'NR',
      joined_date: '2024-02-15'
    },
    {
      uid: '9284756301',
      ign: 'ShadowNinja',
      phone: '+919876543217',
      password: 'demo123',
      current_balance: 2100,
      total_tournaments: 48,
      wins: 22,
      total_earnings: 19500,
      win_rate: 45.8,
      team_id: null,
      is_team_admin: false,
      avatar: 'SN',
      joined_date: '2024-01-25'
    }
  ],

  // Tournaments data
  tournaments: [
    {
      id: 'tour_001',
      name: 'Friday Night Battle',
      type: 'Battle Royale',
      mode: 'Normal',
      team_size: 'Squad',
      entry_fee: 100,
      prize_pool: 5000,
      slots_total: 48,
      slots_filled: 32,
      date: '2025-10-27',
      time: '20:00',
      status: 'open',
      room_id: 'FF2847593',
      room_password: 'FRIDAY123',
      organizer: 'Tournvia Official',
      description: 'Epic Friday night tournament with amazing prizes!',
      rules: ['No teaming in solo mode', 'Fair play only', 'Screenshot required for proof']
    },
    {
      id: 'tour_002',
      name: 'Headshot Championship',
      type: 'Clash Squad',
      mode: 'Headshot',
      team_size: 'Squad',
      entry_fee: 150,
      prize_pool: 8000,
      slots_total: 32,
      slots_filled: 28,
      date: '2025-10-28',
      time: '19:30',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Show off your headshot skills in this intense clash squad tournament!',
      rules: ['Headshot only mode', 'No camping', 'Team coordination required']
    },
    {
      id: 'tour_003',
      name: 'Solo Warrior',
      type: 'Battle Royale',
      mode: 'Normal',
      team_size: 'Solo',
      entry_fee: 50,
      prize_pool: 2500,
      slots_total: 64,
      slots_filled: 45,
      date: '2025-10-29',
      time: '21:00',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Test your solo skills in this intense battle royale!',
      rules: ['Solo only', 'No teaming', 'Survival is key']
    },
    {
      id: 'tour_004',
      name: 'Duo Legends',
      type: 'Battle Royale',
      mode: 'Normal',
      team_size: 'Duo',
      entry_fee: 75,
      prize_pool: 3500,
      slots_total: 40,
      slots_filled: 22,
      date: '2025-10-30',
      time: '20:30',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Team up with your partner and dominate the battlefield!',
      rules: ['Duo teams only', 'Both players must be registered', 'Communication is key']
    },
    {
      id: 'tour_005',
      name: 'Weekend Clash',
      type: 'Clash Squad',
      mode: 'Normal',
      team_size: 'Squad',
      entry_fee: 120,
      prize_pool: 6000,
      slots_total: 24,
      slots_filled: 18,
      date: '2025-11-02',
      time: '15:00',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Weekend special clash squad tournament with huge prizes!',
      rules: ['Squad of 4 required', 'Best of 3 rounds', 'No substitutions']
    },
    {
      id: 'tour_006',
      name: 'Midnight Madness',
      type: 'Battle Royale',
      mode: 'Normal',
      team_size: 'Squad',
      entry_fee: 100,
      prize_pool: 4500,
      slots_total: 40,
      slots_filled: 15,
      date: '2025-11-01',
      time: '23:30',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Late night action for night owls!',
      rules: ['Standard BR rules', 'Squad format', 'Top 3 teams win']
    },
    {
      id: 'tour_007',
      name: 'Lone Wolf Challenge',
      type: 'Lone Wolf',
      mode: 'Normal',
      team_size: 'Solo',
      entry_fee: 80,
      prize_pool: 3000,
      slots_total: 50,
      slots_filled: 30,
      date: '2025-10-31',
      time: '18:00',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Survive alone in the wilderness!',
      rules: ['Solo survival', 'Limited resources', 'Last man standing']
    },
    {
      id: 'tour_008',
      name: 'Pro Headshot Masters',
      type: 'Clash Squad',
      mode: 'Headshot',
      team_size: 'Duo',
      entry_fee: 200,
      prize_pool: 10000,
      slots_total: 24,
      slots_filled: 20,
      date: '2025-11-03',
      time: '20:00',
      status: 'open',
      room_id: '',
      room_password: '',
      organizer: 'Tournvia Official',
      description: 'Ultimate headshot tournament for pros!',
      rules: ['Headshot only', 'Duo teams', 'High skill required']
    }
  ],

  // Teams data
  teams: [
    {
      id: 'team_001',
      name: 'Shadow Warriors',
      admin_uid: '2847593021',
      team_code: 'SW2024',
      created_date: '2025-01-20',
      members: [
        {
          uid: '2847593021',
          ign: 'ProGamerX',
          role: 'admin',
          joined_date: '2025-01-20'
        },
        {
          uid: '3947281056',
          ign: 'SniperKing',
          role: 'member',
          joined_date: '2025-01-25'
        },
        {
          uid: '5839472018',
          ign: 'FireStorm',
          role: 'member',
          joined_date: '2025-02-10'
        }
      ]
    },
    {
      id: 'team_002',
      name: 'Elite Squad',
      admin_uid: '6749382056',
      team_code: 'ES2024',
      created_date: '2025-02-15',
      members: [
        {
          uid: '6749382056',
          ign: 'EliteLeader',
          role: 'admin',
          joined_date: '2025-02-15'
        },
        {
          uid: '7849302847',
          ign: 'QuickShot',
          role: 'member',
          joined_date: '2025-02-18'
        }
      ]
    }
  ],

  // Transactions data
  transactions: [
    {
      id: 'txn_001',
      uid: '2847593021',
      type: 'deposit',
      amount: 500,
      status: 'completed',
      date: '2025-10-25',
      time: '14:30',
      description: 'UPI Payment - Added money',
      transaction_id: 'UPI2025102514301'
    },
    {
      id: 'txn_002',
      uid: '2847593021',
      type: 'entry_fee',
      amount: -100,
      status: 'completed',
      date: '2025-10-25',
      time: '18:45',
      description: 'Tournament Entry - Friday Night Battle',
      tournament_id: 'tour_001'
    },
    {
      id: 'txn_003',
      uid: '2847593021',
      type: 'winning',
      amount: 750,
      status: 'completed',
      date: '2025-10-24',
      time: '22:15',
      description: 'Prize Money - Thursday Clash',
      tournament_id: 'tour_past_001'
    },
    {
      id: 'txn_004',
      uid: '2847593021',
      type: 'deposit',
      amount: 1000,
      status: 'completed',
      date: '2025-10-23',
      time: '16:20',
      description: 'UPI Payment - Added money',
      transaction_id: 'UPI2025102316201'
    },
    {
      id: 'txn_005',
      uid: '2847593021',
      type: 'withdrawal',
      amount: -800,
      status: 'pending',
      date: '2025-10-25',
      time: '10:15',
      description: 'Withdrawal to UPI ID',
      upi_id: 'progamer@paytm'
    },
    {
      id: 'txn_006',
      uid: '2847593021',
      type: 'entry_fee',
      amount: -150,
      status: 'completed',
      date: '2025-10-22',
      time: '19:00',
      description: 'Tournament Entry - Mid Week Battle',
      tournament_id: 'tour_past_002'
    },
    {
      id: 'txn_007',
      uid: '2847593021',
      type: 'winning',
      amount: 1500,
      status: 'completed',
      date: '2025-10-20',
      time: '23:30',
      description: 'Prize Money - Solo Championship',
      tournament_id: 'tour_past_003'
    },
    {
      id: 'txn_008',
      uid: '2847593021',
      type: 'deposit',
      amount: 500,
      status: 'completed',
      date: '2025-10-19',
      time: '12:00',
      description: 'UPI Payment - Added money',
      transaction_id: 'UPI2025101912001'
    }
  ],

  // Notifications data
  notifications: [
    {
      id: 'notif_001',
      uid: '2847593021',
      type: 'team_invite',
      title: 'Team Invitation',
      message: 'EliteLeader invited you to join Elite Squad team',
      timestamp: '2025-10-26T18:30:00',
      read: false,
      action_required: true,
      data: {
        team_id: 'team_002',
        from_uid: '6749382056',
        from_ign: 'EliteLeader'
      }
    },
    {
      id: 'notif_002',
      uid: '2847593021',
      type: 'tournament_update',
      title: 'Tournament Starting Soon',
      message: 'Friday Night Battle starts in 30 minutes',
      timestamp: '2025-10-26T19:30:00',
      read: false,
      action_required: false,
      data: {
        tournament_id: 'tour_001'
      }
    },
    {
      id: 'notif_003',
      uid: '2847593021',
      type: 'payment',
      title: 'Payment Successful',
      message: '₹500 added to your wallet successfully',
      timestamp: '2025-10-25T14:30:00',
      read: true,
      action_required: false,
      data: {
        transaction_id: 'txn_001'
      }
    },
    {
      id: 'notif_004',
      uid: '2847593021',
      type: 'tournament_result',
      title: 'Tournament Result',
      message: 'Congratulations! You won ₹750 in Thursday Clash',
      timestamp: '2025-10-24T22:15:00',
      read: true,
      action_required: false,
      data: {
        tournament_id: 'tour_past_001',
        prize: 750
      }
    },
    {
      id: 'notif_005',
      uid: '2847593021',
      type: 'team_request',
      title: 'Team Join Request',
      message: 'NightRider requested to join Shadow Warriors',
      timestamp: '2025-10-26T15:00:00',
      read: false,
      action_required: true,
      data: {
        team_id: 'team_001',
        from_uid: '8592847103',
        from_ign: 'NightRider'
      }
    }
  ],

  // Tournament History
  tournamentHistory: [
    {
      uid: '2847593021',
      tournament_name: 'Thursday Clash',
      tournament_id: 'tour_past_001',
      date: '2025-10-24',
      position: 2,
      prize_won: 750,
      participants: 32
    },
    {
      uid: '2847593021',
      tournament_name: 'Mid Week Battle',
      tournament_id: 'tour_past_002',
      date: '2025-10-22',
      position: 8,
      prize_won: 0,
      participants: 48
    },
    {
      uid: '2847593021',
      tournament_name: 'Solo Championship',
      tournament_id: 'tour_past_003',
      date: '2025-10-20',
      position: 1,
      prize_won: 1500,
      participants: 64
    },
    {
      uid: '2847593021',
      tournament_name: 'Weekend Warriors',
      tournament_id: 'tour_past_004',
      date: '2025-10-19',
      position: 4,
      prize_won: 200,
      participants: 40
    },
    {
      uid: '2847593021',
      tournament_name: 'Night Battle',
      tournament_id: 'tour_past_005',
      date: '2025-10-17',
      position: 12,
      prize_won: 0,
      participants: 48
    },
    {
      uid: '2847593021',
      tournament_name: 'Headshot Mania',
      tournament_id: 'tour_past_006',
      date: '2025-10-15',
      position: 3,
      prize_won: 500,
      participants: 32
    },
    {
      uid: '2847593021',
      tournament_name: 'Duo Masters',
      tournament_id: 'tour_past_007',
      date: '2025-10-13',
      position: 5,
      prize_won: 150,
      participants: 40
    }
  ],

  // Support FAQs
  faqs: [
    {
      question: 'How to join a tournament?',
      answer: 'Go to Tournaments page, select your preferred tournament and click Join. Pay the entry fee to confirm your participation. Make sure you meet all requirements and have sufficient balance in your wallet.'
    },
    {
      question: 'How to create a team?',
      answer: 'Go to My Team page, click Create Team, enter team name and share the team code with friends to invite them. You can have up to 6 members in your team.'
    },
    {
      question: 'What is the maximum team size?',
      answer: 'A team can have maximum 6 members including the admin. This allows flexibility for different tournament formats like Solo, Duo, and Squad.'
    },
    {
      question: 'How to withdraw money?',
      answer: 'Go to Wallet page, click Withdraw tab, enter amount and UPI details. Withdrawals are processed within 24-48 hours. Minimum withdrawal amount is ₹500.'
    },
    {
      question: 'How to add money to wallet?',
      answer: 'Go to Wallet page, click Add Money tab, enter amount, scan QR code or use UPI ID, complete payment, and submit transaction ID with screenshot. Amount will be credited after verification.'
    },
    {
      question: 'Can I leave a team?',
      answer: 'Yes, you can leave a team anytime from the My Team page. If you are the admin, you can either transfer admin rights or dissolve the team.'
    },
    {
      question: 'When will I receive room ID and password?',
      answer: 'Room ID and password for tournaments are revealed 15-30 minutes before the match starts. Check tournament details page or your notifications.'
    },
    {
      question: 'What happens if I miss a tournament?',
      answer: 'If you miss a tournament after payment, the entry fee is not refunded. Make sure to be available and check in on time.'
    }
  ],

  // Tournament Rules
  rules: [
    {
      title: 'General Rules',
      content: 'All participants must follow fair play guidelines. Any form of cheating, hacking, or exploiting bugs will result in immediate disqualification and account ban. Respect all players and organizers.'
    },
    {
      title: 'Entry Requirements',
      content: 'Players must have sufficient balance in their wallet to pay entry fee. Team tournaments require all team members to be registered. Solo tournaments are individual entry only.'
    },
    {
      title: 'Match Schedule',
      content: 'All matches start at the scheduled time. Players must join the room 10 minutes before start time. Late entries are not allowed. Room ID and password are shared 15-30 minutes before match.'
    },
    {
      title: 'Prize Distribution',
      content: 'Prizes are distributed based on final standings. Winners are announced immediately after match completion. Prize money is credited to wallet within 1 hour of result verification.'
    },
    {
      title: 'Team Rules',
      content: 'Squad tournaments require 4 players, Duo requires 2 players. All team members must be from the same registered team. Substitutions are not allowed after tournament starts.'
    },
    {
      title: 'Dispute Resolution',
      content: 'Any disputes must be reported immediately with proof (screenshots/recordings). Admin decision is final. False reports may result in penalties.'
    }
  ]
};

// Helper function to get user by UID
DATA.getUserByUID = function(uid) {
  return this.users.find(user => user.uid === uid);
};

// Helper function to get team by ID
DATA.getTeamById = function(teamId) {
  return this.teams.find(team => team.id === teamId);
};

// Helper function to get tournament by ID
DATA.getTournamentById = function(tournamentId) {
  return this.tournaments.find(tournament => tournament.id === tournamentId);
};

// Helper function to get user's transactions
DATA.getUserTransactions = function(uid) {
  return this.transactions.filter(txn => txn.uid === uid);
};

// Helper function to get user's notifications
DATA.getUserNotifications = function(uid) {
  return this.notifications.filter(notif => notif.uid === uid);
};

// Helper function to get user's tournament history
DATA.getUserTournamentHistory = function(uid) {
  return this.tournamentHistory.filter(history => history.uid === uid);
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DATA;
}