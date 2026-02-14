'use client';

import { useEffect, useRef } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export default function Sparkline({ 
  data, 
  color = 'blue',
  height = 40,
  width = 80 
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height
    }));

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = `rgb(${color === 'blue' ? '59, 130, 246' : 
                            color === 'green' ? '16, 185, 129' :
                            color === 'purple' ? '139, 92, 246' :
                            color === 'orange' ? '249, 115, 22' : '139, 92, 246'})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill gradient
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `rgba(${color === 'blue' ? '59, 130, 246' : 
                                     color === 'green' ? '16, 185, 129' :
                                     color === 'purple' ? '139, 92, 246' :
                                     color === 'orange' ? '249, 115, 22' : '139, 92, 246'}, 0.2)`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw dots
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.shadowColor = `rgb(${color === 'blue' ? '59, 130, 246' : 
                               color === 'green' ? '16, 185, 129' :
                               color === 'purple' ? '139, 92, 246' :
                               color === 'orange' ? '249, 115, 22' : '139, 92, 246'})`;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [data, color, height, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}