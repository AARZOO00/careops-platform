'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  DocumentTextIcon, 
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { format, formatDistance } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMetrics();
    setGreeting(getGreeting());
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, link, subtitle }: any) => (
    <div 
      onClick={() => link && router.push(link)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${color.split(' ')[1]}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center">
            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  const AlertBanner = ({ alert }: any) => (
    <div 
      onClick={() => router.push(alert.action_url)}
      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        alert.severity === 'critical' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
        alert.severity === 'high' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
        'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      }`}
    >
      <div className={`p-2 rounded-lg ${
        alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
        alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
        'bg-yellow-100 text-yellow-600'
      }`}>
        <ExclamationTriangleIcon className="h-5 w-5" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{alert.description}</p>
      </div>
      <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
        {alert.action_label} →
      </span>
    </div>
  );

  const BookingCard = ({ booking }: any) => (
    <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
      <div className="flex-shrink-0 w-16 text-center">
        <p className="text-sm font-bold text-indigo-600">
          {format(new Date(booking.start_time), 'h:mm a')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(booking.start_time), 'MMM d')}
        </p>
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {booking.customer_name?.charAt(0) || '?'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">{booking.customer_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{booking.service_name}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {booking.status}
          </span>
        </div>
        <div className="flex items-center mt-3 text-xs text-gray-500">
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>{formatDistance(new Date(booking.start_time), new Date(), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: any) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-indigo-700">
            {activity.title?.charAt(0) || '?'}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">New</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{greeting}, {user?.full_name?.split(' ')[0] || 'Admin'}! 👋</h1>
              <p className="text-indigo-100 mt-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {metrics?.alerts?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Attention Required ({metrics.alerts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.alerts.slice(0, 3).map((alert: any, idx: number) => (
                <AlertBanner key={idx} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Bookings"
            value={metrics?.bookings?.today || 0}
            icon={CalendarIcon}
            color="from-blue-500 to-indigo-500 text-blue-600"
            trend={`${metrics?.bookings?.completed_today || 0} completed`}
            link="/bookings"
            subtitle="View all →"
          />
          <StatCard
            title="Revenue"
            value={`$${metrics?.bookings?.completed_today ? (metrics.bookings.completed_today * 99).toLocaleString() : 0}`}
            icon={CurrencyDollarIcon}
            color="from-green-500 to-emerald-500 text-green-600"
            trend="+12% vs yesterday"
            link="/analytics"
          />
          <StatCard
            title="Unanswered"
            value={metrics?.leads?.unanswered || 0}
            icon={ChatBubbleLeftIcon}
            color="from-purple-500 to-pink-500 text-purple-600"
            trend={`${metrics?.leads?.new_inquiries || 0} new`}
            link="/inbox?filter=unanswered"
            subtitle="Reply now →"
          />
          <StatCard
            title="Low Stock"
            value={metrics?.inventory?.low_stock_count || 0}
            icon={CubeIcon}
            color="from-orange-500 to-red-500 text-orange-600"
            trend={`${metrics?.inventory?.critical_count || 0} critical`}
            link="/inventory?filter=low"
            subtitle="Reorder →"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
                </div>
                <button 
                  onClick={() => router.push('/bookings')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  View all
                  <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {metrics?.bookings?.upcoming > 0 ? (
                  <>
                    {/* Sample bookings - in production, use real data */}
                    <BookingCard booking={{
                      customer_name: "Sarah Johnson",
                      service_name: "Consultation - 60 min",
                      start_time: new Date().setHours(10, 30),
                      status: "confirmed"
                    }} />
                    <BookingCard booking={{
                      customer_name: "Michael Chen",
                      service_name: "Follow-up Meeting",
                      start_time: new Date().setHours(14, 0),
                      status: "confirmed"
                    }} />
                    <BookingCard booking={{
                      customer_name: "Emily Rodriguez",
                      service_name: "Project Kickoff",
                      start_time: new Date(Date.now() + 86400000).setHours(9, 0),
                      status: "pending"
                    }} />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No upcoming bookings</h3>
                    <p className="text-gray-500 mt-1">Create your first booking to get started</p>
                    <button className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                      + New Booking
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Forms Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Forms Status</h2>
                </div>
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Manage forms →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.forms?.pending || 12}</p>
                  <p className="text-xs text-gray-600 mt-1">Pending</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{metrics?.forms?.overdue || 3}</p>
                  <p className="text-xs text-yellow-700 mt-1">Overdue</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{metrics?.forms?.completed || 45}</p>
                  <p className="text-xs text-green-700 mt-1">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                    <ArrowPathIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700">View all</button>
              </div>
              <div className="space-y-3">
                <ActivityItem activity={{
                  title: "Sarah Johnson",
                  description: "Booked Consultation",
                  timestamp: new Date(Date.now() - 120000)
                }} />
                <ActivityItem activity={{
                  title: "Michael Chen",
                  description: "Submitted intake form",
                  timestamp: new Date(Date.now() - 900000)
                }} />
                <ActivityItem activity={{
                  title: "Emily Rodriguez",
                  description: "Confirmed appointment",
                  timestamp: new Date(Date.now() - 1800000)
                }} />
                <ActivityItem activity={{
                  title: "David Kim",
                  description: "Cancelled booking",
                  timestamp: new Date(Date.now() - 3600000)
                }} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 p-4 rounded-xl transition-all text-left group">
                  <ChatBubbleLeftIcon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">New Message</p>
                  <p className="text-xs text-indigo-100 mt-1">Send email/SMS</p>
                </button>
                <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 p-4 rounded-xl transition-all text-left group">
                  <CalendarIcon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Add Booking</p>
                  <p className="text-xs text-indigo-100 mt-1">Schedule</p>
                </button>
                <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 p-4 rounded-xl transition-all text-left group">
                  <DocumentTextIcon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Send Form</p>
                  <p className="text-xs text-indigo-100 mt-1">Request info</p>
                </button>
                <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 p-4 rounded-xl transition-all text-left group">
                  <CubeIcon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Add Stock</p>
                  <p className="text-xs text-indigo-100 mt-1">Update inventory</p>
                </button>
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                    <CubeIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-900">Inventory Status</h2>
                </div>
                <button className="text-sm text-orange-600 hover:text-orange-800 font-medium">
                  Manage →
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <CubeIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Printer Paper</p>
                      <p className="text-xs text-gray-500">SKU: PAP-001</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">2 reams</p>
                    <span className="text-xs text-red-500">Low stock</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CubeIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Toner Cartridge</p>
                      <p className="text-xs text-gray-500">SKU: TN-002</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-600">1 unit</p>
                    <span className="text-xs text-yellow-500">Low stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}