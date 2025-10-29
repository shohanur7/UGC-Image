
import React, { useRef } from 'react';

// Define the Icon components right here to avoid extra files for simple SVGs
const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

interface ImageUploaderProps {
  title: string;
  description: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onImageSelect, onImageRemove, previewUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onImageRemove();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center h-full">
      <h3 className="text-xl font-bold text-indigo-300">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      
      {previewUrl ? (
        <div className="w-full aspect-square rounded-lg relative overflow-hidden group">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleRemoveClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <XCircleIcon className="w-6 h-6"/>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border-indigo-500 transition-colors"
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <PhotoIcon className="w-12 h-12 text-gray-500 mb-2"/>
          <p className="text-gray-400">Click to upload</p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
