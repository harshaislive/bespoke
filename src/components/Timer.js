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
    <div className="timer text-right font-medium text-lg">
      <span className="font-serif text-forestGreen">Time Elapsed:</span>{' '}
      <span className={getTimeClass()}>
        {formatTime(timeElapsed)}
      </span>
    </div>
  );
};

export default Timer;