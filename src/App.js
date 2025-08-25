import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import ModernNavbar from './components/Layout/ModernNavbar';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';

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
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </ModernNavbar>
      </Router>
    </FinanceProvider>
  );
}

export default App;