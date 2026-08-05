(() => {
  const app = document.getElementById("typingApp");
  if (!app) return;

  const tool = app.dataset.tool || "typing-test";

  const setupEl = document.getElementById("typingSetup");
  const runEl = document.getElementById("typingRun");
  const resultsEl = document.getElementById("typingResults");
  const setupTitle = document.getElementById("typingSetupTitle");
  const setupCopy = document.getElementById("typingSetupCopy");
  const durationWrap = document.getElementById("typingDurationWrap");
  const durationsEl = document.getElementById("typingDurations");
  const startBtn = document.getElementById("typingStartBtn");
  const restartBtn = document.getElementById("typingRestartBtn");
  const againBtn = document.getElementById("typingAgainBtn");
  const skipBtn = document.getElementById("typingSkipBtn");

  const statTimer = document.getElementById("statTimer");
  const statWpm = document.getElementById("statWpm");
  const statWpmLabel = document.getElementById("statWpmLabel");
  const statAccuracy = document.getElementById("statAccuracy");
  const statProgress = document.getElementById("statProgress");
  const statProgressLabel = document.getElementById("statProgressLabel");

  const textWrap = document.getElementById("typingTextWrap");
  const textEl = document.getElementById("typingText");
  const inputEl = document.getElementById("typingInput");
  const promptCard = document.getElementById("typingPromptCard");
  const promptLabel = document.getElementById("typingPromptLabel");
  const promptValue = document.getElementById("typingPromptValue");
  const entryWrap = document.getElementById("typingEntryWrap");
  const entryInput = document.getElementById("typingEntryInput");
  const resultGrid = document.getElementById("typingResultGrid");
  const resultsTitle = document.getElementById("resultsTitle");

  const TYPING_DURATIONS = [
    { sec: 30, label: "30 sec" },
    { sec: 60, label: "1 min" },
    { sec: 120, label: "2 min" },
    { sec: 180, label: "3 min" },
    { sec: 240, label: "4 min" },
    { sec: 300, label: "5 min" },
    { sec: 600, label: "10 min" },
    { sec: 900, label: "15 min" },
    { sec: 1800, label: "30 min" },
  ];

  const PASSAGES = [
    "Practice makes progress. Keep your eyes on the next word, breathe evenly, and let your fingers find a steady rhythm. Accuracy first, then speed will follow as the patterns become familiar.",
    "Clear communication depends on careful typing. Check spelling, watch punctuation, and stay focused until the timer ends. Small improvements each day build lasting skill.",
    "Technology helps people work faster, but attention still matters. Type with intention, correct mistakes quickly, and finish strong without rushing into avoidable errors.",
    "A calm mind supports better results. Sit upright, relax your shoulders, and move through each sentence with confidence. Consistency beats bursts of speed that fade after a minute.",
    "Good habits create reliable performance. Warm up with short drills, review your accuracy, and challenge yourself with longer sessions when you are ready for more endurance.",
  ];

  const MIXED_CHUNKS = [
    "Order ID A7K- ob91 must ship by 14:30 with invoice #88421.",
    "Call 0300-4567891 and confirm code XR52-PL88 before 5 PM.",
    "Amount due: Rs 12,450.75 for account PK29-7781-3340.",
    "Enter SKU MTR-4402 qty 36 batch LOT9C and seal REF-Q17.",
    "Password hint: Blue7!river and PIN 492183 for vault B-12.",
    "Track parcel TN8849201 from Karachi to Lahore via route R-6.",
    "Employee #E1042 worked 7.5 hours on 03/18/2026 shift A.",
    "Mix letters and digits: a9B2 c4D8 e1F6 g3H0 i5J7 k2L9.",
  ];

  const FIRST_NAMES = ["Ayesha", "Hassan", "Fatima", "Omar", "Zainab", "Bilal", "Sana", "Usman", "Maryam", "Ali", "Noor", "Hamza", "Sara", "Imran", "Hina"];
  const LAST_NAMES = ["Khan", "Ahmed", "Ali", "Hussain", "Raza", "Malik", "Sheikh", "Iqbal", "Farooq", "Qureshi", "Siddiqui", "Butt"];
  const CITIES = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Rawalpindi", "Sialkot", "Hyderabad"];

  const state = {
    durationSec: tool === "data-entry-test" ? 120 : 60,
    running: false,
    startedAt: 0,
    endsAt: 0,
    timerId: 0,
    target: "",
    typed: "",
    correct: 0,
    incorrect: 0,
    entryIndex: 0,
    entries: [],
    entryCorrect: 0,
    entryWrong: 0,
    entrySkipped: 0,
  };

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }

  function randomDigits(len) {
    let out = "";
    for (let i = 0; i < len; i += 1) out += String(Math.floor(Math.random() * 10));
    return out;
  }

  function randomCode(groups, size) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const parts = [];
    for (let g = 0; g < groups; g += 1) {
      let chunk = "";
      for (let i = 0; i < size; i += 1) chunk += alphabet[Math.floor(Math.random() * alphabet.length)];
      parts.push(chunk);
    }
    return parts.join("-");
  }

  function buildPassage(kind) {
    if (kind === "mixed") {
      return shuffle(MIXED_CHUNKS).concat(shuffle(MIXED_CHUNKS)).join(" ");
    }
    const pool = shuffle(PASSAGES);
    let text = pool.join(" ");
    while (text.length < 2200) text += " " + pick(PASSAGES);
    return text;
  }

  function buildEntries(count) {
    const items = [];
    for (let i = 0; i < count; i += 1) {
      const roll = i % 7;
      if (roll === 0) {
        items.push({ label: "Full name", value: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` });
      } else if (roll === 1) {
        items.push({ label: "Phone number", value: `03${randomDigits(2)}-${randomDigits(7)}` });
      } else if (roll === 2) {
        items.push({ label: "CNIC / ID", value: `${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)}` });
      } else if (roll === 3) {
        items.push({ label: "Amount", value: `${(100 + Math.floor(Math.random() * 9900)).toLocaleString("en-US")}.${randomDigits(2)}` });
      } else if (roll === 4) {
        items.push({ label: "Account code", value: randomCode(3, 4) });
      } else if (roll === 5) {
        const d = 1 + Math.floor(Math.random() * 28);
        const m = 1 + Math.floor(Math.random() * 12);
        items.push({ label: "Date", value: `${pad(m)}/${pad(d)}/2026` });
      } else {
        items.push({ label: "City + code", value: `${pick(CITIES)} ${randomCode(1, 5)}` });
      }
    }
    return items;
  }

  function show(section) {
    setupEl.hidden = section !== "setup";
    runEl.hidden = section !== "run";
    resultsEl.hidden = section !== "results";
  }

  function setDurationButtons() {
    if (tool === "data-entry-test") {
      durationWrap.hidden = true;
      state.durationSec = 120;
      return;
    }

    durationWrap.hidden = false;
    durationsEl.innerHTML = "";
    TYPING_DURATIONS.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "typing-duration" + (item.sec === state.durationSec ? " is-active" : "");
      btn.textContent = item.label;
      btn.dataset.sec = String(item.sec);
      btn.addEventListener("click", () => {
        state.durationSec = item.sec;
        durationsEl.querySelectorAll(".typing-duration").forEach((el) => el.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
      durationsEl.appendChild(btn);
    });
  }

  function configureSetupCopy() {
    if (tool === "data-entry-test") {
      setupTitle.textContent = "120-second data entry";
      setupCopy.textContent = "Type each value exactly as shown, then press Enter. Score is based on correct entries.";
      startBtn.textContent = "Start 120s test";
      statWpmLabel.textContent = "EPM";
      statProgressLabel.textContent = "Correct";
    } else if (tool === "mixed-test") {
      setupTitle.textContent = "Mixed typing challenge";
      setupCopy.textContent = "Practice words, numbers, codes, and punctuation together. Choose your duration.";
      startBtn.textContent = "Start mixed test";
      statWpmLabel.textContent = "WPM";
      statProgressLabel.textContent = "Chars";
    } else {
      setupTitle.textContent = "Typing speed test";
      setupCopy.textContent = "Choose a duration from 30 seconds to 30 minutes, then type the passage.";
      startBtn.textContent = "Start typing test";
      statWpmLabel.textContent = "WPM";
      statProgressLabel.textContent = "Chars";
    }
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = 0;
    }
  }

  function elapsedMinutes() {
    const elapsedMs = Math.max(1, Date.now() - state.startedAt);
    return elapsedMs / 60000;
  }

  function liveWpm() {
    if (tool === "data-entry-test") {
      return Math.round(state.entryCorrect / elapsedMinutes());
    }
    return Math.round((state.correct / 5) / elapsedMinutes());
  }

  function liveAccuracy() {
    if (tool === "data-entry-test") {
      const total = state.entryCorrect + state.entryWrong;
      if (!total) return 100;
      return Math.max(0, Math.round((state.entryCorrect / total) * 100));
    }
    const total = state.correct + state.incorrect;
    if (!total) return 100;
    return Math.max(0, Math.round((state.correct / total) * 100));
  }

  function updateLiveStats() {
    const left = (state.endsAt - Date.now()) / 1000;
    statTimer.textContent = formatTime(left);
    statWpm.textContent = String(liveWpm());
    statAccuracy.textContent = `${liveAccuracy()}%`;
    if (tool === "data-entry-test") {
      statProgress.textContent = String(state.entryCorrect);
    } else {
      statProgress.textContent = String(state.typed.length);
    }
  }

  function renderPassage() {
    const chars = state.target.split("");
    const typed = state.typed;
    let html = "";
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i] === " " ? " " : chars[i];
      let cls = "ch";
      if (i < typed.length) {
        cls += typed[i] === chars[i] ? " is-ok" : " is-bad";
      } else if (i === typed.length) {
        cls += " is-current";
      }
      html += `<span class="${cls}">${ch === " " ? "&nbsp;" : escapeHtml(ch)}</span>`;
    }
    textEl.innerHTML = html;
    const current = textEl.querySelector(".is-current");
    current?.scrollIntoView({ block: "center", inline: "nearest" });
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function scoreTyped(value) {
    state.typed = value;
    let correct = 0;
    let incorrect = 0;
    const limit = Math.min(value.length, state.target.length);
    for (let i = 0; i < limit; i += 1) {
      if (value[i] === state.target[i]) correct += 1;
      else incorrect += 1;
    }
    state.correct = correct;
    state.incorrect = incorrect;
    renderPassage();
    updateLiveStats();
    if (value.length >= state.target.length) {
      state.target += " " + buildPassage(tool === "mixed-test" ? "mixed" : "typing");
      renderPassage();
    }
  }

  function showEntry() {
    const item = state.entries[state.entryIndex];
    if (!item) {
      finishTest();
      return;
    }
    promptLabel.textContent = item.label;
    promptValue.textContent = item.value;
    entryInput.value = "";
    entryInput.focus();
    updateLiveStats();
  }

  function normalizeEntry(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function submitEntry(skipped) {
    if (!state.running) return;
    const item = state.entries[state.entryIndex];
    if (!item) return;

    if (skipped) {
      state.entrySkipped += 1;
    } else {
      const typed = normalizeEntry(entryInput.value);
      const expected = normalizeEntry(item.value);
      if (typed && typed === expected) state.entryCorrect += 1;
      else state.entryWrong += 1;
    }

    state.entryIndex += 1;
    showEntry();
  }

  function finishTest() {
    if (!state.running) return;
    state.running = false;
    clearTimer();
    inputEl.blur();
    entryInput.blur();

    const minutes = Math.max(state.durationSec / 60, elapsedMinutes());
    const wpm = tool === "data-entry-test"
      ? Math.round(state.entryCorrect / minutes)
      : Math.round((state.correct / 5) / minutes);
    const accuracy = liveAccuracy();

    let title = "Test complete";
    if (accuracy >= 95 && wpm >= 40) title = "Excellent result";
    else if (accuracy >= 90) title = "Strong accuracy";
    else if (wpm >= 35) title = "Solid speed";
    resultsTitle.textContent = title;

    const cards = tool === "data-entry-test"
      ? [
          { label: "Correct entries", value: String(state.entryCorrect) },
          { label: "Entries / min", value: String(wpm) },
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Wrong", value: String(state.entryWrong) },
          { label: "Skipped", value: String(state.entrySkipped) },
          { label: "Duration", value: formatTime(state.durationSec) },
        ]
      : [
          { label: "WPM", value: String(wpm) },
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Correct chars", value: String(state.correct) },
          { label: "Errors", value: String(state.incorrect) },
          { label: "Typed", value: String(state.typed.length) },
          { label: "Duration", value: formatTime(state.durationSec) },
        ];

    resultGrid.innerHTML = cards
      .map((card) => `<div class="typing-result-card"><strong>${card.value}</strong><span>${card.label}</span></div>`)
      .join("");

    show("results");
  }

  function startTest() {
    clearTimer();
    state.running = true;
    state.startedAt = Date.now();
    state.endsAt = state.startedAt + state.durationSec * 1000;
    state.typed = "";
    state.correct = 0;
    state.incorrect = 0;
    state.entryIndex = 0;
    state.entryCorrect = 0;
    state.entryWrong = 0;
    state.entrySkipped = 0;

    const isEntry = tool === "data-entry-test";
    promptCard.hidden = !isEntry;
    entryWrap.hidden = !isEntry;
    textWrap.hidden = isEntry;

    if (isEntry) {
      state.entries = buildEntries(120);
      show("run");
      showEntry();
    } else {
      state.target = buildPassage(tool === "mixed-test" ? "mixed" : "typing");
      inputEl.value = "";
      show("run");
      renderPassage();
      inputEl.focus();
    }

    updateLiveStats();
    state.timerId = setInterval(() => {
      if (Date.now() >= state.endsAt) {
        finishTest();
        return;
      }
      updateLiveStats();
    }, 200);
  }

  function resetToSetup() {
    clearTimer();
    state.running = false;
    inputEl.value = "";
    entryInput.value = "";
    show("setup");
  }

  inputEl.addEventListener("input", () => {
    if (!state.running || tool === "data-entry-test") return;
    scoreTyped(inputEl.value);
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Tab") event.preventDefault();
  });

  entryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitEntry(false);
    }
  });

  skipBtn?.addEventListener("click", () => submitEntry(true));
  startBtn.addEventListener("click", startTest);
  restartBtn.addEventListener("click", startTest);
  againBtn.addEventListener("click", resetToSetup);

  configureSetupCopy();
  setDurationButtons();
  show("setup");
})();
