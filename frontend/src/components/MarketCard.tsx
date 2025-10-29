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
        return 'bg-blue-100 text-blue-800';
      case 'Crypto':
        return 'bg-purple-100 text-purple-800';
      case 'Binary':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(market.category)}`}>
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

      {/* Odds */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-gray-600 mb-1">YES</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPercentage(yesOdds)}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-xs text-gray-600 mb-1">NO</div>
          <div className="text-2xl font-bold text-red-600">
            {formatPercentage(noOdds)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span className="font-medium">Pool: {formatAmount(totalPool)} tokens</span>
        <span className="text-gray-500">{timeRemaining}</span>
      </div>
    </div>
  );
};

export default MarketCard;

