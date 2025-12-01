import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroDataJson from "../../hero.json";

const Hero = () => {
  const [heroData] = useState(heroDataJson.hero);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroData.length);
    }, 2500); // 3.5s is the sweet spot
    return () => clearInterval(interval);
  }, [heroData.length]);

  const { title, desc, image, link } = heroData[index];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black text-white flex items-center justify-center font-poppins">
      
      {/* ================= GLOBAL STYLES (GOOGLE FONTS) ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Poppins:wght@300;400;600&display=swap');
        
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-oswald { font-family: 'Oswald', sans-serif; }
        
        /* Floating Animation for the Shoe/Model */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Fade Up Animation for Text */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* ================= BACKGROUND SPOTLIGHT ================= */}
      {/* This creates a rich dark grey gradient instead of flat black */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-80" />

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-[1200px] px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-12">
        
        {/* LEFT: TEXT CONTENT */}
        <div key={index} className="w-full md:w-1/2 flex flex-col items-start gap-5 animate-fade-up">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-yellow-400"></div>
            <span className="text-yellow-400 text-sm font-semibold tracking-[0.2em] uppercase">
              Trending Now
            </span>
          </div>

          <h1 className="font-oswald text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-white uppercase tracking-wide">
            {title}
          </h1>

          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-md">
            {desc}
          </p>

          <Link to='/collection'>
  <button className="mt-6 group relative px-8 py-3 bg-white text-black font-bold text-lg overflow-hidden rounded-none transition-all hover:scale-105">
    <span className="relative z-10 group-hover:text-white transition-colors duration-300">
      SHOP COLLECTION
    </span>
    <div className="absolute inset-0 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
  </button>
</Link>
        </div>

        {/* RIGHT: IMAGE CONTENT */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative">
          
          {/* Glowing Circle Behind Image */}
          <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-yellow-500/10 rounded-full blur-[100px]" />

          <div className="relative w-full h-[400px] md:h-[600px] flex justify-center items-center">
            <img
              key={index}
              src={image}
              alt={title}
              className="w-full h-full object-contain animate-float drop-shadow-2xl"
            />
          </div>
        </div>

      </div>

      {/* ================= BOTTOM PROGRESS BAR ================= */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {heroData.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1 transition-all duration-500 ${index === idx ? "w-12 bg-yellow-400" : "w-4 bg-gray-700"}`} 
          />
        ))}
      </div>

    </section>
  );
};

export default Hero;