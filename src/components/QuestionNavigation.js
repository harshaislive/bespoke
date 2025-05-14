import React, { useState } from 'react';

const QuestionNavigation = ({ 
  questions, 
  currentQuestionIndex, 
  onQuestionSelect,     
  onComplete,           
  isCompleted           
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!questions || questions.length === 0) {
    return null; 
  }

  // Mobile bottom navigation bar
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-softGray shadow-lg z-10">
      <div className="flex justify-between items-center p-2">
        <button
          onClick={() => onQuestionSelect(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className={`p-2 rounded-full ${currentQuestionIndex === 0 ? 'text-gray-400' : 'text-forestGreen'}`}
          aria-label="Previous question"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex items-center justify-center px-4 py-2 bg-softGray rounded-full text-sm text-darkEarth"
        >
          <span className="font-medium mr-1">{currentQuestionIndex + 1}</span>
          <span className="text-xs text-gray-500">/ {questions.length}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {!isCompleted && currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={onComplete}
            className="p-2 rounded-full text-richRed"
            aria-label="Complete assessment"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => onQuestionSelect(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`p-2 rounded-full ${currentQuestionIndex === questions.length - 1 ? 'text-gray-400' : 'text-forestGreen'}`}
            aria-label="Next question"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        )}
      </div>
      
      {/* Mobile question selector dropdown */}
      {mobileNavOpen && (
        <div className="absolute bottom-full left-0 right-0 max-h-[40vh] overflow-y-auto bg-white border-t border-softGray shadow-lg p-3">
          <div className="flex flex-col gap-2">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  onQuestionSelect(index);
                  setMobileNavOpen(false);
                }}
                className={`
                  flex items-center p-2.5 rounded-lg w-full mb-1
                  transition-colors duration-200 text-sm
                  ${currentQuestionIndex === index 
                    ? 'bg-forestGreen text-white' 
                    : 'bg-white text-charcoalGray hover:bg-softGray'}
                `}
                aria-label={`Go to question ${index + 1}`}
                aria-current={currentQuestionIndex === index ? 'true' : 'false'}
              >
                <span className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-softGray text-darkEarth font-medium">
                  {index + 1}
                </span>
                <span className="line-clamp-2 text-left flex-1">
                  {question.text ? question.text : `Question ${index + 1}`}
                </span>
              </button>
            ))}
          </div>
          
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="mt-4 w-full py-3 bg-richRed text-white rounded-lg hover:bg-burntRed transition-colors duration-200 font-bold shadow-md"
            >
              Complete Assessment
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Desktop sidebar navigation
  const DesktopNav = () => (
    <div className="hidden md:block bg-forestGreen-light p-3 border-r border-softGray w-60 h-screen overflow-y-auto">
      <h2 className="text-base font-serif text-forestGreen mb-3 text-left">Questions</h2>
      
      <div className="flex flex-col gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(index)}
            className={`
              flex items-center p-1.5 rounded-lg w-full mb-1.5
              transition-colors duration-200 text-sm
              ${currentQuestionIndex === index 
                ? 'bg-forestGreen text-white' 
                : 'bg-white text-charcoalGray hover:bg-white hover:text-richRed hover:border hover:border-richRed'}
            `}
            aria-label={`Go to question ${index + 1}`}
            aria-current={currentQuestionIndex === index ? 'true' : 'false'}
          >
            <span className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-softGray text-darkEarth font-medium">
              {index + 1}
            </span>
            <span className="line-clamp-1 text-left">
              {question.text ? question.text.substring(0, 30) + (question.text.length > 30 ? '...' : '') : `Question ${index + 1}`}
            </span>
          </button>
        ))}
      </div>
      
      {!isCompleted && (
        <button
          onClick={onComplete}
          className="mt-6 w-full py-3 bg-richRed text-white rounded-lg hover:bg-burntRed transition-colors duration-200 font-bold shadow-md"
        >
          Complete Assessment
        </button>
      )}
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
};

export default QuestionNavigation;