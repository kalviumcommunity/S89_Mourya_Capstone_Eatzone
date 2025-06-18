import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your Firebase config
  authDomain: "eatzone-admin.firebaseapp.com",
  projectId: "eatzone-admin",
  storageBucket: "eatzone-admin.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
