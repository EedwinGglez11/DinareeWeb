import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { saveData } from '../services/storageService';
import EditableItem from '../components/UI/EditableItem'; 
import { formatCurrency } from '../utils/formatters';

const defaultCategories = [
  'Transporte', 'Servicios', 'Alimentación', 'Salud',
  'Entretenimiento', 'Educación', 'Hogar', 'Ropa',
  'Ahorro', 'Deudas', 'Otros'
];


const ExpensesPage = () => {

  const { state, dispatch } = useFinance();
  const [form, setForm] = useState({
    type: 'regular', 
    category: 'Deudas',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    // Para préstamos
    loanName: '',
    loanTotal: '',
    loanPaid: '',
    loanFrequency: 'mensual',
    loanStartDate: new Date().toISOString().split('T')[0],
    loanDuration: '', // en meses
  });

  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const isLoan = form.type === 'loan';
  const isAutomatic = form.type === 'automatic';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoan) {
      if (!form.loanName || !form.loanTotal || !form.loanStartDate) {
        alert('Completa los campos del préstamo');
        return;
      }
      const loan = {
        id: Date.now(),
        type: 'loan',
        name: form.loanName,
        total: parseFloat(form.loanTotal),
        paid: parseFloat(form.loanPaid || 0),
        frequency: form.loanFrequency,
        startDate: form.loanStartDate,
        duration: parseInt(form.loanDuration),
        category: form.category,
      };
      const updatedLoans = [...(state.loans || []), loan];
      dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
      saveData({ ...state, loans: updatedLoans });
      alert('✅ Préstamo registrado');
    } else {
      const expense = {
        id: Date.now(),
        type: form.type,
        category: form.category,
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date,
      };
      const updatedExpenses = [...state.expenses, expense];
      dispatch({ type: 'ADD_EXPENSE', payload: expense });

      alert('✅ Gasto registrado');
    }

    setForm({
      type: 'regular', category: 'Deudas', description: '', amount: '',
      date: new Date().toISOString().split('T')[0],
      loanName: '', loanTotal: '', loanPaid: '', loanFrequency: 'mensual',
      loanStartDate: new Date().toISOString().split('T')[0], loanDuration: ''
    });
  };

  const calculatePayment = () => {
  const total = parseFloat(form.loanTotal) || 0;
  const duration = parseInt(form.loanDuration) || 0;
  const frequency = form.loanFrequency;

  if (total === 0 || duration === 0) return null;

  let totalPayments = 0;

  switch (frequency) {
    case 'semanal':
      totalPayments = duration * 4;
      break;
    case 'quincenal':
      totalPayments = duration * 2;
      break;
    case 'mensual':
      totalPayments = duration;
      break;
    case 'bimestral':
      totalPayments = Math.ceil(duration / 2);
      break;
    case 'trimestral':
      totalPayments = Math.ceil(duration / 3);
      break;
    case 'semestral':
      totalPayments = Math.ceil(duration / 6);
      break;
    case 'anual':
      totalPayments = Math.ceil(duration / 12);
      break;
    default:
      return null;
  }
  if (totalPayments === 0) return null;

  return total / totalPayments;
};
  return (
    <div className="text-gray-800 dark:text-gray-200">
      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto mb-10 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de gasto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Registro:
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary transition"
            >
              <option value="regular">Gasto Regular</option>
              <option value="loan">Préstamo o Crédito</option>
              <option value="automatic">Descuento Automático (Infonavit, SAR)</option>
            </select>
          </div>

          {/* Formulario para Préstamo */}
          {isLoan &&(
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4">Datos del Préstamo/Crédito</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Nombre del préstamo"
                  name="loanName"
                  value={form.loanName}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
                <input
                  type="number"
                  placeholder="Monto total"
                  name="loanTotal"
                  value={form.loanTotal}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                />
                <input
                  type="number"
                  placeholder="Ya pagado (opcional)"
                  name="loanPaid"
                  value={form.loanPaid}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="number"
                  placeholder="Duración en meses"
                  name="loanDuration"
                  value={form.loanDuration}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="date"
                  name="loanStartDate"
                  value={form.loanStartDate}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <select
                  name="loanFrequency"
                  value={form.loanFrequency}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              {/* Mostrar cuota estimada */}
              {form.loanTotal && form.loanDuration && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Cuota {form.loanFrequency} estimada:{' '}
                    <span className="font-bold">
                      {formatCurrency(calculatePayment())}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Formulario regular */}
          {!isLoan && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha:</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción:</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ej: Pago de tarjeta, gasolina"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto:</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required={!isLoan}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            {isLoan ? 'Registrar Préstamo' : 'Registrar Gasto'}
          </button>
        </form>
      </div>
        
      {/* Lista de préstamos */}
      {state.loans?.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold mb-6">Préstamos Activos</h2>
          <div className="space-y-5">
            {state.loans.map((loan) => (
              <EditableItem
                key={loan.id}
                item={loan}
                onUpdate={(updatedLoan) => {
                  const updatedLoans = state.loans.map(l => l.id === loan.id ? updatedLoan : l);
                  dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
                  saveData({ ...state, loans: updatedLoans });
                  alert('✅ Préstamo actualizado');
                }}
                onDelete={(id) => {
                  const confirm = window.confirm('¿Eliminar este préstamo?');
                  if (!confirm) return;
                  const updatedLoans = state.loans.filter(l => l.id !== id);
                  dispatch({ type: 'SET_DATA', payload: { ...state, loans: updatedLoans } });
                  saveData({ ...state, loans: updatedLoans });
                  alert('🗑️ Préstamo eliminado');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lista de gastos regulares */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6">Gastos Recientes</h2>
        {state.expenses.length === 0 ? (
          <p className="text-gray-500 text-center">No hay gastos registrados.</p>
        ) : (
          <div className="space-y-3">
            {[...state.expenses]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .map((exp) => (
                <EditableItem
                  key={exp.id}
                  item={exp}
                  onUpdate={(updatedExpense) => {
                    const updatedExpenses = state.expenses.map(e =>
                      e.id === exp.id ? updatedExpense : e
                    );
                    dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
                    saveData({ ...state, expenses: updatedExpenses });
                    alert('✅ Gasto actualizado');
                  }}
                  onDelete={(id) => {
                    const updatedExpenses = state.expenses.filter(e => e.id !== id);
                    dispatch({ type: 'SET_DATA', payload: { ...state, expenses: updatedExpenses } });
                    saveData({ ...state, expenses: updatedExpenses });
                    alert('🗑️ Gasto eliminado');
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;