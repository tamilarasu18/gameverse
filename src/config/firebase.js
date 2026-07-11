import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, remove, onDisconnect } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBGu9tbp2ChGjJgOLanB-S8EXs0Ems8u8A",
  authDomain: "co-op-gameverse.firebaseapp.com",
  databaseURL: "https://co-op-gameverse-default-rtdb.firebaseio.com",
  projectId: "co-op-gameverse",
  storageBucket: "co-op-gameverse.firebasestorage.app",
  messagingSenderId: "712296747966",
  appId: "1:712296747966:web:2f78437e23351c7b4d9fef",
  measurementId: "G-20FMCKFQDL"
};

let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (err) {
  console.warn('Firebase initialization failed:', err.message);
}

function isFirebaseConfigured() {
  return !!database;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export { database, ref, set, get, update, onValue, remove, onDisconnect, generateRoomCode, isFirebaseConfigured };
export default app;
