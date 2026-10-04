// =========================================================
// DAYDREAMERS — FIREBASE DASHBOARD DATA
// =========================================================

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

window.daydreamersDashboardCloud = {

    async getMembers() {

        await window.daydreamersProfileReady;

        const db = window.daydreamersDb;

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        return snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));
    },


    async getMemberData(uid) {

        if (!uid) {
            return null;
        }

        const db = window.daydreamersDb;

        const ref =
            doc(
                db,
                "users",
                uid
            );

        const snapshot =
            await getDoc(ref);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            uid,
            ...snapshot.data()
        };
    },


    async getDashboardMembers() {

        const members =
            await this.getMembers();

        return members.filter(
            member =>
                member.role === "owner" ||
                member.role === "member"
        );
    }
};


console.log(
    "DAYDREAMERS Firebase dashboard module loaded."
);
