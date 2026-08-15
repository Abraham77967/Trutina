import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBMqFThfnIzyz5iVCRpKeVM82KKNo6m8YE",
    authDomain: "trutina-b0a99.firebaseapp.com",
    projectId: "trutina-b0a99",
    storageBucket: "trutina-b0a99.firebasestorage.app",
    messagingSenderId: "584074148063",
    appId: "1:584074148063:web:5dcd1de2dc283aaabed16a",
    measurementId: "G-6FKXGPL3XL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.krutinaAuth = {
    currentUser: null,
    
    login: async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in", error);
            alert("Failed to sign in. Check console for details.");
        }
    },
    
    logout: async () => {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (error) {
            console.error("Error signing out", error);
        }
    }
};

window.saveToFirestore = async (data) => {
    if (!window.krutinaAuth.currentUser) return;
    try {
        await setDoc(doc(db, "users", window.krutinaAuth.currentUser.uid), { krutinaData: data });
    } catch (e) {
        console.error("Error saving to Firestore:", e);
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        window.krutinaAuth.currentUser = user;
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data().krutinaData;
                if (window.store) {
                    window.store.init(data);
                }
            } else {
                if (window.store) {
                    window.store.init(null);
                    window.saveToFirestore(window.store.data);
                }
            }
        } catch(e) {
            console.error("Error fetching data", e);
            if (window.store) window.store.init(null);
        }
    } else {
        window.krutinaAuth.currentUser = null;
        if (window.store) window.store.init(null);
    }
    
    if (window.app && window.app.handleRoute) {
        window.app.handleRoute();
    }
});
