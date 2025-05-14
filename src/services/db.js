/**
 * Database services for Beforest Bespoke Engine
 * Provides a clean API for accessing database functionality
 */
import db from '../utils/db';

// User-related database operations
export const userService = {
  /**
   * Create a new user
   * @param {Object} userData - User information { name, email, team, role }
   * @returns {Promise<Object>} Created user or error
   */
  async createUser(userData) {
    try {
      if (db.createUser) {
        // Using mock DB
        return await db.createUser(userData);
      }
      
      // Using Knex
      const [user] = await db('users')
        .insert({
          name: userData.name,
          email: userData.email,
          team: userData.team,
          role: userData.role || 'employee'
        })
        .returning('*');
      
      return { data: user, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data or error
   */
  async getUserById(id) {
    try {
      if (db.getUser) {
        // Using mock DB
        return await db.getUser(id);
      }
      
      // Using Knex
      const user = await db('users').where({ id }).first();
      return { data: user || null, error: null };
    } catch (error) {
      console.error('Error getting user:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data or error
   */
  async getUserByEmail(email) {
    try {
      if (db.getUser) {
        // Using mock DB - need to implement this search in mock
        const user = db.users.find(u => u.email === email);
        return { data: user || null, error: null };
      }
      
      // Using Knex
      const user = await db('users').where({ email }).first();
      return { data: user || null, error: null };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { data: null, error: { message: error.message } };
    }
  }
};

// Session-related database operations
export const sessionService = {
  /**
   * Create a new assessment session
   * @param {Object} sessionData - Session data { user_id, questions }
   * @returns {Promise<Object>} Created session or error
   */
  async createSession(sessionData) {
    try {
      if (db.createSession) {
        // Using mock DB
        return await db.createSession(sessionData);
      }
      
      // Using Knex
      const [session] = await db('sessions')
        .insert({
          user_id: sessionData.user_id,
          questions: JSON.stringify(sessionData.questions),
          answers: JSON.stringify(sessionData.answers || []),
          start_time: new Date(),
          status: 'in_progress'
        })
        .returning('*');
      
      return { data: session, error: null };
    } catch (error) {
      console.error('Error creating session:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Update an existing session
   * @param {string} id - Session ID
   * @param {Object} updates - Updates to apply { answers, status, end_time, total_time }
   * @returns {Promise<Object>} Updated session or error
   */
  async updateSession(id, updates) {
    try {
      if (db.updateSession) {
        // Using mock DB
        return await db.updateSession(id, updates);
      }
      
      // Format updates for database
      const dbUpdates = { ...updates };
      if (updates.answers) {
        dbUpdates.answers = JSON.stringify(updates.answers);
      }
      
      // Using Knex
      const [session] = await db('sessions')
        .where({ id })
        .update(dbUpdates)
        .returning('*');
      
      return { data: session, error: null };
    } catch (error) {
      console.error('Error updating session:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Get session by ID
   * @param {string} id - Session ID
   * @returns {Promise<Object>} Session data or error
   */
  async getSessionById(id) {
    try {
      if (db.getSession) {
        // Using mock DB
        return await db.getSession(id);
      }
      
      // Using Knex
      const session = await db('sessions').where({ id }).first();
      
      // Parse JSON fields
      if (session) {
        session.questions = JSON.parse(session.questions);
        session.answers = JSON.parse(session.answers);
      }
      
      return { data: session || null, error: null };
    } catch (error) {
      console.error('Error getting session:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Sessions data or error
   */
  async getUserSessions(userId) {
    try {
      if (db.getSession) {
        // Using mock DB
        const sessions = db.sessions.filter(s => s.user_id === userId);
        return { data: sessions, error: null };
      }
      
      // Using Knex
      const sessions = await db('sessions').where({ user_id: userId });
      
      // Parse JSON fields
      sessions.forEach(session => {
        session.questions = JSON.parse(session.questions);
        session.answers = JSON.parse(session.answers);
      });
      
      return { data: sessions, error: null };
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return { data: null, error: { message: error.message } };
    }
  }
};

// Feedback-related database operations
export const feedbackService = {
  /**
   * Add feedback to a session
   * @param {Object} feedbackData - Feedback data { session_id, feedback, feedback_by }
   * @returns {Promise<Object>} Created feedback or error
   */
  async addFeedback(feedbackData) {
    try {
      if (db.createSession) {
        // Using mock DB - need to implement feedback in mock
        const feedback = { 
          id: `local-${Date.now()}`,
          ...feedbackData,
          feedback_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        db.feedback.push(feedback);
        return { data: feedback, error: null };
      }
      
      // Using Knex
      const [feedback] = await db('feedback')
        .insert({
          session_id: feedbackData.session_id,
          feedback: feedbackData.feedback,
          feedback_by: feedbackData.feedback_by
        })
        .returning('*');
      
      return { data: feedback, error: null };
    } catch (error) {
      console.error('Error adding feedback:', error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  /**
   * Get feedback for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Feedback data or error
   */
  async getSessionFeedback(sessionId) {
    try {
      if (db.createSession) {
        // Using mock DB
        const feedback = db.feedback.filter(f => f.session_id === sessionId);
        return { data: feedback, error: null };
      }
      
      // Using Knex
      const feedback = await db('feedback')
        .where({ session_id: sessionId })
        .join('users', 'feedback.feedback_by', '=', 'users.id')
        .select(
          'feedback.*', 
          'users.name as feedback_by_name', 
          'users.email as feedback_by_email'
        );
      
      return { data: feedback, error: null };
    } catch (error) {
      console.error('Error getting session feedback:', error);
      return { data: null, error: { message: error.message } };
    }
  }
}; 