import React from 'react';

// Updated Timer component to show time elapsed
const Timer = ({ timeElapsed }) => {
  // Format time as MM:SS
  const formatTime = (totalSeconds) => {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
      return '00:00'; // Return default if timeElapsed is invalid
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  // No need for different time classes since we're showing elapsed time
  const getTimeClass = () => {
    return 'text-forestGreen';
  };
  
  return (
    <div className="timer text-right font-medium text-sm md:text-base flex items-center">
      <svg className="w-4 h-4 mr-1 text-forestGreen hidden md:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span className="font-serif text-forestGreen md:inline hidden">Time Elapsed:</span>
      <span className={`${getTimeClass()} md:ml-1`}>
        {formatTime(timeElapsed)}
      </span>
    </div>
  );
};

export default Timer;