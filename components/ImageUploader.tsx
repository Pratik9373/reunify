
import React, { useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  preview: string | null;
  onImageSelect: (file: File) => void;
  icon: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, preview, onImageSelect, icon }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
        preview ? 'border-indigo-500' : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50'
      }`}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {preview ? (
        <div className="absolute inset-0 w-full h-full p-2">
          <img 
            src={preview} 
            alt={label} 
            className="w-full h-full object-cover rounded-xl shadow-sm"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-medium">Change Photo</span>
          </div>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className={`${icon} text-indigo-600 text-xl`}></i>
          </div>
          <span className="text-slate-600 font-medium">{label}</span>
          <span className="text-slate-400 text-xs mt-1">Click to upload</span>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
