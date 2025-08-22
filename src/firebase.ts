import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDduHJ-2wWzcI_kG7iF__p6O8hSFwva0pw",
  authDomain: "chelto.firebaseapp.com",
  projectId: "chelto",
  storageBucket: "chelto.appspot.com",
  messagingSenderId: "870903456759",
  appId: "1:870903456759:web:fc79296bdaaf36306d44f2",
  measurementId: "G-8KMQ1RYBKP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);