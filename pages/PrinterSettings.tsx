
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, Printer, FileText, Layout, Type, Image as ImageIcon } from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { Invoice } from '../types';

const PrinterSettingsPage: React.FC = () => {
  const { printerSettings, updatePrinterSettings, invoiceSettings, updateInvoiceSettings, products } = useStore();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'LAYOUT' | 'PRINTER' | 'PREVIEW'>('PROFILE');
  
  // Local state for forms
  const [pSettings, setPSettings] = useState(printerSettings);
  const [iSettings, setISettings] = useState(invoiceSettings);

  // Mock Invoice for Preview
  const mockInvoice: Invoice = {
     id: 'INV-1001-PREVIEW',
     date: new Date().toISOString(),
     customerId: 'Walk-in Customer',
     items: [
        { ...products[0], quantity: 10, total: 2000, cartId: '1', selectedUnit: 'Box' as any, unitPrice: 200, discount: 0 },
        { ...products[0], quantity: 5, total: 1000, cartId: '2', selectedUnit: 'Box' as any, unitPrice: 200, discount: 0 }
     ],
     subtotal: 3000,
     discount: 0,
     tax: 0,
     total: 3000,
     receivedAmount: 3000,
     changeAmount: 0,
     payments: [{ method: 'Cash', amount: 3000 }],
     status: 'PAID'
  };

  const handleSave = () => {
    updatePrinterSettings(pSettings);
    updateInvoiceSettings(iSettings);
    alert('Settings Saved Successfully!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if(file) {
        const reader = new FileReader();
        reader.onloadend = () => {
           setISettings({ ...iSettings, shopLogo: reader.result as string });
        };
        reader.readAsDataURL(file);
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Printer & Invoice Config</h1>
            <p className="text-slate-500 dark:text-slate-400">Customize receipt layout and printer preferences</p>
         </div>
         <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-md">
            <Save size={20} /> Save Changes
         </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
            {[
               { id: 'PROFILE', label: 'Shop Profile', icon: <FileText size={18} /> },
               { id: 'LAYOUT', label: 'Invoice Layout', icon: <Layout size={18} /> },
               { id: 'PRINTER', label: 'Printer Setup', icon: <Printer size={18} /> },
               { id: 'PREVIEW', label: 'Live Preview', icon: <Type size={18} /> },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors whitespace-nowrap ${
                     activeTab === tab.id 
                     ? 'bg-slate-50 dark:bg-slate-700/50 text-brand-600 dark:text-brand-400 border-b-2 border-brand-600' 
                     : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
               >
                  {tab.icon} {tab.label}
               </button>
            ))}
         </div>

         <div className="p-8">
            {activeTab === 'PROFILE' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Shop Name</label>
                        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.shopName} onChange={e => setISettings({...iSettings, shopName: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Address</label>
                        <textarea rows={3} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.address} onChange={e => setISettings({...iSettings, address: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Phone Numbers (Comma separated)</label>
                        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.phone.join(', ')} onChange={e => setISettings({...iSettings, phone: e.target.value.split(',').map(s => s.trim())})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Email</label>
                        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.email || ''} onChange={e => setISettings({...iSettings, email: e.target.value})} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        {iSettings.shopLogo ? (
                           <div className="relative group">
                              <img src={iSettings.shopLogo} alt="Logo" className="max-h-32 mb-4 object-contain" />
                              <button onClick={() => setISettings({...iSettings, shopLogo: undefined})} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                           </div>
                        ) : (
                           <div className="text-slate-400 mb-4"><ImageIcon size={48} className="mx-auto" /></div>
                        )}
                        <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        <label htmlFor="logo-upload" className="cursor-pointer bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                           {iSettings.shopLogo ? 'Change Logo' : 'Upload Shop Logo'}
                        </label>
                        <p className="text-xs text-slate-400 mt-2">Recommended: PNG or JPG, max 2MB</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'LAYOUT' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="font-bold border-b pb-2 dark:text-white">Content Toggles</h3>
                     <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={iSettings.showBarcode} onChange={e => setISettings({...iSettings, showBarcode: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                        <span className="dark:text-slate-300">Show Invoice Barcode</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={iSettings.showQRCode} onChange={e => setISettings({...iSettings, showQRCode: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                        <span className="dark:text-slate-300">Show QR Code</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={iSettings.showCustomerInfo} onChange={e => setISettings({...iSettings, showCustomerInfo: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                        <span className="dark:text-slate-300">Show Customer Details</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={iSettings.showDiscount} onChange={e => setISettings({...iSettings, showDiscount: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                        <span className="dark:text-slate-300">Show Discount Column</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={iSettings.showManagerName} onChange={e => setISettings({...iSettings, showManagerName: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                        <span className="dark:text-slate-300">Show Manager Name</span>
                     </label>
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-bold border-b pb-2 dark:text-white">Footer & Branding</h3>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Invoice Footer Note</label>
                        <textarea rows={3} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.footerText} onChange={e => setISettings({...iSettings, footerText: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Manager Name</label>
                        <input className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={iSettings.managerName} onChange={e => setISettings({...iSettings, managerName: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Header Accent Color</label>
                        <div className="flex gap-2">
                           <input type="color" className="h-10 w-20 rounded" value={iSettings.headerColor} onChange={e => setISettings({...iSettings, headerColor: e.target.value})} />
                           <span className="text-sm self-center text-slate-500">{iSettings.headerColor}</span>
                        </div>
                     </div>
                     <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-xs text-yellow-700 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-900/50">
                        <strong>Note:</strong> The "Software Developed By..." footer is mandatory and cannot be removed.
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'PRINTER' && (
               <div className="max-w-md space-y-6">
                  <div>
                     <label className="block text-sm font-medium dark:text-slate-300 mb-2">Default Paper Size</label>
                     <select 
                        className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={pSettings.paperSize}
                        onChange={e => setPSettings({...pSettings, paperSize: e.target.value as any})}
                     >
                        <option value="80mm">Thermal Receipt (80mm)</option>
                        <option value="58mm">Thermal Receipt (58mm)</option>
                        <option value="A4">A4 Full Page</option>
                        <option value="A5">A5 Half Page</option>
                     </select>
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer">
                     <input type="checkbox" checked={pSettings.autoPrint} onChange={e => setPSettings({...pSettings, autoPrint: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                     <div>
                        <span className="block font-medium dark:text-slate-300">Auto-Print</span>
                        <span className="text-xs text-slate-500">Automatically open print dialog after checkout</span>
                     </div>
                  </label>
               </div>
            )}

            {activeTab === 'PREVIEW' && (
               <div className="flex flex-col items-center">
                  <div className="mb-4 text-slate-500">
                     Preview Mode: <strong>{pSettings.paperSize}</strong>
                  </div>
                  <div className="border border-slate-300 shadow-xl bg-slate-500 p-8 overflow-auto max-h-[600px] w-full flex justify-center">
                     <InvoiceTemplate 
                        invoice={mockInvoice} 
                        settings={iSettings} 
                        printer={pSettings} 
                     />
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PrinterSettingsPage;
