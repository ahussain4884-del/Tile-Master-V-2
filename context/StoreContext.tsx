import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Supplier, Product, Invoice, StoreContextType, UnitType, ProductCategory, 
  PurchaseInvoice, StockLog, LedgerEntry, TransactionType, SupplierStatus, POSSettings,
  Account, AccountTransaction, AccountType, AccountTransactionType, ReturnInvoice, TransactionRecord, BarcodeSettings, Customer,
  Expense, ExpenseCategory, BackupRecord, BackupSettings, SystemLog, PrinterSettings, InvoiceSettings, Quotation, CartItem, Category,
  User, AuthLog, UserRole
} from '../types';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUPPLIERS: 'tilemaster_suppliers',
  CUSTOMERS: 'tilemaster_customers',
  PRODUCTS: 'tilemaster_products',
  INVOICES: 'tilemaster_invoices',
  HELD_INVOICES: 'tilemaster_held_invoices',
  QUOTATIONS: 'tilemaster_quotations',
  PURCHASES: 'tilemaster_purchases',
  LOGS: 'tilemaster_stocklogs',
  LEDGER: 'tilemaster_ledger',
  ACCOUNTS: 'tilemaster_accounts',
  ACCOUNT_TRANSACTIONS: 'tilemaster_account_transactions',
  RETURNS: 'tilemaster_returns',
  THEME: 'tilemaster_theme',
  SETTINGS: 'tilemaster_settings',
  BARCODE_SETTINGS: 'tilemaster_barcode_settings',
  EXPENSES: 'tilemaster_expenses',
  EXPENSE_CATEGORIES: 'tilemaster_expense_categories',
  BACKUP_SETTINGS: 'tilemaster_backup_settings',
  BACKUP_HISTORY: 'tilemaster_backup_history',
  PRINTER_SETTINGS: 'tilemaster_printer_settings',
  INVOICE_SETTINGS: 'tilemaster_invoice_settings',
  CATEGORIES: 'tilemaster_categories',
  USERS: 'tilemaster_users',
  AUTH_LOGS: 'tilemaster_auth_logs',
  CURRENT_USER: 'tilemaster_current_user'
};

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Administrator', username: 'admin', passwordHash: 'admin123', role: 'Admin', isActive: true, failedAttempts: 0, isLocked: false, createdAt: new Date().toISOString(), mobile: '03001234567', email: 'admin@tilemaster.com' },
  { id: 'u2', name: 'Store Manager', username: 'manager', passwordHash: 'manager123', role: 'Manager', isActive: true, failedAttempts: 0, isLocked: false, createdAt: new Date().toISOString(), mobile: '03007654321', email: 'manager@tilemaster.com' },
  { id: 'u3', name: 'Cashier One', username: 'cashier', passwordHash: 'cashier123', role: 'Cashier', isActive: true, failedAttempts: 0, isLocked: false, createdAt: new Date().toISOString(), mobile: '03211122334', email: 'cashier@tilemaster.com' },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_tile', name: 'Tiles', type: ProductCategory.TILE, prefix: 'TIL', defaultUnit: UnitType.BOX, taxRate: 0, attributes: { tile: true } },
  { id: 'cat_sanitary', name: 'Bathroom Accessories', type: ProductCategory.SANITARY, prefix: 'BAC', defaultUnit: UnitType.PCS, taxRate: 0, attributes: { sanitary: true } },
  { id: 'cat_bond', name: 'Tile Bond & Grout', type: ProductCategory.ACCESSORY, prefix: 'BON', defaultUnit: UnitType.PCS, taxRate: 0, attributes: { bond: true } },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_cash_1', name: 'Cash Drawer', type: AccountType.CASH, openingBalance: 0, currentBalance: 0, status: 'Active', description: 'Main Shop Counter' },
  { id: 'acc_bank_1', name: 'Main Bank Account', type: AccountType.BANK, bankName: 'Meezan Bank', openingBalance: 0, currentBalance: 0, status: 'Active', description: 'Business Account' }
];

const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat_rent', name: 'Rent' },
  { id: 'cat_utilities', name: 'Utility Bills' },
  { id: 'cat_salary', name: 'Employee Salary' },
  { id: 'cat_fuel', name: 'Transport & Fuel' },
  { id: 'cat_maint', name: 'Maintenance' },
  { id: 'cat_misc', name: 'Miscellaneous' },
];

const DEFAULT_SETTINGS: POSSettings = {
  shopName: 'TileMaster Shop',
  address: '123 Market Road, City',
  phone: '0300-0000000',
  footerText: 'Thank you for your business! No returns after 7 days.',
  printSize: '80mm',
  autoPrint: true,
  taxRate: 0
};

const DEFAULT_BARCODE_SETTINGS: BarcodeSettings = {
  defaultLabelSize: '80mm',
  showPrice: true,
  showName: true,
  showSKU: true,
  barcodeType: 'CODE128'
};

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  autoBackupEnabled: false,
  frequency: 'Weekly',
  time: '22:00',
  retentionCount: 5,
  location: 'Local'
};

const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  paperSize: '80mm',
  autoPrint: true,
  margins: { top: 0, right: 0, bottom: 0, left: 0 }
};

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  shopName: 'TileMaster Shop',
  address: '123 Market Road, City',
  phone: ['0300-0000000'],
  showManagerName: true,
  managerName: 'Manager',
  footerText: 'Thank you for your business!',
  mandatoryFooter: 'Software Developed By Aftab Hussain — 0344-4000007',
  showBarcode: true,
  showQRCode: true,
  showCustomerInfo: true,
  showDiscount: true,
  theme: 'Light',
  headerColor: '#4f46e5'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [heldInvoices, setHeldInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [returns, setReturns] = useState<ReturnInvoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [posSettings, setPosSettings] = useState<POSSettings>(DEFAULT_SETTINGS);
  const [barcodeSettings, setBarcodeSettings] = useState<BarcodeSettings>(DEFAULT_BARCODE_SETTINGS);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(DEFAULT_BACKUP_SETTINGS);
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);
  
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(DEFAULT_PRINTER_SETTINGS);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);

  const [cartFromQuotation, setCartFromQuotation] = useState<CartItem[] | null>(null);

  const formatCurrency = (amount: number) => {
    return '₨ ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const load = (key: string, setter: any, fallback: any) => {
      const stored = localStorage.getItem(key);
      if (stored) setter(JSON.parse(stored));
      else setter(fallback);
    };

    load(STORAGE_KEYS.SUPPLIERS, setSuppliers, []);
    load(STORAGE_KEYS.CUSTOMERS, setCustomers, []);
    load(STORAGE_KEYS.PRODUCTS, setProducts, []);
    load(STORAGE_KEYS.INVOICES, setInvoices, []);
    load(STORAGE_KEYS.HELD_INVOICES, setHeldInvoices, []);
    load(STORAGE_KEYS.QUOTATIONS, setQuotations, []);
    load(STORAGE_KEYS.PURCHASES, setPurchases, []);
    load(STORAGE_KEYS.LOGS, setStockLogs, []);
    load(STORAGE_KEYS.LEDGER, setLedgerEntries, []);
    load(STORAGE_KEYS.ACCOUNTS, setAccounts, DEFAULT_ACCOUNTS);
    load(STORAGE_KEYS.ACCOUNT_TRANSACTIONS, setAccountTransactions, []);
    load(STORAGE_KEYS.RETURNS, setReturns, []);
    load(STORAGE_KEYS.EXPENSES, setExpenses, []);
    load(STORAGE_KEYS.EXPENSE_CATEGORIES, setExpenseCategories, DEFAULT_EXPENSE_CATEGORIES);
    load(STORAGE_KEYS.CATEGORIES, setCategories, DEFAULT_CATEGORIES);
    load(STORAGE_KEYS.THEME, setTheme, 'light');
    load(STORAGE_KEYS.SETTINGS, setPosSettings, DEFAULT_SETTINGS);
    load(STORAGE_KEYS.BARCODE_SETTINGS, setBarcodeSettings, DEFAULT_BARCODE_SETTINGS);
    load(STORAGE_KEYS.BACKUP_SETTINGS, setBackupSettings, DEFAULT_BACKUP_SETTINGS);
    load(STORAGE_KEYS.BACKUP_HISTORY, setBackupHistory, []);
    load(STORAGE_KEYS.PRINTER_SETTINGS, setPrinterSettings, DEFAULT_PRINTER_SETTINGS);
    load(STORAGE_KEYS.INVOICE_SETTINGS, setInvoiceSettings, DEFAULT_INVOICE_SETTINGS);
    load(STORAGE_KEYS.USERS, setUsers, DEFAULT_USERS);
    load(STORAGE_KEYS.AUTH_LOGS, setAuthLogs, []);
    
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (sessionUser) {
       setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    localStorage.setItem(STORAGE_KEYS.HELD_INVOICES, JSON.stringify(heldInvoices));
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(stockLogs));
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledgerEntries));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TRANSACTIONS, JSON.stringify(accountTransactions));
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(expenseCategories));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(posSettings));
    localStorage.setItem(STORAGE_KEYS.BARCODE_SETTINGS, JSON.stringify(barcodeSettings));
    localStorage.setItem(STORAGE_KEYS.BACKUP_SETTINGS, JSON.stringify(backupSettings));
    localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(backupHistory));
    localStorage.setItem(STORAGE_KEYS.PRINTER_SETTINGS, JSON.stringify(printerSettings));
    localStorage.setItem(STORAGE_KEYS.INVOICE_SETTINGS, JSON.stringify(invoiceSettings));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.AUTH_LOGS, JSON.stringify(authLogs));

    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [suppliers, customers, products, invoices, heldInvoices, quotations, purchases, stockLogs, ledgerEntries, accounts, accountTransactions, returns, expenses, expenseCategories, categories, theme, posSettings, barcodeSettings, backupSettings, backupHistory, printerSettings, invoiceSettings, users, authLogs]);

  // ... [Auth Logic]
  const logAuthAction = (username: string, action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_RESET' | 'LOCKOUT', userId?: string) => {
     const log: AuthLog = { id: Date.now().toString(), username, userId, action, timestamp: new Date().toISOString() };
     setAuthLogs(prev => [log, ...prev]);
  };

  const login = async (username: string, passwordHash: string): Promise<{success: boolean, message?: string}> => {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email === username);
      if (!user) { logAuthAction(username, 'FAILED_LOGIN'); return { success: false, message: 'User not found.' }; }
      if (user.isLocked) { logAuthAction(user.username, 'FAILED_LOGIN', user.id); return { success: false, message: 'Account is locked.' }; }
      if (!user.isActive) { return { success: false, message: 'Account is disabled.' }; }
      if (user.passwordHash !== passwordHash) {
          const newFailCount = user.failedAttempts + 1;
          const isNowLocked = newFailCount >= 5;
          const msg = isNowLocked ? 'Account locked.' : 'Invalid password.';
          if(isNowLocked) logAuthAction(user.username, 'LOCKOUT', user.id); else logAuthAction(user.username, 'FAILED_LOGIN', user.id);
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, failedAttempts: newFailCount, isLocked: isNowLocked } : u));
          return { success: false, message: msg };
      }
      const updatedUser = { ...user, failedAttempts: 0, lastLogin: new Date().toISOString() };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      logAuthAction(user.username, 'LOGIN', user.id);
      return { success: true };
  };

  const logout = () => { if(currentUser) logAuthAction(currentUser.username, 'LOGOUT', currentUser.id); setCurrentUser(null); sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER); };
  const addUser = (u: User) => setUsers(prev => [...prev, u]);
  const updateUser = (u: User) => setUsers(prev => prev.map(user => user.id === u.id ? u : user));
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const resetUserPassword = (id: string, newPass: string) => {
     setUsers(prev => prev.map(u => u.id === id ? { ...u, passwordHash: newPass, failedAttempts: 0, isLocked: false } : u));
     const target = users.find(u => u.id === id);
     if(target && currentUser) logAuthAction(target.username, 'PASSWORD_RESET', currentUser.id); 
  };

  // ... [Settings Updates]
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const updatePOSSettings = (settings: POSSettings) => setPosSettings(settings);
  const updateBarcodeSettings = (settings: BarcodeSettings) => setBarcodeSettings(settings);
  const updateBackupSettings = (settings: BackupSettings) => setBackupSettings(settings);
  const updatePrinterSettings = (settings: PrinterSettings) => setPrinterSettings(settings);
  const updateInvoiceSettings = (settings: InvoiceSettings) => setInvoiceSettings(settings);

  // ... [Core Logic]
  const addAccount = (acc: Account) => { setAccounts(prev => [...prev, { ...acc, currentBalance: acc.openingBalance }]); if(acc.openingBalance > 0) registerAccountTransaction(acc.id, AccountTransactionType.CASH_IN, acc.openingBalance, 'Opening Balance', new Date().toISOString()); };
  const updateAccount = (acc: Account) => setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  const registerAccountTransaction = (accountId: string, type: AccountTransactionType, amount: number, description: string, date: string, refModule?: string, refId?: string, isSampleData?: boolean) => {
    setAccounts(prev => prev.map(a => { if (a.id === accountId) { return { ...a, currentBalance: (type === AccountTransactionType.CASH_IN || type === AccountTransactionType.TRANSFER_IN) ? a.currentBalance + amount : a.currentBalance - amount }; } return a; }));
    setAccountTransactions(prev => [{ id: Math.random().toString(36).substr(2, 9), accountId, type, amount, description, date, referenceModule: refModule as any, referenceId: refId, isSampleData }, ...prev]);
  };
  const transferFunds = (fromId: string, toId: string, amount: number, date: string, note: string) => { registerAccountTransaction(fromId, AccountTransactionType.TRANSFER_OUT, amount, `Transfer to ${accounts.find(a => a.id === toId)?.name}: ${note}`, date, 'TRANSFER'); registerAccountTransaction(toId, AccountTransactionType.TRANSFER_IN, amount, `Transfer from ${accounts.find(a => a.id === fromId)?.name}: ${note}`, date, 'TRANSFER'); };
  
  const addCustomer = (c: Customer) => setCustomers(prev => [...prev, c]);
  const updateCustomer = (c: Customer) => setCustomers(prev => prev.map(cust => cust.id === c.id ? c : cust));
  const deleteCustomer = (id: string) => { if(invoices.some(i => i.customerId === id)) { alert("Cannot delete customer with invoice history."); return; } setCustomers(prev => prev.filter(c => c.id !== id)); };
  const addCustomerPayment = (customerId: string, amount: number, accountId: string, date: string, note?: string) => { const c = customers.find(x => x.id === customerId); if(!c) return; updateCustomer({ ...c, currentBalance: c.currentBalance - amount }); setLedgerEntries(prev => [{ id: Date.now().toString(), date, entityId: customerId, type: TransactionType.PAYMENT_IN, description: `Payment Received ${note ? `(${note})` : ''}`, debit: 0, credit: amount, balance: c.currentBalance - amount }, ...prev]); registerAccountTransaction(accountId, AccountTransactionType.CASH_IN, amount, `Payment from ${c.name}`, date, 'CUSTOMER', customerId); };

  const addSupplier = (s: Supplier) => setSuppliers(prev => [...prev, s]);
  const updateSupplier = (s: Supplier) => setSuppliers(prev => prev.map(sup => sup.id === s.id ? s : sup));
  const deleteSupplier = (id: string) => { if(products.some(p => p.supplierId === id) || purchases.some(p => p.supplierId === id)) { alert("Cannot delete supplier with linked history."); return; } setSuppliers(prev => prev.filter(s => s.id !== id)); };
  const addSupplierPayment = (supplierId: string, amount: number, accountId: string, date: string, note?: string) => { const s = suppliers.find(x => x.id === supplierId); const a = accounts.find(x => x.id === accountId); if(!s || !a || a.currentBalance < amount) { alert("Invalid transaction"); return; } updateSupplier({ ...s, currentBalance: s.currentBalance - amount }); setLedgerEntries(prev => [{ id: Date.now().toString(), date, entityId: supplierId, type: TransactionType.PAYMENT_OUT, description: `Payment via ${a.name}`, debit: amount, credit: 0, balance: s.currentBalance - amount }, ...prev]); registerAccountTransaction(accountId, AccountTransactionType.CASH_OUT, amount, `Payment to ${s.companyName}`, date, 'SUPPLIER', supplierId); };

  const addProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
  const adjustProductStock = (productId: string, type: 'INCREASE' | 'DECREASE' | 'SET', quantity: number, reason: string, note: string) => { setProducts(prev => prev.map(p => { if(p.id === productId) { let newStock = p.stockQty; let diff = 0; if(type === 'INCREASE') { newStock += quantity; diff = quantity; } else if(type === 'DECREASE') { newStock -= quantity; diff = -quantity; } else { diff = quantity - p.stockQty; newStock = quantity; } setStockLogs(l => [{ id: Date.now().toString(), date: new Date().toISOString(), productId: p.id, type: TransactionType.ADJUSTMENT, qtyChange: diff, oldStock: p.stockQty, newStock, note: `${reason} ${note}`, referenceId: 'MANUAL_ADJUST', isSampleData: p.isSampleData }, ...l]); return { ...p, stockQty: newStock }; } return p; })); };
  const generateUniqueBarcode = (prefix: string = 'GEN'): string => {
    let code = '';
    let isUnique = false;
    while (!isUnique) { 
       code = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`; 
       isUnique = !products.some(p => p.barcode === code); 
    }
    return code;
  };
  
  const addPurchase = (p: PurchaseInvoice) => { setPurchases(prev => [p, ...prev]); setProducts(prods => { const newProds = [...prods]; p.items.forEach(item => { const idx = newProds.findIndex(x => x.id === item.productId); if(idx > -1) { const prod = newProds[idx]; newProds[idx] = { ...prod, stockQty: prod.stockQty + item.quantity }; setStockLogs(l => [{ id: Math.random().toString(), date: p.date, productId: prod.id, type: TransactionType.PURCHASE, qtyChange: item.quantity, oldStock: prod.stockQty, newStock: prod.stockQty + item.quantity, referenceId: p.id, isSampleData: p.isSampleData }, ...l]); } }); return newProds; }); setSuppliers(prev => prev.map(s => { if(s.id === p.supplierId) { const bal = s.currentBalance + p.totalAmount; setLedgerEntries(l => [{ id: Date.now().toString(), date: p.date, entityId: p.supplierId, type: TransactionType.PURCHASE, description: `Purchase #${p.id}`, debit: 0, credit: p.totalAmount, balance: bal, referenceId: p.id, isSampleData: p.isSampleData }, ...l]); return { ...s, currentBalance: bal }; } return s; })); };

  const createInvoice = (inv: Invoice) => {
    setInvoices(prev => [inv, ...prev]);
    setProducts(currentProducts => {
        const updatedProducts = [...currentProducts];
        inv.items.forEach(item => {
            const prodIndex = updatedProducts.findIndex(p => p.id === item.id);
            if (prodIndex > -1) {
                const prod = updatedProducts[prodIndex];
                let deductQty = item.quantity;
                if (prod.category === ProductCategory.TILE && item.selectedUnit === UnitType.SQFT && prod.coveragePerBox) { deductQty = item.quantity / prod.coveragePerBox; }
                updatedProducts[prodIndex] = { ...prod, stockQty: prod.stockQty - deductQty };
                setStockLogs(l => [{ id: Math.random().toString(), date: inv.date, productId: prod.id, type: TransactionType.SALE, qtyChange: -deductQty, oldStock: prod.stockQty, newStock: prod.stockQty - deductQty, referenceId: inv.id, isSampleData: inv.isSampleData }, ...l]);
            }
        });
        return updatedProducts;
    });
    if(inv.customerId) { setCustomers(prev => prev.map(c => { if (c.id === inv.customerId) { let bal = c.currentBalance + inv.total; if (inv.receivedAmount > 0) { bal -= inv.receivedAmount; setLedgerEntries(l => [{ id: Date.now().toString(), date: inv.date, entityId: c.id, type: TransactionType.PAYMENT_IN, description: `Payment for Inv #${inv.id}`, debit: 0, credit: inv.receivedAmount, balance: bal, isSampleData: inv.isSampleData }, { id: Date.now().toString()+'_sale', date: inv.date, entityId: c.id, type: TransactionType.SALE, description: `Invoice #${inv.id}`, debit: inv.total, credit: 0, balance: bal + inv.receivedAmount, isSampleData: inv.isSampleData }, ...l]); } else { setLedgerEntries(l => [{ id: Date.now().toString(), date: inv.date, entityId: c.id, type: TransactionType.SALE, description: `Invoice #${inv.id}`, debit: inv.total, credit: 0, balance: bal, isSampleData: inv.isSampleData }, ...l]); } return { ...c, currentBalance: bal }; } return c; })); }
    if(inv.receivedAmount > 0 && inv.receivedAmount > inv.changeAmount) { registerAccountTransaction('acc_cash_1', AccountTransactionType.CASH_IN, inv.receivedAmount - inv.changeAmount, `POS Sale #${inv.id}`, inv.date, 'POS', inv.id, inv.isSampleData); }
  };

  const holdInvoice = (inv: Invoice) => setHeldInvoices(prev => [...prev, { ...inv, status: 'HOLD' }]);
  const retrieveHeldInvoice = (id: string) => {};
  const deleteHeldInvoice = (id: string) => setHeldInvoices(prev => prev.filter(i => i.id !== id));

  const processSaleReturn = (ret: ReturnInvoice) => { setReturns(prev => [ret, ...prev]); setInvoices(prev => prev.map(inv => inv.id === ret.originalInvoiceId ? { ...inv, status: 'RETURNED' } : inv)); setProducts(prods => { const newProds = [...prods]; ret.items.forEach(item => { const idx = newProds.findIndex(x => x.id === item.productId); if(idx > -1) { const prod = newProds[idx]; let qty = item.quantity; if(prod.category === ProductCategory.TILE && item.unit === UnitType.SQFT && prod.coveragePerBox) { qty = item.quantity / prod.coveragePerBox; } newProds[idx] = { ...prod, stockQty: prod.stockQty + qty }; setStockLogs(l => [{ id: Math.random().toString(), date: ret.date, productId: prod.id, type: TransactionType.RETURN_IN, qtyChange: qty, oldStock: prod.stockQty, newStock: prod.stockQty + qty, referenceId: ret.id, note: 'Return', isSampleData: ret.isSampleData }, ...l]); } }); return newProds; }); if(ret.customerId) { setCustomers(prev => prev.map(c => { if(c.id === ret.customerId) { const bal = c.currentBalance - ret.totalRefund; setLedgerEntries(l => [{ id: Date.now().toString(), date: ret.date, entityId: c.id, type: TransactionType.RETURN_IN, description: `Return Inv #${ret.originalInvoiceId}`, debit: 0, credit: ret.totalRefund, balance: bal, isSampleData: ret.isSampleData }, ...l]); return { ...c, currentBalance: bal }; } return c; })); } if(ret.refundMethod === 'Cash' || ret.refundMethod === 'Bank') { registerAccountTransaction(ret.refundMethod === 'Cash' ? 'acc_cash_1' : 'acc_bank_1', AccountTransactionType.CASH_OUT, ret.totalRefund, `Refund Inv #${ret.originalInvoiceId}`, ret.date, 'RETURN', ret.id, ret.isSampleData); } };

  const addExpense = (e: Expense) => { setExpenses(prev => [e, ...prev]); if(e.accountId) registerAccountTransaction(e.accountId, AccountTransactionType.CASH_OUT, e.amount, e.title, e.date, 'EXPENSE', e.id, e.isSampleData); };
  const deleteExpense = (id: string) => { const exp = expenses.find(e => e.id === id); if(exp) { setExpenses(prev => prev.filter(e => e.id !== id)); if(exp.accountId) registerAccountTransaction(exp.accountId, AccountTransactionType.CASH_IN, exp.amount, `Reversal: ${exp.title}`, new Date().toISOString(), 'ADJUSTMENT', exp.id, exp.isSampleData); } };
  const addExpenseCategory = (name: string) => setExpenseCategories(prev => [...prev, { id: Date.now().toString(), name }]);
  const deleteExpenseCategory = (id: string) => setExpenseCategories(prev => prev.filter(c => c.id !== id));

  const addQuotation = (q: Quotation) => { if(!q.id) { q.id = `QTN-${Math.floor(1000 + Math.random() * 9000)}`; } setQuotations(prev => [q, ...prev]); };
  const updateQuotation = (q: Quotation) => setQuotations(prev => prev.map(o => o.id === q.id ? q : o));
  const deleteQuotation = (id: string) => setQuotations(prev => prev.filter(q => q.id !== id));
  const loadQuotationToCart = (q: Quotation) => { 
     setQuotations(prev => prev.map(i => i.id === q.id ? { ...i, status: 'CONVERTED' } : i)); 
     setCartFromQuotation(q.items); 
  };
  const clearCartFromQuotation = () => setCartFromQuotation(null);

  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const updateCategory = (c: Category) => setCategories(prev => prev.map(cat => cat.id === c.id ? c : cat));
  const deleteCategory = (id: string) => { if(products.some(p => p.category === id)) { alert("Cannot delete category with products"); return; } setCategories(prev => prev.filter(c => c.id !== id)); };

  const createBackup = () => { /* ... */ };
  const restoreBackup = async (file: File) => { /* ... */ };
  const generateExport = (type: any) => { /* ... */ };
  
  const generateSampleData = () => {
     if (products.some(p => p.isSampleData) || suppliers.some(s => s.isSampleData)) { return; }
     
     const newSuppliers: Supplier[] = [
        { id: 's_demo_1', name: 'Master Tiles Corp', companyName: 'Master Tiles Corp', contactPerson: 'Bilal Ahmed', mobile: ['03211234567'], email: 'sales@mastertiles.demo', address: 'Industrial Estate, Gujranwala', openingBalance: 0, currentBalance: 0, status: SupplierStatus.ACTIVE, isSampleData: true },
        { id: 's_demo_2', name: 'Sonex Sanitary', companyName: 'Sonex Sanitary', contactPerson: 'Kamran Akmal', mobile: ['03009876543'], email: 'info@sonex.demo', address: 'GT Road, Gujrat', openingBalance: 0, currentBalance: 0, status: SupplierStatus.ACTIVE, isSampleData: true },
        { id: 's_demo_3', name: 'Ravi Ceramics', companyName: 'Ravi Ceramics', contactPerson: 'Usman Ghani', mobile: ['03335554444'], email: 'usman@ravi.demo', address: 'Multan Road, Lahore', openingBalance: 0, currentBalance: 0, status: SupplierStatus.ACTIVE, isSampleData: true }
     ];
     const newCustomers: Customer[] = [
        { id: 'c_demo_1', name: 'Ahmed Construction', mobile: ['03001112233'], address: 'DHA Phase 6', city: 'Lahore', openingBalance: 0, currentBalance: 0, creditLimit: 100000, allowCredit: true, status: 'Active', createdAt: new Date().toISOString(), isSampleData: true },
        { id: 'c_demo_2', name: 'Sarah Khan (Designer)', mobile: ['03218889999'], address: 'Gulberg III', city: 'Lahore', openingBalance: 0, currentBalance: 0, creditLimit: 50000, allowCredit: true, status: 'Active', createdAt: new Date().toISOString(), isSampleData: true },
        { id: 'c_demo_3', name: 'BuildMax Developers', mobile: ['03337776666'], address: 'Bahria Town', city: 'Islamabad', openingBalance: 0, currentBalance: 0, creditLimit: 500000, allowCredit: true, status: 'Active', createdAt: new Date().toISOString(), isSampleData: true }
     ];
     const newProducts: Product[] = [
        { id: 'p_demo_1', name: 'Spanish Grey Floor Tile 24x24', category: ProductCategory.TILE, unit: UnitType.BOX, tilesPerBox: 4, coveragePerBox: 16, costPrice: 2200, salePrice: 2800, supplierId: 's_demo_1', stockQty: 0, minStockAlert: 20, barcode: 'TIL-890001', brand: 'Master', sku: 'SGF-24', tileAttributes: { size: '24x24', sqftPerTile: 4 }, isSampleData: true },
        { id: 'p_demo_2', name: 'Italian White Marble 12x24', category: ProductCategory.TILE, unit: UnitType.BOX, tilesPerBox: 8, coveragePerBox: 16, costPrice: 1800, salePrice: 2400, supplierId: 's_demo_3', stockQty: 0, minStockAlert: 15, barcode: 'TIL-890002', brand: 'Ravi', sku: 'IWM-12', tileAttributes: { size: '12x24', sqftPerTile: 2 }, isSampleData: true },
        { id: 'p_demo_4', name: 'Commode One Piece - Luxury', category: ProductCategory.SANITARY, unit: UnitType.SET, costPrice: 18000, salePrice: 24500, supplierId: 's_demo_2', stockQty: 0, minStockAlert: 3, barcode: 'BAC-890004', brand: 'Sonex', sku: 'COP-LX', sanitaryAttributes: { color: 'White', material: 'Ceramic', warranty: true }, isSampleData: true },
        { id: 'p_demo_6', name: 'Tile Bond 20kg', category: ProductCategory.ACCESSORY, unit: UnitType.PCS, costPrice: 500, salePrice: 800, supplierId: 's_demo_2', stockQty: 0, minStockAlert: 10, barcode: 'BON-890006', brand: 'Stile', sku: 'TB-20', bondAttributes: { weight: '20kg', color: 'Grey' }, isSampleData: true }
     ];
     
     const samplePurchases: PurchaseInvoice[] = [
        { id: 'pur_demo_1', date: new Date().toISOString(), supplierId: 's_demo_1', items: [{ productId: 'p_demo_1', productName: 'Spanish Grey Floor Tile 24x24', quantity: 100, costPrice: 2200, total: 220000 }], totalAmount: 220000, status: 'COMPLETED', isSampleData: true },
     ];
     newSuppliers[0].currentBalance += 220000;
     newProducts[0].stockQty += 100;

     // Set State
     setSuppliers(prev => [...prev, ...newSuppliers]);
     setCustomers(prev => [...prev, ...newCustomers]);
     setProducts(prev => [...prev, ...newProducts]);
     setPurchases(prev => [...prev, ...samplePurchases]);
     
     // Note: Simplified logic for demo generation to avoid complex Ledger setup in this snippet, 
     // but in full implementation it should mirror addPurchase logic.
  };

  const removeSampleData = () => { /* ... */ };

  const recentTransactions: TransactionRecord[] = useMemo(() => {
    const list: TransactionRecord[] = [];
    invoices.forEach(i => list.push({ id: i.id, date: i.date, type: TransactionType.SALE, description: `Sale to ${i.customerName || i.customerId} (Inv #${i.id})`, amount: i.total, user: 'Cashier', referenceId: i.id, module: 'POS', isSampleData: i.isSampleData }));
    purchases.forEach(p => list.push({ id: p.id, date: p.date, type: TransactionType.PURCHASE, description: `Purchase from ${suppliers.find(s=>s.id===p.supplierId)?.companyName}`, amount: p.totalAmount, user: 'Manager', referenceId: p.id, module: 'PURCHASE', isSampleData: p.isSampleData }));
    return list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, purchases]);

  return (
    <StoreContext.Provider value={{
      suppliers, customers, products, invoices, heldInvoices, purchases, stockLogs, ledgerEntries, 
      accounts, accountTransactions, returns, recentTransactions, expenses, expenseCategories, quotations, categories,
      theme, posSettings, barcodeSettings, backupSettings, backupHistory, printerSettings, invoiceSettings,
      cartFromQuotation, clearCartFromQuotation,
      toggleTheme, updatePOSSettings, updateBarcodeSettings, updateBackupSettings, updatePrinterSettings, updateInvoiceSettings,
      addSupplier, updateSupplier, deleteSupplier, addSupplierPayment,
      addCustomer, updateCustomer, deleteCustomer, addCustomerPayment,
      addProduct, updateProduct, adjustProductStock, addPurchase, generateUniqueBarcode,
      createInvoice, holdInvoice, retrieveHeldInvoice, deleteHeldInvoice,
      addQuotation, updateQuotation, deleteQuotation, loadQuotationToCart,
      addAccount, updateAccount, registerAccountTransaction, transferFunds,
      processSaleReturn,
      addExpense, deleteExpense, addExpenseCategory, deleteExpenseCategory,
      addCategory, updateCategory, deleteCategory,
      createBackup, restoreBackup, generateExport,
      generateSampleData, removeSampleData,
      formatCurrency,
      
      currentUser, users, authLogs, login, logout, addUser, updateUser, deleteUser, resetUserPassword
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};