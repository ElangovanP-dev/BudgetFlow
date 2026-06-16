import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionRow from '../components/TransactionRow';
import AddExpenseModal from '../components/AddExpenseModal';
import { 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Tag, 
  DollarSign, 
  Search,
  XCircle,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'SHOPPING', 'BILLS', 'HEALTH', 'ENTERTAINMENT', 'OTHER'];

export default function Expenses() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Pagination / Data state
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 15,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined
      };
      
      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(',');
      }

      const response = await api.get('/api/expenses', { params });
      setExpenses(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error(err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, startDate, endDate, selectedCategories, minAmount, maxAmount]);

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
    setPage(0); // Reset to first page when toggling filters
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategories([]);
    setMinAmount('');
    setMaxAmount('');
    setPage(0);
  };

  const handleAddExpense = async (newExpense) => {
    try {
      await api.post('/api/expenses', newExpense);
      fetchExpenses(); // Reload list
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUpdateExpense = async (id, updatedDetails) => {
    try {
      await api.put(`/api/expenses/${id}`, updatedDetails);
      // Update local state directly to prevent a full reload flickr
      setExpenses(expenses.map(e => e.id === id ? { ...e, ...updatedDetails } : e));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      fetchExpenses(); // Reload list
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense.');
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
              <p className="text-xs text-slate-400">Manage Transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex space-x-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl mr-2 text-sm">
              <Link to="/dashboard" className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/50">
                Dashboard
              </Link>
              <Link to="/expenses" className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
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

      {/* Primary Content Container */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-6 gap-6 items-start">
        
        {/* Left filter sidebar */}
        <aside className="w-full lg:w-72 border border-slate-900 bg-slate-900/20 rounded-3xl p-5 backdrop-blur-xl shrink-0 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              Filter Expenses
            </h2>
            <button 
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>

          {/* Date Picker Range */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Date Range
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category checklist */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Categories
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 select-none">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                  <span className="capitalize">{cat.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount range */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ($)"
                value={minAmount}
                onChange={(e) => { setMinAmount(e.target.value); setPage(0); }}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Max ($)"
                value={maxAmount}
                onChange={(e) => { setMaxAmount(e.target.value); setPage(0); }}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </aside>

        {/* Main Area: Expenses list */}
        <section className="flex-grow w-full border border-slate-900 bg-slate-900/20 rounded-3xl p-5 backdrop-blur-xl flex flex-col self-stretch min-h-[500px]">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Transaction History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing {expenses.length} of {totalElements} elements</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Table Container */}
          <div className="flex-grow overflow-x-auto">
            {loading && expenses.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-900 rounded-2xl bg-slate-900/10">
                <p className="text-sm text-slate-500">No transactions match the filter criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {expenses.map((expense) => (
                    <TransactionRow
                      key={expense.id}
                      expense={expense}
                      onUpdate={handleUpdateExpense}
                      onDelete={handleDeleteExpense}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-6">
              <span className="text-xs text-slate-400">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || loading}
                  className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1 || loading}
                  className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating ADD button on mobile/general */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/30 active:scale-95 transition-all md:hidden z-30"
        title="Add Expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddExpense}
      />
    </div>
  );
}
