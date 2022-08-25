import * as firebase from "firebase"
require("firebase/database")
require("firebase/firestore")

firebase.default.initializeApp({
  // your config
  apiKey: 'AIzaSyCHPf66G9keySdj7NU4kImm54l7aMvS__M',
  authDomain: 'com-sparkle-sparkle.firebaseapp.com',
  databaseURL: 'https://com-sparkle-sparkle.firebaseio.com',
  projectId: 'com-sparkle-sparkle',
  storageBucket: 'com-sparkle-sparkle.appspot.com',
  messagingSenderId: '614635418796',
  appId: '1:614635418796:web:8d1a182c2506b49f351b09',
  measurementId: 'G-JRBMC81JS9',
})

console.log(firebase.default.database())

let database = firebase.default.database()
let firestore = firebase.default.firestore()
let fbase = firebase.default


export default database 
