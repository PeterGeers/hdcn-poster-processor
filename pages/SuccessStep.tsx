import React from 'react';
import { EventDetails } from '../types';
import { Button } from '../components/Button';

interface SuccessStepProps {
  data: EventDetails | null;
  imagePreview: string | null;
  onReset: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ data, imagePreview, onReset }) => {
  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Event Successfully Processed!</h2>
        <p className="text-gray-400 mt-2">The poster has been uploaded and the event has been added to your calendar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Event Details */}
        <div className="bg-hdcn-black border border-hdcn-gray rounded-lg p-6">
          <h3 className="font-medium text-white mb-4">Event Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Title:</span>
              <span className="text-white ml-2">{data.title}</span>
            </div>
            <div>
              <span className="text-gray-400">Calendar:</span>
              <span className="text-white ml-2">{data.calendar}</span>
            </div>
            <div>
              <span className="text-gray-400">Date:</span>
              <span className="text-white ml-2">
                {new Date(data.startDate).toLocaleDateString('nl-NL')} at {new Date(data.startDate).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>
              <span className="text-white ml-2">{data.location}</span>
            </div>
          </div>
        </div>

        {/* Poster Preview */}
        {imagePreview && (
          <div className="bg-hdcn-black border border-hdcn-gray rounded-lg p-6">
            <h3 className="font-medium text-white mb-4">Processed Poster</h3>
            <div className="rounded overflow-hidden border border-gray-700">
              <img src={imagePreview} alt="Processed Poster" className="w-full h-auto object-contain max-h-64" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-8 flex gap-3 items-start">
        <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
            <h4 className="font-bold text-green-400 text-sm">Processing Complete</h4>
            <ul className="text-green-200 text-sm mt-1 space-y-1">
              <li>✓ Poster uploaded to Google Drive</li>
              <li>✓ Event added to {data.calendar} calendar</li>
              <li>✓ Image archived in Google Photos</li>
            </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={onReset}>Process Another Poster</Button>
      </div>
    </div>
  );
};