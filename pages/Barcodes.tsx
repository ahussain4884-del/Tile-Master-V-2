import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, LabelSize } from '../types';
import { Search, Printer, RefreshCw, Barcode as BarcodeIcon, Square, CheckSquare } from 'lucide-react';
import Barcode from '../components/Barcode';

const BarcodesPage: React.FC = () => {
  const { products, updateProduct, generateUniqueBarcode, barcodeSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'MANAGE' | 'PRINT'>('MANAGE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [printSize, setPrintSize] = useState<LabelSize>(barcodeSettings.defaultLabelSize);
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm));

  const handleAutoGenerate = (product: Product) => { 
    const newBarcode = generateUniqueBarcode();
    updateProduct({ ...product, barcode: newBarcode });
  };

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const printBarcodes = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <BarcodeIcon className="text-slate-500" /> Barcode Manager
           </h1>
           <p className="text-slate-500 dark:text-slate-400">Generate and print product labels</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button 
                 onClick={() => setActiveTab('MANAGE')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'MANAGE' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                 Manage List
              </button>
              <button 
                 onClick={() => setActiveTab('PRINT')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'PRINT' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                 Print Preview ({selectedProducts.length})
              </button>
           </div>
        </div>
      </div>

      {activeTab === 'MANAGE' && (
        <div className="space-y-4">
           <div className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <tr>
                       <th className="p-4 w-10">
                          <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                             {selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                       </th>
                       <th className="p-4">Product Name</th>
                       <th className="p-4">SKU</th>
                       <th className="p-4">Barcode</th>
                       <th className="p-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredProducts.map(p => (
                       <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedProducts.includes(p.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                          <td className="p-4">
                             <button onClick={() => toggleSelect(p.id)} className={`${selectedProducts.includes(p.id) ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}>
                                {selectedProducts.includes(p.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                             </button>
                          </td>
                          <td className="p-4 font-medium dark:text-white">{p.name}</td>
                          <td className="p-4 text-slate-500">{p.sku || '-'}</td>
                          <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{p.barcode}</td>
                          <td className="p-4 text-right">
                             <button 
                                onClick={() => handleAutoGenerate(p)}
                                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded flex items-center gap-1 text-xs font-medium ml-auto"
                             >
                                <RefreshCw size={14} /> Regenerate
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'PRINT' && (
         <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <Printer size={24} className="text-slate-400" />
                  <div>
                     <h3 className="font-bold dark:text-white">Print Configuration</h3>
                     <p className="text-sm text-slate-500">{selectedProducts.length} labels selected for printing</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <select 
                     className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                     value={printSize}
                     onChange={(e) => setPrintSize(e.target.value as LabelSize)}
                  >
                     <option value="80mm">80mm Roll</option>
                     <option value="58mm">58mm Roll</option>
                     <option value="A4">A4 Sheet (3x10)</option>
                  </select>
                  <button onClick={printBarcodes} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-brand-700 flex items-center gap-2">
                     <Printer size={20} /> Print Now
                  </button>
               </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-inner min-h-[500px] overflow-auto flex flex-wrap gap-4 justify-center content-start" id="print-area">
               {selectedProducts.length === 0 ? (
                  <div className="text-center text-slate-400 w-full pt-20">
                     <BarcodeIcon size={48} className="mx-auto mb-2 opacity-50" />
                     <p>No products selected. Go to "Manage List" to select items.</p>
                  </div>
               ) : (
                  products.filter(p => selectedProducts.includes(p.id)).map(p => (
                     <div 
                        key={p.id} 
                        className={`border border-slate-200 bg-white p-2 flex flex-col items-center justify-center text-center`}
                        style={{ 
                           width: printSize === 'A4' ? '60mm' : printSize === '80mm' ? '70mm' : '48mm',
                           height: printSize === 'A4' ? '30mm' : 'auto',
                           pageBreakInside: 'avoid'
                        }}
                     >
                        <div className="text-xs font-bold truncate w-full mb-1">{p.name}</div>
                        <Barcode value={p.barcode} width={1.5} height={40} fontSize={10} displayValue={true} />
                        <div className="text-sm font-bold mt-1">${p.salePrice}</div>
                     </div>
                  ))
               )}
            </div>
            
            <style>{`
               @media print {
                  body * { visibility: hidden; }
                  #print-area, #print-area * { visibility: visible; }
                  #print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; padding: 0; margin: 0; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px; box-shadow: none; border-radius: 0; overflow: visible; }
                  ${printSize === 'A4' ? '#print-area > div { margin: 2mm; border: none; }' : ''}
               }
            `}</style>
         </div>
      )}
    </div>
  );
};

export default BarcodesPage;