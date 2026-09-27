import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, openGeneralWhatsApp } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div id="floating-whatsapp-container" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Friendly Chat Tooltip Popover */}
      {showTooltip && (
        <div className="mb-3 max-w-[240px] bg-white border border-stone-200 p-3 rounded-xl shadow-xl text-xs text-stone-800 relative animate-bounce-slow">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -left-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full p-0.5"
            aria-label="Close message"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-semibold text-stone-900 mb-0.5">Need styling or size advice?</p>
          <p className="text-[11px] text-stone-600">
            Chat directly with our Fashinery stylists on WhatsApp: +91 {settings.phone}
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="btn-floating-whatsapp"
        onClick={openGeneralWhatsApp}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-110 cursor-pointer"
        aria-label="Chat with Fashinery on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <MessageCircle className="w-7 h-7 fill-white" />
      </button>
    </div>
  );
};
