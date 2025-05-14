import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// If logo download worked, uncomment this line
// import logo from '../assets/logo.png';

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Check if we're on the assessment page
  const isAssessmentPage = location.pathname === '/';
  
  // Scroll handler for auto-hiding header on mobile
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      // Scrolling down - collapse header
      setIsCollapsed(true);
    } else {
      // Scrolling up - show header
      setIsCollapsed(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);
  
  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleSignOut = async () => {
    await signOut();
  };
  
  // Minimal header for assessment page
  if (isAssessmentPage && isCollapsed) {
    return (
      <header className="fixed top-0 left-0 right-0 z-20 bg-darkEarth py-2 shadow-md transform transition-transform duration-300 ease-in-out">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="text-offWhite text-sm flex items-center"
            aria-label="Expand header"
          >
            <span className="font-serif mr-1">Beforest</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-darkEarth py-2 md:py-4 shadow-md transition-all duration-300 ${isCollapsed ? 'transform -translate-y-full' : ''} ${isAssessmentPage ? 'fixed top-0 left-0 right-0 z-20' : ''}`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* If logo is available, use it */}
            {/* <img src={logo} alt="Beforest Logo" className="h-8 md:h-10 mr-2 md:mr-4" /> */}
            
            {/* Fallback to text if logo is not available */}
            <Link to="/" className="text-offWhite font-serif text-lg md:text-xl hover:text-softGreen transition-colors">
              Beforest Bespoke Engine
            </Link>
          </div>
          
          {/* Mobile collapse button */}
          {isAssessmentPage && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="md:hidden text-offWhite p-1"
              aria-label="Collapse header"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </button>
          )}
        </div>
        
        {/* User authentication section */}
        <div className="flex items-center justify-end mt-2 md:mt-0">
          {user ? (
            <div className="flex flex-col md:flex-row items-end md:items-center">
              <span className="text-offWhite text-xs md:text-sm md:mr-4 mb-1 md:mb-0">
                {user.email}
              </span>
              <button 
                onClick={handleSignOut}
                disabled={loading}
                className="bg-forestGreen hover:bg-opacity-80 transition-colors text-white text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 rounded">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-offWhite hover:text-softGreen transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;