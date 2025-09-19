
import React from 'react';
import { WarningIcon } from './icons';

interface ApiWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiWarningModal: React.FC<ApiWarningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-yellow-500/50 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
            <WarningIcon className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">API使用に関する警告</h2>
          <p className="text-gray-400 mb-6">
            このセッションで多くのリクエストを行いました。Danbooru APIは無料ですが、レート制限を避けるため、 APIの使用にはご配慮ください。
          </p>
          <button
            onClick={onClose}
            className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
          >
            理解しました
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation-name: fade-in-scale;
          animation-duration: 0.3s;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
};

export default ApiWarningModal;
