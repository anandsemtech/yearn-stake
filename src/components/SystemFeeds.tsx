import { Rss, TrendingUp, Bell, ExternalLink } from 'lucide-react';
import React from 'react';

const SystemFeeds: React.FC = () => {
  const news = [
    {
      id: '1',
      title: 'New Package Launch: 5-Year Premium',
      content: 'Introducing our highest yield package with 25% APY and exclusive benefits.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'announcement',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Weekly Network Stats',
      content: 'Total staked: $2.5M | Active users: 1,247 | Network growth: +12.5%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'stats',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Reward Distribution Complete',
      content: 'Weekly rewards have been distributed to all active participants.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      type: 'update',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Platform Maintenance',
      content: 'Scheduled maintenance on Sunday 2AM UTC. Expected downtime: 30 minutes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      type: 'maintenance',
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      high: 'text-red-600 dark:text-red-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-green-600 dark:text-green-400'
    };
    return colorMap[priority as keyof typeof colorMap] || 'text-gray-600 dark:text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      announcement: Bell,
      stats: TrendingUp,
      update: Rss,
      maintenance: ExternalLink
    };
    return iconMap[type as keyof typeof iconMap] || Rss;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Rss className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">System Feeds</h3>
      </div>

      <div className="space-y-4">
        {news.map((item) => {
          const IconComponent = getTypeIcon(item.type);
          return (
            <div
              key={item.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                      {item.title}
                    </h4>
                    <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(item.timestamp)}
                    </span>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
          <Rss className="w-4 h-4" />
          <span>Subscribe to Updates</span>
        </button>
      </div>
    </div>
  );
};

export default SystemFeeds;