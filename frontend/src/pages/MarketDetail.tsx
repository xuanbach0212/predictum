import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import LineraDataCard from '../components/LineraDataCard';
import type { Market, Outcome, UserPosition } from '../types';
import { calculateOdds, calculatePotentialPayout, formatAmount, formatPercentage, getTimeRemaining } from '../utils/calculations';

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>('Yes');
  const [showBetModal, setShowBetModal] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadMarket();
  }, [id]);

  const loadMarket = async () => {
    try {
      const marketId = parseInt(id || '0');
      const [marketData, positions] = await Promise.all([
        api.getMarket(marketId),
        api.getPositions(),
      ]);
      setMarket(marketData);
      setUserPosition(positions.find((p: any) => p.marketId === marketId) || null);
    } catch (error) {
      console.error('Failed to load market:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading market...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Market not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to markets
          </button>
        </div>
      </div>
    );
  }

  const { yesOdds, noOdds } = calculateOdds(market);
  const timeRemaining = getTimeRemaining(market.endTime);
  const totalPool = market.yesPool + market.noPool;

  const potentialPayout = betAmount
    ? calculatePotentialPayout(market, selectedOutcome, parseFloat(betAmount))
    : 0;
  const potentialProfit = potentialPayout - parseFloat(betAmount || '0');

  const handlePlaceBet = async () => {
    if (!market) return;
    setPlacing(true);
    
    const loadingToast = toast.loading('Placing your bet...');
    
    try {
      await api.placeBet(market.id, selectedOutcome, parseFloat(betAmount));
      toast.success(`Bet placed! ${betAmount} tokens on ${selectedOutcome}`, {
        id: loadingToast,
      });
      setShowBetModal(false);
      setBetAmount('');
      await loadMarket(); // Reload to see updated odds
    } catch (error: any) {
      toast.error(`Failed to place bet: ${error.message}`, {
        id: loadingToast,
      });
    } finally {
      setPlacing(false);
    }
  };

  const handleClaimWinnings = async () => {
    if (!market) return;
    
    const loadingToast = toast.loading('Claiming your winnings...');
    
    try {
      const result = await api.claimWinnings(market.id);
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(`Claimed ${result.payout} tokens!`, {
        id: loadingToast,
        duration: 5000,
      });
      
      await loadMarket();
    } catch (error: any) {
      toast.error(`Failed to claim: ${error.message}`, {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to markets
        </button>

        {/* Market Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {market.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              {market.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{market.question}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Pool:</span> {formatAmount(totalPool)} tokens
            </div>
            <div>
              <span className="font-medium">Ends in:</span> {timeRemaining}
            </div>
          </div>
        </div>

        {/* Odds Display */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Current Odds</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-2">YES</div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatPercentage(yesOdds)}
              </div>
              <div className="text-sm text-gray-600">
                Pool: {formatAmount(market.yesPool)} tokens
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="text-sm text-gray-600 mb-2">NO</div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {formatPercentage(noOdds)}
              </div>
              <div className="text-sm text-gray-600">
                Pool: {formatAmount(market.noPool)} tokens
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="h-4 flex rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${yesOdds * 100}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${noOdds * 100}%` }}
            />
          </div>
        </div>

        {/* Place Bet Button */}
        {market.status === 'Active' && (
          <button
            onClick={() => setShowBetModal(!showBetModal)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md mb-6"
          >
            Place Bet
          </button>
        )}

        {/* Bet Modal */}
        {showBetModal && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold mb-4">Place Your Bet</h3>

            {/* Outcome Selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedOutcome('Yes')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  selectedOutcome === 'Yes'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                YES ({formatPercentage(yesOdds)})
              </button>
              <button
                onClick={() => setSelectedOutcome('No')}
                className={`py-3 rounded-lg font-medium transition-all ${
                  selectedOutcome === 'No'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                NO ({formatPercentage(noOdds)})
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bet Amount (tokens)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Balance: 1,000 tokens</p>
            </div>

            {/* Preview */}
            {betAmount && parseFloat(betAmount) > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <h4 className="font-medium text-sm mb-2">Bet Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Betting on:</span>
                    <span className="font-medium">{selectedOutcome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatAmount(parseFloat(betAmount))} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential payout:</span>
                    <span className="font-medium text-green-600">
                      {formatAmount(potentialPayout)} tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential profit:</span>
                    <span className="font-medium text-green-600">
                      {formatAmount(potentialProfit)} tokens ({((potentialProfit / parseFloat(betAmount)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePlaceBet}
              disabled={!betAmount || parseFloat(betAmount) <= 0 || placing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {placing ? 'Placing Bet...' : 'Confirm Bet'}
            </button>
          </div>
        )}

        {/* User Position */}
        {userPosition && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Your Position</h3>
            <div className="grid grid-cols-2 gap-4">
              {userPosition.yesAmount > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">YES Position</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(userPosition.yesAmount)} tokens
                  </div>
                </div>
              )}
              {userPosition.noAmount > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">NO Position</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatAmount(userPosition.noAmount)} tokens
                  </div>
                </div>
              )}
            </div>

            {market.status === 'Resolved' && !userPosition.claimed && (
              <button
                onClick={handleClaimWinnings}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Claim Winnings
              </button>
            )}
          </div>
        )}

        {/* Linera On-Chain Data */}
        <LineraDataCard marketId={market.id} postgresMarket={market} />
      </div>
    </div>
  );
};

export default MarketDetail;

