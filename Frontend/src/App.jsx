import React from "react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from "./components/common/ErrorBoundary";
import FloatingContactWidget from "./components/FloatingContactWidget";

function App() {
  return (
    <ErrorBoundary>
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

        <div className="flex-grow w-full h-full">
          <AppRoutes />
        </div>

        <FloatingContactWidget />
      </div>
    </ErrorBoundary>
  );
}

export default App;