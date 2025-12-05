
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TransactionType, AccountTransactionType, ReturnInvoice, TransactionRecord } from '../types';
import { History, RotateCcw, Search, ArrowRight, CheckCircle, ShoppingBag, Truck, Wallet, TrendingDown, X } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const { recentTransactions, invoices, processSaleReturn, purchases, formatCurrency } = useStore();
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'RETURN'>('TIMELINE');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const [foundInvoice, setFoundInvoice] = useState<any | null>(null);
  const [returnItems, setReturnItems] = useState<{id: string, qty: number, reason: string}[]>([]);
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'Credit' | 'Bank'>('Cash');

  const handleViewTransaction = (record: TransactionRecord) => { setSelectedTransaction(record); setDetailModalOpen(true); };
  const loadInvoiceForReturn = (id: string) => { const inv = invoices.find(i => i.id === id); if (inv) { setFoundInvoice(inv); setReturnItems([]); setSearchInvoiceId(id); setActiveTab('RETURN'); setDetailModalOpen(false); } else { alert("Invoice not found!"); setFoundInvoice(null); } };
  const handleSearchInvoice = () => { loadInvoiceForReturn(searchInvoiceId.trim()); };
  const toggleReturnItem = (itemId: string) => { if (returnItems.find(i => i.id === itemId)) { setReturnItems(returnItems.filter(i => i.id !== itemId)); } else { setReturnItems([...returnItems, { id: itemId, qty: 1, reason: 'Defective' }]); } };
  const updateReturnItemQty = (itemId: string, qty: number) => { const originalItem = foundInvoice.items.find((i: any) => i.id === itemId); if(!originalItem) return; if(qty > originalItem.quantity) { alert(`Cannot return more than sold quantity (${originalItem.quantity})`); return; } setReturnItems(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i)); };
  const updateReturnReason = (itemId: string, reason: string) => { setReturnItems(prev => prev.map(i => i.id === itemId ? { ...i, reason } : i)); };
  const calculateTotalRefund = () => { if (!foundInvoice) return 0; return returnItems.reduce((acc, rItem) => { const original = foundInvoice.items.find((i: any) => i.id === rItem.id); if(!original) return acc; return acc + (original.unitPrice * rItem.qty); }, 0); };
  const handleSubmitReturn = () => { if (!foundInvoice || returnItems.length === 0) return; const returnInvoice: ReturnInvoice = { id: Date.now().toString(), date: new Date().toISOString(), originalInvoiceId: foundInvoice.id, customerId: foundInvoice.customerId, items: returnItems.map(ri => { const original = foundInvoice.items.find((i: any) => i.id === ri.id); return { productId: original.id, productName: original.name, quantity: ri.qty, unit: original.selectedUnit, refundAmount: original.unitPrice * ri.qty, reason: ri.reason }; }), totalRefund: calculateTotalRefund(), refundMethod, note: 'Processed via Transaction Module' }; processSaleReturn(returnInvoice); alert('Return Processed Successfully!'); setFoundInvoice(null); setSearchInvoiceId(''); setReturnItems([]); setActiveTab('TIMELINE'); };

  const getIcon = (type: any) => { if (type === TransactionType.SALE) return <ShoppingBag className="text-emerald-500" />; if (type === TransactionType.PURCHASE) return <Truck className="text-blue-500" />; if (type === TransactionType.RETURN_IN) return <RotateCcw className="text-orange-500" />; if (type === AccountTransactionType.CASH_OUT || type === TransactionType.EXPENSE) return <TrendingDown className="text-red-500" />; return <Wallet className="text-slate-500" />; };

  const renderTransactionDetails = () => {
     if(!selectedTransaction) return null;
     
     // SALE Detail
     if(selectedTransaction.type === TransactionType.SALE) {
        const inv = invoices.find(i => i.id === selectedTransaction.referenceId);
        if(!inv) return <div className="p-4 text-center text-slate-500">Invoice Data Not Found</div>;
        return (
           <div className="space-y-4">
               <div className="flex justify-between border-b pb-2 dark:border-slate-700 items-end">
                   <div>
                       <span className="text-xs text-slate-500 uppercase font-bold">Customer</span>
                       <div className="font-bold dark:text-white text-lg">{inv.customerName || inv.customerId}</div>
                   </div>
                   <div className="text-right">
                       <span className="text-xs text-slate-500 uppercase font-bold">Invoice #</span>
                       <div className="font-mono text-sm dark:text-slate-300">{inv.id}</div>
                   </div>
               </div>
               <div className="max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-600">
                  {inv.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-200 dark:border-slate-600 last:border-0">
                          <span className="dark:text-slate-300">{item.name} <span className="text-xs text-slate-500">x{item.quantity}</span></span>
                          <span className="font-medium dark:text-white">{formatCurrency(item.total)}</span>
                      </div>
                  ))}
               </div>
               <div className="flex justify-between pt-2 border-t dark:border-slate-700">
                   <span className="font-bold dark:text-white">Total</span>
                   <span className="font-bold text-emerald-600">{formatCurrency(inv.total)}</span>
               </div>
           </div>
        );
     }
     
     // PURCHASE Detail
     if(selectedTransaction.type === TransactionType.PURCHASE) {
         const pur = purchases.find(p => p.id === selectedTransaction.referenceId);
         if(!pur) return <div className="p-4 text-center text-slate-500">Purchase Data Not Found</div>;
         return (
            <div className="space-y-4">
               <div className="flex justify-between border-b pb-2 dark:border-slate-700 items-end">
                   <div>
                       <span className="text-xs text-slate-500 uppercase font-bold">Supplier</span>
                       <div className="font-bold dark:text-white text-lg">{pur.supplierId}</div>
                   </div>
                   <div className="text-right">
                       <span className="text-xs text-slate-500 uppercase font-bold">Ref #</span>
                       <div className="font-mono text-sm dark:text-slate-300">{pur.id}</div>
                   </div>
               </div>
               <div className="flex justify-between pt-2">
                   <span className="font-bold dark:text-white">Total Amount</span>
                   <span className="font-bold text-blue-600">{formatCurrency(pur.totalAmount)}</span>
               </div>
            </div>
         );
     }

     return (
         <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
             <p className="text-slate-600 dark:text-slate-300">{selectedTransaction.description}</p>
             <p className="text-xl font-bold mt-2 dark:text-white">{formatCurrency(selectedTransaction.amount)}</p>
         </div>
     );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400">View history and manage returns</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700">
            <button onClick={() => setActiveTab('TIMELINE')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'TIMELINE' ? 'bg-slate-100 dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Timeline</button>
            <button onClick={() => setActiveTab('RETURN')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'RETURN' ? 'bg-slate-100 dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>Process Return</button>
        </div>
      </div>

      {activeTab === 'TIMELINE' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {recentTransactions.map(t => (
                        <tr key={t.id} onClick={() => handleViewTransaction(t)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                            <td className="p-4 dark:text-slate-300">
                                <div>{new Date(t.date).toLocaleDateString()}</div>
                                <div className="text-xs text-slate-500">{new Date(t.date).toLocaleTimeString()}</div>
                            </td>
                            <td className="p-4"><div className="flex items-center gap-2">{getIcon(t.type)} <span className="dark:text-slate-300">{t.type}</span></div></td>
                            <td className="p-4 dark:text-slate-300">{t.description}</td>
                            <td className={`p-4 text-right font-bold ${t.type === TransactionType.SALE ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>{formatCurrency(t.amount)}</td>
                            <td className="p-4"><ArrowRight size={16} className="text-slate-400" /></td>
                        </tr>
                    ))}
                    {recentTransactions.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No transactions recorded yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'RETURN' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex gap-4 mb-6">
                <input 
                    className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                    placeholder="Enter Invoice ID" 
                    value={searchInvoiceId} 
                    onChange={e => setSearchInvoiceId(e.target.value)} 
                />
                <button onClick={handleSearchInvoice} className="bg-brand-600 text-white px-6 py-2 rounded-lg">Find Invoice</button>
            </div>
            
            {foundInvoice && (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h3 className="font-bold dark:text-white">Invoice #{foundInvoice.id}</h3>
                        <p className="text-sm text-slate-500">Date: {new Date(foundInvoice.date).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-y-2">
                        {foundInvoice.items.map((item: any) => {
                            const isSelected = returnItems.find(r => r.id === item.id);
                            return (
                                <div key={item.id} className={`p-3 border rounded-lg ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'dark:border-slate-600'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={!!isSelected} onChange={() => toggleReturnItem(item.id)} />
                                        <div className="flex-1 dark:text-slate-200">{item.name} (Qty: {item.quantity})</div>
                                    </div>
                                    {isSelected && (
                                        <div className="mt-2 pl-6 grid grid-cols-2 gap-4">
                                            <input 
                                                type="number" 
                                                className="p-1 border rounded dark:bg-slate-700 dark:text-white" 
                                                value={isSelected.qty} 
                                                onChange={e => updateReturnItemQty(item.id, Number(e.target.value))} 
                                                max={item.quantity} 
                                                min={1} 
                                            />
                                            <select 
                                                className="p-1 border rounded dark:bg-slate-700 dark:text-white" 
                                                value={isSelected.reason} 
                                                onChange={e => updateReturnReason(item.id, e.target.value)}
                                            >
                                                <option value="Defective">Defective</option>
                                                <option value="Wrong Item">Wrong Item</option>
                                                <option value="Return">Return</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                        <div className="text-lg font-bold dark:text-white">Refund Total: {formatCurrency(calculateTotalRefund())}</div>
                        <button onClick={handleSubmitReturn} className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">Process Return</button>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Modal for Details */}
      {detailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-xl relative">
                  <button onClick={() => setDetailModalOpen(false)} className="absolute top-4 right-4 text-slate-500"><X size={20} /></button>
                  <h3 className="text-xl font-bold mb-4 dark:text-white">Transaction Details</h3>
                  {renderTransactionDetails()}
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionsPage;
