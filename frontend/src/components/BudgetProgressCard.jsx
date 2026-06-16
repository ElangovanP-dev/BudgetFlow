import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  FileText, 
  Heart, 
  Film, 
  HelpCircle,
  Edit2,
  Check,
  AlertTriangle
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

const CATEGORY_STYLES = {
  FOOD: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  TRANSPORT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  SHOPPING: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  BILLS: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  HEALTH: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  ENTERTAINMENT: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  OTHER: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
};

export default function BudgetProgressCard({ budget, spent = 0, onUpdate }) {
  const { category, monthlyLimit, id } = budget;
  
  const [isEditing, setIsEditing] = useState(false);
  const [limitInput, setLimitInput] = useState(monthlyLimit.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLimitInput(monthlyLimit.toString());
  }, [monthlyLimit]);

  const IconComponent = CATEGORY_ICONS[category] || HelpCircle;
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.OTHER;
  
  const numericLimit = parseFloat(monthlyLimit) || 0;
  const numericSpent = parseFloat(spent) || 0;
  const isOverBudget = numericLimit > 0 && numericSpent > numericLimit;
  
  const percentage = numericLimit > 0 ? (numericSpent / numericLimit) * 100 : 0;
  
  const handleSave = async () => {
    const val = parseFloat(limitInput);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(val);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update budget limit.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-slate-900/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:shadow-lg ${isOverBudget ? 'border-red-500/20 shadow-red-950/5' : 'border-slate-800'}`}>
      {/* Category header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${style.bg} ${style.text}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 capitalize">
              {category.toLowerCase()}
            </h3>
            <p className="text-xs text-slate-400">Monthly Budget</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-slate-400">Limit</span>
          <div className="mt-1 flex items-center">
            {isEditing ? (
              <div className="flex items-center">
                <span className="text-sm font-bold text-slate-400 mr-1">$</span>
                <input 
                  type="number"
                  step="0.01"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-sm font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <span className="text-base font-bold text-slate-100">
                ${numericLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Spent</span>
          <div className="mt-1">
            <span className={`text-base font-bold ${isOverBudget ? 'text-red-400' : 'text-slate-100'}`}>
              ${numericSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Usage</span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Over budget alert warning card */}
      {isOverBudget && (
        <div className="mt-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>You have exceeded this category budget!</span>
        </div>
      )}
    </div>
  );
}
