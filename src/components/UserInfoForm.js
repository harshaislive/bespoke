import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserInfoForm = ({ onSubmit }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    team: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Update email if user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.team.trim()) {
      newErrors.team = 'Team is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-forestGreen">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forestGreen text-white text-sm font-semibold">1</span>
          <div className="h-1 w-12 bg-softGray mx-2"></div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-softGray text-charcoalGray text-sm">2</span>
          <div className="h-1 w-12 bg-softGray mx-2"></div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-softGray text-charcoalGray text-sm">3</span>
        </div>
        
        <h2 className="text-lg text-center font-serif text-darkEarth mb-2">Value Match Assessment</h2>
        <p className="text-center text-charcoalGray mb-6">Complete this form to begin your assessment</p>
        
        {user && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-charcoalGray">Logged in as: <span className="font-semibold">{user.email}</span></p>
          </div>
        )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-darkEarth font-serif mb-2 flex items-center">
            Name 
            <span className="text-richRed ml-1">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-richRed' : 'border-softGray'} focus:border-forestGreen focus:ring-1 focus:ring-forestGreen focus:outline-none transition-colors`}
            placeholder="Your full name"
          />
          {errors.name && <p className="text-richRed mt-1 text-sm">{errors.name}</p>}
        </div>
        
        {/* Email field - hide it completely if we have a logged in user */}
        {!user ? (
          <div>
            <label htmlFor="email" className="block text-darkEarth font-serif mb-2 flex items-center">
              Email 
              <span className="text-richRed ml-1">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-richRed' : 'border-softGray'} focus:border-forestGreen focus:ring-1 focus:ring-forestGreen focus:outline-none transition-colors`}
              placeholder="your.name@company.com"
            />
            {errors.email && <p className="text-richRed mt-1 text-sm">{errors.email}</p>}
          </div>
        ) : null}
        
        <div>
          <label htmlFor="team" className="block text-darkEarth font-serif mb-2 flex items-center">
            Team
            <span className="text-richRed ml-1">*</span>
          </label>
          <input
            type="text"
            id="team"
            name="team"
            value={formData.team}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.team ? 'border-richRed' : 'border-softGray'} focus:border-forestGreen focus:ring-1 focus:ring-forestGreen focus:outline-none transition-colors`}
            placeholder="Your department or team name"
          />
          {errors.team && <p className="text-richRed mt-1 text-sm">{errors.team}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full mt-8 bg-forestGreen hover:bg-[#1b4d3e] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-forestGreen flex items-center justify-center"
        >
          Start Assessment
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
        
        <p className="text-xs text-center text-charcoalGray mt-4">
          This assessment takes approximately 10-15 minutes to complete.
        </p>
      </form>
      </div>
    </div>
  );
};

export default UserInfoForm; 