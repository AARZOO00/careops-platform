'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Sparkline from '@/components/ui/Sparkline';
import ProgressRing from '@/components/ui/ProgressRing';
import { number } from 'zod';

interface StatsGridProps {
  data?: any;
}

interface StatItem {
  id: number;
  title: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: React.ElementType;
  gradient: string;
  sparkline: number[];
  progress: number;
  progressColor: string;
  trend: 'up' | 'down';
  trendValue: string;
  comparison: string;
  color: string;
  alert?: boolean;
}

const stats: StatItem[] = [
  {
    id: 1,
    title: "Today's Bookings",
    value: 24,
    previousValue: 18,
    unit: 'bookings',
    icon: CalendarIcon,
    gradient: 'from-blue-500 to-cyan-500',
    sparkline: [12, 15, 18, 22, 24, 28, 24],
    progress: 78,
    progressColor: 'blue',
    trend: 'up',
    trendValue: '+33%',
    comparison: 'vs yesterday',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Revenue',
    value: 2890,
    previousValue: 2150,
    unit: 'USD',
    icon: CurrencyDollarIcon,
    gradient: 'from-green-500 to-emerald-500',
    sparkline: [1800, 2100, 1950, 2400, 2600, 2750, 2890],
    progress: 85,
    progressColor: 'green',
    trend: 'up',
    trendValue: '+34%',
    comparison: 'vs yesterday',
    color: 'green'
  },
  {
    id: 3,
    title: 'Unanswered',
    value: 8,
    previousValue: 12,
    unit: 'messages',
    icon: ChatBubbleLeftIcon,
    gradient: 'from-purple-500 to-pink-500',
    sparkline: [15, 14, 12, 10, 9, 8, 8],
    progress: 60,
    progressColor: 'purple',
    trend: 'down',
    trendValue: '-33%',
    comparison: 'vs yesterday',
    color: 'purple'
  },
  {
    id: 4,
    title: 'Low Stock',
    value: 5,
    previousValue: 7,
    unit: 'items',
    icon: CubeIcon,
    gradient: 'from-orange-500 to-red-500',
    sparkline: [8, 9, 7, 6, 5, 5, 5],
    progress: 45,
    progressColor: 'orange',
    trend: 'down',
    trendValue: '-29%',
    comparison: 'vs yesterday',
    color: 'orange',
    alert: true
  },
  {
    id: 5,
    title: 'Pending Tasks',
    value: 12,
    previousValue: 15,
    unit: 'tasks',
    icon: ClipboardDocumentListIcon,
    gradient: 'from-indigo-500 to-purple-500',
    sparkline: [18, 17, 15, 14, 13, 12, 12],
    progress: 70,
    progressColor: 'indigo',
    trend: 'down',
    trendValue: '-20%',
    comparison: 'vs yesterday',
    color: 'indigo'
  },
  {
    id: 6,
    title: 'Satisfaction',
    value: 4.8,
    previousValue: 4.6,
    unit: 'rating',
    icon: StarIcon,
    gradient: 'from-yellow-500 to-orange-500',
    sparkline: [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.8],
    progress: 96,
    progressColor: 'yellow',
    trend: 'up',
    trendValue: '+4%',
    comparison: 'vs yesterday',
    color: 'yellow'
  }
];

export default function StatsGrid({ data }: StatsGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap: Record<string, any> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' }
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
        const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';
        
        return (
          <motion.div
            key={stat.id}
            variants={itemVariants}
            whileHover={{ 
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Glass morphism card */}
            <div className="relative backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all p-6 overflow-hidden">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Alert badge for low stock */}
              {stat.alert && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center">
                      <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                    </span>
                  </span>
                </div>
              )}

              {/* Header with icon and sparkline */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${getColorClass(stat.color, 'text')}`} />
                </div>
                
                {/* Sparkline mini chart */}
                <div className="w-20 h-8">
                  <Sparkline data={stat.sparkline} color={stat.color} />
                </div>
              </div>

              {/* Value with animated counter */}
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline mt-1">
                    <AnimatedCounter
                      value={stat.value}
                      className="text-2xl font-bold text-gray-900"
                      formatter={(val) => 
                        stat.unit === 'USD' ? `$${val}` : 
                        stat.unit === 'rating' ? val.toFixed(1) : 
                        val.toString()
                      }
                    />
                    <span className="ml-1 text-sm text-gray-500">{stat.unit === 'USD' ? '' : stat.unit}</span>
                  </div>
                </div>

                {/* Progress ring */}
                <ProgressRing 
                  progress={stat.progress} 
                  size={48} 
                  strokeWidth={4}
                  color={stat.color}
                />
              </div>

              {/* Trend indicator */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className={`flex items-center text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {stat.trendValue}
                  <span className="text-gray-400 ml-1">{stat.comparison}</span>
                </div>
                
                {/* Mini status indicator */}
                <div className="flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full ${getColorClass(stat.color, 'bg')} animate-pulse mr-1`} />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>

              {/* Hover tooltip with comparison */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gray-900 text-white text-xs rounded-b-2xl p-3 opacity-0 group-hover:opacity-100 z-20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Previous:</span>
                  <span className="font-medium text-white">
                    {stat.unit === 'USD' ? `$${stat.previousValue}` : stat.previousValue} {stat.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-300">Change:</span>
                  <span className={stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {stat.trendValue}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}