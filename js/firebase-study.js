// =========================================================
// DAYDREAMERS — FIREBASE STUDY DATA
// =========================================================

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

window.daydreamersStudyCloud = {

    async load() {

        await window.daydreamersProfileReady;

        const profile =
            window.daydreamersProfile;

        if (!profile?.uid) {
            throw new Error("User is not logged in.");
        }

        const db =
            window.daydreamersDb;

        const ref =
            doc(
                db,
                "users",
                profile.uid
            );

        const snapshot =
            await getDoc(ref);

        if (!snapshot.exists()) {
            return {
                studySessions: [],
                chapterProgress: {},
                dailyLogs: {}
            };
        }

        const data =
            snapshot.data();

        return {
            studySessions:
                Array.isArray(
                    data.studySessions
                )
                    ? data.studySessions
                    : [],

            chapterProgress:
                data.chapterProgress &&
                typeof data.chapterProgress === "object"
                    ? data.chapterProgress
                    : {},

            dailyLogs:
                data.dailyLogs &&
                typeof data.dailyLogs === "object"
                    ? data.dailyLogs
                    : {}
        };
    },


    async save(data) {

        await window.daydreamersProfileReady;

        const profile =
            window.daydreamersProfile;

        if (!profile?.uid) {
            throw new Error("User is not logged in.");
        }

        const db =
            window.daydreamersDb;

        const ref =
            doc(
                db,
                "users",
                profile.uid
            );

        await setDoc(
            ref,
            {
                studySessions:
                    Array.isArray(
                        data.studySessions
                    )
                        ? data.studySessions
                        : [],

                chapterProgress:
                    data.chapterProgress || {},

                dailyLogs:
                    data.dailyLogs || {},

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );
    }
};


console.log(
    "DAYDREAMERS Firebase study module loaded."
);
