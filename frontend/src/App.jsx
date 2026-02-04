import { useState, useEffect } from 'react';
import { apiClient } from './utils/api';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await apiClient.getConnectionStatus();
      if (response.success && response.isConnected) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsConnected(true);
  };

  const handleLogout = () => {
    setIsConnected(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return isConnected ? (
    <MainPage onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
