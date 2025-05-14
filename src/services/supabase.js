import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the missing error handler function
const captureSupabaseError = (error, contextMessage = 'Supabase error') => {
  console.error(contextMessage, error);
  // Ensure a consistent error object structure is returned, mirroring Supabase's typical response
  return { data: null, error: { message: error.message, details: error.details || error.message, hint: error.hint || '', code: error.code || null } };
};

// API for session management
export const sessionAPI = {
  // Creates a new session, now always with user info and questions together
  createSession: async (userDetails, questions) => {
    if (!userDetails) {
      console.error('createSession error: userDetails are required.');
      return { session: null, error: { message: 'User details are required to create a session.'}};
    }
    if (!questions || questions.length === 0) {
      console.warn('createSession warning: No questions provided. Session will be created without questions initially if table constraints allow, or this might be an issue.');
      // Depending on table constraints, you might want to enforce questions are present or handle default/empty state.
      // For now, we proceed, Supabase will error if 'questions' column cannot be null and no default is set.
    }

    try {
      // Extract the specific fields from userDetails object
      const { name, email, team } = userDetails;
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          // Use the individual fields instead of user_info which doesn't exist
          name,
          email,
          team,
          questions: questions || [], // Ensure questions is at least an empty array if not provided
          // other fields like created_at, status can be set by db defaults or here if needed
        }])
        .select()
        .single(); // Assuming we want the created session back and expect one row

      if (error) {
        console.error('Error creating session in Supabase:', error);
        return captureSupabaseError(error, 'createSession');
      }
      console.log('Session created successfully in Supabase:', data);
      return { session: data, error: null };
    } catch (error) {
      console.error('Catch block error in createSession:', error);
      return captureSupabaseError(error, 'createSession catch');
    }
  },

  // Get session by ID
  getSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get questions for a session
  getQuestions: async (sessionId) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('questions')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data.questions;
  },

  // Save an answer to a question
  saveAnswer: async (sessionId, answers) => {
    const { error } = await supabase
      .from('sessions')
      .update({ answers })
      .eq('id', sessionId);
    
    if (error) throw error;
    return true;
  },

  // Complete a session
  completeSession: async (sessionId, totalTime) => {
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'completed', 
        end_time: new Date().toISOString(),
        total_time: totalTime 
      })
      .eq('id', sessionId);
    
    if (error) throw error;
    return true;
  },

  // Subscribe to question updates
  subscribeToQuestions: (sessionId, callback) => {
    return supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new && payload.new.questions) {
            callback(payload.new.questions);
          }
        }
      )
      .subscribe();
  }
};

export default supabase;