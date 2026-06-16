import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { 
  Sliders, 
  Wallet, 
  CheckCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'SHOPPING', 'BILLS', 'HEALTH', 'ENTERTAINMENT', 'OTHER'];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const YEARS = [2024, 2025, 2026, 2027];

export default function Budgets() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [budgets, setBudgets] = useState([]);
  const [spendingMap, setSpendingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBudgetsAndSpending = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch budgets for selected month/year
      const budgetsRes = await api.get('/api/budgets', {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      // 2. Fetch expenses summary for category spending
      const summaryRes = await api.get('/api/expenses/summary', {
        params: { month: selectedMonth, year: selectedYear }
      });
      
      // Build category spending map
      const spends = {};
      if (summaryRes.data && summaryRes.data.byCategory) {
        summaryRes.data.byCategory.forEach(item => {
          spends[item.category] = item.total;
        });
      }
      setSpendingMap(spends);

      // Build consolidated budgets array (ensure all 7 categories have a budget object)
      const existingBudgets = budgetsRes.data;
      const consolidated = CATEGORIES.map(cat => {
        const found = existingBudgets.find(b => b.category === cat);
        if (found) {
          return found;
        } else {
          return {
            id: null,
            category: cat,
            monthlyLimit: 0,
            month: selectedMonth,
            year: selectedYear
          };
        }
      });
      setBudgets(consolidated);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch budgets and spending details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsAndSpending();
  }, [selectedMonth, selectedYear]);

  const handleBudgetUpdate = async (category, newLimit) => {
    const existing = budgets.find(b => b.category === category);
    
    try {
      if (existing && existing.id !== null) {
        // Update existing budget
        await api.put(`/api/budgets/${existing.id}`, {
          category,
          monthlyLimit: newLimit,
          month: selectedMonth,
          year: selectedYear
        });
      } else {
        // Create new budget
        await api.post('/api/budgets', {
          category,
          monthlyLimit: newLimit,
          month: selectedMonth,
          year: selectedYear
        });
      }
      // Reload items to refresh IDs and stats
      fetchBudgetsAndSpending();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">BudgetFlow</h1>
              <p className="text-xs text-slate-400">Category Budgets</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex space-x-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl mr-2 text-sm">
              <Link to="/dashboard" className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/50">
                Dashboard
              </Link>
              <Link to="/expenses" className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/50">
                Expenses
              </Link>
              <Link to="/budgets" className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                Budgets
              </Link>
            </nav>

            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Month Selector Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-blue-500" />
              Monthly Budget Limits
            </h2>
            <p className="text-xs text-slate-400">Set limits for individual categories by month and year</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && budgets.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Grid of 7 category cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {budgets.map(budget => (
              <BudgetProgressCard
                key={budget.category}
                budget={budget}
                spent={spendingMap[budget.category] || 0}
                onUpdate={(newLimit) => handleBudgetUpdate(budget.category, newLimit)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
