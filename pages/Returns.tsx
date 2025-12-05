import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ReturnInvoice, TransactionType, AccountTransactionType } from '../types';
import { History, RotateCcw, Search, ArrowRight, CheckCircle, ShoppingBag, Truck, Wallet, TrendingDown, X, AlertTriangle } from 'lucide-react';

const ReturnsPage: React.FC = () => {
  const { invoices, processSaleReturn, returns } = useStore();
  const [activeTab, setActiveTab] = useState<'NEW_RETURN' | 'HISTORY'>('NEW_RETURN');
  
  // Return Module State
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const [foundInvoice, setFoundInvoice] = useState<any | null>(null);
  const [returnItems, setReturnItems] = useState<{id: string, qty: number, reason: string}[]>([]);
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'Credit' | 'Bank'>('Cash');
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const handleSearchInvoice = () => {
    const inv = invoices.find(i => i.id === searchInvoiceId.trim());
    if (inv) {
      setFoundInvoice(inv);
      setReturnItems([]);
    } else {
      alert("Invoice not found!");
      setFoundInvoice(null);
    }
  };

  const toggleReturnItem = (itemId: string) => {
    if (returnItems.find(i => i.id === itemId)) {
      setReturnItems(returnItems.filter(i => i.id !== itemId));
    } else {
      setReturnItems([...returnItems, { id: itemId, qty: 1, reason: 'Defective' }]);
    }
  };

  const updateReturnItemQty = (itemId: string, qty: number) => {
    const originalItem = foundInvoice.items.find((i: any) => i.id === itemId);
    if(!originalItem) return;
    if(qty > originalItem.quantity) {
       alert(`Cannot return more than sold quantity (${originalItem.quantity})`);
       return;
    }
    setReturnItems(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i));
  };

  const updateReturnReason = (itemId: string, reason: string) => {
    setReturnItems(prev => prev.map(i => i.id === itemId ? { ...i, reason } : i));
  };

  const calculateTotalRefund = () => {
    if (!foundInvoice) return 0;
    return returnItems.reduce((acc, rItem) => {
       const original = foundInvoice.items.find((i: any) => i.id === rItem.id);
       if(!original) return acc;
       return acc + (original.unitPrice * rItem.qty); 
    }, 0);
  };

  const confirmReturn = () => {
    if (!foundInvoice || returnItems.length === 0) return;
    
    setConfirmation({
       isOpen: true,
       title: 'Confirm Return',
       message: `Process refund of $${calculateTotalRefund().toLocaleString()} via ${refundMethod}? This will update stock and ledgers.`,
       onConfirm: () => {
          const returnInvoice: ReturnInvoice = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            originalInvoiceId: foundInvoice.id,
            customerId: foundInvoice.customerId,
            items: returnItems.map(ri => {
               const original = foundInvoice.items.find((i: any) => i.id === ri.id);
               return {
                  productId: original.id,
                  productName: original.name,
                  quantity: ri.qty,
                  unit: original.selectedUnit,
                  refundAmount: original.unitPrice * ri.qty,
                  reason: ri.reason
               };
            }),
            totalRefund: calculateTotalRefund(),
            refundMethod,
            note: 'Processed via Returns Module'
          };

          processSaleReturn(returnInvoice);
          setFoundInvoice(null);
          setSearchInvoiceId('');
          setReturnItems([]);
          setActiveTab('HISTORY');
          setConfirmation({ ...confirmation, isOpen: false });
       }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Returns & Refunds</h1>
           <p className="text-slate-500 dark:text-slate-400">Process customer returns and view history</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
           <button 
             onClick={() => setActiveTab('NEW_RETURN')} 
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'NEW_RETURN' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm' : 'text-slate-500'}`}
           >
             <div className="flex items-center gap-2"><RotateCcw size={16} /> New Return</div>
           </button>
           <button 
             onClick={() => setActiveTab('HISTORY')} 
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
           >
             <div className="flex items-center gap-2"><History size={16} /> History</div>
           </button>
        </div>
      </div>

      {activeTab === 'NEW_RETURN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4">
           {/* Left: Search & Select */}
           <div className="lg:col-span-2 space-y-6">
              {/* Search Box */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <h3 className="font-bold mb-4 dark:text-white">Find Original Invoice</h3>
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Enter Invoice ID (e.g. 1740...)"
                      value={searchInvoiceId}
                      onChange={e => setSearchInvoiceId(e.target.value)}
                    />
                    <button onClick={handleSearchInvoice} className="bg-brand-600 text-white px-6 rounded-lg hover:bg-brand-700 flex items-center gap-2">
                       <Search size={20} /> Search
                    </button>
                 </div>
              </div>

              {/* Invoice Details & Item Selection */}
              {foundInvoice && (
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                       <div>
                          <h3 className="text-xl font-bold dark:text-white">Invoice #{foundInvoice.id}</h3>
                          <p className="text-slate-500 text-sm">Customer: {foundInvoice.customerId} • Date: {new Date(foundInvoice.date).toLocaleDateString()}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-xs uppercase text-slate-400 font-bold block">Original Total</span>
                          <span className="text-xl font-bold text-slate-800 dark:text-white">${foundInvoice.total.toLocaleString()}</span>
                       </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase tracking-wide">Select Items to Return</h4>
                    <div className="space-y-2">
                       {foundInvoice.items.map((item: any) => {
                          const isSelected = returnItems.find(i => i.id === item.id);
                          return (
                             <div key={item.id} className={`p-4 rounded-lg border transition-all ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}>
                                <div className="flex items-center gap-3">
                                   <input 
                                     type="checkbox" 
                                     className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                     checked={!!isSelected}
                                     onChange={() => toggleReturnItem(item.id)}
                                   />
                                   <div className="flex-1">
                                      <div className="flex justify-between">
                                         <h5 className="font-bold dark:text-slate-200">{item.name}</h5>
                                         <span className="font-medium text-slate-600 dark:text-slate-300">${item.unitPrice} / {item.selectedUnit}</span>
                                      </div>
                                      <div className="text-sm text-slate-500">Sold Qty: {item.quantity} {item.selectedUnit}</div>
                                   </div>
                                </div>
                                
                                {isSelected && (
                                   <div className="mt-4 pl-8 grid grid-cols-2 gap-4">
                                      <div>
                                         <label className="text-xs font-bold text-slate-500 mb-1 block">Return Qty</label>
                                         <input 
                                           type="number" 
                                           className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                           value={isSelected.qty}
                                           onChange={e => updateReturnItemQty(item.id, Number(e.target.value))}
                                           max={item.quantity}
                                           min={1}
                                         />
                                      </div>
                                      <div>
                                         <label className="text-xs font-bold text-slate-500 mb-1 block">Reason</label>
                                         <select 
                                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={isSelected.reason}
                                            onChange={e => updateReturnReason(item.id, e.target.value)}
                                         >
                                            <option value="Defective">Defective / Damaged</option>
                                            <option value="Wrong Item">Wrong Item</option>
                                            <option value="Customer Changed Mind">Changed Mind</option>
                                            <option value="Exchange">Exchange</option>
                                         </select>
                                      </div>
                                   </div>
                                )}
                             </div>
                          );
                       })}
                    </div>
                 </div>
              )}
           </div>

           {/* Right: Summary */}
           <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit sticky top-6">
                 <h3 className="font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Refund Summary</h3>
                 
                 <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Items Returned</span>
                       <span className="font-medium dark:text-white">{returnItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Total Refund Amount</span>
                       <span className="font-bold text-xl text-orange-600">${calculateTotalRefund().toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Refund Method</label>
                    <select 
                       className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                       value={refundMethod}
                       onChange={(e) => setRefundMethod(e.target.value as any)}
                    >
                       <option value="Cash">Cash Refund</option>
                       <option value="Credit">Store Credit</option>
                       <option value="Bank">Bank Transfer</option>
                    </select>
                 </div>

                 <button 
                   onClick={confirmReturn}
                   disabled={!foundInvoice || returnItems.length === 0}
                   className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 shadow-lg ${!foundInvoice || returnItems.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                 >
                    <CheckCircle size={20} /> Confirm Return
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                  <tr>
                     <th className="p-4">Return ID</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Original Invoice</th>
                     <th className="p-4">Customer</th>
                     <th className="p-4 text-right">Refund Amount</th>
                     <th className="p-4 text-right">Method</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {returns.map(ret => (
                     <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{ret.id}</td>
                        <td className="p-4 dark:text-slate-300">{new Date(ret.date).toLocaleDateString()}</td>
                        <td className="p-4 text-brand-600 font-medium">#{ret.originalInvoiceId}</td>
                        <td className="p-4 dark:text-slate-200">{ret.customerId || 'Walk-in'}</td>
                        <td className="p-4 text-right font-bold text-orange-600">${ret.totalRefund.toLocaleString()}</td>
                        <td className="p-4 text-right">
                           <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">{ret.refundMethod}</span>
                        </td>
                     </tr>
                  ))}
                  {returns.length === 0 && (
                     <tr><td colSpan={6} className="p-8 text-center text-slate-400">No return history found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      )}

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
                     className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-sm"
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

export default ReturnsPage;