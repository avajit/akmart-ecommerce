import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-3 items-center mb-3">
      {/* Left decorative line */}
      <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent to-orange-500"></span>
      
      {/* Main Text */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
        {text1} <span className="text-orange-500">{text2}</span>
      </h2>
      
      {/* Right decorative line */}
      <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-l from-transparent to-orange-500"></span>
    </div>
  );
};

export default Title;