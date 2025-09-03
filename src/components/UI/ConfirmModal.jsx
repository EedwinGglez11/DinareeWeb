// src/components/UI/ConfirmModal.jsx
import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{message}</p>
        </div>
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition"
          >
            Cancelar
          </button>
          <div className="border-l border-gray-200 dark:border-gray-700"></div>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm bg-red-600 hover:bg-red-700 text-white transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;