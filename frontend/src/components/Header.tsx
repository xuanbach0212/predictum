import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { checkLineraAvailability } from '../api/lineraQueries';

const Header = () => {
  const location = useLocation();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState(1000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lineraStatus, setLineraStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    if (authenticated) {
      loadBalance();
      const interval = setInterval(loadBalance, 2000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  useEffect(() => {
    checkLineraStatus();
    const interval = setInterval(checkLineraStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkLineraStatus = async () => {
    const available = await checkLineraAvailability();
    setLineraStatus(available ? 'connected' : 'disconnected');
  };

  const loadBalance = async () => {
    try {
      const bal = await api.getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getDisplayName = () => {
    if (user?.email?.address) {
      return user.email.address.split('@')[0];
    }
    if (user?.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;
    }
    return 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Predictum
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Markets
            </Link>
            <Link
              to="/my-bets"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/my-bets')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              My Bets
            </Link>
          </nav>

          {/* Desktop Wallet */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Linera Status Indicator */}
            <div className="relative group">
              <div className={`w-2 h-2 rounded-full ${
                lineraStatus === 'connected' ? 'bg-green-500' :
                lineraStatus === 'disconnected' ? 'bg-red-500' :
                'bg-yellow-500'
              } animate-pulse`}></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="font-semibold mb-1">
                  {lineraStatus === 'connected' ? '✅ Linera Connected' :
                   lineraStatus === 'disconnected' ? '❌ Linera Disconnected' :
                   '⏳ Checking...'}
                </div>
                <div className="text-gray-300">
                  {lineraStatus === 'connected' ? 'On-chain sync active' :
                   lineraStatus === 'disconnected' ? 'Using database only' :
                   'Connecting to blockchain...'}
                </div>
              </div>
            </div>
            {authenticated && (
              <div className="text-sm text-gray-600">
                Balance: <span className="font-semibold text-gray-900">{balance.toLocaleString()}</span> tokens
              </div>
            )}
            {!ready ? (
              <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium text-sm">
                Loading...
              </div>
            ) : authenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden lg:inline">👋 {getDisplayName()}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Markets
              </Link>
              <Link
                to="/my-bets"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/my-bets')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                My Bets
              </Link>
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-200">
              {authenticated && (
                <div className="text-sm text-gray-600 mb-3 px-3">
                  Balance: <span className="font-semibold text-gray-900">{balance.toLocaleString()}</span> tokens
                </div>
              )}
              {!ready ? (
                <div className="px-3 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium text-sm text-center">
                  Loading...
                </div>
              ) : authenticated ? (
                <div className="space-y-2 px-3">
                  <div className="text-sm text-gray-700">👋 {getDisplayName()}</div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm text-sm mx-3"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

