(() => {
  const app = document.getElementById("typingApp");
  if (!app) return;

  const tool = app.dataset.tool || "typing-test";
  const isTyping = tool === "typing-test";
  const isEntry = tool === "data-entry-test";
  const isMixed = tool === "mixed-test";

  const setupEl = document.getElementById("typingSetup");
  const runEl = document.getElementById("typingRun");
  const resultsEl = document.getElementById("typingResults");
  const setupTitle = document.getElementById("typingSetupTitle");
  const setupCopy = document.getElementById("typingSetupCopy");
  const durationWrap = document.getElementById("typingDurationWrap");
  const durationLabel = document.getElementById("typingDurationLabel");
  const durationsEl = document.getElementById("typingDurations");
  const modeWrap = document.getElementById("typingModeWrap");
  const paragraphWrap = document.getElementById("typingParagraphWrap");
  const paragraphList = document.getElementById("typingParagraphList");
  const paragraphPreview = document.getElementById("typingParagraphPreview");
  const paragraphPreviewText = document.getElementById("typingParagraphPreviewText");
  const startBtn = document.getElementById("typingStartBtn");
  const restartBtn = document.getElementById("typingRestartBtn");
  const againBtn = document.getElementById("typingAgainBtn");
  const skipBtn = document.getElementById("typingSkipBtn");

  const statTimer = document.getElementById("statTimer");
  const statWpm = document.getElementById("statWpm");
  const statWpmLabel = document.getElementById("statWpmLabel");
  const statAccuracy = document.getElementById("statAccuracy");
  const statAccuracyLabel = document.getElementById("statAccuracyLabel");
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

  const mcqWrap = document.getElementById("mcqWrap");
  const mcqCat = document.getElementById("mcqCat");
  const mcqCount = document.getElementById("mcqCount");
  const mcqImage = document.getElementById("mcqImage");
  const mcqQuestion = document.getElementById("mcqQuestion");
  const mcqOptions = document.getElementById("mcqOptions");
  const mcqNextBtn = document.getElementById("mcqNextBtn");
  const mcqSkipBtn = document.getElementById("mcqSkipBtn");

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

  const ENTRY_DURATIONS = [
    { sec: 60, label: "60 sec" },
    { sec: 120, label: "120 sec" },
  ];

  const MIXED_DURATIONS = [
    { sec: 300, label: "5 min", questions: 12 },
    { sec: 600, label: "10 min", questions: 20 },
    { sec: 900, label: "15 min", questions: 28 },
    { sec: 1200, label: "20 min", questions: 40 },
    { sec: 1800, label: "30 min", questions: 60 },
  ];

  const MIXED_CATEGORIES = ["Grammar", "Mathematics", "Images", "Critical Thinking"];

  // Random-mode passages (different from the custom paragraph list).
  const PASSAGES = [
    "Practice makes progress. Keep your eyes on the next word, breathe evenly, and let your fingers find a steady rhythm. Accuracy first, then speed will follow as the patterns become familiar.",
    "Clear communication depends on careful typing. Check spelling, watch punctuation, and stay focused until the timer ends. Small improvements each day build lasting skill.",
    "Technology helps people work faster, but attention still matters. Type with intention, correct mistakes quickly, and finish strong without rushing into avoidable errors.",
    "A calm mind supports better results. Sit upright, relax your shoulders, and move through each sentence with confidence. Consistency beats bursts of speed that fade after a minute.",
    "Good habits create reliable performance. Warm up with short drills, review your accuracy, and challenge yourself with longer sessions when you are ready for more endurance.",
    "Speed without control creates more corrections than progress. Train yourself to notice each space and capital letter. Clean text is easier to review and more useful in real work.",
    "When the timer starts, resist the urge to glance at the clock every few seconds. Stay with the current sentence, finish the thought, and trust your pace to settle naturally.",
    "Keyboard shortcuts save time after typing practice becomes comfortable. Learn a few useful combinations, keep wrists relaxed, and avoid slamming keys when you feel rushed.",
  ];

  const CUSTOM_PARAGRAPHS = [
    { title: "Morning routine", text: "Every morning begins with a quiet plan. Drink water, stretch lightly, and write three goals for the day. A simple routine reduces stress and helps you start with clear focus before emails and meetings fill the calendar." },
    { title: "City library", text: "The old city library smells of paper and wood polish. Students fill the long tables near the windows, while visitors whisper between tall shelves. Outside, buses pass, but inside time seems slower and kinder to careful reading." },
    { title: "Market visit", text: "At the fruit market, vendors arrange bright oranges in neat rows. Customers compare prices, ask for fresh boxes, and carry heavy bags toward waiting rickshaws. The air is sweet, crowded, and full of quick conversations." },
    { title: "Team project", text: "Successful teams share updates early and solve problems together. Assign roles clearly, set deadlines that people can meet, and review progress twice a week. Honest feedback saves time and builds trust across the group." },
    { title: "Digital skills", text: "Learning digital skills opens doors in almost every career. Practice typing, spreadsheets, and clear email writing. Small daily lessons compound into confidence, and confidence makes new software feel less intimidating." },
    { title: "River walk", text: "Along the river path, cyclists glide past joggers and families. Willow branches lean toward the water as ducks drift in quiet circles. Evening light turns the surface gold and invites a slower walk home." },
    { title: "Office etiquette", text: "Good office etiquette is mostly consideration. Arrive prepared, keep shared spaces tidy, and reply to messages within a reasonable time. Courtesy costs little, yet it improves the mood of an entire workplace." },
    { title: "Science fair", text: "The school science fair turned the hall into a maze of posters and models. One booth explained water filters; another showed a tiny robot following a black line. Judges asked short questions and smiled at creative answers." },
    { title: "Travel tips", text: "Before a long trip, pack light and label your bags. Keep documents in one safe place, charge your phone fully, and note emergency contacts. Calm preparation turns travel delays into manageable pauses rather than crises." },
    { title: "Healthy habits", text: "Health grows from ordinary choices repeated often. Sleep enough, walk after meals, and choose water more than sugary drinks. You do not need perfection; you need steady habits that your future self will thank you for." },
    { title: "Customer service", text: "Excellent customer service starts with listening. Let the person finish, confirm the issue in simple words, and offer a clear next step. A respectful tone can turn a complaint into a lasting relationship." },
    { title: "Garden care", text: "A small garden rewards patience. Water early, remove weeds before they spread, and give each plant enough space. After rain, the soil darkens and the leaves shine, reminding you that care always shows." },
    { title: "Public speaking", text: "Public speaking improves with rehearsal. Know your opening line, pause after key points, and look at the audience rather than your notes. Nervous energy can become useful energy when you breathe and begin." },
    { title: "Online learning", text: "Online courses work best with a schedule. Mute distractions, take notes by hand when possible, and review one lesson before starting the next. Progress feels faster when study sessions stay short and consistent." },
    { title: "Bank visit", text: "Inside the bank, people wait in a quiet line holding forms and tokens. Counters open one by one, printers hum, and staff verify signatures carefully. Accuracy matters more than speed when money and records are involved." },
    { title: "Rainy afternoon", text: "Rain taps the windows and softens the noise of the street. Cups of tea appear on desks, umbrellas drip in the hallway, and plans change without much argument. A rainy afternoon is perfect for unfinished reading." },
    { title: "Job interview", text: "Prepare for an interview by researching the company and practicing clear examples. Dress neatly, arrive early, and answer with honesty. When you do not know something, say so and explain how you would find out." },
    { title: "Community cleanup", text: "Neighbors gathered early for the community cleanup. Gloves, bags, and brooms were shared along the roadside. By noon the litter was gone, the park looked brighter, and everyone felt proud of a job done together." },
    { title: "Time management", text: "Time management is choosing what matters most. List tasks, block deep-work hours, and protect short breaks. When interruptions arrive, note them and return to the plan instead of chasing every new request." },
    { title: "Night study", text: "Night study can work if you keep it disciplined. Dim harsh lights, silence notifications, and set a stopping time. Review summaries before sleep so your mind continues organizing ideas while you rest." },
  ];

  const FIRST_NAMES = ["Ayesha", "Hassan", "Fatima", "Omar", "Zainab", "Bilal", "Sana", "Usman", "Maryam", "Ali", "Noor", "Hamza", "Sara", "Imran", "Hina"];
  const LAST_NAMES = ["Khan", "Ahmed", "Ali", "Hussain", "Raza", "Malik", "Sheikh", "Iqbal", "Farooq", "Qureshi", "Siddiqui", "Butt"];
  const CITIES = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Rawalpindi", "Sialkot", "Hyderabad"];
  const STREET_NAMES = [
    "Main Boulevard Gulberg",
    "Shahrah-e-Faisal Block",
    "Jail Road Extension",
    "University Avenue North",
    "Mall Road Near Liberty",
    "Clifton Block Five Street",
    "Blue Area Sector G",
    "Canal Bank Road East",
    "Satellite Town Market Lane",
    "Garden Town Service Road",
    "I-8 Markaz Street Twelve",
    "Bahadurabad Nishter Road",
    "DHA Phase Six Avenue",
    "Saddar Circular Road West",
    "Allama Iqbal Town Street",
    "Model Town Link Road",
    "F-10 Markaz Street Four",
    "Tariq Road Commercial Plaza",
    "Gulshan-e-Iqbal Block Two",
    "Cantt Station Approach Road",
  ];
  const SENTENCE_BANK = [
    "Verify details",
    "Submit form",
    "Urgent delivery",
    "Keep receipt",
    "Update address",
    "Confirm payment",
    "Check code",
    "Print invoice",
    "Call branch",
    "Enter number",
    "Review balance",
    "Lock cabinet",
    "Schedule meeting",
    "Replace stock",
    "Notify manager",
    "Save file",
    "Open folder",
    "Send copy",
    "Clear desk",
    "Sign here",
  ];
  const MIXED_PHRASES = [
    "Parcel XR-4412 delayed at warehouse gate",
    "Token 78B queued for counter three today",
    "Room 204 keys returned after evening shift",
    "Batch LOT9C sealed with red tape strip",
    "File Case-19 moved to archive shelf B",
    "Visitor pass VP-330 expires at six pm",
    "Order mix A7 and B12 packed together",
    "Route R6 via Ring Road then exit 4",
    "Shift A staff signed in by 08:45 sharp",
    "Vault PIN check failed twice then locked",
  ];

  const MCQ_BANK = [
    // Grammar
    { cat: "Grammar", q: "Choose the correct spelling.", options: ["Accomodation", "Accommodation", "Acommodation", "Accomadation"], answer: 1 },
    { cat: "Grammar", q: "Synonym of \"rapid\" is:", options: ["Slow", "Quick", "Heavy", "Quiet"], answer: 1 },
    { cat: "Grammar", q: "Antonym of \"scarce\" is:", options: ["Rare", "Limited", "Abundant", "Tiny"], answer: 2 },
    { cat: "Grammar", q: "Fill in the blank: She ____ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
    { cat: "Grammar", q: "Which sentence is grammatically correct?", options: ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", "He not like tea."], answer: 2 },
    { cat: "Grammar", q: "\"Benevolent\" most nearly means:", options: ["Angry", "Kind", "Confused", "Lazy"], answer: 1 },
    { cat: "Grammar", q: "Choose the correct article: ____ honest man.", options: ["A", "An", "The", "No article"], answer: 1 },
    { cat: "Grammar", q: "Plural of \"crisis\" is:", options: ["Crisises", "Crisis", "Crises", "Crisies"], answer: 2 },
    { cat: "Grammar", q: "Identify the noun in: \"Courage wins respect.\"", options: ["Wins", "Courage", "Respectfully", "The"], answer: 1 },
    { cat: "Grammar", q: "Which word is a verb?", options: ["Beautiful", "Happiness", "Decide", "Quickly"], answer: 2 },
    { cat: "Grammar", q: "Choose the correct form: They ____ finished the work.", options: ["has", "have", "having", "is"], answer: 1 },
    { cat: "Grammar", q: "Which is a correct comparative?", options: ["more better", "better", "most better", "goodest"], answer: 1 },
    { cat: "Grammar", q: "Select the correct preposition: He is good ____ maths.", options: ["in", "at", "on", "by"], answer: 1 },
    { cat: "Grammar", q: "Passive voice of \"She writes a letter\":", options: ["A letter wrote she.", "A letter is written by her.", "A letter was write by her.", "She is written a letter."], answer: 1 },
    { cat: "Grammar", q: "Find the adjective: \"The bright lamp lit the room.\"", options: ["lamp", "bright", "lit", "room"], answer: 1 },

    // Mathematics
    { cat: "Mathematics", q: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: 2 },
    { cat: "Mathematics", q: "Simplify: 8 × (3 + 2) − 6", options: ["34", "40", "28", "30"], answer: 0 },
    { cat: "Mathematics", q: "If a train travels 90 km in 1.5 hours, its speed is:", options: ["45 km/h", "55 km/h", "60 km/h", "75 km/h"], answer: 2 },
    { cat: "Mathematics", q: "Average of 10, 20, 30, 40 is:", options: ["20", "25", "30", "35"], answer: 1 },
    { cat: "Mathematics", q: "Square root of 144 is:", options: ["10", "11", "12", "14"], answer: 2 },
    { cat: "Mathematics", q: "Solve: 3x = 27. What is x?", options: ["6", "7", "8", "9"], answer: 3 },
    { cat: "Mathematics", q: "A shop gives 10% discount on 500. Sale price is:", options: ["450", "460", "480", "490"], answer: 0 },
    { cat: "Mathematics", q: "LCM of 4 and 6 is:", options: ["8", "10", "12", "24"], answer: 2 },
    { cat: "Mathematics", q: "If 5 pens cost 40, one pen costs:", options: ["6", "7", "8", "9"], answer: 2 },
    { cat: "Mathematics", q: "Perimeter of a square with side 9 is:", options: ["18", "27", "36", "81"], answer: 2 },

    // Images
    {
      cat: "Images",
      q: "How many triangles are clearly shown in the figure?",
      image: "triangles",
      options: ["2", "3", "4", "5"],
      answer: 1,
    },
    {
      cat: "Images",
      q: "Which shape is different from the others?",
      image: "odd-shape",
      options: ["Circle A", "Circle B", "Square C", "Circle D"],
      answer: 2,
    },
    {
      cat: "Images",
      q: "What comes next in the sequence?",
      image: "seq-dots",
      options: ["1 dot", "4 dots", "5 dots", "6 dots"],
      answer: 2,
    },
    {
      cat: "Images",
      q: "Count the shaded squares.",
      image: "shaded",
      options: ["2", "3", "4", "5"],
      answer: 2,
    },
    {
      cat: "Images",
      q: "Which arrow points in a different direction?",
      image: "arrows",
      options: ["Arrow 1", "Arrow 2", "Arrow 3", "Arrow 4"],
      answer: 2,
    },
    {
      cat: "Images",
      q: "Find the missing number in the pattern shown.",
      image: "num-circle",
      options: ["8", "9", "10", "12"],
      answer: 1,
    },
    {
      cat: "Images",
      q: "Which figure completes the set (all have 3 sides)?",
      image: "polygon-set",
      options: ["Circle", "Triangle", "Square", "Pentagon"],
      answer: 1,
    },
    {
      cat: "Images",
      q: "How many circles appear in the image?",
      image: "circles",
      options: ["3", "4", "5", "6"],
      answer: 2,
    },

    // Critical thinking
    { cat: "Critical Thinking", q: "All roses are flowers. Some flowers fade quickly. Which statement must be true?", options: ["All roses fade quickly.", "Some roses may fade quickly.", "No rose is a flower.", "Flowers are never roses."], answer: 1 },
    { cat: "Critical Thinking", q: "If today is Monday, what day was it 3 days ago?", options: ["Thursday", "Friday", "Saturday", "Sunday"], answer: 1 },
    { cat: "Critical Thinking", q: "A is taller than B. B is taller than C. Who is shortest?", options: ["A", "B", "C", "Cannot say"], answer: 2 },
    { cat: "Critical Thinking", q: "Find the odd one out: Apple, Banana, Carrot, Mango", options: ["Apple", "Banana", "Carrot", "Mango"], answer: 2 },
    { cat: "Critical Thinking", q: "If all pencils are made of wood, and this object is a pencil, then:", options: ["It may be plastic.", "It is made of wood.", "It is an eraser.", "It cannot write."], answer: 1 },
    { cat: "Critical Thinking", q: "Series: 2, 4, 8, 16, ?", options: ["18", "24", "32", "30"], answer: 2 },
    { cat: "Critical Thinking", q: "If BOOK is coded as CPPL, then PEN is:", options: ["QFO", "QDO", "ODM", "QFP"], answer: 0 },
    { cat: "Critical Thinking", q: "Which assumption is needed? \"Buy this medicine to get well soon.\"", options: ["The medicine is free.", "The medicine can help recovery.", "All illnesses need surgery.", "Doctors are unavailable."], answer: 1 },
    { cat: "Critical Thinking", q: "Statement: Only trained staff may enter. Ali is trained. Conclusion:", options: ["Ali must enter.", "Ali may enter.", "Ali cannot enter.", "No one may enter."], answer: 1 },
    { cat: "Critical Thinking", q: "If 1=3, 2=3, 3=5, 4=4, 5=4, then 6=?", options: ["3", "4", "5", "6"], answer: 0 },
  ];

  const state = {
    durationSec: isEntry ? 60 : isMixed ? 600 : 60,
    textMode: "random", // typing-test only: random | custom
    paragraphIndex: 0,
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
    entryChars: 0,
    questions: [],
    qIndex: 0,
    selectedOption: null,
    mcqCorrect: 0,
    mcqWrong: 0,
    mcqSkipped: 0,
    byCat: {},
    timerStarted: false,
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

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function normalizeTypingText(value) {
    return String(value || "")
      .normalize("NFC")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u00A0\u202F\u2007\u2009\u200A\u2008]/g, " ")
      .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
      .replace(/\u2026/g, "...")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\t/g, " ");
  }

  function charsMatch(a, b) {
    if (a === b) return true;
    // Treat any whitespace as a regular space so Enter/nbsp mismatches do not go red.
    if (/\s/.test(a) && /\s/.test(b)) return true;
    return normalizeTypingText(a) === normalizeTypingText(b);
  }

  function usingCustomParagraph() {
    return isTyping && state.textMode === "custom";
  }

  function buildPassage() {
    if (usingCustomParagraph()) {
      const base = normalizeTypingText(CUSTOM_PARAGRAPHS[state.paragraphIndex]?.text || CUSTOM_PARAGRAPHS[0].text);
      let text = base;
      while (text.length < 6000) text += " " + base;
      return text;
    }
    const pool = shuffle(PASSAGES.map(normalizeTypingText));
    let text = pool.join(" ");
    while (text.length < 6000) text += " " + pick(pool);
    return text;
  }

  function buildEntries(count) {
    const items = [];
    // Fixed repeating order: Alphabetic → CNIC → Street → Sentence → Mixed (letters+numbers).
    const sequence = ["alpha", "cnic", "street", "sentence", "mixed"];

    for (let i = 0; i < count; i += 1) {
      const roll = sequence[i % sequence.length];

      if (roll === "alpha") {
        const alphaPool = [
          `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
          `${pick(FIRST_NAMES)} ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
          `${pick(CITIES)} Branch Office`,
          `Dear ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
          `${pick(LAST_NAMES)} Trading Company`,
        ];
        items.push({ label: "Alphabetic", value: pick(alphaPool) });
      } else if (roll === "cnic") {
        items.push({
          label: "CNIC",
          value: `${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)}`,
        });
      } else if (roll === "street") {
        items.push({ label: "Street name", value: pick(STREET_NAMES) });
      } else if (roll === "sentence") {
        items.push({ label: "Sentence", value: pick(SENTENCE_BANK) });
      } else {
        const mixedPool = [
          ...MIXED_PHRASES,
          `CNIC ${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)} ${pick(LAST_NAMES)}`,
          `Plot ${randomDigits(2)}-${randomCode(1, 2)} ${pick(STREET_NAMES)}`,
          `Invoice INV-${randomDigits(4)} for ${pick(FIRST_NAMES)}`,
          `Box ${randomDigits(3)}A on ${pick(STREET_NAMES)}`,
          `Ref ${randomCode(2, 3)} amount ${randomDigits(4)}.${randomDigits(2)}`,
          `Flat ${randomDigits(2)}-${randomCode(1, 1)} ${pick(CITIES)} ${randomDigits(5)}`,
          `Token ${randomDigits(3)}${randomCode(1, 1)} at counter ${randomDigits(1)}`,
          `SKU-${randomCode(1, 3)}-${randomDigits(4)} qty ${randomDigits(2)}`,
        ];
        items.push({ label: "Mixed letters & numbers", value: pick(mixedPool) });
      }
    }

    return items;
  }

  function renderMcqImage(kind) {
    const svgs = {
      triangles: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg"><polygon points="40,100 110,20 180,100" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="70,100 110,45 150,100" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="90,100 110,70 130,100" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
      "odd-shape": `<svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="3"/><text x="35" y="55" text-anchor="middle" font-size="14" fill="currentColor">A</text><circle cx="95" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="3"/><text x="95" y="55" text-anchor="middle" font-size="14" fill="currentColor">B</text><rect x="138" y="28" width="44" height="44" fill="none" stroke="currentColor" stroke-width="3"/><text x="160" y="55" text-anchor="middle" font-size="14" fill="currentColor">C</text><circle cx="225" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="3"/><text x="225" y="55" text-anchor="middle" font-size="14" fill="currentColor">D</text></svg>`,
      "seq-dots": `<svg viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="45" r="6" fill="currentColor"/><circle cx="90" cy="30" r="6" fill="currentColor"/><circle cx="90" cy="60" r="6" fill="currentColor"/><circle cx="150" cy="20" r="6" fill="currentColor"/><circle cx="150" cy="45" r="6" fill="currentColor"/><circle cx="150" cy="70" r="6" fill="currentColor"/><circle cx="210" cy="15" r="6" fill="currentColor"/><circle cx="210" cy="35" r="6" fill="currentColor"/><circle cx="210" cy="55" r="6" fill="currentColor"/><circle cx="210" cy="75" r="6" fill="currentColor"/><text x="250" y="50" font-size="28" fill="currentColor">?</text></svg>`,
      shaded: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" fill="currentColor" opacity=".85"/><rect x="60" y="10" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/><rect x="110" y="10" width="40" height="40" fill="currentColor" opacity=".85"/><rect x="10" y="60" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/><rect x="60" y="60" width="40" height="40" fill="currentColor" opacity=".85"/><rect x="110" y="60" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10" y="110" width="40" height="40" fill="currentColor" opacity=".85"/><rect x="60" y="110" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/><rect x="110" y="110" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
      arrows: `<svg viewBox="0 0 280 80" xmlns="http://www.w3.org/2000/svg"><path d="M20 40h40l-10-12M60 40l-10 12" fill="none" stroke="currentColor" stroke-width="3"/><text x="40" y="70" text-anchor="middle" font-size="12" fill="currentColor">1</text><path d="M90 40h40l-10-12M130 40l-10 12" fill="none" stroke="currentColor" stroke-width="3"/><text x="110" y="70" text-anchor="middle" font-size="12" fill="currentColor">2</text><path d="M200 40h-40l10-12M160 40l10 12" fill="none" stroke="currentColor" stroke-width="3"/><text x="180" y="70" text-anchor="middle" font-size="12" fill="currentColor">3</text><path d="M230 40h40l-10-12M270 40l-10 12" fill="none" stroke="currentColor" stroke-width="3"/><text x="250" y="70" text-anchor="middle" font-size="12" fill="currentColor">4</text></svg>`,
      "num-circle": `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg"><circle cx="110" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="3"/><text x="110" y="40" text-anchor="middle" font-size="16" fill="currentColor">3</text><text x="145" y="70" text-anchor="middle" font-size="16" fill="currentColor">5</text><text x="110" y="95" text-anchor="middle" font-size="16" fill="currentColor">7</text><text x="75" y="70" text-anchor="middle" font-size="16" fill="currentColor">?</text><text x="110" y="68" text-anchor="middle" font-size="14" fill="currentColor">+2</text></svg>`,
      "polygon-set": `<svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg"><polygon points="40,80 60,30 80,80" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="110,80 140,30 170,80" fill="none" stroke="currentColor" stroke-width="3"/><rect x="200" y="28" width="40" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="5 4"/><text x="220" y="58" text-anchor="middle" font-size="18" fill="currentColor">?</text></svg>`,
      circles: `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="110" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="170" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="80" cy="85" r="18" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="140" cy="85" r="18" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
    };
    return svgs[kind] || "";
  }

  function show(section) {
    setupEl.hidden = section !== "setup";
    runEl.hidden = section !== "run";
    resultsEl.hidden = section !== "results";
  }

  function setDurationButtons() {
    durationWrap.hidden = false;
    durationLabel.textContent = isMixed ? "Test time" : isEntry ? "Time limit" : "Duration";
    const list = isMixed ? MIXED_DURATIONS : isEntry ? ENTRY_DURATIONS : TYPING_DURATIONS;
    if (!list.some((item) => item.sec === state.durationSec)) {
      state.durationSec = list[0].sec;
    }

    durationsEl.innerHTML = "";
    list.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "typing-duration" + (item.sec === state.durationSec ? " is-active" : "");
      btn.textContent = item.questions ? `${item.label} · ${item.questions} Q` : item.label;
      btn.addEventListener("click", () => {
        state.durationSec = item.sec;
        durationsEl.querySelectorAll(".typing-duration").forEach((el) => el.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (isMixed) updateMixedSetupHint();
        if (isEntry) updateEntrySetupHint();
      });
      durationsEl.appendChild(btn);
    });
  }

  function updateEntrySetupHint() {
    if (!isEntry) return;
    const sec = state.durationSec;
    setupTitle.textContent = "Data entry test";
    setupCopy.textContent = `Choose ${sec} seconds. Order repeats: Alphabetic → CNIC → Street → Sentence → Mixed letters & numbers. Press Enter after each.`;
    startBtn.textContent = `Start ${sec}s data entry`;
  }

  function mixedQuestionCount() {
    const match = MIXED_DURATIONS.find((item) => item.sec === state.durationSec);
    if (match?.questions) return match.questions;
    // Fallback: 2 per minute, rounded down to a multiple of 4 for equal categories.
    const raw = Math.max(8, Math.round((state.durationSec / 60) * 2));
    return Math.max(8, raw - (raw % 4));
  }

  function updateMixedSetupHint() {
    if (!isMixed) return;
    const count = mixedQuestionCount();
    const mins = Math.round(state.durationSec / 60);
    setupCopy.textContent = `${mins} minutes = ${count} questions — equal share for Grammar, Maths, Images, and Critical Thinking (${count / 4} each).`;
    startBtn.textContent = `Start ${count}-question test`;
  }

  function setTextMode(mode) {
    state.textMode = mode === "custom" ? "custom" : "random";
    modeWrap?.querySelectorAll(".typing-mode-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.mode === state.textMode);
    });
    setParagraphPicker();
    startBtn.textContent = usingCustomParagraph() ? "Start with selected paragraph" : "Start typing test";
  }

  function setParagraphPicker() {
    if (!paragraphWrap) return;
    if (!usingCustomParagraph()) {
      paragraphWrap.hidden = true;
      return;
    }

    paragraphWrap.hidden = false;
    if (!paragraphList) return;
    paragraphList.innerHTML = "";

    CUSTOM_PARAGRAPHS.forEach((para, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "typing-paragraph-item" + (index === state.paragraphIndex ? " is-active" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", index === state.paragraphIndex ? "true" : "false");
      btn.innerHTML = `<strong>${index + 1}. ${escapeHtml(para.title)}</strong><span>${escapeHtml(para.text.slice(0, 72))}…</span>`;
      btn.addEventListener("click", () => {
        state.paragraphIndex = index;
        paragraphList.querySelectorAll(".typing-paragraph-item").forEach((el) => {
          el.classList.remove("is-active");
          el.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        updateParagraphPreview();
      });
      paragraphList.appendChild(btn);
    });
    updateParagraphPreview();
  }

  function updateParagraphPreview() {
    const para = CUSTOM_PARAGRAPHS[state.paragraphIndex];
    if (!para || !paragraphPreview || !paragraphPreviewText) return;
    paragraphPreview.hidden = false;
    paragraphPreviewText.textContent = para.text;
  }

  function configureSetupCopy() {
    if (isEntry) {
      updateEntrySetupHint();
      statWpmLabel.textContent = "EPM";
      statAccuracyLabel.textContent = "Accuracy";
      statProgressLabel.textContent = "Attempted";
    } else if (isMixed) {
      setupTitle.textContent = "Critical thinking test";
      updateMixedSetupHint();
      statWpmLabel.textContent = "Score";
      statAccuracyLabel.textContent = "Accuracy";
      statProgressLabel.textContent = "Answered";
    } else {
      setupTitle.textContent = "Typing speed test";
      setupCopy.textContent = "Choose duration, then use Random text or Custom paragraph. The timer starts when you type the first character.";
      startBtn.textContent = "Start typing test";
      statWpmLabel.textContent = "WPM";
      statAccuracyLabel.textContent = "Accuracy";
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
    if (!state.timerStarted || !state.startedAt) return 1 / 60;
    return Math.max(1, Date.now() - state.startedAt) / 60000;
  }

  function liveWpm() {
    if (isEntry) return Math.round(state.entryCorrect / elapsedMinutes());
    if (isMixed) return state.mcqCorrect;
    return Math.round(state.correct / 5 / elapsedMinutes());
  }

  function liveAccuracy() {
    if (isEntry) {
      const total = state.entryCorrect + state.entryWrong;
      return total ? Math.max(0, Math.round((state.entryCorrect / total) * 100)) : 0;
    }
    if (isMixed) {
      const total = state.mcqCorrect + state.mcqWrong;
      return total ? Math.max(0, Math.round((state.mcqCorrect / total) * 100)) : 100;
    }
    const total = state.correct + state.incorrect;
    return total ? Math.max(0, Math.round((state.correct / total) * 100)) : 100;
  }

  function updateLiveStats() {
    if (isTyping && !state.timerStarted) {
      statTimer.textContent = formatTime(state.durationSec);
    } else {
      const left = (state.endsAt - Date.now()) / 1000;
      statTimer.textContent = formatTime(left);
    }
    statWpm.textContent = String(state.timerStarted || isEntry || isMixed ? liveWpm() : 0);
    statAccuracy.textContent = `${liveAccuracy()}%`;
    if (isEntry) {
      statProgress.textContent = String(state.entryCorrect + state.entryWrong + state.entrySkipped);
    } else if (isMixed) {
      statProgress.textContent = String(state.mcqCorrect + state.mcqWrong + state.mcqSkipped);
    } else {
      statProgress.textContent = String(state.correct);
    }
  }

  function beginTypingTimer() {
    if (state.timerStarted || !state.running) return;
    state.timerStarted = true;
    state.startedAt = Date.now();
    state.endsAt = state.startedAt + state.durationSec * 1000;
    clearTimer();
    state.timerId = setInterval(() => {
      if (Date.now() >= state.endsAt) {
        finishTest();
        return;
      }
      updateLiveStats();
    }, 200);
    updateLiveStats();
  }

  function renderPassage() {
    const chars = Array.from(state.target);
    const typed = Array.from(state.typed);
    let html = "";
    for (let i = 0; i < chars.length; i += 1) {
      let cls = "ch";
      if (i < typed.length) cls += charsMatch(typed[i], chars[i]) ? " is-ok" : " is-bad";
      else if (i === typed.length) cls += " is-current";
      const ch = chars[i];
      // Use a normal space so lines can wrap. &nbsp; forced one endless horizontal line.
      html += `<span class="${cls}">${ch === " " ? " " : escapeHtml(ch)}</span>`;
    }
    textEl.innerHTML = html;
    const current = textEl.querySelector(".is-current");
    if (current && textEl.scrollHeight > textEl.clientHeight) {
      const top = current.offsetTop - textEl.clientHeight / 2;
      textEl.scrollTop = Math.max(0, top);
    }
  }

  function scoreTyped(rawValue) {
    const value = normalizeTypingText(rawValue);
    // Keep the invisible field aligned with normalized text (avoids sticky smart quotes).
    if (inputEl.value !== value) {
      const pos = inputEl.selectionStart;
      inputEl.value = value;
      try {
        inputEl.setSelectionRange(pos, pos);
      } catch (e) {}
    }

    // Timer starts only when the user actually types something.
    if (value.length > 0) beginTypingTimer();

    state.typed = value;
    syncTypingScore();
    renderPassage();
    updateLiveStats();
    const typedChars = Array.from(value);
    const targetChars = Array.from(state.target);
    if (typedChars.length >= targetChars.length - 80) {
      const extra = usingCustomParagraph()
        ? normalizeTypingText(CUSTOM_PARAGRAPHS[state.paragraphIndex].text)
        : pick(PASSAGES.map(normalizeTypingText));
      state.target += " " + extra;
      renderPassage();
    }
  }

  function syncTypingScore() {
    let correct = 0;
    let incorrect = 0;
    const typedChars = Array.from(state.typed);
    const targetChars = Array.from(state.target);
    const limit = Math.min(typedChars.length, targetChars.length);
    for (let i = 0; i < limit; i += 1) {
      if (charsMatch(typedChars[i], targetChars[i])) correct += 1;
      else incorrect += 1;
    }
    // Complete correct chars only — both Correct and Typed use this finished match count.
    state.correct = correct;
    state.incorrect = incorrect;
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
      state.entryChars += typed.length;
      if (typed && typed === expected) state.entryCorrect += 1;
      else state.entryWrong += 1;
    }
    state.entryIndex += 1;
    showEntry();
  }

  function ensureCat(cat) {
    if (!state.byCat[cat]) state.byCat[cat] = { correct: 0, wrong: 0, skipped: 0 };
    return state.byCat[cat];
  }

  function renderMcq() {
    const item = state.questions[state.qIndex];
    if (!item) {
      finishTest();
      return;
    }

    state.selectedOption = null;
    mcqNextBtn.disabled = true;
    mcqCat.textContent = item.cat;
    mcqCount.textContent = `Question ${state.qIndex + 1} / ${state.questions.length}`;
    mcqQuestion.textContent = item.q;

    if (item.image) {
      mcqImage.hidden = false;
      mcqImage.innerHTML = renderMcqImage(item.image);
    } else {
      mcqImage.hidden = true;
      mcqImage.innerHTML = "";
    }

    mcqOptions.innerHTML = "";
    item.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mcq-option";
      btn.textContent = `${String.fromCharCode(65 + index)}. ${opt}`;
      btn.addEventListener("click", () => {
        state.selectedOption = index;
        mcqOptions.querySelectorAll(".mcq-option").forEach((el) => el.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        mcqNextBtn.disabled = false;
      });
      mcqOptions.appendChild(btn);
    });
    updateLiveStats();
  }

  function commitMcq(skipped) {
    if (!state.running) return;
    const item = state.questions[state.qIndex];
    if (!item) return;
    const bucket = ensureCat(item.cat);

    if (skipped || state.selectedOption === null) {
      state.mcqSkipped += 1;
      bucket.skipped += 1;
    } else if (state.selectedOption === item.answer) {
      state.mcqCorrect += 1;
      bucket.correct += 1;
    } else {
      state.mcqWrong += 1;
      bucket.wrong += 1;
    }

    state.qIndex += 1;
    if (state.qIndex >= state.questions.length) finishTest();
    else renderMcq();
  }

  function finishTest() {
    if (!state.running) return;
    state.running = false;
    clearTimer();
    inputEl.blur();
    entryInput.blur();

    const minutes = Math.max(elapsedMinutes(), 1 / 60);
    const accuracy = liveAccuracy();

    if (isEntry) {
      const attempted = state.entryCorrect + state.entryWrong + state.entrySkipped;
      const graded = state.entryCorrect + state.entryWrong;
      const minutes = Math.max(state.durationSec / 60, elapsedMinutes());
      const cpm = Math.round(state.entryChars / minutes);
      const wpm = Math.round(cpm / 5);
      const accLabel = graded ? `${accuracy}%` : "0%";

      resultsTitle.textContent = "Data Entry Test";
      resultsTitle.classList.add("entry-result-heading");
      document.querySelector(".typing-results .typing-mode-tag")?.setAttribute("hidden", "");

      resultGrid.className = "entry-result-layout";
      resultGrid.innerHTML = `
        <div class="entry-result-box">
          <div class="entry-result-row"><span>Characters per minute (CPM)</span><strong>${cpm}</strong></div>
          <div class="entry-result-row"><span>Words per minute (WPM)</span><strong>${wpm}</strong></div>
          <div class="entry-result-row"><span>Accuracy</span><strong>${escapeHtml(accLabel)}</strong></div>
        </div>
        <p class="entry-result-note"><em>CPM also includes spaces and punctuation. WPM is always your CPM divided by 5, this is an international standard.</em></p>
        <h3 class="entry-result-conclusion-title">Conclusion</h3>
        <p class="entry-result-conclusion">Your typing speed was measured as <strong>${cpm} CPM</strong> and your accuracy was <strong>${escapeHtml(accLabel)}</strong>.</p>
        <div class="entry-result-extra">
          <div class="typing-result-card"><strong>${attempted}</strong><span>Attempted</span></div>
          <div class="typing-result-card"><strong>${state.entryCorrect}</strong><span>Correct</span></div>
          <div class="typing-result-card"><strong>${state.entryWrong}</strong><span>Wrong</span></div>
          <div class="typing-result-card"><strong>${state.entrySkipped}</strong><span>Skipped</span></div>
        </div>
      `;
      show("results");
      return;
    }

    resultsTitle.classList.remove("entry-result-heading");
    document.querySelector(".typing-results .typing-mode-tag")?.removeAttribute("hidden");
    resultGrid.className = "typing-result-grid";

    if (isMixed) {
      const totalQ = state.questions.length;
      const score = state.mcqCorrect;
      resultsTitle.textContent = score >= totalQ * 0.8 ? "Excellent critical thinking score" : score >= totalQ * 0.6 ? "Good attempt" : "Test complete";
      const cards = [
        { label: "Score", value: `${score}/${totalQ}` },
        { label: "Accuracy", value: `${accuracy}%` },
        { label: "Wrong", value: String(state.mcqWrong) },
        { label: "Skipped", value: String(state.mcqSkipped) },
        { label: "Grammar", value: `${state.byCat.Grammar?.correct || 0}` },
        { label: "Maths", value: `${state.byCat.Mathematics?.correct || 0}` },
        { label: "Images", value: `${state.byCat.Images?.correct || 0}` },
        { label: "Critical", value: `${state.byCat["Critical Thinking"]?.correct || 0}` },
        { label: "Duration", value: formatTime(state.durationSec) },
      ];
      resultGrid.innerHTML = cards
        .map((card) => `<div class="typing-result-card"><strong>${card.value}</strong><span>${card.label}</span></div>`)
        .join("");
      show("results");
      return;
    }

    syncTypingScore();
    const wpm = Math.round(state.correct / 5 / minutes);

    let title = "Test complete";
    if (accuracy >= 95 && wpm >= 40) title = "Excellent result";
    else if (accuracy >= 90) title = "Strong accuracy";
    else if (wpm >= 35) title = "Solid speed";
    resultsTitle.textContent = title;

    // Correct chars and Typed both show complete correctly typed characters.
    const completeChars = state.correct;
    const cards = [
      { label: "WPM", value: String(wpm) },
      { label: "Accuracy", value: `${accuracy}%` },
      { label: "Correct chars", value: String(completeChars) },
      { label: "Errors", value: String(state.incorrect) },
      { label: "Typed", value: String(completeChars) },
      { label: "Duration", value: formatTime(state.durationSec) },
    ];

    if (usingCustomParagraph()) {
      cards.push({ label: "Mode", value: "Custom" });
      cards.push({ label: "Paragraph", value: String(state.paragraphIndex + 1) });
      cards.push({ label: "Topic", value: CUSTOM_PARAGRAPHS[state.paragraphIndex]?.title || "-" });
    } else if (isTyping) {
      cards.push({ label: "Mode", value: "Random" });
    }

    resultGrid.innerHTML = cards
      .map((card) => `<div class="typing-result-card"><strong>${escapeHtml(card.value)}</strong><span>${escapeHtml(card.label)}</span></div>`)
      .join("");
    show("results");
  }

  function takeCategoryQuestions(cat, count) {
    const pool = shuffle(MCQ_BANK.filter((q) => q.cat === cat));
    if (!pool.length || count <= 0) return [];
    const out = [];
    while (out.length < count) {
      out.push(...shuffle(pool));
    }
    return out.slice(0, count);
  }

  function buildMixedQuestions() {
    const total = mixedQuestionCount();
    // Always split evenly across Grammar, Maths, Images, Critical Thinking.
    const perCat = Math.max(1, Math.floor(total / MIXED_CATEGORIES.length));
    const parts = MIXED_CATEGORIES.map((cat) => takeCategoryQuestions(cat, perCat));
    return shuffle(parts.flat());
  }

  function startTest() {
    if (usingCustomParagraph() && (state.paragraphIndex < 0 || !CUSTOM_PARAGRAPHS[state.paragraphIndex])) {
      alert("Please select a paragraph first.");
      return;
    }

    clearTimer();
    state.running = true;
    state.timerStarted = false;
    state.startedAt = 0;
    state.endsAt = 0;
    state.typed = "";
    state.correct = 0;
    state.incorrect = 0;
    state.entryIndex = 0;
    state.entryCorrect = 0;
    state.entryWrong = 0;
    state.entrySkipped = 0;
    state.entryChars = 0;
    state.qIndex = 0;
    state.selectedOption = null;
    state.mcqCorrect = 0;
    state.mcqWrong = 0;
    state.mcqSkipped = 0;
    state.byCat = {};

    promptCard.hidden = !isEntry;
    entryWrap.hidden = !isEntry;
    textWrap.hidden = isEntry || isMixed;
    mcqWrap.hidden = !isMixed;

    show("run");

    if (isEntry) {
      state.timerStarted = true;
      state.startedAt = Date.now();
      state.endsAt = state.startedAt + state.durationSec * 1000;
      state.entries = buildEntries(120);
      showEntry();
      startCountdown();
    } else if (isMixed) {
      state.timerStarted = true;
      state.startedAt = Date.now();
      state.endsAt = state.startedAt + state.durationSec * 1000;
      state.questions = buildMixedQuestions();
      renderMcq();
      startCountdown();
    } else {
      state.target = buildPassage();
      inputEl.value = "";
      renderPassage();
      inputEl.focus();
      updateLiveStats();
    }
  }

  function startCountdown() {
    clearTimer();
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
    state.timerStarted = false;
    inputEl.value = "";
    entryInput.value = "";
    show("setup");
  }

  inputEl.addEventListener("input", () => {
    if (!state.running || isEntry || isMixed) return;
    scoreTyped(inputEl.value);
  });

  inputEl.addEventListener("compositionend", () => {
    if (!state.running || isEntry || isMixed) return;
    scoreTyped(inputEl.value);
  });

  // Keep focus on the typing field when the passage area is tapped.
  textWrap?.addEventListener("click", () => {
    if (!state.running || isEntry || isMixed) return;
    inputEl.focus();
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
  mcqNextBtn?.addEventListener("click", () => commitMcq(false));
  mcqSkipBtn?.addEventListener("click", () => commitMcq(true));
  startBtn.addEventListener("click", startTest);
  restartBtn.addEventListener("click", startTest);
  againBtn.addEventListener("click", resetToSetup);

  modeWrap?.querySelectorAll(".typing-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTextMode(btn.dataset.mode));
  });

  configureSetupCopy();
  setDurationButtons();
  if (isTyping) setTextMode("random");
  else if (paragraphWrap) paragraphWrap.hidden = true;
  show("setup");
})();
