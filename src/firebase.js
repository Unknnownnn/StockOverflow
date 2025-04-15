import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeWpx8iWZTLItCUgWX8YEST2VpxCyUAjo",
  authDomain: "stockoverflow-814e8.firebaseapp.com",
  databaseURL: "https://stockoverflow-814e8-default-rtdb.firebaseio.com",
  projectId: "stockoverflow-814e8",
  storageBucket: "stockoverflow-814e8.appspot.com",
  messagingSenderId: "670690019938",
  appId: "1:670690019938:web:c3b8eb561425523f9edf3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app; 
