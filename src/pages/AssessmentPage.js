import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import UserInfoForm from '../components/UserInfoForm';
import QuestionNavigation from '../components/QuestionNavigation';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import { sessionAPI } from '../services/supabase';
import AssessmentLoading from '../components/AssessmentLoading';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

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

  const summaryRef = useRef(null);

  // New state for collapsible questions in summary
  const [expandedQuestions, setExpandedQuestions] = useState({});
  
  // New state for tracking validation
  const [incompleteQuestions, setIncompleteQuestions] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  // For swipe navigation
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const mainRef = useRef(null);
  
  // Configure touch threshold for swipe (in pixels)
  const MIN_SWIPE_DISTANCE = 50;

  // Add these derived values
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === (questions.length - 1);

  // Function to toggle question expansion
  const toggleQuestionExpansion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
- IMPORTANT: Format your response as a VALID JSON array of strings. Example format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
- DO NOT include any explanations, notes, or content outside the JSON array.
- DO NOT use nested arrays or objects - just a simple array of strings.
- Use these user generated questions which are asked by realtime users on website using our chatbot as base and strictly only use if they are relevant. If they are relevant pls ensure you give weightage to that question and follow rules mentioned: {{ $json.User_message }}

### Retrieved Knowledge Base Context:
{{DOCUMENT_CONTEXT}}

### Examples of Situation-Based Questions (use these only as a guide for structure, not content if context differs):
- "A retiree prospect who has attended a one-on-one call says, 'I understand the benefits of collective ownership, but I'm worried about the financial commitment for my family in the long term.' How do you address their concern by highlighting Beforest's protection of legacy and safety of diversification in a transparent, fact-based way?"
- "A nature enthusiast prospect who is familiar with Beforest's mission says, 'I'm interested in joining, but what if I don't get along with the other members of the collective?' How do you reassure them about Beforest's inclusive community and one-to-one relationships while maintaining an authentic tone?"

Remember, your output must be a valid JSON array of strings in this exact format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

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
        model: "gpt-4.1",
        messages: [{ role: "system", content: finalSystemPrompt }],
      });

      let fetchedOpenAIQuestions = [];
      if (openAICompletion.choices && openAICompletion.choices.length > 0) {
        const content = openAICompletion.choices[0].message.content;
        try {
          // Try to clean the response if it's not pure JSON
          let jsonContent = content;
          
          // Remove any markdown code block indicators if present
          if (jsonContent.includes('```json')) {
            jsonContent = jsonContent.replace(/```json|```/g, '');
          }
          
          // Trim whitespace
          jsonContent = jsonContent.trim();
          
          // Parse the JSON content
          const parsedQuestions = JSON.parse(jsonContent);
          
          if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => typeof q === 'string')) {
            fetchedOpenAIQuestions = parsedQuestions.map(q_text => ({ text: q_text }));
            console.log('Successfully parsed questions from OpenAI response');
          } else {
            console.error('OpenAI returned data in an unexpected format (not an array of strings):', parsedQuestions);
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

  // Add validation function to check for empty answers
  const validateAnswers = () => {
    if (!questions || questions.length === 0) return true;
    
    const unanswered = questions.filter((question, index) => {
      const answer = answers[question.text];
      return !answer || answer.trim() === '';
    });
    
    setIncompleteQuestions(unanswered);
    return unanswered.length === 0;
  };

  const handleAssessmentCompletion = async () => {
    // Check for empty answers before completing
    if (!validateAnswers()) {
      setShowValidationModal(true);
      return;
    }
    
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

  const handleDownloadPDF = () => {
    const element = summaryRef.current;
    
    const options = {
      margin: 10,
      filename: `assessment_summary_${userInfo.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(element).save();
  };

  // Add event listeners for touch navigation
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].clientX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      if (!assessmentStarted || assessmentCompleted) return;
      
      const swipeDistance = touchEndX.current - touchStartX.current;
      
      if (Math.abs(swipeDistance) < MIN_SWIPE_DISTANCE) return;
      
      if (swipeDistance > 0) {
        // Swiped right - go to previous question
        if (currentQuestionIndex > 0) {
          // Trigger haptic feedback if available
          if (window.navigator.vibrate) {
            window.navigator.vibrate(20);
          }
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
      } else {
        // Swiped left - go to next question
        if (currentQuestionIndex < questions.length - 1) {
          // Trigger haptic feedback if available
          if (window.navigator.vibrate) {
            window.navigator.vibrate(20);
          }
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }
    };
    
    const element = mainRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentQuestionIndex, assessmentStarted, assessmentCompleted, questions.length]);

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
      <div className="min-h-screen bg-offWhite p-3 md:p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div ref={summaryRef} className="bg-white rounded-xl shadow-lg p-3 md:p-4 flex-1 overflow-y-auto border-t-4 border-richRed mb-4">
            <div className="mb-4 pb-4 border-b border-softGray">
              <h2 className="text-xl md:text-2xl font-bold text-forestGreen font-serif mb-2">Assessment Summary</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-softGray px-3 py-1.5 rounded-full text-darkEarth">
                  <span className="font-medium">Name:</span> {userInfo.name}
                </div>
                {userInfo.team && (
                  <div className="bg-softGray px-3 py-1.5 rounded-full text-darkEarth">
                    <span className="font-medium">Team:</span> {userInfo.team}
                  </div>
                )}
                <div className="bg-softGray px-3 py-1.5 rounded-full text-darkEarth">
                  <span className="font-medium">Completed in:</span> {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div 
                  key={index}
                  className="pb-4 border-b border-softGray last:border-b-0"
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleQuestionExpansion(index)}
                  >
                    <div className="flex items-start mb-2">
                      <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 bg-forestGreen text-white rounded-full flex items-center justify-center mr-2 font-medium text-sm">
                        {index + 1}
                      </span>
                      <h3 className="font-serif text-sm md:text-base text-darkEarth font-medium pr-6">
                        {question.text}
                      </h3>
                    </div>
                    <div className="text-charcoalGray transition-transform duration-200">
                      {expandedQuestions[index] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {expandedQuestions[index] && (
                    <div className="ml-8 mr-2 mt-2 bg-softGray bg-opacity-30 p-3 rounded-lg text-sm md:text-base">
                      <p className="whitespace-pre-wrap">
                        {answers[question.text]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="sticky bottom-4 left-0 right-0 flex flex-col md:flex-row gap-2 md:gap-3 justify-center z-10">
            <button
              onClick={handleDownloadPDF}
              className="bg-forestGreen text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center shadow-md hover:bg-opacity-90 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download PDF
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-darkEarth text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center shadow-md hover:bg-opacity-90 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Start New Assessment
            </button>
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
    <div className="flex flex-col h-screen bg-offWhite overflow-hidden">
      <QuestionNavigation 
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={setCurrentQuestionIndex}
        onComplete={handleAssessmentCompletion} 
        isCompleted={assessmentCompleted}
        incompleteQuestions={incompleteQuestions}
      />
      
      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-richRed mb-2">Incomplete Answers</h3>
            <p className="text-sm text-charcoalGray mb-4">
              Please complete all questions before submitting your assessment.
            </p>
            <div className="max-h-40 overflow-y-auto mb-4">
              <ul className="list-disc pl-5 space-y-1">
                {incompleteQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-darkEarth">
                    Question {questions.findIndex(question => question.text === q.text) + 1}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  // Navigate to the first incomplete question
                  if (incompleteQuestions.length > 0) {
                    const firstIncompleteIndex = questions.findIndex(
                      q => q.text === incompleteQuestions[0].text
                    );
                    if (firstIncompleteIndex !== -1) {
                      setCurrentQuestionIndex(firstIncompleteIndex);
                    }
                  }
                }}
                className="px-4 py-2 bg-forestGreen text-white rounded-lg text-sm font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main ref={mainRef} className="flex-1 p-3 md:p-4 overflow-y-auto pb-20 md:pb-4 relative">
        {/* Swipe indicators - moved inside main to fix positioning */}
        {assessmentStarted && !assessmentCompleted && (
          <>
            {!isFirstQuestion && (
              <div className="fixed left-2 top-1/2 transform -translate-y-1/2 text-forestGreen opacity-20 md:hidden z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </div>
            )}
            {!isLastQuestion && (
              <div className="fixed right-2 top-1/2 transform -translate-y-1/2 text-forestGreen opacity-20 md:hidden z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            )}
          </>
        )}
      
        {error && (
          <div className="bg-richRed bg-opacity-10 border border-richRed text-richRed p-2 md:p-3 rounded-md mb-3 md:mb-4 text-sm">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h1 className="text-lg md:text-xl font-bold text-forestGreen">Assessment</h1>
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
            isFirstQuestion={isFirstQuestion}
            isLastQuestion={isLastQuestion}
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