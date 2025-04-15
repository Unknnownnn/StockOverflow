import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MarketOverview from './pages/MarketOverview';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Markets from './pages/Markets';
import News from './pages/News';
import Portfolio from './pages/Portfolio';
import ApiTesting from './pages/ApiTesting';
import { TradeProvider } from './context/TradeContext';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <TradeProvider>
      <Router>
        <div className="App">
          <Navbar user={user} />
          <Routes>
            <Route path="/" element={<MarketOverview />} />
            <Route path="/welcome" element={<Home />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" /> : <SignUp />} 
            />
            <Route path="/markets" element={<Markets />} />
            <Route path="/news" element={<News />} />
            <Route 
              path="/portfolio" 
              element={user ? <Portfolio /> : <Navigate to="/login" />}
            />
            <Route path="/testing" element={<ApiTesting />} />
          </Routes>
        </div>
      </Router>
    </TradeProvider>
  );
}

export default App; 