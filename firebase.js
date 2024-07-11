const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = firebaseAdmin.firestore();
module.exports = db;
