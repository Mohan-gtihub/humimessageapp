import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState } from 'react';
import './App.css';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4i9nBFpNcaOWjrI1Fy8AtYBEOF7Qfd7o",
    authDomain: "humiapp-b1fdc.firebaseapp.com",
    projectId: "humiapp-b1fdc",
    storageBucket: "humiapp-b1fdc.appspot.com",
    messagingSenderId: "6286226417",
    appId: "1:6286226417:web:17c6f332de2d3343370a50"
}; 

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function Chat() {
    const [user] = useAuthState(auth);

    return (
        <div>
            {user ? <ChatRoom /> : <SignIn />}
        </div>
    );
}

function SignIn() {
    const signInWithFacebook = () => {
        const provider = new firebase.auth.FacebookAuthProvider();
        auth.signInWithPopup(provider);
    }

    return (
        <button onClick={signInWithFacebook}>Sign in with Facebook</button>
    );
}

function ChatRoom() {
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });

        setFormValue('');
    }

    return (
        <div>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            </div>

            <form onSubmit={sendMessage}>
                <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt="" />
            <p>{text}</p>
        </div>
    );
}

export default Chat;
