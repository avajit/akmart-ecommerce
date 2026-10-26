import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ConsumerLayout() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col font-poppins selection:bg-orange-500 selection:text-white">
      {/* WCAG 2.4.1 Bypass Blocks: Skip to Main Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl ring-2 ring-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow w-full pb-16 md:pb-0 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
