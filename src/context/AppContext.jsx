import React, { createContext, useState, useMemo, useEffect } from 'react';
import LoadingModal from '../screens/components/LoadingModal';
import MessageModal from '../screens/components/MessageModal'; // Importar MessageModal
import { initializeApi } from '../api/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text: string, type: 'success' | 'error' }

  // La API ahora usará setMessage para los errores
  useEffect(() => {
    initializeApi(setLoading, (error) => setMessage({ text: error, type: 'error' }));
  }, []);

  const contextValue = useMemo(() => ({
    loading,
    setLoading,
    message,
    setMessage,
  }), [loading, message]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <LoadingModal visible={loading} />
      <MessageModal />
    </AppContext.Provider>
  );
};
