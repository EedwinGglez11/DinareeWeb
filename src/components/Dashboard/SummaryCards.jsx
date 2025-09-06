// src/components/Dashboard/SummaryCards.jsx
import React, { useMemo } from "react";
import { useFinance } from "../../hooks/useFinance";
import { Wallet, DollarSign, TrendingUp, Scale, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";


const SummaryCards = () => {


  const { state } = useFinance();
  const now = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => now.getMonth(), [now]);
  const currentYear = useMemo(() => now.getFullYear(), [now]);

console.log('Estado completo:', state);
console.log('Ingresos:', state.incomes);
console.log('Gastos:', state.expenses);
console.log('Metas:', state.goals);
console.log('Mes actual:', currentMonth + 1, 'Año:', currentYear);


const totalIncome = useMemo(() => {
  if (!Array.isArray(state.incomes)) return 0;

  return state.incomes.reduce((sum, inc) => {
    const startDate = new Date(inc.date);
    const endDate = inc.endDate ? new Date(inc.endDate) : null;

    // Si es "único", debe coincidir con el mes actual
    if (inc.frequency === 'único') {
      if (
        startDate.getFullYear() === currentYear &&
        startDate.getMonth() === currentMonth
      ) {
        return sum + (Number(inc.amount) || 0);
      }
      return sum;
    }

    // Si es recurrente, verificar si está activo en el mes actual
    const start = new Date(currentYear, currentMonth, 1); // 1er día del mes
    const end = new Date(currentYear, currentMonth + 1, 0); // Último día del mes

    // Verificar si el ingreso estaba activo en algún momento del mes
    const activeStart = startDate <= end; // Ya había empezado
    const activeEnd = !endDate || endDate >= start; // No había terminado

    if (activeStart && activeEnd) {
      return sum + (Number(inc.amount) || 0);
    }

    return sum;
  }, 0);
}, [state.incomes, currentMonth, currentYear]);

const totalExpenses = useMemo(() => {
  if (!Array.isArray(state.expenses)) return 0;

  return state.expenses.reduce((sum, exp) => {
    const startDate = new Date(exp.date);
    const endDate = exp.endDate ? new Date(exp.endDate) : null;

    // === 1. Gasto único ===
    if (exp.frequency === 'único') {
      if (
        startDate.getFullYear() === currentYear &&
        startDate.getMonth() === currentMonth
      ) {
        return sum + (Number(exp.amount) || 0);
      }
      return sum;
    }

    // === 2. Gasto recurrente ===
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // ¿El gasto ya había comenzado para este mes?
    const hasStarted = startDate <= endOfMonth;

    // ¿El gasto aún no termina, o terminó después del inicio del mes?
    const hasNotEnded = !endDate || endDate >= startOfMonth;

    if (!hasStarted || !hasNotEnded) {
      return sum;
    }

    // === 3. Calcular cuántas veces se paga en el mes ===
    let frequencyMultiplier = 1;

    switch (exp.frequency) {
      case 'semanal':
        frequencyMultiplier = 4; // Aproximado: 4 semanas por mes
        break;
      case 'quincenal':
        frequencyMultiplier = 2; // 2 veces por mes
        break;
      case 'mensual':
        frequencyMultiplier = 1;
        break;
      case 'bimestral':
        frequencyMultiplier = 1 / 2; // Cada 2 meses
        break;
      case 'trimestral':
        frequencyMultiplier = 1 / 3;
        break;
      case 'semestral':
        frequencyMultiplier = 1 / 6;
        break;
      case 'anual':
        frequencyMultiplier = 1 / 12;
        break;
      default:
        frequencyMultiplier = 1;
    }

    const amountThisMonth = (Number(exp.amount) || 0) * frequencyMultiplier;
    return sum + amountThisMonth;
  }, 0);
}, [state.expenses, currentMonth, currentYear]);

  const balance = totalIncome - totalExpenses;

  // ✅ Esto suma solo las cuotas que se pagan este mes
// === 4. Cuota total de préstamos este mes ===
const totalLoanPaymentsThisMonth = useMemo(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (state.loans || [])
    .filter(loan => {
      // Solo préstamos activos
      const startDate = new Date(loan.startDate);
      const totalPayments = (() => {
        switch (loan.frequency) {
          case 'semanal': return loan.duration * 4;
          case 'quincenal': return loan.duration * 2;
          case 'mensual': return loan.duration;
          default: return loan.duration;
        }
      })();
      const paymentAmount = totalPayments > 0 ? loan.total / totalPayments : 0;
      const paidCount = Math.floor(loan.paid / paymentAmount);
      return paidCount < totalPayments;
    })
    .reduce((sum, loan) => {
      const startDate = new Date(loan.startDate);
      const totalPayments = (() => {
        switch (loan.frequency) {
          case 'semanal': return loan.duration * 4;
          case 'quincenal': return loan.duration * 2;
          case 'mensual': return loan.duration;
          default: return loan.duration;
        }
      })();
      const paymentAmount = totalPayments > 0 ? loan.total / totalPayments : 0;

      let count = 0;
      let paymentDate = new Date(startDate);

      // Avanzar hasta el fin del mes actual
      const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

      while (paymentDate <= endOfCurrentMonth) {
        if (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        ) {
          count++;
        }

        switch (loan.frequency) {
          case 'semanal':
            paymentDate.setDate(paymentDate.getDate() + 7);
            break;
          case 'quincenal':
            paymentDate.setDate(paymentDate.getDate() + 15);
            break;
          case 'mensual':
            paymentDate.setMonth(paymentDate.getMonth() + 1);
            break;
          default:
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        }
      }

      return sum + (count * paymentAmount);
    }, 0);
}, [state.loans]);


  const goalsProgress = useMemo(() => {
    return (state.goals || []).map(goal => ({
      ...goal,
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
    }));
  }, [state.goals]);

  const completedGoals = goalsProgress.filter(g => g.progress >= 100).length;
  const averageProgress = goalsProgress.length > 0
    ? Math.round(goalsProgress.reduce((a, b) => a + b.progress, 0) / goalsProgress.length)
    : 0;

  const format = (num) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(num);
  // === Card minimalista ===

const SummaryCard = ({ title, value, subtitle, icon: Icon, iconColor, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-full bg-opacity-10 ${iconColor.replace("text", "bg")}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-2">
        {typeof value === "number" ? format(value) : value}
      </h2>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
    <SummaryCard 
      title="Ingresos" 
      value={totalIncome} 
      icon={Wallet} 
      iconColor="text-green-500" 
      to="/income" 
    />
    <SummaryCard 
      title="Gastos" 
      value={totalExpenses} 
      icon={DollarSign} 
      iconColor="text-red-500" 
      to="/expenses" 
    />
    <SummaryCard 
      title="Balance" 
      value={balance} 
      icon={TrendingUp} 
      iconColor="text-blue-500" 
      subtitle={balance >= 0 ? "Positivo" : "Negativo"} 
    />
    <SummaryCard 
      title="Deuda Activa" 
      value={totalLoanPaymentsThisMonth} 
      icon={Scale} 
      iconColor="text-orange-500" 
      to="/debts" 
    />
    <SummaryCard 
      title="Metas" 
      value={`${completedGoals}/${goalsProgress.length}`} 
      subtitle={`${averageProgress}% promedio`} 
      icon={Target} 
      iconColor="text-purple-500" 
      to="/goals" 
    />
  </div>
);


};

export default SummaryCards;