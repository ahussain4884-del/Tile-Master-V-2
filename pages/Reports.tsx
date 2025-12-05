import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ReportCategory, ReportType, TransactionType, AccountTransactionType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend 
} from 'recharts';
import { 
  FileText, TrendingUp, TrendingDown, DollarSign, Package, Users, 
  Calendar, Filter, Printer, Download, ArrowLeft, AlertTriangle, PieChart as PieIcon, X
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

const ReportsPage: React.FC = () => {
  const { invoices, products, purchases, accountTransactions, suppliers, expenses, expenseCategories, stockLogs, ledgerEntries, formatCurrency } = useStore();
  
  const [activeCategory, setActiveCategory] = useState<ReportCategory | null>(null);
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // --- Helper: Date Filter ---
  const isInRange = (date: string) => { 
    return date >= dateRange.start && date <= dateRange.end; 
  };

  // --- Data Calculations ---

  // 1. Sales Data
  const salesData = useMemo(() => { 
    const filteredInvoices = invoices.filter(i => isInRange(i.date)); 
    const dailyData: Record<string, number> = {}; 
    filteredInvoices.forEach(inv => { 
      const day = new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
      dailyData[day] = (dailyData[day] || 0) + inv.total; 
    }); 
    return Object.entries(dailyData).map(([name, value]) => ({ name, value })); 
  }, [invoices, dateRange]);

  // 2. Category Data (Fix for Issue #1)
  const categoryData = useMemo(() => { 
    const filteredInvoices = invoices.filter(i => isInRange(i.date)); 
    const catData: Record<string, { total: number, qty: number }> = {}; 
    
    filteredInvoices.forEach(inv => { 
      inv.items.forEach(item => { 
        const cat = item.category || 'Uncategorized';
        if (!catData[cat]) catData[cat] = { total: 0, qty: 0 };
        catData[cat].total += item.total;
        catData[cat].qty += item.quantity;
      }); 
    }); 
    
    return Object.entries(catData)
      .map(([name, data]) => ({ name, value: data.total, qty: data.qty }))
      .sort((a, b) => b.value - a.value);
  }, [invoices, dateRange]);

  // 3. Low Stock (Fix for Issue #2)
  const lowStockData = useMemo(() => {
     return products.filter(p => p.stockQty <= p.minStockAlert);
  }, [products]);

  // 4. Stock Valuation
  const stockValuation = useMemo(() => { 
    let costValue = 0; 
    let saleValue = 0; 
    products.forEach(p => { 
      costValue += p.stockQty * p.costPrice; 
      saleValue += p.stockQty * p.salePrice; 
    }); 
    return { costValue, saleValue, profitPotential: saleValue - costValue }; 
  }, [products]);

  // 5. Supplier Ledger (Fix for Issue #3)
  const supplierReportData = useMemo(() => {
     return suppliers.map(s => {
        const totalPurchased = purchases.filter(p => p.supplierId === s.id).reduce((acc, p) => acc + p.totalAmount, 0);
        const totalPaid = ledgerEntries.filter(l => l.entityId === s.id && l.type === TransactionType.PAYMENT_OUT).reduce((acc, l) => acc + l.debit, 0);
        return { ...s, totalPurchased, totalPaid };
     });
  }, [suppliers, purchases, ledgerEntries]);

  // 6. Expense Report (Fix for Issue #4)
  const expenseReportData = useMemo(() => {
     const filteredExpenses = expenses.filter(e => isInRange(e.date));
     const byCategory: Record<string, number> = {};
     
     filteredExpenses.forEach(e => {
        const catName = expenseCategories.find(c => c.id === e.categoryId)?.name || 'Uncategorized';
        byCategory[catName] = (byCategory[catName] || 0) + e.amount;
     });

     const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
     return { list: filteredExpenses, chartData, total: filteredExpenses.reduce((acc, e) => acc + e.amount, 0) };
  }, [expenses, expenseCategories, dateRange]);

  // 7. Profit & Loss
  const profitLoss = useMemo(() => { 
    const filteredInvoices = invoices.filter(i => isInRange(i.date)); 
    const filteredExpensesList = accountTransactions.filter(t => isInRange(t.date) && t.type === AccountTransactionType.CASH_OUT && t.referenceModule !== 'SUPPLIER' && t.referenceModule !== 'TRANSFER'); 
    
    let totalRevenue = 0; 
    let totalCOGS = 0; 
    
    filteredInvoices.forEach(inv => { 
      totalRevenue += inv.total; 
      inv.items.forEach(item => { 
        const prod = products.find(p => p.id === item.id); 
        let costPerSoldUnit = prod ? prod.costPrice : 0; 
        if(prod && item.selectedUnit !== prod.unit && prod.coveragePerBox) { 
          costPerSoldUnit = prod.costPrice / prod.coveragePerBox; 
        } 
        totalCOGS += item.quantity * costPerSoldUnit; 
      }); 
    }); 
    
    const totalExpenses = filteredExpensesList.reduce((acc, t) => acc + t.amount, 0); 
    const grossProfit = totalRevenue - totalCOGS; 
    const netProfit = grossProfit - totalExpenses; 
    
    return { totalRevenue, totalCOGS, totalExpenses, grossProfit, netProfit }; 
  }, [invoices, products, accountTransactions, dateRange]);


  // --- Action Handlers ---

  const handleDownloadCSV = () => {
    let headers = '';
    let rows: string[] = [];
    let filename = `Report_${activeReport}_${dateRange.end}.csv`;

    if (activeReport === ReportType.DAILY_SALES) {
       headers = "Date,Invoice ID,Customer,Total Amount\n";
       rows = invoices.filter(i => isInRange(i.date)).map(inv => `${new Date(inv.date).toLocaleDateString()},${inv.id},${inv.customerName || inv.customerId},${inv.total}`);
    } else if (activeReport === ReportType.SUPPLIER_LEDGER) {
       headers = "Supplier,Total Purchased,Total Paid,Current Balance\n";
       rows = supplierReportData.map(s => `${s.companyName},${s.totalPurchased},${s.totalPaid},${s.currentBalance}`);
    } else if (activeReport === ReportType.LOW_STOCK) {
       headers = "Product,Category,Current Stock,Min Alert,Status\n";
       rows = lowStockData.map(p => `${p.name},${p.category},${p.stockQty},${p.minStockAlert},${p.stockQty <= 0 ? 'Critical' : 'Low'}`);
    } else if (activeReport === ReportType.EXPENSE_REPORT) {
       headers = "Date,Title,Category,Amount\n";
       rows = expenseReportData.list.map(e => `${new Date(e.date).toLocaleDateString()},${e.title},${expenseCategories.find(c=>c.id===e.categoryId)?.name},${e.amount}`);
    }

    if(rows.length > 0) {
       const csvContent = headers + rows.join("\n");
       const blob = new Blob([csvContent], { type: 'text/csv' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       a.click();
    } else {
       alert("No data to export for the selected report.");
    }
  };

  // --- UI Renderers ---

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <div onClick={() => { setActiveCategory(ReportCategory.SALES); setActiveReport(ReportType.DAILY_SALES); }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-500 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><TrendingUp size={24} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sales Reports</h3>
          <p className="text-sm text-slate-500 mt-2">Daily trend, category performance</p>
       </div>
       <div onClick={() => { setActiveCategory(ReportCategory.INVENTORY); setActiveReport(ReportType.LOW_STOCK); }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-500 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors"><Package size={24} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Inventory Reports</h3>
          <p className="text-sm text-slate-500 mt-2">Low stock, valuation, movement</p>
       </div>
       <div onClick={() => { setActiveCategory(ReportCategory.SUPPLIERS); setActiveReport(ReportType.SUPPLIER_LEDGER); }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-500 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors"><Users size={24} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Supplier Reports</h3>
          <p className="text-sm text-slate-500 mt-2">Ledger summary, balances</p>
       </div>
       <div onClick={() => { setActiveCategory(ReportCategory.ACCOUNTS); setActiveReport(ReportType.EXPENSE_REPORT); }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-500 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><DollarSign size={24} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Finance Reports</h3>
          <p className="text-sm text-slate-500 mt-2">Expenses, P&L, Cash Flow</p>
       </div>
    </div>
  );

  const renderReportContent = (isPrintMode = false) => {
     switch(activeReport) {
        // --- SALES REPORTS ---
        case ReportType.DAILY_SALES:
           return (
              <div className="space-y-6">
                 {!isPrintMode && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold mb-6 dark:text-white">Daily Sales Trend</h4>
                        <div className="h-80">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={salesData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                 <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                                 <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                 <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </div>
                 )}
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'border border-black'} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr><th className="p-3">Invoice #</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3 text-right">Items</th><th className="p-3 text-right">Total</th></tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {invoices.filter(i => isInRange(i.date)).map(inv => (
                             <tr key={inv.id} className={!isPrintMode ? "hover:bg-slate-50 dark:hover:bg-slate-700/50" : "border-b border-gray-300"}>
                                <td className="p-3 dark:text-slate-300">{inv.id}</td>
                                <td className="p-3 dark:text-slate-300">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="p-3 dark:text-slate-300">{inv.customerName || inv.customerId}</td>
                                <td className="p-3 text-right dark:text-slate-300">{inv.items.length}</td>
                                <td className="p-3 text-right font-bold dark:text-slate-200">{formatCurrency(inv.total)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        case ReportType.SALES_BY_CATEGORY:
           return (
              <div className="space-y-6">
                 {!isPrintMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                           <h4 className="font-bold mb-6 dark:text-white flex items-center gap-2"><PieIcon size={18} /> Revenue Share</h4>
                           <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                       {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                 </PieChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                    </div>
                 )}
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : ''}`}>
                    <h4 className="font-bold mb-4 dark:text-white">Category Performance</h4>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr><th className="p-2">Category</th><th className="p-2 text-right">Qty Sold</th><th className="p-2 text-right">Revenue</th></tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {categoryData.map((cat, idx) => (
                             <tr key={idx} className={isPrintMode ? "border-b border-gray-300" : ""}>
                                <td className="p-2 dark:text-slate-300">{cat.name}</td>
                                <td className="p-2 text-right dark:text-slate-400">{cat.qty}</td>
                                <td className="p-2 text-right font-bold dark:text-white">{formatCurrency(cat.value)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        // --- INVENTORY REPORTS ---
        case ReportType.LOW_STOCK:
           return (
              <div className="space-y-6">
                 {!isPrintMode && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-3">
                        <AlertTriangle className="text-red-600" size={24} />
                        <div>
                           <h4 className="font-bold text-red-800 dark:text-red-200">{lowStockData.length} Items Low on Stock</h4>
                           <p className="text-sm text-red-600 dark:text-red-300">These items are below their minimum alert level.</p>
                        </div>
                    </div>
                 )}
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'border border-black'} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr><th className="p-3">Product Name</th><th className="p-3">Category</th><th className="p-3 text-center">Alert Level</th><th className="p-3 text-center">Current Stock</th><th className="p-3 text-center">Status</th></tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {lowStockData.map(p => (
                             <tr key={p.id} className={!isPrintMode ? "hover:bg-slate-50 dark:hover:bg-slate-700/50" : "border-b border-gray-300"}>
                                <td className="p-3 font-medium dark:text-slate-200">{p.name}</td>
                                <td className="p-3 text-slate-500">{p.category}</td>
                                <td className="p-3 text-center">{p.minStockAlert}</td>
                                <td className="p-3 text-center font-bold dark:text-white">{p.stockQty}</td>
                                <td className="p-3 text-center">
                                   <span className={`px-2 py-1 rounded text-xs font-bold ${p.stockQty <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                      {p.stockQty <= 0 ? 'Critical' : 'Low'}
                                   </span>
                                </td>
                             </tr>
                          ))}
                          {lowStockData.length === 0 && (
                             <tr><td colSpan={5} className="p-8 text-center text-slate-400">Inventory is healthy. No low stock items.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        case ReportType.STOCK_VALUATION:
           return (
              <div className="space-y-6">
                 {!isPrintMode && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                           <p className="text-sm text-slate-500">Total Cost Value</p>
                           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(stockValuation.costValue)}</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                           <p className="text-sm text-slate-500">Total Sale Value</p>
                           <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{formatCurrency(stockValuation.saleValue)}</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                           <p className="text-sm text-slate-500">Potential Profit</p>
                           <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stockValuation.profitPotential)}</h3>
                        </div>
                    </div>
                 )}
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'border border-black'} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3 text-right">Stock Qty</th><th className="p-3 text-right">Cost Value</th><th className="p-3 text-right">Sale Value</th></tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {products.map(p => (
                             <tr key={p.id} className={isPrintMode ? "border-b border-gray-300" : ""}>
                                <td className="p-3 dark:text-slate-300">{p.name}</td>
                                <td className="p-3 dark:text-slate-300">{p.category}</td>
                                <td className="p-3 text-right dark:text-slate-300">{p.stockQty} {p.unit}</td>
                                <td className="p-3 text-right dark:text-slate-300">{formatCurrency(p.stockQty * p.costPrice)}</td>
                                <td className="p-3 text-right dark:text-slate-300">{formatCurrency(p.stockQty * p.salePrice)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        // --- SUPPLIER REPORTS ---
        case ReportType.SUPPLIER_LEDGER:
           return (
              <div className="space-y-6">
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'border border-black'} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr>
                             <th className="p-4">Supplier Name</th>
                             <th className="p-4">Contact</th>
                             <th className="p-4 text-right">Total Purchased</th>
                             <th className="p-4 text-right">Total Paid</th>
                             <th className="p-4 text-right">Current Balance</th>
                          </tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {supplierReportData.map(s => (
                             <tr key={s.id} className={!isPrintMode ? "hover:bg-slate-50 dark:hover:bg-slate-700/50" : "border-b border-gray-300"}>
                                <td className="p-4 font-bold dark:text-white">{s.companyName}</td>
                                <td className="p-4 text-slate-500">{s.contactPerson} ({s.mobile[0]})</td>
                                <td className="p-4 text-right dark:text-slate-300">{formatCurrency(s.totalPurchased)}</td>
                                <td className="p-4 text-right text-emerald-600">{formatCurrency(s.totalPaid)}</td>
                                <td className={`p-4 text-right font-bold ${s.currentBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                   {formatCurrency(s.currentBalance)}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        // --- FINANCE REPORTS ---
        case ReportType.EXPENSE_REPORT:
           return (
              <div className="space-y-6">
                 {!isPrintMode && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                           <p className="text-sm text-slate-500">Total Expenses</p>
                           <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(expenseReportData.total)}</h3>
                           <p className="text-xs text-slate-400 mt-1">{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</p>
                        </div>
                        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h4 className="font-bold mb-4 dark:text-white">Expense Breakdown</h4>
                            <div className="h-40 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={expenseReportData.chartData} layout="vertical">
                                     <XAxis type="number" hide />
                                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                     <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                     <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                  </BarChart>
                               </ResponsiveContainer>
                            </div>
                        </div>
                     </div>
                 )}
                 
                 <div className={`${!isPrintMode ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'border border-black'} overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                       <thead className={!isPrintMode ? "bg-slate-50 dark:bg-slate-700 text-slate-500" : "border-b border-black font-bold"}>
                          <tr><th className="p-3">Date</th><th className="p-3">Expense Title</th><th className="p-3">Category</th><th className="p-3">Paid Via</th><th className="p-3 text-right">Amount</th></tr>
                       </thead>
                       <tbody className={!isPrintMode ? "divide-y divide-slate-100 dark:divide-slate-700" : ""}>
                          {expenseReportData.list.map(e => {
                             const catName = expenseCategories.find(c => c.id === e.categoryId)?.name || '-';
                             return (
                                <tr key={e.id} className={isPrintMode ? "border-b border-gray-300" : ""}>
                                   <td className="p-3 dark:text-slate-300">{new Date(e.date).toLocaleDateString()}</td>
                                   <td className="p-3 font-medium dark:text-white">{e.title}</td>
                                   <td className="p-3 text-slate-500">{catName}</td>
                                   <td className="p-3 text-slate-500">{e.paymentMethod}</td>
                                   <td className="p-3 text-right font-bold text-red-600">{formatCurrency(e.amount)}</td>
                                </tr>
                             );
                          })}
                          {expenseReportData.list.length === 0 && (
                             <tr><td colSpan={5} className="p-8 text-center text-slate-400">No expenses recorded in this period.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           );

        case ReportType.PROFIT_LOSS:
           return (
             <div className={`${!isPrintMode ? 'max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700' : 'p-4 border border-black'}`}>
                <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Profit & Loss Statement</h2>
                   <p className="text-slate-500">{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</p>
                </div>
                <div className="space-y-4 text-sm">
                   <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 font-bold text-lg">
                      <span className="text-slate-700 dark:text-slate-200">Total Revenue (Sales)</span>
                      <span className="text-slate-800 dark:text-white">{formatCurrency(profitLoss.totalRevenue)}</span>
                   </div>
                   <div className="pl-4 space-y-2">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                         <span>Cost of Goods Sold</span>
                         <span>({formatCurrency(profitLoss.totalCOGS)})</span>
                      </div>
                   </div>
                   <div className="flex justify-between items-center py-3 border-t-2 border-slate-200 dark:border-slate-600 font-bold text-lg">
                      <span className="text-slate-700 dark:text-slate-200">Gross Profit</span>
                      <span className="text-brand-600 dark:text-brand-400">{formatCurrency(profitLoss.grossProfit)}</span>
                   </div>
                   <div className="py-2 font-bold text-slate-700 dark:text-slate-200">Operating Expenses</div>
                   <div className="pl-4 space-y-2 mb-4">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                         <span>Total Cash Expenses</span>
                         <span>({formatCurrency(profitLoss.totalExpenses)})</span>
                      </div>
                   </div>
                   <div className={`flex justify-between items-center py-4 border-t-2 border-slate-800 dark:border-slate-200 font-bold text-xl ${!isPrintMode ? 'bg-slate-50 dark:bg-slate-900 px-4 rounded-lg' : ''}`}>
                      <span className="text-slate-800 dark:text-white">Net Profit</span>
                      <span className={profitLoss.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(profitLoss.netProfit)}</span>
                   </div>
                </div>
             </div>
           );

        default:
           return <div className="text-center p-12 text-slate-400">Select a report to view details</div>;
     }
  };

  if (!activeCategory) { 
     return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports & Analytics</h1>
           </div>
           {renderDashboard()}
        </div>
     ); 
  }

  return (
    <div className="space-y-6 min-h-screen pb-10 animate-in fade-in duration-300">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <button onClick={() => { setActiveCategory(null); setActiveReport(null); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
             </button>
             <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeReport ? activeReport.replace(/_/g, ' ') : activeCategory}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{activeCategory} Report Module</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
             <Calendar size={18} className="text-slate-400 ml-2" />
             <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent border-none text-sm dark:text-white focus:ring-0" />
             <span className="text-slate-400">-</span>
             <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent border-none text-sm dark:text-white focus:ring-0" />
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
             <button onClick={() => setShowPrintPreview(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><Printer size={18} /></button>
             <button onClick={handleDownloadCSV} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><Download size={18} /></button>
          </div>
       </div>

       <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-700 pb-2">
          {activeCategory === ReportCategory.SALES && (
             <>
                <button onClick={() => setActiveReport(ReportType.DAILY_SALES)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.DAILY_SALES ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Daily Sales</button>
                <button onClick={() => setActiveReport(ReportType.SALES_BY_CATEGORY)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.SALES_BY_CATEGORY ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Category Summary</button>
             </>
          )}
          {activeCategory === ReportCategory.INVENTORY && (
             <>
                <button onClick={() => setActiveReport(ReportType.LOW_STOCK)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.LOW_STOCK ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Low Stock</button>
                <button onClick={() => setActiveReport(ReportType.STOCK_VALUATION)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.STOCK_VALUATION ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Stock Valuation</button>
             </>
          )}
          {activeCategory === ReportCategory.ACCOUNTS && (
             <>
                <button onClick={() => setActiveReport(ReportType.PROFIT_LOSS)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.PROFIT_LOSS ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Profit & Loss</button>
                <button onClick={() => setActiveReport(ReportType.EXPENSE_REPORT)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.EXPENSE_REPORT ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Expense Report</button>
             </>
          )}
          {activeCategory === ReportCategory.SUPPLIERS && (
              <button onClick={() => setActiveReport(ReportType.SUPPLIER_LEDGER)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeReport === ReportType.SUPPLIER_LEDGER ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>Supplier Ledger</button>
          )}
       </div>

       <div className="animate-in fade-in duration-300">
          {renderReportContent(false)}
       </div>

       {/* Print Preview Modal */}
       {showPrintPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
             <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-100">
                   <h3 className="font-bold text-lg text-slate-800">Print Preview - {activeReport?.replace(/_/g, ' ')}</h3>
                   <div className="flex gap-2">
                      <button onClick={() => setShowPrintPreview(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2"><Printer size={18} /> Print Now</button>
                   </div>
                </div>
                <div className="flex-1 overflow-auto p-8 bg-white text-black" ref={printRef}>
                   <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold uppercase mb-1">TileMaster POS</h1>
                      <h2 className="text-xl">{activeReport?.replace(/_/g, ' ')}</h2>
                      <p className="text-sm text-gray-500">{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</p>
                   </div>
                   {renderReportContent(true)}
                   <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                      Generated on {new Date().toLocaleString()}
                   </div>
                </div>
             </div>
          </div>
       )}

       <style>{`
          @media print {
             body * { visibility: hidden; }
             .fixed, .fixed * { visibility: visible; }
             .fixed { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: white; padding: 0; margin: 0; overflow: visible; }
             .fixed .bg-white { box-shadow: none; max-width: 100%; height: auto; }
             .fixed button { display: none !important; }
             .fixed .border-b { border-bottom: none !important; }
          }
       `}</style>
    </div>
  );
};

export default ReportsPage;