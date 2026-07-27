// ==========================================
// TDU website core logic
// ==========================================

// Roblox Integration Configuration
const ROBLOX_CONFIG = {
    groupId: 67364868, // Default Roblox Group ID (Replace with your actual group ID)
    roles: {
        // ranks: [min, max] - Bugfix: Reihenfolge musste min->max sein, und
        // einzelne Ränge brauchen zwingend zwei Werte (z.B. [13, 13]),
        // sonst ist ranks[1] undefined und das Rank-Matching schlägt fehl.
        hq: { ranks: [6, 30], label: "Unit HQ" },
        hr: { ranks: [14, 15], label: "Unit HR" },
        staff: { ranks: [13, 13], label: "Unit Staff" },
        srInstructors: { ranks: [10, 10], label: "Senior Instructors" },
        instructors: { ranks: [5, 5], label: "Instructors" }
    }
};

// Proxy Base URL
// Läuft als eigene Vercel Serverless Function unter /api/roblox-proxy
// (siehe api/roblox-proxy.js) -> Same-Origin-Request, kein CORS-Proxy-Umweg mehr,
// keine 403-Sperren von corsproxy.io mehr möglich.
const CORS_PROXY_BASE = "/api/roblox-proxy?url=";

function buildProxiedUrl(targetUrl) {
    return `${CORS_PROXY_BASE}${encodeURIComponent(targetUrl)}`;
}

// High-Fidelity Mock Data Fallback (Loads if Roblox API is offline or Group ID is placeholder)
const MOCK_MEMBERS = {
    hq: [
        { userId: 1, username: "ERROR - Report to Benny", displayName: "ERROR - Report to Benny", role: "ERROR", robloxId: "ERROR" },
    ],
    hr: [
        { userId: 3, username: "ERROR - Report to Benny", displayName: "ERROR - Report to Benny", role: "ERROR", robloxId: "ERROR" },
    ],
    staff: [
        { userId: 5, username: "ERROR - Report to Benny", displayName: "ERROR - Report to Benny", role: "ERROR", robloxId: "ERROR" }
    ],
    "sr-instructors": [
        { userId: 8, username: "ERROR - Report to Benny", displayName: "ERROR - Report to Benny", role: "ERROR", robloxId: "ERROR" }
    ],
    instructors: [
        { userId: 11, username: "ERROR - Report to Benny", displayName: "ERROR - Report to Benny", role: "ERROR", robloxId: "ERROR" }
    ]
};

// Fun Quotes Array
const TDU_QUOTES = [
    { text: "Discipline is not about punishment. It's about preparation. If you cannot stand straight in the briefing, you will not shoot straight in the firefight.", author: "Commander Vance, TDU Founder" },
    { text: "A cadet who fails to double-check their gear in the locker room will fail to check their corners in active breach. Zero excuses.", author: "Sgt. Stone, Lead Evaluator" },
    { text: "The badge is heavy. It is not designed to hold up your shirt; it is designed to hold up the law. Respect it.", author: "Lt. Mercer, Academy Supervisor" },
    { text: "We do not train you to survive the street. We train you to master it. TDU holds the line.", author: "Capt. Kovacs, HQ Officer" },
    { text: "When pressure builds, your training is the only thing that stands between order and absolute chaos.", author: "CO. Vance, Unit Commander" }
];

// Quiz Questions
const QUIZ_QUESTIONS = [
    {
        question: "During a routine traffic stop, the driver refuses to hand over their ID and starts shouting. What is your immediate course of action?",
        options: [
            "De-escalate, call for backup, and explain the legal requirement of providing identification.",
            "Pull your firearm instantly and demand compliance under threat of force.",
            "Open the driver's door and drag them out of the vehicle.",
            "Ignore them and write a ticket on their license plate anyway."
        ],
        correct: 0,
        explanation: "Correct! De-escalation and calling backup ensures officer safety while maintaining legal protocols."
    },
    {
        question: "You observe a fellow TDU Instructor using abusive language toward a cadet during a basic training course. What should you do?",
        options: [
            "Shout at the instructor in front of the cadets to stop them.",
            "Do nothing; instructors have absolute command authority during training.",
            "Report the behavior privately to TDU Command and document the incident.",
            "Laugh along to keep the training atmosphere relaxed."
        ],
        correct: 2,
        explanation: "Correct! Professionalism requires documenting misconduct privately to TDU Command without undermining instructors in public."
    },
    {
        question: "A suspect is fleeing inside a crowded shopping mall. They do not appear to have a visible weapon. What is the appropriate force option?",
        options: [
            "Lethal force (Firearm) to stop them before they escape.",
            "Taser or physical tackle, maintaining awareness of bystanders.",
            "Deploy a flashbang into the crowd to stun the suspect.",
            "Let them go entirely to avoid any paperwork."
        ],
        correct: 1,
        explanation: "Correct! Non-lethal force (Taser/tackle) is appropriate for an unarmed fleeing suspect in a crowded public area."
    },
    {
        question: "What is the primary role of the Training & Discipline Unit (TDU) within HCPD?",
        options: [
            "To act as a tactical SWAT squad for high-risk warrants.",
            "To write tickets for illegal parking around headquarters.",
            "To train cadets and audit the ethical conduct of all active officers.",
            "To govern group finances and Roblox developer assets."
        ],
        correct: 2,
        explanation: "Correct! TDU's core mission is teaching proper tactics and policing protocols, and holding officers accountable."
    }
];

// Photo Gallery Items (Images generated by AI or realistic placeholders)
const GALLERY_ITEMS = [
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321251719675955/image.png?ex=6a68c98c&is=6a67780c&hm=17f9a1abb490431e87ecce3da8de94764d55c906d17f1d55a999fc618e6ed24b&=&format=webp&quality=lossless", title: "Divisional Inspection", tag: "Unit" },
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321485774557347/image.png?ex=6a68c9c4&is=6a677844&hm=db97b7160a09b5c463f4dbd88ba81b8fd7a5e0b081a0758403105189d6e3ebcc&=&format=webp&quality=lossless", title: "Help Desk Event", tag: "Event" },
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321484545626232/image.png?ex=6a68c9c4&is=6a677844&hm=b951915986244da9eb8e5dcdb9ca40a5135d09b18a8746bfad734e0c117e0d2c&=&format=webp&quality=lossless", title: "Basic Training Arena", tag: "Patrol" },
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321485208195252/image.png?ex=6a68c9c4&is=6a677844&hm=143ea09e5bb0792e0618797a35e0838d6a791a7f81796789fb21de27bdaa9a3c&=&format=webp&quality=lossless", title: "TDU Physical Training", tag: "Training" },
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321252659069092/image.png?ex=6a68c98d&is=6a67780d&hm=16e77cb9224a134986f645768d2036b668ee6746e336a4a486939864a9b11e9f&=&format=webp&quality=lossless", title: "Lounge Break", tag: "Unit" },
    { src: "https://media.discordapp.net/attachments/1529809950686318622/1531321252138979580/image.png?ex=6a68c98d&is=6a67780d&hm=4668c3cbd4089ae8afc1b16284e9b5798cfecdf89ccb7f76306b0b20b1dcdcb0&=&format=webp&quality=lossless", title: "Team Wedge in Parade Room", tag: "Unit" }
];

// ==========================================
// Initialization on DOM Load
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initTrueFocusText();
    initSpecularButtons();
    initStatsCountUp();
    initSmoothCaretInputs();
    initRosterFetcher();
    initQuotesSlider();
    initQuiz();
    initGallery();
});

// ==========================================
// Navigation & Active Pill logic
// ==========================================
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabContents = document.querySelectorAll(".tab-content");
    const activePill = document.getElementById("nav-pill-indicator");
    
    function updateActivePill(link) {
        if (!link || !activePill) return;
        
        // Calculate relative left offset and width
        const linkRect = link.getBoundingClientRect();
        const navRect = link.parentElement.getBoundingClientRect();
        
        activePill.style.left = `${linkRect.left - navRect.left}px`;
        activePill.style.width = `${linkRect.width}px`;
    }

    // Tab switching core
    function switchTab(tabId) {
        // Deactivate all links and tabs
        navLinks.forEach(link => link.classList.remove("active"));
        tabContents.forEach(tab => tab.classList.remove("active-tab"));
        
        // Find corresponding link and content section
        const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
        const targetTab = document.getElementById(`${tabId}-tab`);
        
        if (targetLink && targetTab) {
            targetLink.classList.add("active");
            targetTab.classList.add("active-tab");
            updateActivePill(targetLink);
            
            // Re-trigger count-ups on entering home
            if (tabId === "home") {
                triggerStatsCountUp();
            }
            
            // Scroll to top of window smoothly
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    // Link click listeners
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = link.getAttribute("data-tab");
            switchTab(tabId);
            
            // Update hash without scrolling natively
            history.pushState(null, null, `#${tabId}`);
        });
    });

    // Handle deep linking via URL hash
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        switchTab(currentHash);
    } else {
        // Default home pill size
        const defaultLink = document.querySelector(".nav-link.active");
        setTimeout(() => updateActivePill(defaultLink), 150);
    }

    // Listen to resize to recalculate active nav pill bounds
    window.addEventListener("resize", () => {
        const activeLink = document.querySelector(".nav-link.active");
        updateActivePill(activeLink);
    });

    // Intercept button triggers inside views (like Hero action buttons)
    document.querySelectorAll("[data-target]").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-target");
            switchTab(targetTab);
            history.pushState(null, null, `#${targetTab}`);
        });
    });
}

// ==========================================
// True Focus Title Animation
// ==========================================
function initTrueFocusText() {
    const sentence = "Training & Discipline Unit";
    const wordsWrapper = document.getElementById("true-focus-words");
    const focusBracket = document.getElementById("focus-bracket");
    
    if (!wordsWrapper || !focusBracket) return;
    
    // Split text and wrap in spans
    const words = sentence.split(" ");
    wordsWrapper.innerHTML = words
        .map((w, idx) => `<span class="true-focus-word" data-index="${idx}">${w}</span>`)
        .join("");
        
    const wordElements = wordsWrapper.querySelectorAll(".true-focus-word");
    let currentIndex = 0;
    
    function focusWord(idx) {
        wordElements.forEach((word, i) => {
            if (i === idx) {
                word.classList.add("focused");
                word.classList.remove("blurred");
                
                // Position the focus brackets overlay relative to word
                const wordRect = word.getBoundingClientRect();
                const wrapperRect = wordsWrapper.getBoundingClientRect();
                const containerRect = wordsWrapper.parentElement.getBoundingClientRect();
                
                // Calculate position relative to container
                const left = wordRect.left - containerRect.left;
                const top = wordRect.top - containerRect.top;
                
                focusBracket.style.left = `${left - 8}px`;
                focusBracket.style.top = `${top - 4}px`;
                focusBracket.style.width = `${wordRect.width + 16}px`;
                focusBracket.style.height = `${wordRect.height + 8}px`;
                
                // Color brackets gold for high impact words like "Discipline"
                if (word.textContent.toLowerCase() === "discipline") {
                    focusBracket.classList.add("gold");
                } else {
                    focusBracket.classList.remove("gold");
                }
            } else {
                word.classList.remove("focused");
                word.classList.add("blurred");
            }
        });
    }

    // Initialize first focus
    setTimeout(() => focusWord(0), 200);
    
    // Auto cycle focus
    setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
        focusWord(currentIndex);
    }, 1800);

    // Interactive mouseover override
    wordElements.forEach((word, idx) => {
        word.addEventListener("mouseenter", () => {
            currentIndex = idx;
            focusWord(idx);
        });
    });
}

// ==========================================
// Specular Buttons mouse sheen tracking
// ==========================================
function initSpecularButtons() {
    function updateSpecularVars(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.setProperty("--x", `${x}px`);
        btn.style.setProperty("--y", `${y}px`);
    }

    // Set listener on body for event delegation (supports dynamically rendered elements)
    document.body.addEventListener("mousemove", (e) => {
        const btn = e.target.closest(".specular-btn");
        if (btn) {
            updateSpecularVars(e, btn);
        }
    });
}

// ==========================================
// Stats Count Up Animation
// ==========================================
function initStatsCountUp() {
    triggerStatsCountUp();
}

function triggerStatsCountUp() {
    const stats = [
        { id: "count-total-members", target: 382 },
        { id: "count-active-instructors", target: 42 },
        { id: "count-grad-rate", target: 96 }
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;
        
        // Fetch target directly from attribute if needed
        const targetValue = parseInt(el.getAttribute("data-target")) || stat.target;
        animateCount(el, 0, targetValue, 1600);
    });
}

function animateCount(element, start, end, duration) {
    let startTime = null;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing out quadratic function
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * (end - start) + start);
        
        // Append percent sign for graduation rate
        if (element.id === "count-grad-rate") {
            element.textContent = `${currentValue}%`;
        } else {
            element.textContent = currentValue.toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// ==========================================
// Smooth Caret Input (skiper106 replica)
// ==========================================
function initSmoothCaretInputs() {
    const inputWrappers = document.querySelectorAll(".smooth-input-wrapper");
    
    inputWrappers.forEach(wrapper => {
        const input = wrapper.querySelector("input");
        const measureSpan = wrapper.querySelector(".input-measure");
        const caret = wrapper.querySelector(".smooth-caret");
        
        if (!input || !measureSpan || !caret) return;
        
        function updateCaretPosition() {
            const val = input.value;
            
            // Set text of hidden scale span (escape spaces so they are measured correctly)
            measureSpan.textContent = val.replace(/ /g, "\u00a0");
            
            // Get measured pixel width
            const offset = measureSpan.offsetWidth;
            
            // Slide custom caret
            caret.style.left = `${offset + 14}px`; // Add initial input padding-left
        }
        
        input.addEventListener("input", updateCaretPosition);
        input.addEventListener("focus", updateCaretPosition);
        
        // Initialize position
        updateCaretPosition();
    });
}

// ==========================================
// Roblox Group Roster Fetcher
// ==========================================
async function initRosterFetcher() {
    const loader = document.getElementById("roster-loader");
    const groupId = ROBLOX_CONFIG.groupId;
    
    try {
        // Step 1: Fetch Group Roles List via CORS Proxy
        const rolesUrl = `https://groups.roblox.com/v1/groups/${groupId}/roles`;
        const proxiedRolesUrl = buildProxiedUrl(rolesUrl);
        
        const rolesResponse = await fetch(proxiedRolesUrl);
        if (!rolesResponse.ok) throw new Error("Roles request failed");
        
        const rolesData = await rolesResponse.json();
        const groupRoles = rolesData.roles || [];
        
        // Map target categories to role objects
        const categoryMap = {
            hq: [],
            hr: [],
            staff: [],
            srInstructors: [],
            instructors: []
        };
        
        groupRoles.forEach(role => {
            const rank = role.rank;
            const config = ROBLOX_CONFIG.roles;
            
            if (rank >= config.hq.ranks[0] && rank <= config.hq.ranks[1]) {
                categoryMap.hq.push(role);
            } else if (rank >= config.hr.ranks[0] && rank <= config.hr.ranks[1]) {
                categoryMap.hr.push(role);
            } else if (rank >= config.staff.ranks[0] && rank <= config.staff.ranks[1]) {
                categoryMap.staff.push(role);
            } else if (rank >= config.srInstructors.ranks[0] && rank <= config.srInstructors.ranks[1]) {
                categoryMap.srInstructors.push(role);
            } else if (rank >= config.instructors.ranks[0] && rank <= config.instructors.ranks[1]) {
                categoryMap.instructors.push(role);
            }
        });
        
        // Collect users under each category
        const parsedRoster = {
            hq: [],
            hr: [],
            staff: [],
            "sr-instructors": [],
            instructors: []
        };

        // Fetch user members in parallel
        await Promise.all([
            fetchMembersForRoles(categoryMap.hq, parsedRoster.hq, "Unit HQ"),
            fetchMembersForRoles(categoryMap.hr, parsedRoster.hr, "Unit HR"),
            fetchMembersForRoles(categoryMap.staff, parsedRoster.staff, "Unit Staff"),
            fetchMembersForRoles(categoryMap.srInstructors, parsedRoster["sr-instructors"], "Senior Instructor"),
            fetchMembersForRoles(categoryMap.instructors, parsedRoster.instructors, "Instructor")
        ]);

        // Check if we fetched any members at all
        const totalFetched = Object.values(parsedRoster).reduce((acc, list) => acc + list.length, 0);
        if (totalFetched === 0) {
            throw new Error("No members fetched from active ranks");
        }

        // Fetch avatars batch
        await attachAvatars(parsedRoster);
        
        // Render dynamically-fetched roster
        renderRoster(parsedRoster);
        if (loader) loader.classList.add("hidden");

        // Update stats total TDU members count on Home
        const totalStat = document.getElementById("count-total-members");
        if (totalStat) {
            totalStat.setAttribute("data-target", totalFetched);
            totalStat.textContent = totalFetched;
        }

    } catch (err) {
        console.warn("Roblox Live Sync failed. Running fallback mock data. Error:", err.message);
        // Load fallback mock images and roster
        await attachMockAvatars();
        renderRoster(MOCK_MEMBERS);
        if (loader) loader.classList.add("hidden");
    }
}

// Fetch members of a specific list of roles
async function fetchMembersForRoles(rolesList, targetArray, defaultRoleName) {
    if (!rolesList || rolesList.length === 0) return;
    
    for (const role of rolesList) {
        try {
            const url = `https://groups.roblox.com/v1/groups/${ROBLOX_CONFIG.groupId}/roles/${role.id}/users?limit=50&sortOrder=Asc`;
            const proxiedUrl = buildProxiedUrl(url);
            
            const response = await fetch(proxiedUrl);
            if (!response.ok) continue;
            
            const data = await response.json();
            const users = data.data || [];
            
            users.forEach(user => {
                targetArray.push({
                    userId: user.userId,
                    username: user.username,
                    displayName: user.displayName || user.username,
                    role: role.name || defaultRoleName,
                    robloxId: user.userId.toString()
                });
            });
        } catch (e) {
            console.error(`Failed to fetch role members for role ${role.id}`, e);
        }
    }
}

// Fetch user headshots in batch via Roblox API
async function attachAvatars(roster) {
    // Gather all user IDs
    const userIds = [];
    const idToUserMap = {};
    
    Object.values(roster).forEach(category => {
        category.forEach(user => {
            userIds.push(user.userId);
            idToUserMap[user.userId] = user;
        });
    });
    
    if (userIds.length === 0) return;
    
    // Roblox headshots batch size limit is 100, chunk if necessary
    const chunks = [];
    for (let i = 0; i < userIds.length; i += 100) {
        chunks.push(userIds.slice(i, i + 100));
    }
    
    for (const chunk of chunks) {
        try {
            const idsParam = chunk.join(",");
            const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${idsParam}&size=150x150&format=Png&isCircular=false`;
            const proxiedAvatarUrl = buildProxiedUrl(avatarUrl);
            
            const response = await fetch(proxiedAvatarUrl);
            if (!response.ok) continue;
            
            const data = await response.json();
            const avatars = data.data || [];
            
            avatars.forEach(avatar => {
                const user = idToUserMap[avatar.targetId];
                if (user) {
                    user.avatarUrl = avatar.imageUrl || "";
                }
            });
        } catch (e) {
            console.error("Failed to fetch avatar batch", e);
        }
    }
}

// Attach Roblox headshots to static mock users
async function attachMockAvatars() {
    await attachAvatars(MOCK_MEMBERS);
    
    // Provide generic Roblox character headshots if batch fails
    Object.values(MOCK_MEMBERS).forEach(category => {
        category.forEach(user => {
            if (!user.avatarUrl) {
                user.avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`; // High tech fallback robot seeds
            }
        });
    });
}

// Renders roster grids into the DOM
function renderRoster(roster) {
    const grids = {
        hq: document.getElementById("grid-hq"),
        hr: document.getElementById("grid-hr"),
        staff: document.getElementById("grid-staff"),
        "sr-instructors": document.getElementById("grid-sr-instructors"),
        instructors: document.getElementById("grid-instructors")
    };
    
    Object.keys(grids).forEach(categoryKey => {
        const grid = grids[categoryKey];
        if (!grid) return;
        
        const users = roster[categoryKey] || [];
        
        if (users.length === 0) {
            grid.innerHTML = `<p class="no-members-msg">No active officers found on duty.</p>`;
            return;
        }
        
        const isHQ = categoryKey === "hq" || categoryKey === "hr";
        const cardStyle = isHQ ? "card-hq" : "";
        
        grid.innerHTML = users.map(user => {
            const avatar = user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback";
            
            return `
                <div class="member-card glass-panel ${cardStyle}">
                    <span class="rank-badge">${user.role}</span>
                    <div class="avatar-frame">
                        <img class="avatar-img" src="${avatar}" alt="${user.displayName}'s Roblox Avatar" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}'">
                    </div>
                    <div class="member-displayname">${user.displayName}</div>
                    <div class="member-username">@${user.username}</div>
                    <div class="member-id">ID: ${user.robloxId}</div>
                    <a href="https://www.roblox.com/users/${user.robloxId}/profile" target="_blank" class="specular-btn sm ${isHQ ? 'specular-btn-gold' : 'specular-btn-blue'}">
                        <span>Roblox Profile</span>
                    </a>
                </div>
            `;
        }).join("");
    });
    
    // Sub-tab sub-roster selector click listeners (handles dynamic showing of lists)
    initRoleSubtabs();
}

function initRoleSubtabs() {
    const buttons = document.querySelectorAll(".role-tab-btn");
    const sections = document.querySelectorAll(".role-group-section");
    const indicator = document.getElementById("role-selector-indicator");
    
    function updateRoleIndicator(activeBtn) {
        if (!indicator || !activeBtn) return;
        const rect = activeBtn.getBoundingClientRect();
        const containerRect = activeBtn.parentElement.getBoundingClientRect();
        
        indicator.style.left = `${rect.left - containerRect.left}px`;
        indicator.style.width = `${rect.width}px`;
    }
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active-role-group"));
            
            btn.classList.add("active");
            updateRoleIndicator(btn);
            
            const targetRole = btn.getAttribute("data-role");
            const targetSection = document.getElementById(`role-group-${targetRole}`);
            if (targetSection) {
                targetSection.classList.add("active-role-group");
            }
        });
    });
    
    // Size indicator initially
    const activeBtn = document.querySelector(".role-tab-btn.active");
    if (activeBtn) {
        setTimeout(() => updateRoleIndicator(activeBtn), 200);
    }
}

// ==========================================
// Quotes Board Slider
// ==========================================
function initQuotesSlider() {
    const textEl = document.getElementById("tdu-quote-text");
    const authorEl = document.getElementById("tdu-quote-author");
    const nextBtn = document.getElementById("btn-next-quote");
    
    if (!textEl || !authorEl || !nextBtn) return;
    
    let currentIndex = 0;
    
    nextBtn.addEventListener("click", () => {
        // Fade out
        textEl.style.opacity = 0;
        authorEl.style.opacity = 0;
        
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % TDU_QUOTES.length;
            const quote = TDU_QUOTES[currentIndex];
            
            textEl.textContent = `"${quote.text}"`;
            authorEl.textContent = `— ${quote.author}`;
            
            // Fade in
            textEl.style.opacity = 1;
            authorEl.style.opacity = 1;
        }, 300);
    });
}

// ==========================================
// Interactive Aptitude Quiz
// ==========================================
function initQuiz() {
    const progressLabel = document.getElementById("quiz-progress-label");
    const questionText = document.getElementById("quiz-question-text");
    const optionsList = document.getElementById("quiz-options-list");
    const nextBtn = document.getElementById("quiz-btn-next");
    const quizBlock = document.getElementById("quiz-block");
    
    if (!progressLabel || !questionText || !optionsList || !nextBtn || !quizBlock) return;
    
    let currentQuestionIndex = 0;
    let score = 0;
    let answerSelected = false;
    
    function loadQuestion() {
        answerSelected = false;
        nextBtn.style.display = "none";
        optionsList.innerHTML = "";
        
        const q = QUIZ_QUESTIONS[currentQuestionIndex];
        progressLabel.textContent = `Question ${currentQuestionIndex + 1} of ${QUIZ_QUESTIONS.length}`;
        questionText.textContent = q.question;
        
        q.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "quiz-option-btn glass-panel";
            btn.innerHTML = `
                <span>${opt}</span>
                <i class="fa-regular fa-circle"></i>
            `;
            
            btn.addEventListener("click", () => selectOption(idx, btn));
            optionsList.appendChild(btn);
        });
    }
    
    function selectOption(selectedIdx, btnElement) {
        if (answerSelected) return;
        answerSelected = true;
        
        const q = QUIZ_QUESTIONS[currentQuestionIndex];
        const isCorrect = selectedIdx === q.correct;
        
        if (isCorrect) {
            score++;
            btnElement.classList.add("correct");
            btnElement.querySelector("i").className = "fa-solid fa-circle-check text-green";
        } else {
            btnElement.classList.add("incorrect");
            btnElement.querySelector("i").className = "fa-solid fa-circle-xmark text-red";
            
            // Highlight correct answer
            const correctBtn = optionsList.children[q.correct];
            correctBtn.classList.add("correct");
            correctBtn.querySelector("i").className = "fa-solid fa-circle-check text-green";
        }
        
        // Show explanation below question
        const explanation = document.createElement("p");
        explanation.className = "quiz-explanation-text glass-panel";
        explanation.style.marginTop = "16px";
        explanation.style.padding = "12px 16px";
        explanation.style.fontSize = "0.85rem";
        explanation.style.lineHeight = "1.4";
        explanation.style.borderColor = isCorrect ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
        explanation.textContent = q.explanation;
        
        optionsList.appendChild(explanation);
        nextBtn.style.display = "inline-flex";
    }
    
    nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
            loadQuestion();
        } else {
            showQuizResults();
        }
    });
    
    function showQuizResults() {
        progressLabel.textContent = "Test Completed";
        questionText.textContent = "Evaluation Results";
        
        let rankEvaluation = "";
        let evalIcon = "";
        
        if (score === 4) {
            rankEvaluation = "TDU Commander Material. Absolute operational excellence.";
            evalIcon = "fa-crown text-gold";
        } else if (score >= 2) {
            rankEvaluation = "Passing Cadet. Eligible for Academy entry.";
            evalIcon = "fa-shield-halved text-blue";
        } else {
            rankEvaluation = "Academy Dropout. Review manuals and re-evaluate.";
            evalIcon = "fa-circle-exclamation text-red";
        }
        
        optionsList.innerHTML = `
            <div class="quiz-results-container glass-panel" style="text-align: center; padding: 30px 10px; border-color: var(--accent-blue);">
                <i class="fa-solid ${evalIcon}" style="font-size: 3rem; margin-bottom: 16px;"></i>
                <h4 style="font-size: 1.5rem; margin-bottom: 8px;">Score: ${score} / ${QUIZ_QUESTIONS.length}</h4>
                <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.5;">${rankEvaluation}</p>
            </div>
            <button class="specular-btn w-full" id="quiz-btn-restart" style="margin-top: 16px;">
                <span>Restart Evaluation</span>
            </button>
        `;
        
        nextBtn.style.display = "none";
        
        document.getElementById("quiz-btn-restart").addEventListener("click", () => {
            currentQuestionIndex = 0;
            score = 0;
            loadQuestion();
        });
    }
    
    // Initial load
    loadQuestion();
}

// ==========================================
// Photo Gallery Lightbox Overlay
// ==========================================
function initGallery() {
    const container = document.getElementById("gallery-container");
    const modal = document.getElementById("gallery-modal-overlay");
    const modalImg = document.getElementById("modal-img-tag");
    const modalCaption = document.getElementById("modal-caption-tag");
    const closeBtn = document.getElementById("modal-close-btn");
    
    if (!container || !modal || !modalImg || !modalCaption || !closeBtn) return;
    
    container.innerHTML = GALLERY_ITEMS.map((item, idx) => `
        <div class="gallery-item glass-panel" data-index="${idx}">
            <img src="${item.src}" alt="${item.title}" onerror="this.src='https://cdn.discordapp.com/attachments/1272198605100552304/1531387240612233387/image.png?ex=6a690701&is=6a67b581&hm=0500262c309eccdfb4308d05919d2da4f7b506a6d0baa72c19a70f48755efaa0&'">
            <div class="gallery-overlay">
                <span class="gallery-tag">${item.tag}</span>
                <span class="gallery-title">${item.title}</span>
            </div>
        </div>
    `).join("");
    
    // Open image click
    container.querySelectorAll(".gallery-item").forEach(el => {
        el.addEventListener("click", () => {
            const idx = parseInt(el.getAttribute("data-index"));
            const item = GALLERY_ITEMS[idx];
            
            modal.style.display = "flex";
            modalImg.src = el.querySelector("img").src; // Uses actual source (supports generic fallbacks)
            modalCaption.textContent = item.title;
        });
    });
    
    // Close modal
    function closeModal() {
        modal.style.display = "none";
    }
    
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Keyboard support: ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    // Handle mock Cadet registration application submit
    const appForm = document.getElementById("tdu-application-form");
    const successMsg = document.getElementById("form-success-message");
    
    if (appForm && successMsg) {
        appForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Collect info
            const username = document.getElementById("input-roblox-user").value;
            const discord = document.getElementById("input-discord").value;
            const rank = document.getElementById("input-rank").value;
            
            console.log("Registered Packet:", { username, discord, rank });
            
            // Show alert
            appForm.classList.add("hidden");
            successMsg.classList.remove("hidden");
            
            // Automatically clear form fields and reset in 6 seconds
            setTimeout(() => {
                appForm.reset();
                appForm.classList.remove("hidden");
                successMsg.classList.add("hidden");
                
                // Recalculate caret positions for inputs
                initSmoothCaretInputs();
            }, 6000);
        });
    }
}
