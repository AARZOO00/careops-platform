'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  UserCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'booking' | 'customer' | 'inventory' | 'form' | 'insight' | 'message' | 'page';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  url: string;
  timestamp?: Date;
  color: string;
  category: string;
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchData: SearchResult[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Sarah Johnson - Consultation',
    subtitle: 'Today at 10:30 AM · Confirmed',
    icon: CalendarIcon,
    url: '/bookings/1',
    timestamp: new Date(new Date().setHours(10, 30)),
    color: 'blue',
    category: 'Bookings'
  },
  {
    id: '2',
    type: 'booking',
    title: 'Michael Chen - Follow-up',
    subtitle: 'Today at 2:00 PM · Confirmed',
    icon: CalendarIcon,
    url: '/bookings/2',
    timestamp: new Date(new Date().setHours(14, 0)),
    color: 'blue',
    category: 'Bookings'
  },
  {
    id: '3',
    type: 'customer',
    title: 'Michael Chen',
    subtitle: 'michael.c@example.com · 5 bookings · Last active 2h ago',
    icon: UserCircleIcon,
    url: '/customers/2',
    color: 'green',
    category: 'Customers'
  },
  {
    id: '4',
    type: 'customer',
    title: 'Sarah Johnson',
    subtitle: 'sarah.j@example.com · 3 bookings · New customer',
    icon: UserCircleIcon,
    url: '/customers/1',
    color: 'green',
    category: 'Customers'
  },
  {
    id: '5',
    type: 'inventory',
    title: 'Printer Paper',
    subtitle: 'Low stock · 2 reams left · Reorder now',
    icon: CubeIcon,
    url: '/inventory/3',
    color: 'orange',
    category: 'Inventory'
  },
  {
    id: '6',
    type: 'inventory',
    title: 'Toner Cartridge',
    subtitle: '1 unit left · Reorder soon',
    icon: CubeIcon,
    url: '/inventory/2',
    color: 'orange',
    category: 'Inventory'
  },
  {
    id: '7',
    type: 'form',
    title: 'Client Intake Form',
    subtitle: '12 submissions this week · Last updated 2d ago',
    icon: DocumentTextIcon,
    url: '/forms/4',
    color: 'purple',
    category: 'Forms'
  },
  {
    id: '8',
    type: 'insight',
    title: 'Revenue up 34% today',
    subtitle: 'AI-powered insight · 92% confidence',
    icon: SparklesIcon,
    url: '/dashboard?tab=insights',
    color: 'pink',
    category: 'Insights'
  },
  {
    id: '9',
    type: 'message',
    title: 'Unread message from Emily',
    subtitle: 'About project timeline · 5m ago',
    icon: ChatBubbleLeftIcon,
    url: '/inbox/6',
    timestamp: new Date(Date.now() - 5 * 60000),
    color: 'indigo',
    category: 'Messages'
  },
  {
    id: '10',
    type: 'page',
    title: 'Dashboard',
    subtitle: 'Overview and key metrics',
    icon: HomeIcon,
    url: '/dashboard',
    color: 'gray',
    category: 'Pages'
  },
  {
    id: '11',
    type: 'page',
    title: 'Settings',
    subtitle: 'Manage your workspace',
    icon: Cog6ToothIcon,
    url: '/settings',
    color: 'gray',
    category: 'Pages'
  },
  {
    id: '12',
    type: 'page',
    title: 'Bookings',
    subtitle: 'View and manage appointments',
    icon: CalendarIcon,
    url: '/bookings',
    color: 'gray',
    category: 'Pages'
  },
  {
    id: '13',
    type: 'page',
    title: 'Inbox',
    subtitle: 'Customer messages and conversations',
    icon: ChatBubbleLeftIcon,
    url: '/inbox',
    color: 'gray',
    category: 'Pages'
  },
  {
    id: '14',
    type: 'page',
    title: 'Inventory',
    subtitle: 'Manage your stock',
    icon: ShoppingBagIcon,
    url: '/inventory',
    color: 'gray',
    category: 'Pages'
  }
];

export default function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches] = useState([
    'Bookings today',
    'Low stock items',
    'Revenue report',
    'Sarah Johnson'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(searchData.slice(0, 5));
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(searchData.slice(0, 5));
    } else {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[color] || colors.gray;
  };

  const groupResultsByCategory = () => {
    const grouped: { [key: string]: SearchResult[] } = {};
    results.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = [];
      }
      grouped[result.category].push(result);
    });
    return grouped;
  };

  const groupedResults = groupResultsByCategory();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-start justify-center pt-[20vh] px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings, customers, inventory, pages..."
              className="flex-1 ml-3 text-lg border-0 focus:ring-0 outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </motion.div>

          {/* Recent searches */}
          {query === '' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
            >
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                Recent searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuery(search)}
                    className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <ClockIcon className="w-3 h-3 mr-1.5 text-gray-400 dark:text-gray-500" />
                    {search}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {Object.entries(groupedResults).map(([category, categoryResults], groupIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + groupIndex * 0.1 }}
                  >
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                      {category}
                    </h5>
                    {categoryResults.map((result, index) => {
                      const Icon = result.icon;
                      const isSelected = selectedIndex === results.indexOf(result);

                      return (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.03 }}
                          whileHover={{ x: 4 }}
                          className={`w-full flex items-center p-3 rounded-xl transition-all ${
                            isSelected 
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className={`p-2 rounded-lg ${getColorClasses(result.color)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 ml-3 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {result.subtitle}
                            </p>
                          </div>
                          {result.timestamp && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                              {new Date(result.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                          <motion.div
                            animate={{ x: isSelected ? 5 : 0 }}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                            }`}
                          >
                            <ArrowRightIcon className={`w-4 h-4 ${
                              isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center"
              >
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-full"
                  />
                  <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No results found for "{query}"</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try different keywords</p>
              </motion.div>
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 mr-1">↑</span>
                <span className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 mr-1">↓</span>
                navigate
              </span>
              <span className="flex items-center">
                <span className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 mr-1">↵</span>
                select
              </span>
              <span className="flex items-center">
                <span className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 mr-1">esc</span>
                close
              </span>
            </div>
            <span className="flex items-center">
              <SparklesIcon className="w-3 h-3 mr-1 text-purple-500 dark:text-purple-400" />
              AI-powered search
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}