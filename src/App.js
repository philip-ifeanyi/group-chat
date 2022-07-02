import React, { useState, useRef } from 'react';
import './App.css';

import '@firebase/app';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, serverTimestamp, query, orderBy, addDoc, limit } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBwnmmMzRos70VqbIGNzNL7xcl09KpEqhU",
  authDomain: "group-chat-d93ff.firebaseapp.com",
  projectId: "group-chat-d93ff",
  storageBucket: "group-chat-d93ff.appspot.com",
  messagingSenderId: "856208978831",
  appId: "1:856208978831:web:8cb97e45f472ca618711fa",
  measurementId: "G-E6L895BPH7"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <Chatroom /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .catch((error) => {
      console.error(error)
    });
  }

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

 
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>SIgn Out</button>
  )
}


function Chatroom() {
  const dummy = useRef();
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(50));
  const [messages] = useCollectionData(q, {idField: 'id'});
  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault();

    const payload = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      photoUrl: auth.currentUser.photoURL
    }
    
    setFormValue('');
    await addDoc(messagesRef, payload)

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="send a message" />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  )
}

function ChatMessage ({id, ...props}) {
  const {text, uid, photoUrl} = props.message;
  const messageClass = uid ===  auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoUrl || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt=''/>
      <p>{text}</p>
    </div>
  )
}

export default App;