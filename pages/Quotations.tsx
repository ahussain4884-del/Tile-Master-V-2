import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, CartItem, Quotation, ProductCategory, UnitType } from '../types';
import { Search, FileText, Plus, Printer, Trash2, Edit, CheckCircle, X, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoiceTemplate from '../components/InvoiceTemplate';

const QuotationsPage: React.FC = () => {
  const { quotations, products, customers, addQuotation, deleteQuotation, updateQuotation, loadQuotationToCart, posSettings, printerSettings, invoiceSettings } = useStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'LIST' | 'CREATE' | 'PREVIEW'>('LIST');
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [validityDays, setValidityDays] = useState(7);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
     isOpen: boolean;
     title: string;
     message: string;
     onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  const initCreate = () => { setCart([]); setSelectedCustomerId(''); setCustomerSearch(''); setValidityDays(7); setView('CREATE'); setTimeout(() => searchInputRef.current?.focus(), 100); };
  const addToCart = (product: Product) => { const existingIndex = cart.findIndex(c => c.id === product.id); if (existingIndex > -1) { const newCart = [...cart]; newCart[existingIndex].quantity += 1; recalculateItemTotal(newCart[existingIndex]); setCart(newCart); } else { const newItem: CartItem = { ...product, cartId: Date.now().toString(), quantity: 1, selectedUnit: product.unit, unitPrice: product.salePrice, discount: 0, total: product.salePrice }; setCart([...cart, newItem]); } };
  const handleUnitChange = (index: number, newUnit: UnitType) => { const newCart = [...cart]; const item = newCart[index]; if (item.category === ProductCategory.TILE && item.coveragePerBox) { if (newUnit === UnitType.SQFT) { item.unitPrice = item.salePrice / item.coveragePerBox; } else { item.unitPrice = item.salePrice; } } item.selectedUnit = newUnit; recalculateItemTotal(item); setCart(newCart); };
  const handleQuantityChange = (index: number, qty: number) => { if (qty < 0) return; const newCart = [...cart]; newCart[index].quantity = qty; recalculateItemTotal(newCart[index]); setCart(newCart); };
  const recalculateItemTotal = (item: CartItem) => { item.total = (item.quantity * item.unitPrice) - item.discount; };

  const saveQuotation = () => {
     if(cart.length === 0) { alert("Cart is empty"); return; }
     if(!selectedCustomerId) { alert("Select a customer"); return; }
     const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
     const tax = subtotal * (posSettings.taxRate / 100);
     const total = subtotal + tax;
     const newQ: Quotation = { id: activeQuotation?.id || '', date: new Date().toISOString(), validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(), customerId: selectedCustomerId, customerName: customers.find(c => c.id === selectedCustomerId)?.name, items: cart, subtotal, discount: 0, tax, total, status: 'PENDING', createdBy: 'Admin' };
     if(activeQuotation && activeQuotation.id) { updateQuotation(newQ); } else { addQuotation(newQ); }
     alert("Quotation Saved Successfully!"); setView('LIST'); setActiveQuotation(null);
  };

  const handleConvertToSaleClick = (q: Quotation) => {
     setConfirmation({
        isOpen: true,
        title: 'Convert to Sale',
        message: `Convert Quotation #${q.id} to Sale? This will load items into POS and redirect you.`,
        onConfirm: () => {
           loadQuotationToCart(q);
           navigate('/pos');
           setConfirmation({ ...confirmation, isOpen: false });
        }
     });
  };

  const handleDeleteClick = (id: string) => {
     setConfirmation({
        isOpen: true,
        title: 'Delete Quotation',
        message: 'Are you sure you want to delete this quotation? This action cannot be undone.',
        onConfirm: () => {
           deleteQuotation(id);
           setConfirmation({ ...confirmation, isOpen: false });
        }
     });
  };

  const handleViewPreview = (q: Quotation) => { setActiveQuotation(q); setView('PREVIEW'); };
  const handleEdit = (q: Quotation) => { if(q.status === 'CONVERTED') { alert("Cannot edit converted quotation."); return; } setActiveQuotation(q); setCart(q.items); setSelectedCustomerId(q.customerId); setCustomerSearch(q.customerName || ''); setView('CREATE'); };

  if (view === 'LIST') {
     return (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quotations</h1><p className="text-slate-500 dark:text-slate-400">Create and manage price estimates</p></div><button onClick={initCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 shadow-md"><Plus size={20} /> New Quotation</button></div>
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500"><tr><th className="p-4">Quotation #</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Valid Until</th><th className="p-4">Status</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{quotations.map(q => { const isExpired = new Date(q.validUntil) < new Date() && q.status === 'PENDING'; const displayStatus = isExpired ? 'EXPIRED' : q.status; return (<tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-4 font-mono font-medium dark:text-slate-300">{q.id}</td><td className="p-4 font-medium dark:text-slate-200">{q.customerName || q.customerId}</td><td className="p-4 dark:text-slate-400">{new Date(q.date).toLocaleDateString()}</td><td className="p-4 dark:text-slate-400">{new Date(q.validUntil).toLocaleDateString()}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${displayStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : displayStatus === 'CONVERTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{displayStatus}</span></td><td className="p-4 text-right font-bold dark:text-slate-200">${q.total.toLocaleString()}</td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleViewPreview(q)} className="p-2 text-slate-500 hover:bg-slate-100 rounded" title="View/Print"><Eye size={18} /></button>{q.status === 'PENDING' && !isExpired && (<><button onClick={() => handleEdit(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit size={18} /></button><button onClick={() => handleConvertToSaleClick(q)} className="p-2 text-green-500 hover:bg-green-50 rounded" title="Convert to Sale"><CheckCircle size={18} /></button></>)}<button onClick={() => handleDeleteClick(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={18} /></button></td></tr>); })}</tbody></table></div>
           
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
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-sm"
                       >
                          Confirm
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>
     );
  }

  if (view === 'CREATE') {
     return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-4 animate-in slide-in-from-right-4">
           <div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold dark:text-white">{activeQuotation ? `Edit ${activeQuotation.id}` : 'New Quotation'}</h2><button onClick={() => setView('LIST')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1"><X size={20} /> Cancel</button></div>
           <div className="flex flex-1 gap-4 overflow-hidden">
              <div className="w-1/2 flex flex-col gap-4"><div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={20} /><input ref={searchInputRef} className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Search Product..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div><div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 grid grid-cols-2 gap-3 content-start">{filteredProducts.map(p => (<div key={p.id} onClick={() => addToCart(p)} className="p-3 border rounded-lg cursor-pointer hover:border-brand-500 hover:shadow-sm bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600"><div className="font-bold text-sm dark:text-slate-200 line-clamp-1">{p.name}</div><div className="text-xs text-slate-500 flex justify-between mt-2"><span>Stock: {p.stockQty}</span><span className="font-bold text-brand-600">${p.salePrice}</span></div></div>))}</div></div>
              <div className="w-1/2 flex flex-col gap-4">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="relative"><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Customer</label><input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }} onFocus={() => setShowCustomerDropdown(true)} placeholder="Select Customer..." />{showCustomerDropdown && (<div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border shadow-xl z-20 max-h-40 overflow-y-auto rounded-b-lg">{filteredCustomers.map(c => (<div key={c.id} onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDropdown(false); }} className="p-2 hover:bg-slate-100 cursor-pointer text-sm">{c.name} ({c.mobile[0]})</div>))}</div>)}</div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Validity (Days)</label><select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={validityDays} onChange={e => setValidityDays(Number(e.target.value))}><option value={7}>7 Days</option><option value={15}>15 Days</option><option value={30}>30 Days</option></select></div>
                 </div>
                 <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-y-auto p-2"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 sticky top-0"><tr><th className="p-2">Item</th><th className="p-2 w-16">Unit</th><th className="p-2 w-14">Qty</th><th className="p-2 w-16 text-right">Total</th><th className="p-2 w-8"></th></tr></thead><tbody>{cart.map((item, idx) => (<tr key={idx} className="border-b dark:border-slate-700 last:border-0"><td className="p-2"><div className="truncate max-w-[150px] dark:text-slate-200">{item.name}</div><div className="text-xs text-slate-400">@{item.unitPrice}</div></td><td className="p-2">{item.category === ProductCategory.TILE ? (<select className="w-full bg-slate-100 rounded text-xs p-1" value={item.selectedUnit} onChange={(e) => handleUnitChange(idx, e.target.value as any)}><option value={UnitType.BOX}>Box</option><option value={UnitType.SQFT}>Sq.ft</option></select>) : <span className="text-xs text-slate-500">{item.unit}</span>}</td><td className="p-2"><input type="number" className="w-full bg-slate-100 rounded text-center p-1" value={item.quantity} onChange={e => handleQuantityChange(idx, Number(e.target.value))} /></td><td className="p-2 text-right font-bold">${item.total}</td><td className="p-2"><button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={16} /></button></td></tr>))}</tbody></table></div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="flex justify-between items-center text-lg font-bold dark:text-white mb-4"><span>Total Estimate</span><span className="text-brand-600">${cart.reduce((acc, item) => acc + item.total, 0).toLocaleString()}</span></div><button onClick={saveQuotation} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold flex justify-center items-center gap-2"><FileText size={20} /> Save Quotation</button></div>
              </div>
           </div>
        </div>
     );
  }

  if (view === 'PREVIEW' && activeQuotation) {
     return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold dark:text-white">Quotation Preview</h2><div className="flex gap-2"><button onClick={() => setView('LIST')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Close</button><button onClick={() => window.print()} className="px-4 py-2 bg-brand-600 text-white rounded-lg flex items-center gap-2 hover:bg-brand-700"><Printer size={18} /> Print</button></div></div>
           <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-8 overflow-auto flex justify-center"><div className="shadow-2xl"><InvoiceTemplate invoice={activeQuotation} settings={invoiceSettings} printer={printerSettings} mode="QUOTATION" /></div></div>
        </div>
     );
  }
  return <div></div>;
};

export default QuotationsPage;