// =========================================================
// DAYDREAMERS — OWNER ADMIN SYSTEM
// =========================================================

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

window.daydreamersAdmin = {

    async getMembers() {

        if (!window.daydreamersIsOwner()) {
            throw new Error("Owner permission required.");
        }

        const db = window.daydreamersDb;

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        return snapshot.docs.map(
            item => ({
                id: item.id,
                ...item.data()
            })
        );
    },


    async createMember(data) {

        if (!window.daydreamersIsOwner()) {
            throw new Error("Owner permission required.");
        }

        const db = window.daydreamersDb;

        const memberRef =
            doc(
                collection(db, "users")
            );

        await setDoc(
            memberRef,
            {
                displayName:
                    data.displayName || "New Member",

                username:
                    data.username || "member",

                role:
                    data.role || "member",

                permissions:
                    data.permissions || {
                        viewSharedProgress: true,
                        addOwnStudySessions: true,
                        editOwnActivities: true,
                        editOwnChapterProgress: true,
                        editOtherData: false,
                        manageMembers: false,
                        changePublicVisibility: false
                    },

                createdAt:
                    serverTimestamp()
            }
        );

        return memberRef.id;
    },


    async updateMember(memberId, data) {

        if (!window.daydreamersIsOwner()) {
            throw new Error("Owner permission required.");
        }

        if (!memberId) {
            throw new Error("Member ID is required.");
        }

        const db = window.daydreamersDb;

        await setDoc(
            doc(db, "users", memberId),
            data,
            {
                merge: true
            }
        );
    },


    async deleteMember(memberId) {

        if (!window.daydreamersIsOwner()) {
            throw new Error("Owner permission required.");
        }

        if (!memberId) {
            throw new Error("Member ID is required.");
        }

        if (
            memberId ===
            window.daydreamersProfile.uid
        ) {
            throw new Error(
                "The owner cannot delete their own account from Admin."
            );
        }

        const confirmed =
            window.confirm(
                "Remove this member from DAYDREAMERS?"
            );

        if (!confirmed) {
            return false;
        }

        const db = window.daydreamersDb;

        await deleteDoc(
            doc(db, "users", memberId)
        );

        return true;
    }

};

console.log(
    "DAYDREAMERS Owner Admin module loaded."
);
