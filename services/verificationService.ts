interface VerificationResult {
  service: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const verifyCompleteSetup = async (): Promise<VerificationResult[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/verify-setup`);
    
    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Verification failed');
    }

    return result.results;
  } catch (error) {
    return [{
      service: 'Backend Connection',
      status: 'error',
      message: 'Failed to connect to backend verification service',
      details: error instanceof Error ? error.message : 'Unknown error'
    }];
  }
};