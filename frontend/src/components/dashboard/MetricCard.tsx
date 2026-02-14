import Link from 'next/link';
import { ElementType } from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: ElementType;
  color: 'blue' | 'green' | 'red' | 'yellow';
  trend?: number;
  trendLabel?: string;
  subtext?: string;
  href?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-500'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-500'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-500'
  }
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
  subtext,
  href
}: MetricCardProps) {
  const classes = colorClasses[color];
  
  const content = (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`${classes.bg} rounded-md p-3`}>
              <Icon className={`h-6 w-6 ${classes.text}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? '↑' : '↓'} {trend}
                    {trendLabel && <span className="ml-1 text-gray-500">{trendLabel}</span>}
                  </div>
                )}
                {subtext && (
                  <div className="ml-2 text-sm text-gray-500">
                    {subtext}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}