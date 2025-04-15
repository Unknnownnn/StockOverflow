import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Navbar.css';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="navbar-trigger" />
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/welcome">
            <span className="logo1">Stock</span>
            <span className="logo2">Overflow</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/markets">Markets</Link>
          <Link to="/news">News</Link>
          {user ? (
            <>
              <Link to="/portfolio">Portfolio</Link>
              <button onClick={handleSignOut} className="auth-btn logout-btn">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn login-btn">Login</Link>
              <Link to="/signup" className="auth-btn signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar; 