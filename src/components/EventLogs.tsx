import { Activity, ArrowUpRight, ArrowDownLeft, Users, DollarSign } from 'lucide-react';
import React from 'react';

const EventLogs: React.FC = () => {
  const events = [
    {
      id: '1',
      type: 'stake',
      title: 'Package Staked',
      description: '2 Year Package - $5,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: ArrowUpRight,
      color: 'green'
    },
    {
      id: '2',
      type: 'referral',
      title: 'New Referral',
      description: 'Level 3 - 0x851a...2CD8',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: Users,
      color: 'blue'
    },
    {
      id: '3',
      type: 'earnings',
      title: 'Earnings Distributed',
      description: 'Weekly rewards - $125.50',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      icon: DollarSign,
      color: 'purple'
    },
    {
      id: '4',
      type: 'unstake',
      title: 'Package Completed',
      description: '1 Year Package - $2,500',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: ArrowDownLeft,
      color: 'orange'
    },
    {
      id: '5',
      type: 'referral',
      title: 'Network Growth',
      description: 'Level 7 - 0x742d...1BA7',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      icon: Users,
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="w-5 h-5 text-purple-500" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Event Logs</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className={`p-2 rounded-lg ${getColorClasses(event.color)}`}>
              <event.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {event.title}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatTime(event.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
          View All Events
        </button>
      </div>
    </div>
  );
};

export default EventLogs;