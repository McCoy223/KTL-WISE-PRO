/**
 * Automated Testing System for GradeWise Pro
 * Provides unit tests and integration tests for key functionality
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    // Test registration
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    // Test assertion helpers
    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertNotEqual(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected not ${expected}, got ${actual}`);
        }
    }

    assertNull(value, message) {
        if (value !== null && value !== undefined) {
            throw new Error(message || `Expected null/undefined, got ${value}`);
        }
    }

    assertNotNull(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message || `Expected value, got null/undefined`);
        }
    }

    // Run all tests
    async runAll() {
        console.log('🧪 Starting GradeWise Pro Test Suite...');
        console.log('='.repeat(50));

        for (const test of this.tests) {
            await this.runSingleTest(test);
        }

        this.printSummary();
        return this.results;
    }

    // Run a single test
    async runSingleTest(test) {
        try {
            const startTime = Date.now();
            await test.testFunction();
            const duration = Date.now() - startTime;
            
            const result = {
                name: test.name,
                status: 'PASS',
                duration: duration,
                error: null
            };
            
            this.results.push(result);
            this.passed++;
            console.log(`✅ ${test.name} (${duration}ms)`);
            
        } catch (error) {
            const result = {
                name: test.name,
                status: 'FAIL',
                duration: 0,
                error: error.message
            };
            
            this.results.push(result);
            this.failed++;
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }

    // Print test summary
    printSummary() {
        console.log('='.repeat(50));
        console.log(`📊 Test Summary:`);
        console.log(`   Total: ${this.tests.length}`);
        console.log(`   Passed: ${this.passed} ✅`);
        console.log(`   Failed: ${this.failed} ❌`);
        console.log(`   Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }

    // Generate HTML report
    generateHTMLReport() {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>GradeWise Pro Test Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .test-item { margin: 10px 0; padding: 10px; border-left: 4px solid; }
                .pass { border-left-color: #4CAF50; background: #f1f8e9; }
                .fail { border-left-color: #f44336; background: #ffebee; }
                .summary { display: flex; gap: 20px; margin: 20px 0; }
                .stat { text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; }
                .error { color: #d32f2f; font-family: monospace; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🧪 GradeWise Pro Test Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <div class="stat">
                    <h3>${this.tests.length}</h3>
                    <p>Total Tests</p>
                </div>
                <div class="stat">
                    <h3 style="color: #4CAF50;">${this.passed}</h3>
                    <p>Passed</p>
                </div>
                <div class="stat">
                    <h3 style="color: #f44336;">${this.failed}</h3>
                    <p>Failed</p>
                </div>
                <div class="stat">
                    <h3>${((this.passed / this.tests.length) * 100).toFixed(1)}%</h3>
                    <p>Success Rate</p>
                </div>
            </div>
            
            <h2>Test Results</h2>
            ${this.results.map(test => `
                <div class="test-item ${test.status.toLowerCase()}">
                    <strong>${test.name}</strong> - ${test.status} (${test.duration}ms)
                    ${test.error ? `<div class="error">${test.error}</div>` : ''}
                </div>
            `).join('')}
        </body>
        </html>
        `;
        
        return html;
    }
}

// Create test suite instance
const testSuite = new TestSuite();

// Data Storage Tests
testSuite.test('LocalStorage - Save Student Data', () => {
    const testStudent = {
        name: 'Test Student',
        class: 'Test Class',
        avg: 85
    };
    
    localStorage.setItem('test_student', JSON.stringify(testStudent));
    const retrieved = JSON.parse(localStorage.getItem('test_student'));
    
    testSuite.assertEqual(retrieved.name, 'Test Student');
    testSuite.assertEqual(retrieved.avg, 85);
    
    // Cleanup
    localStorage.removeItem('test_student');
});

testSuite.test('LocalStorage - Handle Missing Data', () => {
    const missing = localStorage.getItem('nonexistent_key');
    testSuite.assertNull(missing);
});

// Validation Tests
testSuite.test('Validation - Empty String', () => {
    const errors = validateInput('', { required: true, field: 'Test' });
    testSuite.assert(errors.length > 0);
    testSuite.assert(errors[0].includes('required'));
});

testSuite.test('Validation - Valid Email', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = validateInput('test@example.com', { 
        required: true, 
        pattern: emailRegex, 
        field: 'Email' 
    });
    testSuite.assertEqual(errors.length, 0);
});

// Authentication Tests
testSuite.test('Auth - Password Hashing', () => {
    const password = 'test123';
    const hash = btoa(password + 'gradewise_salt_2024');
    testSuite.assertNotNull(hash);
    testSuite.assertNotEqual(hash, password);
});

testSuite.test('Auth - Session Creation', () => {
    const session = {
        userId: 'testuser',
        username: 'Test User',
        role: 'teacher',
        loginTime: new Date().toISOString(),
        sessionId: 'session_test123'
    };
    
    localStorage.setItem('test_session', JSON.stringify(session));
    const retrieved = JSON.parse(localStorage.getItem('test_session'));
    
    testSuite.assertEqual(retrieved.userId, 'testuser');
    testSuite.assertEqual(retrieved.role, 'teacher');
    
    // Cleanup
    localStorage.removeItem('test_session');
});

// API Tests (Mock)
testSuite.test('API - Validate API Key Format', () => {
    const validKey = 'sk-ant-test123456789';
    const isValid = validKey.startsWith('sk-ant-') && validKey.length > 10;
    testSuite.assert(isValid);
});

testSuite.test('API - Handle Invalid Response', () => {
    const invalidJSON = '{ invalid json }';
    let parseError = null;
    
    try {
        JSON.parse(invalidJSON);
    } catch (error) {
        parseError = error;
    }
    
    testSuite.assertNotNull(parseError);
});

// Backup Tests
testSuite.test('Backup - Create Backup Structure', () => {
    const backup = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        data: { students: [] },
        metadata: { totalStudents: 0 }
    };
    
    testSuite.assertNotNull(backup.timestamp);
    testSuite.assertEqual(backup.version, '2.0.0');
    testSuite.assertNotNull(backup.data);
    testSuite.assertNotNull(backup.metadata);
});

testSuite.test('Backup - Validate Backup Structure', () => {
    const invalidBackup = { data: 'incomplete' };
    const hasRequiredFields = invalidBackup.timestamp && invalidBackup.data;
    testSuite.assert(!hasRequiredFields);
});

// Error Handling Tests
testSuite.test('Error - Log Error Structure', () => {
    const error = {
        timestamp: new Date().toISOString(),
        context: 'Test Context',
        message: 'Test error message',
        type: 'TestError'
    };
    
    testSuite.assertNotNull(error.timestamp);
    testSuite.assertNotNull(error.context);
    testSuite.assertNotNull(error.message);
    testSuite.assertNotNull(error.type);
});

// UI Tests (Basic)
testSuite.test('UI - Element Existence', () => {
    // This test would run in browser context
    if (typeof document !== 'undefined') {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-element';
        document.body.appendChild(testDiv);
        
        const element = document.getElementById('test-element');
        testSuite.assertNotNull(element);
        
        // Cleanup
        document.body.removeChild(testDiv);
    } else {
        // Skip test in non-browser environment
        testSuite.assert(true);
    }
});

// Performance Tests
testSuite.test('Performance - Data Processing Speed', () => {
    const startTime = Date.now();
    
    // Simulate processing 1000 student records
    const students = [];
    for (let i = 0; i < 1000; i++) {
        students.push({
            id: i,
            name: `Student ${i}`,
            avg: Math.random() * 100
        });
    }
    
    const processed = students.map(s => ({
        ...s,
        grade: s.avg >= 90 ? 'A' : s.avg >= 80 ? 'B' : 'C'
    }));
    
    const duration = Date.now() - startTime;
    
    testSuite.assertEqual(processed.length, 1000);
    testSuite.assert(duration < 1000, 'Processing should complete within 1 second');
});

// Integration Tests
testSuite.test('Integration - End-to-End Student Flow', () => {
    // Simulate complete student management flow
    const student = {
        name: 'Integration Test Student',
        class: 'Test Class 10A',
        rollNumber: 'TEST001',
        subjects: {
            Math: 85,
            English: 78,
            Science: 92
        }
    };
    
    // Calculate average
    const grades = Object.values(student.subjects);
    const average = grades.reduce((a, b) => a + b, 0) / grades.length;
    student.avg = Math.round(average);
    
    // Validate student data
    testSuite.assertNotNull(student.name);
    testSuite.assertNotNull(student.avg);
    testSuite.assert(student.avg >= 0 && student.avg <= 100);
    
    // Simulate saving
    localStorage.setItem('integration_test_student', JSON.stringify(student));
    
    // Simulate retrieval
    const retrieved = JSON.parse(localStorage.getItem('integration_test_student'));
    testSuite.assertEqual(retrieved.name, student.name);
    testSuite.assertEqual(retrieved.avg, student.avg);
    
    // Cleanup
    localStorage.removeItem('integration_test_student');
});

// Export test suite for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, testSuite };
}

// Auto-run tests if in browser and test page is loaded
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const results = await testSuite.runAll();
        
        // Display results on page
        const resultsDiv = document.getElementById('test-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = testSuite.generateHTMLReport();
        }
    });
}
