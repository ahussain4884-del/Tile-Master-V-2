
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Supplier, SupplierStatus, PurchaseInvoice } from '../types';
import { Plus, Search, ArrowLeft, CreditCard, Package, Phone, ChevronRight } from 'lucide-react';

const SuppliersPage: React.FC = () => {
  const { suppliers, products, purchases, ledgerEntries, accounts, addSupplier, addSupplierPayment, addPurchase, formatCurrency } = useStore();
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'LEDGER' | 'PURCHASES'>('PROFILE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ name: '', companyName: '', contactPerson: '', mobile: [''], email: '', address: '', openingBalance: 0, status: SupplierStatus.ACTIVE });
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseCart, setPurchaseCart] = useState<{productId: string, qty: number, cost: number}[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name || newSupplier.companyName || 'Unknown',
      companyName: newSupplier.companyName || '',
      contactPerson: newSupplier.contactPerson || '',
      mobile: newSupplier.mobile || [],
      email: newSupplier.email || '',
      address: newSupplier.address || '',
      openingBalance: Number(newSupplier.openingBalance),
      currentBalance: Number(newSupplier.openingBalance),
      status: newSupplier.status as SupplierStatus,
      notes: newSupplier.notes || ''
    };
    addSupplier(supplier);
    setIsAddModalOpen(false);
    setNewSupplier({ name: '', companyName: '', contactPerson: '', mobile: [''], email: '', address: '', openingBalance: 0, status: SupplierStatus.ACTIVE });
  };

  const handleCreatePurchase = () => {
    if (purchaseCart.length === 0) return;
    let total = 0;
    const items = purchaseCart.map(item => { const prod = products.find(p => p.id === item.productId); const itemTotal = item.qty * item.cost; total += itemTotal; return { productId: item.productId, productName: prod?.name || 'Unknown', quantity: item.qty, costPrice: item.cost, total: itemTotal }; });
    const purchase: PurchaseInvoice = { id: Date.now().toString(), date: new Date().toISOString(), supplierId: selectedSupplierId!, items, totalAmount: total, status: 'COMPLETED' };
    addPurchase(purchase);
    setIsPurchaseModalOpen(false);
    setPurchaseCart([]);
    setActiveTab('PURCHASES');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedSupplierId && paymentAccountId) { addSupplierPayment(selectedSupplierId, paymentAmount, paymentAccountId, new Date().toISOString(), paymentNote); setIsPaymentModalOpen(false); setPaymentAmount(0); setPaymentNote(''); } else { alert("Please select an account."); }
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const supplierLedger = ledgerEntries.filter(l => l.entityId === selectedSupplierId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const supplierPurchases = purchases.filter(p => p.supplierId === selectedSupplierId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

  if (view === 'DETAIL' && selectedSupplier) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"><button onClick={() => setView('LIST')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" /></button><div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedSupplier.companyName}</h1><div className="flex items-center gap-2 text-sm text-slate-500"><span className={`px-2 py-0.5 rounded-full text-xs ${selectedSupplier.status === SupplierStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedSupplier.status}</span><span>• {selectedSupplier.contactPerson}</span></div></div></div>
          <div className="flex items-center gap-3"><div className="text-right mr-4 hidden sm:block"><p className="text-xs text-slate-500 uppercase tracking-wide">Current Balance</p><p className={`text-xl font-bold ${selectedSupplier.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(selectedSupplier.currentBalance)}</p></div><button onClick={() => setIsPurchaseModalOpen(true)} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-brand-700"><Package size={18} /> Purchase</button><button onClick={() => setIsPaymentModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-emerald-700"><CreditCard size={18} /> Pay</button></div>
        </div>
        <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6">{['PROFILE', 'LEDGER', 'PURCHASES'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{tab === 'PROFILE' && 'Overview'}{tab === 'LEDGER' && 'Financial Ledger'}{tab === 'PURCHASES' && 'Purchase History'}</button>))}</div>
        <div className="min-h-[400px]">
          {activeTab === 'PROFILE' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4"><h3 className="font-semibold text-lg dark:text-white border-b pb-2 border-slate-100 dark:border-slate-700">Contact Details</h3><div className="grid grid-cols-[120px_1fr] gap-2 text-sm"><span className="text-slate-500">Name:</span> <span className="font-medium dark:text-slate-200">{selectedSupplier.name}</span><span className="text-slate-500">Phone:</span> <span className="font-medium dark:text-slate-200">{selectedSupplier.mobile.join(', ')}</span><span className="text-slate-500">Email:</span> <span className="font-medium dark:text-slate-200">{selectedSupplier.email || 'N/A'}</span><span className="text-slate-500">Address:</span> <span className="font-medium dark:text-slate-200">{selectedSupplier.address || 'N/A'}</span></div></div>
              <div className="space-y-4"><h3 className="font-semibold text-lg dark:text-white border-b pb-2 border-slate-100 dark:border-slate-700">Financials</h3><div className="grid grid-cols-[120px_1fr] gap-2 text-sm"><span className="text-slate-500">Opening Bal:</span> <span className="font-medium dark:text-slate-200">{formatCurrency(selectedSupplier.openingBalance)}</span><span className="text-slate-500">Current Bal:</span> <span className={`font-medium ${selectedSupplier.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(selectedSupplier.currentBalance)}</span></div></div>
            </div>
          )}
          {activeTab === 'LEDGER' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"><table className="w-full text-left border-collapse text-sm"><thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="p-3 text-slate-500 dark:text-slate-300">Date</th><th className="p-3 text-slate-500 dark:text-slate-300">Description</th><th className="p-3 text-slate-500 dark:text-slate-300 text-right">Debit</th><th className="p-3 text-slate-500 dark:text-slate-300 text-right">Credit</th><th className="p-3 text-slate-500 dark:text-slate-300 text-right">Balance</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{supplierLedger.map(entry => (<tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-3 dark:text-slate-300">{new Date(entry.date).toLocaleDateString()}</td><td className="p-3 dark:text-slate-300"><div className="font-medium">{entry.type}</div><div className="text-xs text-slate-500">{entry.description}</div></td><td className="p-3 text-right text-emerald-600">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td><td className="p-3 text-right text-red-600">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td><td className="p-3 text-right font-bold dark:text-slate-200">{formatCurrency(entry.balance)}</td></tr>))}</tbody></table></div>
          )}
          {activeTab === 'PURCHASES' && (
            <div className="space-y-4">{supplierPurchases.map(purchase => (<div key={purchase.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"><div><div className="font-bold text-lg dark:text-slate-200">Invoice #{purchase.id}</div><div className="text-sm text-slate-500">{new Date(purchase.date).toLocaleString()}</div></div><div className="text-right"><div className="font-bold text-xl text-brand-600 dark:text-brand-400">{formatCurrency(purchase.totalAmount)}</div></div></div>))}</div>
          )}
        </div>
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"><div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">New Purchase</h2><button onClick={() => setIsPurchaseModalOpen(false)}><span className="text-2xl dark:text-slate-300">&times;</span></button></div><div className="flex-1 overflow-y-auto p-6 space-y-6"><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Add Products</label><div className="flex gap-2"><select className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" onChange={(e) => { const prod = products.find(p => p.id === e.target.value); if(prod) { setPurchaseCart([...purchaseCart, { productId: prod.id, qty: 1, cost: prod.costPrice }]); } e.target.value = ''; }}><option value="">Select a Product...</option>{products.map(p => (<option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQty})</option>))}</select></div></div><table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-700 text-slate-500"><tr><th className="p-2">Product</th><th className="p-2 w-24">Qty</th><th className="p-2 w-24">Cost</th><th className="p-2 w-24 text-right">Total</th><th className="p-2 w-10"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{purchaseCart.map((item, idx) => { const prod = products.find(p => p.id === item.productId); return (<tr key={idx}><td className="p-2 dark:text-slate-200">{prod?.name}</td><td className="p-2"><input type="number" className="w-full p-1 border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white" value={item.qty} onChange={e => { const newCart = [...purchaseCart]; newCart[idx].qty = Number(e.target.value); setPurchaseCart(newCart); }} /></td><td className="p-2"><input type="number" className="w-full p-1 border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white" value={item.cost} onChange={e => { const newCart = [...purchaseCart]; newCart[idx].cost = Number(e.target.value); setPurchaseCart(newCart); }} /></td><td className="p-2 text-right dark:text-slate-200">{formatCurrency(item.qty * item.cost)}</td><td className="p-2 text-red-500 cursor-pointer" onClick={() => setPurchaseCart(purchaseCart.filter((_, i) => i !== idx))}>&times;</td></tr>); })}</tbody></table></div><div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl"><div className="text-xl font-bold dark:text-white">Total: {formatCurrency(purchaseCart.reduce((acc, item) => acc + (item.qty * item.cost), 0))}</div><button onClick={handleCreatePurchase} className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/20">Confirm Purchase</button></div></div></div>
        )}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6"><h2 className="text-xl font-bold mb-4 dark:text-white">Record Payment</h2><form onSubmit={handleAddPayment} className="space-y-4"><div><label className="text-sm dark:text-slate-300">Amount (PKR)</label><input required type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} /></div><div><label className="text-sm dark:text-slate-300">Pay From Account</label><select required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentAccountId} onChange={e => setPaymentAccountId(e.target.value)}><option value="">Select Source Account</option>{accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.currentBalance)})</option>))}</select></div><div><label className="text-sm dark:text-slate-300">Note</label><textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} /></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button><button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Save Payment</button></div></form></div></div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Supplier Management</h1><p className="text-slate-500 dark:text-slate-400">Manage vendors, ledgers, and purchases</p></div><button onClick={() => setIsAddModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"><Plus size={20} />Add Supplier</button></div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3"><Search className="text-slate-400" size={20} /><input type="text" placeholder="Search supplier..." className="bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider"><th className="p-4 font-semibold">Company / Name</th><th className="p-4 font-semibold">Contact</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Balance</th><th className="p-4 font-semibold text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{filteredSuppliers.map(s => (<tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { setSelectedSupplierId(s.id); setView('DETAIL'); }}><td className="p-4"><div className="font-semibold text-slate-800 dark:text-slate-200">{s.companyName}</div><div className="text-sm text-slate-500">{s.contactPerson}</div></td><td className="p-4"><div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400"><div className="flex items-center gap-2"><Phone size={14} /> {s.mobile[0]}</div></div></td><td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${s.status === SupplierStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span></td><td className="p-4"><span className={`font-bold ${s.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(s.currentBalance)}</span></td><td className="p-4 text-right"><button className="text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors"><ChevronRight size={18} /></button></td></tr>))}</tbody></table></div></div>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"><div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white">Add New Supplier</h2><button onClick={() => setIsAddModalOpen(false)}><span className="text-2xl dark:text-slate-300">&times;</span></button></div><form onSubmit={handleAddSupplier} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Company Name</label><input required type="text" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.companyName} onChange={e => setNewSupplier({...newSupplier, companyName: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Contact Person</label><input required type="text" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.contactPerson} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Mobile</label><input required type="text" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.mobile?.[0]} onChange={e => setNewSupplier({...newSupplier, mobile: [e.target.value]})} /></div><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Email</label><input type="email" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} /></div><div className="space-y-2 md:col-span-2"><label className="text-sm font-medium dark:text-slate-300">Address</label><input type="text" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} /></div><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Opening Balance</label><input type="number" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.openingBalance} onChange={e => setNewSupplier({...newSupplier, openingBalance: Number(e.target.value)})} /></div><div className="space-y-2"><label className="text-sm font-medium dark:text-slate-300">Status</label><select className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newSupplier.status} onChange={e => setNewSupplier({...newSupplier, status: e.target.value as SupplierStatus})}><option value={SupplierStatus.ACTIVE}>Active</option><option value={SupplierStatus.INACTIVE}>Inactive</option></select></div><div className="space-y-2 md:col-span-2"><label className="text-sm font-medium dark:text-slate-300">Notes</label><textarea className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={2} value={newSupplier.notes} onChange={e => setNewSupplier({...newSupplier, notes: e.target.value})} /></div><div className="md:col-span-2 pt-4 flex gap-3 justify-end"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg">Save Supplier</button></div></form></div></div>
      )}
    </div>
  );
};

export default SuppliersPage;
