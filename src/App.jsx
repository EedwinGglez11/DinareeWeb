// src/App.js

import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';

import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import DebtsPage from './pages/DebtsPage';
import CreditCardsPage from './pages/CreditCardsPage';
import GoalsPage from './pages/GoalsPage';
import ReportsPage from './pages/ReportsPage';
import ModernNavbar from './components/Layout/ModernNavbar';
function App() {
  return (
    <FinanceProvider>
      <Router>
        {/* ModernNavbar es el layout principal */}
        <ModernNavbar>
          {/* Aquí se renderizan las páginas */}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/credit-cards" element={<CreditCardsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </ModernNavbar>
      </Router>
    </FinanceProvider>
  );
}

export default App;