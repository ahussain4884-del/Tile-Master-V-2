import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Database, UploadCloud, DownloadCloud, FileSpreadsheet, 
  History, Clock, AlertCircle, Save, CheckCircle, Shield, AlertTriangle, HardDrive, Cloud
} from 'lucide-react';
import { BackupSettings } from '../types';

const DataBackupPage: React.FC = () => {
  const { 
    createBackup, restoreBackup, generateExport, 
    backupHistory, backupSettings, updateBackupSettings 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'EXPORT' | 'SETTINGS' | 'LOGS'>('DASHBOARD');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
     isOpen: boolean;
     title: string;
     message: string;
     onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Stats
  const lastBackup = backupHistory[0];
  const totalBackups = backupHistory.length;

  const handleCreateBackup = () => {
     createBackup();
     // Alert handles in context or via browser download behavior
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setConfirmation({
           isOpen: true,
           title: 'Confirm Restore',
           message: `Restoring from "${file.name}" will OVERWRITE all current system data. This action cannot be undone. Are you sure?`,
           onConfirm: () => {
              restoreBackup(file);
              setConfirmation({ ...confirmation, isOpen: false });
              if(fileInputRef.current) fileInputRef.current.value = ''; 
           }
        });
     }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
     
     if (e.target.name === 'location' && val === 'Drive') {
        setIsCloudModalOpen(true); // Open cloud selection
     } else {
        updateBackupSettings({ ...backupSettings, [e.target.name]: val });
     }
  };

  const connectCloudService = (service: string) => {
     alert(`Connecting to ${service}... (Simulation: API Integration Required)`);
     updateBackupSettings({ ...backupSettings, location: 'Drive' });
     setIsCloudModalOpen(false);
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Database size={32} /> Data & Backup Center
               </h1>
               <p className="opacity-90 max-w-xl">
                  Secure your business data. Create full system backups or export reports for analysis.
               </p>
            </div>
            <div className="flex gap-3">
               <button 
                  onClick={handleCreateBackup}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
               >
                  <DownloadCloud size={20} /> Create Backup
               </button>
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".posbackup,.json" 
                  onChange={handleFileChange}
               />
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-800/50 text-white border border-blue-400/30 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800/70 transition-colors"
               >
                  <UploadCloud size={20} /> Restore Data
               </button>
            </div>
         </div>
         <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12 pointer-events-none"></div>
       </div>

       {/* Tabs */}
       <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'DASHBOARD', label: 'Overview', icon: <Database size={18} /> },
            { id: 'EXPORT', label: 'Data Export', icon: <FileSpreadsheet size={18} /> },
            { id: 'SETTINGS', label: 'Auto-Backup', icon: <Clock size={18} /> },
            { id: 'LOGS', label: 'History Logs', icon: <History size={18} /> },
          ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                   activeTab === tab.id 
                   ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400' 
                   : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
             >
                {tab.icon} {tab.label}
             </button>
          ))}
       </div>

       {/* Content */}
       <div className="animate-in fade-in slide-in-from-bottom-2">
          {activeTab === 'DASHBOARD' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                   <p className="text-sm font-medium text-slate-500">Last Backup</p>
                   {lastBackup ? (
                      <div className="mt-2">
                         <h3 className="text-xl font-bold text-slate-800 dark:text-white">{new Date(lastBackup.date).toLocaleDateString()}</h3>
                         <p className="text-sm text-slate-400">{new Date(lastBackup.date).toLocaleTimeString()}</p>
                      </div>
                   ) : (
                      <div className="mt-2 text-slate-400 flex items-center gap-2">
                         <AlertCircle size={20} /> No backups yet
                      </div>
                   )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                   <p className="text-sm font-medium text-slate-500">Total Backups Created</p>
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{totalBackups}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                   <p className="text-sm font-medium text-slate-500">Protection Status</p>
                   <div className="flex items-center gap-2 mt-2">
                      <Shield className={backupSettings.autoBackupEnabled ? 'text-emerald-500' : 'text-orange-500'} />
                      <span className={`font-bold ${backupSettings.autoBackupEnabled ? 'text-emerald-600' : 'text-orange-600'}`}>
                         {backupSettings.autoBackupEnabled ? 'Auto-Backup Active' : 'Manual Only'}
                      </span>
                   </div>
                </div>

                <div className="md:col-span-3 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                   <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <AlertCircle size={20} /> Security Tip
                   </h3>
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                      Always store your backup files on an external drive or secure cloud storage. 
                      This system creates local encrypted JSON files. Do not modify the file contents manually to avoid corruption.
                   </p>
                </div>
             </div>
          )}

          {activeTab === 'EXPORT' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-500 transition-colors group">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={24} />
                   </div>
                   <h3 className="font-bold text-lg dark:text-white">Inventory List</h3>
                   <p className="text-sm text-slate-500 mb-6">Export all products, stock levels, and costs.</p>
                   <button 
                     onClick={() => generateExport('INVENTORY')}
                     className="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                   >
                      Download CSV
                   </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-500 transition-colors group">
                   <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={24} />
                   </div>
                   <h3 className="font-bold text-lg dark:text-white">Customer Database</h3>
                   <p className="text-sm text-slate-500 mb-6">Export customer details and balances.</p>
                   <button 
                     onClick={() => generateExport('CUSTOMERS')}
                     className="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                   >
                      Download CSV
                   </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-cyan-500 transition-colors group">
                   <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={24} />
                   </div>
                   <h3 className="font-bold text-lg dark:text-white">Sales Records</h3>
                   <p className="text-sm text-slate-500 mb-6">Export full transaction history.</p>
                   <button 
                     onClick={() => generateExport('SALES')}
                     className="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                   >
                      Download CSV
                   </button>
                </div>
             </div>
          )}

          {activeTab === 'SETTINGS' && (
             <div className="max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold dark:text-white mb-6">Auto-Backup Configuration</h3>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                         <h4 className="font-bold dark:text-white">Enable Auto Backup</h4>
                         <p className="text-sm text-slate-500">System will prompt to save backup automatically</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="autoBackupEnabled" checked={backupSettings.autoBackupEnabled} onChange={handleSettingsChange} className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                         <select 
                            name="frequency" 
                            value={backupSettings.frequency} 
                            onChange={handleSettingsChange}
                            className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                         >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time</label>
                         <input 
                            type="time" 
                            name="time"
                            value={backupSettings.time} 
                            onChange={handleSettingsChange}
                            className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                         />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Retention (Keep last X backups)</label>
                      <input 
                         type="number" 
                         name="retentionCount"
                         value={backupSettings.retentionCount} 
                         onChange={handleSettingsChange}
                         className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                   </div>

                   {/* Location Selector */}
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Backup Location</label>
                      <div className="grid grid-cols-2 gap-4">
                         <label className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center gap-2 ${backupSettings.location === 'Local' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'dark:border-slate-600'}`}>
                            <input type="radio" name="location" value="Local" checked={backupSettings.location === 'Local'} onChange={handleSettingsChange} className="hidden" />
                            <HardDrive size={24} className={backupSettings.location === 'Local' ? 'text-blue-600' : 'text-slate-400'} />
                            <span className="font-medium dark:text-slate-200">Local Download</span>
                         </label>
                         <label className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center gap-2 ${backupSettings.location === 'Drive' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'dark:border-slate-600'}`}>
                            <input type="radio" name="location" value="Drive" checked={backupSettings.location === 'Drive'} onChange={handleSettingsChange} className="hidden" />
                            <UploadCloud size={24} className={backupSettings.location === 'Drive' ? 'text-blue-600' : 'text-slate-400'} />
                            <span className="font-medium dark:text-slate-200">Cloud Drive</span>
                         </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                         {backupSettings.location === 'Local' 
                            ? "Backups will be downloaded to your browser's default download folder." 
                            : "Requires authentication with Google Drive, Dropbox, or OneDrive."}
                      </p>
                   </div>

                   <div className="pt-4 flex justify-end">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                         <Save size={18} /> Save Settings
                      </button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'LOGS' && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      <tr>
                         <th className="p-4">Date & Time</th>
                         <th className="p-4">File Name</th>
                         <th className="p-4">Size</th>
                         <th className="p-4">Type</th>
                         <th className="p-4 text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {backupHistory.map(log => (
                         <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="p-4 dark:text-slate-300">{new Date(log.date).toLocaleString()}</td>
                            <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{log.fileName}</td>
                            <td className="p-4 dark:text-slate-300">{log.size}</td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded text-xs font-medium ${log.type === 'Auto' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {log.type}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <span className="text-emerald-600 flex items-center justify-end gap-1">
                                  <CheckCircle size={14} /> Completed
                               </span>
                            </td>
                         </tr>
                      ))}
                      {backupHistory.length === 0 && (
                         <tr><td colSpan={5} className="p-8 text-center text-slate-400">No backup history available.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          )}
       </div>

       {/* Cloud Connection Modal */}
       {isCloudModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                   <Cloud size={24} className="text-blue-500" /> Connect Cloud Storage
                </h3>
                <div className="space-y-3">
                   <button onClick={() => connectCloudService('Google Drive')} className="w-full p-4 border rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020-present%29.svg" alt="Drive" className="w-6 h-6" />
                      Google Drive
                   </button>
                   <button onClick={() => connectCloudService('Dropbox')} className="w-full p-4 border rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" alt="Dropbox" className="w-6 h-6" />
                      Dropbox
                   </button>
                   <button onClick={() => connectCloudService('OneDrive')} className="w-full p-4 border rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg" alt="OneDrive" className="w-6 h-6" />
                      Microsoft OneDrive
                   </button>
                </div>
                <button onClick={() => setIsCloudModalOpen(false)} className="mt-6 w-full py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
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
                      onClick={() => {
                          setConfirmation({ ...confirmation, isOpen: false });
                          if(fileInputRef.current) fileInputRef.current.value = ''; // Reset if cancelled
                      }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={confirmation.onConfirm}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-sm"
                   >
                      Confirm Restore
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default DataBackupPage;