import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import { getCategoryTree } from '../api/consumer.api';
import { FiTruck, FiShield, FiLock, FiArrowRight } from 'react-icons/fi';
import { assets } from '../assets/frontend_assets/assets';

const CATEGORY_IMAGES: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop", // High fashion men editorial
  women: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop", // Haute couture women editorial
  kids: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=800&auto=format&fit=crop", // Kids style
  home: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop", // Luxury interior / home decor
  beauty: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop", // Luxury cosmetics & beauty
  electronics: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop", // High-end tech
  groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop", // Gourmet groceries
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop";

const Home = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategoryTree().then((res: any) => {
      const allCats = res.data || [];
      // Filter out junk/test categories
      const cleanCats = allCats.filter((c: any) => !c.name?.toLowerCase().includes('fasttest') && !c.name?.toLowerCase().includes('test'));
      setCategories(cleanCats);
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0D0D0D] text-white font-poppins min-h-screen">
      
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. SHOP BY CATEGORY (Dynamic Editorial Tiles) */}
      <section className="py-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Curated Discovery</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Shop By Category</h2>
          </div>
          <Link to="/collection" className="mt-4 md:mt-0 text-sm font-semibold text-orange-500 hover:text-orange-400 flex items-center gap-2 group">
            <span>Explore All</span>
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((cat: any) => {
            const img = CATEGORY_IMAGES[cat.slug] || cat.imageUrl || DEFAULT_IMAGE;
            const displayName = cat.name.trim().toLowerCase() === 'home' ? 'Home & Living' : cat.name;

            return (
              <Link 
                key={cat.id} 
                to={`/collection?category=${cat.slug}`}
                className="group relative h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-[#141414] border border-gray-800/80 flex flex-col justify-end p-4 sm:p-5 transition-all duration-300 hover:border-orange-500/50 shadow-xl"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={img} 
                    alt={displayName} 
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{displayName}</h3>
                  {cat.children && cat.children.length > 0 && (
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 truncate hidden sm:block">
                      {cat.children.map((c: any) => c.name).join(' • ')}
                    </p>
                  )}
                  <span className="text-[11px] sm:text-xs text-gray-300 mt-1.5 sm:mt-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity font-medium">
                    Explore <FiArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] border-t border-gray-900">
        <LatestCollection />
      </section>

      {/* 4. OUR POLICY STRIP (Returns, Exchange, Nepal Support) */}
      <section className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] border-t border-gray-900 bg-[#0F0F0F]">
        <OurPolicy />
      </section>

      {/* 5. NEWSLETTER VIP SIGNUP */}
      <section className="border-t border-gray-900">
        <NewsletterBox />
      </section>

    </div>
  );
};

export default Home;
