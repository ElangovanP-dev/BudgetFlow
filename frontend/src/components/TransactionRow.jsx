import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Utensils, 
  Car, 
  ShoppingBag, 
  FileText, 
  Heart, 
  Film, 
  HelpCircle 
} from 'lucide-react';

const CATEGORY_ICONS = {
  FOOD: Utensils,
  TRANSPORT: Car,
  SHOPPING: ShoppingBag,
  BILLS: FileText,
  HEALTH: Heart,
  ENTERTAINMENT: Film,
  OTHER: HelpCircle
};

const CATEGORY_COLORS = {
  FOOD: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  TRANSPORT: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  SHOPPING: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  BILLS: 'bg-red-500/10 text-red-400 border border-red-500/20',
  HEALTH: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  ENTERTAINMENT: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  OTHER: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
};

export default function TransactionRow({ expense, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description || '');
  const [expenseDate, setExpenseDate] = useState(expense.expenseDate);
  const [isSaving, setIsSaving] = useState(false);

  const IconComponent = CATEGORY_ICONS[expense.category] || HelpCircle;

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Amount must be a positive number');
      return;
    }
    if (!expenseDate) {
      alert('Date is required');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(expense.id, {
        amount: numericAmount,
        category,
        description,
        expenseDate
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description || '');
    setExpenseDate(expense.expenseDate);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="border-b border-slate-800/80 bg-slate-900/40">
        <td className="px-4 py-3 text-sm">
          <input 
            type="date" 
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            disabled={isSaving}
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            disabled={isSaving}
          >
            {Object.keys(CATEGORY_ICONS).map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3 text-sm">
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            disabled={isSaving}
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="text-slate-500 text-xs">$</span>
            </div>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded pl-6 pr-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-semibold"
              disabled={isSaving}
            />
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-right">
          <div className="flex items-center justify-end space-x-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-900/10 transition-colors group">
      {/* Date */}
      <td className="px-4 py-4.5 text-sm text-slate-300 font-medium">
        {new Date(expense.expenseDate).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </td>
      {/* Category badge */}
      <td className="px-4 py-4.5 text-sm">
        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER}`}>
          <IconComponent className="h-3 w-3 mr-1" />
          <span className="capitalize">{expense.category.toLowerCase()}</span>
        </span>
      </td>
      {/* Description */}
      <td className="px-4 py-4.5 text-sm text-slate-200 max-w-xs truncate" title={expense.description}>
        {expense.description || <span className="text-slate-500 italic">No description</span>}
      </td>
      {/* Amount */}
      <td className="px-4 py-4.5 text-sm text-slate-100 font-bold">
        ${parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      {/* Action icons */}
      <td className="px-4 py-4.5 text-sm text-right">
        <div className="flex items-center justify-end space-x-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => onDelete(expense.id)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
