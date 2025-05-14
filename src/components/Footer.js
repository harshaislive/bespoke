import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  
  // Check if we're on the assessment page
  const isAssessmentPage = location.pathname === '/';
  
  // Hide footer on assessment page
  if (isAssessmentPage) {
    return null;
  }
  
  return (
    <footer className="bg-darkEarth py-2 md:py-3 mt-auto">
      <div className="container mx-auto px-4 text-center text-offWhite text-xs md:text-sm">
        © {new Date().getFullYear()} Beforest - All rights reserved
      </div>
    </footer>
  );
};

export default Footer; 