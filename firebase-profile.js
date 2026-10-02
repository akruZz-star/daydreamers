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


// =========================================================
// EXPOSE FIREBASE SERVICES
// =========================================================

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
// PROFILE READY PROMISE
// =========================================================

window.daydreamersProfileReady = new Promise((resolve) => {

    onAuthStateChanged(auth, async (user) => {

        // -------------------------------------------------
        // NO USER LOGGED IN
        // -------------------------------------------------

        if (!user) {

            window.daydreamersProfile = {
                displayName: "Guest",
                username: "guest",
                role: "guest"
            };

            console.log(
                "DAYDREAMERS profile loaded:",
                window.daydreamersProfile
            );

            resolve(window.daydreamersProfile);
            return;
        }


        // -------------------------------------------------
        // USER LOGGED IN
        // -------------------------------------------------

        try {

            const userRef = doc(
                db,
                "users",
                user.uid
            );

            const userSnapshot = await getDoc(userRef);


            // -------------------------------------------------
            // FIRESTORE PROFILE EXISTS
            // -------------------------------------------------

            if (userSnapshot.exists()) {

                const profile = userSnapshot.data();

                window.daydreamersProfile = {
                    ...profile,
                    uid: user.uid,
                    email: user.email || ""
                };

            }

            // -------------------------------------------------
            // FIRESTORE PROFILE DOES NOT EXIST
            // -------------------------------------------------

            else {

                const fallbackName =
                    user.email?.split("@")[0] || "User";

                window.daydreamersProfile = {

                    displayName: fallbackName,

                    username: fallbackName,

                    role: "member",

                    uid: user.uid,

                    email: user.email || ""
                };

            }

        }

        // -------------------------------------------------
        // PROFILE LOADING ERROR
        // -------------------------------------------------

        catch (error) {

            console.error(
                "DAYDREAMERS profile loading error:",
                error
            );

            const fallbackName =
                user.email?.split("@")[0] || "User";

            window.daydreamersProfile = {

                displayName: fallbackName,

                username: fallbackName,

                role: "member",

                uid: user.uid,

                email: user.email || ""
            };
        }


        // -------------------------------------------------
        // LOG FINAL PROFILE
        // -------------------------------------------------

        console.log(
            "DAYDREAMERS profile loaded:",
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


// =========================================================
// DEBUG
// =========================================================

console.log(
    "DAYDREAMERS Firebase profile bridge initialized."
);
