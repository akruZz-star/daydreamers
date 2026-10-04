// =========================================================
// DAYDREAMERS — OWNER ADMIN SYSTEM
// Secure Owner-only Admin Panel
// =========================================================

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const OWNER_UID =
    "HbYGQlg1iuWCe6oiZyHMKmDOKEC3";

const DEFAULT_PERMISSIONS = {
    viewSharedProgress: true,
    addOwnStudySessions: true,
    editOwnActivities: true,
    editOwnChapterProgress: true,
    editOtherData: false,
    manageMembers: false,
    changePublicVisibility: false
};


// =========================================================
// OWNER CHECK
// =========================================================

function isOwner() {
    const uid =
        window.daydreamersProfile?.uid ||
        window.daydreamersAuth?.currentUser?.uid;

    return Boolean(
        uid &&
        uid === OWNER_UID
    );
}

window.daydreamersIsOwner = isOwner;


// =========================================================
// FIRESTORE
// =========================================================

function getDatabase() {
    if (!window.daydreamersDb) {
        throw new Error(
            "DAYDREAMERS Firebase database is not ready."
        );
    }

    return window.daydreamersDb;
}


// =========================================================
// MEMBER MANAGEMENT API
// =========================================================

window.daydreamersAdmin = {

    isOwner,

    async getMembers() {

        if (!isOwner()) {
            throw new Error(
                "Owner permission required."
            );
        }

        const db = getDatabase();

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        return snapshot.docs.map(
            (item) => ({
                id: item.id,
                ...item.data()
            })
        );
    },


    async updateMember(
        memberId,
        data
    ) {

        if (!isOwner()) {
            throw new Error(
                "Owner permission required."
            );
        }

        if (!memberId) {
            throw new Error(
                "Member ID is required."
            );
        }

        const db = getDatabase();

        const cleanData = {};

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "displayName"
            )
        ) {
            cleanData.displayName =
                String(
                    data.displayName || ""
                ).trim();
        }

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "username"
            )
        ) {
            cleanData.username =
                String(
                    data.username || ""
                ).trim();
        }

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "role"
            )
        ) {
            cleanData.role =
                String(
                    data.role || "member"
                ).trim();
        }

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                "permissions"
            )
        ) {
            cleanData.permissions = {
                ...DEFAULT_PERMISSIONS,
                ...(data.permissions || {})
            };
        }

        if (!Object.keys(cleanData).length) {
            throw new Error(
                "No valid changes supplied."
            );
        }

        await updateDoc(
            doc(
                db,
                "users",
                memberId
            ),
            cleanData
        );
    },


    async deleteMember(
        memberId
    ) {

        if (!isOwner()) {
            throw new Error(
                "Owner permission required."
            );
        }

        if (!memberId) {
            throw new Error(
                "Member ID is required."
            );
        }

        if (memberId === OWNER_UID) {
            throw new Error(
                "The Owner account cannot be deleted."
            );
        }

        const confirmed =
            window.confirm(
                "Remove this member's DAYDREAMERS profile data?\n\nThis does NOT delete their Firebase Authentication account."
            );

        if (!confirmed) {
            return false;
        }

        const db = getDatabase();

        await deleteDoc(
            doc(
                db,
                "users",
                memberId
            )
        );

        return true;
    }
};


// =========================================================
// ADMIN PAGE
// =========================================================

function ensureOwnerAdminPage() {

    if (!isOwner()) {
        return;
    }

    const main =
        document.querySelector(
            ".main-content"
        );

    if (!main) {
        return;
    }

    if (
        document.getElementById(
            "owner-admin"
        )
    ) {
        return;
    }

    const page =
        document.createElement(
            "section"
        );

    page.id = "owner-admin";
    page.className = "page-section";
    page.style.display = "none";

    page.innerHTML = `
        <div style="
            max-width:1100px;
            margin:0 auto;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:20px;
                margin-bottom:24px;
                flex-wrap:wrap;
            ">

                <div>
                    <p class="small-label">
                        👑 OWNER ONLY
                    </p>

                    <h1>
                        Owner Admin
                    </h1>

                    <p class="muted">
                        Manage DAYDREAMERS member profiles,
                        roles and permissions.
                    </p>
                </div>

                <button
                    type="button"
                    id="owner-admin-refresh"
                    style="
                        padding:11px 16px;
                        border:0;
                        border-radius:12px;
                        cursor:pointer;
                        font-weight:700;
                    "
                >
                    🔄 Refresh Members
                </button>

            </div>


            <div
                id="owner-admin-status"
                style="
                    margin-bottom:16px;
                    padding:12px 14px;
                    border-radius:12px;
                    background:rgba(99,102,241,.08);
                    font-size:14px;
                "
            >
                Loading members…
            </div>


            <div
                id="owner-admin-members"
            >
                <div class="tracker-card">
                    Loading members…
                </div>
            </div>

        </div>
    `;

    main.appendChild(page);

    const refreshButton =
        document.getElementById(
            "owner-admin-refresh"
        );

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadOwnerMembers
        );
    }

    loadOwnerMembers();
}


// =========================================================
// RENDER MEMBERS
// =========================================================

async function loadOwnerMembers() {

    const container =
        document.getElementById(
            "owner-admin-members"
        );

    const status =
        document.getElementById(
            "owner-admin-status"
        );

    if (!container || !status) {
        return;
    }

    if (!isOwner()) {
        return;
    }

    status.textContent =
        "Loading members…";

    container.innerHTML = `
        <div class="tracker-card">
            Loading members…
        </div>
    `;

    try {

        const members =
            await window.daydreamersAdmin
                .getMembers();

        members.sort(
            (a, b) => {

                if (
                    a.id === OWNER_UID
                ) {
                    return -1;
                }

                if (
                    b.id === OWNER_UID
                ) {
                    return 1;
                }

                return String(
                    a.displayName ||
                    a.username ||
                    a.id
                ).localeCompare(
                    String(
                        b.displayName ||
                        b.username ||
                        b.id
                    )
                );
            }
        );

        status.textContent =
            `${members.length} member profile(s) found.`;

        if (!members.length) {

            container.innerHTML = `
                <div class="tracker-card">
                    <h2>No members found</h2>
                    <p class="muted">
                        No documents currently exist
                        in the users collection.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            members
                .map(
                    createMemberCard
                )
                .join("");

        bindMemberControls();

    } catch (error) {

        console.error(
            "DAYDREAMERS Owner Admin load failed:",
            error
        );

        status.textContent =
            "Could not load members.";

        container.innerHTML = `
            <div class="tracker-card">
                <h2>⚠️ Admin error</h2>
                <p class="muted">
                    ${escapeAdminHTML(
                        error.message ||
                        "Unknown error"
                    )}
                </p>
            </div>
        `;
    }
}


// =========================================================
// MEMBER CARD
// =========================================================

function createMemberCard(
    member
) {

    const isOwnerMember =
        member.id === OWNER_UID;

    const permissions =
        {
            ...DEFAULT_PERMISSIONS,
            ...(member.permissions || {})
        };

    return `
        <div
            class="tracker-card owner-admin-member-card"
            data-member-id="${escapeAdminHTML(
                member.id
            )}"
            style="
                margin-bottom:16px;
            "
        >

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:20px;
                flex-wrap:wrap;
            ">

                <div>

                    <p class="small-label">
                        ${
                            isOwnerMember
                                ? "👑 OWNER"
                                : "MEMBER"
                        }
                    </p>

                    <h2 style="
                        margin-bottom:4px;
                    ">
                        ${escapeAdminHTML(
                            member.displayName ||
                            member.username ||
                            "Unnamed Member"
                        )}
                    </h2>

                    <p class="muted">
                        @${escapeAdminHTML(
                            member.username ||
                            "no-username"
                        )}
                    </p>

                    <small class="muted">
                        UID:
                        ${escapeAdminHTML(
                            member.id
                        )}
                    </small>

                </div>


                <div style="
                    min-width:180px;
                ">

                    <label style="
                        display:block;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        Role
                    </label>

                    <select
                        data-role
                        style="
                            width:100%;
                            padding:10px;
                            border-radius:10px;
                            border:1px solid rgba(100,100,140,.2);
                        "
                        ${
                            isOwnerMember
                                ? "disabled"
                                : ""
                        }
                    >

                        <option
                            value="member"
                            ${
                                (member.role ||
                                    "member") ===
                                "member"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Member
                        </option>

                        <option
                            value="moderator"
                            ${
                                member.role ===
                                "moderator"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Moderator
                        </option>

                    </select>

                </div>

            </div>


            <hr style="
                border:0;
                border-top:1px solid rgba(100,100,140,.12);
                margin:20px 0;
            ">


            <h3 style="
                margin-bottom:14px;
            ">
                Permissions
            </h3>


            <div style="
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(220px,1fr)
                    );
                gap:10px;
            ">

                ${permissionCheckbox(
                    "viewSharedProgress",
                    "View shared progress",
                    permissions.viewSharedProgress,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "addOwnStudySessions",
                    "Add own study sessions",
                    permissions.addOwnStudySessions,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "editOwnActivities",
                    "Edit own activities",
                    permissions.editOwnActivities,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "editOwnChapterProgress",
                    "Edit own chapter progress",
                    permissions.editOwnChapterProgress,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "editOtherData",
                    "Edit other data",
                    permissions.editOtherData,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "manageMembers",
                    "Manage members",
                    permissions.manageMembers,
                    isOwnerMember
                )}

                ${permissionCheckbox(
                    "changePublicVisibility",
                    "Change public visibility",
                    permissions.changePublicVisibility,
                    isOwnerMember
                )}

            </div>


            <div style="
                display:flex;
                justify-content:flex-end;
                gap:10px;
                margin-top:20px;
                flex-wrap:wrap;
            ">

                ${
                    isOwnerMember
                        ? `
                            <span
                                style="
                                    padding:10px 14px;
                                    border-radius:10px;
                                    background:rgba(234,179,8,.12);
                                    font-weight:700;
                                "
                            >
                                🔒 Owner account protected
                            </span>
                        `
                        : `
                            <button
                                type="button"
                                data-save-member
                                style="
                                    padding:10px 15px;
                                    border:0;
                                    border-radius:10px;
                                    cursor:pointer;
                                    font-weight:700;
                                "
                            >
                                💾 Save Changes
                            </button>

                            <button
                                type="button"
                                data-delete-member
                                style="
                                    padding:10px 15px;
                                    border:0;
                                    border-radius:10px;
                                    cursor:pointer;
                                    font-weight:700;
                                "
                            >
                                🗑️ Remove Profile
                            </button>
                        `
                }

            </div>

        </div>
    `;
}


function permissionCheckbox(
    key,
    label,
    checked,
    disabled
) {

    return `
        <label style="
            display:flex;
            align-items:center;
            gap:9px;
            padding:11px;
            border-radius:10px;
            background:rgba(99,102,241,.05);
            cursor:pointer;
        ">

            <input
                type="checkbox"
                data-permission="${key}"
                ${checked ? "checked" : ""}
                ${disabled ? "disabled" : ""}
            >

            <span>
                ${escapeAdminHTML(label)}
            </span>

        </label>
    `;
}


// =========================================================
// MEMBER BUTTONS
// =========================================================

function bindMemberControls() {

    document
        .querySelectorAll(
            "[data-save-member]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const card =
                            button.closest(
                                "[data-member-id]"
                            );

                        if (!card) return;

                        const memberId =
                            card.dataset.memberId;

                        const role =
                            card.querySelector(
                                "[data-role]"
                            )?.value ||
                            "member";

                        const permissions = {};

                        card
                            .querySelectorAll(
                                "[data-permission]"
                            )
                            .forEach(
                                (checkbox) => {

                                    permissions[
                                        checkbox.dataset.permission
                                    ] =
                                        checkbox.checked;
                                }
                            );

                        button.disabled = true;
                        button.textContent =
                            "Saving…";

                        try {

                            await window.daydreamersAdmin
                                .updateMember(
                                    memberId,
                                    {
                                        role,
                                        permissions
                                    }
                                );

                            button.textContent =
                                "✓ Saved";

                            setTimeout(
                                () => {
                                    button.textContent =
                                        "💾 Save Changes";
                                    button.disabled =
                                        false;
                                },
                                1000
                            );

                        } catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                error.message ||
                                "Could not save member."
                            );

                            button.textContent =
                                "💾 Save Changes";

                            button.disabled =
                                false;
                        }
                    }
                );
            }
        );


    document
        .querySelectorAll(
            "[data-delete-member]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const card =
                            button.closest(
                                "[data-member-id]"
                            );

                        if (!card) return;

                        const memberId =
                            card.dataset.memberId;

                        button.disabled = true;

                        try {

                            const deleted =
                                await window.daydreamersAdmin
                                    .deleteMember(
                                        memberId
                                    );

                            if (deleted) {
                                await loadOwnerMembers();
                            } else {
                                button.disabled =
                                    false;
                            }

                        } catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                error.message ||
                                "Could not remove member."
                            );

                            button.disabled =
                                false;
                        }
                    }
                );
            }
        );
}


// =========================================================
// NAVIGATION
// =========================================================

function ensureOwnerAdminNavigation() {

    if (!isOwner()) {
        return;
    }

    const navigation =
        document.querySelector(
            ".navigation"
        );

    if (
        !navigation ||
        document.querySelector(
            ".nav-item[data-page='owner-admin']"
        )
    ) {
        return;
    }

    const item =
        document.createElement(
            "a"
        );

    item.href = "#";
    item.className = "nav-item";
    item.dataset.page = "owner-admin";
    item.innerHTML =
        "👑 Owner Admin";

    item.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            document
                .querySelectorAll(
                    ".page-section"
                )
                .forEach(
                    (page) => {
                        page.style.display =
                            "none";
                    }
                );

            const target =
                document.getElementById(
                    "owner-admin"
                );

            if (target) {
                target.style.display =
                    "block";
            }

            document
                .querySelectorAll(
                    ".nav-item"
                )
                .forEach(
                    (nav) => {
                        nav.classList.toggle(
                            "active",
                            nav === item
                        );
                    }
                );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            loadOwnerMembers();
        }
    );

    navigation.appendChild(item);
}


// =========================================================
// ACCOUNT MENU
// =========================================================

function addOwnerAdminAccountButton() {

    if (!isOwner()) {
        return;
    }

    const menu =
        document.getElementById(
            "daydreamers-account-menu"
        );

    if (!menu) {
        return;
    }

    if (
        document.getElementById(
            "owner-admin-account-action"
        )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.type = "button";
    button.id =
        "owner-admin-account-action";

    button.textContent =
        "👑 Owner Admin";

    button.style.cssText = `
        width:100%;
        padding:10px 12px;
        border:0;
        border-radius:10px;
        background:rgba(234,179,8,.12);
        cursor:pointer;
        font-weight:700;
        margin-bottom:7px;
    `;

    button.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            menu.style.display =
                "none";

            document
                .querySelector(
                    ".nav-item[data-page='owner-admin']"
                )
                ?.click();
        }
    );

    const settingsButton =
        menu.querySelector(
            "#account-settings-action"
        );

    if (settingsButton) {
        settingsButton.before(
            button
        );
    } else {
        menu.prepend(button);
    }
}


// =========================================================
// INITIALIZATION
// =========================================================

async function initializeOwnerAdmin() {

    try {

        if (
            window.daydreamersProfileReady
        ) {
            await window
                .daydreamersProfileReady;
        }

        if (!isOwner()) {
            console.log(
                "DAYDREAMERS: normal member account."
            );
            return;
        }

        ensureOwnerAdminPage();
        ensureOwnerAdminNavigation();

        const observer =
            new MutationObserver(
                () => {
                    ensureOwnerAdminNavigation();
                    addOwnerAdminAccountButton();
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        addOwnerAdminAccountButton();

        console.log(
            "DAYDREAMERS: Owner Admin enabled."
        );

    } catch (error) {

        console.error(
            "DAYDREAMERS Owner Admin initialization failed:",
            error
        );
    }
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeOwnerAdmin,
        {
            once: true
        }
    );

} else {

    initializeOwnerAdmin();

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeAdminHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
