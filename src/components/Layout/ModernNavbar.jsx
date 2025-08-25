// src/components/Layout/ModernNavbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaPiggyBank,
  FaChartBar,
  FaClipboardList,
} from 'react-icons/fa';

const ModernNavbar = ({ children }) => {
  const location = useLocation();

  const menuItems = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: <FaHome className="w-5 h-5" /> 
  },
  { 
    name: 'Ingresos', 
    path: '/income', 
    icon: <FaMoneyBillWave className="w-5 h-5" /> 
  },
  { 
    name: 'Gastos', 
    path: '/expenses', 
    icon: <FaFileInvoiceDollar className="w-5 h-5" /> 
  },
  { 
    name: 'Préstamos', 
    path: '/debts', 
    icon: <FaWallet className="w-5 h-5" /> 
  },
  { 
    name: 'Metas', 
    path: '/goals', 
    icon: <FaPiggyBank className="w-5 h-5" /> 
  },
  { 
    name: 'Reportes', 
    path: '/reports', 
    icon: <FaChartBar className="w-5 h-5" /> 
  },
];

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary">DinareeWeb</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tu asistente financiero</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition
                ${location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              const el = document.documentElement;
              el.classList.toggle('dark');
              localStorage.setItem('theme', el.classList.contains('dark') ? 'dark' : 'light');
            }}
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            🌙 Modo Oscuro
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        {children} {/* ✅ Aquí se renderizan las páginas */}
      </main>
    </div>
  );
};

export default ModernNavbar;