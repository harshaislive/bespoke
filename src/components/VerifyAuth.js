import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AssessmentLoading from './AssessmentLoading';

const VerifyAuth = () => {
  const [message, setMessage] = useState('Verifying your login...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashChange = async () => {
      // Check if we have a hash in the URL (from magic link)
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        try {
          setMessage('Completing login...');
          
          // The hash contains auth params - Supabase will handle this automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            setMessage('Login successful! Redirecting...');
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
          }
        } catch (err) {
          console.error('Error handling auth callback:', err);
          setMessage('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        }
      } else {
        // No hash, redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleHashChange();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-beige">
      <AssessmentLoading message={message} />
    </div>
  );
};

export default VerifyAuth;
