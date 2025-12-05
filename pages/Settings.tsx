import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, Printer, Store as StoreIcon, Keyboard, User, Barcode, Database, AlertTriangle, CheckCircle, Trash2, X, Shield } from 'lucide-react';
import { LabelSize } from '../types';
import UsersPage from './Users'; // Import Users Module

const SettingsPage: React.FC = () => {
  const { posSettings, updatePOSSettings, barcodeSettings, updateBarcodeSettings, generateSampleData, removeSampleData, products, customers, suppliers, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'POS' | 'BARCODE' | 'ROLES' | 'SAMPLE_DATA'>('GENERAL');
  
  const [posForm, setPosForm] = useState(posSettings);
  const [barcodeForm, setBarcodeForm] = useState(barcodeSettings);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
     isOpen: boolean;
     title: string;
     message: string;
     action: 'GENERATE' | 'REMOVE' | null;
  }>({ isOpen: false, title: '', message: '', action: null });

  const sampleCount = products.filter(p => p.isSampleData).length + customers.filter(c => c.isSampleData).length + suppliers.filter(s => s.isSampleData).length;

  const handlePosChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setPosForm({ ...posForm, [e.target.name]: val });
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
     setBarcodeForm({ ...barcodeForm, [e.target.name]: val });
  };

  const handleSave = () => {
    updatePOSSettings(posForm);
    updateBarcodeSettings(barcodeForm);
    alert('Settings Saved Successfully!');
  };

  const handleGenerateClick = () => {
     setConfirmModal({
        isOpen: true,
        title: 'Generate Sample Data',
        message: 'This will add demo data (Products, Customers, Sales, etc.) to your system. This is for testing purposes. Continue?',
        action: 'GENERATE'
     });
  };

  const handleRemoveClick = () => {
     setConfirmModal({
        isOpen: true,
        title: 'Remove Sample Data',
        message: 'Are you sure? This will delete all records marked as "Sample Data". Your real business data will remain safe.',
        action: 'REMOVE'
     });
  };

  const confirmAction = () => {
     if (confirmModal.action === 'GENERATE') {
        generateSampleData();
     } else if (confirmModal.action === 'REMOVE') {
        removeSampleData();
     }
     setConfirmModal({ ...confirmModal, isOpen: false, action: null });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Settings</h1>
        {activeTab !== 'ROLES' && (
           <button 
             onClick={handleSave}
             className="bg-brand-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 shadow-md transition-all active:scale-95"
           >
             <Save size={20} /> Save Changes
           </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {[
            { id: 'GENERAL', label: 'General', icon: <StoreIcon size={18} /> },
            { id: 'POS', label: 'POS & Printer', icon: <Printer size={18} /> },
            { id: 'BARCODE', label: 'Barcodes', icon: <Barcode size={18} /> },
            { id: 'ROLES', label: 'Users & Roles', icon: <User size={18} /> },
            { id: 'SAMPLE_DATA', label: 'Sample Data', icon: <Database size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'bg-slate-50 dark:bg-slate-700/50 text-brand-600 dark:text-brand-400 border-brand-600' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'GENERAL' && (
            <div className="space-y-6 max-w-lg animate-in slide-in-from-right-4">
               <h3 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-slate-700">Shop Information</h3>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shop Name</label>
                 <input 
                   name="shopName" 
                   value={posForm.shopName} 
                   onChange={handlePosChange}
                   className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                 <textarea 
                   name="address" 
                   rows={2}
                   value={posForm.address} 
                   onChange={handlePosChange}
                   className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number(s)</label>
                 <input 
                   name="phone" 
                   value={posForm.phone} 
                   onChange={handlePosChange}
                   className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Footer Text</label>
                 <textarea 
                   name="footerText" 
                   rows={2}
                   value={posForm.footerText} 
                   onChange={handlePosChange}
                   className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" 
                 />
               </div>
            </div>
          )}

          {activeTab === 'POS' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               <div className="max-w-lg space-y-6">
                 <h3 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-slate-700">Printer Configuration</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Paper Size</label>
                      <select 
                        name="printSize"
                        value={posForm.printSize}
                        onChange={handlePosChange}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="80mm">Thermal 80mm</option>
                        <option value="58mm">Thermal 58mm</option>
                        <option value="A4">A4 Full Page</option>
                      </select>
                   </div>
                   <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="autoPrint"
                          checked={posForm.autoPrint}
                          onChange={(e) => setPosForm({...posForm, autoPrint: e.target.checked})}
                          className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" 
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Print After Sale</span>
                      </label>
                   </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Tax Rate (%)</label>
                    <input 
                      type="number"
                      name="taxRate" 
                      value={posForm.taxRate} 
                      onChange={handlePosChange}
                      className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                    />
                 </div>
               </div>

               <div className="max-w-2xl">
                 <h3 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-slate-700 mb-4 flex items-center gap-2">
                   <Keyboard size={20} /> Keyboard Shortcuts
                 </h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Focus Search</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">F1</kbd>
                   </div>
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Quick Save / Pay</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">F2</kbd>
                   </div>
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Print Last Invoice</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">F3</kbd>
                   </div>
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Hold Invoice</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">F4</kbd>
                   </div>
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Retrieve Held</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">F5</kbd>
                   </div>
                   <div className="flex justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
                     <span className="text-slate-600 dark:text-slate-300">Clear Cart</span>
                     <kbd className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded border dark:border-slate-500 font-mono font-bold">ESC</kbd>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'BARCODE' && (
             <div className="space-y-6 max-w-lg animate-in slide-in-from-right-4">
                <h3 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-slate-700">Barcode Label Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Label Size</label>
                  <select 
                    name="defaultLabelSize"
                    value={barcodeForm.defaultLabelSize}
                    onChange={handleBarcodeChange}
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="80mm">Thermal 80mm</option>
                    <option value="58mm">Thermal 58mm</option>
                    <option value="A4">A4 Sheet</option>
                  </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barcode Type</label>
                   <select 
                    name="barcodeType"
                    value={barcodeForm.barcodeType}
                    onChange={handleBarcodeChange}
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="CODE128">Code 128 (Alphanumeric)</option>
                    <option value="EAN13">EAN 13 (Numeric)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="showPrice"
                        checked={barcodeForm.showPrice}
                        onChange={(e) => setBarcodeForm({...barcodeForm, showPrice: e.target.checked})}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Price on Label</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="showName"
                        checked={barcodeForm.showName}
                        onChange={(e) => setBarcodeForm({...barcodeForm, showName: e.target.checked})}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Product Name</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="showSKU"
                        checked={barcodeForm.showSKU}
                        onChange={(e) => setBarcodeForm({...barcodeForm, showSKU: e.target.checked})}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500" 
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show SKU / Code</span>
                   </label>
                </div>
             </div>
          )}

          {activeTab === 'ROLES' && (
             <div className="animate-in slide-in-from-right-4">
               {currentUser?.role === 'Admin' ? (
                  <UsersPage /> 
               ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                     <Shield size={48} className="mx-auto mb-4 text-slate-300" />
                     <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Access Restricted</h3>
                     <p className="mb-2">User & Role Management is reserved for Administrators.</p>
                     <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Current Role: {currentUser?.role || 'Guest'}</span>
                  </div>
               )}
             </div>
          )}

          {activeTab === 'SAMPLE_DATA' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-lg">
                         <Database size={24} />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-blue-800 dark:text-blue-100">Sample Data Generator</h3>
                         <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            Quickly populate your system with realistic Products, Suppliers, Customers, and Sales History for testing purposes.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h4 className="font-bold dark:text-white mb-4">Sample Data Status</h4>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                            <span className="text-slate-600 dark:text-slate-300">Demo Records</span>
                            <span className="font-bold dark:text-white">{sampleCount}</span>
                         </div>
                         <div className="flex justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                            <span className="text-slate-600 dark:text-slate-300">Real Records</span>
                            <span className="font-bold dark:text-white">{products.length + customers.length + suppliers.length - sampleCount}</span>
                         </div>
                         {sampleCount > 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm mt-2">
                               <CheckCircle size={16} /> Sample data active
                            </div>
                         ) : (
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
                               <AlertTriangle size={16} /> No sample data found
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <h4 className="font-bold dark:text-white mb-4">Actions</h4>
                      <div className="space-y-4">
                         <button 
                           onClick={handleGenerateClick}
                           className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-95"
                         >
                            <Database size={18} /> Populate Sample Data
                         </button>
                         <button 
                           onClick={handleRemoveClick}
                           disabled={sampleCount === 0}
                           className="w-full py-3 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                         >
                            <Trash2 size={18} /> Remove Sample Data
                         </button>
                      </div>
                   </div>
                </div>

                <div className="text-xs text-slate-400 italic text-center pt-4">
                   Note: Removing sample data will ONLY delete records tagged as "Demo Data". Your real business data will remain safe.
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3 mb-4 text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={28} />
                  <h2 className="text-xl font-bold">{confirmModal.title}</h2>
               </div>
               <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {confirmModal.message}
               </p>
               <div className="flex justify-end gap-3">
                  <button 
                     onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                     className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={confirmAction}
                     className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm ${confirmModal.action === 'GENERATE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                     Confirm {confirmModal.action === 'GENERATE' ? 'Generate' : 'Remove'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default SettingsPage;