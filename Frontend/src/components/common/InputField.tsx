import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => {
  return (
    <div className="group">
      <label className="block text-slate-700 text-sm font-semibold mb-1.5 group-focus-within:text-slate-900 transition-colors">
        {label}
      </label>
      <input 
        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm" 
        {...props}
      />
    </div>
  );
};

export default InputField;
