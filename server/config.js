const firebase = require("firebase");

const firebaseConfig = {
    apiKey: process.env['apiKey'],
    authDomain: "bce-games.firebaseapp.com",
    projectId: "bce-games",
    storageBucket: "bce-games.appspot.com",
    messagingSenderId: "10822021222",
    appId:  process.env['appId']
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Games = db.collection("Games");
module.exports = Games;
