// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import './Navbar.css';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationsBell from '../ui/NotificationsBell';

interface NavbarProps {
  navigateTo: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigateTo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from your auth context in a real app

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (page: string) => {
    navigateTo(page);
    setIsOpen(false); // Close mobile menu after navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div onClick={() => handleNavigation('home')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">ParentConnect</span>
          </div>
        </div>

        {/* Hamburger menu for mobile */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`hamburger ${isOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Navigation links */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <div 
              className="nav-link" 
              onClick={() => handleNavigation('home')}
              style={{ cursor: 'pointer' }}
            >
              Home
            </div>
          </li>
          
          {isLoggedIn ? (
            // Links shown when user is logged in
            <>
              <li className="nav-item">
                <div 
                  className="nav-link" 
                  onClick={() => handleNavigation('profile')}
                  style={{ cursor: 'pointer' }}
                >
                  Profile
                </div>
              </li>
              <li className="nav-item">
                <div 
                  className="nav-link" 
                  onClick={() => handleNavigation('matches')}
                  style={{ cursor: 'pointer' }}
                >
                  Matches
                </div>
              </li>
              <li className="nav-item">
                <div 
                  className="nav-link" 
                  onClick={() => handleNavigation('messages')}
                  style={{ cursor: 'pointer' }}
                >
                  Messages
                </div>
              </li>
              <li className="nav-item">
                <div 
                  className="nav-link" 
                  onClick={() => handleNavigation('events')}
                  style={{ cursor: 'pointer' }}
                >
                  Events
                </div>
              </li>
              <li className="nav-item nav-button">
                <button className="logout-button" onClick={() => setIsLoggedIn(false)}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Links shown when user is not logged in
            <>
              <li className="nav-item nav-button">
                <button className="login-button" onClick={() => setIsLoggedIn(true)}>
                  Login
                </button>
              </li>
              <li className="nav-item nav-button">
                <button 
                  className="signup-button" 
                  onClick={() => handleNavigation('register')}
                >
                  Sign Up
                </button>
              </li>
            </>
          )}
          
          <li className="nav-item notifications-item">
            <NotificationsBell navigateTo={navigateTo} />
          </li>
          <li className="nav-item theme-toggle-item">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;