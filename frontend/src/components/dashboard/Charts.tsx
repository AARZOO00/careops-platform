'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface ChartsProps {
  data?: any;
}

const revenueData = [
  { name: 'Mon', value: 1200 },
  { name: 'Tue', value: 1400 },
  { name: 'Wed', value: 1800 },
  { name: 'Thu', value: 1600 },
  { name: 'Fri', value: 2100 },
  { name: 'Sat', value: 1900 },
  { name: 'Sun', value: 1300 },
];

const bookingsData = [
  { name: 'Mon', bookings: 8 },
  { name: 'Tue', bookings: 12 },
  { name: 'Wed', bookings: 15 },
  { name: 'Thu', bookings: 11 },
  { name: 'Fri', bookings: 18 },
  { name: 'Sat', bookings: 14 },
  { name: 'Sun', bookings: 9 },
];

const serviceData = [
  { name: 'Consultation', value: 45 },
  { name: 'Follow-up', value: 30 },
  { name: 'Kickoff', value: 15 },
  { name: 'Support', value: 10 },
];

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

export default function Charts({ data }: ChartsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Overview</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-4">Revenue Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Chart */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-4">Daily Bookings</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="bookings" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-gray-50 rounded-2xl p-4 lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-600 mb-4">Service Distribution</h4>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {serviceData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-gray-600 ml-2">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}