import firebase from 'firebase/compat/app';
import'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDaoHi2xgUhz0Vj6i72QjxUSO-zb_k8BiE",
    authDomain: "lv-lt-3190a.firebaseapp.com",
    projectId: "lv-lt-3190a",
    storageBucket: "lv-lt-3190a.appspot.com",
    messagingSenderId: "242024495202",
    appId: "1:242024495202:web:ea83a3900aecd727ceb93b",
    measurementId: "G-FDTHP37YK5"
  }
  

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth(); 
export const db = firebase.firestore();

export const logUserLogin = async (userId) => {
  try {
    const loginEventRef = db.collection('loginEvents').doc(userId).collection('dates');

    // Datuma formāts
    const currentDate = new Date().toISOString().split('T')[0];

    //šodienas datuma dokuments
    await loginEventRef.doc(currentDate).set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    
    console.log('Login event logged for user:', userId);
  } catch (error) {
    console.error('Error logging user login event:', error);
  }
};

const initializeUniqueQuestionCount = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.data().uniqueQuestionCount) {

      await userDoc.ref.update({
        uniqueQuestionCount: 0
      });
      console.log('Unique question count initialized for user:', userId);
    }
  } catch (error) {
    console.error('Error initializing unique question count:', error);
  }
};

const currentUser = auth.currentUser;
if (currentUser) {
  const userId = currentUser.uid;
  initializeUniqueQuestionCount(userId);
};

auth.onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    initializeUniqueQuestionCount(userId);
  }
});


const migrateLoginData = async () => {
  try {
    const loginEventsSnapshot = await db.collection('loginEvents').get();

    for (const doc of loginEventsSnapshot.docs) {

      const userId = doc.id;
      const loginEventData = doc.data();
      const loginEventDate = Object.keys(loginEventData)[0]; 

      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        loginEvents: firebase.firestore.FieldValue.arrayUnion(loginEventDate)
      });

      await doc.ref.delete();

      console.log(`Login data migrated for user ${userId}`);
    }
  } catch (error) {
    console.error('Error migrating login data:', error);
  }
};

migrateLoginData();

export { firebase, auth};