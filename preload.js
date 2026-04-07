const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateEmail: (apiKey, studentName, studentClass, average, term, tone) =>
        ipcRenderer.invoke('generate-email', apiKey, studentName, studentClass, average, term, tone),

    generateWhatsApp: (apiKey, studentName, studentClass, average, term) =>
        ipcRenderer.invoke('generate-whatsapp', apiKey, studentName, studentClass, average, term),

    generateRemarks: (apiKey, studentName, subjectPerformance) =>
        ipcRenderer.invoke('generate-remarks', apiKey, studentName, subjectPerformance),

    // Storage and Auth APIs
    getLocalStorage: () => ipcRenderer.invoke('get-local-storage'),
    saveLocalStorage: (data) => ipcRenderer.invoke('save-local-storage', data),
    exportToCSV: (data, filename) => ipcRenderer.invoke('export-csv', data, filename),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

    // Backup and Recovery APIs
    createBackup: () => ipcRenderer.invoke('create-backup'),
    restoreBackup: (backupFilePath) => ipcRenderer.invoke('restore-backup', backupFilePath),
    listBackups: () => ipcRenderer.invoke('list-backups'),

    // Error Handling APIs
    getErrorLogs: () => ipcRenderer.invoke('get-error-logs'),
    clearErrorLogs: () => ipcRenderer.invoke('clear-error-logs'),

    // Enhanced Data Import/Export APIs
    exportEnhancedCSV: (data, options) => ipcRenderer.invoke('export-enhanced-csv', data, options),
    importData: (importType) => ipcRenderer.invoke('import-data', importType),

    // Batch Operations APIs
    batchOperation: (operation, data) => ipcRenderer.invoke('batch-operation', operation, data)
});
