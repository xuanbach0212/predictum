import { useNavigate } from 'react-router-dom';
import { mockMarkets, mockUserPositions } from '../data/mockMarkets';
import { calculateOdds, formatAmount, formatPercentage } from '../utils/calculations';

const MyBets = () => {
  const navigate = useNavigate();

  const userMarketsWithPositions = mockUserPositions.map((position) => {
    const market = mockMarkets.find((m) => m.id === position.marketId);
    return { market, position };
  }).filter((item) => item.market !== undefined);

  if (userMarketsWithPositions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bets</h1>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bets yet</h3>
            <p className="text-gray-600 mb-6">Start betting on markets to see your positions here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Markets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bets</h1>
        <p className="text-lg text-gray-600 mb-8">Track your active positions and claim winnings</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Positions</div>
            <div className="text-3xl font-bold text-gray-900">
              {userMarketsWithPositions.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Invested</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatAmount(
                mockUserPositions.reduce((sum, p) => sum + p.yesAmount + p.noAmount, 0)
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Claimable</div>
            <div className="text-3xl font-bold text-green-600">
              {userMarketsWithPositions.filter(
                (item) => item.market!.status === 'Resolved' && !item.position.claimed
              ).length}
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div className="space-y-4">
          {userMarketsWithPositions.map(({ market, position }) => {
            if (!market) return null;

            const { yesOdds, noOdds } = calculateOdds(market);
            const totalInvested = position.yesAmount + position.noAmount;

            return (
              <div
                key={market.id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/market/${market.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {market.category}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          market.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : market.status === 'Resolved'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {market.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {market.question}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Your Position */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Your Position</div>
                    <div className="space-y-1">
                      {position.yesAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">YES:</span>
                          <span className="font-semibold text-green-600">
                            {formatAmount(position.yesAmount)} tokens
                          </span>
                        </div>
                      )}
                      {position.noAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">NO:</span>
                          <span className="font-semibold text-red-600">
                            {formatAmount(position.noAmount)} tokens
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Total:</span>
                          <span className="font-bold text-gray-900">
                            {formatAmount(totalInvested)} tokens
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Odds */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Current Odds</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">YES:</span>
                        <span className="font-semibold text-green-600">
                          {formatPercentage(yesOdds)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">NO:</span>
                        <span className="font-semibold text-red-600">
                          {formatPercentage(noOdds)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-center">
                    {market.status === 'Resolved' && !position.claimed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Winnings claimed!');
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Claim Winnings
                      </button>
                    ) : market.status === 'Active' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/market/${market.id}`);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Add More
                      </button>
                    ) : position.claimed ? (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold mb-1">✓ Claimed</div>
                        <div className="text-sm text-gray-600">Winnings collected</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-yellow-600 font-semibold mb-1">⏳ Pending</div>
                        <div className="text-sm text-gray-600">Awaiting resolution</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyBets;

