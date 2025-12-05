
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateBusinessInsight } from '../services/geminiService';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, subtext, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { suppliers, products, invoices, formatCurrency } = useStore();
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Quick Stats Calculation
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const lowStockCount = products.filter(p => p.stockQty < p.minStockAlert).length;
  const supplierBalance = suppliers.reduce((acc, s) => acc + s.currentBalance, 0);

  const handleGetInsight = async () => {
    setLoadingAi(true);
    const insight = await generateBusinessInsight(products, suppliers, invoices);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  // Mock data for chart
  const data = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Manager!</h1>
          <p className="opacity-90 max-w-xl">
            Here's what's happening in your store today. You have {lowStockCount} items running low on stock.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)}
          subtext="+12% from last month"
          icon={<DollarSign size={24} />}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Active Suppliers" 
          value={suppliers.length} 
          subtext={`${formatCurrency(supplierBalance)} Outstanding`}
          icon={<Users size={24} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          subtext="Requires attention"
          icon={<AlertTriangle size={24} />}
          color="bg-orange-500"
        />
        <StatCard 
          title="Sales Today" 
          value={invoices.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length} 
          subtext="Invoices generated"
          icon={<TrendingUp size={24} />}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
           <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Weekly Sales Overview</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₨ ${value}`} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => `₨ ${value}`} />
                 <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Gemini AI Widget */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-purple-300">
            <Sparkles size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">AI Business Analyst</span>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 text-sm text-slate-300 leading-relaxed no-scrollbar">
            {loadingAi ? (
              <div className="animate-pulse space-y-2">
                <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
              </div>
            ) : aiInsight ? (
              <div className="whitespace-pre-line">{aiInsight}</div>
            ) : (
              <p>Click below to analyze your store's data and get actionable insights using Gemini AI.</p>
            )}
          </div>

          <button 
            onClick={handleGetInsight}
            disabled={loadingAi}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
             {loadingAi ? 'Analyzing...' : 'Generate Insights'}
             {!loadingAi && <ArrowUpRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
