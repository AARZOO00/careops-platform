'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export default function AnimatedCounter({
  value,
  duration = 2,
  delay = 0,
  className = '',
  formatter = (v) => v.toString()
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const controls = animate(motionValue, value, {
              duration,
              onUpdate: (latest) => {
                setDisplayValue(formatter(Math.floor(latest)));
              }
            });
            return () => controls.stop();
          }, delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, delay, formatter, motionValue]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}