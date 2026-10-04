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

        const profile = window.daydreamersProfile;

        if (!profile?.uid) {
            throw new Error("User is not logged in.");
        }

        const db = window.daydreamersDb;

        const ref = doc(
            db,
            "users",
            profile.uid
        );

        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
            return {
                studySessions: [],
                chapterProgress: {},
                dailyLogs: {}
            };
        }

        const data = snapshot.data();

        return {
            studySessions:
                Array.isArray(data.studySessions)
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

        const profile = window.daydreamersProfile;

        if (!profile?.uid) {
            throw new Error("User is not logged in.");
        }

        const db = window.daydreamersDb;

        const userRef = doc(
            db,
            "users",
            profile.uid
        );

        const studySessions =
            Array.isArray(data.studySessions)
                ? data.studySessions
                : [];

        const chapterProgress =
            data.chapterProgress || {};

        const dailyLogs =
            data.dailyLogs || {};

        // Save private data
        await setDoc(
            userRef,
            {
                studySessions,
                chapterProgress,
                dailyLogs,
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

        // Today's date
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        const todayKey =
            `${year}-${month}-${day}`;

        // Today's study hours
        const todayHours =
            studySessions
                .filter(
                    session =>
                        session.date === todayKey
                )
                .reduce(
                    (total, session) =>
                        total +
                        Number(session.hours || 0),
                    0
                );

        // Completed chapters
        const completedChapters =
            Object.values(chapterProgress)
                .filter(
                    value =>
                        Number(value) >= 100
                )
                .length;

        // Weekly study hours
        const weekStart = new Date(today);

        weekStart.setDate(
            today.getDate() - 6
        );

        weekStart.setHours(
            0,
            0,
            0,
            0
        );

        const weeklyHours =
            studySessions
                .filter(session => {

                    if (!session.date) {
                        return false;
                    }

                    const sessionDate =
                        new Date(
                            `${session.date}T00:00:00`
                        );

                    return (
                        sessionDate >= weekStart &&
                        sessionDate <= today
                    );
                })
                .reduce(
                    (total, session) =>
                        total +
                        Number(session.hours || 0),
                    0
                );

        // Save safe shared statistics
        const sharedStatsRef = doc(
            db,
            "sharedStats",
            profile.uid
        );

        await setDoc(
            sharedStatsRef,
            {
                uid: profile.uid,

                displayName:
                    profile.displayName ||
                    profile.username ||
                    "User",

                username:
                    profile.username ||
                    "user",

                role:
                    profile.role ||
                    "member",

                todayHours,

                weeklyHours,

                completedChapters,

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        console.log(
            "DAYDREAMERS private data + shared stats saved."
        );
    }
};

console.log(
    "DAYDREAMERS Firebase study module loaded."
);
