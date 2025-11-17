import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';

const Header = () => {
  const location = useLocation();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState(1000);

  useEffect(() => {
    if (authenticated) {
      loadBalance();
      const interval = setInterval(loadBalance, 2000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

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

          {/* Navigation */}
          <nav className="flex space-x-8">
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

          {/* Wallet */}
          <div className="flex items-center space-x-3">
            {authenticated && (
              <div className="text-sm text-gray-600">
                Balance: <span className="font-semibold text-gray-900">{balance.toLocaleString()}</span> tokens
              </div>
            )}
            {!ready ? (
              <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium">
                Loading...
              </div>
            ) : authenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">👋 {getDisplayName()}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

