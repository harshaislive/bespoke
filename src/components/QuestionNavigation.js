import React from 'react';

const QuestionNavigation = ({ 
  questions, 
  currentQuestionIndex, 
  onQuestionSelect,     
  onComplete,           
  isCompleted           
}) => {
  if (!questions || questions.length === 0) {
    return null; 
  }

  return (
    <div className="bg-forestGreen-light p-3 border-r border-softGray w-full md:w-60 md:h-screen overflow-y-auto">
      <h2 className="text-base font-serif text-forestGreen mb-3 text-center md:text-left">Questions</h2>
      
      <div className="flex flex-wrap md:flex-col gap-2 justify-center md:justify-start">
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
};

export default QuestionNavigation;