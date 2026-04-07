/**
 * Performance Monitoring System for GradeWise Pro
 * Tracks application performance, memory usage, and optimization metrics
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: null,
            apiCalls: [],
            memoryUsage: [],
            renderTimes: [],
            errorCounts: {},
            userInteractions: []
        };
        
        this.observers = {
            performance: null,
            memory: null
        };
        
        this.thresholds = {
            apiCallTime: 5000, // 5 seconds
            memoryUsage: 100 * 1024 * 1024, // 100MB
            renderTime: 100, // 100ms
            errorRate: 0.05 // 5%
        };
        
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.setupMemoryMonitoring();
        this.setupErrorTracking();
        this.setupUserInteractionTracking();
        this.startPeriodicReporting();
        
        // Record initial page load
        if (performance.timing) {
            this.metrics.pageLoad = {
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                timestamp: new Date().toISOString()
            };
        }
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.observers.performance = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordPerformanceEntry(entry);
                }
            });
            
            this.observers.performance.observe({
                entryTypes: ['measure', 'navigation', 'resource', 'paint']
            });
        }
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: new Date().toISOString()
                };
                
                this.metrics.memoryUsage.push(memoryInfo);
                
                // Keep only last 100 entries
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Check memory threshold
                if (memoryInfo.used > this.thresholds.memoryUsage) {
                    this.reportPerformanceIssue('memory', 'High memory usage detected', memoryInfo);
                }
            }, 30000); // Check every 30 seconds
        }
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            const errorType = event.error?.name || 'UnknownError';
            this.metrics.errorCounts[errorType] = (this.metrics.errorCounts[errorType] || 0) + 1;
            
            this.recordUserInteraction('error', {
                type: errorType,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errorCounts['UnhandledPromise'] = (this.metrics.errorCounts['UnhandledPromise'] || 0) + 1;
            
            this.recordUserInteraction('unhandled_promise', {
                reason: event.reason
            });
        });
    }

    setupUserInteractionTracking() {
        ['click', 'keydown', 'scroll'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.recordUserInteraction(eventType, {
                    target: event.target.tagName,
                    timestamp: Date.now()
                });
            }, { passive: true });
        });
    }

    recordPerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'measure':
                this.metrics.renderTimes.push({
                    name: entry.name,
                    duration: entry.duration,
                    timestamp: new Date().toISOString()
                });
                
                if (entry.duration > this.thresholds.renderTime) {
                    this.reportPerformanceIssue('render', `Slow render time: ${entry.name}`, entry);
                }
                break;
                
            case 'resource':
                if (entry.duration > this.thresholds.apiCallTime) {
                    this.reportPerformanceIssue('resource', `Slow resource loading: ${entry.name}`, entry);
                }
                break;
        }
    }

    recordAPICall(apiName, duration, success = true) {
        const apiCall = {
            name: apiName,
            duration: duration,
            success: success,
            timestamp: new Date().toISOString()
        };
        
        this.metrics.apiCalls.push(apiCall);
        
        // Keep only last 50 API calls
        if (this.metrics.apiCalls.length > 50) {
            this.metrics.apiCalls.shift();
        }
        
        if (duration > this.thresholds.apiCallTime) {
            this.reportPerformanceIssue('api', `Slow API call: ${apiName}`, apiCall);
        }
    }

    recordUserInteraction(type, data) {
        const interaction = {
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        this.metrics.userInteractions.push(interaction);
        
        // Keep only last 200 interactions
        if (this.metrics.userInteractions.length > 200) {
            this.metrics.userInteractions.shift();
        }
    }

    startMeasure(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(`${name}-start`);
        }
    }

    endMeasure(name) {
        if ('performance' in window && 'mark' in performance && 'measure' in performance) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
        }
    }

    reportPerformanceIssue(type, message, data) {
        const issue = {
            type: type,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.warn(`⚠️ Performance Issue [${type}]: ${message}`, data);
        
        // Store performance issues
        const issues = JSON.parse(localStorage.getItem('gw_performance_issues') || '[]');
        issues.push(issue);
        
        // Keep only last 50 issues
        if (issues.length > 50) {
            issues.splice(0, issues.length - 50);
        }
        
        localStorage.setItem('gw_performance_issues', JSON.stringify(issues));
    }

    getPerformanceReport() {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        
        return {
            timestamp: new Date().toISOString(),
            pageLoad: this.metrics.pageLoad,
            memory: {
                current: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || null,
                peak: Math.max(...this.metrics.memoryUsage.map(m => m.used)),
                average: this.metrics.memoryUsage.length > 0 
                    ? this.metrics.memoryUsage.reduce((sum, m) => sum + m.used, 0) / this.metrics.memoryUsage.length 
                    : 0
            },
            api: {
                total: this.metrics.apiCalls.length,
                averageDuration: this.metrics.apiCalls.length > 0 
                    ? this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls.length 
                    : 0,
                successRate: this.metrics.apiCalls.length > 0 
                    ? this.metrics.apiCalls.filter(call => call.success).length / this.metrics.apiCalls.length 
                    : 1
            },
            errors: this.metrics.errorCounts,
            interactions: {
                total: this.metrics.userInteractions.length,
                recent: this.metrics.userInteractions.filter(i => new Date(i.timestamp).getTime() > last24Hours).length
            },
            issues: JSON.parse(localStorage.getItem('gw_performance_issues') || '[]')
        };
    }

    getOptimizationSuggestions() {
        const report = this.getPerformanceReport();
        const suggestions = [];
        
        // Memory suggestions
        if (report.memory.current && report.memory.current.used > this.thresholds.memoryUsage * 0.8) {
            suggestions.push({
                type: 'memory',
                priority: 'high',
                message: 'High memory usage detected. Consider optimizing data structures or implementing pagination.',
                details: `Current usage: ${(report.memory.current.used / 1024 / 1024).toFixed(1)}MB`
            });
        }
        
        // API suggestions
        if (report.api.averageDuration > this.thresholds.apiCallTime * 0.5) {
            suggestions.push({
                type: 'api',
                priority: 'medium',
                message: 'API calls are taking longer than expected. Consider implementing caching or optimization.',
                details: `Average duration: ${report.api.averageDuration.toFixed(0)}ms`
            });
        }
        
        // Error suggestions
        const totalErrors = Object.values(report.errors).reduce((sum, count) => sum + count, 0);
        if (totalErrors > 10) {
            suggestions.push({
                type: 'errors',
                priority: 'high',
                message: 'High error rate detected. Review error logs and implement better error handling.',
                details: `Total errors: ${totalErrors}`
            });
        }
        
        // Page load suggestions
        if (report.pageLoad && report.pageLoad.loadComplete > 3000) {
            suggestions.push({
                type: 'page_load',
                priority: 'medium',
                message: 'Slow page load time detected. Consider optimizing assets and lazy loading.',
                details: `Load time: ${report.pageLoad.loadComplete}ms`
            });
        }
        
        return suggestions;
    }

    startPeriodicReporting() {
        setInterval(() => {
            const report = this.getPerformanceReport();
            console.log('📊 Performance Report:', report);
            
            // Store periodic reports
            const reports = JSON.parse(localStorage.getItem('gw_performance_reports') || '[]');
            reports.push(report);
            
            // Keep only last 24 hours of reports (one per hour)
            if (reports.length > 24) {
                reports.splice(0, reports.length - 24);
            }
            
            localStorage.setItem('gw_performance_reports', JSON.stringify(reports));
        }, 60 * 60 * 1000); // Every hour
    }

    clearMetrics() {
        this.metrics = {
            pageLoad: null,
            apiCalls: [],
            memoryUsage: [],
            renderTimes: [],
            errorCounts: {},
            userInteractions: []
        };
        
        localStorage.removeItem('gw_performance_issues');
        localStorage.removeItem('gw_performance_reports');
    }

    exportMetrics() {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            performanceIssues: JSON.parse(localStorage.getItem('gw_performance_issues') || '[]'),
            performanceReports: JSON.parse(localStorage.getItem('gw_performance_reports') || '[]'),
            optimizationSuggestions: this.getOptimizationSuggestions()
        };
        
        return exportData;
    }
}

// Global performance monitor instance
window.performanceMonitor = new PerformanceMonitor();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}

// Helper functions for common performance tracking
window.trackAPICall = async function(apiName, apiFunction) {
    const startTime = Date.now();
    let success = false;
    
    try {
        const result = await apiFunction();
        success = true;
        return result;
    } catch (error) {
        console.error(`API Error [${apiName}]:`, error);
        throw error;
    } finally {
        const duration = Date.now() - startTime;
        window.performanceMonitor.recordAPICall(apiName, duration, success);
    }
};

window.trackRender = function(componentName, renderFunction) {
    window.performanceMonitor.startMeasure(`render-${componentName}`);
    
    try {
        const result = renderFunction();
        window.performanceMonitor.endMeasure(`render-${componentName}`);
        return result;
    } catch (error) {
        window.performanceMonitor.endMeasure(`render-${componentName}`);
        throw error;
    }
};
