
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer, TransactionType } from '../types';
import { 
  Users, Search, Plus, Phone, MapPin, CreditCard, DollarSign, 
  ArrowLeft, ChevronRight, FileText, CheckCircle, AlertCircle 
} from 'lucide-react';

const CustomersPage: React.FC = () => {
  const { customers, ledgerEntries, invoices, accounts, addCustomer, updateCustomer, addCustomerPayment, formatCurrency } = useStore();
  
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'LEDGER' | 'HISTORY'>('PROFILE');

  // List View State
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '', mobile: [''], address: '', city: '', openingBalance: 0, creditLimit: 0, allowCredit: true, status: 'Active'
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // --- Helpers ---
  
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const customerLedger = ledgerEntries
    .filter(l => l.entityId === selectedCustomerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const customerInvoices = invoices
    .filter(i => i.customerId === selectedCustomerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredCustomers = customers.filter(c => 
     c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.mobile.some(m => m.includes(searchTerm))
  );

  // --- Handlers ---

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name || 'Unknown',
      mobile: newCustomer.mobile || [],
      address: newCustomer.address,
      city: newCustomer.city,
      openingBalance: Number(newCustomer.openingBalance),
      currentBalance: Number(newCustomer.openingBalance),
      creditLimit: Number(newCustomer.creditLimit),
      allowCredit: newCustomer.allowCredit ?? true,
      status: newCustomer.status as any,
      createdAt: new Date().toISOString()
    };
    addCustomer(customer);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', mobile: [''], address: '', city: '', openingBalance: 0, creditLimit: 0, allowCredit: true, status: 'Active' });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedCustomerId && paymentAccountId) {
       addCustomerPayment(selectedCustomerId, paymentAmount, paymentAccountId, new Date().toISOString(), paymentNote);
       setIsPaymentModalOpen(false);
       setPaymentAmount(0);
       setPaymentNote('');
    }
  };

  // --- Render Detail View ---
  if (view === 'DETAIL' && selectedCustomer) {
     return (
       <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <button onClick={() => setView('LIST')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                  <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300"/>
               </button>
               <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                     <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedCustomer.status}</span>
                     <span>• {selectedCustomer.city || 'No City'}</span>
                  </div>
               </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                   <p className="text-xs text-slate-500 uppercase">Current Balance</p>
                   <p className={`text-xl font-bold ${selectedCustomer.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {formatCurrency(selectedCustomer.currentBalance)}
                   </p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                   <DollarSign size={18} /> Receive Payment
                </button>
             </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500">Total Purchase</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                   {formatCurrency(customerInvoices.reduce((acc, i) => acc + i.total, 0))}
                </h3>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500">Credit Limit</p>
                <div className="flex items-center gap-2 mt-1">
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(selectedCustomer.creditLimit)}</h3>
                   <span className={`text-xs px-2 py-1 rounded ${selectedCustomer.allowCredit ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedCustomer.allowCredit ? 'Allowed' : 'Blocked'}
                   </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${selectedCustomer.currentBalance > selectedCustomer.creditLimit ? 'bg-red-500' : 'bg-blue-500'}`} 
                     style={{ width: `${Math.min((selectedCustomer.currentBalance / (selectedCustomer.creditLimit || 1)) * 100, 100)}%` }}
                   ></div>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500">Last Payment</p>
                {(() => {
                   const lastPay = customerLedger.find(l => l.type === TransactionType.PAYMENT_IN);
                   return lastPay ? (
                      <div className="mt-1">
                         <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(lastPay.credit)}</h3>
                         <p className="text-xs text-slate-400">{new Date(lastPay.date).toLocaleDateString()}</p>
                      </div>
                   ) : (
                      <h3 className="text-xl font-bold text-slate-400 mt-1">No History</h3>
                   );
                })()}
             </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700">
             {['PROFILE', 'LEDGER', 'HISTORY'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab 
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                   }`}
                >
                   {tab === 'PROFILE' && 'Details'}
                   {tab === 'LEDGER' && 'Financial Ledger'}
                   {tab === 'HISTORY' && 'Invoice History'}
                </button>
             ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
             {activeTab === 'PROFILE' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                   <h3 className="font-bold mb-4 dark:text-white border-b pb-2 dark:border-slate-700">Customer Info</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                         <span className="text-slate-500">Full Name</span> <span className="font-medium dark:text-slate-200">{selectedCustomer.name}</span>
                         <span className="text-slate-500">Mobile</span> <span className="font-medium dark:text-slate-200">{selectedCustomer.mobile.join(', ')}</span>
                         <span className="text-slate-500">Address</span> <span className="font-medium dark:text-slate-200">{selectedCustomer.address || '-'}</span>
                         <span className="text-slate-500">City</span> <span className="font-medium dark:text-slate-200">{selectedCustomer.city || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                         <span className="text-slate-500">Opening Balance</span> <span className="font-medium dark:text-slate-200">{formatCurrency(selectedCustomer.openingBalance)}</span>
                         <span className="text-slate-500">Joined Date</span> <span className="font-medium dark:text-slate-200">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                         <span className="text-slate-500">Allow Credit</span> 
                         <span className={selectedCustomer.allowCredit ? 'text-green-600' : 'text-red-600'}>{selectedCustomer.allowCredit ? 'Yes' : 'No'}</span>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'LEDGER' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                         <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Debit (Sale)</th>
                            <th className="p-3 text-right">Credit (Pay)</th>
                            <th className="p-3 text-right">Balance</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                         {customerLedger.map(entry => (
                            <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                               <td className="p-3 dark:text-slate-300">{new Date(entry.date).toLocaleDateString()}</td>
                               <td className="p-3">
                                  <div className="font-medium dark:text-slate-200">{entry.type}</div>
                                  <div className="text-xs text-slate-500">{entry.description}</div>
                               </td>
                               <td className="p-3 text-right text-red-500">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                               <td className="p-3 text-right text-emerald-500">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                               <td className="p-3 text-right font-bold dark:text-slate-200">{formatCurrency(entry.balance)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}

             {activeTab === 'HISTORY' && (
                <div className="space-y-3">
                   {customerInvoices.map(inv => (
                      <div key={inv.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                         <div>
                            <div className="font-bold dark:text-white">Invoice #{inv.id}</div>
                            <div className="text-xs text-slate-500">{new Date(inv.date).toLocaleString()} • {inv.items.length} Items</div>
                         </div>
                         <div className="flex gap-4 text-right">
                             <div>
                                <div className="text-xs text-slate-400">Total</div>
                                <div className="font-bold dark:text-white">{formatCurrency(inv.total)}</div>
                             </div>
                             <div>
                                <div className="text-xs text-slate-400">Paid</div>
                                <div className="font-bold text-emerald-500">{formatCurrency(inv.receivedAmount)}</div>
                             </div>
                         </div>
                      </div>
                   ))}
                   {customerInvoices.length === 0 && <div className="p-8 text-center text-slate-400">No invoice history found.</div>}
                </div>
             )}
          </div>

          {/* Payment Modal */}
          {isPaymentModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                   <h2 className="text-xl font-bold mb-4 dark:text-white">Receive Payment</h2>
                   <form onSubmit={handleAddPayment} className="space-y-4">
                      <div>
                         <label className="text-sm dark:text-slate-300">Amount (PKR)</label>
                         <input required type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} />
                      </div>
                      <div>
                         <label className="text-sm dark:text-slate-300">Deposit To</label>
                         <select required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentAccountId} onChange={e => setPaymentAccountId(e.target.value)}>
                            <option value="">Select Account</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="text-sm dark:text-slate-300">Note</label>
                         <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                         <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500">Cancel</button>
                         <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Save Payment</button>
                      </div>
                   </form>
                </div>
             </div>
          )}
       </div>
     );
  }

  // --- Render List View ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customer Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Track balances, credit limits, and sales history</p>
         </div>
         <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Plus size={20} /> Add Customer
         </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
         <Search className="text-slate-400" size={20} />
         <input 
            type="text" 
            placeholder="Search customer name or mobile..."
            className="w-full bg-transparent outline-none dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <tr>
                     <th className="p-4">Customer</th>
                     <th className="p-4">City</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 text-right">Balance</th>
                     <th className="p-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredCustomers.map(c => (
                     <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { setSelectedCustomerId(c.id); setView('DETAIL'); }}>
                        <td className="p-4">
                           <div className="font-bold dark:text-slate-200">{c.name}</div>
                           <div className="text-xs text-slate-500">{c.mobile[0]}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{c.city || '-'}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                        </td>
                        <td className={`p-4 text-right font-bold ${c.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {formatCurrency(c.currentBalance)}
                        </td>
                        <td className="p-4 text-right">
                           <button className="text-brand-600 bg-brand-50 p-2 rounded hover:bg-brand-100">
                              <ChevronRight size={16} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold dark:text-white">Add New Customer</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-2xl dark:text-slate-400">&times;</button>
               </div>
               <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="text-sm dark:text-slate-300">Full Name</label>
                     <input required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-sm dark:text-slate-300">Mobile Number</label>
                     <input required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.mobile?.[0]} onChange={e => setNewCustomer({...newCustomer, mobile: [e.target.value]})} />
                  </div>
                  <div>
                     <label className="text-sm dark:text-slate-300">City</label>
                     <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-sm dark:text-slate-300">Opening Balance</label>
                     <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.openingBalance} onChange={e => setNewCustomer({...newCustomer, openingBalance: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-sm dark:text-slate-300">Address</label>
                     <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-sm dark:text-slate-300">Credit Limit</label>
                     <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={newCustomer.creditLimit} onChange={e => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})} />
                  </div>
                  <div className="flex items-end mb-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5" checked={newCustomer.allowCredit} onChange={e => setNewCustomer({...newCustomer, allowCredit: e.target.checked})} />
                        <span className="text-sm dark:text-slate-300">Allow Credit Sales</span>
                     </label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                     <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-500">Cancel</button>
                     <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded">Save Customer</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default CustomersPage;
