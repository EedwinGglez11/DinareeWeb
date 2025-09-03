// src/components/Layout/ModernNavbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaPiggyBank,
  FaChartBar,
  FaClipboardList,
  FaCreditCard,
  FaSun,
  FaMoon,
} from 'react-icons/fa';

const ModernNavbar = ({ children }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // ✅ Estado para colapsar

  // Verificar preferencia de tema al cargar
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDarkMode(newMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome className="w-5 h-5" /> },
    { name: 'Ingresos', path: '/income', icon: <FaMoneyBillWave className="w-5 h-5" /> },
    { name: 'Gastos', path: '/expenses', icon: <FaFileInvoiceDollar className="w-5 h-5" /> },
    { name: 'Préstamos', path: '/debts', icon: <FaWallet className="w-5 h-5" /> },
    { name: 'Tarjetas', path: '/credit-cards', icon: <FaCreditCard className="w-5 h-5"/> },
    { name: 'Metas', path: '/goals', icon: <FaPiggyBank className="w-5 h-5" /> },
    { name: 'Reportes', path: '/reports', icon: <FaChartBar className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
       <aside 
    className={`bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}
  >
        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed ? (
            <>
              <div>
                <h1 className="text-xl font-bold text-primary">Dinaree</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Asistente Financiero</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {isCollapsed ? '→' : '←'}
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-lg"
            >
              ≡
            </button>
          )}
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <div
              key={item.path}
              className="group relative"
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span>{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>

              {/* Tooltip en modo colapsado */}
              {isCollapsed && (
                <div className="absolute left-16 p-2 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Switch de Modo Oscuro */}
<div className="p-4 border-t border-gray-200 dark:border-gray-700">
  {isCollapsed ? (
    /* Solo ícono cuando está contraído */
    <button
      onClick={toggleDarkMode}
      className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? (
        <FaSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FaMoon className="w-5 h-5" />
      )}
    </button>
  ) : (
    /* Switch completo cuando está expandido */
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {isDarkMode ? (
          <FaSun className="text-yellow-500" />
        ) : (
          <FaMoon className="text-gray-600" />
        )}
        <span className="text-sm font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
        <div className={`w-11 h-6 rounded-full transition ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <div
            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
              isDarkMode ? 'transform translate-x-5' : ''
            }`}
          ></div>
        </div>
      </label>
    </div>
  )}
</div>
      </aside>

      {/* Main Content */}
  <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-all duration-300">
    {children}
  </main>
    </div>
  );
};

export default ModernNavbar;