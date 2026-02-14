export const demoData = {
  stats: {
    bookings: 24,
    revenue: 2890,
    unanswered: 8,
    lowStock: 5,
    pendingTasks: 12,
    satisfaction: 4.8
  },
  bookings: [
    {
      id: 1,
      customer: { name: 'Sarah Johnson', avatar: 'SJ' },
      service: 'Consultation',
      startTime: new Date().setHours(10, 30),
      status: 'confirmed',
      type: 'video'
    },
    {
      id: 2,
      customer: { name: 'Michael Chen', avatar: 'MC' },
      service: 'Follow-up',
      startTime: new Date().setHours(14, 0),
      status: 'confirmed',
      type: 'phone'
    },
    {
      id: 3,
      customer: { name: 'Emily Rodriguez', avatar: 'ER' },
      service: 'Project Kickoff',
      startTime: new Date(Date.now() + 86400000).setHours(9, 0),
      status: 'pending',
      type: 'in-person'
    }
  ],
  activities: [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'booked a consultation',
      timestamp: new Date(Date.now() - 2 * 60000),
      type: 'booking'
    },
    {
      id: 2,
      user: 'Michael Chen',
      action: 'sent a message',
      timestamp: new Date(Date.now() - 15 * 60000),
      type: 'message'
    },
    {
      id: 3,
      user: 'System',
      action: 'low stock alert: printer paper',
      timestamp: new Date(Date.now() - 45 * 60000),
      type: 'stock'
    }
  ],
  predictions: {
    tomorrowRevenue: 3240,
    tomorrowBookings: 32,
    peakHour: '2:00 PM',
    confidence: 92
  }
};