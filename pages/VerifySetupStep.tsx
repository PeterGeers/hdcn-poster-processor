import React, { useState } from 'react';
import { verifyCompleteSetup } from '../services/verificationService';

interface VerificationResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const VerifySetupStep: React.FC = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const verificationResults = await verifyCompleteSetup();
      setResults(verificationResults);
    } catch (error) {
      setResults([{
        service: 'Verification',
        status: 'error',
        message: 'Failed to run verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 Complete System Verification</h2>
      <p>This tool performs a comprehensive check of all system components:</p>
      <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
        <li>Environment variables and configuration</li>
        <li>Google Cloud service account authentication</li>
        <li>Google Drive folder access and permissions</li>
        <li>Google Calendar access and write permissions (all 3 calendars)</li>
        <li>OpenRouter API connectivity and OCR functionality</li>
      </ul>
      
      <button
        onClick={runVerification}
        disabled={isVerifying}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isVerifying ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isVerifying ? 'Verifying...' : 'Run Verification'}
      </button>

      {results.length > 0 && (
        <div>
          <h3>Verification Results:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                border: `2px solid ${getStatusColor(result.status)}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: result.status === 'success' ? '#f0fdf4' : 
                               result.status === 'error' ? '#fef2f2' : '#fffbeb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>
                  {getStatusIcon(result.status)}
                </span>
                <strong>{result.service}</strong>
              </div>
              
              <p style={{ margin: '4px 0', color: '#374151' }}>
                {result.message}
              </p>
              
              {result.details && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  {result.details}
                </p>
              )}
            </div>
          ))}
          
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h4>Status Guide:</h4>
            <ul>
              <li>❌ <strong>Errors:</strong> Critical issues that must be fixed</li>
              <li>⚠️ <strong>Warnings:</strong> Partial functionality, recommended to fix</li>
              <li>✅ <strong>Success:</strong> Component working correctly</li>
            </ul>
            
            <h4>Common Fixes:</h4>
            <ul>
              <li><strong>Drive/Calendar permissions:</strong> Share with service account email: <code>hdcn-poster-processor@gen-lang-client-0081917700.iam.gserviceaccount.com</code></li>
              <li><strong>Missing environment variables:</strong> Check your .env.local file</li>
              <li><strong>API connectivity:</strong> Verify API keys and internet connection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};