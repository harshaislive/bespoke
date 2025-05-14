// Only export the mockDb for frontend use
const mockDb = {
  users: [],
  sessions: [],
  feedback: [],
  
  // Mock session operations
  async createSession(sessionData) {
    const id = `local-${Date.now()}`;
    const session = { 
      id,
      ...sessionData,
      created_at: new Date().toISOString()
    };
    this.sessions.push(session);
    return { data: session, error: null };
  },
  
  async updateSession(id, updates) {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return { data: null, error: { message: 'Session not found' } };
    }
    
    this.sessions[index] = {
      ...this.sessions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return { data: this.sessions[index], error: null };
  },
  
  async getSession(id) {
    const session = this.sessions.find(s => s.id === id);
    return { 
      data: session || null, 
      error: session ? null : { message: 'Session not found' } 
    };
  },
  
  // Mock user operations
  async createUser(userData) {
    const id = `local-${Date.now()}`;
    const user = { 
      id, 
      ...userData,
      created_at: new Date().toISOString()
    };
    this.users.push(user);
    return { data: user, error: null };
  },
  
  async getUser(id) {
    const user = this.users.find(u => u.id === id);
    return { 
      data: user || null, 
      error: user ? null : { message: 'User not found' } 
    };
  }
};

export default mockDb; 