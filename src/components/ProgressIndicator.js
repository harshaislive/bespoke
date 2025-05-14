import React from 'react';

const ProgressIndicator = ({ currentQuestion, totalQuestions }) => {
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center">
        <div className="text-xs text-charcoalGray">{progressPercentage}% Complete</div>
        <div className="flex-1 mx-2 h-1.5 bg-softGray rounded-full overflow-hidden">
          <div 
            className="h-full bg-forestGreen transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-charcoalGray">{currentQuestion}/{totalQuestions}</div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
