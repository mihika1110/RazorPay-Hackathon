import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const StreamContext = createContext({
  isStreaming: true,
  isToggling: false,
  toggleStream: () => {},
  fetchStatus: () => {},
});

export function StreamProvider({ children }) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stream/status`);
      if (res.data && typeof res.data.is_streaming === 'boolean') {
        setIsStreaming(res.data.is_streaming);
      }
    } catch (err) {
      console.error('Failed to fetch stream status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleStream = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const res = await axios.post(`${API_BASE}/stream/toggle`);
      if (res.data && typeof res.data.is_streaming === 'boolean') {
        setIsStreaming(res.data.is_streaming);
      }
    } catch (err) {
      console.error('Failed to toggle stream:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <StreamContext.Provider value={{ isStreaming, isToggling, toggleStream, fetchStatus }}>
      {children}
    </StreamContext.Provider>
  );
}

export const useStream = () => useContext(StreamContext);
