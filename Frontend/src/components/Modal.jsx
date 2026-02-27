import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
export function Modal({ isOpen, onClose, title, children }) {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="relative w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 rounded-t-xl">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} type="button" className="text-slate-400 bg-transparent hover:bg-slate-100 hover:text-slate-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors">

              <XIcon className="w-5 h-5"/>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto">{children}</div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 md:p-5 border-t border-slate-100 rounded-b-xl">
            <button onClick={onClose} type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">

              Close
            </button>
          </div>
        </div>
      </div>
    </div>);
}
