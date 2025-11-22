import React, { useState } from 'react';
import { Layout } from './components/Layout';

import { VerifySetupStep } from './pages/VerifySetupStep';
import { UploadStep } from './pages/UploadStep';
import { ReviewStep } from './pages/ReviewStep';
import { CalendarStep } from './pages/CalendarStep';
import { SuccessStep } from './pages/SuccessStep';
import { EventDetails, ProcessingState, Step } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.VERIFY);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    file: null,
    imagePreviewUrl: null,
    extractedData: null,
    isProcessing: false,
    error: null,
  });

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProcessingState((prev) => ({
        ...prev,
        file,
        imagePreviewUrl: e.target?.result as string,
        error: null
      }));
      setCurrentStep(Step.REVIEW);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractionComplete = (data: EventDetails) => {
    setProcessingState((prev) => ({
      ...prev,
      extractedData: data,
    }));
    setCurrentStep(Step.CALENDAR);
  };

  const handleEventConfirmed = (finalData: EventDetails) => {
    setProcessingState((prev) => ({
      ...prev,
      extractedData: finalData,
    }));
    setCurrentStep(Step.SUCCESS);
  };

  const handleReset = () => {
    setProcessingState({
      file: null,
      imagePreviewUrl: null,
      extractedData: null,
      isProcessing: false,
      error: null,
    });
    setCurrentStep(Step.VERIFY);
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.VERIFY:
        return (
          <div>
            <VerifySetupStep />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => setCurrentStep(Step.UPLOAD)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Continue to Upload →
              </button>
            </div>
          </div>
        );
      case Step.UPLOAD:
        return <UploadStep onFileSelect={handleFileSelect} />;
      case Step.REVIEW:
        return (
          <ReviewStep
            imagePreview={processingState.imagePreviewUrl}
            originalFile={processingState.file}
            onExtractionComplete={handleExtractionComplete}
            onBack={() => setCurrentStep(Step.UPLOAD)}
          />
        );
      case Step.CALENDAR:
        return (
          <CalendarStep
            initialData={processingState.extractedData}
            imagePreview={processingState.imagePreviewUrl}
            originalFile={processingState.file}
            onConfirm={handleEventConfirmed}
            onBack={() => setCurrentStep(Step.REVIEW)}
          />
        );
      case Step.SUCCESS:
        return (
          <SuccessStep
            data={processingState.extractedData}
            imagePreview={processingState.imagePreviewUrl}
            onReset={handleReset}
          />
        );
      default:
        return <UploadStep onFileSelect={handleFileSelect} />;
    }
  };

  return (
    <Layout currentStep={currentStep}>
      {renderStep()}
    </Layout>
  );
};

export default App;