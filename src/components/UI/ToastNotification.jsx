// src/components/UI/ToastNotification.jsx
import React, { useEffect } from 'react';

const ToastNotification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  //const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50 animate-fade-in`}>
      {/*<span>{icon}</span>*/}
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;