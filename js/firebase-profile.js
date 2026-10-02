// =========================================================
// DAYDREAMERS — FIREBASE PROFILE CONNECTION
// =========================================================

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// Make Firebase services available to the main app
window.daydreamersAuth = auth;
window.daydreamersDb = db;

// Load the currently logged-in user's DAYDREAMERS profile
window.daydreamersProfilePromise = new Promise((resolve) => {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            window.daydreamersProfile = null;
            resolve(null);
            return;
        }

        try {

            const profileRef = doc(db, "users", user.uid);
            const profileSnapshot = await getDoc(profileRef);

            if (profileSnapshot.exists()) {

                window.daydreamersProfile = {
                    uid: user.uid,
                    email: user.email || "",
                    ...profileSnapshot.data()
                };

                console.log(
                    "DAYDREAMERS profile loaded:",
                    window.daydreamersProfile
                );

                resolve(window.daydreamersProfile);

            } else {

                console.warn(
                    "No DAYDREAMERS profile found for:",
                    user.uid
                );

                window.daydreamersProfile = {
                    uid: user.uid,
                    email: user.email || ""
                };

                resolve(window.daydreamersProfile);
            }

        } catch (error) {

            console.error(
                "Error loading DAYDREAMERS profile:",
                error
            );

            window.daydreamersProfile = null;
            resolve(null);
        }
    });

});
