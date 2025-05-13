import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import UserInfoForm from '../components/UserInfoForm';
import QuestionNavigation from '../components/QuestionNavigation';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { sessionAPI } from '../services/supabase';
import AssessmentLoading from '../components/AssessmentLoading';
import { useAuth } from '../context/AuthContext';

const AssessmentPage = () => {
  const { user } = useAuth();
  
  // State for assessment flow
  const [userInfo, setUserInfo] = useState({ 
    name: '', 
    email: user?.email || '', 
    team: '' 
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Stores the current Supabase session ID
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0); // Start from 0 seconds
  const [documentContext, setDocumentContext] = useState('No document context available.');

  // Update email in userInfo when auth user changes
  useEffect(() => {
    if (user?.email) {
      setUserInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);
  
  // Load saved session from localStorage on component mount
  useEffect(() => {
    const loadSavedSession = () => {
      try {
        // Check if there's a saved session in localStorage
        const savedSession = localStorage.getItem('assessmentSession');
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          
          // Only restore if session is not completed
          if (!parsedSession.assessmentCompleted) {
            // Restore session state
            setSessionId(parsedSession.sessionId);
            setUserInfo(parsedSession.userInfo);
            setQuestions(parsedSession.questions);
            setCurrentQuestionIndex(parsedSession.currentQuestionIndex);
            setAnswers(parsedSession.answers);
            setAssessmentStarted(parsedSession.assessmentStarted);
            setTimeElapsed(parsedSession.timeElapsed || 0);
            setIsTimerRunning(parsedSession.isTimerRunning);
            setIsDemoMode(parsedSession.isDemoMode || false);
            
            console.log('Assessment session restored from localStorage');
          } else {
            // If the session was completed, clear it
            localStorage.removeItem('assessmentSession');
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        // If there's an error parsing the saved session, remove it
        localStorage.removeItem('assessmentSession');
      }
    };
    
    loadSavedSession();
  }, []);  // Run only on component mount
  
  // Save session to localStorage whenever important state changes
  useEffect(() => {
    // Only save if assessment has started
    if (assessmentStarted) {
      const sessionToSave = {
        sessionId,
        userInfo,
        questions,
        currentQuestionIndex,
        answers,
        assessmentStarted,
        assessmentCompleted,
        timeElapsed,
        isTimerRunning,
        isDemoMode
      };
      
      localStorage.setItem('assessmentSession', JSON.stringify(sessionToSave));
      console.log('Assessment session saved to localStorage');
    }
  }, [sessionId, questions, currentQuestionIndex, answers, timeElapsed, assessmentStarted, 
      assessmentCompleted, isTimerRunning, isDemoMode, userInfo]);
      
  // Timer effect to increment time elapsed
  useEffect(() => {
    let timerInterval;
    
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setTimeElapsed(prev => prev + 1); // Increment by 1 second
      }, 1000);
    }
    
    // Clean up interval when component unmounts or timer stops
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning]);

  // Fetch document context on component mount
  useEffect(() => {
    const fetchDocumentContext = async () => {
      try {
        console.log('Fetching knowledge base documents...');
        const response = await fetch('/documents/beforest_knowledge.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge base: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Use the pre-formatted full context if available, otherwise format the JSON
        if (data.fullContext) {
          setDocumentContext(data.fullContext);
        } else {
          const formattedContext = [
            `BMC:\n- Mission: ${data.bmc.mission}`,
            `- Customer Segments: ${data.bmc.customerSegments.join(', ')}`,
            `- Value Propositions: ${data.bmc.valuePropositions.join(', ')}`,
            `- Customer Relationships: ${data.bmc.customerRelationships}`,
            `- Sub-Brands: BeWild (${data.bmc.subBrands.BeWild}), Belong (${data.bmc.subBrands.Belong})`,
            `- Common Concerns: ${data.bmc.commonProspectConcerns.join(', ')}`,
            `\nBrand Guidelines:\n- Tone: Assertive (${data.brandGuidelines.tone.assertive}), Authentic (${data.brandGuidelines.tone.authentic}), Approachable (${data.brandGuidelines.tone.approachable})`,
            `- Guidelines: ${data.brandGuidelines.guidelines.join('; ')}`,
            `- Brand Persona: ${data.brandGuidelines.brandPersona}`,
            `- Purpose: ${data.brandGuidelines.purpose}`
          ].join('\n');
          setDocumentContext(formattedContext);
        }
        console.log('Knowledge base documents loaded successfully.');
      } catch (error) {
        console.error('Error fetching knowledge base documents:', error);
        setDocumentContext('Error loading knowledge base documents. Using fallback context for question generation.');
      }
    };

    fetchDocumentContext();
  }, []);

  // System Prompt for OpenAI (embedding the user-provided prompt here)
  const openAISystemPromptTemplate = `You are the Bespoke Agent for Beforest, tasked with generating 5 situation-based questions to evaluate employees' communication skills in converting well-informed prospects into members of the Beforest community. Use the knowledge base documents (Beforest BMC and Brand Guidelines) provided below to create realistic scenarios that reflect the final concerns or objections prospects might raise before joining, as well as Beforest's mission of inspiring sustainable living by transforming landscapes.

### Instructions:
- Generate exactly 5 situation-based questions.
- Each question should present a realistic scenario involving a prospect who has already attended a one-on-one call, received detailed information about Beforest (e.g., collective ownership, pricing, brochure), and has clarity on Beforest's mission and offerings, but is hesitant to join due to final concerns or objections.
- Base scenarios on the BMC's customer segments (e.g., retirees/empty nesters, nature enthusiasts, urban dwellers seeking sustainable lifestyles) and their potential hesitations (e.g., financial commitment, community dynamics, long-term value).
- Incorporate Beforest's offerings, such as the BeWild produce arm (organic coffee, rice, honey, etc.) or Belong barefoot luxury experiences (glamping, nature walks), where relevant.
- Reflect the Brand Guidelines' tone: assertive (70%), authentic (30%). Avoid superlatives, hyperbole, or exaggeration; use simple, fact-based language. Be conversational but direct in your questions.
- Ensure questions test the employee's ability to address these concerns using Beforest's value propositions (e.g., trusted partnerships, collective ownership benefits, legacy protection, inclusive community) in a transparent, community-focused manner, ultimately convincing the prospect to join.
- Format each question as a string in a JSON array, e.g., ["Question 1", "Question 2", ..., "Question 5"].
- Use these user generated questions which are asked by realtime users on website using our chatbot as base and strictly only use if they are relevant. If they are relevant pls ensure you give weightage to that question and follow rules mentioned: {{ $json.User_message }}

### Retrieved Knowledge Base Context:
{{DOCUMENT_CONTEXT}}

### Examples of Situation-Based Questions (use these only as a guide for structure, not content if context differs):
- "A retiree prospect who has attended a one-on-one call says, 'I understand the benefits of collective ownership, but I'm worried about the financial commitment for my family in the long term.' How do you address their concern by highlighting Beforest's protection of legacy and safety of diversification in a transparent, fact-based way?"
- "A nature enthusiast prospect who is familiar with Beforest's mission says, 'I'm interested in joining, but what if I don't get along with the other members of the collective?' How do you reassure them about Beforest's inclusive community and one-to-one relationships while maintaining an authentic tone?"

Generate the 5 situation-based questions now.`;

  // Default/Demo questions (fallback)
  const defaultQuestions = [
    { text: "Default: What are your primary goals?" },
    { text: "Default: Describe a recent challenge." },
  ];
  const demoQuestions = [
    { text: "Demo: What is your primary goal for today?" },
    { text: "Demo: How can we assist you further?" },
  ];

  // Note: We've replaced this timer countdown effect with the new time elapsed effect above

  const handleUserInfoSubmit = (info) => {
    setUserInfo(info);
    // Don't call handleStartAssessment directly, UserInfoForm's onSubmit will do that or a dedicated start button
  };

  const handleStartAssessment = async (submittedUserInfo) => {
    setIsLoadingAssessment(true);
    setIsSubmitting(true);
    setError(null);
    setSessionId(null); // Will be set after successful session creation
    setIsDemoMode(false);
    let newSessionId = null; // Keep this to store the ID from the single createSession call

    // --- OpenAI Client Initialization ---
    const openAIKey = process.env.REACT_APP_OPENAI_API_KEY;
    let openai;
    if (openAIKey) {
      openai = new OpenAI({ apiKey: openAIKey, dangerouslyAllowBrowser: true });
    } else {
      console.error('OpenAI API key (REACT_APP_OPENAI_API_KEY) is not defined. Question generation will fail.');
      // This will be caught by the main try-catch, leading to demo mode
    }
    // --- End Initializations ---

    try {
      // Step 1: Fetch user queries from n8n (Optional)
      let userQueriesForPrompt = 'No specific user queries provided for this generation.';
      const userQueriesWebhookUrl = process.env.REACT_APP_WEBHOOK_USER_QUERIES_URL;
      if (userQueriesWebhookUrl) {
        try {
          console.log('Fetching user queries from n8n webhook:', userQueriesWebhookUrl);
          const n8nResponse = await fetch(userQueriesWebhookUrl);
          if (n8nResponse.ok) {
            const n8nData = await n8nResponse.json();
            if (n8nData && n8nData.User_message && typeof n8nData.User_message === 'string' && n8nData.User_message.trim() !== '') {
              userQueriesForPrompt = n8nData.User_message;
            } else if (n8nData && typeof n8nData === 'string' && n8nData.trim() !== '') {
              userQueriesForPrompt = n8nData;
            }
            console.log('User queries fetched for prompt:', userQueriesForPrompt);
          } else {
            console.warn(`Failed to fetch user queries from n8n: ${n8nResponse.status}. Proceeding without them.`);
          }
        } catch (err) {
          console.warn('Error calling user queries n8n webhook. Proceeding without them:', err);
        }
      }

      // Step 2: Call OpenAI API to generate questions using document context
      if (!openai) {
        throw new Error('OpenAI client not initialized (API key likely missing). Cannot generate questions.');
      }

      const finalSystemPrompt = openAISystemPromptTemplate
        .replace('{{ $json.User_message }}', userQueriesForPrompt)
        .replace('{{DOCUMENT_CONTEXT}}', documentContext);
      
      console.log('Calling OpenAI API to generate assessment questions...');
      const openAICompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: finalSystemPrompt }],
      });

      let fetchedOpenAIQuestions = [];
      if (openAICompletion.choices && openAICompletion.choices.length > 0) {
        const content = openAICompletion.choices[0].message.content;
        try {
          const parsedQuestions = JSON.parse(content);
          if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => typeof q === 'string')) {
            fetchedOpenAIQuestions = parsedQuestions.map(q_text => ({ text: q_text }));
          } else {
            throw new Error('OpenAI returned data in an unexpected format (not an array of strings).');
          }
        } catch (parseError) {
          console.error('Failed to parse questions from OpenAI JSON response:', parseError, 'Content:', content);
          throw new Error('Failed to parse questions from OpenAI. Ensure AI returns a valid JSON array of strings.');
        }
      } else {
        throw new Error('Failed to get questions from OpenAI: No choices returned.');
      }

      let questionsToSet;
      if (!fetchedOpenAIQuestions || fetchedOpenAIQuestions.length === 0) {
        console.warn('OpenAI returned no valid questions. Falling back to default questions.');
        questionsToSet = defaultQuestions;
      } else {
        questionsToSet = fetchedOpenAIQuestions;
      }
      
      // Step 4: Create session in Supabase with user info AND questions
      console.log('Attempting to create session in Supabase with user info and generated questions...');
      const sessionCreateResponse = await sessionAPI.createSession(submittedUserInfo, questionsToSet);

      if (sessionCreateResponse.error || !sessionCreateResponse.session || !sessionCreateResponse.session.id) {
        console.error('Error creating final session in Supabase:', sessionCreateResponse.error);
        throw new Error(sessionCreateResponse.error?.message || 'Failed to create the assessment session in Supabase.');
      }
      
      newSessionId = sessionCreateResponse.session.id;
      setSessionId(newSessionId); // Set the session ID from the successful creation
      console.log('Session created successfully in Supabase with ID:', newSessionId);
      
      setQuestions(questionsToSet);
      setUserInfo(submittedUserInfo);
      setAnswers({}); 
      setCurrentQuestionIndex(0);
      setTimeElapsed(0); 
      setIsTimerRunning(true);
      setAssessmentStarted(true);
      setAssessmentCompleted(false);

    } catch (err) {
      console.error('Error during assessment start process:', err);
      setError(err.message || 'An unexpected error occurred while starting the assessment.');
      setIsDemoMode(true);
      const demoSessionId = `demo-session-${Date.now()}`;
      setQuestions(demoQuestions);
      setSessionId(demoSessionId); // Set a demo session ID
      setUserInfo(submittedUserInfo);
      setAssessmentStarted(true);
      setIsTimerRunning(true);
      setAssessmentCompleted(false);
      if (!openAIKey) {
        setError((prevError) => prevError ? `${prevError} OpenAI API key missing.` : 'OpenAI API key is missing. Running in demo mode.');
      } else if (!documentContext || documentContext.includes('Error loading knowledge base')) {
        setError((prevError) => prevError ? `${prevError} Document context missing.` : 'Knowledge base documents could not be loaded. Questions may be less contextual.');
      }
    } finally {
      setIsLoadingAssessment(false);
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionText, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionText]: answer,
    }));
  };

  const handleAssessmentCompletion = async () => {
    setIsTimerRunning(false);
    setAssessmentCompleted(true);
    setIsLoadingAssessment(true); // Show loading for report generation
    try {
      if (sessionId && !isDemoMode) {
        // Save final answers to Supabase
        await sessionAPI.saveAnswer(sessionId, answers);
        console.log('Assessment answers submitted for session:', sessionId);
        
        // Also mark the session as completed
        await sessionAPI.completeSession(sessionId, timeElapsed);
        console.log('Session marked as completed with time:', timeElapsed);
        
        // Optionally trigger report generation or navigate to a summary page
      } else if (isDemoMode) {
        console.log('Demo assessment completed. Answers:', answers);
      }
      
      // Clear the saved session from localStorage once submitted
      localStorage.removeItem('assessmentSession');
      console.log('Assessment session cleared from localStorage');
      
    } catch (err) {
      console.error('Error submitting final answers:', err);
      setError('Failed to submit final answers. Please try again.');
    } finally {
      setIsLoadingAssessment(false); 
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setAssessmentStarted(false);
    setAssessmentCompleted(false);
    setIsLoadingAssessment(false);
    setSessionId(null);
    setUserInfo({ name: '', email: '', team: '' });
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsDemoMode(false);
    setIsTimerRunning(false);
    setTimeElapsed(0);
  };

  // Display loading indicator
  if (isLoadingAssessment) {
    return <AssessmentLoading />;
  }

  // Display error message if any
  if (error && !assessmentStarted) { // Show full page error if setup failed
    let displayError = error;
    if (error.includes('OpenAI API key is missing')) {
        displayError = "Configuration Error: The OpenAI API key is missing. Please contact support. Assessment may run in demo mode.";
    } else if (error.includes('Document context missing')) {
        displayError = "Configuration Error: Knowledge base documents could not be loaded. Questions may be less contextual. Please contact support.";
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-semibold text-richRed mb-4">An Error Occurred</h2>
        <p className="text-charcoalGray mb-6">{displayError}</p>
        <button 
          onClick={handleTryAgain} 
          className="px-6 py-2 rounded-lg bg-forestGreen text-white font-bold shadow-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forestGreen focus:ring-opacity-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Assessment summary after completion
  if (assessmentCompleted) {
    return (
      <div className="h-screen bg-offWhite p-4 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-y-auto border-t-4 border-richRed">
            <h1 className="text-2xl font-bold text-forestGreen mb-1 text-center">Assessment Completed!</h1>
            <p className="text-charcoalGray mb-3 text-center">Thank you, {userInfo.name}, for completing the assessment.</p>
            
            {isDemoMode && (
              <div className="bg-gray-100 p-3 rounded-lg mb-3 text-center">
                <p className='text-sm text-gray-600'>
                  (Demo Mode)
                  {error && error.includes('OpenAI API key is missing') && " - OpenAI features disabled."}
                  {error && error.includes('Document context missing') && " - Knowledge base features limited."}
                </p>
              </div>
            )}
            
            <div className="mb-3">
              <h2 className="text-lg font-serif text-darkEarth mb-2 pb-1 border-b border-softGray">Your Response Summary</h2>
              
              {questions.map((question, index) => (
                <div key={index} className="mb-3 p-3 bg-offWhite rounded-lg">
                  <div className="flex items-start mb-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-forestGreen text-white rounded-full flex items-center justify-center mr-2 font-bold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="text-darkEarth font-medium text-sm">{question.text}</h3>
                  </div>
                  
                  <div className="ml-8 bg-white p-2 rounded border border-softGray">
                    <p className="text-charcoalGray whitespace-pre-wrap text-sm max-h-24 overflow-y-auto">
                      {answers[question.text] || <span className="italic text-gray-400">No answer provided</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleTryAgain} 
                className="px-6 py-3 rounded-lg bg-forestGreen text-white font-bold shadow-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forestGreen focus:ring-opacity-50"
              >
                Start New Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User info form if assessment hasn't started
  if (!assessmentStarted) {
    return (
      <UserInfoForm 
        onSubmit={handleStartAssessment} 
        isSubmitting={isSubmitting}
      />
    );
  }

  // Main assessment interface
  return (
    <div className="flex flex-col md:flex-row h-screen bg-offWhite overflow-hidden">
      <QuestionNavigation 
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={setCurrentQuestionIndex}
        onComplete={handleAssessmentCompletion} 
        isCompleted={assessmentCompleted}
      />
      <main className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-richRed text-white p-3 rounded-md mb-4 text-sm">
            <p><strong>Error:</strong> {error}</p>
            {/* Optionally add a dismiss button for non-critical errors */}
          </div>
        )}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-forestGreen">Assessment Questions</h1>
          <Timer timeElapsed={timeElapsed} />
        </div>
        {questions.length > 0 ? (
          <QuestionCard 
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={answers[questions[currentQuestionIndex]?.text] || ''}
            onAnswerChange={handleAnswerChange}
            onNext={handleNextQuestion}
            onPrev={handlePrevQuestion}
            isFirstQuestion={currentQuestionIndex === 0}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onSubmit={handleAssessmentCompletion}
          />
        ) : (
          <p>No questions available for the assessment. This could be due to an issue with question generation.</p>
        )}
      </main>
    </div>
  );
};

export default AssessmentPage;