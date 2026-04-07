const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

function createWindow ()
{
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load login page first, then redirect to main app after authentication
  win.loadFile('login.html');
  return win;
}

// Enhanced error handling and validation utilities
function validateInput (data, rules)
{
  const errors = [];

  if (rules.required && !data) {
    errors.push(`${rules.field || 'Field'} is required`);
  }

  if (rules.type && data && typeof data !== rules.type) {
    errors.push(`${rules.field || 'Field'} must be of type ${rules.type}`);
  }

  if (rules.min && data && data.length < rules.min) {
    errors.push(`${rules.field || 'Field'} must be at least ${rules.min} characters`);
  }

  if (rules.max && data && data.length > rules.max) {
    errors.push(`${rules.field || 'Field'} must not exceed ${rules.max} characters`);
  }

  if (rules.pattern && data && !rules.pattern.test(data)) {
    errors.push(`${rules.field || 'Field'} format is invalid`);
  }

  return errors;
}

function logError (error, context = '')
{
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    type: error.constructor.name
  };

  console.error(`[${timestamp}] ${context}:`, error);

  // Store error log locally
  const errorLogs = JSON.parse(localStorage.getItem('gw_error_logs') || '[]');
  errorLogs.push(errorLog);

  // Keep only last 100 errors
  if (errorLogs.length > 100) {
    errorLogs.splice(0, errorLogs.length - 100);
  }

  localStorage.setItem('gw_error_logs', JSON.stringify(errorLogs));
}

// IPC Handler for Claude Email Generation
ipcMain.handle('generate-email', async (event, apiKey, studentName, studentClass, average, term, tone) =>
{
  try {
    // Validate inputs
    const validationErrors = [
      ...validateInput(apiKey, { required: true, min: 10, field: 'API Key' }),
      ...validateInput(studentName, { required: true, min: 1, field: 'Student Name' }),
      ...validateInput(studentClass, { required: true, min: 1, field: 'Student Class' }),
      ...validateInput(average, { required: true, type: 'number', field: 'Average' }),
      ...validateInput(term, { required: true, min: 1, field: 'Term' })
    ];

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(', ') };
    }

    return new Promise((resolve, reject) =>
    {
      try {
        const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
        const scriptPath = path.join(__dirname, 'claude_api.py');

        // Check if Python executable exists
        if (!fs.existsSync(pythonPath)) {
          return resolve({ success: false, error: 'Python environment not found. Please ensure .venv is properly set up.' });
        }

        // Check if script exists
        if (!fs.existsSync(scriptPath)) {
          return resolve({ success: false, error: 'Claude API script not found.' });
        }

        const python = spawn(pythonPath, [
          scriptPath,
          'generate_email',
          apiKey,
          studentName,
          studentClass,
          average.toString(),
          term,
          tone || 'formal'
        ]);

        let output = '';
        let errorOutput = '';

        // Set timeout for Python process
        const timeout = setTimeout(() =>
        {
          python.kill();
          resolve({ success: false, error: 'Request timed out after 30 seconds' });
        }, 30000);

        python.stdout.on('data', (data) =>
        {
          output += data.toString();
        });

        python.stderr.on('data', (data) =>
        {
          errorOutput += data.toString();
        });

        python.on('close', (code) =>
        {
          clearTimeout(timeout);

          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve(result);
            } catch (e) {
              logError(e, 'Email Generation JSON Parse');
              resolve({ success: false, error: 'Invalid response from AI service' });
            }
          } else {
            logError(new Error(errorOutput || `Python script exited with code ${code}`), 'Email Generation');
            resolve({ success: false, error: errorOutput || 'AI service temporarily unavailable' });
          }
        });

        python.on('error', (err) =>
        {
          clearTimeout(timeout);
          logError(err, 'Email Generation Process');
          resolve({ success: false, error: 'Failed to execute AI service' });
        });
      } catch (err) {
        logError(err, 'Email Generation Setup');
        reject(err);
      }
    });
  } catch (err) {
    logError(err, 'Email Generation Handler');
    return { success: false, error: 'Internal server error' };
  }
});

// IPC Handler for WhatsApp Message Generation
ipcMain.handle('generate-whatsapp', async (event, apiKey, studentName, studentClass, average, term) =>
{
  return new Promise((resolve, reject) =>
  {
    try {
      const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
      const scriptPath = path.join(__dirname, 'claude_api.py');

      const python = spawn(pythonPath, [
        scriptPath,
        'generate_whatsapp',
        apiKey,
        studentName,
        studentClass,
        average.toString(),
        term || 'Current Term'
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) =>
      {
        output += data.toString();
      });

      python.stderr.on('data', (data) =>
      {
        errorOutput += data.toString();
      });

      python.on('close', (code) =>
      {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response from Python' });
          }
        } else {
          resolve({ success: false, error: errorOutput || 'Python script failed' });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
});

// IPC Handler for AI Remarks
ipcMain.handle('generate-remarks', async (event, apiKey, studentName, subjectPerformance) =>
{
  return new Promise((resolve, reject) =>
  {
    try {
      const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
      const scriptPath = path.join(__dirname, 'claude_api.py');

      const python = spawn(pythonPath, [
        scriptPath,
        'generate_remarks',
        apiKey,
        studentName,
        JSON.stringify(subjectPerformance)
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) =>
      {
        output += data.toString();
      });

      python.stderr.on('data', (data) =>
      {
        errorOutput += data.toString();
      });

      python.on('close', (code) =>
      {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response from Python' });
          }
        } else {
          resolve({ success: false, error: errorOutput || 'Python script failed' });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
});

// Add required modules for storage and file operations
const fs = require('fs');
const { dialog } = require('electron');

// Storage directory
const userDataPath = path.join(app.getPath('userData'), 'data');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// IPC Handler for Local Storage
ipcMain.handle('get-local-storage', async () =>
{
  try {
    const storageFile = path.join(userDataPath, 'storage.json');
    if (fs.existsSync(storageFile)) {
      const data = fs.readFileSync(storageFile, 'utf-8');
      return JSON.parse(data);
    }
    return {};
  } catch (err) {
    console.error('Error reading storage:', err);
    return {};
  }
});

ipcMain.handle('save-local-storage', async (event, data) =>
{
  try {
    const storageFile = path.join(userDataPath, 'storage.json');
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error('Error saving storage:', err);
    return { success: false, error: err.message };
  }
});

// IPC Handler for CSV Export
ipcMain.handle('export-csv', async (event, data, filename) =>
{
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: filename || 'export.csv',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.cancelled) {
      const csvContent = convertToCSV(data);
      fs.writeFileSync(result.filePath, csvContent);
      return { success: true, filePath: result.filePath };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for File Dialog
ipcMain.handle('open-file-dialog', async () =>
{
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.cancelled && result.filePaths.length > 0) {
      const fileContent = fs.readFileSync(result.filePaths[0], 'utf-8');
      return { success: true, data: JSON.parse(fileContent) };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for Backup Creation
ipcMain.handle('create-backup', async () =>
{
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `gradewise-backup-${timestamp}.json`;
    const backupPath = path.join(userDataPath, 'backups');

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Get current data
    const storageData = await ipcMain.handle('get-local-storage');
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      data: storageData,
      metadata: {
        totalStudents: storageData.students?.length || 0,
        totalEmails: storageData.emailLog?.length || 0,
        settingsVersion: storageData.settings?.version || '1.0.0'
      }
    };

    const backupFilePath = path.join(backupPath, backupFileName);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    // Clean up old backups (keep only last 10)
    const backupFiles = fs.readdirSync(backupPath)
      .filter(file => file.startsWith('gradewise-backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupPath, file),
        time: fs.statSync(path.join(backupPath, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);

    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      filesToDelete.forEach(file =>
      {
        fs.unlinkSync(file.path);
      });
    }

    return {
      success: true,
      backupPath: backupFilePath,
      fileName: backupFileName,
      size: fs.statSync(backupFilePath).size
    };
  } catch (err) {
    logError(err, 'Backup Creation');
    return { success: false, error: err.message };
  }
});

// IPC Handler for Backup Restoration
ipcMain.handle('restore-backup', async (event, backupFilePath) =>
{
  try {
    if (!fs.existsSync(backupFilePath)) {
      return { success: false, error: 'Backup file not found' };
    }

    const backupContent = fs.readFileSync(backupFilePath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    // Validate backup structure
    if (!backupData.data || !backupData.timestamp) {
      return { success: false, error: 'Invalid backup file format' };
    }

    // Create a pre-restore backup
    const preRestoreBackup = await ipcMain.handle('create-backup');
    if (!preRestoreBackup.success) {
      console.warn('Could not create pre-restore backup');
    }

    // Restore data
    const restoreResult = await ipcMain.handle('save-local-storage', null, backupData.data);

    return {
      success: true,
      restoredFrom: backupData.timestamp,
      preRestoreBackup: preRestoreBackup.fileName,
      metadata: backupData.metadata
    };
  } catch (err) {
    logError(err, 'Backup Restoration');
    return { success: false, error: err.message };
  }
});

// IPC Handler for List Backups
ipcMain.handle('list-backups', async () =>
{
  try {
    const backupPath = path.join(userDataPath, 'backups');

    if (!fs.existsSync(backupPath)) {
      return { success: true, backups: [] };
    }

    const backupFiles = fs.readdirSync(backupPath)
      .filter(file => file.startsWith('gradewise-backup-') && file.endsWith('.json'))
      .map(file =>
      {
        const filePath = path.join(backupPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return { success: true, backups: backupFiles };
  } catch (err) {
    logError(err, 'List Backups');
    return { success: false, error: err.message };
  }
});

// IPC Handler for Error Logs
ipcMain.handle('get-error-logs', async () =>
{
  try {
    const errorLogs = JSON.parse(localStorage.getItem('gw_error_logs') || '[]');
    return { success: true, logs: errorLogs };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for Clear Error Logs
ipcMain.handle('clear-error-logs', async () =>
{
  try {
    localStorage.setItem('gw_error_logs', JSON.stringify([]));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for Enhanced CSV Export
ipcMain.handle('export-enhanced-csv', async (event, data, options) =>
{
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: options.filename || 'export.csv',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.cancelled) {
      let content;
      const extension = path.extname(result.filePath).toLowerCase();

      if (extension === '.json') {
        content = JSON.stringify(data, null, 2);
      } else if (extension === '.xlsx') {
        // For Excel export, we'll create a CSV that can be opened in Excel
        content = convertToEnhancedCSV(data, options);
      } else {
        content = convertToEnhancedCSV(data, options);
      }

      fs.writeFileSync(result.filePath, content);
      return { success: true, filePath: result.filePath, records: data.length };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    logError(err, 'Enhanced CSV Export');
    return { success: false, error: err.message };
  }
});

// IPC Handler for Import Data with Validation
ipcMain.handle('import-data', async (event, importType) =>
{
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.cancelled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const extension = path.extname(filePath).toLowerCase();
      let data;

      if (extension === '.json') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(fileContent);
      } else if (extension === '.csv' || extension === '.xlsx') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        data = parseCSV(fileContent);
      } else {
        return { success: false, error: 'Unsupported file format' };
      }

      // Validate imported data
      const validation = validateImportedData(data, importType);

      return {
        success: true,
        data: data,
        validation: validation,
        filePath: filePath
      };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    logError(err, 'Data Import');
    return { success: false, error: err.message };
  }
});

// IPC Handler for Batch Operations
ipcMain.handle('batch-operation', async (event, operation, data) =>
{
  try {
    const results = [];
    const startTime = Date.now();

    switch (operation) {
      case 'create_reports':
        for (const student of data) {
          try {
            const report = generateStudentReport(student);
            results.push({ success: true, studentId: student.id, report: report });
          } catch (err) {
            results.push({ success: false, studentId: student.id, error: err.message });
          }
        }
        break;

      case 'send_emails':
        for (const email of data) {
          try {
            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 100));
            results.push({ success: true, emailId: email.id, status: 'sent' });
          } catch (err) {
            results.push({ success: false, emailId: email.id, error: err.message });
          }
        }
        break;

      case 'validate_data':
        for (const record of data) {
          const validation = validateStudentRecord(record);
          results.push({ success: validation.isValid, recordId: record.id, errors: validation.errors });
        }
        break;

      default:
        return { success: false, error: 'Unknown batch operation' };
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      results: results,
      summary: {
        total: data.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        duration: duration
      }
    };
  } catch (err) {
    logError(err, 'Batch Operation');
    return { success: false, error: err.message };
  }
});

// Enhanced CSV conversion function
function convertToEnhancedCSV (data, options = {})
{
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const {
    includeHeaders = true,
    customHeaders = null,
    dateFormat = 'ISO',
    numberFormat = 'decimal'
  } = options;

  let headers = customHeaders || Object.keys(data[0]);
  const csvRows = [];

  if (includeHeaders) {
    csvRows.push(headers.join(','));
  }

  data.forEach(row =>
  {
    const values = headers.map(header =>
    {
      let value = row[header];

      // Format dates
      if (value instanceof Date) {
        value = dateFormat === 'ISO' ? value.toISOString() : value.toLocaleDateString();
      }

      // Format numbers
      if (typeof value === 'number') {
        value = numberFormat === 'decimal' ? value.toFixed(2) : value.toString();
      }

      // Handle objects and arrays
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      // Escape CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      } else if (typeof value === 'string') {
        value = `"${value}"`;
      } else if (value === null || value === undefined) {
        value = '""';
      }

      return value;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

// CSV parsing function
function parseCSV (csvText)
{
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.replace(/^"|"$/g, '').trim());

    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) =>
      {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
}

// Data validation functions
function validateImportedData (data, importType)
{
  const errors = [];
  const warnings = [];

  if (!Array.isArray(data)) {
    errors.push('Imported data must be an array');
    return { isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push('No data found in file');
    return { isValid: true, errors, warnings };
  }

  switch (importType) {
    case 'students':
      data.forEach((record, index) =>
      {
        if (!record.name || record.name.trim() === '') {
          errors.push(`Row ${index + 1}: Student name is required`);
        }
        if (!record.class || record.class.trim() === '') {
          errors.push(`Row ${index + 1}: Class is required`);
        }
        if (record.avg !== undefined && (isNaN(record.avg) || record.avg < 0 || record.avg > 100)) {
          errors.push(`Row ${index + 1}: Average must be between 0 and 100`);
        }
      });
      break;

    case 'grades':
      data.forEach((record, index) =>
      {
        if (!record.studentId || record.studentId.trim() === '') {
          errors.push(`Row ${index + 1}: Student ID is required`);
        }
        if (!record.subject || record.subject.trim() === '') {
          errors.push(`Row ${index + 1}: Subject is required`);
        }
        if (record.score !== undefined && (isNaN(record.score) || record.score < 0 || record.score > 100)) {
          errors.push(`Row ${index + 1}: Score must be between 0 and 100`);
        }
      });
      break;

    default:
      warnings.push('Unknown import type, basic validation only performed');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    recordCount: data.length
  };
}

function validateStudentRecord (record)
{
  const errors = [];

  if (!record.name || record.name.trim() === '') {
    errors.push('Student name is required');
  }

  if (!record.class || record.class.trim() === '') {
    errors.push('Class is required');
  }

  if (record.avg !== undefined) {
    if (isNaN(record.avg)) {
      errors.push('Average must be a number');
    } else if (record.avg < 0 || record.avg > 100) {
      errors.push('Average must be between 0 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

function generateStudentReport (student)
{
  return {
    id: `report_${student.id}_${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    class: student.class,
    average: student.avg,
    grade: student.avg >= 90 ? 'A' : student.avg >= 80 ? 'B' : student.avg >= 70 ? 'C' : student.avg >= 60 ? 'D' : 'F',
    generatedAt: new Date().toISOString(),
    subjects: student.subjects || {}
  };
}

// Helper function to convert data to CSV
function convertToCSV (data)
{
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  data.forEach(row =>
  {
    const values = headers.map(header =>
    {
      const value = row[header];
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

let mainWindow;

app.whenReady().then(() =>
{
  mainWindow = createWindow();
});