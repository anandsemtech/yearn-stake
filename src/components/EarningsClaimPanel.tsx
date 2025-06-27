import { DollarSign, Star, Award, Clock, TrendingUp, Zap } from 'lucide-react';
import React, { useState } from 'react';

const EarningsClaimPanel: React.FC = () => {
  const [claimingType, setClaimingType] = useState<string | null>(null);

  const earnings = [
    {
      type: 'referral',
      title: 'Referral Earnings',
      amount: 1250.75,
      available: 850.25,
      nextClaim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      icon: TrendingUp,
      color: 'blue',
      description: 'Earnings from your referral network'
    },
    {
      type: 'star',
      title: 'Star Level Earnings',
      amount: 675.50,
      available: 675.50,
      nextClaim: new Date(),
      icon: Star,
      color: 'purple',
      description: 'Rewards from your current star level'
    },
    {
      type: 'golden',
      title: 'Golden Star Earnings',
      amount: 0,
      available: 0,
      nextClaim: null,
      icon: Award,
      color: 'yellow',
      description: 'Special rewards for Golden Star achievement'
    }
  ];

  const handleClaim = async (type: string) => {
    setClaimingType(type);
    // Mock claim process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimingType(null);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'from-blue-500 to-cyan-600',
        text: 'text-blue-600 dark:text-blue-400',
        bgLight: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800'
      },
      purple: {
        bg: 'from-purple-500 to-violet-600',
        text: 'text-purple-600 dark:text-purple-400',
        bgLight: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800'
      },
      yellow: {
        bg: 'from-yellow-500 to-amber-600',
        text: 'text-yellow-600 dark:text-yellow-400',
        bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800'
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };

  const formatTimeUntilClaim = (date: Date | null) => {
    if (!date) return 'Not available';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Available now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const totalAvailable = earnings.reduce((sum, earning) => sum + earning.available, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Earnings & Claims
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${totalAvailable.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Available
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {earnings.map((earning) => {
          const colors = getColorClasses(earning.color);
          const isClaimable = earning.available > 0 && (!earning.nextClaim || earning.nextClaim <= new Date());
          const isClaiming = claimingType === earning.type;
          
          return (
            <div
              key={earning.type}
              className={`${colors.bgLight} rounded-2xl p-6 border ${colors.border} transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                  <earning.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${colors.text}`}>
                    ${earning.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total Earned
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {earning.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {earning.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${earning.available.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Claim</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatTimeUntilClaim(earning.nextClaim)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(earning.type)}
                  disabled={!isClaimable || isClaiming}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-medium ${
                    isClaimable
                      ? `bg-gradient-to-r ${colors.bg} text-white hover:opacity-90`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isClaiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Claiming...</span>
                    </>
                  ) : isClaimable ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Claim ${earning.available.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>
                        {earning.available === 0 ? 'No earnings' : 'Not ready'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim All Button */}
      {totalAvailable > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Claim All Available Earnings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claim all your available earnings in one transaction
              </p>
            </div>
            <button
              onClick={() => handleClaim('all')}
              disabled={claimingType === 'all'}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-semibold"
            >
              {claimingType === 'all' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Claim ${totalAvailable.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsClaimPanel;