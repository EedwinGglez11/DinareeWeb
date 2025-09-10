// src/components/Dashboard/SummaryCards.jsx
import React, { useMemo } from "react";
import { useFinance } from "../../hooks/useFinance";
import { Wallet, DollarSign, TrendingUp, Scale, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SummaryCards = () => {
  const { state } = useFinance();
  const navigate = useNavigate(); // ✅ Aquí sí se permite
  const now = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => now.getMonth(), [now]);
  const currentYear = useMemo(() => now.getFullYear(), [now]);

  // === 1. Ingresos mensuales ===
  const totalIncome = useMemo(() => {
    if (!Array.isArray(state.incomes)) return 0;

    return state.incomes.reduce((sum, inc) => {
      const startDate = new Date(inc.date);
      const endDate = inc.endDate ? new Date(inc.endDate) : null;

      // Ingreso único
      if (inc.frequency === 'único') {
        if (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() === currentMonth
        ) {
          return sum + (Number(inc.amount) || 0);
        }
        return sum;
      }

      // Recurrente
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const hasStarted = startDate <= endOfMonth;
      const hasNotEnded = !endDate || endDate >= startOfMonth;

      if (!hasStarted || !hasNotEnded) return sum;

      let frequencyMultiplier = 1;
      switch (inc.frequency) {
        case 'semanal': frequencyMultiplier = 4; break;
        case 'quincenal': frequencyMultiplier = 2; break;
        case 'mensual': frequencyMultiplier = 1; break;
        case 'bimestral': frequencyMultiplier = 1 / 2; break;
        case 'trimestral': frequencyMultiplier = 1 / 3; break;
        case 'semestral': frequencyMultiplier = 1 / 6; break;
        case 'anual': frequencyMultiplier = 1 / 12; break;
        default: frequencyMultiplier = 1;
      }

      return sum + (Number(inc.amount) || 0) * frequencyMultiplier;
    }, 0);
  }, [state.incomes, currentMonth, currentYear]);

  // === 2. Gastos mensuales ===
  const totalExpenses = useMemo(() => {
    if (!Array.isArray(state.expenses)) return 0;

    return state.expenses.reduce((sum, exp) => {
      const startDate = new Date(exp.date);
      const endDate = exp.endDate ? new Date(exp.endDate) : null;

      if (exp.frequency === 'único') {
        if (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() === currentMonth
        ) {
          return sum + (Number(exp.amount) || 0);
        }
        return sum;
      }

      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const hasStarted = startDate <= endOfMonth;
      const hasNotEnded = !endDate || endDate >= startOfMonth;

      if (!hasStarted || !hasNotEnded) return sum;

      let frequencyMultiplier = 1;
      switch (exp.frequency) {
        case 'semanal': frequencyMultiplier = 4; break;
        case 'quincenal': frequencyMultiplier = 2; break;
        case 'mensual': frequencyMultiplier = 1; break;
        case 'bimestral': frequencyMultiplier = 1 / 2; break;
        case 'trimestral': frequencyMultiplier = 1 / 3; break;
        case 'semestral': frequencyMultiplier = 1 / 6; break;
        case 'anual': frequencyMultiplier = 1 / 12; break;
        default: frequencyMultiplier = 1;
      }

      return sum + (Number(exp.amount) || 0) * frequencyMultiplier;
    }, 0);
  }, [state.expenses, currentMonth, currentYear]);

  // === 3. Cuotas de préstamos este mes ===
  const totalLoanPaymentsThisMonth = useMemo(() => {
    return (state.loans || [])
      .filter(loan => {
        //const startDate = new Date(loan.startDate);
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
  }, [state.loans, currentMonth, currentYear]);

  // === 4. Balance final ===
  const balance = totalIncome - (totalExpenses + totalLoanPaymentsThisMonth);

  // === 5. Progreso de metas ===
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

  // === Card reutilizable ===
  const SummaryCard = ({ title, value, subtitle, icon: Icon, iconColor, onClick }) => {
    return (
      <div
        onClick={onClick}
        className="flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
        onClick={() => navigate("/income")} 
      />
      <SummaryCard 
        title="Gastos" 
        value={totalExpenses} 
        icon={DollarSign} 
        iconColor="text-red-500" 
        onClick={() => navigate("/expenses")} 
      />
      <SummaryCard 
        title="Balance" 
        value={balance} 
        icon={TrendingUp} 
        iconColor={balance >= 0 ? "text-green-500" : "text-red-500"} 
        subtitle={balance >= 0 ? "Positivo" : "Negativo"} 
        onClick={() => navigate("/dashboard")} 
      />
      <SummaryCard 
        title="Deuda Activa" 
        value={totalLoanPaymentsThisMonth} 
        icon={Scale} 
        iconColor="text-orange-500" 
        onClick={() => navigate("/debts")} 
      />
      <SummaryCard 
        title="Metas" 
        value={`${completedGoals}/${goalsProgress.length}`} 
        subtitle={`${averageProgress}% promedio`} 
        icon={Target} 
        iconColor="text-purple-500" 
        onClick={() => navigate("/goals")} 
      />
    </div>
  );
};

export default SummaryCards;