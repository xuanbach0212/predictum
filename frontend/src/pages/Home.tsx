import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import MarketCard from '../components/MarketCard';
import SkeletonCard from '../components/SkeletonCard';
import type { Market, MarketCategory, MarketStatus } from '../types';

type SortOption = 'newest' | 'ending-soon' | 'popular' | 'alphabetical';

const Home = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<MarketStatus | 'All'>('Active');
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('ending-soon');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMarkets, setTotalMarkets] = useState(0);
  const marketsPerPage = 20;

  useEffect(() => {
    loadMarkets();
  }, [currentPage, statusFilter, categoryFilter, sortBy]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      console.log(`Loading markets page ${currentPage} with filters:`, { statusFilter, categoryFilter, sortBy });
      const { markets: data, pagination } = await api.getMarkets(
        currentPage, 
        marketsPerPage,
        statusFilter,
        categoryFilter,
        sortBy
      );
      console.log('Markets loaded:', data.length, 'markets');
      setMarkets(data);
      setTotalPages(pagination.totalPages);
      setTotalMarkets(pagination.total);
    } catch (error) {
      console.error('Failed to load markets:', error);
      toast.error('Failed to load markets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Backend now handles filtering and sorting
  const filteredMarkets = markets;

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
                <div className="text-3xl font-bold mb-1">{totalMarkets}</div>
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

        {/* Filters & Sort - Compact */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Active', 'Locked', 'Resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as MarketStatus | 'All')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Sports', 'Crypto', 'Binary'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category as MarketCategory | 'All')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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

            {/* Sort By */}
            <div className="flex-1">
              <label htmlFor="sortBy" className="block text-xs font-medium text-gray-600 mb-2">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ending-soon">⏰ Ending Soon</option>
                <option value="newest">🆕 Newest First</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="alphabetical">🔤 A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Live Markets
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Showing {((currentPage - 1) * marketsPerPage) + 1}-{Math.min(currentPage * marketsPerPage, totalMarkets)} of {totalMarkets} markets
            </p>
          </div>
          
          {/* Quick Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            </div>
          )}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onClick={() => navigate(`/market/${market.id}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-2">
                {loading && (
                  <div className="text-sm text-gray-600 sm:mr-4 mb-2 sm:mb-0">
                    Loading...
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1 || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] ${
                      currentPage === 1 || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-600'
                    }`}
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1 sm:gap-2">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={loading}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] ${
                            loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-1 sm:px-2 py-2 text-gray-400 text-sm">...</span>}
                      </>
                    )}

                    {/* Current page and neighbors */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === currentPage || 
                               page === currentPage - 1 || 
                               page === currentPage + 1 ||
                               (currentPage <= 2 && page <= 3) ||
                               (currentPage >= totalPages - 1 && page >= totalPages - 2);
                      })
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={loading}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-1 sm:px-2 py-2 text-gray-400 text-sm">...</span>}
                        <button
                          onClick={() => {
                            setCurrentPage(totalPages);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={loading}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] ${
                            loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages || loading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] ${
                      currentPage === totalPages || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-600'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

