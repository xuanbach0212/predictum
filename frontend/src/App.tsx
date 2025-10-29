import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MarketDetail from './pages/MarketDetail';
import MyBets from './pages/MyBets';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market/:id" element={<MarketDetail />} />
          <Route path="/my-bets" element={<MyBets />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
