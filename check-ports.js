import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkPorts() {
    console.log('🔍 Checking Eatzone Application Ports...\n');
    
    const expectedPorts = {
        4000: 'Server',
        5173: 'Client',
        5175: 'Admin'
    };
    
    const wrongPorts = {
        5174: 'Client (WRONG - should be 5173)',
        5176: 'Admin (WRONG - should be 5175)',
        5177: 'Admin (WRONG - should be 5175)'
    };
    
    try {
        const { stdout } = await execAsync('netstat -an');
        
        console.log('✅ CORRECT PORTS:');
        for (const [port, service] of Object.entries(expectedPorts)) {
            const isRunning = stdout.includes(`:${port}`);
            const status = isRunning ? '✅ RUNNING' : '❌ NOT RUNNING';
            console.log(`   Port ${port}: ${service} - ${status}`);
        }
        
        console.log('\n🚨 WRONG PORTS (should be empty):');
        let hasWrongPorts = false;
        for (const [port, service] of Object.entries(wrongPorts)) {
            const isRunning = stdout.includes(`:${port}`);
            if (isRunning) {
                console.log(`   Port ${port}: ${service} - ⚠️ RUNNING (WRONG!)`);
                hasWrongPorts = true;
            } else {
                console.log(`   Port ${port}: ${service} - ✅ FREE (correct)`);
            }
        }
        
        console.log('\n📋 SUMMARY:');
        if (hasWrongPorts) {
            console.log('⚠️ WARNING: Services running on wrong ports detected!');
            console.log('🔧 Run "fix-port-issues.bat" to fix this issue.');
        } else {
            console.log('✅ All ports are correctly configured!');
        }
        
        console.log('\n🌐 Expected URLs:');
        console.log('   Client:  http://localhost:5173');
        console.log('   Admin:   http://localhost:5175');
        console.log('   Server:  http://localhost:4000');
        
        console.log('\n🔐 Google OAuth Callbacks:');
        console.log('   User:    http://localhost:4000/api/user/auth/google/callback');
        console.log('   Admin:   http://localhost:4000/api/admin/auth/google/callback');
        
    } catch (error) {
        console.error('❌ Error checking ports:', error.message);
    }
}

checkPorts();
