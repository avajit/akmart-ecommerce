import React, { useEffect } from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';

export interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'Sign Out',
  description = 'Are you sure you want to sign out? You can sign back in anytime to access your cart and orders.',
  confirmText = 'Sign Out',
  cancelText = 'Cancel',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-[#141414] border border-gray-800 rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center space-y-4 font-sans">
        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* AkMart Themed Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
          <FiLogOut className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 id="signout-modal-title" className="text-base font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Actions matching AkMart design system */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] active:bg-[#181818] border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition active:scale-95 disabled:opacity-50 min-h-[42px] cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="confirm-signout-btn"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold transition active:scale-95 shadow-sm shadow-orange-500/20 disabled:opacity-50 min-h-[42px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5 shrink-0" />
            <span>{isLoading ? 'Signing out...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;

