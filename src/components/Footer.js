import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-darkEarth py-3 mt-auto">
      <div className="container mx-auto px-4 text-center text-offWhite text-sm">
        © {new Date().getFullYear()} Beforest - All rights reserved
      </div>
    </footer>
  );
};

export default Footer; 