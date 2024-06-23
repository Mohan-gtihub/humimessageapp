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
            {user ? <ChatRoom user={user} /> : <SignIn />}
        </div>
    );
}

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const toggleRegister = () => setIsRegistering(!isRegistering);

    const registerWithEmail = async () => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
        } catch (error) {
            console.error('Error registering with email and password', error);
        }
    };

    const signInWithEmail = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Error signing in with email and password', error);
        }
    };

    return (
        <div>
            <h1>{isRegistering ? 'Register' : 'Sign In'}</h1>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                style={{ display: isRegistering ? 'block' : 'none' }}
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={isRegistering ? registerWithEmail : signInWithEmail}>
                {isRegistering ? 'Register' : 'Sign In'}
            </button>
            <button onClick={toggleRegister}>
                {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
        </div>
    );
}

function ChatRoom({ user }) {
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL, displayName } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            displayName: displayName || 'Anonymous',
            photoURL
        });

        setFormValue('');
    };

    return (
        <div>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            </div>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Type your message here..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

function ChatMessage({ message }) {
    const { text, uid, photoURL, displayName } = message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://via.placeholder.com/50'} alt="Profile" />
            <p>{displayName}: {text}</p>
        </div>
    );
}

export default Chat;
