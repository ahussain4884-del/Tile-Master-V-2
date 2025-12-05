import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Expense, ExpenseCategory } from '../types';
import { TrendingDown, Plus, Search, Trash2, Calendar, FileText, DollarSign, Filter, PieChart as PieChartIcon, Settings, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const ExpensesPage: React.FC = () => {
  const { expenses, expenseCategories, accounts, addExpense, deleteExpense, addExpenseCategory, deleteExpenseCategory, formatCurrency } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ title: '', categoryId: '', amount: 0, date: new Date().toISOString().split('T')[0], accountId: '', paymentMethod: 'Cash', paidTo: '', notes: '' });
  const [newCategory, setNewCategory] = useState('');
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
     isOpen: boolean;
     title: string;
     message: string;
     onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const todaysTotal = expenses.filter(e => e.date.startsWith(today)).reduce((acc, e) => acc + e.amount, 0);
  const monthlyTotal = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).reduce((acc, e) => acc + e.amount, 0);
  const filteredExpenses = expenses.filter(e => { const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()); const matchesCat = categoryFilter === 'All' || e.categoryId === categoryFilter; return matchesSearch && matchesCat; }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const categoryData = useMemo(() => { const data: Record<string, number> = {}; expenses.forEach(e => { const catName = expenseCategories.find(c => c.id === e.categoryId)?.name || 'Unknown'; data[catName] = (data[catName] || 0) + e.amount; }); return Object.entries(data).map(([name, value]) => ({ name, value })); }, [expenses, expenseCategories]);

  const handleAddExpense = (e: React.FormEvent) => { e.preventDefault(); if (newExpense.amount && newExpense.title && newExpense.categoryId && newExpense.accountId) { const expense: Expense = { id: Date.now().toString(), title: newExpense.title!, categoryId: newExpense.categoryId!, amount: Number(newExpense.amount), date: newExpense.date || new Date().toISOString(), accountId: newExpense.accountId!, paymentMethod: newExpense.paymentMethod || 'Cash', paidTo: newExpense.paidTo, notes: newExpense.notes, addedBy: 'Admin' }; addExpense(expense); setIsAddModalOpen(false); setNewExpense({ title: '', categoryId: '', amount: 0, date: new Date().toISOString().split('T')[0], accountId: '', paymentMethod: 'Cash', paidTo: '', notes: '' }); } else { alert("Please fill all required fields (Title, Amount, Category, Account)"); } };
  const handleAddCategory = (e: React.FormEvent) => { e.preventDefault(); if(newCategory) { addExpenseCategory(newCategory); setNewCategory(''); } };

  const handleDeleteClick = (id: string) => {
     setConfirmation({
        isOpen: true,
        title: 'Delete Expense',
        message: 'Are you sure you want to delete this expense? Funds will be refunded to the account.',
        onConfirm: () => {
           deleteExpense(id);
           setConfirmation({ ...confirmation, isOpen: false });
        }
     });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4"><div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expense Management</h1><p className="text-slate-500 dark:text-slate-400">Track shop costs, bills, and operational expenses</p></div><div className="flex gap-2"><button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"><Settings size={18} /> Categories</button><button onClick={() => setIsAddModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={20} /> Add Expense</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Expenses Today</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(todaysTotal)}</h3></div><div className="p-3 bg-red-100 text-red-600 rounded-lg"><Calendar size={24} /></div></div><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">This Month</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(monthlyTotal)}</h3></div><div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><TrendingDown size={24} /></div></div><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Total Recorded</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{expenses.length}</h3></div><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText size={24} /></div></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-6"><div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={20} /><input type="text" placeholder="Search expenses..." className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-red-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div><div className="flex items-center gap-2"><Filter size={20} className="text-slate-400" /><select className="p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none cursor-pointer" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="All">All Categories</option>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400"><tr><th className="p-4 font-semibold">Expense Details</th><th className="p-4 font-semibold">Category</th><th className="p-4 font-semibold">Paid Via</th><th className="p-4 font-semibold text-right">Amount</th><th className="p-4 font-semibold text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{filteredExpenses.map(exp => { const categoryName = expenseCategories.find(c => c.id === exp.categoryId)?.name || 'Unknown'; const accountName = accounts.find(a => a.id === exp.accountId)?.name || 'Unknown Account'; return (<tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-4"><div className="font-bold dark:text-white">{exp.title}</div><div className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()} • To: {exp.paidTo || 'N/A'}</div>{exp.notes && <div className="text-xs text-slate-400 mt-1 italic">{exp.notes}</div>}</td><td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">{categoryName}</span></td><td className="p-4 text-slate-600 dark:text-slate-400 text-xs">{accountName}<br/><span className="opacity-75">({exp.paymentMethod})</span></td><td className="p-4 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td><td className="p-4 text-right"><button onClick={() => handleDeleteClick(exp.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td></tr>); })}{filteredExpenses.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-slate-400">No expenses found matching filters.</td></tr>)}</tbody></table></div></div></div><div className="space-y-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><PieChartIcon size={18} className="text-slate-400" /> Spending Breakdown</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value: number) => `${formatCurrency(value)}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} /><Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} /></PieChart></ResponsiveContainer></div></div></div></div>
      {isAddModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold dark:text-white">Record New Expense</h2><button onClick={() => setIsAddModalOpen(false)} className="text-2xl dark:text-slate-400">&times;</button></div><form onSubmit={handleAddExpense} className="space-y-4"><div><label className="text-sm dark:text-slate-300">Expense Title</label><input required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="e.g. Shop Rent, Office Supplies" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-sm dark:text-slate-300">Amount</label><input type="number" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} /></div><div><label className="text-sm dark:text-slate-300">Date</label><input type="date" required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} /></div></div><div><label className="text-sm dark:text-slate-300">Category</label><select required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newExpense.categoryId} onChange={e => setNewExpense({...newExpense, categoryId: e.target.value})}><option value="">Select Category</option>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="text-sm dark:text-slate-300">Deduct From Account</label><select required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newExpense.accountId} onChange={e => setNewExpense({...newExpense, accountId: e.target.value})}><option value="">Select Account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.currentBalance)})</option>)}</select></div><div><label className="text-sm dark:text-slate-300">Paid To (Optional)</label><input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newExpense.paidTo} onChange={e => setNewExpense({...newExpense, paidTo: e.target.value})} /></div><div><label className="text-sm dark:text-slate-300">Notes</label><textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={2} value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} /></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-500">Cancel</button><button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">Save Expense</button></div></form></div></div>)}
      {isCategoryModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold dark:text-white">Manage Categories</h2><button onClick={() => setIsCategoryModalOpen(false)} className="text-2xl dark:text-slate-400">&times;</button></div><div className="space-y-4 max-h-60 overflow-y-auto mb-4 border rounded p-2 dark:border-slate-700">{expenseCategories.map(c => (<div key={c.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded"><span className="dark:text-slate-200">{c.name}</span><button onClick={() => deleteExpenseCategory(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div>))}</div><form onSubmit={handleAddCategory} className="flex gap-2"><input required className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="New Category Name" value={newCategory} onChange={e => setNewCategory(e.target.value)} /><button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded">Add</button></form></div></div>)}
      
      {/* Confirmation Modal */}
      {confirmation.isOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={28} />
                  <h2 className="text-xl font-bold">{confirmation.title}</h2>
               </div>
               <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {confirmation.message}
               </p>
               <div className="flex justify-end gap-3">
                  <button 
                     onClick={() => setConfirmation({ ...confirmation, isOpen: false })}
                     className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={confirmation.onConfirm}
                     className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm"
                  >
                     Confirm
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ExpensesPage;