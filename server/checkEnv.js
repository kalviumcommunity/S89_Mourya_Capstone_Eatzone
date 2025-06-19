import 'dotenv/config';
import jwt from 'jsonwebtoken';

console.log('Checking environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (value hidden)' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set, using default');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set (value hidden)' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (value hidden)' : 'NOT SET');

// Test JWT token creation and verification
const testId = '123456789';
try {
    console.log('\nTesting JWT token creation...');
    const token = jwt.sign({ id: testId }, process.env.JWT_SECRET || 'fallback_secret_for_testing');
    console.log('Token created successfully');

    console.log('\nTesting JWT token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_testing');
    console.log('Token verified successfully!');
    console.log('Decoded payload contains user ID:', !!decoded.id);
    
    if (decoded.id === testId) {
        console.log('ID matches the original value. JWT verification is working correctly!');
    } else {
        console.log('ID does not match the original value. Something is wrong with JWT verification.');
    }
} catch (error) {
    console.error('Error during JWT testing:', error.message);
}
