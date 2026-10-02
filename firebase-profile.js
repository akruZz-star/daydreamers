// =========================================================
// DAYDREAMERS — FIREBASE PROFILE BRIDGE
// =========================================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {
    apiKey: "AIzaSyCz_qv-BDYFq6demMx2EZU3t1dgaRKvrr8",
    authDomain: "daydreamers-db417.firebaseapp.com",
    projectId: "daydreamers-db417",
    storageBucket: "daydreamers-db417.firebasestorage.app",
    messagingSenderId: "570906387646",
    appId: "1:570906387646:web:3a6285307144c1dc8b2aef",
    measurementId: "G-LCGSS1Q36F"
};


// =========================================================
// INITIALIZE FIREBASE
// =========================================================

const firebaseApp =
    getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// Make Firebase services available to DAYDREAMERS.

window.daydreamersFirebaseApp = firebaseApp;
window.daydreamersAuth = auth;
window.daydreamersDb = db;


// =========================================================
// DEFAULT PROFILE
// =========================================================

window.daydreamersProfile = {
    displayName: "Guest",
    username: "guest",
    role: "guest"
};


// =========================================================
// LOAD PROFILE
// =========================================================

window.daydreamersProfileReady = new Promise((resolve) => {

    onAuthStateChanged(auth, async (user) => {

        // -------------------------------------------------
        // No logged-in user
        // -------------------------------------------------

        if (!user) {

            window.daydreamersProfile = {
                displayName: "Guest",
                username: "guest",
                role: "guest"
            };

            resolve(window.daydreamersProfile);

            return;
        }


        // -------------------------------------------------
        // Logged-in user
        // -------------------------------------------------

        try {

            const userRef =
                doc(db, "users", user.uid);

            const userSnapshot =
                await getDoc(userRef);


            if (userSnapshot.exists()) {

                const profile =
                    userSnapshot.data();

                window.daydreamersProfile = {

                    ...profile,

                    uid: user.uid,

                    email: user.email || ""

                };

            } else {

                window.daydreamersProfile = {

                    displayName:
                        user.email?.split("@")[0] || "User",

                    username:
                        user.email?.split("@")[0] || "user",

                    role: "member",

                    uid: user.uid,

                    email: user.email || ""

                };

            }

        } catch (error) {

            console.error(
                "DAYDREAMERS profile loading error:",
                error
            );


            window.daydreamersProfile = {

                displayName:
                    user.email?.split("@")[0] || "User",

                username:
                    user.email?.split("@")[0] || "user",

                role: "member",

                uid: user.uid,

                email: user.email || ""

            };

        }


        console.log(
            "DAYDREAMERS profile:",
            window.daydreamersProfile
        );


        resolve(window.daydreamersProfile);

    });

});


// =========================================================
// ROLE HELPERS
// =========================================================

window.daydreamersIsOwner = function () {

    return (
        window.daydreamersProfile?.role === "owner"
    );

};


window.daydreamersIsMember = function () {

    const role =
        window.daydreamersProfile?.role;

    return (
        role === "owner" ||
        role === "member"
    );

};


window.daydreamersIsGuest = function () {

    return (
        !window.daydreamersProfile ||
        window.daydreamersProfile.role === "guest"
    );

};
