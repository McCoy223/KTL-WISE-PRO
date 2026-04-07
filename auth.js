/**
 * Authentication and Session Management System
 * Handles user authentication, session management, and security
 */

const firebaseConfig = typeof window !== 'undefined' ? window.firebaseConfig : null;

class AuthManager
{
    constructor()
    {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.firebaseEnabled = false;
        this.auth = null;
        this.initFirebase();
        this.init();
    }

    init ()
    {
        this.ensureDefaultUser();
        this.loadSession();
        this.setupSessionMonitoring();
        this.setupSecurityListeners();
    }

    initFirebase ()
    {
        if (typeof firebase === 'undefined' || !firebaseConfig) {
            console.warn('Firebase is not available. Falling back to local auth.');
            this.firebaseEnabled = false;
            return;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.auth = firebase.auth();
            this.firebaseEnabled = true;

            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = {
                        userId: user.uid,
                        username: user.displayName || user.email,
                        email: user.email,
                        role: 'teacher',
                        permissions: ['read', 'write', 'export'],
                        loginTime: new Date().toISOString(),
                        lastActivity: new Date().toISOString(),
                        authMethod: 'firebase',
                        sessionId: this.generateSessionId()
                    };
                    this.saveSession();
                    this.startSessionTimer();
                } else if (!this.currentUser) {
                    this.clearSession();
                }
            });
        } catch (error) {
            console.warn('Firebase init error:', error);
            this.firebaseEnabled = false;
            this.auth = null;
        }
    }

    // Ensure default admin user exists
    ensureDefaultUser ()
    {
        const users = JSON.parse(localStorage.getItem('gw_users') || '{}');

        if (!users.admin) {
            // Create default admin user
            const defaultUser = {
                username: 'admin',
                fullName: 'System Administrator',
                email: 'admin@gradewise.local',
                password: this.hashPassword('admin123'),
                role: 'administrator',
                createdAt: new Date().toISOString(),
                isActive: true,
                isDefault: true
            };

            users.admin = defaultUser;
            localStorage.setItem('gw_users', JSON.stringify(users));

            // Log the creation
            this.logAuditEvent('USER_CREATED', 'admin', 'Default admin user created automatically');
        }
    }

    // User Authentication
    async authenticateUser (username, password, rememberMe = false)
    {
        try {
            // Check if user is locked out
            if (this.isUserLockedOut(username)) {
                return {
                    success: false,
                    error: 'Account temporarily locked due to multiple failed attempts. Please try again later.'
                };
            }

            if (this.firebaseEnabled && this.auth) {
                const email = username.includes('@') ? username : `${username}@example.com`;

                const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
                const firebaseUser = userCredential.user;

                if (!firebaseUser) {
                    this.recordFailedAttempt(username);
                    return { success: false, error: 'Invalid email or password' };
                }

                this.clearFailedAttempts(username);

                const session = {
                    userId: firebaseUser.uid,
                    username: firebaseUser.displayName || firebaseUser.email || username,
                    email: firebaseUser.email,
                    role: 'teacher',
                    permissions: ['read', 'write', 'export'],
                    loginTime: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    rememberMe: rememberMe,
                    authMethod: 'firebase',
                    sessionId: this.generateSessionId()
                };

                this.currentUser = session;
                this.saveSession();
                this.startSessionTimer();

                this.auditLog('FIREBASE_LOGIN_SUCCESS', session.userId, 'User logged in with Firebase');

                return {
                    success: true,
                    user: {
                        username: session.username,
                        email: session.email,
                        role: session.role,
                        permissions: session.permissions
                    }
                };
            }

            // Local storage fallback
            const users = JSON.parse(localStorage.getItem('gw_users') || '{}');
            let user = users[username];
            if (!user) {
                user = Object.values(users).find((u) => u.email === username || u.username === username);
            }

            if (!user) {
                this.recordFailedAttempt(username);
                return { success: false, error: 'Invalid username or password' };
            }

            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                this.recordFailedAttempt(username);
                return { success: false, error: 'Invalid username or password' };
            }

            this.clearFailedAttempts(username);

            const session = {
                userId: username,
                username: user.fullName || username,
                role: user.role || 'teacher',
                permissions: user.permissions || [],
                loginTime: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                rememberMe: rememberMe,
                sessionId: this.generateSessionId()
            };

            this.currentUser = session;
            this.saveSession();
            this.startSessionTimer();

            this.auditLog('LOGIN_SUCCESS', username, 'User logged in successfully');

            return {
                success: true,
                user: {
                    username: session.username,
                    role: session.role,
                    permissions: session.permissions
                }
            };

        } catch (error) {
            this.auditLog('LOGIN_ERROR', username, `Login error: ${error.message}`);
            return { success: false, error: error.message || 'Authentication system error' };
        }
    }

    // Google OAuth Integration
    async authenticateWithGoogle ()
    {
        try {
            if (this.firebaseEnabled && this.auth) {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await this.auth.signInWithPopup(provider);
                const user = result.user;

                if (!user) {
                    return { success: false, error: 'Google authentication failed' };
                }

                const session = {
                    userId: user.uid,
                    username: user.displayName || user.email,
                    email: user.email,
                    role: 'teacher',
                    permissions: ['read', 'write', 'export'],
                    loginTime: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    authMethod: 'firebase-google',
                    sessionId: this.generateSessionId()
                };

                this.currentUser = session;
                this.saveSession();
                this.startSessionTimer();

                this.auditLog('GOOGLE_LOGIN_SUCCESS', user.uid, 'User logged in via Firebase Google');

                return {
                    success: true,
                    user: {
                        username: session.username,
                        email: session.email,
                        role: session.role,
                        permissions: session.permissions
                    }
                };
            }

            // Fallback to local mock Google auth
            return {
                success: true,
                user: {
                    username: 'Google User',
                    email: 'google-user@example.com',
                    role: 'teacher',
                    permissions: ['read', 'write', 'export']
                }
            };

        } catch (error) {
            this.auditLog('GOOGLE_LOGIN_ERROR', 'firebase-google', `Google login error: ${error.message}`);
            return { success: false, error: error.message || 'Google authentication failed' };
        }
    }

    // Session Management
    logout ()
    {
        if (this.currentUser) {
            this.auditLog('LOGOUT', this.currentUser.userId, 'User logged out');
        }

        if (this.firebaseEnabled && this.auth) {
            this.auth.signOut().catch(() => {});
        }

        this.currentUser = null;
        this.clearSessionTimer();
        localStorage.removeItem('gw_session');

        // Redirect to login page
        if (window.location.pathname !== '/google-auth.html') {
            window.location.href = 'login.html';
        }
    }

    isSessionValid ()
    {
        if (!this.currentUser) return false;

        const now = new Date();
        const lastActivity = new Date(this.currentUser.lastActivity);
        const timeDiff = now - lastActivity;

        return timeDiff < this.sessionTimeout;
    }

    extendSession ()
    {
        if (this.currentUser) {
            this.currentUser.lastActivity = new Date().toISOString();
            this.saveSession();
            this.restartSessionTimer();
        }
    }

    // User Management
    async createUser (userData)
    {
        try {
            if (this.firebaseEnabled && this.auth) {
                const email = userData.email || `${userData.username}@example.com`;
                const userCredential = await this.auth.createUserWithEmailAndPassword(email, userData.password);
                const firebaseUser = userCredential.user;

                if (firebaseUser && userData.fullName) {
                    await firebaseUser.updateProfile({ displayName: userData.fullName });
                }

                this.auditLog('USER_CREATED', firebaseUser.uid, `Firebase user created with role: ${userData.role}`);
                return { success: true, message: 'User created successfully' };
            }

            const users = JSON.parse(localStorage.getItem('gw_users') || '{}');

            if (users[userData.username]) {
                return { success: false, error: 'Username already exists' };
            }

            const newUser = {
                fullName: userData.fullName,
                username: userData.username,
                email: userData.email,
                password: this.hashPassword(userData.password),
                role: userData.role || 'teacher',
                permissions: userData.permissions || ['read', 'write'],
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            };

            users[userData.username] = newUser;
            localStorage.setItem('gw_users', JSON.stringify(users));

            this.auditLog('USER_CREATED', userData.username, `User created with role: ${userData.role}`);

            return { success: true, message: 'User created successfully' };

        } catch (error) {
            return { success: false, error: error.message || 'Failed to create user' };
        }
    }

    // Security Features
    hashPassword (password)
    {
        // Simple hash for demo - use bcrypt in production
        return btoa(password + 'gradewise_salt_2024');
    }

    generateSessionId ()
    {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    isUserLockedOut (username)
    {
        const failedAttempts = JSON.parse(localStorage.getItem('gw_failed_attempts') || '{}');
        const userAttempts = failedAttempts[username];

        if (!userAttempts || userAttempts.count < this.maxLoginAttempts) {
            return false;
        }

        const lockoutTime = new Date(userAttempts.lockoutTime);
        const now = new Date();
        return (now - lockoutTime) < this.lockoutDuration;
    }

    recordFailedAttempt (username)
    {
        const failedAttempts = JSON.parse(localStorage.getItem('gw_failed_attempts') || '{}');
        const userAttempts = failedAttempts[username] || { count: 0, attempts: [] };

        userAttempts.count++;
        userAttempts.attempts.push(new Date().toISOString());

        if (userAttempts.count >= this.maxLoginAttempts) {
            userAttempts.lockoutTime = new Date().toISOString();
        }

        failedAttempts[username] = userAttempts;
        localStorage.setItem('gw_failed_attempts', JSON.stringify(failedAttempts));

        this.auditLog('LOGIN_FAILED', username, `Failed login attempt ${userAttempts.count}`);
    }

    clearFailedAttempts (username)
    {
        const failedAttempts = JSON.parse(localStorage.getItem('gw_failed_attempts') || '{}');
        delete failedAttempts[username];
        localStorage.setItem('gw_failed_attempts', JSON.stringify(failedAttempts));
    }

    // Session Monitoring
    setupSessionMonitoring ()
    {
        // Monitor user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event =>
        {
            document.addEventListener(event, () => this.extendSession(), true);
        });

        // Check session validity periodically
        setInterval(() =>
        {
            if (!this.isSessionValid()) {
                this.logout();
            }
        }, 60000); // Check every minute
    }

    setupSecurityListeners ()
    {
        // Prevent right-click in production
        document.addEventListener('contextmenu', (e) =>
        {
            if (process.env.NODE_ENV === 'production') {
                e.preventDefault();
            }
        });

        // Detect dev tools
        let devtools = {
            open: false,
            orientation: null
        };

        const threshold = 160;
        setInterval(() =>
        {
            if (window.outerHeight - window.innerHeight > threshold ||
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.auditLog('DEV_TOOLS_OPENED', this.currentUser?.userId || 'unknown', 'Developer tools detected');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    startSessionTimer ()
    {
        this.clearSessionTimer();
        this.sessionTimer = setTimeout(() =>
        {
            this.auditLog('SESSION_TIMEOUT', this.currentUser.userId, 'Session timed out');
            this.logout();
        }, this.sessionTimeout);
    }

    clearSessionTimer ()
    {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    restartSessionTimer ()
    {
        this.startSessionTimer();
    }

    // Storage Methods
    saveSession ()
    {
        if (this.currentUser) {
            localStorage.setItem('gw_session', JSON.stringify(this.currentUser));
        }
    }

    loadSession ()
    {
        try {
            const sessionData = localStorage.getItem('gw_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (this.isSessionValid()) {
                    this.currentUser = session;
                    this.startSessionTimer();
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            this.clearSession();
        }
    }

    clearSession ()
    {
        this.currentUser = null;
        localStorage.removeItem('gw_session');
        this.clearSessionTimer();
    }

    // Audit Logging
    auditLog (action, userId, details)
    {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            userId: userId || 'anonymous',
            details: details,
            userAgent: navigator.userAgent,
            ip: 'localhost' // In production, get actual IP
        };

        const logs = JSON.parse(localStorage.getItem('gw_audit_logs') || '[]');
        logs.push(logEntry);

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }

        localStorage.setItem('gw_audit_logs', JSON.stringify(logs));
    }

    // Permission Checking
    hasPermission (permission)
    {
        if (!this.currentUser) return false;
        return this.currentUser.permissions.includes(permission) || this.currentUser.permissions.includes('admin');
    }

    hasRole (role)
    {
        if (!this.currentUser) return false;
        return this.currentUser.role === role || this.currentUser.role === 'admin';
    }

    // Getters
    getCurrentUser ()
    {
        return this.currentUser;
    }

    isLoggedIn ()
    {
        return this.currentUser !== null && this.isSessionValid();
    }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
