import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketCard from '../components/MarketCard';
import { mockMarkets } from '../data/mockMarkets';
import type { MarketCategory, MarketStatus } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<MarketStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'All'>('All');

  const filteredMarkets = mockMarkets.filter((market) => {
    if (statusFilter !== 'All' && market.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && market.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Prediction Markets
          </h1>
          <p className="text-lg text-gray-600">
            Bet on real-world events with instant settlement on Linera
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Active', 'Locked', 'Resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as MarketStatus | 'All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Sports', 'Crypto', 'Binary'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category as MarketCategory | 'All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Markets</div>
            <div className="text-3xl font-bold text-gray-900">{mockMarkets.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active Markets</div>
            <div className="text-3xl font-bold text-green-600">
              {mockMarkets.filter((m) => m.status === 'Active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Volume</div>
            <div className="text-3xl font-bold text-blue-600">
              {mockMarkets.reduce((sum, m) => sum + m.yesPool + m.noPool, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Markets Grid */}
        {filteredMarkets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No markets found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onClick={() => navigate(`/market/${market.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

