import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CategoryBarChart from '../components/CategoryBarChart';
import DailyLineChart from '../components/DailyLineChart';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Activity,
  ArrowRight,
  TrendingDown,
  LogOut,
  Sliders,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch summary statistics
      const summaryRes = await api.get('/api/expenses/summary', {
        params: { month: selectedMonth, year: selectedYear }
      });
      setSummary(summaryRes.data);

      // Fetch 5 recent expenses
      const recentRes = await api.get('/api/expenses/recent');
      setRecentExpenses(recentRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Calculate average daily spend
  const avgDailySpend = () => {
    if (!summary || !summary.totalSpent) return 0;
    
    const today = new Date();
    let days = 30; // fallback
    
    // If viewing the current month/year, divide by the current date
    if (selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear()) {
      days = today.getDate();
    } else {
      // Calculate days in the selected month
      days = new Date(selectedYear, selectedMonth, 0).getDate();
    }
    
    return parseFloat(summary.totalSpent) / days;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
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
              <p className="text-xs text-slate-400">Hello, {user?.name || 'User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation tabs */}
            <nav className="flex space-x-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl mr-2 text-sm">
              <Link to="/dashboard" className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                Dashboard
              </Link>
              <Link to="/expenses" className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/50">
                Expenses
              </Link>
              <Link to="/budgets" className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/50">
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

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Filters Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              Overview Settings
            </h2>
            <p className="text-xs text-slate-400">Select month and year to filter summary stats</p>
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

        {loading && !summary ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Spent */}
              <div className="rounded-2xl border border-slate-850 bg-slate-900/30 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
                  <DollarSign className="h-16 w-16" />
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total this Month</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-100">
                    ${summary ? parseFloat(summary.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Card 2: Top Category */}
              <div className="rounded-2xl border border-slate-850 bg-slate-900/30 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
                  <TrendingUp className="h-16 w-16" />
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Top Category</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-100 capitalize">
                    {summary?.topCategory ? summary.topCategory.toLowerCase() : 'None'}
                  </span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Card 3: Avg Daily Spend */}
              <div className="rounded-2xl border border-slate-850 bg-slate-900/30 p-5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
                  <Activity className="h-16 w-16" />
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Daily Spend</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-100">
                    ${avgDailySpend().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Card 4: Budget Alerts */}
              <div className={`rounded-2xl border p-5 backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${summary?.budgetAlerts?.length > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900/30 border-slate-850'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
                  <AlertCircle className="h-16 w-16" />
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Budget Alerts</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-2xl font-black ${summary?.budgetAlerts?.length > 0 ? 'text-red-400' : 'text-slate-100'}`}>
                    {summary?.budgetAlerts ? summary.budgetAlerts.length : 0} Alert(s)
                  </span>
                  <div className={`p-2 rounded-lg ${summary?.budgetAlerts?.length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Spending Bar Chart */}
              <div className="border border-slate-900 bg-slate-900/20 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Spending by Category
                </h3>
                <CategoryBarChart data={summary?.byCategory || []} />
              </div>

              {/* Daily Spending Line Chart */}
              <div className="border border-slate-900 bg-slate-900/20 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Daily Cumulative Spending (Last 30 Days)
                </h3>
                <DailyLineChart data={summary?.dailyTrend || []} />
              </div>

            </div>

            {/* Recent Transactions Section */}
            <div className="border border-slate-900 bg-slate-900/20 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Recent Transactions
                </h3>
                <Link to="/expenses" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  <span>View All Expenses</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentExpenses.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No transactions found. Go to <Link to="/expenses" className="text-blue-400 underline">Expenses</Link> page to add one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {recentExpenses.map((expense) => {
                        const dateObj = new Date(expense.expenseDate);
                        return (
                          <tr key={expense.id} className="text-sm hover:bg-slate-900/10 transition-colors">
                            <td className="px-4 py-3 text-slate-400">
                              {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold capitalize">
                                {expense.category.toLowerCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-250">
                              {expense.description || <span className="text-slate-650 italic">No description</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-100 font-bold">
                              ${parseFloat(expense.amount).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
