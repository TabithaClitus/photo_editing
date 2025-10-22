
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface UploadPlaceholderProps {
  onImageUpload: (file: File) => void;
}

const UploadPlaceholder: React.FC<UploadPlaceholderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        onImageUpload(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`w-full max-w-2xl h-96 flex flex-col items-center justify-center border-4 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary/70 hover:bg-gray-50 dark:hover:bg-dark-surface/50'
      }`}
    >
      <UploadIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Drag & Drop Your Image</h3>
      <p className="text-gray-500 dark:text-gray-400">or</p>
      <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover transition-colors">
        Browse Files
      </button>
    </div>
  );
};

export default UploadPlaceholder;
