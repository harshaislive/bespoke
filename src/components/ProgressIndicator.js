import React from 'react';

const ProgressIndicator = ({ currentQuestion, totalQuestions, incompleteQuestions = [] }) => {
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  // Generate dots for stepper
  const renderDots = () => {
    const dots = [];
    for (let i = 1; i <= totalQuestions; i++) {
      // Determine dot status (completed, current, or future)
      const isCompleted = i < currentQuestion;
      const isCurrent = i === currentQuestion;
      const isIncomplete = incompleteQuestions && 
        incompleteQuestions.some(q => q.questionNumber === i);
      
      dots.push(
        <div key={i} className="flex flex-col items-center">
          <div 
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full 
              ${isIncomplete ? 'bg-richRed' : 
                isCompleted ? 'bg-forestGreen' : 
                  isCurrent ? 'bg-forestGreen' : 'bg-softGray'}
              ${isCurrent ? 'ring-2 ring-forestGreen ring-offset-2' : ''}`}
            aria-label={`Question ${i} ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
          ></div>
          {isCurrent && (
            <span className="absolute top-4 text-xs text-darkEarth font-medium">{i}</span>
          )}
        </div>
      );
    }
    return dots;
  };

  return (
    <div className="mb-4">
      {/* Numeric progress (shown above dots) */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-xs text-charcoalGray">{progressPercentage}% Complete</div>
        <div className="text-xs text-charcoalGray">{currentQuestion}/{totalQuestions}</div>
      </div>
      
      {/* Dot stepper (dots represent each question) */}
      <div className="flex justify-between items-center px-2 relative">
        {renderDots()}
        
        {/* Connection line between dots */}
        <div className="absolute top-1.5 left-2 right-2 h-0.5 bg-softGray -z-10"></div>
        
        {/* Progress line (green part) */}
        <div 
          className="absolute top-1.5 left-2 h-0.5 bg-forestGreen -z-5"
          style={{ width: `${(currentQuestion - 1) / (totalQuestions - 1) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
