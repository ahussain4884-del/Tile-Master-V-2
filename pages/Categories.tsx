import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Category, ProductCategory, UnitType } from '../types';
import { 
  FolderPlus, Edit, Trash2, X, Tag, 
  Layers, Box, Search 
} from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', type: ProductCategory.TILE, prefix: '', defaultUnit: UnitType.BOX, taxRate: 0, attributes: {}
  });

  // --- Handlers ---

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', type: ProductCategory.TILE, prefix: '', defaultUnit: UnitType.BOX, taxRate: 0, attributes: { tile: true } });
    setIsModalOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to delete this category?")) {
       deleteCategory(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-set attributes based on type if new
    const attrs = formData.attributes || {};
    if(formData.type === ProductCategory.TILE) attrs.tile = true;
    if(formData.type === ProductCategory.SANITARY) attrs.sanitary = true;
    if(formData.type === ProductCategory.ACCESSORY) attrs.bond = true; 

    const category: Category = {
      id: editingId || `cat_${Date.now()}`,
      name: formData.name || 'New Category',
      type: formData.type as ProductCategory,
      prefix: formData.prefix?.toUpperCase() || 'GEN',
      defaultUnit: formData.defaultUnit as UnitType,
      taxRate: Number(formData.taxRate),
      attributes: attrs
    };

    if(editingId) {
       updateCategory(category);
    } else {
       addCategory(category);
    }
    setIsModalOpen(false);
  };

  // --- Render ---

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.prefix.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Category Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Configure product types, prefixes, and defaults</p>
         </div>
         <button onClick={handleOpenAdd} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 shadow-sm">
            <FolderPlus size={20} /> Add Category
         </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
         <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
               className="w-full pl-10 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
               placeholder="Search categories..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredCategories.map(cat => {
            const productCount = products.filter(p => p.category === cat.type).length; 
            
            return (
               <div key={cat.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative group hover:border-brand-500 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-lg ${cat.type === ProductCategory.TILE ? 'bg-orange-100 text-orange-600' : cat.type === ProductCategory.SANITARY ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {cat.type === ProductCategory.TILE ? <Layers size={24} /> : cat.type === ProductCategory.SANITARY ? <Box size={24} /> : <Tag size={24} />}
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(cat)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-brand-50 hover:text-brand-600">
                           <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-red-50 hover:text-red-600">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                     <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">{cat.prefix}</span>
                     <span>• Default: {cat.defaultUnit}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.type}</span>
                     <span className="text-sm font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{productCount} Items</span>
                  </div>
               </div>
            );
         })}
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="text-sm font-medium dark:text-slate-300">Category Name</label>
                     <input required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium dark:text-slate-300">Type</label>
                        <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProductCategory})}>
                           <option value={ProductCategory.TILE}>Tile</option>
                           <option value={ProductCategory.SANITARY}>Sanitary</option>
                           <option value={ProductCategory.ACCESSORY}>Accessory</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-sm font-medium dark:text-slate-300">SKU Prefix</label>
                        <input required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase" maxLength={3} placeholder="ABC" value={formData.prefix} onChange={e => setFormData({...formData, prefix: e.target.value})} />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium dark:text-slate-300">Default Unit</label>
                        <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.defaultUnit} onChange={e => setFormData({...formData, defaultUnit: e.target.value as UnitType})}>
                           <option value={UnitType.BOX}>Box</option>
                           <option value={UnitType.SQFT}>Sq.ft</option>
                           <option value={UnitType.PCS}>Pcs</option>
                           <option value={UnitType.SET}>Set</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-sm font-medium dark:text-slate-300">Default Tax %</label>
                        <input type="number" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})} />
                     </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500">Cancel</button>
                     <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700">Save</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default CategoriesPage;