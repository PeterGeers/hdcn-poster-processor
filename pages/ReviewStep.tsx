import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { extractEventDetailsFromBackend } from '../services/backendService';
import { EventDetails } from '../types';

interface ReviewStepProps {
  imagePreview: string | null;
  originalFile: File | null;
  onExtractionComplete: (data: EventDetails) => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ imagePreview, originalFile, onExtractionComplete, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const processImage = async () => {
      if (!originalFile) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await extractEventDetailsFromBackend(originalFile);
        // Short delay to show the animation just a bit longer for UX
        setTimeout(() => {
           onExtractionComplete(data);
        }, 500);
      } catch (err: any) {
        setError(err.message || "Failed to process image");
        setLoading(false);
      }
    };

    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalFile, retryCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 space-y-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-hdcn-gray rounded-full"></div>
          <div className="absolute inset-0 border-4 border-hdcn-orange rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Analyzing Poster...</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Gemini AI is extracting the event title, date, location, and description. This usually takes a few seconds.
          </p>
        </div>
        {imagePreview && (
          <div className="mt-8 w-48 h-auto rounded-lg overflow-hidden border border-hdcn-gray opacity-50">
            <img src={imagePreview} alt="Processing" className="w-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Extraction Failed</h3>
        <p className="text-gray-400 mb-8 text-center max-w-md">{error}</p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>Cancel</Button>
          <Button onClick={() => setRetryCount(c => c + 1)}>Retry</Button>
        </div>
      </div>
    );
  }

  return null; // Should redirect on success immediately
};