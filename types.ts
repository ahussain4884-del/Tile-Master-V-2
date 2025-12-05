
export enum UnitType {
  BOX = 'Box',
  SQFT = 'Sq.ft',
  PCS = 'Pcs',
  SET = 'Set'
}

export enum ProductCategory {
  TILE = 'Tile',
  SANITARY = 'Sanitary',
  ACCESSORY = 'Accessory'
}

export interface Category {
  id: string;
  name: string;
  type: ProductCategory;
  prefix: string;
  defaultUnit: UnitType;
  taxRate: number;
  attributes?: {
    tile?: boolean;
    sanitary?: boolean;
    bond?: boolean;
  };
}

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  PAYMENT_OUT = 'PAYMENT_OUT',
  PAYMENT_IN = 'PAYMENT_IN',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPENSE = 'EXPENSE',
  QUOTATION = 'QUOTATION'
}

export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export enum AccountType {
  CASH = 'Cash',
  BANK = 'Bank',
  WALLET = 'Wallet'
}

export enum AccountTransactionType {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT'
}

export enum ReportCategory {
  SALES = 'Sales',
  INVENTORY = 'Inventory',
  ACCOUNTS = 'Accounts & Finance',
  SUPPLIERS = 'Suppliers'
}

export enum ReportType {
  DAILY_SALES = 'DAILY_SALES',
  SALES_BY_CATEGORY = 'SALES_BY_CATEGORY',
  LOW_STOCK = 'LOW_STOCK',
  STOCK_VALUATION = 'STOCK_VALUATION',
  PROFIT_LOSS = 'PROFIT_LOSS',
  SUPPLIER_LEDGER = 'SUPPLIER_LEDGER',
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
  CASH_FLOW = 'CASH_FLOW'
}

export type LabelSize = '80mm' | '58mm' | 'A4';

export interface BarcodeSettings {
  defaultLabelSize: LabelSize;
  showPrice: boolean;
  showName: boolean;
  showSKU: boolean;
  barcodeType: 'CODE128' | 'EAN13';
}

export interface POSSettings {
  shopName: string;
  address: string;
  phone: string;
  footerText: string;
  printSize: '80mm' | '58mm' | 'A4';
  autoPrint: boolean;
  taxRate: number;
}

export interface PrinterSettings {
  paperSize: '80mm' | '58mm' | 'A4' | 'A5';
  autoPrint: boolean;
  margins: { top: number, right: number, bottom: number, left: number };
}

export interface InvoiceSettings {
  shopName: string;
  address: string;
  phone: string[];
  email?: string;
  website?: string;
  shopLogo?: string;
  showManagerName: boolean;
  managerName: string;
  footerText: string;
  mandatoryFooter: string;
  showBarcode: boolean;
  showQRCode: boolean;
  showCustomerInfo: boolean;
  showDiscount: boolean;
  theme: 'Light' | 'Dark';
  headerColor: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
  isSampleData?: boolean;
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  type: AccountTransactionType;
  amount: number;
  date: string;
  description: string;
  referenceId?: string;
  referenceModule?: 'POS' | 'SUPPLIER' | 'PURCHASE' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'CUSTOMER';
  isSampleData?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string[];
  email?: string;
  cnic?: string;
  address?: string;
  city?: string;
  openingBalance: number;
  currentBalance: number;
  creditLimit: number;
  allowCredit: boolean;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: string;
  isSampleData?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  mobile: string[];
  email?: string;
  address?: string;
  ntn?: string;
  status: SupplierStatus;
  notes?: string;
  openingBalance: number;
  currentBalance: number;
  isSampleData?: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  brand?: string;
  category: ProductCategory;
  size?: string;
  dimensions?: string;
  unit: UnitType;
  tilesPerBox?: number;
  coveragePerBox?: number;
  costPrice: number;
  salePrice: number;
  supplierId: string;
  stockQty: number;
  minStockAlert: number;
  barcode: string;
  imageUrl?: string;
  isSampleData?: boolean;
  
  // Dynamic Attributes
  tileAttributes?: { size: string, sqftPerTile?: number };
  sanitaryAttributes?: { color?: string, material?: string, warranty?: boolean };
  bondAttributes?: { weight?: string, color?: string };
}

export interface StockLog {
  id: string;
  date: string;
  productId: string;
  type: TransactionType;
  qtyChange: number;
  oldStock: number;
  newStock: number;
  referenceId?: string;
  note?: string;
  isSampleData?: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  entityId: string;
  type: TransactionType;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceId?: string;
  isSampleData?: boolean;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedUnit: UnitType;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface PaymentDetails {
  method: 'Cash' | 'Card' | 'Bank' | 'Cheque';
  amount: number;
}

export interface Invoice {
  id: string;
  date: string;
  customerId: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  receivedAmount: number;
  changeAmount: number;
  payments: PaymentDetails[];
  status: 'PAID' | 'HOLD' | 'RETURNED' | 'PARTIAL_RETURN';
  note?: string;
  isSampleData?: boolean;
}

export interface Quotation {
  id: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'CONVERTED' | 'EXPIRED';
  note?: string;
  terms?: string;
  createdBy: string;
  isSampleData?: boolean;
}

export interface PurchaseInvoice {
  id: string;
  date: string;
  supplierId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'COMPLETED' | 'PENDING';
  isSampleData?: boolean;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: UnitType;
  refundAmount: number;
  reason: string;
}

export interface ReturnInvoice {
  id: string;
  date: string;
  originalInvoiceId: string;
  customerId: string;
  items: ReturnItem[];
  totalRefund: number;
  refundMethod: 'Cash' | 'Credit' | 'Bank';
  note?: string;
  isSampleData?: boolean;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: TransactionType | AccountTransactionType;
  description: string;
  amount: number;
  user: string;
  referenceId?: string;
  status?: string;
  module: 'POS' | 'PURCHASE' | 'ACCOUNTS' | 'INVENTORY' | 'RETURN' | 'SUPPLIER' | 'CUSTOMER' | 'EXPENSE' | 'QUOTATION';
  isSampleData?: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isSampleData?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  date: string;
  accountId: string;
  paymentMethod: 'Cash' | 'Bank' | 'Other';
  paidTo?: string;
  notes?: string;
  addedBy: string;
  isSampleData?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isSampleData?: boolean;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  date: string;
  size: string;
  type: 'Manual' | 'Auto';
  location: string;
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  retentionCount: number;
  location: 'Local' | 'Drive';
}

// --- AUTH TYPES ---

export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface UserPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canPrint: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  mobile?: string;
  passwordHash: string; // In real app, verify hash. Here we simulate.
  role: UserRole;
  pin?: string;
  isActive: boolean;
  failedAttempts: number;
  lastLogin?: string;
  createdAt: string;
  isLocked: boolean;
  avatar?: string;
}

export interface AuthLog {
  id: string;
  userId?: string;
  username: string;
  action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_RESET' | 'LOCKOUT';
  timestamp: string;
  ip?: string;
}

export interface StoreContextType {
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  heldInvoices: Invoice[];
  quotations: Quotation[];
  purchases: PurchaseInvoice[];
  stockLogs: StockLog[];
  ledgerEntries: LedgerEntry[];
  accounts: Account[];
  accountTransactions: AccountTransaction[];
  returns: ReturnInvoice[];
  recentTransactions: TransactionRecord[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  categories: Category[];
  theme: 'light' | 'dark' | 'auto';
  posSettings: POSSettings;
  barcodeSettings: BarcodeSettings;
  backupSettings: BackupSettings;
  backupHistory: BackupRecord[];
  printerSettings: PrinterSettings;
  invoiceSettings: InvoiceSettings;
  
  // Auth State
  currentUser: User | null;
  users: User[];
  authLogs: AuthLog[];
  login: (username: string, password: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => void;
  
  toggleTheme: () => void;
  updatePOSSettings: (settings: POSSettings) => void;
  updateBarcodeSettings: (settings: BarcodeSettings) => void;
  updateBackupSettings: (settings: BackupSettings) => void;
  updatePrinterSettings: (settings: PrinterSettings) => void;
  updateInvoiceSettings: (settings: InvoiceSettings) => void;

  addAccount: (acc: Account) => void;
  updateAccount: (acc: Account) => void;
  registerAccountTransaction: (accountId: string, type: AccountTransactionType, amount: number, description: string, date: string, refModule?: string, refId?: string, isSampleData?: boolean) => void;
  transferFunds: (fromId: string, toId: string, amount: number, date: string, note: string) => void;

  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addSupplierPayment: (supplierId: string, amount: number, accountId: string, date: string, note?: string) => void;

  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
  addCustomerPayment: (customerId: string, amount: number, accountId: string, date: string, note?: string) => void;
  
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  adjustProductStock: (productId: string, type: 'INCREASE' | 'DECREASE' | 'SET', quantity: number, reason: string, note: string) => void;
  addPurchase: (purchase: PurchaseInvoice) => void;
  generateUniqueBarcode: (prefix?: string) => string;
  
  createInvoice: (inv: Invoice) => void;
  holdInvoice: (inv: Invoice) => void;
  retrieveHeldInvoice: (id: string) => void;
  deleteHeldInvoice: (id: string) => void;
  
  addQuotation: (q: Quotation) => void;
  updateQuotation: (q: Quotation) => void;
  deleteQuotation: (id: string) => void;
  loadQuotationToCart: (q: Quotation) => void;
  cartFromQuotation: CartItem[] | null; 
  clearCartFromQuotation: () => void;

  processSaleReturn: (ret: ReturnInvoice) => void;

  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addExpenseCategory: (name: string) => void;
  deleteExpenseCategory: (id: string) => void;

  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;

  createBackup: () => void;
  restoreBackup: (file: File) => Promise<void>;
  generateExport: (type: 'INVENTORY' | 'CUSTOMERS' | 'SALES') => void;

  generateSampleData: () => void;
  removeSampleData: () => void;
  
  formatCurrency: (amount: number) => string;
}
