// Simple script to start the server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server...');
const serverPath = path.join(__dirname, 'server');
const server = spawn('npm', ['run', 'server'], { cwd: serverPath, shell: true });

server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
