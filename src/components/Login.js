import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithMagicLink, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const { success } = await signInWithMagicLink(email, `${window.location.origin}/verify`);
      
      if (success) {
        setMessage('Magic link sent! Check your email.');
        setEmail('');
      }
    } catch (err) {
      console.error('Error in login component:', err);
      setMessage('Failed to send login link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border-t-4 border-forestGreen">
        <h2 className="text-3xl font-serif text-forestGreen mb-6 text-center">Beforest Assessment</h2>
        <p className="text-center text-charcoalGray mb-8">Sign in to start or continue your assessment</p>
        
        {message && (
          <div className={`p-4 mb-6 rounded-md ${message.includes('Check your email') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-darkEarth font-serif mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="yourname@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-softGray focus:border-forestGreen focus:ring-1 focus:ring-forestGreen focus:outline-none transition-colors"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-forestGreen hover:bg-[#1b4d3e] text-white font-bold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forestGreen disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending Link...' : 'Send Magic Link'}
          </button>
        </form>
        
        <p className="text-xs text-center text-charcoalGray mt-8">
          We'll send a secure login link to your email. No password needed!
        </p>
      </div>
    </div>
  );
};

export default Login;
