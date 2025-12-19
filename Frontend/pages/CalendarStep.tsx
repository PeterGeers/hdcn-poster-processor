import React, { useState } from 'react';
import { EventDetails, CalendarType } from '../types';
import { Button } from '../components/Button';
import { checkDuplicatePosterBackend, processEventBackend } from '../services/backendService';

interface CalendarStepProps {
  initialData: EventDetails | null;
  imagePreview: string | null;
  originalFile: File | null;
  onConfirm: (data: EventDetails) => void;
  onBack: () => void;
}

export const CalendarStep: React.FC<CalendarStepProps> = ({ initialData, imagePreview, originalFile, onConfirm, onBack }) => {
  const [formData, setFormData] = useState<EventDetails>(initialData || {
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    calendar: CalendarType.NATIONAAL
  });
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    
    // Check for duplicates before confirming
    const result = await checkDuplicatePosterBackend(formData.title);
    
    if (!result.success) {
        setDuplicateWarning(result.message);
        setIsChecking(false);
        // We don't return here, we let the user override if they click "Proceed Anyway" (simulated by them clicking submit again if we implemented that logic, but let's just show warning and allow confirm button changes)
        // For this UI, we'll show a modal or inline error. Let's do inline.
    } else {
        await processEvent();
    }
  };

  const handleForceSubmit = async () => {
    await processEvent();
  };
  
  const processEvent = async () => {
    if (!originalFile) {
      setError('No file available for processing');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      await processEventBackend(originalFile, formData);
      onConfirm(formData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left Column: Image Preview */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="bg-hdcn-black p-4 rounded-lg border border-hdcn-gray sticky top-24">
          <h3 className="text-lg font-medium text-white mb-4">Poster Preview</h3>
          {imagePreview && (
             <div className="rounded overflow-hidden border border-gray-700">
               <img src={imagePreview} alt="Poster" className="w-full h-auto object-contain max-h-[600px]" />
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-2/3">
        <form onSubmit={handleSubmit} className="space-y-6">
            
          {error && (
            <div className="bg-red-900/30 border border-red-600 p-4 rounded-md flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div>
                    <h4 className="font-bold text-red-500">Processing Error</h4>
                    <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
            </div>
          )}
          
          {duplicateWarning && (
            <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded-md flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <div>
                    <h4 className="font-bold text-yellow-500">Duplicate Detected</h4>
                    <p className="text-yellow-200 text-sm mt-1">{duplicateWarning}</p>
                    <button 
                        type="button" 
                        onClick={handleForceSubmit}
                        className="mt-3 text-sm font-medium text-white underline hover:text-yellow-400"
                    >
                        I confirm this is a new version. Proceed anyway.
                    </button>
                </div>
            </div>
          )}

          <div className="bg-hdcn-black p-6 rounded-lg border border-hdcn-gray space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Calendar Selection */}
              <div>
                <label htmlFor="calendar" className="block text-sm font-medium text-gray-400">Target Calendar</label>
                <select
                  id="calendar"
                  name="calendar"
                  value={formData.calendar}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                >
                  {Object.values(CalendarType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400">Event Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-400">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate.substring(0, 16)} // Format for datetime-local
                    onChange={handleChange}
                    className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-400">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate.substring(0, 16)}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location</label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white"
                />
              </div>

              {/* Raw OCR Text */}
              {formData.rawText && (
                <div>
                  <label htmlFor="rawText" className="block text-sm font-medium text-gray-400">Raw OCR Text (All extracted text)</label>
                  <textarea
                    name="rawText"
                    id="rawText"
                    rows={6}
                    value={formData.rawText}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-hdcn-dark border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-hdcn-orange focus:border-hdcn-orange sm:text-sm text-white font-mono text-xs"
                    placeholder="All text extracted from the poster will appear here..."
                  />
                  <p className="mt-1 text-xs text-gray-500">This shows all text found on the poster. You can edit it if needed.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onBack}>Back</Button>
            <Button type="submit" isLoading={isChecking}>Process Event</Button>
          </div>
        </form>
      </div>
    </div>
  );
};