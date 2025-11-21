import React from 'react';
import { Step } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: Step;
}

const steps = [Step.UPLOAD, Step.REVIEW, Step.CALENDAR, Step.SUCCESS];

export const Layout: React.FC<LayoutProps> = ({ children, currentStep }) => {
  return (
    <div className="min-h-screen flex flex-col bg-hdcn-dark text-gray-200">
      <header className="bg-hdcn-black border-b border-hdcn-gray shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-hdcn-orange rounded flex items-center justify-center font-bold text-white">H</div>
            <h1 className="text-xl font-bold tracking-tight text-white">HDCN Poster Processor</h1>
          </div>
          <div className="text-sm text-gray-400">v1.0.0</div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, index) => {
                const isCurrent = step === currentStep;
                const isCompleted = steps.indexOf(currentStep) > index;

                return (
                  <li key={step} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                    <div className="flex items-center">
                      <div
                        className={`${
                          isCompleted || isCurrent ? 'bg-hdcn-orange' : 'bg-hdcn-gray'
                        } h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`ml-3 text-sm font-medium ${isCurrent ? 'text-hdcn-orange' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="absolute top-4 left-0 w-full ml-10 -mr-10 h-0.5 bg-hdcn-gray">
                        <div
                          className="h-0.5 bg-hdcn-orange transition-all duration-500"
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className="bg-hdcn-gray/30 rounded-lg p-6 border border-hdcn-gray min-h-[600px]">
          {children}
        </div>
      </main>

      <footer className="bg-hdcn-black border-t border-hdcn-gray py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} H-DCN. Internal Use Only.
        </div>
      </footer>
    </div>
  );
};