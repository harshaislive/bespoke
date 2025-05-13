import React from 'react';
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
  // Handle text input changes
  const handleChange = (e) => {
    // Make sure we have a question before trying to access its text property
    if (question && question.text) {
      onAnswerChange(question.text, e.target.value);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-softGray">
      {/* Progress indicator */}
      <ProgressIndicator currentQuestion={questionNumber} totalQuestions={totalQuestions} />
      
      <div className="flex items-center mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-forestGreen text-white rounded-full flex items-center justify-center mr-3 font-bold">
          {questionNumber}
        </span>
        <h2 className="question-title font-serif text-lg text-darkEarth font-medium">
          {question && question.text}
        </h2>
      </div>
      
      <div className="answer-area mb-4">
        <textarea
          rows="4"
          className="w-full p-3 border border-softGray rounded-lg resize-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen focus:outline-none transition-colors min-h-[120px] text-charcoalGray"
          placeholder="Type your answer here..."
          value={answer || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-between mt-4">
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
    </div>
  );
};

export default QuestionCard;