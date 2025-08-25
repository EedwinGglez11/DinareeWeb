import { utils, writeFile } from 'xlsx';

export const exportToExcel = (state) => {
  const { incomes, expenses, debts, goals } = state;

  const incomeSheet = incomes.map(inc => ({
    Fecha: inc.date,
    Fuente: inc.source,
    Empresa: inc.company,
    Monto: inc.amount,
    Frecuencia: inc.frequency
  }));

  const expenseSheet = expenses.map(exp => ({
    Fecha: exp.date,
    Categoría: exp.category,
    Descripción: exp.description,
    Tipo: exp.type || 'manual',
    Monto: exp.amount
  }));

  const debtSheet = debts?.map(debt => ({
    Nombre: debt.name,
    Monto: debt.amount,
    Cuotas: debt.installments,
    Pagadas: debt.paid,
    Frecuencia: debt.frequency,
    FechaInicio: debt.startDate
  })) || [];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.json_to_sheet(incomeSheet), 'Ingresos');
  utils.book_append_sheet(wb, utils.json_to_sheet(expenseSheet), 'Gastos');
  utils.book_append_sheet(wb, utils.json_to_sheet(debtSheet), 'Deudas');
  utils.book_append_sheet(wb, utils.json_to_sheet(goals), 'Metas');

  writeFile(wb, 'finanzapp-datos.xlsx');
};