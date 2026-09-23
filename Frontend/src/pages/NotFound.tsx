import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-[120px] font-black text-gray-800 leading-none">404</h1>
      <h2 className="text-2xl font-bold text-white mt-2">Page Not Found</h2>
      <p className="text-gray-400 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-full hover:bg-emerald-400 transition-colors">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
