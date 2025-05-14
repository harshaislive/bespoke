import React from 'react';

const AssessmentLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-offWhite p-4 text-center">
      <div className="mb-8">
        {/* Animated Brain/Gear Icon (Simple Pulse) */}
        <svg 
          className="w-20 h-20 text-forestGreen animate-pulse-slow"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {/* Brain Icon Paths (Tabler Icons - Brain) */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M17.5 16a3.5 3.5 0 0 0 0 -7h-1.5" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M6.5 16a3.5 3.5 0 0 1 0 -7h1.5" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" 
          /> 
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-forestGreen mb-4 animate-fadeIn">Your assessment is getting ready...</h2>
      <p className="text-lg text-charcoalGray mb-8 animate-fadeIn delay-100">We're preparing your questions.</p>
      
      {/* Simple Loading Bar */}
      <div className="w-full max-w-md bg-softGray rounded-full h-2.5 mb-4 overflow-hidden">
        <div 
          className="bg-forestGreen h-2.5 rounded-full animate-loading-bar"
          style={{ width: '100%' }} // The animation will handle the movement
        ></div>
      </div>
      <p className="text-sm text-gray-500 animate-fadeIn delay-200">Please wait a moment.</p>
    </div>
  );
};

export default AssessmentLoading;
