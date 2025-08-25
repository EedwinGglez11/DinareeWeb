import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarPage = () => {
  const { state } = useFinance();
  const [value, setValue] = useState(new Date());

  const getEventsForDate = (date) => {
    const events = [];

    state.expenses.forEach(exp => {
      if (exp.frequency === 'mensual') {
        const expDate = new Date(exp.date);
        if (expDate.getDate() === date.getDate()) {
          events.push({ type: 'gasto', title: exp.category, amount: exp.amount });
        }
      }
    });

    state.debts?.forEach(debt => {
      if (debt.frequency === 'mensual') {
        const startDate = new Date(debt.startDate);
        if (startDate.getDate() === date.getDate()) {
          events.push({ type: 'deuda', title: debt.name, amount: debt.amount / debt.installments });
        }
      }
    });

    return events;
  };

  return (
    <div className="text-gray-800 dark:text-gray-200 max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calendario de Pagos</h1>
      <Calendar
        onChange={setValue}
        value={value}
        className="w-full"
        tileContent={({ date, view }) => {
          const events = getEventsForDate(date);
          return events.length > 0 ? (
            <div className="text-xs mt-1">
              {events.map((e, i) => (
                <div key={i} className={`px-1 rounded text-white text-xs ${e.type === 'gasto' ? 'bg-warning' : 'bg-danger'}`}>
                  {e.title}: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(e.amount)}
                </div>
              ))}
            </div>
          ) : null;
        }}
      />
    </div>
  );
};

export default CalendarPage;