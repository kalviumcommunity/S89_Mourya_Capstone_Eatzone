#!/usr/bin/env node

/**
 * EATZONE DEVELOPMENT TOOLS
 * Utility script for common development tasks
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const commands = {
    'start': 'Start all services',
    'stop': 'Stop all services',
    'restart': 'Restart all services',
    'status': 'Check service status',
    'logs': 'Show service logs',
    'test': 'Run tests',
    'clean': 'Clean node_modules and reinstall',
    'health': 'Check application health',
    'help': 'Show this help message'
};

async function executeCommand(command) {
    return new Promise((resolve, reject) => {
        const child = spawn('cmd', ['/c', command], { 
            shell: true,
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function startServices() {
    console.log('🚀 Starting all Eatzone services...\n');
    
    try {
        // Kill existing processes
        console.log('🔄 Stopping existing services...');
        await executeCommand('taskkill /F /IM node.exe').catch(() => {
            console.log('No existing Node.js processes found');
        });
        
        // Start services
        console.log('📊 Starting server...');
        spawn('cmd', ['/c', 'cd server && npm start'], { 
            detached: true,
            stdio: 'ignore'
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🌐 Starting client...');
        spawn('cmd', ['/c', 'cd client && npm run dev'], { 
            detached: true,
            stdio: 'ignore'
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('👨‍💼 Starting admin...');
        spawn('cmd', ['/c', 'cd admin && npm run dev'], { 
            detached: true,
            stdio: 'ignore'
        });
        
        console.log('\n✅ All services started!');
        console.log('🌐 Client: http://localhost:5173');
        console.log('👨‍💼 Admin: http://localhost:5175');
        console.log('📊 Server: http://localhost:4000');
        
    } catch (error) {
        console.error('❌ Failed to start services:', error.message);
    }
}

async function stopServices() {
    console.log('🛑 Stopping all Eatzone services...\n');
    
    try {
        await executeCommand('taskkill /F /IM node.exe');
        console.log('✅ All services stopped!');
    } catch (error) {
        console.log('ℹ️ No services were running');
    }
}

async function checkStatus() {
    console.log('📊 Checking Eatzone service status...\n');
    
    const ports = [4000, 5173, 5175];
    const services = ['Server', 'Client', 'Admin'];
    
    for (let i = 0; i < ports.length; i++) {
        try {
            const response = await fetch(`http://localhost:${ports[i]}`);
            console.log(`✅ ${services[i]} - Running on port ${ports[i]}`);
        } catch (error) {
            console.log(`❌ ${services[i]} - Not running on port ${ports[i]}`);
        }
    }
}

async function runHealthCheck() {
    console.log('🏥 Running comprehensive health check...\n');
    
    try {
        const response = await fetch('http://localhost:4000/health');
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Server health check passed');
            console.log('📊 Health details:');
            console.log(JSON.stringify(health, null, 2));
        } else {
            console.log('⚠️ Server health check failed');
        }
    } catch (error) {
        console.log('❌ Could not reach server for health check');
    }
}

async function cleanInstall() {
    console.log('🧹 Cleaning and reinstalling dependencies...\n');
    
    const directories = ['server', 'client', 'admin'];
    
    for (const dir of directories) {
        try {
            console.log(`🗑️ Cleaning ${dir}...`);
            await executeCommand(`cd ${dir} && rmdir /s /q node_modules`).catch(() => {});
            
            console.log(`📦 Installing dependencies in ${dir}...`);
            await executeCommand(`cd ${dir} && npm install`);
            
            console.log(`✅ ${dir} dependencies installed`);
        } catch (error) {
            console.error(`❌ Failed to clean/install ${dir}:`, error.message);
        }
    }
}

async function runTests() {
    console.log('🧪 Running Eatzone tests...\n');
    
    try {
        // Test API keys
        console.log('🔑 Testing API keys...');
        await executeCommand('cd server && node test-api-keys.js');
        
        // Test server APIs
        console.log('🌐 Testing server APIs...');
        await executeCommand('cd server && node test-server-apis.js');
        
        console.log('✅ All tests completed!');
    } catch (error) {
        console.error('❌ Tests failed:', error.message);
    }
}

function showHelp() {
    console.log('🍽️ EATZONE DEVELOPMENT TOOLS');
    console.log('============================\n');
    
    console.log('Usage: node dev-tools.js <command>\n');
    
    console.log('Available commands:');
    Object.entries(commands).forEach(([cmd, desc]) => {
        console.log(`  ${cmd.padEnd(10)} - ${desc}`);
    });
    
    console.log('\nExamples:');
    console.log('  node dev-tools.js start   # Start all services');
    console.log('  node dev-tools.js status  # Check service status');
    console.log('  node dev-tools.js health  # Run health check');
}

// Main execution
async function main() {
    const command = process.argv[2];
    
    if (!command || command === 'help') {
        showHelp();
        return;
    }
    
    switch (command) {
        case 'start':
            await startServices();
            break;
        case 'stop':
            await stopServices();
            break;
        case 'restart':
            await stopServices();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await startServices();
            break;
        case 'status':
            await checkStatus();
            break;
        case 'health':
            await runHealthCheck();
            break;
        case 'clean':
            await cleanInstall();
            break;
        case 'test':
            await runTests();
            break;
        default:
            console.log(`❌ Unknown command: ${command}`);
            showHelp();
    }
}

main().catch(console.error);
