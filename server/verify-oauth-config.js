import 'dotenv/config';

console.log('=== Google OAuth Configuration Verification ===\n');

console.log('Environment Variables:');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✓ Set (value hidden)' : '✗ Not set'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Not set'}`);
console.log(`SERVER_URL: ${process.env.SERVER_URL}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`ADMIN_URL: ${process.env.ADMIN_URL}\n`);

console.log('Required Redirect URIs for Google Cloud Console:');
const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
console.log(`1. ${serverUrl}/api/user/auth/google/callback (for user authentication)`);
console.log(`2. ${serverUrl}/api/admin/auth/google/callback (for admin authentication)\n`);

console.log('Steps to fix the OAuth error:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Navigate to "APIs & Services" > "Credentials"');
console.log('3. Find your OAuth 2.0 Client ID and click "Edit"');
console.log('4. In "Authorized redirect URIs", add the URLs listed above');
console.log('5. Save the changes');
console.log('6. Wait a few minutes for changes to propagate');
console.log('7. Restart your server and try authentication again\n');

console.log('Current OAuth URLs that will be used:');
console.log(`User Auth: ${serverUrl}/api/user/auth/google`);
console.log(`Admin Auth: ${serverUrl}/api/admin/auth/google`);
