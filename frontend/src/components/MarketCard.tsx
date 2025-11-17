import type { Market } from '../types';
import { calculateOdds, formatAmount, formatPercentage, getTimeRemaining } from '../utils/calculations';

interface MarketCardProps {
  market: Market;
  onClick?: () => void;
}

const MarketCard = ({ market, onClick }: MarketCardProps) => {
  const { yesOdds, noOdds } = calculateOdds(market);
  const timeRemaining = getTimeRemaining(market.endTime);
  const totalPool = market.yesPool + market.noPool;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sports':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Crypto':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Binary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sports':
        return '🏆';
      case 'Crypto':
        return '💰';
      case 'Binary':
        return '📊';
      default:
        return '📈';
    }
  };

  const getTimeRemainingColor = (timeStr: string) => {
    if (timeStr === 'Ended') return 'text-gray-500';
    if (timeStr.includes('m') && !timeStr.includes('h') && !timeStr.includes('d')) {
      return 'text-red-600 font-bold'; // Less than 1 hour
    }
    if (timeStr.includes('h') && !timeStr.includes('d')) {
      return 'text-yellow-600 font-semibold'; // Less than 24 hours
    }
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Locked':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isHighVolume = totalPool > 5000;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md cursor-pointer p-6 border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 animate-slide-up relative overflow-hidden"
    >
      {isHighVolume && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-transparent px-4 py-1 text-xs font-bold text-yellow-900">
          🔥 Trending
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(market.category)} flex items-center gap-1`}>
          <span>{getCategoryIcon(market.category)}</span>
          {market.category}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(market.status)}`}>
          {market.status}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold mb-4 text-gray-900 line-clamp-2 min-h-[3.5rem]">
        {market.question}
      </h3>

      {/* Odds with Progress Bars */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 hover:bg-green-100 transition-colors">
          <div className="text-xs text-gray-600 mb-1">YES</div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {formatPercentage(yesOdds)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${yesOdds * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 hover:bg-red-100 transition-colors">
          <div className="text-xs text-gray-600 mb-1">NO</div>
          <div className="text-2xl font-bold text-red-600 mb-2">
            {formatPercentage(noOdds)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${noOdds * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
        <span className="font-medium text-gray-700">
          💎 {formatAmount(totalPool)} tokens
        </span>
        <span className={`flex items-center gap-1 ${getTimeRemainingColor(timeRemaining)}`}>
          ⏰ {timeRemaining}
        </span>
      </div>
    </div>
  );
};

export default MarketCard;

