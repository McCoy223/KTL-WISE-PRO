// Core shared client logic for GradeWise Pro dashboard

// Authentication check - redirect to login if not authenticated
function checkAuthentication ()
{
    // Load auth manager if available
    if (typeof window.authManager === 'undefined') {
        // Try to load auth manager
        const script = document.createElement('script');
        script.src = 'auth.js';
        script.onload = () =>
        {
            performAuthCheck();
        };
        document.head.appendChild(script);
    } else {
        performAuthCheck();
    }
}

function performAuthCheck ()
{
    if (!window.authManager) {
        console.error('Auth manager not available');
        window.location.href = 'login.html';
        return;
    }

    // Check if user is authenticated
    if (!window.authManager.isSessionValid()) {
        console.log('No valid session found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // User is authenticated, proceed with app initialization
    console.log('User authenticated, initializing app');
    init();
}

let students = JSON.parse(localStorage.getItem('gw_students') || '[]');
let settings = JSON.parse(localStorage.getItem('gw_settings') || '{"schoolName":"My School","motto":"Excellence in Education","term":"Term 2","year":"2025/2026","head":"","address":"","logoData":"","apiKey":"","lang":"English"}');
let batchQueue = JSON.parse(localStorage.getItem('gw_batch') || '[]');
let emailLog = JSON.parse(localStorage.getItem('gw_email_log') || '[]');
let attendanceData = JSON.parse(localStorage.getItem('gw_attendance') || '{}');

function init ()
{
    // Check authentication first
    checkAuthentication();

    loadSettingsForm();
    updateStats();
    renderRecentStudents();
    renderStudentsTable();
    renderReportSelect();
    updateNavEmailCount();
    applyDarkMode();
    setLang(settings.lang || 'en');

    // Setup logout functionality
    setupLogoutButton();
}

function setupLogoutButton ()
{
    const logoutButton = document.querySelector('[onclick="logout()"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) =>
        {
            e.preventDefault();
            performLogout();
        });
    }
}

function performLogout ()
{
    if (window.authManager) {
        window.authManager.logout();
    } else {
        // Fallback logout
        localStorage.removeItem('gw_session');
        localStorage.removeItem('gw_current_user');
        window.location.href = 'login.html';
    }
}

// Make logout available globally
window.logout = performLogout;

function loadSettingsForm ()
{
    if (!document.getElementById('s-name')) return;
    document.getElementById('s-name').value = settings.schoolName || '';
    document.getElementById('s-motto').value = settings.motto || '';
    document.getElementById('s-year').value = settings.year || '2025/2026';
    document.getElementById('s-head').value = settings.head || '';
    document.getElementById('s-address').value = settings.address || '';
    document.getElementById('s-lang').value = settings.lang || 'English';
}

function saveSettings ()
{
    if (!document.getElementById('s-name')) return;
    settings.schoolName = document.getElementById('s-name').value;
    settings.motto = document.getElementById('s-motto').value;
    settings.year = document.getElementById('s-year').value;
    settings.head = document.getElementById('s-head').value;
    settings.address = document.getElementById('s-address').value;
    settings.lang = document.getElementById('s-lang').value;
    localStorage.setItem('gw_settings', JSON.stringify(settings));
    if (window.saveDataPersistent) window.saveDataPersistent();
    alert('✅ Settings saved!');
    updateStats();
}

function showView (id)
{
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + id);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i =>
    {
        if (i.getAttribute('onclick')?.includes("'" + id + "'")) i.classList.add('active');
    });

    // Update breadcrumb navigation
    updateBreadcrumb(id);

    const t = {
        dashboard: 'Dashboard',
        students: 'Student Registry',
        'add-student': 'Add Student',
        report: 'Report Preview',
        batch: 'Batch Export',
        'email-log': 'Email Log',
        analytics: 'Performance Charts',
        attendance: 'Attendance',
        'import-results': 'Import Results',
        portal: 'Parent Portal',
        settings: 'School Settings',
        groups: 'Groups'
    };
    const title = document.getElementById('topbar-title');
    if (title) title.textContent = t[id] || 'GradeWise Pro';
}

function updateBreadcrumb (viewId)
{
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const breadcrumbMap = {
        dashboard: [{ text: 'Home', active: false }],
        students: [{ text: 'Home', active: false }, { text: 'Students', active: true }],
        'add-student': [{ text: 'Home', active: false }, { text: 'Students', active: false }, { text: 'Add Student', active: true }],
        report: [{ text: 'Home', active: false }, { text: 'Reports', active: false }, { text: 'Report Preview', active: true }],
        batch: [{ text: 'Home', active: false }, { text: 'Reports', active: false }, { text: 'Batch Export', active: true }],
        'email-log': [{ text: 'Home', active: false }, { text: 'Reports', active: false }, { text: 'Email Log', active: true }],
        analytics: [{ text: 'Home', active: false }, { text: 'Analytics', active: true }],
        attendance: [{ text: 'Home', active: false }, { text: 'Attendance', active: true }],
        'import-results': [{ text: 'Home', active: false }, { text: 'Import', active: false }, { text: 'Import Results', active: true }],
        portal: [{ text: 'Home', active: false }, { text: 'Parent Portal', active: true }],
        settings: [{ text: 'Home', active: false }, { text: 'Settings', active: true }]
    };

    const crumbs = breadcrumbMap[viewId] || [{ text: 'Home', active: false }];

    breadcrumb.innerHTML = crumbs.map((crumb, index) =>
    {
        const isLast = index === crumbs.length - 1;
        const separator = isLast ? '' : ' <span class="mx-2">›</span> ';
        const className = crumb.active ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700 cursor-pointer';
        const onClick = crumb.active ? '' : `onclick="navigateToBreadcrumb('${crumb.text}')"`;
        return `<span class="${className}" ${onClick}>${crumb.text}</span>${separator}`;
    }).join('');
}

function navigateToBreadcrumb (crumbText)
{
    const navigationMap = {
        'Home': 'dashboard',
        'Students': 'students',
        'Reports': 'report',
        'Analytics': 'analytics',
        'Import': 'import-results',
        'Settings': 'settings'
    };

    const viewId = navigationMap[crumbText];
    if (viewId) {
        showView(viewId);
    }
}

function toggleSidebar ()
{
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('show');
}

function closeSidebar ()
{
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
}

function setLang (lang)
{
    if (!lang) return;
    settings.lang = lang;
    localStorage.setItem('gw_settings', JSON.stringify(settings));
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.textContent === lang.toUpperCase()));
    setLangTexts(lang);
}

function setLangTexts (lang)
{
    const translations = {
        en: { dashboard: 'Dashboard', students: 'Student Registry', addStudent: 'Add Student', report: 'Report Preview', batch: 'Batch Export', analytics: 'Performance Charts', attendance: 'Attendance', importResults: 'Import Results', portal: 'Parent Portal', settings: 'School Settings', emailLog: 'Email Log' },
        fr: { dashboard: 'Tableau de Bord', students: 'Registre des Élèves', addStudent: 'Ajouter un Élève', report: 'Aperçu du Bulletin', batch: 'Export en Lot', analytics: 'Graphiques de Performance', attendance: 'Présence', importResults: 'Importer les Résultats', portal: 'Portail Parents', settings: 'Paramètres', emailLog: 'Journal Email' }
    };
    const t = translations[lang] || translations.en;
    document.querySelectorAll('.nav-item').forEach(item =>
    {
        const key = item.getAttribute('onclick')?.match(/showView\('([\w\-]+)'\)/)?.[1];
        if (key && t[key]) item.childNodes[1] && (item.childNodes[1].textContent = t[key]);
    });
}

function updateStats ()
{
    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = students.length;
    const statAvg = document.getElementById('stat-avg');
    if (statAvg) {
        const avg = students.length ? (students.reduce((acc, s) => acc + (s.avg || 0), 0) / students.length).toFixed(1) : '—';
        statAvg.textContent = avg === '—' ? avg : `${avg}%`;
    }
    const statAttention = document.getElementById('stat-attention');
    if (statAttention) statAttention.textContent = students.filter(s => s.avg < 50).length;
}

function renderRecentStudents ()
{
    const tbody = document.getElementById('recent-students-tbody');
    if (!tbody) return;
    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:24px;">No students yet.</td></tr>';
        return;
    }
    const recent = students.slice(-5).reverse();
    tbody.innerHTML = recent.map(s => `<tr><td><strong>${s.name}</strong></td><td>${s.class}</td><td>${s.avg}%</td><td><span class="badge badge-${s.avg >= 80 ? 'green' : s.avg >= 70 ? 'blue' : s.avg >= 60 ? 'gold' : s.avg >= 50 ? 'gold' : 'red'}">${s.avg >= 80 ? 'A' : s.avg >= 70 ? 'B' : s.avg >= 60 ? 'C' : s.avg >= 50 ? 'D' : 'F'}</span></td></tr>`).join('');
}

function renderStudentsTable ()
{
    const tbl = document.getElementById('students-grouped-body');
    if (!tbl) return;
    if (!students.length) {
        tbl.innerHTML = '<div class="text-muted" style="text-align:center;padding:32px;">No students found.</div>'; return;
    }
    tbl.innerHTML = '<table><thead><tr><th>Name</th><th>Class</th><th>Average</th></tr></thead><tbody>' + students.map(s => `<tr><td>${s.name}</td><td>${s.class}</td><td>${s.avg}%</td></tr>`).join('') + '</tbody></table>';
}

function updateNavEmailCount ()
{
    const badge = document.getElementById('nav-email-count');
    if (!badge) return;
    const queued = emailLog.filter(e => e.status === 'queued' || e.status === 'draft').length;
    if (queued) { badge.style.display = 'inline-block'; badge.textContent = queued; } else { badge.style.display = 'none'; }
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('online', () => document.getElementById('conn-label') && (document.getElementById('conn-label').textContent = 'Online'));
window.addEventListener('offline', () => document.getElementById('conn-label') && (document.getElementById('conn-label').textContent = 'Offline'));
