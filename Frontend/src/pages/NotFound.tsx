import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHome } from 'react-icons/fi';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 font-poppins text-white">
      <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 text-3xl font-black">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Page Not Found</h1>
      <p className="text-gray-400 mt-2 mb-8 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        The destination you are looking for doesn&apos;t exist, has been removed, or the link may be broken.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
        >
          <FiHome /> Back to Home
        </Link>
        <Link 
          to="/collection" 
          className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-gray-800 text-gray-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition text-xs uppercase tracking-wider"
        >
          Browse Catalog <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
