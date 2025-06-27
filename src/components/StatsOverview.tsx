import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import React from 'react';

import { useWallet } from '../contexts/WalletContext';

const StatsOverview: React.FC = () => {
  const { user } = useWallet();

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${user?.totalEarnings.toLocaleString() || '0'}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Packages',
      value: user?.activePackages.length.toString() || '0',
      change: '+2',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Monthly ROI',
      value: '8.5%',
      change: '+0.5%',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Network Size',
      value: '1,247',
      change: '+89',
      icon: Users,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-amber-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;