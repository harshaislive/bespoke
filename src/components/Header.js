import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// If logo download worked, uncomment this line
// import logo from '../assets/logo.png';

const Header = () => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-darkEarth py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* If logo is available, use it */}
          {/* <img src={logo} alt="Beforest Logo" className="h-10 mr-4" /> */}
          
          {/* Fallback to text if logo is not available */}
          <Link to="/" className="text-offWhite font-serif text-xl hover:text-softGreen transition-colors">
            Beforest Bespoke Engine
          </Link>
        </div>
        
        {/* User authentication section */}
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center">
              <span className="text-offWhite text-sm mr-4">
                {user.email}
              </span>
              <button 
                onClick={handleSignOut}
                disabled={loading}
                className="bg-forestGreen hover:bg-opacity-80 transition-colors text-white text-sm py-2 px-3 rounded">
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