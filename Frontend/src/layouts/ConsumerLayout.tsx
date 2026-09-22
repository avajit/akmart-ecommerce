import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ConsumerLayout() {
  return (
    <>
      <Navbar />
      <div className="flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pt-24">
        <Outlet />
      </div>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mt-auto">
        <Footer />
      </div>
    </>
  );
}
