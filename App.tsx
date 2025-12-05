import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  Moon, 
  Sun,
  Menu,
  X,
  Wallet,
  FileBarChart,
  History,
  Barcode,
  UserCheck,
  AlertTriangle,
  TrendingDown,
  Database,
  Printer,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RotateCcw,
  List,
  Shield
} from 'lucide-react';

// Import Pages
import DashboardPage from './pages/Dashboard';
import SuppliersPage from './pages/Suppliers';
import InventoryPage from './pages/Inventory';
import POSPage from './pages/POS';
import SettingsPage from './pages/Settings';
import AccountsPage from './pages/Accounts';
import ExpensesPage from './pages/Expenses';
import ReportsPage from './pages/Reports';
import TransactionsPage from './pages/Transactions';
import BarcodesPage from './pages/Barcodes';
import CustomersPage from './pages/Customers';
import LowStockPage from './pages/LowStock';
import DataBackupPage from './pages/DataBackup';
import PrinterSettingsPage from './pages/PrinterSettings';
import QuotationsPage from './pages/Quotations';
import CategoriesPage from './pages/Categories';
import ReturnsPage from './pages/Returns';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPassword';

// --- Modern Sidebar Component ---
const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }: { isOpen: boolean, setIsOpen: (v: boolean) => void, collapsed: boolean, setCollapsed: (v: boolean) => void }) => {
  const location = useLocation();
  const { products, backupHistory, currentUser, logout } = useStore();
  
  // Badges Logic
  const lowStockCount = products.filter(p => p.stockQty <= p.minStockAlert).length;
  
  const lastBackupDate = backupHistory.length > 0 ? new Date(backupHistory[0].date).getDate() : 0;
  const todayDate = new Date().getDate();
  const backupNeeded = lastBackupDate !== todayDate;

  type NavItem = {
    path: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
    badgeColor?: string;
    badgeDot?: boolean;
    visible?: boolean;
  };

  const navItems: { section: string; items: NavItem[] }[] = [
    { section: 'Main', items: [
      { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { path: '/pos', icon: <ShoppingCart size={20} />, label: 'POS Sale' },
      { path: '/quotations', icon: <FileText size={20} />, label: 'Quotations' },
    ]},
    { section: 'Inventory', items: [
      { path: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
      { path: '/categories', icon: <List size={20} />, label: 'Categories' },
      { path: '/low-stock', icon: <AlertTriangle size={20} />, label: 'Low Stock', badge: lowStockCount, badgeColor: 'bg-red-500' },
      { path: '/barcodes', icon: <Barcode size={20} />, label: 'Barcodes' },
    ]},
    { section: 'People', items: [
      { path: '/customers', icon: <UserCheck size={20} />, label: 'Customers' },
      { path: '/suppliers', icon: <Users size={20} />, label: 'Suppliers' },
    ]},
    { section: 'Finance', items: [
      { path: '/transactions', icon: <History size={20} />, label: 'Transactions' },
      { path: '/accounts', icon: <Wallet size={20} />, label: 'Accounts' },
      { path: '/expenses', icon: <TrendingDown size={20} />, label: 'Expenses' },
      { path: '/returns', icon: <RotateCcw size={20} />, label: 'Refund/Return', badge: 0, badgeColor: 'bg-orange-500' }, 
    ]},
    { section: 'System', items: [
      { path: '/reports', icon: <FileBarChart size={20} />, label: 'Reports' },
      { path: '/backup', icon: <Database size={20} />, label: 'Backup & Restore', badge: backupNeeded ? 1 : 0, badgeDot: true, badgeColor: 'bg-blue-500' },
      { path: '/printer-settings', icon: <Printer size={20} />, label: 'Printer Config' },
      { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ]}
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-screen 
        bg-[#067fa1] dark:bg-[#1f2125] 
        text-white
        transition-[width] duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        rounded-r-2xl lg:rounded-none
      `}>
        
        {/* --- Branding Header --- */}
        <div className={`h-20 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-6'} border-b border-white/10`}>
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="w-10 h-10 min-w-[2.5rem] bg-white text-[#067fa1] dark:bg-gradient-to-br dark:from-cyan-500 dark:to-blue-600 dark:text-white rounded-xl flex items-center justify-center shadow-lg">
               <span className="font-bold text-lg">T</span>
             </div>
             {!collapsed && (
               <div className="flex flex-col animate-in fade-in duration-200">
                 <span className="font-bold text-lg tracking-tight leading-none">TileMaster</span>
                 <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest mt-1">POS System</span>
               </div>
             )}
          </div>
          {!collapsed && (
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50 hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>

        {/* --- Toggle Button (Desktop) --- */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 hidden lg:flex w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full items-center justify-center text-slate-500 hover:text-[#067fa1] shadow-sm z-50 hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* --- Navigation Items --- */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6 no-scrollbar">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="px-3">
              {!collapsed && (
                <h4 className="px-4 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider animate-in fade-in duration-300">
                  {group.section}
                </h4>
              )}
              <div className="space-y-1">
                {group.items.filter((i) => i.visible !== false).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-white/20 to-white/5 text-white shadow-inner border border-white/10 backdrop-blur-sm' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      {/* Active Glow Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                      )}

                      {/* Icon */}
                      <div className={`
                        transition-transform duration-200 group-hover:scale-110
                        ${isActive ? 'text-white drop-shadow-md' : 'text-white/70 group-hover:text-white'}
                      `}>
                        {item.icon}
                      </div>

                      {/* Label */}
                      {!collapsed && (
                        <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                          {item.label}
                        </span>
                      )}

                      {/* Collapsed Tooltip (Hover) */}
                      {collapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                          {item.label}
                        </div>
                      )}

                      {/* Badges */}
                      {!collapsed && item.badge && item.badge > 0 && (
                        <span className={`ml-auto ${item.badgeColor || 'bg-red-500'} ${item.badgeDot ? 'w-2.5 h-2.5 p-0' : 'px-1.5 py-0.5 text-[10px] min-w-[1.25rem]'} rounded-full text-white font-bold flex items-center justify-center shadow-sm border border-white/20`}>
                          {!item.badgeDot && item.badge}
                        </span>
                      )}
                      
                      {/* Collapsed Badge Dot */}
                      {collapsed && item.badge && item.badge > 0 && (
                        <span className={`absolute top-2 right-2 w-2.5 h-2.5 ${item.badgeColor || 'bg-red-500'} rounded-full border-2 border-[#067fa1] dark:border-[#1f2125]`}></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* --- User Profile Footer --- */}
        <div className={`p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm`}>
           <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border-2 border-white/30 shadow-sm">
                   <img src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random&color=fff`} alt="User" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#067fa1] dark:border-[#1f2125] rounded-full"></div>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                   <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                   <p className="text-xs text-white/50 truncate">{currentUser?.role}</p>
                </div>
              )}

              {!collapsed && (
                <button onClick={logout} className="text-white/50 hover:text-red-300 transition-colors">
                   <LogOut size={18} />
                </button>
              )}
           </div>
        </div>
      </aside>
    </>
  );
};

// --- Auth Guard ---
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- Layout Component ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
               Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            
            {/* Notification Bell (Visual Only) */}
            <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all relative">
               <AlertTriangle size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<RequireAuth><Layout><DashboardPage /></Layout></RequireAuth>} />
          <Route path="/suppliers" element={<RequireAuth><Layout><SuppliersPage /></Layout></RequireAuth>} />
          <Route path="/inventory" element={<RequireAuth><Layout><InventoryPage /></Layout></RequireAuth>} />
          <Route path="/pos" element={<RequireAuth><Layout><POSPage /></Layout></RequireAuth>} />
          <Route path="/quotations" element={<RequireAuth><Layout><QuotationsPage /></Layout></RequireAuth>} />
          <Route path="/transactions" element={<RequireAuth><Layout><TransactionsPage /></Layout></RequireAuth>} />
          <Route path="/accounts" element={<RequireAuth><Layout><AccountsPage /></Layout></RequireAuth>} />
          <Route path="/expenses" element={<RequireAuth><Layout><ExpensesPage /></Layout></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><Layout><ReportsPage /></Layout></RequireAuth>} />
          <Route path="/barcodes" element={<RequireAuth><Layout><BarcodesPage /></Layout></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Layout><SettingsPage /></Layout></RequireAuth>} />
          <Route path="/printer-settings" element={<RequireAuth><Layout><PrinterSettingsPage /></Layout></RequireAuth>} />
          <Route path="/customers" element={<RequireAuth><Layout><CustomersPage /></Layout></RequireAuth>} />
          <Route path="/low-stock" element={<RequireAuth><Layout><LowStockPage /></Layout></RequireAuth>} />
          <Route path="/backup" element={<RequireAuth><Layout><DataBackupPage /></Layout></RequireAuth>} />
          <Route path="/categories" element={<RequireAuth><Layout><CategoriesPage /></Layout></RequireAuth>} />
          <Route path="/returns" element={<RequireAuth><Layout><ReturnsPage /></Layout></RequireAuth>} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;