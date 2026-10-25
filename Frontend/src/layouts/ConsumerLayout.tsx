import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ConsumerLayout() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col font-poppins selection:bg-orange-500 selection:text-white">
      <Navbar />
      <main className="flex-grow w-full pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
