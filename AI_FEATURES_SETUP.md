# GradeWise Pro - AI Features Setup Guide

## Overview
Your GradeWise Pro application has been successfully enhanced with three major AI-powered features:

1. **Google Authentication** - Secure login with Google account
2. **AI Report Editor** - AI-powered suggestions for student reports
3. **AI Code Access** - Controlled access for AI to analyze development code

---

## Feature 1: Google Authentication (`google-auth.html`)

### What It Does
- Enables users to sign in with their Google account
- Lets users choose between Cloud (Google Drive) and Local storage
- Automatically redirects to the main dashboard after authentication

### How to Use

#### For End Users:
1. Navigate to `google-auth.html` as your entry point
2. Click "Sign in with Google"
3. Select storage preference:
   - **Google Cloud**: Syncs data to Google Drive (cloud-backed)
   - **Local Storage**: Keeps data on computer only
4. Authorize the application
5. Redirects automatically to main dashboard

#### For Developers:

**Backend Implementation Needed:**
```javascript
// In Electron main process (main.js)
// Add OAuth 2.0 callback handler:

const { app, ipcMain } = require('electron');
const oauth2 = require('simple-oauth2');

const googleOAuth = oauth2.create({
  client: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://oauth.google.com',
    tokenPath: '/token',
    authorizePath: '/o/oauth2/v2/auth',
  },
});

ipcMain.handle('google:auth-callback', async (event, code) => {
  const token = await googleOAuth.authorizationCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/auth-callback',
  });
  
  // Store token securely
  event.sender.send('auth:token-received', token);
  return token;
});
```

**Google Drive Integration:**
```javascript
// File: google-drive-sync.js
const google = require('googleapis');

class GoogleDriveSync {
  constructor(accessToken) {
    this.drive = google.drive({ version: 'v3', auth: accessToken });
  }
  
  async syncToCloud(data) {
    // Upload/sync application data to Google Drive
  }
  
  async syncFromCloud() {
    // Download/sync data from Google Drive
  }
}
```

**Environment Variables Required:**
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth-callback
```

---

## Feature 2: AI Report Editor (`ai-report-editor.html`)

### What It Does
- Provides an intuitive interface for AI to suggest improvements to student reports
- Supports three sections: Remarks, Grades, and Stats
- Allows customization of AI tone (Formal, Warm, Concise, Detailed)
- Shows side-by-side comparison of original vs. AI-generated content
- One-click approval to apply changes

### How to Use

#### For Teachers/Users:
1. Navigate to `ai-report-editor.html`
2. Select a student from the dashboard
3. Choose the section to edit (Remarks, Grades, or Stats)
4. Enter your instruction/prompt for the AI
5. Select desired tone
6. Click "Generate" to see AI suggestion
7. Review the suggestion
8. Click "Apply" to accept or "Reset" to try again

#### For Developers:

**AI Integration (Claude API):**
```javascript
// Used in ai-report-editor.html
async function generateAIEdit() {
  const prompt = document.getElementById('ai-prompt').value;
  const tone = document.querySelector('input[name="tone"]:checked').value;
  const original = document.getElementById('edit-original').value;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Tone: ${tone}\n\n${prompt}\n\nOriginal:\n${original}`
      }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

**Database Update:**
```python
# Python backend (claude_api.py)
def update_student_report(student_id, field, new_value):
  """Update student report with AI-generated content"""
  db.students.update_one(
    {'id': student_id},
    {'$set': {field: new_value}}
  )
```

**API Key Configuration:**
- Store API key in Settings page
- Validate key before generating suggestions
- Implement rate limiting (Claude API quotas)

---

## Feature 3: AI Code Access (`ai-code-access.html`)

### What It Does
- Provides a secure interface to browse development source code
- Implements access controls for AI (read-only, no secrets)
- Maintains audit logs of all code access
- Syntax highlighting for better readability
- Allows copying code snippets

### How to Use

#### For Developers:
1. Navigate to `ai-code-access.html`
2. Browse source files from the sidebar:
   - **gradewise-pro.js** - Main utilities
   - **main.js** - Electron process
   - **preload.js** - Security context bridge
   - **claude_api.py** - AI backend
   - **HTML files** - UI pages
   - **style.css** - Stylesheet
   - **package.json** - Dependencies

3. Select a file to view syntax-highlighted code
4. Copy code snippets for AI analysis
5. Check Access Control panel for permissions

#### Access Controls:
- **AI Read Access**: View source code (✓ Enabled)
- **AI Suggest Changes**: AI can propose modifications (✓ Enabled)
- **View API Keys**: Access to secrets (✗ Disabled)
- **Execute Code**: Run operations (✗ Disabled)

#### For Developers (Backend):

**File Indexing System:**
```javascript
// File: code-index.js
const fs = require('fs');
const path = require('path');

class CodeIndex {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.index = {};
  }
  
  buildIndex() {
    // Scan and index all source files
    const extensions = ['.js', '.py', '.html', '.css', '.json'];
    // Build searchable index
  }
  
  getFile(filename) {
    // Retrieve file content with restrictions
    if (this.isRestricted(filename)) {
      return this.obfuscate(this.index[filename]);
    }
    return this.index[filename];
  }
  
  isRestricted(filename) {
    const restricted = ['.env', 'secrets.json', 'credentials.js'];
    return restricted.some(f => filename.includes(f));
  }
}
```

**Audit Logging:**
```javascript
// File: audit-logger.js
class AuditLogger {
  logAccess(ai_session, file, action, timestamp) {
    const entry = {
      timestamp: new Date(),
      ai_session: ai_session,
      file: file,
      action: action,
      status: 'success'
    };
    db.audit_logs.insert(entry);
  }
  
  getAccessHistory(ai_session) {
    return db.audit_logs.find({
      ai_session: ai_session
    }).sort({ timestamp: -1 });
  }
}
```

---

## Integration Checklist

### Phase 1: Authentication (Priority 1 - Critical)
- [ ] Register Google OAuth application
- [ ] Set up OAuth credentials in environment variables
- [ ] Implement OAuth callback handler in Electron main process
- [ ] Test Google login flow
- [ ] Implement token storage (secure)
- [ ] Test token refresh mechanism

### Phase 2: Storage Integration (Priority 2 - High)
- [ ] Implement Google Drive API integration
- [ ] Create local storage sync mechanism
- [ ] Implement conflict resolution for cloud/local
- [ ] Add offline mode with sync queue
- [ ] Test sync on reconnection

### Phase 3: AI Report Editor (Priority 3 - High)
- [ ] Add API key configuration in settings
- [ ] Implement Claude API calls
- [ ] Test with sample student data
- [ ] Add rate limiting
- [ ] Implement change history tracking

### Phase 4: AI Code Access (Priority 4 - Medium)
- [ ] Build file indexing system
- [ ] Implement access control middleware
- [ ] Set up audit logging database
- [ ] Test access restrictions
- [ ] Create admin dashboard for audit logs

### Phase 5: Security Hardening (Priority 5 - Medium)
- [ ] Implement API key encryption
- [ ] Add CORS restrictions
- [ ] Implement rate limiting on all AI endpoints
- [ ] Add IP whitelisting
- [ ] Regular security audits

---

## Configuration Files Needed

### `.env` (Root directory)
```
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth-callback

# Claude API
CLAUDE_API_KEY=sk-ant-xxxx

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gradewise_pro
DB_USER=gradewise
DB_PASSWORD=secure_password

# Application
NODE_ENV=production
PORT=3000
```

### `package.json` additions
```json
{
  "dependencies": {
    "anthropic": "^0.9.0",
    "simple-oauth2": "^5.0.0",
    "google-auth-library": "^9.0.0",
    "googleapis": "^150.0.0",
    "dotenv": "^16.0.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "electron-builder": "^latest",
    "concurrently": "^latest"
  }
}
```

---

## Navigation Integration

The following navigation items have been added to `gradewise-pro.html`:

```html
<!-- AI Report Editor -->
<div class="nav-item" onclick="window.location.href='ai-report-editor.html'">
  <svg>...</svg>
  AI Report Editor
</div>

<!-- AI Code Access -->
<div class="nav-item" onclick="window.location.href='ai-code-access.html'">
  <svg>...</svg>
  AI Code Access
</div>
```

---

## Testing Procedures

### Test Google Authentication
1. npm start
2. Navigate to google-auth.html
3. Click Login
4. Select storage type
5. Verify redirect to dashboard

### Test AI Report Editor
1. Add sample student
2. Go to AI Report Editor
3. Select student from dashboard
4. Enter prompt
5. Verify Claude API response
6. Apply changes
7. Verify data persists

### Test AI Code Access
1. Navigate to ai-code-access.html
2. Select different source files
3. Verify syntax highlighting
4. Check access controls
5. Review audit logs
6. Verify restricted files show obfuscated content

---

## Troubleshooting

### Google Login Not Working
- Check OAuth credentials in .env
- Verify redirect URI matches Google Console
- Check browser console for CORS errors
- Verify callback handler in main.js

### AI Report Editor Errors
- Verify Claude API key is set
- Check rate limiting isn't exceeded
- Verify student data format
- Check browser console for JavaScript errors

### Code Access Issues
- Verify file paths in code-index.js
- Check file permissions
- Verify access control rules
- Review audit logs for access attempts

---

## Security Best Practices

1. **Never store API keys in code** - Use .env files
2. **Encrypt sensitive data** - Use electron-safe-storage
3. **Validate all inputs** - Sanitize API requests
4. **Implement CORS** - Restrict cross-origin requests
5. **Rate limiting** - Protect API endpoints
6. **Audit logging** - Track all access
7. **Regular updates** - Keep dependencies current

---

## Support & Documentation

For questions about:
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Claude API**: https://docs.anthropic.com/
- **Electron**: https://www.electronjs.org/docs
- **Google Drive API**: https://developers.google.com/drive/api

---

## Summary of Changes

### Files Created:
1. **google-auth.html** - Google OAuth authentication page
2. **ai-report-editor.html** - AI-powered report editing interface
3. **ai-code-access.html** - Secure code browsing for AI analysis

### Files Modified:
1. **gradewise-pro.html** - Added navigation links to new features

### Next Steps:
1. Implement OAuth backend handlers
2. Set up Google Drive integration
3. Configure Claude API
4. Test all features
5. Deploy to production

---

**Last Updated**: January 2025
**Version**: 2.0 (AI-Enhanced)
**Maintainer**: GradeWise Development Team
