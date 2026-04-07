# GradeWise Pro - Terminal Report Studio

A comprehensive web-based application for managing student grades, generating reports, and handling academic administration for educational institutions.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Core Functionality
- **Student Management**: Complete student registry with personal information and academic records
- **Grade Management**: Track and calculate student averages across multiple subjects
- **Report Generation**: Create professional terminal reports with customizable templates
- **Batch Operations**: Export multiple reports simultaneously for efficiency
- **Email Integration**: Send reports directly to parents and stakeholders

### Advanced Features
- **Group Management**: Create custom student groups for targeted assessment
- **Attendance Tracking**: Monitor and analyze student attendance patterns
- **Analytics Dashboard**: Visual performance charts and statistical analysis
- **AI-Powered Tools**: Intelligent report editing and code access features
- **Parent Portal**: Secure access for parents to view student progress
- **Multi-language Support**: English and French language options

### Technical Features
- **Offline Functionality**: Full access to data without internet connection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Eye-friendly interface for extended use
- **Data Persistence**: Local storage with optional cloud synchronization
- **Authentication**: Secure login system with session management

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start
1. Clone this repository:
```bash
git clone https://github.com/yourusername/gradewise-pro.git
cd gradewise-pro
```

2. Open `gradewise-pro.html` in your web browser:
```bash
# Using Python (recommended)
python -m http.server 8000
# Then open http://localhost:8000

# Or simply open the file directly
open gradewise-pro.html
```

3. The application will initialize with sample data or load your existing data from local storage.

### Development Setup
For development with live reload:
```bash
# Using Node.js
npm install -g live-server
live-server

# Or using Python
python -m http.server 8000
```

## Usage

### First Time Setup
1. **Configure School Settings**: Navigate to Settings > School Settings to enter your institution details
2. **Add Students**: Use the "Add Student" feature or import existing data
3. **Create Groups**: Organize students into classes or custom assessment groups
4. **Generate Reports**: Create individual or batch reports for students

### Daily Operations
- **Dashboard**: Monitor overall performance and quick statistics
- **Student Registry**: View and manage all student records
- **Report Generation**: Create and print terminal reports
- **Analytics**: Review performance trends and identify areas needing attention

## File Structure

```
gradewise-pro/
|-- gradewise-pro.html          # Main application interface
|-- gradewise-pro.js            # Core application logic
|-- auth.js                     # Authentication system
|-- groups.html                 # Group management interface
|-- settings.html               # Application settings
|-- analysis.html               # Analytics dashboard
|-- import-results.html         # Data import interface
|-- batch-printing.html         # Batch report generation
|-- ai-report-editor.html       # AI-powered report editing
|-- ai-code-access.html         # AI development tools
|-- ai-settings.html            # AI configuration
|-- login.html                  # Login interface
|-- report-template.html        # Report template system
|-- style.css                   # Application styles
|-- main.js                     # Additional functionality
|-- performance-monitor.js      # Performance tracking
|-- test-suite.js               # Testing framework
|-- test-runner.html            # Test interface
|-- claude_api.py               # Python API integration
|-- email_sender.py             # Email functionality
|-- assets/                     # Static assets
|-- Templates/                  # Report templates
|-- dist/                       # Distribution files
```

## Configuration

### School Settings
- School name and motto
- Academic term and year
- Administrator details
- Address and contact information

### AI Features
- API key configuration for AI services
- Custom report templates
- Intelligent grade analysis

### Email Settings
- SMTP configuration for report delivery
- Email templates and customization

## Data Management

### Data Storage
- **Local Storage**: Primary data storage in browser localStorage
- **Export/Import**: JSON format for data backup and migration
- **Cloud Sync**: Optional cloud synchronization (requires configuration)

### Backup Recommendations
1. Regularly export student data using the export feature
2. Keep copies of report templates
3. Backup configuration settings

## API Integration

### Supported APIs
- **Claude API**: For AI-powered features
- **Email Services**: SMTP and third-party email providers
- **Cloud Storage**: Optional cloud backup services

### API Configuration
```javascript
// Example API configuration in ai-settings.html
const apiConfig = {
    claudeApiKey: "your-api-key-here",
    emailService: "smtp",
    cloudBackup: false
};
```

## Security

### Authentication
- Session-based authentication
- PIN-protected sensitive operations
- Secure data handling practices

### Data Privacy
- All data stored locally by default
- No data transmitted to external servers without explicit consent
- GDPR-compliant data handling

## Contributing

We welcome contributions to improve GradeWise Pro! Please follow these guidelines:

### Development Guidelines
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

### Code Standards
- Use semantic HTML5
- Follow JavaScript ES6+ standards
- Maintain responsive design principles
- Test across multiple browsers

### Bug Reports
Please report bugs using the GitHub Issues tab with:
- Clear description of the issue
- Steps to reproduce
- Browser and environment details
- Expected vs actual behavior

## Testing

### Running Tests
```bash
# Open test runner in browser
open test-runner.html

# Or run with local server
python -m http.server 8000
# Then navigate to http://localhost:8000/test-runner.html
```

### Test Coverage
- Core functionality tests
- UI interaction tests
- Data validation tests
- Performance benchmarks

## Deployment

### Production Deployment
1. Copy files to web server
2. Ensure proper MIME types are configured
3. Set up HTTPS for secure connections
4. Configure backup systems

### Docker Deployment
```dockerfile
# Example Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Support

### Documentation
- [User Manual](docs/user-manual.md)
- [Developer Guide](docs/developer-guide.md)
- [API Documentation](docs/api-docs.md)

### Community
- [GitHub Discussions](https://github.com/yourusername/gradewise-pro/discussions)
- [Issue Tracker](https://github.com/yourusername/gradewise-pro/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 2.0.0
- Enhanced group management system
- Improved navigation with breadcrumbs
- AI-powered report editing
- Multi-language support
- Offline-first architecture
- Enhanced security features

### Version 1.0.0
- Initial release with core functionality
- Student management system
- Report generation
- Basic analytics

## Acknowledgments
- Storage preferences
- Security and access control
- Audit log monitoring
- Backup management
- Custom AI behavior settings

### 📊 **Analytics & Reporting**
- Class-wide analytics dashboard
- Performance insights
- Batch report generation
- Data export capabilities
- Visual performance charts

---

## 🚀 Quick Start

### Option 1: Run Portable Executable (Easiest)

1. **Download** `GradeWise Pro-2.0.0-portable.exe`
2. **Double-click** the executable
3. **Login** with Google account or local credentials
4. **Start using** immediately!

No installation required ✓

### Option 2: Build from Source

```bash
# Clone or navigate to project
cd "e:\Applications\KTL WISE PRO"

# Install dependencies
npm install

# Run in development mode
npm start

# Build portable executable
npm run build-portable
```

---

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10 or higher (64-bit)
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Internet**: Required for Google OAuth and AI features

### Recommended Requirements
- **OS**: Windows 11
- **RAM**: 8 GB or more
- **Storage**: 1 GB available space
- **Internet**: High-speed connection for optimal performance

### Required for Full Features
- **Google Account**: For authentication and cloud sync
- **Claude API Key**: For AI-powered report suggestions
- **Internet Connection**: For cloud features and AI services

---

## 🔧 Setup & Configuration

### Step 1: Launch Application

```
Double-click: GradeWise Pro-2.0.0-portable.exe
```

### Step 2: Initial Setup

1. **Choose Authentication**:
   - Google OAuth (recommended for cloud features)
   - Local credentials (for offline use)

2. **Select Storage**:
   - **Google Cloud**: Sync to Google Drive
   - **Local Storage**: Keep data on computer only

3. **Configure AI Features** (optional):
   - Go to **AI Configuration**
   - Enter Claude API key from https://console.anthropic.com/
   - Test connection
   - Save settings

### Step 3: Add First Student

1. Click **+ Add Student**
2. Enter student details:
   - Name, Class, Roll Number
   - Grades for each subject
   - Additional remarks
3. Click **Save**

### Step 4: Generate Reports

1. Select student record
2. Click **Generate Report**
3. View formatted report
4. Use **AI Report Editor** for suggestions
5. Export or print

---

## 🤖 Using AI Features

### AI Report Editor

```
Dashboard → Select Student → AI Report Editor
```

**Features**:
- Select section: Remarks / Grades / Stats
- Enter AI instruction (e.g., "Make feedback encouraging")
- Choose writing tone
- Click "Generate"
- Review AI suggestion
- Click "Apply" to save

**Example Prompts**:
- "Make this more encourages and constructive"
- "Highlight areas needing improvement"
- "Simplify language for parent understanding"
- "Add specific examples of progress"

### AI Code Access

```
AI Configuration → AI Code Access
```

**Features**:
- Browse source code safely
- View access logs
- Limited to read-only by default
- No access to API keys or secrets

---

## 📁 File Structure

```
GradeWise Pro/
├── gradewise-pro.html        # Main dashboard
├── gradewise-pro.js          # Shared utilities
├── google-auth.html          # Google authentication
├── ai-report-editor.html     # AI-powered editor
├── ai-code-access.html       # Code browser
├── ai-settings.html          # Configuration hub
├── batch-printing.html       # Batch operations
├── analysis.html             # Analytics dashboard
├── style.css                 # Unified styling
├── main.js                   # Electron process
├── preload.js                # Security bridge
├── package.json              # Dependencies
└── dist/
    ├── GradeWise Pro-2.0.0-portable.exe
    └── win-unpacked/
```

---

## 🔐 Security & Privacy

### Data Protection
- API keys encrypted and stored securely
- OAuth 2.0 for authentication
- HTTPS for all cloud communications
- User data never shared with third parties

### Access Control
- Role-based permissions (Admin, Teacher, Viewer)
- Audit logging of all access
- Session management with automatic timeout
- Restricted access to sensitive files

### Backup & Recovery
- Automatic backups to Google Drive (if enabled)
- Manual backup and restore functionality
- Version history tracking
- Data recovery tools

---

## 🔑 API Configuration

### Claude API Setup

1. **Get API Key**:
   - Visit https://console.anthropic.com/
   - Create account or sign in
   - Generate API key
   - Copy key (format: `sk-ant-xxxxx...`)

2. **Add to GradeWise Pro**:
   - Open **AI Configuration**
   - Go to **Claude API Configuration**
   - Paste API key in input field
   - Click **Test Connection**
   - Click **Save API Key**

3. **Usage Limits**:
   - Free tier: Limited requests
   - Paid tier: Based on usage
   - Check billing at https://console.anthropic.com/account/billing

### Google OAuth Setup

1. **Create Google Project**:
   - Visit https://console.developers.google.com/
   - Create new project
   - Enable OAuth 2.0
   - Create credentials (OAuth Client ID)

2. **Configure Redirect URI**:
   - Set to: `http://localhost:3000/auth-callback`
   - Save credentials
   - Copy Client ID and Secret

3. **Add to .env** (if running from source):
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

---

## 📊 Features Guide

### Dashboard
- View quick summary of students
- Recent activities
- Quick action buttons
- Navigation to all features

### Student Management
- Add/Edit/Delete students
- Search and filter
- Bulk operations
- Class-wise organization

### Report Generation
- Generate individual reports
- Batch printing
- Multiple formats
- Customizable templates
- Export to PDF/Print

### Analytics
- Class performance trends
- Subject-wise analysis
- Student progress tracking
- Visual charts and graphs

### Email Integration
- Send reports via email
- Bulk email to parents
- Email templates
- Recipient management

### Batch Operations
- Print multiple reports
- Bulk data imports
- Mass updates
- Export data

---

## 🛠️ Troubleshooting

### Application Won't Start

**Problem**: Executable won't run

**Solutions**:
1. Ensure Windows 10+ (64-bit)
2. Check file isn't corrupted
3. Right-click → Run as Administrator
4. Disable antivirus temporarily (if flagged)

### AI Features Not Working

**Problem**: AI suggestions not generating

**Solutions**:
1. Verify Claude API key is set (Settings → Claude API)
2. Test connection button should show success
3. Check internet connection
4. Verify API key hasn't exceeded quota
5. Review browser console for errors (F12)

### Cloud Sync Issues

**Problem**: Data not syncing to Google Drive

**Solutions**:
1. Verify Google account is logged in
2. Check internet connection
3. Enable auto-sync in Settings → Storage
4. Try manual sync button
5. Verify Google Drive has storage space

### Slow Performance

**Problem**: Application running slowly

**Solutions**:
1. Close other applications using resources
2. Clear browser cache (F12 → Application → Clear)
3. Ensure sufficient RAM available
4. Check disk space (min 500 MB free)
5. Try restarting the application

### Report Editor Shows Errors

**Problem**: Can't generate report or edit fails

**Solutions**:
1. Verify student data is complete
2. Check Claude API quota
3. Review browser console (F12)
4. Try shorter prompts
5. Check network connection

---

## 📈 Performance Tips

### For Faster Operation
1. **Regular Cleanup**: Delete unused student records
2. **Backup Regularly**: Prevent data loss
3. **Close Other Apps**: Free up system resources
4. **Update Windows**: Keep OS current
5. **Monitor Storage**: Maintain 500 MB+ free space

### For Better AI Results
1. **Be Specific**: Detailed prompts = better suggestions
2. **Use Examples**: Reference successful past edits
3. **Select Tone**: Match tone to audience
4. **Review Suggestions**: Don't blindly apply changes
5. **Provide Context**: Include student background info

---

## 🔄 Updates & Maintenance

### Check for Updates
1. Open **AI Configuration**
2. Go to **About** section
3. Current version displayed
4. Download updates from official site

### Backup Before Update
```
AI Configuration → Backup & Restore → Create Backup
```

### Database Maintenance
- Regular backups (weekly recommended)
- Archive old records annually
- Clear audit logs (monthly)
- Monitor storage usage

---

## 📞 Support & Documentation

### Getting Help

**In-App Help**:
- Hover over fields for tooltips
- Check Settings for documentation links
- Review audit logs (Settings → Audit Logs)

**Online Resources**:
- Official Website: https://gradewise.io
- Documentation: https://docs.gradewise.io
- Support Portal: https://support.gradewise.io
- FAQ: https://gradewise.io/faq

**Contact Support**:
- Email: support@gradewise.io
- Discord: Join community server
- GitHub: Report issues

---

## 🐛 Reporting Issues

Found a bug? Help us improve!

**Report Here**:
1. Note exact steps to reproduce
2. Screenshot of error (if applicable)
3. Browser console output (F12)
4. System information
5. Send to: support@gradewise.io

**Include**:
- Version number
- Windows version
- Error message
- Steps to reproduce

---

## 📜 License

**MIT License** - Free to use and distribute

See LICENSE file for details

---

## 🙏 Credits

### Built With
- **Electron** - Desktop framework
- **Google APIs** - Authentication & Drive
- **Claude AI** - Anthropic
- **Node.js** - Runtime
- **electron-builder** - Packaging

### Contributors
- KTL Wise Pro Team
- Open source community

---

## 🚀 Roadmap

### Upcoming Features
- 📱 Mobile app (iOS/Android)
- 🌍 Multi-language support
- 📊 Advanced analytics
- 🤖 More AI capabilities
- 🔐 Two-factor authentication
- 📱 WhatsApp notifications
- 🎨 Custom templates
- 🌐 Web version

### In Development
- [ ] Offline-first sync
- [ ] Advanced reporting
- [ ] REST API
- [ ] Developer plugins
- [ ] Custom AI models

---

## ⚡ Quick Commands

### Keyboard Shortcuts
- `Ctrl+S` - Save current record
- `Ctrl+P` - Print/Export
- `Ctrl+F` - Search/Filter
- `F1` - Help
- `F11` - Full screen
- `F12` - Developer console

### Common Tasks

**Add Student**:
```
Dashboard → + Add Student → Fill Form → Save
```

**Edit Report**:
```
Dashboard → Select Student → Click Report → AI Editor
```

**Generate Backup**:
```
AI Configuration → Backup → Create Backup
```

**Configure API**:
```
AI Configuration → Claude API → Enter Key → Test → Save
```

---

## 📊 System Statistics

| Metric | Value |
|--------|-------|
| Version | 2.0.0 |
| File Size | 88.58 MB (Portable) |
| Build Date | April 2026 |
| Platform | Windows 64-bit |
| Node Version | 25.8.0+ |
| Electron | 41.0.3+ |
| License | MIT |

---

## 🎓 Educational Features

### For Teachers
✓ Student record management  
✓ Grade tracking  
✓ Report generation  
✓ Batch operations  
✓ Performance analytics  
✓ Parent communication  

### For Administrators
✓ User management  
✓ Data backup & recovery  
✓ Audit logging  
✓ System configuration  
✓ Access control  
✓ Usage analytics  

### For Developers
✓ Open source (MIT)  
✓ Well-documented code  
✓ API ready  
✓ Plugin architecture  
✓ Source code access  

---

## 🔮 Vision

GradeWise Pro aims to transform educational management by:
- **Reducing** administrative burden on teachers
- **Improving** quality of student feedback
- **Leveraging** AI to enhance reporting
- **Secure** storage and privacy protection
- **Empowering** educators with modern tools

---

## 📝 Version History

### v2.0.0 (Current - April 2026)
- ✨ Google OAuth authentication
- 🤖 AI Report Editor with Claude
- 🔐 AI Code Access with audit logs
- ☁️ Cloud & Local storage sync
- ⚙️ Comprehensive settings UI
- 📋 Complete documentation

### v1.5.0
- Code refactoring
- Modular page architecture
- CSS consolidation

### v1.0.0
- Initial release
- Basic student management
- Report generation

---

## 💡 Tips & Tricks

### Pro Tips
1. **Use Tone Selection**: Match writing style to audience
2. **Enable Auto-Sync**: Keep data fresh
3. **Regular Backups**: Never lose data
4. **Review Audit Logs**: Know who accessed what
5. **Customize Prompts**: Better AI results

### Common Use Cases
- **Parent Communication**: Use "Warm" tone
- **Formal Reports**: Use "Formal" tone
- **Quick Notes**: Use "Concise" tone
- **Detailed Analysis**: Use "Detailed" tone

---

## 🎉 Getting Started Now

1. **Download** the portable executable
2. **Run** GradeWise Pro-2.0.0-portable.exe
3. **Setup** your account (Local or Google)
4. **Add** students
5. **Generate** reports
6. **Enjoy** AI-powered features!

---

## 📧 Contact & Feedback

We'd love to hear from you!

- **Email**: hello@gradewise.io
- **Phone**: +1 (555) 123-4567
- **Website**: https://gradewise.io
- **Social**: @GradeWisePro

---

## ⚖️ Legal

- **License**: MIT
- **Terms of Service**: https://gradewise.io/terms
- **Privacy Policy**: https://gradewise.io/privacy
- **Data Protection**: GDPR Compliant

---

**Made with ❤️ by the GradeWise Pro Team**

*Empowering educators with AI-powered student management*

---

*Last Updated: April 1, 2026*  
*Version: 2.0.0*
