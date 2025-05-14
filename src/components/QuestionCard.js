import React, { useEffect, useRef } from 'react';
import ProgressIndicator from './ProgressIndicator';

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrev,
  isFirstQuestion,
  isLastQuestion,
  onSubmit
}) => {
  const textareaRef = useRef(null);
  
  // Check if answer is empty
  const isAnswerEmpty = !answer || answer.trim() === '';
  
  // Handle text input changes
  const handleChange = (e) => {
    // Make sure we have a question before trying to access its text property
    if (question && question.text) {
      onAnswerChange(question.text, e.target.value);
      
      // Auto-resize textarea to fit content
      adjustTextareaHeight();
    }
  };
  
  // Auto-adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  };
  
  // Adjust height when answer changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [answer]);
  
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border border-softGray mb-16 md:mb-0">
      {/* Progress indicator */}
      <ProgressIndicator currentQuestion={questionNumber} totalQuestions={totalQuestions} />
      
      <div className="flex items-start mb-3 md:mb-4">
        <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 ${isAnswerEmpty ? 'bg-richRed' : 'bg-forestGreen'} text-white rounded-full flex items-center justify-center mr-2 md:mr-3 font-bold text-sm md:text-base mt-0.5`}>
          {questionNumber}
        </span>
        <h2 className="question-title font-serif text-base md:text-lg text-darkEarth font-medium">
          {question && question.text}
        </h2>
      </div>
      
      <div className="answer-area mb-3 md:mb-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows="4"
            className={`w-full p-3 border rounded-lg resize-none focus:ring-1 focus:outline-none transition-colors min-h-[120px] text-charcoalGray text-base md:text-base
              ${isAnswerEmpty 
                ? 'border-richRed focus:border-richRed focus:ring-richRed bg-red-50' 
                : 'border-softGray focus:border-forestGreen focus:ring-forestGreen'}`}
            placeholder="Type your answer here..."
            value={answer || ''}
            onChange={handleChange}
          />
          {isAnswerEmpty && (
            <div className="absolute top-3 right-3 text-richRed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          )}
        </div>
        {isAnswerEmpty && (
          <p className="text-xs text-richRed mt-1">This question requires an answer</p>
        )}
        <div className="flex justify-end mt-1">
          <button 
            onClick={() => window.navigator.vibrate && window.navigator.vibrate(10)}
            className="text-xs text-gray-500 flex items-center"
            aria-label="Dismiss keyboard"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            Dismiss keyboard
          </button>
        </div>
      </div>
      
      {/* Desktop navigation buttons */}
      <div className="hidden md:flex justify-between mt-4">
        <button
          onClick={onPrev}
          disabled={isFirstQuestion}
          className={`px-5 py-2 rounded-lg shadow-md ${isFirstQuestion ? 'bg-gray-300 cursor-not-allowed' : 'bg-charcoalGray hover:bg-darkEarth'} text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-charcoalGray focus:ring-opacity-50 flex items-center`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Previous
        </button>
        
        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2 rounded-lg bg-richRed hover:bg-burntRed text-white shadow-md font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-richRed focus:ring-opacity-50 flex items-center"
          >
            Submit Assessment
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-5 py-2 rounded-lg bg-forestGreen hover:bg-opacity-80 text-white shadow-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forestGreen focus:ring-opacity-50 flex items-center"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        )}
      </div>
      
      {/* Mobile floating complete button (only shown on last question) */}
      {isLastQuestion && (
        <div className="fixed bottom-16 right-4 md:hidden z-10">
          <button
            onClick={onSubmit}
            className="w-12 h-12 rounded-full bg-richRed hover:bg-burntRed text-white shadow-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-richRed focus:ring-opacity-50 flex items-center justify-center"
            aria-label="Submit Assessment"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;