import Link from 'next/link';
import { ExclamationTriangleIcon, EnvelopeIcon, CalendarIcon, CubeIcon } from '@heroicons/react/24/outline';

interface AlertCardProps {
  alert: {
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    action_url: string;
    action_label: string;
  };
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'missed_messages':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'unconfirmed_bookings':
        return <CalendarIcon className="h-5 w-5" />;
      case 'low_stock':
        return <CubeIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const getSeverityClasses = () => {
    switch (alert.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityClasses()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {alert.title}
          </h3>
          <p className="mt-1 text-sm">
            {alert.description}
          </p>
          <div className="mt-3">
            <Link
              href={alert.action_url}
              className="text-sm font-medium underline underline-offset-4 hover:no-underline"
            >
              {alert.action_label} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}