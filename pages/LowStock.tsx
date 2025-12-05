
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Supplier, PurchaseInvoice, ProductCategory, UnitType } from '../types';
import { 
  AlertTriangle, 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpRight, 
  Package, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface LowStockItem extends Product {
  supplierName: string;
  status: string;
  reorderQty: number;
}

const LowStockPage: React.FC = () => {
  const { products, suppliers, addPurchase } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Critical' | 'Low'>('All');

  // --- Purchase Modal State ---
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LowStockItem | null>(null);
  const [purchaseQty, setPurchaseQty] = useState(0);
  const [purchaseCost, setPurchaseCost] = useState(0);

  // --- Logic ---

  const lowStockItems: LowStockItem[] = useMemo(() => {
    return products.filter(p => p.stockQty <= p.minStockAlert).map(p => {
      const status = p.stockQty <= 0 ? 'Critical' : 'Low';
      const reorderQty = Math.max((p.minStockAlert * 2) - p.stockQty, p.minStockAlert); // Simple formula
      const supplier = suppliers.find(s => s.id === p.supplierId);
      
      return {
        ...p,
        status,
        reorderQty,
        supplierName: supplier?.companyName || 'Unknown Supplier',
        supplierId: p.supplierId // Ensure supplierId is maintained from Product
      };
    });
  }, [products, suppliers]);

  const filteredItems = lowStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.barcode.includes(searchTerm) ||
                          item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: lowStockItems.length,
    critical: lowStockItems.filter(i => i.status === 'Critical').length,
    tiles: lowStockItems.filter(i => i.category === ProductCategory.TILE).length,
    sanitary: lowStockItems.filter(i => i.category === ProductCategory.SANITARY).length
  };

  // --- Handlers ---

  const handleQuickPurchase = (item: LowStockItem) => {
    setSelectedProduct(item);
    setPurchaseQty(item.reorderQty);
    setPurchaseCost(item.costPrice);
    setIsPurchaseModalOpen(true);
  };

  const submitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedProduct.supplierId) {
        alert("Product has no linked supplier.");
        return;
    }

    const total = purchaseQty * purchaseCost;
    
    const purchase: PurchaseInvoice = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      supplierId: selectedProduct.supplierId,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: purchaseQty,
        costPrice: purchaseCost,
        total: total
      }],
      totalAmount: total,
      status: 'COMPLETED'
    };

    addPurchase(purchase);
    setIsPurchaseModalOpen(false);
    alert(`Purchase Order Created for ${selectedProduct.name}`);
  };

  const handleExport = (type: 'CSV' | 'Print') => {
    if (type === 'Print') {
      window.print();
    } else {
      // Simple CSV Export
      const headers = "Product,Category,Supplier,Current Stock,Alert Level,Reorder Qty,Status\n";
      const rows = filteredItems.map(i => 
        `"${i.name}","${i.category}","${i.supplierName}",${i.stockQty},${i.minStockAlert},${i.reorderQty},${i.status}`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Low_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <AlertTriangle className="text-orange-500" /> Low Stock Report
           </h1>
           <p className="text-slate-500 dark:text-slate-400">Identify shortages and reorder items instantly.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleExport('Print')} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
             <Printer size={18} /> Print
           </button>
           <button onClick={() => handleExport('CSV')} className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
             <Download size={18} /> Export
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-orange-500">
            <p className="text-sm font-medium text-slate-500">Total Low Stock</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total} Items</h3>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-red-500">
            <p className="text-sm font-medium text-slate-500">Critical (0 Stock)</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.critical} Items</h3>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500">Low Stock Tiles</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.tiles}</h3>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500">Low Stock Sanitary</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.sanitary}</h3>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
               type="text" 
               placeholder="Search product, barcode, or supplier..."
               className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <select 
               className="p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none cursor-pointer"
               value={categoryFilter}
               onChange={e => setCategoryFilter(e.target.value)}
            >
               <option value="All">All Categories</option>
               <option value={ProductCategory.TILE}>Tiles</option>
               <option value={ProductCategory.SANITARY}>Sanitary</option>
               <option value={ProductCategory.ACCESSORY}>Accessories</option>
            </select>
            <select 
               className="p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none cursor-pointer"
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value as any)}
            >
               <option value="All">All Status</option>
               <option value="Critical">Critical Only</option>
               <option value="Low">Low Stock Only</option>
            </select>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <tr>
                     <th className="p-4 font-semibold">Product Info</th>
                     <th className="p-4 font-semibold">Supplier</th>
                     <th className="p-4 font-semibold text-center">Alert Level</th>
                     <th className="p-4 font-semibold text-center">Current Stock</th>
                     <th className="p-4 font-semibold text-center">Status</th>
                     <th className="p-4 font-semibold text-center">Suggested Reorder</th>
                     <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-4">
                           <div className="font-bold dark:text-white">{item.name}</div>
                           <div className="text-xs text-slate-500">{item.category} • {item.unit}</div>
                           {item.category === ProductCategory.TILE && (
                              <div className="text-xs text-slate-400 mt-0.5">{item.tilesPerBox} tiles/box</div>
                           )}
                        </td>
                        <td className="p-4">
                           <div className="text-slate-700 dark:text-slate-300">{item.supplierName}</div>
                        </td>
                        <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400">
                           {item.minStockAlert}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-800 dark:text-white">
                           {item.stockQty}
                        </td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                              {item.status === 'Critical' ? 'Out of Stock' : 'Low Stock'}
                           </span>
                        </td>
                        <td className="p-4 text-center">
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">
                              {item.reorderQty}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           <button 
                             onClick={() => handleQuickPurchase(item)}
                             className="text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-colors"
                           >
                              <ShoppingCart size={14} /> Reorder
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredItems.length === 0 && (
                     <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                           <CheckCircle size={48} className="mx-auto mb-2 text-emerald-400 opacity-50" />
                           <p>No low stock items found! Inventory is healthy.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Quick Purchase Modal */}
      {isPurchaseModalOpen && selectedProduct && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
               <h2 className="text-xl font-bold mb-4 dark:text-white">Create Purchase Order</h2>
               <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-4 text-sm">
                  <p className="dark:text-slate-300"><strong>Product:</strong> {selectedProduct.name}</p>
                  <p className="dark:text-slate-300"><strong>Supplier:</strong> {selectedProduct.supplierName}</p>
                  <p className="dark:text-slate-300"><strong>Current Stock:</strong> {selectedProduct.stockQty}</p>
               </div>
               
               <form onSubmit={submitPurchase} className="space-y-4">
                  <div>
                     <label className="text-sm dark:text-slate-300">Quantity to Order</label>
                     <input 
                        type="number" 
                        required
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={purchaseQty}
                        onChange={e => setPurchaseQty(Number(e.target.value))}
                     />
                  </div>
                  <div>
                     <label className="text-sm dark:text-slate-300">Cost Price (Per Unit)</label>
                     <input 
                        type="number" 
                        required
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={purchaseCost}
                        onChange={e => setPurchaseCost(Number(e.target.value))}
                     />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <span className="font-bold text-lg dark:text-white">Total: {(purchaseQty * purchaseCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                     <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-500">Cancel</button>
                     <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700">Confirm Order</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Print Styles */}
      <style>{`
         @media print {
            body * { visibility: hidden; }
            .bg-white, .bg-white * { visibility: visible; }
            .bg-white { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
            button, input, select { display: none !important; }
         }
      `}</style>
    </div>
  );
};

export default LowStockPage;
