'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  CloudIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

export default function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: 72,
    condition: 'Sunny',
    high: 78,
    low: 65,
    icon: SunIcon
  });

  useEffect(() => {
    // Simulate weather API
    const conditions = [
      { name: 'Sunny', icon: SunIcon },
      { name: 'Cloudy', icon: CloudIcon },
      { name: 'Partly Cloudy', icon: CloudArrowUpIcon },
    ];
    const random = Math.floor(Math.random() * conditions.length);
    setWeather(prev => ({
      ...prev,
      condition: conditions[random].name,
      icon: conditions[random].icon
    }));
  }, []);

  const WeatherIcon = weather.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl text-white cursor-pointer"
    >
      <WeatherIcon className="w-6 h-6 mr-2" />
      <div>
        <p className="text-sm font-medium">{weather.temp}°F</p>
        <p className="text-xs text-white/70">{weather.condition}</p>
      </div>
      <div className="ml-3 text-xs text-white/50 border-l border-white/20 pl-3">
        <div className="flex items-center">
          <CloudArrowUpIcon className="w-3 h-3 mr-1" />
          {weather.high}°
        </div>
        <div className="flex items-center mt-0.5">
          <CloudArrowDownIcon className="w-3 h-3 mr-1" />
          {weather.low}°
        </div>
      </div>
    </motion.div>
  );
}