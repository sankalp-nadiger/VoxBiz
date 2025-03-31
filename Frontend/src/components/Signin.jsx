import React from 'react';

const Signin = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main container */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto shadow-lg rounded-lg overflow-hidden">
        {/* Left side - Sign up form */}
        <div className="w-full md:w-1/2 p-8 bg-white flex flex-col justify-start">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="bg-black text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold">Basement</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl font-bold mb-2">Keep your online business organized</h1>
          <p className="text-gray-500 mb-8">Sign up to start your 30 days free trial</p>
          
          {/* Google Sign in Button */}
          <button className="flex items-center justify-center w-full border border-gray-300 rounded-md py-2 px-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4" />
            </svg>
            Sign in with Google
          </button>
          
          <div className="flex items-center justify-center my-4">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          
          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter name"
                defaultValue="Ethan Sullivan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email<span className="text-red-500">*</span></label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="ethan@mail.com"
                defaultValue="ethan@"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password<span className="text-red-500">*</span></label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your password"
              />
            </div>
            
            <button type="submit" className="w-full bg-black text-white py-3 rounded-md font-medium">
              Create Account
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account? <a href="#" className="text-blue-600 font-medium">Login Here</a>
            </p>
          </div>
        </div>
        
        {/* Right side - Dashboard preview */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-300 to-purple-600 p-6 flex flex-col items-center justify-center space-y-8">
          {/* Bar chart */}
          <div className="bg-white bg-opacity-80 rounded-lg p-3 w-full max-w-sm">
            <div className="flex h-32 items-end space-x-2">
              <div className="bg-purple-400 w-8 h-8 rounded-t-md"></div>
              <div className="bg-purple-400 w-8 h-16 rounded-t-md"></div>
              <div className="bg-purple-400 w-8 h-20 rounded-t-md"></div>
              <div className="bg-purple-400 w-8 h-12 rounded-t-md"></div>
              <div className="bg-purple-400 w-8 h-24 rounded-t-md"></div>
              <div className="bg-purple-400 w-8 h-16 rounded-t-md"></div>
              <div className="bg-purple-800 w-8 h-32 rounded-t-md"></div>
            </div>
          </div>
          
          {/* Total sales card */}
          <div className="bg-gray-200 rounded-lg p-4 w-full max-w-sm">
            <div className="text-gray-600 uppercase text-sm font-medium">TOTAL SALES</div>
            <div className="flex items-center mt-1">
              <div className="text-4xl font-bold">$527.8K</div>
              <div className="ml-2 bg-green-100 text-green-800 px-2 py-1 text-xs rounded-md">+32%</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">last month</div>
            <div className="text-xs text-gray-500 mt-2 mb-4">
              This amount of total sales highlights the effectiveness of our recent strategies and content approach.
            </div>
            
            {/* Chart bars */}
            <div className="flex space-x-2 items-end">
              <div className="flex-1 bg-white h-16 rounded"></div>
              <div className="flex-1 bg-yellow-300 h-16 rounded"></div>
              <div className="flex-1 bg-blue-300 h-16 rounded"></div>
            </div>
            <div className="flex text-xs text-gray-500 mt-1 justify-between">
              <div>● Social Media</div>
              <div>● TV & Radio</div>
              <div>● Billboards</div>
            </div>
          </div>
          
          {/* Testimonial card */}
          <div className="bg-white bg-opacity-20 rounded-lg p-4 w-full max-w-sm text-purple-100">
            <div className="text-xl">
              "Basement is surprisingly handy for keeping all my..."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;