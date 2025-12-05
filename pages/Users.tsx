import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, UserRole } from '../types';
import { Users, Plus, Edit, Trash2, Shield, Key, Lock, Unlock, Search, CheckCircle, AlertTriangle } from 'lucide-react';

const UsersPage: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, resetUserPassword } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Confirmation Modal State (Fix for Sandbox Error)
  const [confirmation, setConfirmation] = useState<{
     isOpen: boolean;
     title: string;
     message: string;
     onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState<Partial<User>>({
     name: '', username: '', role: 'Cashier', email: '', mobile: '', isActive: true
  });

  const filteredUsers = users; // Add search if needed

  const handleOpenAdd = () => {
     setEditingUser(null);
     setFormData({ name: '', username: '', role: 'Cashier', email: '', mobile: '', isActive: true });
     setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
     setEditingUser(user);
     setFormData(user);
     setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (editingUser) {
        updateUser({ ...editingUser, ...formData } as User);
     } else {
        addUser({
           id: Date.now().toString(),
           name: formData.name!,
           username: formData.username!,
           email: formData.email,
           mobile: formData.mobile,
           role: formData.role as UserRole,
           passwordHash: '123456', // Default password
           isActive: true,
           failedAttempts: 0,
           isLocked: false,
           createdAt: new Date().toISOString()
        });
     }
     setIsModalOpen(false);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (resetUserId && newPassword) {
        resetUserPassword(resetUserId, newPassword);
        setIsResetModalOpen(false);
        setNewPassword('');
        alert("Password reset successfully.");
     }
  };

  const handleDeleteClick = (id: string) => {
     setConfirmation({
        isOpen: true,
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        onConfirm: () => {
           deleteUser(id);
           setConfirmation({ ...confirmation, isOpen: false });
        }
     });
  };

  if (currentUser?.role !== 'Admin') {
     return <div className="p-10 text-center text-slate-500">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Management</h1>
             <p className="text-slate-500 dark:text-slate-400">Manage staff access, roles, and security</p>
          </div>
          <button onClick={handleOpenAdd} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700">
             <Plus size={20} /> Add User
          </button>
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                <tr>
                   <th className="p-4">User</th>
                   <th className="p-4">Role</th>
                   <th className="p-4">Contact</th>
                   <th className="p-4">Status</th>
                   <th className="p-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map(u => (
                   <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="p-4">
                         <div className="font-bold dark:text-white">{u.name}</div>
                         <div className="text-xs text-slate-500">@{u.username}</div>
                      </td>
                      <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-700'
                         }`}>
                            <Shield size={12} /> {u.role}
                         </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                         <div>{u.email}</div>
                         <div className="text-xs">{u.mobile}</div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="dark:text-slate-300">{u.isActive ? 'Active' : 'Disabled'}</span>
                            {u.isLocked && <span className="text-xs bg-red-100 text-red-600 px-1 rounded ml-2">LOCKED</span>}
                         </div>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                         <button onClick={() => { setResetUserId(u.id); setIsResetModalOpen(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded" title="Reset Password"><Key size={18} /></button>
                         <button onClick={() => handleEdit(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit size={18} /></button>
                         {u.id !== currentUser.id && (
                            <button onClick={() => handleDeleteClick(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={18} /></button>
                         )}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Add/Edit User Modal */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 dark:text-white">{editingUser ? 'Edit User' : 'New User'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div><label className="text-sm dark:text-slate-300">Full Name</label><input required className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                   <div><label className="text-sm dark:text-slate-300">Username</label><input required className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} disabled={!!editingUser} /></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm dark:text-slate-300">Role</label><select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}><option value="Admin">Admin</option><option value="Manager">Manager</option><option value="Cashier">Cashier</option></select></div>
                      <div><label className="text-sm dark:text-slate-300">Status</label><select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.isActive ? 'Active' : 'Disabled'} onChange={e => setFormData({...formData, isActive: e.target.value === 'Active'})}><option value="Active">Active</option><option value="Disabled">Disabled</option></select></div>
                   </div>
                   <div><label className="text-sm dark:text-slate-300">Email</label><input type="email" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                   <div><label className="text-sm dark:text-slate-300">Mobile</label><input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                   {!editingUser && <p className="text-xs text-slate-500">Default password will be '123456'</p>}
                   <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500">Cancel</button>
                      <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded">Save</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {/* Reset Password Modal */}
       {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 dark:text-white text-orange-600 flex items-center gap-2"><Key size={20} /> Reset Password</h2>
                <form onSubmit={handleResetSubmit} className="space-y-4">
                   <p className="text-sm text-slate-500">Enter a new password for this user.</p>
                   <input required type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                   <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsResetModalOpen(false)} className="text-slate-500">Cancel</button>
                      <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded">Reset</button>
                   </div>
                </form>
             </div>
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
};

export default UsersPage;