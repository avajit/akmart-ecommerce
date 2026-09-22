import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';

// Checkout is part of Module 3 (Orders & Payments). 
// For now, redirect users to Place Order.
const Checkout = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <FiPackage className="text-emerald-500 text-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Checkout</h2>
      <p className="text-gray-400 mb-6">Complete your purchase below.</p>
      <Link to="/place-order" className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-full hover:bg-emerald-400 transition-colors">
        Proceed to Place Order
      </Link>
    </div>
  );
};

export default Checkout;
