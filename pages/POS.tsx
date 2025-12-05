
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, CartItem, Invoice, ProductCategory, UnitType } from '../types';
import { Search, ShoppingCart, Trash2, Printer, Save, User, PauseCircle, RotateCcw, CreditCard, Banknote, RefreshCcw, Box, Layers, AlertTriangle, CheckCircle, Eye, X } from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

const POSPage: React.FC = () => {
  const { products, createInvoice, holdInvoice, heldInvoices, retrieveHeldInvoice, deleteHeldInvoice, posSettings, invoices, customers, printerSettings, invoiceSettings, cartFromQuotation, clearCartFromQuotation, formatCurrency } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     if (cartFromQuotation && cartFromQuotation.length > 0) {
        setCart(JSON.parse(JSON.stringify(cartFromQuotation)));
        clearCartFromQuotation();
        alert("Quotation items loaded into cart.");
     }
  }, [cartFromQuotation]);

  useEffect(() => { const walkIn = customers.find(c => c.name === 'Walk-in Customer'); if(walkIn && !selectedCustomerId) { setSelectedCustomerId(walkIn.id); setCustomerSearch(walkIn.name); } }, [customers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); handleCheckoutClick(); }
      if (e.key === 'F3' && lastInvoice) { e.preventDefault(); window.print(); }
      if (e.key === 'F4') { e.preventDefault(); handleHold(); }
      if (e.key === 'F5') { e.preventDefault(); setIsHoldModalOpen(true); }
      if (e.key === 'Escape') { e.preventDefault(); setCart([]); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, selectedCustomerId, cashReceived, lastInvoice]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
      const scannedProduct = products.find(p => p.barcode === searchTerm);
      if (scannedProduct) { addToCart(scannedProduct); setSearchTerm(''); return; }
      const scannedInvoice = invoices.find(i => i.id === searchTerm);
      if (scannedInvoice) { alert(`Scanned Invoice #${scannedInvoice.id}. Go to Transactions to process return.`); setSearchTerm(''); return; }
    }
  };

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex(c => c.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      recalculateItemTotal(newCart[existingIndex]);
      setCart(newCart);
    } else {
      const newItem: CartItem = { ...product, cartId: Date.now().toString(), quantity: 1, selectedUnit: product.unit, unitPrice: product.salePrice, discount: 0, total: product.salePrice };
      setCart([...cart, newItem]);
    }
  };

  const handleUnitChange = (index: number, newUnit: UnitType) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (item.category === ProductCategory.TILE && item.coveragePerBox) {
      if (newUnit === UnitType.SQFT) { item.unitPrice = item.salePrice / item.coveragePerBox; item.quantity = 1; } else { item.unitPrice = item.salePrice; item.quantity = 1; }
    }
    item.selectedUnit = newUnit;
    recalculateItemTotal(item);
    setCart(newCart);
  };

  const handleQuantityChange = (index: number, qty: number) => { if (qty < 0) return; const newCart = [...cart]; newCart[index].quantity = qty; recalculateItemTotal(newCart[index]); setCart(newCart); };
  const recalculateItemTotal = (item: CartItem) => { item.total = (item.quantity * item.unitPrice) - item.discount; };
  const removeFromCart = (index: number) => { setCart(cart.filter((_, i) => i !== index)); };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * (posSettings.taxRate / 100);
  const total = subtotal + tax;
  const received = Number(cashReceived) || 0;
  const change = received - total;

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.mobile.some(m => m.includes(customerSearch)));
  const selectCustomer = (c: any) => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDropdown(false); };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (activeCustomer && !activeCustomer.allowCredit && received < total) { alert("This customer is blocked from credit sales. Full payment required."); return; }
    if (activeCustomer && activeCustomer.creditLimit > 0 && (activeCustomer.currentBalance + (total - received) > activeCustomer.creditLimit)) {
       setConfirmation({ isOpen: true, title: 'Credit Limit Exceeded', message: `This sale will exceed the customer's credit limit of ${formatCurrency(activeCustomer.creditLimit)}. Current Balance: ${formatCurrency(activeCustomer.currentBalance)}. Proceed?`, onConfirm: processCheckout });
       return;
    }
    processCheckout();
  };

  const processCheckout = () => {
    const invoice: Invoice = { id: Date.now().toString(), date: new Date().toISOString(), customerId: selectedCustomerId, customerName: activeCustomer?.name, items: cart, subtotal, discount: 0, tax, total, receivedAmount: received, changeAmount: change > 0 ? change : 0, payments: [{ method: 'Cash', amount: received > total ? total : received }], status: 'PAID' };
    createInvoice(invoice);
    setLastInvoice(invoice);
    if (printerSettings.autoPrint) { setTimeout(() => window.print(), 500); }
    setCart([]);
    setCashReceived('');
    setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleHold = () => { if (cart.length === 0) return; const invoice: Invoice = { id: Date.now().toString(), date: new Date().toISOString(), customerId: selectedCustomerId, customerName: activeCustomer?.name, items: cart, subtotal, discount: 0, tax, total, receivedAmount: 0, changeAmount: 0, payments: [], status: 'HOLD' }; holdInvoice(invoice); setCart([]); alert('Invoice Held!'); };
  const handleRetrieve = (inv: Invoice) => { setCart(inv.items); setSelectedCustomerId(inv.customerId); setCustomerSearch(inv.customerName || ''); deleteHeldInvoice(inv.id); setIsHoldModalOpen(false); };
  const filteredProducts = products.filter(p => { const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm); const matchesCat = activeCategory === 'All' || (activeCategory === 'Tiles' && p.category === ProductCategory.TILE) || (activeCategory === 'Sanitary' && p.category === ProductCategory.SANITARY); return matchesSearch && matchesCat; });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
      <div className="w-full lg:w-[40%] flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={20} /><input ref={searchInputRef} className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Scan Barcode or Search (F1)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleSearchKeyDown} /></div><div className="flex gap-2 overflow-x-auto no-scrollbar">{['All', 'Tiles', 'Sanitary', 'Accessory'].map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>{cat}</button>))}</div></div>
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-3"><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredProducts.map(p => (<div key={p.id} onClick={() => addToCart(p)} className="p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md cursor-pointer transition-all flex flex-col bg-slate-50 dark:bg-slate-700/30"><div className="text-xs font-bold text-slate-400 mb-1">{p.category}</div><h4 className="font-semibold text-sm line-clamp-2 dark:text-slate-200 leading-tight mb-2">{p.name}</h4><div className="mt-auto flex justify-between items-end"><div><div className="text-xs text-slate-500">Stock: {p.stockQty}</div><div className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(p.salePrice)}</div></div>{p.category === ProductCategory.TILE && <Layers size={16} className="text-orange-400"/>}{p.category === ProductCategory.SANITARY && <Box size={16} className="text-blue-400"/>}</div></div>))}</div></div>
      </div>
      <div className="w-full lg:w-[35%] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
         <div className="p-3 border-b border-slate-100 dark:border-slate-700 relative"><div className="flex items-center gap-2"><User size={18} className="text-slate-400" /><input className="flex-1 bg-transparent outline-none font-medium dark:text-white text-sm" value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }} onFocus={() => setShowCustomerDropdown(true)} placeholder="Search Customer..." />{activeCustomer && (<div className={`text-xs px-2 py-1 rounded font-bold ${activeCustomer.currentBalance > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Bal: {formatCurrency(activeCustomer.currentBalance)}</div>)}<button onClick={() => setIsHoldModalOpen(true)} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200">Drafts (F5)</button></div>{showCustomerDropdown && (<div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-xl z-20 max-h-60 overflow-y-auto rounded-b-lg">{filteredCustomers.map(c => (<div key={c.id} onClick={() => selectCustomer(c)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 last:border-0"><div className="font-bold text-sm dark:text-slate-200">{c.name}</div><div className="flex justify-between text-xs text-slate-500"><span>{c.mobile[0]}</span><span className={c.currentBalance > 0 ? 'text-red-500' : 'text-green-500'}>Bal: {formatCurrency(c.currentBalance)}</span></div></div>))}<div className="p-3 text-center text-brand-600 font-bold text-sm cursor-pointer hover:bg-slate-50" onClick={() => { alert('Please go to Customer Module to add new customer'); setShowCustomerDropdown(false); }}>+ Add New Customer</div></div>)}</div>
         {activeCustomer && activeCustomer.creditLimit > 0 && activeCustomer.currentBalance >= activeCustomer.creditLimit && (<div className="bg-red-50 text-red-600 p-2 text-xs flex items-center justify-center gap-2 font-bold"><AlertTriangle size={14} /> Credit Limit Exceeded ({formatCurrency(activeCustomer.creditLimit)})</div>)}
         <div className="flex-1 overflow-y-auto p-2"><table className="w-full text-left text-sm border-collapse"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 sticky top-0 z-10"><tr><th className="p-2 font-medium">Item</th><th className="p-2 font-medium w-16">Unit</th><th className="p-2 font-medium w-14">Qty</th><th className="p-2 font-medium w-16 text-right">Total</th><th className="p-2 w-8"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">{cart.map((item, idx) => (<tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30"><td className="p-2"><div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{item.name}</div><div className="text-xs text-slate-400">Rate: {formatCurrency(item.unitPrice)}{item.discount > 0 && <span className="text-red-500 ml-1">(-{formatCurrency(item.discount)})</span>}</div></td><td className="p-2">{item.category === ProductCategory.TILE ? (<select className="w-full bg-slate-100 dark:bg-slate-600 rounded text-xs p-1 outline-none border-none dark:text-white" value={item.selectedUnit} onChange={(e) => handleUnitChange(idx, e.target.value as UnitType)}><option value={UnitType.BOX}>Box</option><option value={UnitType.SQFT}>Sq.ft</option></select>) : (<span className="text-xs text-slate-500 px-1">{item.unit}</span>)}</td><td className="p-2"><input type="number" className="w-full bg-slate-100 dark:bg-slate-600 rounded text-center p-1 outline-none text-sm dark:text-white" value={item.quantity} onChange={(e) => handleQuantityChange(idx, Number(e.target.value))} /></td><td className="p-2 text-right font-bold text-slate-700 dark:text-slate-200">{formatCurrency(item.total)}</td><td className="p-2 text-center"><button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></td></tr>))}</tbody></table>{cart.length === 0 && (<div className="h-40 flex flex-col items-center justify-center text-slate-400"><ShoppingCart className="mb-2 opacity-50" /><span className="text-xs">Cart Empty</span></div>)}</div>
         <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 grid grid-cols-3 gap-2"><button onClick={() => setCart([])} className="flex flex-col items-center justify-center p-2 rounded hover:bg-red-50 text-red-600 text-xs gap-1"><Trash2 size={16} /> Clear (ESC)</button><button onClick={handleHold} className="flex flex-col items-center justify-center p-2 rounded hover:bg-orange-50 text-orange-600 text-xs gap-1"><PauseCircle size={16} /> Hold (F4)</button><button onClick={() => { if(lastInvoice) { setIsPreviewOpen(true); } else { alert("Make a sale first!"); } }} className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-blue-600 text-xs gap-1"><Eye size={16} /> Preview Last</button></div>
      </div>
      <div className="w-full lg:w-[25%] flex flex-col gap-4"><div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col h-full"><h3 className="font-bold text-lg dark:text-white mb-4">Payment Summary</h3><div className="space-y-3 mb-auto"><div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between text-slate-500 text-sm"><span>Tax ({posSettings.taxRate}%)</span><span>{formatCurrency(tax)}</span></div><div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div><div className="flex justify-between items-center"><span className="font-bold text-xl text-slate-800 dark:text-white">Total</span><span className="font-bold text-2xl text-brand-600 dark:text-brand-400">{formatCurrency(total)}</span></div>{activeCustomer && (<div className="text-xs text-right text-slate-500">New Balance: <span className="font-bold">{formatCurrency(activeCustomer.currentBalance + (total - received))}</span></div>)}</div><div className="mt-6 space-y-4"><div><label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Amount Received</label><div className="relative"><Banknote className="absolute left-3 top-3 text-slate-400" size={18} /><input type="number" className="w-full pl-10 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white font-bold text-lg outline-none focus:ring-2 focus:ring-brand-500" placeholder="0.00" value={cashReceived} onChange={e => setCashReceived(e.target.value)} /></div></div><div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center"><span className="text-sm font-medium text-slate-600 dark:text-slate-300">Change</span><span className={`font-bold text-lg ${change < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{change >= 0 ? formatCurrency(change) : '0.00'}</span></div><button onClick={handleCheckoutClick} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"><Save size={24} /> Checkout (F2)</button></div></div></div>
      {isHoldModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center"><h3 className="font-bold dark:text-white">Held Invoices</h3><button onClick={() => setIsHoldModalOpen(false)} className="text-2xl dark:text-slate-400">&times;</button></div><div className="max-h-96 overflow-y-auto p-2">{heldInvoices.length === 0 ? (<div className="text-center p-8 text-slate-500">No held invoices found.</div>) : (heldInvoices.map(inv => (<div key={inv.id} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50"><div><div className="font-bold dark:text-slate-200">{inv.customerName || inv.customerId}</div><div className="text-xs text-slate-500">{new Date(inv.date).toLocaleString()} • {inv.items.length} Items</div></div><div className="flex items-center gap-3"><span className="font-bold text-brand-600">{formatCurrency(inv.total)}</span><button onClick={() => handleRetrieve(inv)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><RotateCcw size={16} /></button></div></div>)))}</div></div></div>)}
      {isPreviewOpen && lastInvoice && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-slate-100 p-4 rounded-lg shadow-xl max-h-[90vh] overflow-auto"><div className="flex justify-between items-center mb-4"><h3 className="font-bold">Invoice Preview</h3><button onClick={() => setIsPreviewOpen(false)} className="px-4 py-1 bg-red-500 text-white rounded">Close</button></div><div className="bg-white shadow p-2"><InvoiceTemplate invoice={lastInvoice} settings={invoiceSettings} printer={printerSettings} /></div><div className="mt-4 flex justify-end"><button onClick={() => window.print()} className="bg-brand-600 text-white px-6 py-2 rounded flex items-center gap-2"><Printer size={18} /> Print Now</button></div></div></div>)}
      {confirmation.isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"><div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-400"><AlertTriangle size={28} /><h2 className="text-xl font-bold">{confirmation.title}</h2></div><p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{confirmation.message}</p><div className="flex justify-end gap-3"><button onClick={() => setConfirmation({ ...confirmation, isOpen: false })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button><button onClick={confirmation.onConfirm} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-sm">Proceed Anyway</button></div></div></div>)}
      <style>{`@media print { body * { visibility: hidden; } #invoice-print-area, #invoice-print-area * { visibility: visible; } #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div id="invoice-print-area" className="hidden">{lastInvoice && (<InvoiceTemplate invoice={lastInvoice} settings={invoiceSettings} printer={printerSettings} />)}</div>
    </div>
  );
};

export default POSPage;
