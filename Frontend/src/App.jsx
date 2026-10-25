import React from "react";
import Navbar from "./components/NavBar";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import SearchOverlay from "./components/SearchOverlay";
import CartDrawer from "./components/CartDrawer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="w-full min-h-screen bg-black text-gray-200 flex flex-col">
      
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      <SearchOverlay />
      <CartDrawer />

      <div className="flex-grow w-full h-full ">
        <AppRoutes />
      </div>

    </div>
  );
}

export default App;