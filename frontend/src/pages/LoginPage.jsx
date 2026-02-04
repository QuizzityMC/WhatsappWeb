import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

function LoginPage({ onLogin }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getQRCode();
      
      if (response.success && response.qr) {
        setQrCode(response.qr);
      } else {
        setError(response.message || 'Failed to get QR code');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
    const interval = setInterval(fetchQRCode, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.getConnectionStatus();
        if (response.success && response.isConnected) {
          onLogin();
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatsApp Web</h1>
          <p className="text-gray-600">Scan the QR code to login</p>
        </div>

        <div className="flex justify-center mb-6">
          {loading && !qrCode ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : qrCode ? (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500 text-center px-4">
                {error || 'Waiting for QR code...'}
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>1. Open WhatsApp on your phone</p>
          <p>2. Tap Menu or Settings and select WhatsApp Web</p>
          <p>3. Point your phone at this screen to scan the code</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          onClick={fetchQRCode}
          disabled={loading}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh QR Code'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
