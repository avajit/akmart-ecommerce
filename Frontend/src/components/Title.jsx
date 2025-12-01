import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-2 items-center mb-3">
      {/* Left decorative line */}
      <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-500"></p>
      
      {/* Main Text */}
      <h2 className="text-2xl sm:text-3xl font-medium text-gray-200 uppercase tracking-wider">
        {text1} <span className="text-amber-500 font-bold">{text2}</span>
      </h2>
      
      {/* Right decorative line */}
      <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-500"></p>
    </div>
  );
};

export default Title;