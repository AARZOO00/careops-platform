'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  color = 'blue'
}: ProgressRingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2000
  });

  const strokeDashoffset = useTransform(
    spring,
    (current) => circumference - (current / 100) * circumference
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          spring.set(progress);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`progress-ring-${color}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [spring, progress, color]);

  const getColor = () => {
    switch (color) {
      case 'blue': return '#3B82F6';
      case 'green': return '#10B981';
      case 'purple': return '#8B5CF6';
      case 'orange': return '#F97316';
      case 'yellow': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <div
      id={`progress-ring-${color}`}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: isVisible ? strokeDashoffset : circumference
          }}
        />
      </svg>
      
      <span className="absolute text-xs font-semibold text-gray-700">
        {progress}%
      </span>
    </div>
  );
}