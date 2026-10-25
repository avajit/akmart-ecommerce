import React from "react";
import Title from "./Title";

const PaymentMethod = ({ method, setMethod }) => {
  return (
    <div className="mt-12">
      <Title text1="PAYMENT" text2="METHOD" />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

        {[
          { id: "stripe", label: "Stripe" },
          { id: "razorpay", label: "Razorpay" },
          { id: "cod", label: "Cash On Delivery" },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => setMethod(item.id)}
            className={`
              flex items-center gap-3 p-4 px-6 border rounded-lg cursor-pointer transition-all duration-300
              ${
                method === item.id
                  ? "border-orange-500 bg-orange-500/10 text-white"
                  : "border-gray-700 bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-gray-200"
              }
            `}
          >
            {/* Custom Orange Radio Button */}
            <div
              className={`
                w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                ${method === item.id ? "border-orange-500" : "border-gray-500"}
              `}
            >
              {method === item.id && (
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              )}
            </div>

            {/* Just the Name - Clean & Bold */}
            <p className="font-semibold text-sm uppercase tracking-wide">
              {item.label}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default PaymentMethod;