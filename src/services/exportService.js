// src/services/exportService.js
import { utils, writeFile } from 'xlsx';

export const exportToExcel = (state) => {
  // Extraer datos del estado
  const { incomes = [], expenses = [], loans = [], creditCards = [], goals = [] } = state;

  // === Hoja: Ingresos ===
  const incomeSheet = incomes.map(inc => ({
    Fecha: inc.date,
    Fuente: inc.source || 'Sin fuente',
    Empresa: inc.company || 'N/A',
    Monto: Number(inc.amount) || 0,
    Frecuencia: inc.frequency || 'único',
    Notas: inc.notes || ''
  }));

  // === Hoja: Gastos ===
  const expenseSheet = expenses.map(exp => ({
    Fecha: exp.date,
    Categoría: exp.category || 'Sin categoría',
    Descripción: exp.description || 'Sin descripción',
    Tipo: exp.type || 'manual',
    Monto: Number(exp.amount) || 0,
    Frecuencia: exp.frequency || 'único',
    Notas: exp.notes || ''
  }));

  // === Hoja: Préstamos (Deudas) ===
  const loanSheet = loans.map(loan => ({
    Nombre: loan.name || 'Sin nombre',
    MontoTotal: Number(loan.total) || 0,
    Cuotas: loan.duration || 0,
    Pagadas: Number(loan.paid) || 0,
    Frecuencia: loan.frequency || 'mensual',
    FechaInicio: loan.startDate,
    Estado: Number(loan.paid) >= (loan.total / (loan.duration * (['semanal','quincenal','mensual'].includes(loan.frequency) ? ({'semanal':4,'quincenal':2,'mensual':1})[loan.frequency] : 1))) ? 'Pagado' : 'Pendiente'
  }));

  // === Hoja: Tarjetas de Crédito ===
  const creditCardSheet = creditCards.map(card => ({
    Nombre: card.cardName || 'Sin nombre',
    Banco: card.bank || 'N/A',
    Límite: Number(card.limit) || 0,
    PagoMínimo: Number(card.minPayment) || 0,
    FechaPago: card.paymentDate,
    Estado: new Date(card.paymentDate).getDate() >= new Date().getDate() ? 'Próximo pago' : 'Por vencer'
  }));

  // === Hoja: Metas ===
  const goalSheet = goals.map(goal => ({
    Meta: goal.name || 'Sin nombre',
    Objetivo: Number(goal.targetAmount) || 0,
    Actual: Number(goal.currentAmount) || 0,
    Progreso: `${((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)}%`,
    FechaInicio: goal.startDate,
    FechaMeta: goal.deadline,
    Estado: goal.currentAmount >= goal.targetAmount ? 'Alcanzada' : 'En progreso'
  }));

  // Crear libro de Excel
  const wb = utils.book_new();

  // Agregar hojas
  utils.book_append_sheet(wb, utils.json_to_sheet(incomeSheet), 'Ingresos');
  utils.book_append_sheet(wb, utils.json_to_sheet(expenseSheet), 'Gastos');
  utils.book_append_sheet(wb, utils.json_to_sheet(loanSheet), 'Préstamos');
  utils.book_append_sheet(wb, utils.json_to_sheet(creditCardSheet), 'Tarjetas');
  utils.book_append_sheet(wb, utils.json_to_sheet(goalSheet), 'Metas');

  // Descargar archivo
  writeFile(wb, `finanzapp-export-${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`);
};