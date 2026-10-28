import React, { useState } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endAction?: React.ReactNode;
  dark?: boolean;
  preventAutofill?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  error,
  helperText,
  startIcon,
  endAction,
  dark = true,
  preventAutofill = false,
  className = '',
  ...props
}) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  const [isReadOnly, setIsReadOnly] = useState<boolean>(preventAutofill);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      setIsReadOnly(false);
    }
    props.onFocus?.(e);
  };

  return (
    <div className="group w-full text-left">
      <label
        htmlFor={inputId}
        className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors cursor-pointer ${
          dark 
            ? 'text-gray-300 group-focus-within:text-orange-400' 
            : 'text-slate-700 group-focus-within:text-orange-500'
        }`}
      >
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative flex items-center">
        {startIcon && (
          <div className={`absolute left-3.5 pointer-events-none transition-colors ${
            dark 
              ? 'text-gray-500 group-focus-within:text-orange-400' 
              : 'text-slate-400 group-focus-within:text-orange-500'
          }`}>
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          readOnly={isReadOnly}
          onFocus={handleFocus}
          onMouseDown={() => setIsReadOnly(false)}
          onTouchStart={() => setIsReadOnly(false)}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full py-2.5 px-3.5 rounded-xl outline-none transition-all duration-200 text-base sm:text-sm shadow-sm ${
            startIcon ? 'pl-10' : ''
          } ${endAction ? 'pr-10' : ''} ${
            dark
              ? `bg-[#1A1A1A] text-white placeholder-gray-500 border ${
                  error
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                    : 'border-gray-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                }`
              : `bg-slate-50 text-slate-900 placeholder-slate-400 border ${
                  error
                    ? 'border-red-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                    : 'border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                }`
          } ${className}`}
          {...props}
        />

        {endAction && (
          <div className="absolute right-3 flex items-center">
            {endAction}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-200">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>{helperText}</p>
      ) : null}
    </div>
  );
};

export default InputField;
