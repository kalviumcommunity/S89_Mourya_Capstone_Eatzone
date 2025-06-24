import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import './ApiDebug.css';

const ApiDebug = () => {
    const { url } = useAdmin();
    const [debugInfo, setDebugInfo] = useState({
        serverStatus: 'checking...',
        categoryEndpoint: 'checking...',
        corsStatus: 'checking...',
        networkError: null,
        responseData: null,
        timestamp: new Date().toISOString()
    });

    const [testResults, setTestResults] = useState([]);

    const addTestResult = (test, status, details) => {
        setTestResults(prev => [...prev, {
            test,
            status,
            details,
            timestamp: new Date().toISOString()
        }]);
    };

    const testServerConnection = async () => {
        try {
            addTestResult('Server Connection', 'testing', `Testing connection to: ${url}`);
            
            const response = await axios.get(`${url}/health`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                addTestResult('Server Connection', 'success', `Server is running. Response: ${JSON.stringify(response.data)}`);
                setDebugInfo(prev => ({ ...prev, serverStatus: 'online' }));
                return true;
            } else {
                addTestResult('Server Connection', 'error', `Unexpected status: ${response.status}`);
                setDebugInfo(prev => ({ ...prev, serverStatus: 'error' }));
                return false;
            }
        } catch (error) {
            addTestResult('Server Connection', 'error', `Connection failed: ${error.message}`);
            setDebugInfo(prev => ({ 
                ...prev, 
                serverStatus: 'offline',
                networkError: error.message 
            }));
            return false;
        }
    };

    const testCategoryEndpoint = async () => {
        try {
            addTestResult('Category Endpoint', 'testing', `Testing: ${url}/api/category/list-all`);
            
            const response = await axios.get(`${url}/api/category/list-all`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            addTestResult('Category Endpoint', 'success', `Categories loaded: ${JSON.stringify(response.data)}`);
            setDebugInfo(prev => ({ 
                ...prev, 
                categoryEndpoint: 'working',
                responseData: response.data 
            }));
            return true;
        } catch (error) {
            addTestResult('Category Endpoint', 'error', `Failed: ${error.message}`);
            setDebugInfo(prev => ({ 
                ...prev, 
                categoryEndpoint: 'error',
                networkError: error.message 
            }));
            return false;
        }
    };

    const testCorsHeaders = async () => {
        try {
            addTestResult('CORS Test', 'testing', 'Testing CORS headers');
            
            const response = await fetch(`${url}/health`, {
                method: 'GET',
                headers: {
                    'Origin': window.location.origin,
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });
            
            const corsHeaders = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            };
            
            addTestResult('CORS Test', 'success', `CORS Headers: ${JSON.stringify(corsHeaders)}`);
            setDebugInfo(prev => ({ ...prev, corsStatus: 'configured' }));
            return true;
        } catch (error) {
            addTestResult('CORS Test', 'error', `CORS failed: ${error.message}`);
            setDebugInfo(prev => ({ ...prev, corsStatus: 'error' }));
            return false;
        }
    };

    const runAllTests = async () => {
        setTestResults([]);
        addTestResult('Debug Session', 'info', `Starting debug session at ${new Date().toISOString()}`);
        addTestResult('Configuration', 'info', `API URL: ${url}`);
        addTestResult('Configuration', 'info', `Admin Origin: ${window.location.origin}`);
        
        await testServerConnection();
        await testCorsHeaders();
        await testCategoryEndpoint();
        
        addTestResult('Debug Session', 'info', 'All tests completed');
    };

    useEffect(() => {
        runAllTests();
    }, [url]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'testing': return '#ffc107';
            case 'info': return '#17a2b8';
            default: return '#6c757d';
        }
    };

    return (
        <div className="api-debug">
            <div className="debug-header">
                <h2>🔧 API Debug Information</h2>
                <button onClick={runAllTests} className="refresh-btn">
                    🔄 Run Tests Again
                </button>
            </div>

            <div className="debug-summary">
                <div className="debug-card">
                    <h3>Current Configuration</h3>
                    <div className="config-item">
                        <strong>API URL:</strong> <code>{url}</code>
                    </div>
                    <div className="config-item">
                        <strong>Admin Origin:</strong> <code>{window.location.origin}</code>
                    </div>
                    <div className="config-item">
                        <strong>Environment:</strong> <code>{import.meta.env.MODE}</code>
                    </div>
                </div>

                <div className="debug-card">
                    <h3>Status Overview</h3>
                    <div className="status-item">
                        <strong>Server:</strong> 
                        <span className={`status ${debugInfo.serverStatus}`}>{debugInfo.serverStatus}</span>
                    </div>
                    <div className="status-item">
                        <strong>Categories API:</strong> 
                        <span className={`status ${debugInfo.categoryEndpoint}`}>{debugInfo.categoryEndpoint}</span>
                    </div>
                    <div className="status-item">
                        <strong>CORS:</strong> 
                        <span className={`status ${debugInfo.corsStatus}`}>{debugInfo.corsStatus}</span>
                    </div>
                </div>
            </div>

            <div className="debug-card">
                <h3>Test Results</h3>
                <div className="test-results">
                    {testResults.map((result, index) => (
                        <div 
                            key={index} 
                            className="test-result"
                            style={{ borderLeft: `4px solid ${getStatusColor(result.status)}` }}
                        >
                            <div className="test-header">
                                <strong>{result.test}</strong>
                                <span 
                                    className="test-status"
                                    style={{ color: getStatusColor(result.status) }}
                                >
                                    {result.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="test-details">{result.details}</div>
                            <div className="test-time">{new Date(result.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {debugInfo.responseData && (
                <div className="debug-card">
                    <h3>Last API Response</h3>
                    <pre className="response-data">
                        {JSON.stringify(debugInfo.responseData, null, 2)}
                    </pre>
                </div>
            )}

            <div className="debug-card">
                <h3>🛠️ Troubleshooting Steps</h3>
                <ol className="troubleshooting-steps">
                    <li>
                        <strong>Check Server Status:</strong> Ensure your backend server is running and accessible at <code>{url}</code>
                    </li>
                    <li>
                        <strong>Verify CORS Configuration:</strong> Make sure your server allows requests from <code>{window.location.origin}</code>
                    </li>
                    <li>
                        <strong>Check Network:</strong> Open browser DevTools → Network tab to see actual HTTP requests
                    </li>
                    <li>
                        <strong>Database Connection:</strong> Ensure MongoDB is connected and category collection exists
                    </li>
                    <li>
                        <strong>Environment Variables:</strong> Verify VITE_API_BASE_URL is set correctly in your deployment
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default ApiDebug;
