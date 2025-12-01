import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import SearchOverlay from "./components/SearchOverlay";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="w-full min-h-screen bg-black text-gray-200 flex flex-col">
      
      <ScrollToTop />
      <ToastContainer position="bottom-right" theme="dark" />
      <SearchOverlay />

      <Navbar />

      {/* FIX APPLIED BELOW: added 'pt-24' */}
      <div className="flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pt-24">
        <AppRoutes />
      </div>

      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mt-auto">
         <Footer />
      </div>

    </div>
  );
}

export default App;