/* =========================================================
   DAYDREAMERS
   Main Application
   ========================================================= */

(() => {
    "use strict";

    /* ---------------------------------------------------------
       CONFIGURATION
       --------------------------------------------------------- */

    const STORAGE_KEYS = {
        studySessions: "daydreamers_study_sessions_v1",
        chapterProgress: "daydreamers_chapter_progress_v1",
        dailyLogs: "daydreamers_daily_logs_v1",
        activities: "daydreamers_activities_v1"
    };

    const DEFAULT_DAILY_GOAL_HOURS = 6;

    /* ---------------------------------------------------------
       STATE
       --------------------------------------------------------- */
    let studySessions = [];
    let chapterProgress = {};
    let dailyLogs = {};
    let activities = loadArray(STORAGE_KEYS.activities);

    let firebaseStudyLoaded = false;
 
   
    let selectedDailyLogDate = getTodayKey();
    let selectedCalendarDate = getTodayKey();
    let calendarViewDate = new Date();

    /* ---------------------------------------------------------
       BASIC HELPERS
       --------------------------------------------------------- */

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function loadArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function loadObject(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key));

            return value &&
                typeof value === "object" &&
                !Array.isArray(value)
                ? value
                : {};
        } catch {
            return {};
        }
    }

    async function saveState() {
    // Keep the existing local backup
    localStorage.setItem(
        STORAGE_KEYS.studySessions,
        JSON.stringify(studySessions)
    );

    localStorage.setItem(
        STORAGE_KEYS.chapterProgress,
        JSON.stringify(chapterProgress)
    );

    localStorage.setItem(
        STORAGE_KEYS.dailyLogs,
        JSON.stringify(dailyLogs)
    );

    localStorage.setItem(
        STORAGE_KEYS.activities,
        JSON.stringify(activities)
    );

    // Save study data to Firebase when a user is logged in
    if (
        window.daydreamersStudyCloud &&
        window.daydreamersProfile?.uid
    ) {
        try {
            await window.daydreamersStudyCloud.save({
                studySessions,
                chapterProgress,
                dailyLogs
            });

            firebaseStudyLoaded = true;

        } catch (error) {
            console.error(
                "DAYDREAMERS Firebase study save failed:",
                error
            );
        }
    }
}
        localStorage.setItem(
            STORAGE_KEYS.studySessions,
            JSON.stringify(studySessions)
        );

        localStorage.setItem(
            STORAGE_KEYS.chapterProgress,
            JSON.stringify(chapterProgress)
        );

        localStorage.setItem(
            STORAGE_KEYS.dailyLogs,
            JSON.stringify(dailyLogs)
        );

        localStorage.setItem(
            STORAGE_KEYS.activities,
            JSON.stringify(activities)
        );
    }

    function getTodayKey() {
        const now = new Date();

        const year = now.getFullYear();

        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatDate(dateKey) {
        const date = new Date(
            `${dateKey}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return dateKey;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }

    function formatShortDate(dateKey) {
        const date = new Date(
            `${dateKey}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return dateKey;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatHours(hours) {
        const totalMinutes = Math.round(
            Number(hours || 0) * 60
        );

        const h = Math.floor(
            totalMinutes / 60
        );

        const m = totalMinutes % 60;

        return `${h}h ${String(m).padStart(2, "0")}m`;
    }

    function formatHoursCompact(hours) {
        const totalMinutes = Math.round(
            Number(hours || 0) * 60
        );

        const h = Math.floor(
            totalMinutes / 60
        );

        const m = totalMinutes % 60;

        if (h === 0) {
            return `${m}m`;
        }

        if (m === 0) {
            return `${h}h`;
        }

        return `${h}h ${m}m`;
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = String(value);
        }
    }

    function setWidth(id, percentage) {
        const element = $(id);

        if (element) {
            element.style.width =
                `${Math.max(
                    0,
                    Math.min(
                        100,
                        Number(percentage) || 0
                    )
                )}%`;
        }
    }

    /* ---------------------------------------------------------
       SYLLABUS
       --------------------------------------------------------- */

    function getSyllabus() {
        if (
            typeof CA_INTERMEDIATE_SYLLABUS !== "undefined" &&
            Array.isArray(
                CA_INTERMEDIATE_SYLLABUS
            )
        ) {
            return CA_INTERMEDIATE_SYLLABUS;
        }

        return [];
    }

    function getAllChapters() {
        const syllabus = getSyllabus();

        const result = [];

        syllabus.forEach((subject) => {
            const subjectId =
                subject.id ||
                subject.subjectId ||
                slugify(
                    subject.subject ||
                    subject.name ||
                    "subject"
                );

            const subjectName =
                subject.subject ||
                subject.name ||
                subject.title ||
                subjectId;

            const sections =
                Array.isArray(subject.sections)
                    ? subject.sections
                    : [];

            sections.forEach((section) => {
                const sectionName =
                    section.name ||
                    section.title ||
                    section.section ||
                    "";

                if (
                    Array.isArray(
                        section.chapters
                    )
                ) {
                    section.chapters.forEach(
                        (chapter, index) => {
                            addChapter(
                                result,
                                subjectId,
                                subjectName,
                                sectionName,
                                chapter,
                                index
                            );
                        }
                    );
                }

                if (
                    Array.isArray(
                        section.modules
                    )
                ) {
                    section.modules.forEach(
                        (
                            module,
                            moduleIndex
                        ) => {
                            const moduleName =
                                module.name ||
                                module.title ||
                                module.module ||
                                `Module ${
                                    moduleIndex + 1
                                }`;

                            if (
                                Array.isArray(
                                    module.chapters
                                )
                            ) {
                                module.chapters.forEach(
                                    (
                                        chapter,
                                        chapterIndex
                                    ) => {
                                        addChapter(
                                            result,
                                            subjectId,
                                            subjectName,
                                            `${sectionName} • ${moduleName}`
                                                .replace(
                                                    /^ • | • $/g,
                                                    ""
                                                ),
                                            chapter,
                                            chapterIndex
                                        );
                                    }
                                );
                            }
                        }
                    );
                }
            });
        });

        return result;
    }

    function addChapter(
        result,
        subjectId,
        subjectName,
        sectionName,
        chapter,
        index
    ) {
        if (
            typeof chapter === "string"
        ) {
            const name =
                chapter.trim();

            if (!name) {
                return;
            }

            result.push({
                id:
                    `${subjectId}-${slugify(
                        sectionName
                    )}-${index}-${slugify(
                        name
                    )}`,

                subjectId,
                subjectName,
                sectionName,
                name,
                units: []
            });

            return;
        }

        if (
            !chapter ||
            typeof chapter !== "object"
        ) {
            return;
        }

        const name =
            chapter.name ||
            chapter.title ||
            chapter.chapter ||
            chapter.label ||
            `Chapter ${index + 1}`;

        const units =
            chapter.units ||
            chapter.topics ||
            chapter.subtopics ||
            [];

        result.push({
            id:
                chapter.id ||
                `${subjectId}-${slugify(
                    sectionName
                )}-${index}-${slugify(
                    name
                )}`,

            subjectId,
            subjectName,
            sectionName,
            name,

            units:
                Array.isArray(units)
                    ? units
                    : []
        });
    }

    function getChapterProgress(
        chapterId
    ) {
        const value =
            Number(
                chapterProgress[
                    chapterId
                ] || 0
            );

        return Math.max(
            0,
            Math.min(100, value)
        );
    }

    function setChapterProgress(
        chapterId,
        value
    ) {
        chapterProgress[
            chapterId
        ] = Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );

        saveState();
    }

    /* ---------------------------------------------------------
       DATE + GREETING
       --------------------------------------------------------- */

    function updateDateAndGreeting() {
        const dateElement =
            $("current-date");

        const greetingElement =
            $("greeting");

        const now = new Date();

        const hour =
            now.getHours();

        let greeting =
            "Good morning";

        if (
            hour >= 12 &&
            hour < 17
        ) {
            greeting =
                "Good afternoon";
        } else if (
            hour >= 17 &&
            hour < 21
        ) {
            greeting =
                "Good evening";
        } else if (
            hour >= 21 ||
            hour < 5
        ) {
            greeting =
                "Good night";
        }

        if (dateElement) {
            dateElement.textContent =
                now.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
        }
if (greetingElement) {

    const profile =
        window.daydreamersProfile;

    const displayName =
        profile?.displayName ||
        profile?.username ||
        "ashjii";

    greetingElement.textContent =
        `${greeting}, ${displayName} 👋`;
}

       
    }

    /* ---------------------------------------------------------
       NAVIGATION
       --------------------------------------------------------- */

    function setupNavigation() {
        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach((item) => {
                item.addEventListener(
                    "click",
                    (event) => {
                        event.preventDefault();

                        const page =
                            item.dataset.page;

                        if (page) {
                            showPage(page);
                        }
                    }
                );
            });
    }

    function showPage(pageId) {
        const pages =
            document.querySelectorAll(
                ".page-section"
            );

        pages.forEach((page) => {
            page.style.display =
                "none";
        });

        const target =
            $(pageId);

        if (!target) {
            console.warn(
                `DAYDREAMERS: page not found: ${pageId}`
            );

            return;
        }

        target.style.display =
            "block";

        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach((item) => {
                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                        pageId
                );
            });

        if (
            pageId === "dashboard"
        ) {
            renderDashboard();
        }

        if (
            pageId === "study-tracker"
        ) {
            renderStudyTracker();
        }

        if (
            pageId === "chapters"
        ) {
            renderChapters();
        }

        if (
            pageId === "daily-log"
        ) {
            renderDailyLog();
        }

        if (
            pageId === "statistics"
        ) {
            renderStatistics();
        }

        if (
            pageId === "activities"
        ) {
            renderActivities();
        }

        if (
            pageId === "calendar"
        ) {
            renderCalendar();
        }

        if (
            pageId === "compare"
        ) {
            renderCompare();
        }

        if (
            pageId === "motivation"
        ) {
            renderMotivation();
        }

        if (
            pageId === "goals"
        ) {
            renderGoals();
        }

        if (
            pageId === "notes"
        ) {
            renderNotes();
        }

        if (
            pageId === "settings"
        ) {
            renderSettings();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    /* ---------------------------------------------------------
       STUDY DATA
       --------------------------------------------------------- */

    function getSessionsForDate(
        dateKey
    ) {
        return studySessions.filter(
            (session) =>
                session.date === dateKey
        );
    }

    function getStudyHoursForDate(
        dateKey
    ) {
        return getSessionsForDate(
            dateKey
        ).reduce(
            (total, session) =>
                total +
                Number(
                    session.hours || 0
                ),
            0
        );
    }

    function getStudyHoursForSubject(
        dateKey,
        subjectId
    ) {
        return getSessionsForDate(
            dateKey
        )
            .filter(
                (session) =>
                    session.subject ===
                    subjectId
            )
            .reduce(
                (total, session) =>
                    total +
                    Number(
                        session.hours ||
                            0
                    ),
                0
            );
    }

    function getWeeklyStudyHours() {
        let total = 0;

        for (
            let i = 0;
            i < 7;
            i += 1
        ) {
            const date =
                new Date();

            date.setDate(
                date.getDate() - i
            );

            const key =
                date
                    .toISOString()
                    .slice(0, 10);

            total +=
                getStudyHoursForDate(
                    key
                );
        }

        return total;
    }

    function getStudyStreak() {
        let streak = 0;

        for (
            let i = 0;
            i < 365;
            i += 1
        ) {
            const date =
                new Date();

            date.setDate(
                date.getDate() - i
            );

            const key =
                date
                    .toISOString()
                    .slice(0, 10);

            if (
                getStudyHoursForDate(
                    key
                ) > 0
            ) {
                streak += 1;
            } else {
                break;
            }
        }

        return streak;
    }

    function getCompletedChapterCount() {
        return getAllChapters()
            .filter(
                (chapter) =>
                    getChapterProgress(
                        chapter.id
                    ) >= 100
            )
            .length;
    }

    function getOverallChapterProgress() {
        const chapters =
            getAllChapters();

        if (!chapters.length) {
            return 0;
        }

        const total =
            chapters.reduce(
                (sum, chapter) =>
                    sum +
                    getChapterProgress(
                        chapter.id
                    ),
                0
            );

        return Math.round(
            total / chapters.length
        );
    }

    function getSubjectChapterProgress(
        subjectName
    ) {
        const chapters =
            getAllChapters().filter(
                (chapter) =>
                    chapter.subjectName ===
                    subjectName
            );

        if (!chapters.length) {
            return 0;
        }

        const total =
            chapters.reduce(
                (sum, chapter) =>
                    sum +
                    getChapterProgress(
                        chapter.id
                    ),
                0
            );

        return Math.round(
            total / chapters.length
        );
    }

    /* ---------------------------------------------------------
       SUBJECT NAMES
       --------------------------------------------------------- */

    function getSubjectDisplayName(
        subjectId
    ) {
        const map = {
            Accounts:
                "Advanced Accounting",

            Law:
                "Corporate & Other Laws",

            Taxation:
                "Taxation",

            Costing:
                "Cost & Management Accounting",

            Audit:
                "Auditing & Ethics",

            "FM & SM":
                "Financial & Strategic Management"
        };

        return (
            map[subjectId] ||
            subjectId
        );
    }

    /* ---------------------------------------------------------
       DASHBOARD
       --------------------------------------------------------- */

    function renderDashboard() {
        const today =
            getTodayKey();

        const todayHours =
            getStudyHoursForDate(
                today
            );

        const weeklyHours =
            getWeeklyStudyHours();

        const streak =
            getStudyStreak();

        const completed =
            getCompletedChapterCount();

        const chapterTotal =
            getAllChapters().length;

        const chapterPercent =
            getOverallChapterProgress();

        setText(
            "dashboard-study-total",
            formatHours(
                todayHours
            )
        );

        const goalPercent =
            Math.min(
                100,
                Math.round(
                    (todayHours /
                        getDailyGoalHours()) *
                        100
                )
            );

        setText(
            "dashboard-goal-percent",
            `${goalPercent}%`
        );

        setText(
            "dashboard-streak",
            `${streak} days`
        );

        setText(
            "dashboard-chapter-percent",
            `${chapterPercent}%`
        );

        setText(
            "dashboard-chapter-count",
            `${completed} of ${chapterTotal} chapters completed`
        );

        setWidth(
            "dashboard-goal-bar",
            goalPercent
        );

        setWidth(
            "dashboard-chapter-bar",
            chapterPercent
        );

        setText(
            "dashboard-ash-study",
            formatHours(todayHours)
        );

        setText(
            "dashboard-ash-chapters",
            completed
        );

        setText(
            "dashboard-ash-streak",
            `${streak} days 🔥`
        );

        setText(
            "dashboard-weekly-total",
            formatHoursCompact(
                weeklyHours
            )
        );

        renderDashboardBreakdown(
            today
        );

        renderDashboardSessions(
            today
        );

        renderDashboardChapterProgress();
        renderDashboardRecentActivities();
        renderDashboardMiniCalendar();
    }

    function renderDashboardRecentActivities() {
        const container = $("dashboard-recent-activities");
        if (!container) return;

        const recent = activities
            .slice()
            .sort((a, b) => {
                const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
                if (dateCompare !== 0) return dateCompare;
                return Number(b.createdAt || 0) - Number(a.createdAt || 0);
            })
            .slice(0, 4);

        if (!recent.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <p>No activities yet.</p>
                    <span>Add an activity from the Activities page.</span>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="dashboard-activity-list">
                ${recent.map((activity) => {
                    const type = getActivityType(activity.type);
                    return `
                        <div class="dashboard-activity-row">
                            <div class="dashboard-activity-icon">${type.icon}</div>
                            <div class="dashboard-activity-main">
                                <strong>${escapeHTML(activity.title)}</strong>
                                <span>${escapeHTML(type.label)} • ${escapeHTML(formatShortDate(activity.date))}</span>
                            </div>
                            <b>${escapeHTML(formatActivityDuration(activity.minutes))}</b>
                        </div>
                    `;
                }).join("")}
            </div>
            <button type="button" class="dashboard-card-link" data-page="activities">View all activities →</button>
        `;

        const button = container.querySelector("[data-page='activities']");
        if (button) button.addEventListener("click", () => showPage("activities"));
    }

    function getDateKeyOffset(dateKey, offset) {
        const date = new Date(`${dateKey}T00:00:00`);
        date.setDate(date.getDate() + Number(offset || 0));
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function renderDashboardMiniCalendar() {
        const container = $("dashboard-mini-calendar");
        if (!container) return;

        const today = getTodayKey();
        const todayDate = new Date(`${today}T00:00:00`);
        const start = new Date(todayDate);
        start.setDate(todayDate.getDate() - todayDate.getDay());

        const days = Array.from({ length: 7 }, (_, index) => getDateKeyOffset(
            `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
            index
        ));

        container.innerHTML = `
            <div class="dashboard-calendar-week">
                ${days.map((dateKey) => {
                    const date = new Date(`${dateKey}T00:00:00`);
                    const hours = getStudyHoursForDate(dateKey);
                    const count = getActivitiesForDate(dateKey).length;
                    const isToday = dateKey === today;
                    const percent = Math.min(100, Math.round((hours / getDailyGoalHours()) * 100));
                    return `
                        <button type="button" class="dashboard-calendar-day ${isToday ? "today" : ""}" data-dashboard-calendar-date="${dateKey}" title="${escapeHTML(formatDate(dateKey))}">
                            <span>${date.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                            <strong>${date.getDate()}</strong>
                            <div class="dashboard-calendar-bar"><i style="height:${Math.max(hours > 0 ? 12 : 4, percent)}%"></i></div>
                            <small>${hours > 0 ? escapeHTML(formatHoursCompact(hours)) : "—"}</small>
                            ${count ? `<em>${count}</em>` : ""}
                        </button>
                    `;
                }).join("")}
            </div>
            <div class="dashboard-calendar-footer">
                <span>This week • ${escapeHTML(formatHoursCompact(days.reduce((sum, key) => sum + getStudyHoursForDate(key), 0)))} studied</span>
                <button type="button" class="dashboard-card-link" data-page="calendar">Open calendar →</button>
            </div>
        `;

        container.querySelectorAll("[data-dashboard-calendar-date]").forEach((button) => {
            button.addEventListener("click", () => {
                selectedCalendarDate = button.dataset.dashboardCalendarDate;
                calendarViewDate = new Date(`${selectedCalendarDate}T00:00:00`);
                showPage("calendar");
            });
        });

        const openButton = container.querySelector("[data-page='calendar']");
        if (openButton) openButton.addEventListener("click", () => showPage("calendar"));
    }

    function renderDashboardBreakdown(
        dateKey
    ) {
        const subjects = [
            "Accounts",
            "Law",
            "Taxation",
            "Costing",
            "Audit",
            "FM & SM"
        ];

        subjects.forEach(
            (subject) => {
                const hours =
                    getStudyHoursForSubject(
                        dateKey,
                        subject
                    );

                setText(
                    `breakdown-${subject}`,
                    formatHoursCompact(
                        hours
                    )
                );
            }
        );
    }

    function renderDashboardSessions(
        dateKey
    ) {
        const container =
            $("dashboard-today-sessions");

        if (!container) {
            return;
        }

        const sessions =
            getSessionsForDate(
                dateKey
            )
                .slice()
                .sort(
                    (a, b) =>
                        Number(
                            b.createdAt
                        ) -
                        Number(
                            a.createdAt
                        )
                )
                .slice(0, 6);

        if (!sessions.length) {
            container.innerHTML = `
                <div class="tracker-empty-state">
                    <div>📚</div>
                    <p>No study sessions yet.</p>
                    <span>Start your first session today.</span>
                </div>
            `;

            return;
        }

        container.innerHTML =
            sessions
                .map(
                    (session) =>
                        createSessionHTML(
                            session
                        )
                )
                .join("");
    }

    function renderDashboardChapterProgress() {
        const rows =
            document.querySelectorAll(
                "#dashboard .progress-item"
            );

        const syllabus =
            getSyllabus();

        rows.forEach((row) => {
            const label =
                row.querySelector(
                    ".progress-title span"
                );

            const percent =
                row.querySelector(
                    ".progress-title strong"
                );

            const fill =
                row.querySelector(
                    ".progress-fill"
                );

            if (
                !label ||
                !percent ||
                !fill
            ) {
                return;
            }

            const subjectName =
                label.textContent.trim();

            const subject =
                syllabus.find(
                    (item) =>
                        (
                            item.subject ||
                            item.name ||
                            item.title ||
                            ""
                        ).toLowerCase() ===
                        subjectName.toLowerCase()
                );

            if (!subject) {
                return;
            }

            const name =
                subject.subject ||
                subject.name ||
                subject.title;

            const progress =
                getSubjectChapterProgress(
                    name
                );

            percent.textContent =
                `${progress}%`;

            fill.style.width =
                `${progress}%`;
        });
    }

    /* ---------------------------------------------------------
       STUDY MODAL
       --------------------------------------------------------- */

    function setupStudyModal() {
        const modal =
            $("study-modal");

        const addButton =
            $("add-study-button");

        const trackerButton =
            $("study-tracker-add-button");

        const closeButton =
            $("close-study-modal");

        const saveButton =
            $("save-study-button");

        if (addButton) {
            addButton.addEventListener(
                "click",
                openStudyModal
            );
        }

        if (trackerButton) {
            trackerButton.addEventListener(
                "click",
                openStudyModal
            );
        }

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeStudyModal
            );
        }

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                saveStudySession
            );
        }

        if (modal) {
            modal.addEventListener(
                "click",
                (event) => {
                    if (
                        event.target ===
                        modal
                    ) {
                        closeStudyModal();
                    }
                }
            );
        }
    }

    function openStudyModal() {
        const modal =
            $("study-modal");

        if (!modal) {
            return;
        }

        modal.classList.add("open");

        modal.style.display =
            "flex";

        const hours =
            $("study-hours");

        if (hours) {
            hours.value = "";

            setTimeout(
                () => hours.focus(),
                50
            );
        }
    }

    function closeStudyModal() {
        const modal =
            $("study-modal");

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "open"
        );

        modal.style.display = "";
    }

    function saveStudySession() {
        const subjectElement =
            $("study-subject");

        const hoursElement =
            $("study-hours");

        if (
            !subjectElement ||
            !hoursElement
        ) {
            return;
        }

        const subject =
            subjectElement.value;

        const hours =
            Number(
                hoursElement.value
            );

        if (
            !Number.isFinite(hours) ||
            hours <= 0
        ) {
            alert(
                "Please enter a study time greater than 0."
            );

            hoursElement.focus();

            return;
        }

        if (hours > 24) {
            alert(
                "Please enter a realistic study time."
            );

            hoursElement.focus();

            return;
        }

        studySessions.push({
            id:
                `session-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

            date:
                getTodayKey(),

            subject,

            hours,

            createdAt:
                Date.now()
        });

        saveState();

        closeStudyModal();

        updateAllDisplays();

        showPage(
            getVisiblePageId() ||
                "dashboard"
        );
    }

    function createSessionHTML(
        session
    ) {
        return `
            <div class="study-session-item">
                <div>
                    <strong>
                        ${escapeHTML(
                            getSubjectDisplayName(
                                session.subject
                            )
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            formatHours(
                                session.hours
                            )
                        )}
                    </small>
                </div>

                <span>📚</span>
            </div>
        `;
    }

    /* ---------------------------------------------------------
       STUDY TRACKER
       --------------------------------------------------------- */

    function renderStudyTracker() {
        const today =
            getTodayKey();

        const sessions =
            getSessionsForDate(
                today
            );

        const hours =
            getStudyHoursForDate(
                today
            );

        const subjects =
            new Set(
                sessions.map(
                    (session) =>
                        session.subject
                )
            );

        setText(
            "tracker-today-total",
            formatHours(hours)
        );

        setText(
            "tracker-session-count",
            sessions.length
        );

        setText(
            "tracker-subject-count",
            subjects.size
        );

        const container =
            $("today-study-sessions");

        if (container) {
            if (!sessions.length) {
                container.innerHTML = `
                    <div class="tracker-empty-state">
                        <div>📚</div>
                        <p>No study sessions yet today.</p>
                        <span>Add your first study session.</span>
                    </div>
                `;
            } else {
                container.innerHTML =
                    sessions
                        .slice()
                        .reverse()
                        .map(
                            createSessionHTML
                        )
                        .join("");
            }
        }

        renderRecentStudyDays();
    }

    function renderRecentStudyDays() {
        const container =
            $("recent-study-days");

        if (!container) {
            return;
        }

        const rows = [];

        for (
            let i = 0;
            i < 14;
            i += 1
        ) {
            const date =
                new Date();

            date.setDate(
                date.getDate() - i
            );

            const key =
                date
                    .toISOString()
                    .slice(0, 10);

            const hours =
                getStudyHoursForDate(
                    key
                );

            if (hours > 0) {
                rows.push(`
                    <div class="recent-study-item">
                        <div>
                            <strong>
                                ${escapeHTML(
                                    formatShortDate(
                                        key
                                    )
                                )}
                            </strong>

                            <small>
                                ${getSessionsForDate(
                                    key
                                ).length} session(s)
                            </small>
                        </div>

                        <strong>
                            ${escapeHTML(
                                formatHours(
                                    hours
                                )
                            )}
                        </strong>
                    </div>
                `);
            }
        }

        container.innerHTML =
            rows.length
                ? rows.join("")
                : `
                    <div class="tracker-empty-state">
                        <div>📅</div>
                        <p>No study history yet.</p>
                    </div>
                `;
    }
    /* ---------------------------------------------------------
       CHAPTERS
       --------------------------------------------------------- */

    function setupChapterFilters() {
        const filter =
            $("chapter-subject-filter");

        const search =
            $("chapter-search");

        if (filter) {
            const subjects =
                getSyllabus();

            subjects.forEach(
                (subject) => {
                    const id =
                        subject.id ||
                        subject.subjectId ||
                        slugify(
                            subject.subject ||
                            subject.name ||
                            ""
                        );

                    const name =
                        subject.subject ||
                        subject.name ||
                        subject.title ||
                        id;

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value = id;
                    option.textContent =
                        name;

                    filter.appendChild(
                        option
                    );
                }
            );

            filter.addEventListener(
                "change",
                renderChapters
            );
        }

        if (search) {
            search.addEventListener(
                "input",
                renderChapters
            );
        }
    }

    function renderChapters() {
        const container =
            $("chapters-content");

        const filter =
            $("chapter-subject-filter");

        const search =
            $("chapter-search");

        if (!container) {
            return;
        }

        const chapters =
            getAllChapters();

        if (!chapters.length) {
            container.innerHTML = `
                <div class="tracker-empty-state">
                    <div>📖</div>
                    <p>No chapters found.</p>
                    <span>
                        Check that syllabus.js is loaded.
                    </span>
                </div>
            `;

            return;
        }

        const selectedSubject =
            filter
                ? filter.value
                : "all";

        const searchTerm =
            search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";

        const filtered =
            chapters.filter(
                (chapter) => {
                    const matchesSubject =
                        selectedSubject ===
                            "all" ||
                        chapter.subjectId ===
                            selectedSubject;

                    const searchable = [
                        chapter.name,
                        chapter.subjectName,
                        chapter.sectionName,
                        ...(
                            Array.isArray(
                                chapter.units
                            )
                                ? chapter.units.map(
                                      (unit) =>
                                          typeof unit ===
                                          "string"
                                              ? unit
                                              : unit?.name ||
                                                unit?.title ||
                                                ""
                                  )
                                : []
                        )
                    ]
                        .join(" ")
                        .toLowerCase();

                    return (
                        matchesSubject &&
                        (
                            !searchTerm ||
                            searchable.includes(
                                searchTerm
                            )
                        )
                    );
                }
            );

        if (!filtered.length) {
            container.innerHTML = `
                <div class="tracker-empty-state">
                    <div>🔎</div>
                    <p>No matching chapters.</p>
                    <span>
                        Try another search or subject.
                    </span>
                </div>
            `;

            return;
        }

        const groups =
            new Map();

        filtered.forEach(
            (chapter) => {
                if (
                    !groups.has(
                        chapter.subjectName
                    )
                ) {
                    groups.set(
                        chapter.subjectName,
                        []
                    );
                }

                groups
                    .get(
                        chapter.subjectName
                    )
                    .push(chapter);
            }
        );

        container.innerHTML =
            Array.from(
                groups.entries()
            )
                .map(
                    ([
                        subjectName,
                        subjectChapters
                    ]) => {
                        const cards =
                            subjectChapters
                                .map(
                                    (
                                        chapter
                                    ) =>
                                        createChapterCard(
                                            chapter
                                        )
                                )
                                .join("");

                        return `
                            <div class="chapter-subject-group">

                                <div class="chapter-subject-heading">

                                    <div>
                                        <p class="small-label">
                                            SUBJECT
                                        </p>

                                        <h2>
                                            ${escapeHTML(
                                                subjectName
                                            )}
                                        </h2>
                                    </div>

                                    <span>
                                        ${
                                            subjectChapters.length
                                        }
                                        chapter(s)
                                    </span>

                                </div>

                                <div class="chapter-list">
                                    ${cards}
                                </div>

                            </div>
                        `;
                    }
                )
                .join("");

        bindChapterControls();
    }

    function createChapterCard(
        chapter
    ) {
        const progress =
            getChapterProgress(
                chapter.id
            );

        const units =
            Array.isArray(
                chapter.units
            )
                ? chapter.units
                      .map(
                          (unit) => {
                              if (
                                  typeof unit ===
                                  "string"
                              ) {
                                  return unit;
                              }

                              return (
                                  unit?.name ||
                                  unit?.title ||
                                  unit?.unit ||
                                  ""
                              );
                          }
                      )
                      .filter(Boolean)
                : [];

        return `
            <article
                class="chapter-card"
                data-chapter-id="${escapeHTML(
                    chapter.id
                )}"
            >

                <div class="chapter-card-header">

                    <div>
                        <p class="small-label">
                            ${escapeHTML(
                                chapter.sectionName ||
                                    "CHAPTER"
                            )}
                        </p>

                        <h3>
                            ${escapeHTML(
                                chapter.name
                            )}
                        </h3>
                    </div>

                    <strong class="chapter-percent">
                        ${progress}%
                    </strong>

                </div>

                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        style="width: ${progress}%;">
                    </div>
                </div>

                <div class="chapter-card-footer">

                    <select
                        class="chapter-progress-select"
                        data-chapter-id="${escapeHTML(
                            chapter.id
                        )}"
                    >

                        ${[
                            0,
                            25,
                            50,
                            75,
                            100
                        ]
                            .map(
                                (value) => `
                                    <option
                                        value="${value}"
                                        ${
                                            progress ===
                                            value
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${value}%
                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                    ${
                        units.length
                            ? `
                                <details class="chapter-units">

                                    <summary>
                                        ${
                                            units.length
                                        }
                                        topic(s)
                                    </summary>

                                    <ul>
                                        ${units
                                            .map(
                                                (
                                                    unit
                                                ) =>
                                                    `
                                                    <li>
                                                        ${escapeHTML(
                                                            unit
                                                        )}
                                                    </li>
                                                    `
                                            )
                                            .join("")}
                                    </ul>

                                </details>
                            `
                            : ""
                    }

                </div>

            </article>
        `;
    }

    function bindChapterControls() {
        document
            .querySelectorAll(
                ".chapter-progress-select"
            )
            .forEach(
                (select) => {
                    select.addEventListener(
                        "change",
                        () => {
                            const id =
                                select.dataset
                                    .chapterId;

                            setChapterProgress(
                                id,
                                Number(
                                    select.value
                                )
                            );

                            renderChapters();

                            updateAllDisplays();
                        }
                    );
                }
            );
    }

    /* ---------------------------------------------------------
       DAILY LOG
       --------------------------------------------------------- */

    function renderDailyLog() {
        const page = $("daily-log");
        if (!page) return;

        const existing = page.querySelector(".daily-log-app");
        if (existing) {
            updateDailyLogContent();
            return;
        }

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">DAILY JOURNAL</p>
                    <h1>Daily Log</h1>
                    <p class="muted">Capture what you studied, what you finished and what you want to improve tomorrow. ✨</p>
                </div>
                <div class="page-header-badge" id="daily-log-status-badge">Today</div>
            </div>

            <div class="daily-log-stats" id="daily-log-stats"></div>

            <div class="daily-log-app daily-log-enhanced-grid">
                <div class="tracker-card daily-log-editor-card">
                    <div class="daily-log-editor-top">
                        <div>
                            <p class="small-label">YOUR DAY</p>
                            <h2 id="daily-log-date-heading">${escapeHTML(formatDate(selectedDailyLogDate))}</h2>
                        </div>
                        <label class="daily-log-date-picker">
                            <span>Choose date</span>
                            <input type="date" id="daily-log-date" value="${escapeHTML(selectedDailyLogDate)}">
                        </label>
                    </div>

                    <div class="daily-log-prompt">
                        <span>📝</span>
                        <div>
                            <strong>How did today go?</strong>
                            <p>Write a few lines about your study session, wins, doubts, distractions or tomorrow's plan.</p>
                        </div>
                    </div>

                    <textarea id="daily-log-text" class="daily-log-editor" rows="13" maxlength="12000" placeholder="Today I studied…\n\nWhat I completed…\n\nWhat I found difficult…\n\nTomorrow I want to…"></textarea>

                    <div class="daily-log-editor-footer">
                        <span class="notes-counter" id="daily-log-counter">0 characters</span>
                        <div class="quick-actions">
                            <button id="daily-log-save-button">💾 Save Log</button>
                            <button id="daily-log-clear-button" class="secondary-button">Clear</button>
                        </div>
                    </div>
                    <p class="daily-log-save-status" id="daily-log-save-status">Your log is stored locally on this browser.</p>
                </div>

                <div class="tracker-card daily-log-timeline-card">
                    <div class="tracker-card-header">
                        <div>
                            <p class="small-label">YOUR JOURNAL</p>
                            <h2>Recent Logs</h2>
                        </div>
                        <span class="settings-badge" id="daily-log-count-badge">0 saved</span>
                    </div>
                    <div id="daily-log-history" class="daily-log-timeline"></div>
                </div>
            </div>
        `;

        const dateInput = $("daily-log-date");
        const saveButton = $("daily-log-save-button");
        const clearButton = $("daily-log-clear-button");
        const textArea = $("daily-log-text");
        const counter = $("daily-log-counter");

        if (dateInput) {
            dateInput.addEventListener("change", () => {
                selectedDailyLogDate = dateInput.value || getTodayKey();
                updateDailyLogContent();
            });
        }
        if (saveButton) saveButton.addEventListener("click", saveDailyLog);
        if (clearButton) clearButton.addEventListener("click", clearDailyLog);
        if (textArea && counter) {
            textArea.addEventListener("input", () => {
                counter.textContent = `${textArea.value.length.toLocaleString()} characters`;
            });
        }

        updateDailyLogContent();
    }

    function updateDailyLogContent() {
        const dateInput =
            $("daily-log-date");

        const textArea =
            $("daily-log-text");

        const heading =
            $("daily-log-date-heading");

        const history =
            $("daily-log-history");

        if (dateInput) {
            dateInput.value =
                selectedDailyLogDate;
        }

        if (heading) {
            heading.textContent =
                formatDate(
                    selectedDailyLogDate
                );
        }

        const savedText = dailyLogs[selectedDailyLogDate] || "";

        if (textArea) {
            textArea.value = savedText;
        }

        const counter = $("daily-log-counter");
        if (counter) {
            counter.textContent = `${savedText.length.toLocaleString()} characters`;
        }

        const isToday = selectedDailyLogDate === getTodayKey();
        const statusBadge = $("daily-log-status-badge");
        if (statusBadge) statusBadge.textContent = isToday ? "Today" : formatShortDate(selectedDailyLogDate);

        const status = $("daily-log-save-status");
        if (status) status.textContent = savedText ? "Saved locally ✓" : "No entry saved for this date yet.";

        const savedDates = Object.keys(dailyLogs).filter((key) => String(dailyLogs[key] || "").trim()).length;
        const countBadge = $("daily-log-count-badge");
        if (countBadge) countBadge.textContent = `${savedDates} saved`;

        const statBox = $("daily-log-stats");
        if (statBox) {
            const todayLog = String(dailyLogs[getTodayKey()] || "").trim();
            const totalWords = Object.values(dailyLogs).reduce((sum, value) => {
                const text = String(value || "").trim();
                return sum + (text ? text.split(/\s+/).length : 0);
            }, 0);
            statBox.innerHTML = `
                <div class="daily-log-stat-card"><span>🗓️ Logged days</span><strong>${savedDates}</strong><small>days with a journal entry</small></div>
                <div class="daily-log-stat-card"><span>✍️ This entry</span><strong>${savedText.trim() ? savedText.trim().split(/\s+/).length : 0}</strong><small>words written</small></div>
                <div class="daily-log-stat-card"><span>📚 Today's study</span><strong>${escapeHTML(formatHours(getStudyHoursForDate(getTodayKey())))}</strong><small>from Study Tracker</small></div>
                <div class="daily-log-stat-card"><span>🔥 Streak</span><strong>${getStudyStreak()} days</strong><small>${todayLog ? "Today's journal is written" : "Write today's reflection"}</small></div>
            `;
        }

        if (history) {
            const entries =
                Object.entries(
                    dailyLogs
                )
                    .filter(
                        ([, value]) =>
                            String(
                                value || ""
                            ).trim()
                    )
                    .sort(
                        ([a], [b]) =>
                            b.localeCompare(a)
                    )
                    .slice(0, 14);

            history.innerHTML =
                entries.length
                    ? entries
                          .map(
                              (
                                  [date, text]
                              ) => `
                                <button type="button" class="daily-log-timeline-item" data-daily-log-date="${escapeHTML(date)}">
                                    <span class="daily-log-timeline-dot">📝</span>
                                    <span class="daily-log-timeline-content">
                                        <strong>${escapeHTML(formatShortDate(date))}</strong>
                                        <small>${escapeHTML(String(text).replace(/\s+/g, " ").slice(0, 120))}${String(text).length > 120 ? "…" : ""}</small>
                                    </span>
                                    <span class="daily-log-arrow">→</span>
                                </button>
                              `
                          )
                          .join("")
                    : `
                        <div class="tracker-empty-state">
                            <div>📝</div>
                            <p>No daily logs yet.</p>
                            <small>Write your first reflection above.</small>
                        </div>
                    `;

            history.querySelectorAll("[data-daily-log-date]").forEach((button) => {
                button.addEventListener("click", () => {
                    selectedDailyLogDate = button.dataset.dailyLogDate || getTodayKey();
                    updateDailyLogContent();
                });
            });
        }
    }

    function saveDailyLog() {
        const textArea =
            $("daily-log-text");

        if (!textArea) {
            return;
        }

        const value =
            textArea.value.trim();

        if (value) {
            dailyLogs[
                selectedDailyLogDate
            ] = value;
        } else {
            delete dailyLogs[
                selectedDailyLogDate
            ];
        }

        saveState();

        updateDailyLogContent();
        const status = $("daily-log-save-status");
        if (status) status.textContent = "Saved just now ✓";
    }

    function clearDailyLog() {
        delete dailyLogs[
            selectedDailyLogDate
        ];

        saveState();

        updateDailyLogContent();
        const status = $("daily-log-save-status");
        if (status) status.textContent = "Entry cleared";
    }

    /* ---------------------------------------------------------
       STATISTICS
       --------------------------------------------------------- */

    function getLastNDays(count) {
        const days = [];

        for (let i = count - 1; i >= 0; i -= 1) {
            const date = new Date();
            date.setHours(12, 0, 0, 0);
            date.setDate(date.getDate() - i);

            const key =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    date.getDate()
                ).padStart(2, "0")}`;

            days.push({
                key,
                date,
                hours: getStudyHoursForDate(key)
            });
        }

        return days;
    }

    function createStudyProgressChartHTML(days) {
        const width = 900;
        const height = 300;
        const left = 54;
        const right = 22;
        const top = 22;
        const bottom = 54;
        const plotWidth = width - left - right;
        const plotHeight = height - top - bottom;

        const maxHours = Math.max(
            getDailyGoalHours(),
            ...days.map((day) => day.hours),
            1
        );

        const x = (index) =>
            left +
            (index / Math.max(days.length - 1, 1)) *
                plotWidth;

        const y = (hours) =>
            top +
            plotHeight -
            (hours / maxHours) * plotHeight;

        const points = days.map((day, index) => ({
            x: x(index),
            y: y(day.hours),
            day
        }));

        const linePath = points
            .map((point, index) =>
                `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`
            )
            .join(" ");

        const areaPath =
            `M${points[0].x.toFixed(1)},${height - bottom} ` +
            points
                .map((point) =>
                    `L${point.x.toFixed(1)},${point.y.toFixed(1)}`
                )
                .join(" ") +
            ` L${points[points.length - 1].x.toFixed(1)},${height - bottom} Z`;

        const gridLines = [0, 0.25, 0.5, 0.75, 1]
            .map((ratio) => {
                const gridY = top + plotHeight * ratio;
                const value = maxHours * (1 - ratio);

                return `
                    <line
                        x1="${left}"
                        y1="${gridY.toFixed(1)}"
                        x2="${width - right}"
                        y2="${gridY.toFixed(1)}"
                        class="statistics-grid-line"
                    />
                    <text
                        x="${left - 10}"
                        y="${(gridY + 4).toFixed(1)}"
                        text-anchor="end"
                        class="statistics-axis-label"
                    >${escapeHTML(formatHoursCompact(value))}</text>
                `;
            })
            .join("");

        const goalY = y(getDailyGoalHours());

        const labels = days
            .map((item, index) => {
                if (index % 2 !== 0 && days.length > 8) {
                    return "";
                }

                return `
                    <text
                        x="${x(index).toFixed(1)}"
                        y="${height - 20}"
                        text-anchor="middle"
                        class="statistics-axis-label"
                    >${escapeHTML(
                        item.date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                        })
                    )}</text>
                `;
            })
            .join("");

        const pointsHTML = points
            .map(
                (point) => `
                    <circle
                        cx="${point.x.toFixed(1)}"
                        cy="${point.y.toFixed(1)}"
                        r="4.5"
                        class="statistics-point"
                    >
                        <title>${escapeHTML(
                            `${point.day.date.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })}: ${formatHours(point.day.hours)}`
                        )}</title>
                    </circle>
                `
            )
            .join("");

        return `
            <div class="statistics-chart-wrap">
                <svg
                    class="statistics-line-chart"
                    viewBox="0 0 ${width} ${height}"
                    role="img"
                    aria-label="Study hours progression over the last 14 days"
                >
                    <defs>
                        <linearGradient
                            id="studyProgressGradient"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >
                            <stop offset="0%" stop-color="#6d8cff" stop-opacity="0.28" />
                            <stop offset="100%" stop-color="#8067e8" stop-opacity="0" />
                        </linearGradient>
                    </defs>

                    ${gridLines}

                    <line
                        x1="${left}"
                        y1="${goalY.toFixed(1)}"
                        x2="${width - right}"
                        y2="${goalY.toFixed(1)}"
                        class="statistics-goal-line"
                    />

                    <text
                        x="${width - right}"
                        y="${Math.max(top + 12, goalY - 8).toFixed(1)}"
                        text-anchor="end"
                        class="statistics-goal-label"
                    >Daily goal · ${getDailyGoalHours()}h</text>

                    <path
                        d="${areaPath}"
                        class="statistics-area"
                    />

                    <path
                        d="${linePath}"
                        class="statistics-line"
                    />

                    ${pointsHTML}
                    ${labels}
                </svg>
            </div>
        `;
    }

    function createSubjectProgressChartHTML() {
        const subjects = [
            "Advanced Accounting",
            "Corporate and Other Laws",
            "Taxation",
            "Cost and Management Accounting",
            "Auditing and Ethics",
            "Financial Management and Strategic Management"
        ];

        const rows = subjects.map((subject) => ({
            name: subject,
            progress: getSubjectChapterProgress(subject)
        }));

        return `
            <div class="subject-progress-list">
                ${rows
                    .map(
                        (row) => `
                            <div class="subject-progress-row">
                                <div class="subject-progress-heading">
                                    <span>${escapeHTML(row.name)}</span>
                                    <strong>${row.progress}%</strong>
                                </div>
                                <div class="subject-progress-track">
                                    <div
                                        class="subject-progress-fill"
                                        style="width: ${row.progress}%;"
                                    ></div>
                                </div>
                            </div>
                        `
                    )
                    .join("")}
            </div>
        `;
    }

    function renderStatistics() {
        const page = $("statistics");

        if (!page) {
            return;
        }

        const days = getLastNDays(14);
        const total14 = days.reduce(
            (sum, day) => sum + day.hours,
            0
        );
        const average14 = total14 / days.length;
        const bestDay = days.reduce(
            (best, day) =>
                day.hours > best.hours ? day : best,
            days[0]
        );

        page.innerHTML = `
            <div class="page-header">
                <div>
                    <p class="small-label">ANALYTICS</p>
                    <h1>Statistics</h1>
                    <p class="muted">
                        See your consistency, momentum and CA syllabus progress at a glance.
                    </p>
                </div>
            </div>

            <div class="tracker-overview statistics-summary-grid">
                <div class="tracker-summary-card statistics-summary-card accent-blue">
                    <span>Today</span>
                    <strong>${escapeHTML(formatHours(getStudyHoursForDate(getTodayKey())))}</strong>
                    <small>Study time</small>
                </div>

                <div class="tracker-summary-card statistics-summary-card accent-purple">
                    <span>14-Day Total</span>
                    <strong>${escapeHTML(formatHours(total14))}</strong>
                    <small>Recent study time</small>
                </div>

                <div class="tracker-summary-card statistics-summary-card accent-green">
                    <span>Daily Average</span>
                    <strong>${escapeHTML(formatHours(average14))}</strong>
                    <small>Across 14 days</small>
                </div>

                <div class="tracker-summary-card statistics-summary-card accent-orange">
                    <span>Best Day</span>
                    <strong>${escapeHTML(formatHours(bestDay.hours))}</strong>
                    <small>${escapeHTML(bestDay.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }))}</small>
                </div>
            </div>

            <div class="tracker-card statistics-hero-card">
                <div class="tracker-card-header statistics-section-header">
                    <div>
                        <p class="small-label">STUDY MOMENTUM</p>
                        <h2>14-day progression</h2>
                        <p class="muted">
                            Every point is calculated from your saved study sessions.
                        </p>
                    </div>
                    <div class="statistics-legend">
                        <span><i class="legend-dot study"></i>Study hours</span>
                        <span><i class="legend-line goal"></i>Daily goal</span>
                    </div>
                </div>

                ${createStudyProgressChartHTML(days)}
            </div>

            <div class="statistics-two-column">
                <div class="tracker-card">
                    <div class="tracker-card-header">
                        <div>
                            <p class="small-label">CA INTERMEDIATE</p>
                            <h2>Chapter progress</h2>
                        </div>
                    </div>
                    ${createSubjectProgressChartHTML()}
                </div>

                <div class="tracker-card statistics-insight-card">
                    <div class="insight-icon">📈</div>
                    <p class="small-label">YOUR MOMENTUM</p>
                    <h2>${getStudyStreak() > 0 ? `${getStudyStreak()} day streak` : "Start your streak today"}</h2>
                    <p class="muted">
                        ${getStudyStreak() > 0
                            ? "Keep the chain going. A little progress each day adds up."
                            : "Log a study session today to begin building your study streak."}
                    </p>
                    <div class="insight-metric">
                        <span>Weekly study</span>
                        <strong>${escapeHTML(formatHours(getWeeklyStudyHours()))}</strong>
                    </div>
                    <div class="insight-metric">
                        <span>Overall syllabus</span>
                        <strong>${getOverallChapterProgress()}%</strong>
                    </div>
                </div>
            </div>
        `;
    }

    /* ---------------------------------------------------------
       ACTIVITIES
       --------------------------------------------------------- */

    const ACTIVITY_TYPES = [
        { id: "movie", label: "Movies", icon: "🎬" },
        { id: "gaming", label: "Gaming", icon: "🎮" },
        { id: "exercise", label: "Exercise", icon: "🏃" },
        { id: "reading", label: "Reading", icon: "📚" },
        { id: "other", label: "Other", icon: "✨" }
    ];

    function getActivityType(typeId) {
        return (
            ACTIVITY_TYPES.find(
                (type) => type.id === typeId
            ) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]
        );
    }

    function formatActivityDuration(minutes) {
        const total = Math.max(0, Number(minutes) || 0);
        const hours = Math.floor(total / 60);
        const mins = total % 60;

        if (hours === 0) {
            return `${mins}m`;
        }

        if (mins === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${mins}m`;
    }

    function getActivitiesForDate(dateKey) {
        return activities.filter(
            (activity) => activity.date === dateKey
        );
    }

    function createActivitySummaryHTML() {
        const totalMinutes = activities.reduce(
            (sum, activity) =>
                sum + Number(activity.minutes || 0),
            0
        );

        return ACTIVITY_TYPES.slice(0, 4)
            .map((type) => {
                const typeActivities = activities.filter(
                    (activity) => activity.type === type.id
                );
                const minutes = typeActivities.reduce(
                    (sum, activity) =>
                        sum + Number(activity.minutes || 0),
                    0
                );

                return `
                    <div class="activity-summary-card activity-${type.id}">
                        <div class="activity-summary-icon">${type.icon}</div>
                        <div>
                            <span>${escapeHTML(type.label)}</span>
                            <strong>${typeActivities.length}</strong>
                            <small>${escapeHTML(formatActivityDuration(minutes))} logged</small>
                        </div>
                    </div>
                `;
            })
            .join("") + `
                <div class="activity-summary-card activity-total">
                    <div class="activity-summary-icon">⏱️</div>
                    <div>
                        <span>Total time</span>
                        <strong>${escapeHTML(formatActivityDuration(totalMinutes))}</strong>
                        <small>${activities.length} activities logged</small>
                    </div>
                </div>
            `;
    }

    function createActivityHistoryHTML() {
        const sorted = activities
            .slice()
            .sort((a, b) => {
                const dateCompare = String(b.date).localeCompare(String(a.date));
                if (dateCompare !== 0) {
                    return dateCompare;
                }
                return Number(b.createdAt || 0) - Number(a.createdAt || 0);
            })
            .slice(0, 30);

        if (!sorted.length) {
            return `
                <div class="activity-empty-state">
                    <div>🌱</div>
                    <h3>No activities logged yet</h3>
                    <p>Add a movie, gaming session, workout, reading session or anything else you enjoyed.</p>
                </div>
            `;
        }

        return `
            <div class="activity-history-list">
                ${sorted
                    .map((activity) => {
                        const type = getActivityType(activity.type);

                        return `
                            <div class="activity-history-item">
                                <div class="activity-history-icon activity-${type.id}">
                                    ${type.icon}
                                </div>

                                <div class="activity-history-main">
                                    <div class="activity-history-title-row">
                                        <strong>${escapeHTML(activity.title)}</strong>
                                        <span>${escapeHTML(formatActivityDuration(activity.minutes))}</span>
                                    </div>
                                    <div class="activity-history-meta">
                                        <span>${escapeHTML(type.label)}</span>
                                        <span>•</span>
                                        <span>${escapeHTML(formatShortDate(activity.date))}</span>
                                    </div>
                                    ${activity.note ? `<p>${escapeHTML(activity.note)}</p>` : ""}
                                </div>

                                <button
                                    type="button"
                                    class="activity-delete-button"
                                    data-delete-activity="${escapeHTML(activity.id)}"
                                    aria-label="Delete ${escapeHTML(activity.title)}"
                                    title="Delete activity"
                                >
                                    ×
                                </button>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    function renderActivities() {
        const page = $("activities");

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="page-header">
                <div>
                    <p class="small-label">LIFE OUTSIDE STUDY</p>
                    <h1>Activities</h1>
                    <p class="muted">
                        Track the things you do outside studying — without losing sight of your CA goal.
                    </p>
                </div>
            </div>

            <div class="activity-summary-grid">
                ${createActivitySummaryHTML()}
            </div>

            <div class="statistics-two-column activities-layout">
                <div class="tracker-card activity-form-card">
                    <div class="tracker-card-header">
                        <div>
                            <p class="small-label">LOG SOMETHING</p>
                            <h2>Add an activity</h2>
                        </div>
                    </div>

                    <form id="activity-form" class="activity-form">
                        <div class="form-grid-two">
                            <label>
                                <span>Date</span>
                                <input id="activity-date" type="date" value="${getTodayKey()}" required>
                            </label>

                            <label>
                                <span>Type</span>
                                <select id="activity-type" required>
                                    ${ACTIVITY_TYPES
                                        .map(
                                            (type) =>
                                                `<option value="${type.id}">${type.icon} ${escapeHTML(type.label)}</option>`
                                        )
                                        .join("")}
                                </select>
                            </label>
                        </div>

                        <label>
                            <span>What did you do?</span>
                            <input
                                id="activity-title"
                                type="text"
                                maxlength="80"
                                placeholder="e.g. Watched a movie with family"
                                required
                            >
                        </label>

                        <div class="form-grid-two">
                            <label>
                                <span>Duration (minutes)</span>
                                <input
                                    id="activity-duration"
                                    type="number"
                                    min="1"
                                    max="1440"
                                    step="1"
                                    placeholder="60"
                                    required
                                >
                            </label>

                            <label>
                                <span>Optional note</span>
                                <input
                                    id="activity-note"
                                    type="text"
                                    maxlength="140"
                                    placeholder="How was it?"
                                >
                            </label>
                        </div>

                        <div class="activity-form-footer">
                            <p class="muted">Saved only in this browser for now.</p>
                            <button type="submit" class="primary-action-button">
                                ＋ Add activity
                            </button>
                        </div>
                    </form>
                </div>

                <div class="tracker-card activity-today-card">
                    <div class="tracker-card-header">
                        <div>
                            <p class="small-label">TODAY</p>
                            <h2>Outside-study time</h2>
                        </div>
                        <div class="today-activity-total">
                            ${escapeHTML(
                                formatActivityDuration(
                                    getActivitiesForDate(getTodayKey()).reduce(
                                        (sum, activity) => sum + Number(activity.minutes || 0),
                                        0
                                    )
                                )
                            )}
                        </div>
                    </div>
                    <div class="activity-today-list">
                        ${
                            getActivitiesForDate(getTodayKey()).length
                                ? getActivitiesForDate(getTodayKey())
                                      .slice()
                                      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
                                      .slice(0, 6)
                                      .map((activity) => {
                                          const type = getActivityType(activity.type);
                                          return `
                                            <div class="mini-activity-row">
                                                <span class="mini-activity-icon">${type.icon}</span>
                                                <span>${escapeHTML(activity.title)}</span>
                                                <strong>${escapeHTML(formatActivityDuration(activity.minutes))}</strong>
                                            </div>
                                          `;
                                      })
                                      .join("")
                                : `<p class="muted activity-no-today">Nothing logged today yet.</p>`
                        }
                    </div>
                </div>
            </div>

            <div class="tracker-card">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">RECENT</p>
                        <h2>Activity history</h2>
                    </div>
                    <span class="activity-count-pill">${activities.length} total</span>
                </div>
                ${createActivityHistoryHTML()}
            </div>
        `;

        const form = $("activity-form");

        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();

                const date = $("activity-date").value || getTodayKey();
                const type = $("activity-type").value;
                const title = $("activity-title").value.trim();
                const minutes = Number($("activity-duration").value);
                const note = $("activity-note").value.trim();

                if (!title || !Number.isFinite(minutes) || minutes < 1) {
                    return;
                }

                activities.push({
                    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    date,
                    type,
                    title,
                    minutes: Math.min(1440, Math.round(minutes)),
                    note,
                    createdAt: Date.now()
                });

                saveState();
                renderActivities();
            });
        }

        page.querySelectorAll("[data-delete-activity]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.dataset.deleteActivity;
                activities = activities.filter(
                    (activity) => activity.id !== id
                );
                saveState();
                renderActivities();
            });
        });
    }

    /* ---------------------------------------------------------
       CALENDAR
       --------------------------------------------------------- */

    function changeCalendarMonth(delta) {
        calendarViewDate = new Date(
            calendarViewDate.getFullYear(),
            calendarViewDate.getMonth() + delta,
            1
        );

        renderCalendar();
    }

    function createCalendarHeatClass(hours) {
        if (hours <= 0) {
            return "level-0";
        }

        if (hours < 2) {
            return "level-1";
        }

        if (hours < 4) {
            return "level-2";
        }

        if (hours < getDailyGoalHours()) {
            return "level-3";
        }

        return "level-4";
    }

    function createMonthCalendarHTML(year, month, todayKey) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < firstDay; i += 1) {
            cells.push(`<div class="calendar-day empty"></div>`);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const key =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const hours = getStudyHoursForDate(key);
            const activityCount = getActivitiesForDate(key).length;
            const isToday = key === todayKey;
            const isSelected = key === selectedCalendarDate;

            cells.push(`
                <button
                    type="button"
                    class="calendar-day ${createCalendarHeatClass(hours)} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}"
                    data-calendar-date="${key}"
                    aria-label="${escapeHTML(formatDate(key))}, ${escapeHTML(formatHours(hours))} studied"
                >
                    <span class="calendar-day-number">${day}</span>
                    <span class="calendar-day-hours">${hours > 0 ? escapeHTML(formatHoursCompact(hours)) : "—"}</span>
                    ${activityCount ? `<span class="calendar-activity-dot" title="${activityCount} activity${activityCount === 1 ? "" : "ies"}"></span>` : ""}
                </button>
            `);
        }

        return `
            <div class="calendar-toolbar">
                <button type="button" class="calendar-nav-button" id="calendar-prev" aria-label="Previous month">‹</button>
                <div class="calendar-month-heading">
                    <span class="small-label">STUDY CALENDAR</span>
                    <h2>${escapeHTML(new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }))}</h2>
                </div>
                <button type="button" class="calendar-nav-button" id="calendar-next" aria-label="Next month">›</button>
            </div>

            <div class="calendar-legend">
                <span>Less</span>
                <i class="calendar-legend-box level-0"></i>
                <i class="calendar-legend-box level-1"></i>
                <i class="calendar-legend-box level-2"></i>
                <i class="calendar-legend-box level-3"></i>
                <i class="calendar-legend-box level-4"></i>
                <span>Goal met</span>
            </div>

            <div class="calendar-grid calendar-weekdays">
                ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                    .map((day) => `<strong>${day}</strong>`)
                    .join("")}
            </div>

            <div class="calendar-grid calendar-month-grid">
                ${cells.join("")}
            </div>
        `;
    }

    function renderCalendar() {
        const page = $("calendar");

        if (!page) {
            return;
        }

        const today = getTodayKey();
        const year = calendarViewDate.getFullYear();
        const month = calendarViewDate.getMonth();
        const selectedHours = getStudyHoursForDate(selectedCalendarDate);
        const selectedSessions = getSessionsForDate(selectedCalendarDate);
        const selectedActivities = getActivitiesForDate(selectedCalendarDate);

        page.innerHTML = `
            <div class="page-header">
                <div>
                    <p class="small-label">YOUR STUDY YEAR</p>
                    <h1>Calendar</h1>
                    <p class="muted">
                        A visual map of your study consistency — darker days mean more study.
                    </p>
                </div>
                <button type="button" class="calendar-today-button" id="calendar-today">
                    Today
                </button>
            </div>

            <div class="calendar-layout">
                <div class="tracker-card calendar-main-card">
                    ${createMonthCalendarHTML(year, month, today)}
                </div>

                <div class="calendar-side-column">
                    <div class="tracker-card calendar-day-detail">
                        <p class="small-label">SELECTED DAY</p>
                        <h2>${escapeHTML(formatDate(selectedCalendarDate))}</h2>

                        <div class="calendar-detail-hero">
                            <span>Study time</span>
                            <strong>${escapeHTML(formatHours(selectedHours))}</strong>
                        </div>

                        <div class="calendar-detail-stats">
                            <div>
                                <span>Sessions</span>
                                <strong>${selectedSessions.length}</strong>
                            </div>
                            <div>
                                <span>Activities</span>
                                <strong>${selectedActivities.length}</strong>
                            </div>
                        </div>

                        <div class="calendar-detail-list">
                            <p class="small-label">WHAT HAPPENED</p>
                            ${
                                selectedSessions.length
                                    ? selectedSessions
                                          .slice()
                                          .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
                                          .slice(0, 5)
                                          .map(
                                              (session) => `
                                                <div class="calendar-event-row">
                                                    <span class="calendar-event-icon">📚</span>
                                                    <div>
                                                        <strong>${escapeHTML(session.chapterName || session.subjectName || "Study session")}</strong>
                                                        <small>${escapeHTML(formatHours(session.hours || 0))}</small>
                                                    </div>
                                                </div>
                                            `
                                          )
                                          .join("")
                                    : `<p class="muted">No study session logged for this day.</p>`
                            }

                            ${
                                selectedActivities
                                    .slice()
                                    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
                                    .slice(0, 3)
                                    .map((activity) => {
                                        const type = getActivityType(activity.type);
                                        return `
                                            <div class="calendar-event-row">
                                                <span class="calendar-event-icon">${type.icon}</span>
                                                <div>
                                                    <strong>${escapeHTML(activity.title)}</strong>
                                                    <small>${escapeHTML(formatActivityDuration(activity.minutes))}</small>
                                                </div>
                                            </div>
                                        `;
                                    })
                                    .join("")
                            }
                        </div>
                    </div>

                    <div class="tracker-card calendar-month-summary">
                        <p class="small-label">THIS MONTH</p>
                        <div class="month-summary-number">
                            ${escapeHTML(formatHours(
                                Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => {
                                    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                                    return getStudyHoursForDate(dateKey);
                                }).reduce((sum, hours) => sum + hours, 0)
                            ))}
                        </div>
                        <span class="muted">total study time</span>
                    </div>
                </div>
            </div>
        `;

        const previous = $("calendar-prev");
        const next = $("calendar-next");
        const todayButton = $("calendar-today");

        if (previous) {
            previous.addEventListener("click", () => changeCalendarMonth(-1));
        }

        if (next) {
            next.addEventListener("click", () => changeCalendarMonth(1));
        }

        if (todayButton) {
            todayButton.addEventListener("click", () => {
                calendarViewDate = new Date();
                selectedCalendarDate = getTodayKey();
                renderCalendar();
            });
        }

        page.querySelectorAll("[data-calendar-date]").forEach((dayButton) => {
            dayButton.addEventListener("click", () => {
                selectedCalendarDate = dayButton.dataset.calendarDate;
                renderCalendar();
            });
        });
    }

    /* ---------------------------------------------------------
       COMPARE
       --------------------------------------------------------- */

    function renderCompare() {
        const page =
            $("compare");

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="page-header">

                <div>
                    <p class="small-label">
                        TWO FRIENDS
                    </p>

                    <h1>
                        Compare Us
                    </h1>

                    <p class="muted">
                        A shared comparison area for ashjii and pothujii.
                    </p>
                </div>

            </div>

            <div class="user-cards">

                <div class="user-card ashjii-card">

                    <div class="user-card-header">

                       <div class="avatar">
    <img
        src="assets/ashjii-profile.jpg"
        alt="ashjii profile photo"
    >
</div>

                        <div>
                            <p class="small-label">
                                YOUR JOURNEY
                            </p>

                            <h2>
                                ashjii
                            </h2>
                        </div>

                    </div>

                    <div class="stats-grid">

                        <div class="stat">

                            <span>
                                Today
                            </span>

                            <strong>
                                ${escapeHTML(
                                    formatHours(
                                        getStudyHoursForDate(
                                            getTodayKey()
                                        )
                                    )
                                )}
                            </strong>

                        </div>

                        <div class="stat">

                            <span>
                                Chapters
                            </span>

                           <strong id="dashboard-ash-chapters">
                                ${getCompletedChapterCount()}
                           </strong>

                        </div>

                        <div class="stat">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${getOverallChapterProgress()}%
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="user-card pothujii-card">

                    <div class="user-card-header">

                       <div class="avatar">
    <img
        src="assets/pothujii-profile.jpg"
        alt="pothujii profile photo"
    >
</div>

                        <div>

                            <p class="small-label">
                                FRIEND'S JOURNEY
                            </p>

                            <h2>
                                pothujii
                            </h2>

                        </div>

                    </div>

                    <div class="stats-grid">

                        <div class="stat">

                            <span>
                                Today
                            </span>

                            <strong>
                                0h 00m
                            </strong>

                        </div>

                        <div class="stat">

                            <span>
                                Chapters
                            </span>

                           <strong id="dashboard-pothu-chapters">
                               0
                           </strong>

                        </div>

                        <div class="stat">

                            <span>
                                Progress
                            </span>

                            <strong>
                                0%
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <div class="tracker-card">

                <h2>
                    Shared progress
                </h2>

                <p class="muted">
                    Firebase sharing will be added in a later project stage.
                </p>

            </div>
        `;
    }


    /* ---------------------------------------------------------
       MOTIVATION
       --------------------------------------------------------- */

    function renderMotivation() {
        const page =
            $("motivation");

        if (!page) {
            return;
        }

        const quotes = [
            "Small steps every day become big results.",
            "One chapter at a time.",
            "Consistency beats occasional intensity.",
            "Your future CA is built by today's study session.",
            "Progress does not need to be perfect."
        ];

        const quote =
            quotes[
                new Date().getDate() %
                    quotes.length
            ];

        page.innerHTML = `
            <div class="page-header">

                <div>

                    <p class="small-label">
                        KEEP GOING
                    </p>

                    <h1>
                        Motivation
                    </h1>

                    <p class="muted">
                        A little reminder for your CA journey.
                    </p>

                </div>

            </div>


            <div class="dashboard-card motivation-card">

                <p class="small-label">
                    TODAY'S REMINDER
                </p>

                <h2>
                    ${escapeHTML(
                        quote
                    )}
                </h2>

                <p>
                    Study • Progress • Grow Together 📚❤️
                </p>

            </div>
        `;
    }


    /* ---------------------------------------------------------
       GOALS
       --------------------------------------------------------- */

    function renderGoals() {
        const page =
            $("goals");

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="page-header">

                <div>

                    <p class="small-label">
                        OUR TARGETS
                    </p>

                    <h1>
                        Goals
                    </h1>

                    <p class="muted">
                        Your CA journey milestones.
                    </p>

                </div>

            </div>


            <div class="tracker-card">

                <div class="goal">
                    ☐ Complete CA Intermediate
                </div>

                <div class="goal">
                    ☐ Complete the syllabus
                </div>

                <div class="goal">
                    ☐ Complete revision
                </div>

                <div class="goal">
                    ☐ Write the exams
                </div>

            </div>
        `;
    }


    /* ---------------------------------------------------------
       NOTES
       --------------------------------------------------------- */

    function renderNotes() {
        const page =
            $("notes");

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="page-header">

                <div>

                    <p class="small-label">
                        PERSONAL
                    </p>

                    <h1>
                        Notes
                    </h1>

                    <p class="muted">
                        A simple local note area.
                    </p>

                </div>

            </div>


            <div class="tracker-card">

                <textarea
                    id="personal-notes"
                    rows="14"
                    placeholder="Write your notes here..."
                ></textarea>


                <div class="quick-actions">

                    <button
                        id="save-personal-notes"
                    >
                        💾 Save Notes
                    </button>

                </div>

            </div>
        `;

        const textarea =
            $("personal-notes");

        if (textarea) {
            textarea.value =
                localStorage.getItem(
                    "daydreamers_personal_notes_v1"
                ) || "";
        }

        const save =
            $("save-personal-notes");

        if (save) {
            save.addEventListener(
                "click",
                () => {

                    localStorage.setItem(
                        "daydreamers_personal_notes_v1",
                        textarea.value
                    );

                    alert(
                        "Notes saved."
                    );

                }
            );
        }
    }


    /* ---------------------------------------------------------
       SETTINGS
       --------------------------------------------------------- */

    function renderSettings() {
        const page =
            $("settings");

        if (!page) {
            return;
        }

        page.innerHTML = `
            <div class="page-header">

                <div>

                    <p class="small-label">
                        DAYDREAMERS
                    </p>

                    <h1>
                        Settings
                    </h1>

                    <p class="muted">
                        Local website settings and data.
                    </p>

                </div>

            </div>


            <div class="tracker-card">

                <h2>
                    Study Goal
                </h2>

                <p class="muted">
                    Current daily study goal:
                    ${getDailyGoalHours()} hours.
                </p>

            </div>


            <div class="tracker-card">

                <h2>
                    Local Data
                </h2>

                <p class="muted">
                    Your current study data is stored in this browser.
                </p>


                <div class="quick-actions">

                    <button
                        id="export-data-button"
                    >
                        📦 Export Data
                    </button>


                    <button
                        id="clear-data-button"
                    >
                        ⚠️ Clear Local Data
                    </button>

                </div>

            </div>
        `;

        const exportButton =
            $("export-data-button");

        const clearButton =
            $("clear-data-button");

        if (exportButton) {
            exportButton.addEventListener(
                "click",
                exportData
            );
        }

        if (clearButton) {
            clearButton.addEventListener(
                "click",
                clearAllData
            );
        }
    }


    function exportData() {

        const data = {
            exportedAt:
                new Date().toISOString(),

            studySessions,

            chapterProgress,

            dailyLogs,

            activities,

            goals: getGoals(),

            settings: {
                theme: getThemePreference(),
                readable: getReadablePreference(),
                dailyGoalHours: getDailyGoalHours()
            },

            profilePhotos: {
                ashjii: localStorage.getItem(POLISH_KEYS.ashPhoto) || null,
                pothujii: localStorage.getItem(POLISH_KEYS.pothuPhoto) || null
            },

            personalNotes:
                localStorage.getItem(
                    "daydreamers_personal_notes_v1"
                ) || ""
        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "daydreamers-backup.json";

        link.click();

        URL.revokeObjectURL(
            url
        );
    }


    function clearAllData() {

        const confirmed =
            confirm(
                "This will delete your local DAYDREAMERS study data from this browser. Continue?"
            );

        if (!confirmed) {
            return;
        }


        studySessions = [];

        chapterProgress = {};

        dailyLogs = {};
        activities = [];


        localStorage.removeItem(
            "daydreamers_personal_notes_v1"
        );

        localStorage.removeItem(
            POLISH_KEYS.goals
        );

        localStorage.removeItem(
            POLISH_KEYS.ashPhoto
        );

        localStorage.removeItem(
            POLISH_KEYS.pothuPhoto
        );

        localStorage.removeItem(POLISH_KEYS.theme);
        localStorage.removeItem(POLISH_KEYS.readable);
        localStorage.removeItem(POLISH_KEYS.dailyGoal);

        document.documentElement.removeAttribute("data-theme");
        document.documentElement.removeAttribute("data-readable");


        saveState();

        applyThemePreference("system");
        applyReadablePreference("normal");
        updateAllDisplays();

        showPage(
            "dashboard"
        );

        renderProfilePhotos();
    }


    /* ---------------------------------------------------------
       GLOBAL DISPLAY UPDATE
       --------------------------------------------------------- */

    function updateAllDisplays() {

        renderDashboard();

        renderStudyTracker();
    }


    function getVisiblePageId() {

        const visible =
            Array.from(
                document.querySelectorAll(
                    ".page-section"
                )
            ).find(
                (page) =>
                    page.style.display !==
                        "none" &&
                    getComputedStyle(
                        page
                    ).display !==
                        "none"
            );


        return visible
            ? visible.id
            : null;
    }


    /* ---------------------------------------------------------
       QUICK CHAPTER BUTTON
       --------------------------------------------------------- */

    function setupQuickChapterButton() {

        const button =
            $("quick-add-chapter");

        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            () => {
                showPage(
                    "chapters"
                );
            }
        );
    }


    /* ---------------------------------------------------------
       INITIALIZATION
       --------------------------------------------------------- */

    /* ---------------------------------------------------------
       ENSURE REQUIRED PAGE CONTAINERS
       --------------------------------------------------------- */

    function ensureRequiredPageSections() {
        const requiredPages = [
            ["dashboard", "Dashboard"],
            ["study-tracker", "Study Tracker"],
            ["chapters", "Chapters"],
            ["daily-log", "Daily Log"],
            ["statistics", "Statistics"],
            ["activities", "Activities"],
            ["calendar", "Calendar"],
            ["compare", "Compare Us"],
            ["motivation", "Motivation"],
            ["goals", "Goals"],
            ["notes", "Notes"],
            ["settings", "Settings"]
        ];

        const existingMain = document.querySelector("main") || document.body;

        requiredPages.forEach(([id, title]) => {
            if (document.getElementById(id)) return;

            const section = document.createElement("section");
            section.id = id;
            section.className = "page-section";
            section.style.display = id === "dashboard" ? "block" : "none";
            section.innerHTML = `
                <div class="page-header">
                    <div>
                        <p class="small-label">DAYDREAMERS</p>
                        <h1>${title}</h1>
                        <p class="muted">Loading ${title.toLowerCase()}...</p>
                    </div>
                </div>
            `;
            existingMain.appendChild(section);
        });
    }

    function initializeDaydreamers() {

        setupThemeSystem();

        updateDateAndGreeting();

        setupNavigation();

        setupStudyModal();

        setupChapterFilters();

        setupQuickChapterButton();

        renderDashboard();

        renderProfilePhotos();

        renderStudyTracker();

        renderChapters();

        showPage(
            "dashboard"
        );
    }



    /* =========================================================
       DAYDREAMERS — POLISH PACK
       Goals + Notes + Settings + Theme + Profile Photos
       ========================================================= */

    const POLISH_KEYS = {
        theme: "daydreamers_theme_v1",
        readable: "daydreamers_readable_text_v1",
        dailyGoal: "daydreamers_daily_goal_hours_v1",
        goals: "daydreamers_goals_v1",
        ashPhoto: "daydreamers_profile_ashjii_v1",
        pothuPhoto: "daydreamers_profile_pothujii_v1"
    };

    function getDailyGoalHours() {
        const raw = Number(localStorage.getItem(POLISH_KEYS.dailyGoal));
        if (Number.isFinite(raw) && raw >= 0.5 && raw <= 24) {
            return Math.round(raw * 4) / 4;
        }
        return DEFAULT_DAILY_GOAL_HOURS;
    }

    function saveDailyGoalHours(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric < 0.5 || numeric > 24) {
            return false;
        }
        const rounded = Math.round(numeric * 4) / 4;
        localStorage.setItem(POLISH_KEYS.dailyGoal, String(rounded));
        return true;
    }

    function getStoredJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function saveStoredJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getThemePreference() {
        return localStorage.getItem(POLISH_KEYS.theme) || "system";
    }

    function applyThemePreference(preference) {
        const value =
            preference === "light" || preference === "dark"
                ? preference
                : "system";

        if (value === "system") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", value);
        }

        localStorage.setItem(POLISH_KEYS.theme, value);
        updateThemeButton(value);
    }

    function getResolvedTheme() {
        const preference = getThemePreference();
        if (preference !== "system") {
            return preference;
        }
        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function updateThemeButton(preference) {
        const button = $("daydreamers-theme-toggle");
        if (!button) {
            return;
        }

        const resolved = getResolvedTheme();
        button.textContent =
            resolved === "dark" ? "☀️" : "🌙";
        button.title =
            preference === "system"
                ? `System mode • currently ${resolved}`
                : `${resolved === "dark" ? "Light" : "Dark"} mode`;
        button.setAttribute(
            "aria-label",
            button.title
        );
    }

    function setupThemeSystem() {
        applyThemePreference(getThemePreference());

        if (window.matchMedia) {
            const media = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

            const handleSystemChange = () => {
                if (getThemePreference() === "system") {
                    updateThemeButton("system");
                }
            };

            if (media.addEventListener) {
                media.addEventListener(
                    "change",
                    handleSystemChange
                );
            } else if (media.addListener) {
                media.addListener(handleSystemChange);
            }
        }

        let button = $("daydreamers-theme-toggle");
        if (!button) {
            const topBar = document.querySelector(".top-bar");
            if (topBar) {
                button = document.createElement("button");
                button.id = "daydreamers-theme-toggle";
                button.className = "theme-toggle-button";
                button.type = "button";
                topBar.appendChild(button);

                button.addEventListener("click", () => {
                    const current = getResolvedTheme();
                    const next =
                        current === "dark" ? "light" : "dark";
                    applyThemePreference(next);
                    const select = $("theme-preference");
                    if (select) {
                        select.value = next;
                    }
                });
            }
        }

        updateThemeButton(getThemePreference());
    }

    function getDefaultGoals() {
        return [
            {
                id: "ca-intermediate",
                title: "Complete CA Intermediate",
                note: "Keep the main goal visible.",
                done: false,
                createdAt: Date.now()
            },
            {
                id: "syllabus",
                title: "Complete the syllabus",
                note: "Finish every chapter with confidence.",
                done: false,
                createdAt: Date.now() + 1
            },
            {
                id: "revision",
                title: "Complete revision",
                note: "Build strong revision cycles.",
                done: false,
                createdAt: Date.now() + 2
            },
            {
                id: "exams",
                title: "Write the exams",
                note: "Walk into the exam hall prepared.",
                done: false,
                createdAt: Date.now() + 3
            }
        ];
    }

    function getGoals() {
        const goals = getStoredJSON(POLISH_KEYS.goals, null);
        return Array.isArray(goals) && goals.length
            ? goals
            : getDefaultGoals();
    }

    function renderGoals() {
        const page = $("goals");
        if (!page) {
            return;
        }

        const goals = getGoals();
        const completed = goals.filter((goal) => goal.done).length;
        const percent = goals.length
            ? Math.round((completed / goals.length) * 100)
            : 0;

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">OUR TARGETS</p>
                    <h1>Goals</h1>
                    <p class="muted">Small milestones. One CA dream. Keep moving together. 🎯</p>
                </div>
                <div class="page-header-badge">${percent}% complete</div>
            </div>

            <div class="goal-hero-card">
                <div>
                    <p class="small-label">YOUR PROGRESS</p>
                    <h2>${completed} of ${goals.length} goals completed</h2>
                    <p class="muted">Every checked goal is one more step forward.</p>
                </div>
                <div class="goal-ring" style="--goal-progress:${percent}%">
                    <strong>${percent}%</strong>
                </div>
            </div>

            <div class="tracker-card goals-panel">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">MILESTONES</p>
                        <h2>Our CA Journey</h2>
                    </div>
                </div>

                <div class="goals-list">
                    ${goals.map((goal) => `
                        <label class="goal-item ${goal.done ? "completed" : ""}">
                            <input
                                type="checkbox"
                                class="goal-checkbox"
                                data-goal-id="${escapeHTML(goal.id)}"
                                ${goal.done ? "checked" : ""}
                            >
                            <span class="goal-checkmark">✓</span>
                            <span class="goal-copy">
                                <strong>${escapeHTML(goal.title)}</strong>
                                <small>${escapeHTML(goal.note || "Keep going.")}</small>
                            </span>
                            <button type="button" class="goal-delete" data-goal-delete="${escapeHTML(goal.id)}" aria-label="Delete goal">×</button>
                        </label>
                    `).join("")}
                </div>

                <form id="add-goal-form" class="add-goal-form">
                    <input id="new-goal-title" type="text" maxlength="80" placeholder="Add a new goal…" autocomplete="off">
                    <button type="submit">＋ Add Goal</button>
                </form>
            </div>
        `;

        page.querySelectorAll(".goal-checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const id = checkbox.dataset.goalId;
                const updated = getGoals().map((goal) =>
                    goal.id === id
                        ? { ...goal, done: checkbox.checked }
                        : goal
                );
                saveStoredJSON(POLISH_KEYS.goals, updated);
                renderGoals();
            });
        });

        page.querySelectorAll(".goal-delete").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.dataset.goalDelete;
                const updated = getGoals().filter((goal) => goal.id !== id);
                saveStoredJSON(POLISH_KEYS.goals, updated);
                renderGoals();
            });
        });

        const form = $("add-goal-form");
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const input = $("new-goal-title");
                const title = input ? input.value.trim() : "";
                if (!title) {
                    return;
                }
                const updated = [
                    ...getGoals(),
                    {
                        id: `goal-${Date.now()}`,
                        title,
                        note: "A new step in the journey.",
                        done: false,
                        createdAt: Date.now()
                    }
                ];
                saveStoredJSON(POLISH_KEYS.goals, updated);
                renderGoals();
            });
        }
    }

    function renderNotes() {
        const page = $("notes");
        if (!page) {
            return;
        }

        const saved =
            localStorage.getItem("daydreamers_personal_notes_v1") || "";

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">PERSONAL SPACE</p>
                    <h1>Notes</h1>
                    <p class="muted">Ideas, reminders, revision points — keep everything in one calm place. 📝</p>
                </div>
                <div class="notes-status" id="notes-save-status">Saved locally</div>
            </div>

            <div class="notes-layout">
                <div class="tracker-card notes-editor-card">
                    <div class="notes-toolbar">
                        <div>
                            <p class="small-label">MY NOTEBOOK</p>
                            <h2>Write freely</h2>
                        </div>
                        <span class="notes-counter" id="notes-counter">${saved.length} characters</span>
                    </div>
                    <textarea id="personal-notes" class="notes-editor" maxlength="20000" placeholder="Write your thoughts, study plans, reminders or quick revision points here…">${escapeHTML(saved)}</textarea>
                    <div class="notes-actions">
                        <button type="button" id="save-personal-notes">💾 Save Notes</button>
                        <button type="button" class="secondary-button" id="clear-personal-notes">Clear</button>
                    </div>
                </div>

                <div class="notes-side-card">
                    <div class="notes-icon">💡</div>
                    <h3>Use this space your way</h3>
                    <p>Keep formulas, doubts, tomorrow's priorities, motivation, or anything you don't want to lose.</p>
                    <div class="note-tip">Your note stays on this browser until you clear it or remove the site's local data.</div>
                </div>
            </div>
        `;

        const textarea = $("personal-notes");
        const counter = $("notes-counter");
        const status = $("notes-save-status");

        const updateCounter = () => {
            if (counter && textarea) {
                counter.textContent = `${textarea.value.length} characters`;
            }
        };

        let timer = null;
        if (textarea) {
            textarea.addEventListener("input", () => {
                updateCounter();
                if (status) {
                    status.textContent = "Saving…";
                }
                clearTimeout(timer);
                timer = setTimeout(() => {
                    localStorage.setItem(
                        "daydreamers_personal_notes_v1",
                        textarea.value
                    );
                    if (status) {
                        status.textContent = "Saved locally";
                    }
                }, 500);
            });
        }

        const save = $("save-personal-notes");
        if (save) {
            save.addEventListener("click", () => {
                localStorage.setItem(
                    "daydreamers_personal_notes_v1",
                    textarea ? textarea.value : ""
                );
                if (status) {
                    status.textContent = "Saved just now ✓";
                }
            });
        }

        const clear = $("clear-personal-notes");
        if (clear) {
            clear.addEventListener("click", () => {
                if (!textarea) return;
                textarea.value = "";
                localStorage.removeItem("daydreamers_personal_notes_v1");
                updateCounter();
                if (status) status.textContent = "Note cleared";
            });
        }
    }

    function renderProfilePhotos() {
        const profiles = [
            {
                selector: ".ashjii-card .avatar",
                name: "ashjii",
                key: POLISH_KEYS.ashPhoto,
                initials: "A",
                variant: "ashjii-photo"
            },
            {
                selector: ".pothujii-card .avatar",
                name: "pothujii",
                key: POLISH_KEYS.pothuPhoto,
                initials: "P",
                variant: "pothujii-photo"
            }
        ];

        profiles.forEach((profile) => {
            const element = document.querySelector(profile.selector);
            if (!element) return;

            const storedPhoto = localStorage.getItem(profile.key);
            const defaultPhoto = profile.name === "ashjii"
                ? "assets/ashjii-profile.jpg"
                : "assets/pothujii-profile.jpg";
            const photo = storedPhoto || defaultPhoto;
            element.classList.add("profile-avatar");
            element.innerHTML = `<img src="${escapeHTML(photo)}" alt="${escapeHTML(profile.name)} profile photo">`;
            element.dataset.profileName = profile.name;
            element.classList.add(profile.variant);
        });
    }

    function attachProfileUpload(inputId, storageKey, statusId) {
        const input = $(inputId);
        const status = $(statusId);
        if (!input) return;

        input.addEventListener("change", () => {
            const file = input.files && input.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                if (status) status.textContent = "Please choose an image file.";
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const result = String(reader.result || "");
                localStorage.setItem(storageKey, result);
                renderProfilePhotos();
                if (status) status.textContent = "Profile photo updated ✓";
            };
            reader.readAsDataURL(file);
        });
    }

    function removeProfilePhoto(storageKey, statusId) {
        localStorage.removeItem(storageKey);
        renderProfilePhotos();
        const status = $(statusId);
        if (status) status.textContent = "Profile photo removed";
    }

    function renderSettings() {
        const page = $("settings");
        if (!page) {
            return;
        }

        const theme = getThemePreference();
        const ashPhoto = Boolean(localStorage.getItem(POLISH_KEYS.ashPhoto));
        const pothuPhoto = Boolean(localStorage.getItem(POLISH_KEYS.pothuPhoto));

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">PERSONALIZE DAYDREAMERS</p>
                    <h1>Settings</h1>
                    <p class="muted">Make your shared study space feel like yours. ⚙️</p>
                </div>
            </div>

            <div class="settings-grid">
                <div class="tracker-card settings-card">
                    <div class="settings-card-icon">🌗</div>
                    <p class="small-label">APPEARANCE</p>
                    <h2>Theme</h2>
                    <p class="muted">System mode automatically follows your Windows/browser light or dark preference.</p>
                    <label class="settings-field">
                        <span>Theme preference</span>
                        <select id="theme-preference">
                            <option value="system" ${theme === "system" ? "selected" : ""}>System default</option>
                            <option value="light" ${theme === "light" ? "selected" : ""}>Light</option>
                            <option value="dark" ${theme === "dark" ? "selected" : ""}>Dark</option>
                        </select>
                    </label>
                </div>

                <div class="tracker-card settings-card">
                    <div class="settings-card-icon">⏱️</div>
                    <p class="small-label">STUDY TARGET</p>
                    <h2>Daily Goal</h2>
                    <p class="muted">Your current DAYDREAMERS study target is <strong>${getDailyGoalHours()} hours</strong> per day.</p>
                    <div class="settings-mini-progress"><span style="width:${Math.min(100, Math.round((getStudyHoursForDate(getTodayKey()) / getDailyGoalHours()) * 100))}%"></span></div>
                    <small>${formatHours(getStudyHoursForDate(getTodayKey()))} studied today</small>
                </div>
            </div>

            <div class="tracker-card profile-settings-card">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">OUR PROFILES</p>
                        <h2>Profile Photos</h2>
                    </div>
                    <span class="settings-badge">Stored locally</span>
                </div>
                <p class="muted">Add your own photos here. They stay in this browser and are not uploaded anywhere.</p>

                <div class="profile-upload-grid">
                    <div class="profile-upload-card ashjii-upload">
                        <div class="upload-avatar-preview"><img src="${escapeHTML(localStorage.getItem(POLISH_KEYS.ashPhoto) || "assets/ashjii-profile.jpg")}" alt="ashjii profile preview"></div>
                        <div>
                            <strong>ashjii</strong>
                            <small id="ash-photo-status">${ashPhoto ? "Custom photo selected" : "Using default profile photo"}</small>
                            <label class="upload-button">
                                Choose photo
                                <input id="ash-photo-input" type="file" accept="image/*">
                            </label>
                            ${ashPhoto ? `<button type="button" class="text-button" id="remove-ash-photo">Remove photo</button>` : ""}
                        </div>
                    </div>

                    <div class="profile-upload-card pothujii-upload">
                        <div class="upload-avatar-preview"><img src="${escapeHTML(localStorage.getItem(POLISH_KEYS.pothuPhoto) || "assets/pothujii-profile.jpg")}" alt="pothujii profile preview"></div>
                        <div>
                            <strong>pothujii</strong>
                            <small id="pothu-photo-status">${pothuPhoto ? "Custom photo selected" : "Using default profile photo"}</small>
                            <label class="upload-button">
                                Choose photo
                                <input id="pothu-photo-input" type="file" accept="image/*">
                            </label>
                            ${pothuPhoto ? `<button type="button" class="text-button" id="remove-pothu-photo">Remove photo</button>` : ""}
                        </div>
                    </div>
                </div>
            </div>

            <div class="tracker-card settings-card data-settings-card">
                <div class="settings-card-icon">💾</div>
                <p class="small-label">YOUR DATA</p>
                <h2>Backup & Reset</h2>
                <p class="muted">Export your local study data before moving browsers or clearing it.</p>
                <div class="quick-actions">
                    <button id="export-data-button">📦 Export Data</button>
                    <button id="clear-data-button" class="danger-button">⚠️ Clear Local Data</button>
                </div>
            </div>
        `;

        const themeSelect = $("theme-preference");
        if (themeSelect) {
            themeSelect.addEventListener("change", () => {
                applyThemePreference(themeSelect.value);
            });
        }

        attachProfileUpload(
            "ash-photo-input",
            POLISH_KEYS.ashPhoto,
            "ash-photo-status"
        );
        attachProfileUpload(
            "pothu-photo-input",
            POLISH_KEYS.pothuPhoto,
            "pothu-photo-status"
        );

        const removeAsh = $("remove-ash-photo");
        if (removeAsh) {
            removeAsh.addEventListener("click", () => {
                removeProfilePhoto(POLISH_KEYS.ashPhoto, "ash-photo-status");
                renderSettings();
            });
        }

        const removePothu = $("remove-pothu-photo");
        if (removePothu) {
            removePothu.addEventListener("click", () => {
                removeProfilePhoto(POLISH_KEYS.pothuPhoto, "pothu-photo-status");
                renderSettings();
            });
        }

        const exportButton = $("export-data-button");
        if (exportButton) {
            exportButton.addEventListener("click", exportData);
        }

        const clearButton = $("clear-data-button");
        if (clearButton) {
            clearButton.addEventListener("click", clearAllData);
        }
    }


    /* =========================================================
       DAYDREAMERS — FINAL UX UPGRADE
       Statistics + Daily Log + Settings + Edit/Delete
       ========================================================= */

    let statisticsRange = 14;
    let editingActivityId = null;

    function getReadablePreference() {
        return localStorage.getItem(POLISH_KEYS.readable) || "normal";
    }

    function applyReadablePreference(value) {
        const next = value === "large" ? "large" : "normal";
        if (next === "large") {
            document.documentElement.setAttribute("data-readable", "large");
        } else {
            document.documentElement.removeAttribute("data-readable");
        }
        localStorage.setItem(POLISH_KEYS.readable, next);
    }

    function createFinalStatisticsHTML(days) {
        const total = days.reduce((sum, day) => sum + day.hours, 0);
        const activeDays = days.filter((day) => day.hours > 0).length;
        const goalDays = days.filter((day) => day.hours >= getDailyGoalHours()).length;
        const average = days.length ? total / days.length : 0;
        const best = days.reduce((a, b) => (b.hours > a.hours ? b : a), days[0] || { hours: 0, date: new Date() });

        return `
            <div class="statistics-final-summary">
                <div class="statistics-big-card blue"><span>📚 Total study</span><strong>${escapeHTML(formatHours(total))}</strong><small>Last ${days.length} days</small></div>
                <div class="statistics-big-card purple"><span>📅 Active days</span><strong>${activeDays}</strong><small>Days with study</small></div>
                <div class="statistics-big-card green"><span>🎯 Goal days</span><strong>${goalDays}</strong><small>${getDailyGoalHours()}h or more</small></div>
                <div class="statistics-big-card orange"><span>🏆 Best day</span><strong>${escapeHTML(formatHours(best.hours))}</strong><small>${escapeHTML(best.date.toLocaleDateString("en-IN", {day:"numeric", month:"short"}))}</small></div>
            </div>
            <div class="statistics-progress-strip">
                <div><span>Average per day</span><strong>${escapeHTML(formatHours(average))}</strong></div>
                <div><span>Current streak</span><strong>${getStudyStreak()} days 🔥</strong></div>
                <div><span>Syllabus progress</span><strong>${getOverallChapterProgress()}%</strong></div>
            </div>
        `;
    }

    function renderStatistics() {
        const page = $("statistics");
        if (!page) return;

        const days = getLastNDays(statisticsRange);
        const total = days.reduce((sum, day) => sum + day.hours, 0);
        const average = days.length ? total / days.length : 0;

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">YOUR PROGRESS</p>
                    <h1>Statistics</h1>
                    <p class="muted">A clear picture of how consistently you are moving toward your CA goal. 📈</p>
                </div>
                <div class="statistics-range-switch" role="group" aria-label="Statistics period">
                    ${[7,14,30].map((n) => `<button type="button" class="range-button ${statisticsRange === n ? "active" : ""}" data-stat-range="${n}">${n} days</button>`).join("")}
                </div>
            </div>

            ${createFinalStatisticsHTML(days)}

            <div class="tracker-card statistics-chart-card-final">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">STUDY MOMENTUM</p>
                        <h2>${statisticsRange}-day study progression</h2>
                        <p class="muted">Blue line = actual study. Dashed line = ${getDailyGoalHours()}-hour daily target.</p>
                    </div>
                    <div class="statistics-current-average">Avg <strong>${escapeHTML(formatHours(average))}</strong></div>
                </div>
                ${createStudyProgressChartHTML(days)}
            </div>

            <div class="statistics-two-column">
                <div class="tracker-card">
                    <div class="tracker-card-header">
                        <div><p class="small-label">CA INTERMEDIATE</p><h2>Syllabus progress</h2></div>
                    </div>
                    ${createSubjectProgressChartHTML()}
                </div>
                <div class="tracker-card statistics-insight-card-final">
                    <div class="insight-icon">🚀</div>
                    <p class="small-label">KEEP GOING</p>
                    <h2>${getStudyStreak() ? `${getStudyStreak()} day streak` : "Your first streak starts today"}</h2>
                    <p class="muted">${getStudyStreak() ? "Consistency is building. Keep today's session simple and focused." : "Add a study session today and DAYDREAMERS will start tracking your streak."}</p>
                    <div class="final-insight-row"><span>Today</span><strong>${escapeHTML(formatHours(getStudyHoursForDate(getTodayKey())))}</strong></div>
                    <div class="final-insight-row"><span>This week</span><strong>${escapeHTML(formatHours(getWeeklyStudyHours()))}</strong></div>
                    <div class="final-insight-row"><span>Overall chapters</span><strong>${getOverallChapterProgress()}%</strong></div>
                </div>
            </div>
        `;

        page.querySelectorAll("[data-stat-range]").forEach((button) => {
            button.addEventListener("click", () => {
                statisticsRange = Number(button.dataset.statRange) || 14;
                renderStatistics();
            });
        });
    }

    function renderDailyLog() {
        const page = $("daily-log");
        if (!page) return;

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">DAILY JOURNAL</p>
                    <h1>Daily Log</h1>
                    <p class="muted">Write it down. Look back. See how far you've come. ✨</p>
                </div>
                <div class="page-header-badge">${Object.keys(dailyLogs).filter(k => String(dailyLogs[k] || "").trim()).length} saved</div>
            </div>

            <div class="daily-log-stats" id="daily-log-stats"></div>

            <div class="daily-log-app daily-log-enhanced-grid">
                <div class="tracker-card daily-log-editor-card">
                    <div class="daily-log-editor-top">
                        <div><p class="small-label">ENTRY DATE</p><h2 id="daily-log-date-heading"></h2></div>
                        <label class="daily-log-date-picker"><span>Choose date</span><input type="date" id="daily-log-date"></label>
                    </div>
                    <div class="daily-log-prompt"><span>💭</span><div><strong>How did your day go?</strong><p>Record wins, study progress, doubts, distractions and tomorrow's plan.</p></div></div>
                    <textarea id="daily-log-text" class="daily-log-editor" rows="14" maxlength="12000" placeholder="Today I studied…\n\nWhat I completed…\n\nWhat I found difficult…\n\nTomorrow I want to…"></textarea>
                    <div class="daily-log-editor-footer"><span id="daily-log-counter" class="notes-counter">0 characters</span><div class="quick-actions"><button id="daily-log-save-button">💾 Save / Update</button><button id="daily-log-clear-button" class="secondary-button">🗑️ Delete Entry</button></div></div>
                    <p class="daily-log-save-status" id="daily-log-save-status"></p>
                </div>
                <div class="tracker-card daily-log-timeline-card">
                    <div class="tracker-card-header"><div><p class="small-label">JOURNAL HISTORY</p><h2>Your recent entries</h2></div><span class="settings-badge">Edit anytime</span></div>
                    <div id="daily-log-history" class="daily-log-timeline"></div>
                </div>
            </div>
        `;

        $("daily-log-date").value = selectedDailyLogDate;
        $("daily-log-date").addEventListener("change", () => {
            selectedDailyLogDate = $("daily-log-date").value || getTodayKey();
            updateDailyLogContent();
        });
        $("daily-log-save-button").addEventListener("click", saveDailyLog);
        $("daily-log-clear-button").addEventListener("click", () => {
            if (!dailyLogs[selectedDailyLogDate]) return;
            if (confirm(`Delete the journal entry for ${formatShortDate(selectedDailyLogDate)}?`)) {
                delete dailyLogs[selectedDailyLogDate];
                saveState();
                updateDailyLogContent();
            }
        });
        $("daily-log-text").addEventListener("input", () => {
            $("daily-log-counter").textContent = `${$("daily-log-text").value.length.toLocaleString()} characters`;
        });
        updateDailyLogContent();
    }

    function updateDailyLogContent() {
        const textArea = $("daily-log-text");
        const dateInput = $("daily-log-date");
        const heading = $("daily-log-date-heading");
        const history = $("daily-log-history");
        if (!textArea || !history) return;

        const savedText = String(dailyLogs[selectedDailyLogDate] || "");
        if (dateInput) dateInput.value = selectedDailyLogDate;
        if (heading) heading.textContent = formatDate(selectedDailyLogDate);
        textArea.value = savedText;
        $("daily-log-counter").textContent = `${savedText.length.toLocaleString()} characters`;
        $("daily-log-save-status").textContent = savedText ? "Saved locally ✓ — you can edit it anytime." : "No entry for this date yet.";

        const entries = Object.entries(dailyLogs).filter(([, value]) => String(value || "").trim()).sort(([a],[b]) => b.localeCompare(a));
        const todayWords = String(dailyLogs[getTodayKey()] || "").trim();
        const totalWords = entries.reduce((sum,[,value]) => sum + String(value).trim().split(/\s+/).filter(Boolean).length, 0);
        $("daily-log-stats").innerHTML = `
            <div class="daily-log-stat-card"><span>🗓️ Logged days</span><strong>${entries.length}</strong><small>journal entries</small></div>
            <div class="daily-log-stat-card"><span>✍️ This entry</span><strong>${savedText.trim() ? savedText.trim().split(/\s+/).filter(Boolean).length : 0}</strong><small>words</small></div>
            <div class="daily-log-stat-card"><span>📖 Total words</span><strong>${totalWords.toLocaleString()}</strong><small>across your journal</small></div>
            <div class="daily-log-stat-card"><span>🔥 Study streak</span><strong>${getStudyStreak()} days</strong><small>${todayWords ? "Today's log is written" : "Write today's reflection"}</small></div>
        `;

        history.innerHTML = entries.length ? entries.slice(0, 30).map(([date,text]) => `
            <div class="daily-log-history-item-final">
                <button type="button" class="daily-log-open-button" data-open-daily-log="${escapeHTML(date)}">
                    <span class="daily-log-timeline-dot">📝</span><span class="daily-log-timeline-content"><strong>${escapeHTML(formatShortDate(date))}</strong><small>${escapeHTML(String(text).replace(/\s+/g," ").slice(0,150))}${String(text).length > 150 ? "…" : ""}</small></span>
                </button>
                <div class="daily-log-item-actions"><button type="button" class="mini-edit-button" data-edit-daily-log="${escapeHTML(date)}">✏️ Edit</button><button type="button" class="mini-delete-button" data-delete-daily-log="${escapeHTML(date)}">Delete</button></div>
            </div>
        `).join("") : `<div class="tracker-empty-state"><div>📝</div><p>No journal entries yet.</p><small>Your first entry will appear here.</small></div>`;

        history.querySelectorAll("[data-open-daily-log], [data-edit-daily-log]").forEach((button) => button.addEventListener("click", () => {
            selectedDailyLogDate = button.dataset.openDailyLog || button.dataset.editDailyLog || getTodayKey();
            updateDailyLogContent();
            textArea.focus();
        }));
        history.querySelectorAll("[data-delete-daily-log]").forEach((button) => button.addEventListener("click", () => {
            const date = button.dataset.deleteDailyLog;
            if (!confirm(`Delete the journal entry for ${formatShortDate(date)}?`)) return;
            delete dailyLogs[date];
            saveState();
            if (selectedDailyLogDate === date) selectedDailyLogDate = getTodayKey();
            updateDailyLogContent();
        }));
    }

    function saveDailyLog() {
        const textArea = $("daily-log-text");
        if (!textArea) return;
        const value = textArea.value.trim();
        if (value) dailyLogs[selectedDailyLogDate] = value;
        else delete dailyLogs[selectedDailyLogDate];
        saveState();
        updateDailyLogContent();
        const status = $("daily-log-save-status");
        if (status) status.textContent = "Saved just now ✓ — edit it anytime.";
    }

    function createActivityHistoryHTML() {
        const sorted = activities.slice().sort((a,b) => String(b.date).localeCompare(String(a.date)) || Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 40);
        if (!sorted.length) return `<div class="activity-empty-state"><div>🌱</div><h3>No activities logged yet</h3><p>Add something you enjoyed outside study.</p></div>`;
        return `<div class="activity-history-list">${sorted.map((activity) => {
            const type = getActivityType(activity.type);
            return `<div class="activity-history-item">
                <div class="activity-history-icon activity-${type.id}">${type.icon}</div>
                <div class="activity-history-main"><div class="activity-history-title-row"><strong>${escapeHTML(activity.title)}</strong><span>${escapeHTML(formatActivityDuration(activity.minutes))}</span></div><div class="activity-history-meta"><span>${escapeHTML(type.label)}</span><span>•</span><span>${escapeHTML(formatShortDate(activity.date))}</span></div>${activity.note ? `<p>${escapeHTML(activity.note)}</p>` : ""}</div>
                <div class="activity-item-actions"><button type="button" class="mini-edit-button" data-edit-activity="${escapeHTML(activity.id)}">✏️ Edit</button><button type="button" class="mini-delete-button" data-delete-activity="${escapeHTML(activity.id)}">Delete</button></div>
            </div>`;
        }).join("")}</div>`;
    }

    function renderActivities() {
        const page = $("activities");
        if (!page) return;
        const editActivity = editingActivityId ? activities.find(a => a.id === editingActivityId) : null;
        page.innerHTML = `
            <div class="page-header enhanced-page-header"><div><p class="small-label">LIFE OUTSIDE STUDY</p><h1>Activities</h1><p class="muted">Track your fun, exercise and recharge time without losing sight of your CA goal. 🎬🎮</p></div></div>
            <div class="activity-summary-grid">${createActivitySummaryHTML()}</div>
            <div class="statistics-two-column activities-layout">
                <div class="tracker-card activity-form-card">
                    <div class="tracker-card-header"><div><p class="small-label">${editActivity ? "EDIT ENTRY" : "LOG SOMETHING"}</p><h2>${editActivity ? "Update activity" : "Add an activity"}</h2></div>${editActivity ? `<button type="button" class="secondary-button" id="cancel-activity-edit">Cancel</button>` : ""}</div>
                    <form id="activity-form" class="activity-form">
                        <div class="form-grid-two"><label><span>Date</span><input id="activity-date" type="date" value="${escapeHTML(editActivity ? editActivity.date : getTodayKey())}" required></label><label><span>Type</span><select id="activity-type" required>${ACTIVITY_TYPES.map(type => `<option value="${type.id}" ${editActivity && editActivity.type === type.id ? "selected" : ""}>${type.icon} ${escapeHTML(type.label)}</option>`).join("")}</select></label></div>
                        <label><span>What did you do?</span><input id="activity-title" type="text" maxlength="80" value="${escapeHTML(editActivity ? editActivity.title : "")}" placeholder="e.g. Watched a movie with family" required></label>
                        <div class="form-grid-two"><label><span>Duration (minutes)</span><input id="activity-duration" type="number" min="1" max="1440" value="${editActivity ? Number(editActivity.minutes) : ""}" required></label><label><span>Optional note</span><input id="activity-note" type="text" maxlength="140" value="${escapeHTML(editActivity ? (editActivity.note || "") : "")}" placeholder="How was it?"></label></div>
                        <div class="activity-form-footer"><p class="muted">Saved locally in this browser.</p><button type="submit" class="primary-action-button">${editActivity ? "✓ Update activity" : "＋ Add activity"}</button></div>
                    </form>
                </div>
                <div class="tracker-card activity-today-card"><div class="tracker-card-header"><div><p class="small-label">TODAY</p><h2>Outside-study time</h2></div><div class="today-activity-total">${escapeHTML(formatActivityDuration(getActivitiesForDate(getTodayKey()).reduce((s,a)=>s+Number(a.minutes||0),0)))}</div></div><div class="activity-today-list">${getActivitiesForDate(getTodayKey()).length ? getActivitiesForDate(getTodayKey()).slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,8).map(a=>{const t=getActivityType(a.type);return `<div class="mini-activity-row"><span class="mini-activity-icon">${t.icon}</span><span>${escapeHTML(a.title)}</span><strong>${escapeHTML(formatActivityDuration(a.minutes))}</strong></div>`;}).join("") : `<p class="muted activity-no-today">Nothing logged today yet.</p>`}</div></div>
            </div>
            <div class="tracker-card"><div class="tracker-card-header"><div><p class="small-label">RECENT</p><h2>Activity history</h2></div><span class="activity-count-pill">${activities.length} total</span></div>${createActivityHistoryHTML()}</div>
        `;

        $("activity-form").addEventListener("submit", (event) => {
            event.preventDefault();
            const date = $("activity-date").value || getTodayKey();
            const type = $("activity-type").value;
            const title = $("activity-title").value.trim();
            const minutes = Number($("activity-duration").value);
            const note = $("activity-note").value.trim();
            if (!title || !Number.isFinite(minutes) || minutes < 1) return;
            if (editingActivityId) {
                const item = activities.find(a => a.id === editingActivityId);
                if (item) Object.assign(item, {date, type, title, minutes: Math.min(1440, Math.round(minutes)), note});
                editingActivityId = null;
            } else {
                activities.push({id:`activity_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, date, type, title, minutes:Math.min(1440,Math.round(minutes)), note, createdAt:Date.now()});
            }
            saveState();
            renderActivities();
        });

        const cancel = $("cancel-activity-edit");
        if (cancel) cancel.addEventListener("click", () => { editingActivityId = null; renderActivities(); });

        page.querySelectorAll("[data-edit-activity]").forEach(button => button.addEventListener("click", () => { editingActivityId = button.dataset.editActivity; renderActivities(); window.scrollTo({top:0, behavior:"smooth"}); }));
        page.querySelectorAll("[data-delete-activity]").forEach(button => button.addEventListener("click", () => {
            const id = button.dataset.deleteActivity;
            const item = activities.find(a => a.id === id);
            if (!item || !confirm(`Delete “${item.title}”?`)) return;
            activities = activities.filter(a => a.id !== id);
            if (editingActivityId === id) editingActivityId = null;
            saveState();
            renderActivities();
        }));
    }

    function renderSettings() {
        const page = $("settings");
        if (!page) return;

        const theme = getThemePreference();
        const readable = getReadablePreference();
        const dailyGoal = getDailyGoalHours();
        const studyCount = studySessions.length;
        const logCount = Object.keys(dailyLogs).filter((key) => String(dailyLogs[key] || "").trim()).length;
        const activityCount = activities.length;
        const customAshPhoto = Boolean(localStorage.getItem(POLISH_KEYS.ashPhoto));
        const customPothuPhoto = Boolean(localStorage.getItem(POLISH_KEYS.pothuPhoto));
        const todayHours = getStudyHoursForDate(getTodayKey());
        const goalPercent = dailyGoal > 0 ? Math.min(100, Math.round((todayHours / dailyGoal) * 100)) : 0;

        page.innerHTML = `
            <div class="page-header enhanced-page-header">
                <div>
                    <p class="small-label">PERSONALIZE</p>
                    <h1>Settings</h1>
                    <p class="muted">Control how DAYDREAMERS looks, reads and stores your study data. ⚙️</p>
                </div>
            </div>

            <div class="settings-hero-final">
                <div class="settings-hero-icon">✨</div>
                <div>
                    <strong>Your study space</strong>
                    <p>These preferences are saved in this browser. Nothing is uploaded to a server in the current local version.</p>
                </div>
            </div>

            <div class="settings-grid">
                <div class="tracker-card settings-card">
                    <div class="settings-card-icon">🌗</div>
                    <p class="small-label">APPEARANCE</p>
                    <h2>Theme</h2>
                    <p class="muted">System follows your Windows/browser appearance automatically.</p>
                    <label class="settings-field">
                        <span>Theme preference</span>
                        <select id="theme-preference">
                            <option value="system" ${theme === "system" ? "selected" : ""}>🖥️ System default</option>
                            <option value="light" ${theme === "light" ? "selected" : ""}>☀️ Light</option>
                            <option value="dark" ${theme === "dark" ? "selected" : ""}>🌙 Dark</option>
                        </select>
                    </label>
                </div>

                <div class="tracker-card settings-card">
                    <div class="settings-card-icon">🔤</div>
                    <p class="small-label">READABILITY</p>
                    <h2>Clearer text</h2>
                    <p class="muted">Increase text size and spacing for a more comfortable reading view.</p>
                    <label class="settings-field">
                        <span>Text size</span>
                        <select id="readable-preference">
                            <option value="normal" ${readable === "normal" ? "selected" : ""}>Normal</option>
                            <option value="large" ${readable === "large" ? "selected" : ""}>Large & clearer</option>
                        </select>
                    </label>
                </div>
            </div>

            <div class="tracker-card settings-card">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">STUDY TARGET</p>
                        <h2>Daily Study Goal</h2>
                    </div>
                    <span class="settings-badge">${escapeHTML(String(dailyGoal))} hrs/day</span>
                </div>
                <p class="muted">Set the number of hours you want to study each day. This changes the goal used by your dashboard and statistics.</p>
                <div class="settings-goal-row">
                    <label class="settings-field settings-goal-field">
                        <span>Daily goal (hours)</span>
                        <input id="daily-goal-input" type="number" min="0.5" max="24" step="0.25" value="${escapeHTML(String(dailyGoal))}">
                    </label>
                    <button type="button" class="primary-action-button" id="save-daily-goal-button">Save goal</button>
                </div>
                <div class="settings-mini-progress"><span style="width:${goalPercent}%"></span></div>
                <small id="daily-goal-status">${escapeHTML(formatHours(todayHours))} studied today • ${goalPercent}% of your goal</small>
            </div>

            <div class="tracker-card settings-card">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">YOUR DATA</p>
                        <h2>Activity at a glance</h2>
                    </div>
                    <span class="settings-badge">Local only</span>
                </div>
                <div class="settings-data-grid">
                    <div><strong>${studyCount}</strong><span>Study sessions</span></div>
                    <div><strong>${logCount}</strong><span>Daily logs</span></div>
                    <div><strong>${activityCount}</strong><span>Activities</span></div>
                    <div><strong>${getOverallChapterProgress()}%</strong><span>Syllabus progress</span></div>
                </div>
                <div class="quick-actions">
                    <button id="export-data-button">📦 Export backup</button>
                    <button id="clear-data-button" class="danger-button">⚠️ Clear all local data</button>
                </div>
            </div>

            <div class="tracker-card profile-settings-card">
                <div class="tracker-card-header">
                    <div>
                        <p class="small-label">OUR PROFILES</p>
                        <h2>Profile Photos</h2>
                    </div>
                    <span class="settings-badge">Stored locally</span>
                </div>
                <p class="muted">Replace either profile photo. Custom photos stay in this browser and are not uploaded anywhere.</p>
                <div class="profile-upload-grid">
                    <div class="profile-upload-card ashjii-upload">
                        <div class="upload-avatar-preview"><img src="${escapeHTML(localStorage.getItem(POLISH_KEYS.ashPhoto) || "assets/ashjii-profile.jpg")}" alt="ashjii profile preview"></div>
                        <div>
                            <strong>ashjii</strong>
                            <small id="ash-photo-status">${customAshPhoto ? "Custom photo selected" : "Using default profile photo"}</small>
                            <label class="upload-button">Choose photo<input id="ash-photo-input" type="file" accept="image/*"></label>
                            ${customAshPhoto ? `<button type="button" class="text-button" id="remove-ash-photo">Use default photo</button>` : ""}
                        </div>
                    </div>
                    <div class="profile-upload-card pothujii-upload">
                        <div class="upload-avatar-preview"><img src="${escapeHTML(localStorage.getItem(POLISH_KEYS.pothuPhoto) || "assets/pothujii-profile.jpg")}" alt="pothujii profile preview"></div>
                        <div>
                            <strong>pothujii</strong>
                            <small id="pothu-photo-status">${customPothuPhoto ? "Custom photo selected" : "Using default profile photo"}</small>
                            <label class="upload-button">Choose photo<input id="pothu-photo-input" type="file" accept="image/*"></label>
                            ${customPothuPhoto ? `<button type="button" class="text-button" id="remove-pothu-photo">Use default photo</button>` : ""}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const themeSelect = $("theme-preference");
        if (themeSelect) {
            themeSelect.addEventListener("change", () => applyThemePreference(themeSelect.value));
        }

        const readableSelect = $("readable-preference");
        if (readableSelect) {
            readableSelect.addEventListener("change", () => applyReadablePreference(readableSelect.value));
        }

        const goalInput = $("daily-goal-input");
        const goalSave = $("save-daily-goal-button");
        if (goalSave && goalInput) {
            const saveGoal = () => {
                const status = $("daily-goal-status");
                if (!saveDailyGoalHours(goalInput.value)) {
                    if (status) status.textContent = "Enter a goal between 0.5 and 24 hours.";
                    return;
                }
                if (status) status.textContent = `Goal saved ✓ • ${formatHours(todayHours)} studied today`;
                renderSettings();
            };
            goalSave.addEventListener("click", saveGoal);
            goalInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") saveGoal();
            });
        }

        attachProfileUpload("ash-photo-input", POLISH_KEYS.ashPhoto, "ash-photo-status");
        attachProfileUpload("pothu-photo-input", POLISH_KEYS.pothuPhoto, "pothu-photo-status");

        const removeAsh = $("remove-ash-photo");
        if (removeAsh) {
            removeAsh.addEventListener("click", () => {
                removeProfilePhoto(POLISH_KEYS.ashPhoto, "ash-photo-status");
                renderSettings();
            });
        }

        const removePothu = $("remove-pothu-photo");
        if (removePothu) {
            removePothu.addEventListener("click", () => {
                removeProfilePhoto(POLISH_KEYS.pothuPhoto, "pothu-photo-status");
                renderSettings();
            });
        }

        const exportButton = $("export-data-button");
        if (exportButton) exportButton.addEventListener("click", exportData);

        const clearButton = $("clear-data-button");
        if (clearButton) clearButton.addEventListener("click", clearAllData);
    }

    function createSessionHTML(session) {
        return `<div class="study-session-item"><div><strong>${escapeHTML(getSubjectDisplayName(session.subject))}</strong><small>${escapeHTML(formatHours(session.hours))}</small></div><div class="session-item-actions"><button type="button" class="mini-edit-button" data-edit-session="${escapeHTML(session.id)}">✏️</button><button type="button" class="mini-delete-button" data-delete-session="${escapeHTML(session.id)}">×</button></div></div>`;
    }

    let editingStudySessionId = null;

    function openStudyModal() {
        const modal = $("study-modal");
        if (!modal) return;
        modal.classList.add("open");
        modal.style.display = "flex";
        const existing = editingStudySessionId ? studySessions.find(s => s.id === editingStudySessionId) : null;
        const subject = $("study-subject");
        const hours = $("study-hours");
        if (existing) {
            if (subject) subject.value = existing.subject;
            if (hours) hours.value = existing.hours;
            const save = $("save-study-button");
            if (save) save.textContent = "Update Study Session";
        } else {
            if (hours) hours.value = "";
            const save = $("save-study-button");
            if (save) save.textContent = "Save Study Session";
        }
        setTimeout(() => { if (hours) hours.focus(); }, 50);
    }

   async function saveStudySession() {
    const subjectElement =
        $("study-subject");

    const hoursElement =
        $("study-hours");

    if (
        !subjectElement ||
        !hoursElement
    ) {
        return;
    }

    const subject =
        subjectElement.value;

    const hours =
        Number(
            hoursElement.value
        );

    if (
        !Number.isFinite(hours) ||
        hours <= 0
    ) {
        alert(
            "Please enter a study time greater than 0."
        );

        hoursElement.focus();

        return;
    }

    if (hours > 24) {
        alert(
            "Please enter a realistic study time."
        );

        hoursElement.focus();

        return;
    }

   studySessions.push({
    id:
        `session-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

    userId:
        window.daydreamersProfile?.uid || "local",

    date:
        getTodayKey(),

    subject,

    hours,

    createdAt:
        Date.now()
});

    // Save this user's study data to Firebase.
    if (window.daydreamersStudyCloud) {
        try {
            await window.daydreamersStudyCloud.save({
                studySessions,
                chapterProgress,
                dailyLogs
            });

            console.log(
                "DAYDREAMERS study session saved to Firebase."
            );

        } catch (error) {

            console.error(
                "DAYDREAMERS Firebase study save failed:",
                error
            );

            // Remove the session again if Firebase save failed.
            studySessions.pop();

            alert(
                "Could not save your study session to the cloud. Please check your internet connection and try again."
            );

            return;
        }
    }

    // Keep the local copy too for now.
    saveState();

    closeStudyModal();

    updateAllDisplays();

    showPage(
        getVisiblePageId() ||
            "dashboard"
    );
}

    function setupFinalEditDeleteHandlers() {
        document.addEventListener("click", (event) => {
            const edit = event.target.closest("[data-edit-session]");
            if (edit) {
                editingStudySessionId = edit.dataset.editSession;
                openStudyModal();
                return;
            }
            const del = event.target.closest("[data-delete-session]");
            if (del) {
                const id = del.dataset.deleteSession;
                const item = studySessions.find(s => s.id === id);
                if (item && confirm(`Delete ${getSubjectDisplayName(item.subject)} study session (${formatHours(item.hours)})?`)) {
                    studySessions = studySessions.filter(s => s.id !== id);
                    saveState();
                    updateAllDisplays();
                    const current = getVisiblePageId();
                    if (current) showPage(current);
                }
            }
        });
    }

async function initializeDaydreamers() {

    // Wait for Firebase profile to finish loading.
    if (window.daydreamersProfileReady) {
        await window.daydreamersProfileReady;
    }

    // Load this logged-in user's study data from Firebase.
    if (window.daydreamersStudyCloud) {
        try {
            const cloudData =
                await window.daydreamersStudyCloud.load();

            studySessions =
                cloudData.studySessions || [];

            chapterProgress =
                cloudData.chapterProgress || {};

            dailyLogs =
                cloudData.dailyLogs || {};

            console.log(
                "DAYDREAMERS cloud study data loaded:",
                cloudData
            );

        } catch (error) {

            console.error(
                "DAYDREAMERS cloud study data load failed:",
                error
            );

            alert(
                "Could not load your cloud study data. Please check your internet connection and refresh."
            );
        }
    }

    updateDateAndGreeting();
    setupNavigation();
    setupStudyModal();
    setupChapterFilters();
    setupQuickChapterButton();
    renderDashboard();
    renderStudyTracker();
    renderChapters();
    showPage("dashboard");
}


    /* ---------------------------------------------------------
       START APPLICATION
       --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDaydreamers,
            {
                once: true
            }
        );

    } else {

        initializeDaydreamers();

    }

})();
