import React, { useRef } from 'react';
import { Button } from '../components/Button';

interface UploadStepProps {
  onFileSelect: (file: File) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Upload Event Poster
        </h2>
        <p className="mt-4 text-xl text-gray-400">
          Upload a flyer to automatically extract event details, check for duplicates, and schedule in the HDCN calendar.
        </p>
      </div>

      <div
        className="mt-10 w-full max-w-2xl flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-xl hover:border-hdcn-orange hover:bg-hdcn-gray/20 transition-all cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-2 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-300">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-transparent rounded-md font-medium text-hdcn-orange hover:text-orange-400 focus-within:outline-none"
            >
              <span>Upload a file</span>
            </label>
            <span className="pl-1">or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleInputChange}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 w-full max-w-2xl">
         <div className="bg-hdcn-black p-4 rounded-lg border border-hdcn-gray flex items-center gap-3">
           <div className="bg-blue-500/10 p-2 rounded text-blue-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           </div>
           <div>
             <p className="font-medium text-white">AI Extraction</p>
             <p className="text-sm text-gray-400">Auto-detects date & title</p>
           </div>
         </div>
         <div className="bg-hdcn-black p-4 rounded-lg border border-hdcn-gray flex items-center gap-3">
           <div className="bg-green-500/10 p-2 rounded text-green-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <div>
             <p className="font-medium text-white">Auto Schedule</p>
             <p className="text-sm text-gray-400">Syncs with Google Calendar</p>
           </div>
         </div>
      </div>
    </div>
  );
};