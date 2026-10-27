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
    <section className="relative w-full min-h-[440px] md:min-h-[540px] lg:h-[78vh] max-h-[700px] py-4 sm:py-8 lg:py-0 overflow-hidden bg-black text-white flex items-center justify-center font-poppins">
      
      {/* ================= GLOBAL STYLES (GOOGLE FONTS) ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Poppins:wght@300;400;600&display=swap');
        
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-oswald { font-family: 'Oswald', sans-serif; }
        
        /* Floating Animation for the Shoe/Model */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Fade Up Animation for Text */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* ================= BACKGROUND SPOTLIGHT ================= */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/60 via-black to-black opacity-90" />

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-12">
        
        {/* LEFT: TEXT CONTENT */}
        <div key={index} className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left gap-2 sm:gap-4 animate-fade-up">
          
          <div className="flex items-center gap-2">
            <div className="w-6 sm:w-8 h-[2px] bg-orange-500"></div>
            <span className="text-orange-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              Trending Now
            </span>
          </div>

          <h1 className="font-oswald text-2xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold leading-[0.95] text-white uppercase tracking-wide">
            {title}
          </h1>

          <p className="text-gray-400 text-xs sm:text-base md:text-lg font-light leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
            {desc}
          </p>

          <Link to={link || '/collection'} className="mt-1 sm:mt-2">
            <button className="group relative px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C2410C]/25 active:scale-95 min-h-[44px]">
              <span>SHOP COLLECTION</span>
            </button>
          </Link>
        </div>

        {/* RIGHT: IMAGE CONTENT */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative">
          
          {/* Glowing Circle Behind Image */}
          <div className="absolute w-[180px] h-[180px] md:w-[450px] md:h-[450px] bg-orange-500/10 rounded-full blur-[60px] md:blur-[80px]" />

          <div className="relative w-full h-[180px] sm:h-[280px] md:h-[500px] flex justify-center items-center">
            <img
              key={index}
              src={image}
              alt={title}
              className="w-full h-full object-contain animate-float drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>

      </div>

      {/* ================= BOTTOM PROGRESS BAR ================= */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroData.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-500 ${index === idx ? "w-10 bg-orange-500 shadow-sm shadow-orange-500/50" : "w-3 bg-gray-700"}`} 
          />
        ))}
      </div>

    </section>
  );
};

export default Hero;