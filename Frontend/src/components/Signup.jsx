import React, { useState } from 'react';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Blue section with illustration */}
        <div className="w-full md:w-1/2 bg-blue-600 p-8 md:p-12 text-white relative">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold mb-4">
            One click to go<br />
            all digital.
          </h1>
          
          {/* Illustration */}
          <div className="mt-8 flex justify-center">
            <div className="relative">
              {/* Hexagon background pattern */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-20 h-20 bg-blue-400 rounded-xl"
                    style={{
                      transform: `rotate(45deg) translate(${Math.random() * 200}px, ${Math.random() * 100}px)`,
                      opacity: 0.6
                    }}
                  />
                ))}
              </div>
              
              {/* Tablet/Dashboard illustration */}
              <div className="relative z-10 flex items-center">
                {/* Person */}
                <div className="absolute left-2 bottom-2 z-20">
                  <div className="w-4 h-20 bg-red-400 rounded-full"></div>
                  <div className="w-8 h-8 bg-blue-900 rounded-full -mt-6 -ml-2"></div>
                </div>
                
                {/* Tablet */}
                <div className="bg-white p-4 rounded-xl shadow-lg transform rotate-12 w-64 h-48">
                  <div className="flex space-x-1 mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <div className="h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="h-8 bg-red-400 w-1/2"></div>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="h-8 bg-gray-100 rounded-lg mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-50"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Plant */}
                <div className="absolute left-0 bottom-0">
                  <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                  <div className="w-1 h-6 bg-blue-400 mx-auto -mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Sign up form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Sign up</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile No"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="text-sm text-gray-600">
              You are agreeing to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Services</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already a member? <a href="/signin" className="text-blue-600 hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;