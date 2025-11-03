// firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_DOMINIO.firebaseapp.com',
  databaseURL: 'https://TU_DOMINIO.firebaseio.com',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_BUCKET.appspot.com',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);