import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import MarketCard from '../components/MarketCard';
import SkeletonCard from '../components/SkeletonCard';
import type { Market, MarketCategory, MarketStatus } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<MarketStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'All'>('All');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      console.log('Loading markets from API...');
      const data = await api.getMarkets();
      console.log('Markets loaded:', data.length, 'markets');
      setMarkets(data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter((market) => {
    if (statusFilter !== 'All' && market.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && market.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in">
              ⚡ Bet Fast. Settle Instantly.
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-100">
              The world's fastest prediction market powered by Linera
            </p>
            <p className="text-lg mb-8 text-blue-50 max-w-3xl mx-auto">
              Trade on sports, crypto, and real-world events with millisecond finality. 
              No gas wars. No congestion. Just pure speed.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const marketsSection = document.getElementById('markets-section');
                  marketsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse Markets →
              </button>
            </div>
            
            {/* Info Badge */}
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-50">Markets are automatically created by our oracle system</span>
            </div>
            
            {/* Live Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">{markets.length}</div>
                <div className="text-blue-100">Active Markets</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">
                  {markets.reduce((sum, m) => sum + m.yesPool + m.noPool, 0).toLocaleString()}
                </div>
                <div className="text-blue-100">Total Volume</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-1">&lt;100ms</div>
                <div className="text-blue-100">Settlement Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="markets-section">

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

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Live Markets
          </h2>
          <p className="text-gray-600">
            {filteredMarkets.length} {filteredMarkets.length === 1 ? 'market' : 'markets'} available
          </p>
        </div>

            {/* Markets Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredMarkets.length === 0 ? (
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

