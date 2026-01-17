
import React, { useState, useEffect } from 'react';
import { LoadingStep } from '../types';

interface LoadingOverlayProps {
  step: LoadingStep;
}

const messages = [
  "Analyzing features across generations...",
  "Synthesizing memories...",
  "Bridging the gap between then and now...",
  "Harmonizing lighting and textures...",
  "Crafting a seamless reunion...",
  "Almost there, adding final touches..."
];

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ step }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (step === LoadingStep.IDLE) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-wand-sparkles text-2xl text-indigo-600 animate-pulse"></i>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {step === LoadingStep.APPLYING_EDITS ? "Applying Your Request" : "Reuniting Your Selves"}
      </h3>
      
      <p className="text-slate-500 max-w-xs animate-fade-in-out">
        {messages[msgIndex]}
      </p>

      <div className="mt-8 flex gap-2">
        <div className={`w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-0`}></div>
        <div className={`w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-150`}></div>
        <div className={`w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-300`}></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
