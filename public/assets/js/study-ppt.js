(() => {
  const topicInput = document.getElementById("studyTopic");
  const materialInput = document.getElementById("studyMaterial");
  const slideCountEl = document.getElementById("studySlideCount");
  const simpleWordsEl = document.getElementById("studySimpleWords");
  const generateBtn = document.getElementById("studyGenerateBtn");
  const downloadBtn = document.getElementById("studyDownloadBtn");
  const statusEl = document.getElementById("studyStatus");
  const templateGrid = document.getElementById("studyTemplateGrid");
  const previewStage = document.getElementById("studyPreviewStage");
  const previewMeta = document.getElementById("studyPreviewMeta");

  if (!generateBtn || !templateGrid || !downloadBtn) return;

  const TEMPLATES = [
    { id: "fresh-green", name: "Fresh Green", bg: "0F9F73", accent: "FFFFFF", text: "FFFFFF", muted: "D7F5EA", card: "0C7F5C", layout: "leftbar" },
    { id: "ocean-blue", name: "Ocean Blue", bg: "1B6CA8", accent: "FFFFFF", text: "FFFFFF", muted: "D7EAF8", card: "155887", layout: "leftbar" },
    { id: "forest-notes", name: "Forest Notes", bg: "3D5A40", accent: "DAD7CD", text: "F0EDE5", muted: "A3B18A", card: "314832", layout: "leftbar" },
    { id: "sunset-study", name: "Sunset Study", bg: "E36A2E", accent: "FFFFFF", text: "FFFFFF", muted: "FFE4D4", card: "C4541F", layout: "topbar" },
    { id: "coral-pop", name: "Coral Pop", bg: "E85A71", accent: "FFFFFF", text: "FFFFFF", muted: "FFD9E0", card: "C94459", layout: "topbar" },
    { id: "amber-glow", name: "Amber Glow", bg: "D97706", accent: "FFFFFF", text: "FFFFFF", muted: "FEF3C7", card: "B45309", layout: "topbar" },
    { id: "midnight-focus", name: "Midnight Focus", bg: "1A2230", accent: "7DD3C0", text: "F4F7FA", muted: "A8B3C2", card: "263246", layout: "rightbar" },
    { id: "slate-pro", name: "Slate Pro", bg: "475569", accent: "F8FAFC", text: "F8FAFC", muted: "CBD5E1", card: "334155", layout: "rightbar" },
    { id: "indigo-night", name: "Indigo Night", bg: "312E81", accent: "A5B4FC", text: "EEF2FF", muted: "C7D2FE", card: "1E1B4B", layout: "rightbar" },
    { id: "sand-ink", name: "Sand & Ink", bg: "F4E9D8", accent: "1F2A24", text: "1F2A24", muted: "5D6F67", card: "FFFFFF", layout: "frame" },
    { id: "classroom-chalk", name: "Classroom Chalk", bg: "2F5D50", accent: "F4F1DE", text: "F4F1DE", muted: "C8E6C9", card: "24483E", layout: "frame" },
    { id: "cocoa-warm", name: "Cocoa Warm", bg: "5D4037", accent: "FFCCBC", text: "FFF8E1", muted: "D7CCC8", card: "4E342E", layout: "frame" },
    { id: "teal-wave", name: "Teal Wave", bg: "0D9488", accent: "FFFFFF", text: "FFFFFF", muted: "CCFBF1", card: "0F766E", layout: "banner" },
    { id: "berry-bright", name: "Berry Bright", bg: "9D174D", accent: "FFFFFF", text: "FFFFFF", muted: "FBCFE8", card: "831843", layout: "banner" },
    { id: "peach-soft", name: "Peach Soft", bg: "FB923C", accent: "FFFFFF", text: "FFFFFF", muted: "FFEDD5", card: "EA580C", layout: "banner" },
    { id: "mint-fresh", name: "Mint Fresh", bg: "ECFDF5", accent: "059669", text: "064E3B", muted: "6EE7B7", card: "FFFFFF", layout: "split" },
    { id: "aurora-sky", name: "Aurora Sky", bg: "0C4A6E", accent: "38BDF8", text: "F0F9FF", muted: "7DD3FC", card: "075985", layout: "split" },
    { id: "neon-focus", name: "Neon Focus", bg: "111827", accent: "34D399", text: "F9FAFB", muted: "9CA3AF", card: "1F2937", layout: "split" },
    { id: "soft-lavender", name: "Soft Lavender", bg: "6B5B95", accent: "FFFFFF", text: "FFFFFF", muted: "EDE7F6", card: "57497A", layout: "corner" },
    { id: "rose-petal", name: "Rose Petal", bg: "BE185D", accent: "FFFFFF", text: "FFFFFF", muted: "FCE7F3", card: "9D174D", layout: "corner" },
    { id: "skyline-blue", name: "Skyline Blue", bg: "2563EB", accent: "FFFFFF", text: "FFFFFF", muted: "DBEAFE", card: "1D4ED8", layout: "corner" },
    { id: "citrus-punch", name: "Citrus Punch", bg: "CA8A04", accent: "FFFFFF", text: "FFFFFF", muted: "FEF9C3", card: "A16207", layout: "ribbon" },
    { id: "pine-grove", name: "Pine Grove", bg: "14532D", accent: "BBF7D0", text: "F0FDF4", muted: "86EFAC", card: "166534", layout: "ribbon" },
    { id: "ruby-study", name: "Ruby Study", bg: "991B1B", accent: "FFFFFF", text: "FFFFFF", muted: "FECACA", card: "7F1D1D", layout: "ribbon" },
    { id: "cloud-white", name: "Cloud White", bg: "F1F5F9", accent: "0F9F73", text: "0F172A", muted: "64748B", card: "FFFFFF", layout: "cards" },
    { id: "denim-day", name: "Denim Day", bg: "1E40AF", accent: "FFFFFF", text: "FFFFFF", muted: "BFDBFE", card: "1E3A8A", layout: "cards" },
    { id: "terracotta", name: "Terracotta", bg: "C2410C", accent: "FFFFFF", text: "FFFFFF", muted: "FED7AA", card: "9A3412", layout: "cards" },
    { id: "graphite", name: "Graphite", bg: "27272A", accent: "22D3EE", text: "FAFAFA", muted: "A1A1AA", card: "3F3F46", layout: "spotlight" },
    { id: "lilac-dream", name: "Lilac Dream", bg: "DDD6FE", accent: "7C3AED", text: "4C1D95", muted: "8B5CF6", card: "EDE9FE", layout: "spotlight" },
    { id: "emerald-edge", name: "Emerald Edge", bg: "047857", accent: "FBBF24", text: "FFFFFF", muted: "A7F3D0", card: "065F46", layout: "spotlight" },
  ];

  const SIMPLE_MAP = {
    photosynthesis: "how plants make food from sunlight",
    approximately: "about",
    subsequently: "then",
    therefore: "so",
    however: "but",
    furthermore: "also",
    additionally: "also",
    consequently: "so",
    utilize: "use",
    utilization: "use",
    demonstrate: "show",
    significant: "important",
    sufficient: "enough",
    insufficient: "not enough",
    commence: "start",
    terminate: "end",
    acquire: "get",
    assist: "help",
    attempt: "try",
    beneficial: "helpful",
    component: "part",
    constitute: "make up",
    frequently: "often",
    immediately: "right away",
    indicate: "show",
    maintain: "keep",
    obtain: "get",
    require: "need",
    several: "many",
    various: "different",
    essential: "needed",
    fundamental: "basic",
    complexity: "how hard it is",
    phenomenon: "event",
    characteristics: "features",
    environment: "surroundings",
    temperature: "heat level",
    concentration: "amount in one place",
    photosynthesis: "plants making food with sunlight",
    respiration: "breathing and energy use",
    democracy: "rule by the people",
    revolution: "big change",
    equation: "math statement",
    fraction: "part of a whole",
    molecule: "tiny particle made of atoms",
    organism: "living thing",
    ecosystem: "living things and their home",
    civilization: "society and culture",
    government: "group that runs a country",
    economy: "how money and work move",
  };

  const FEATURED_TEMPLATE_COUNT = 8;
  let selectedTemplate = TEMPLATES[0].id;
  let templatesExpanded = false;
  let deck = null;

  function setStatus(message, type = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "status" + (type ? ` ${type}` : "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function simplifyText(text) {
    let out = cleanText(text);
    if (!out) return "";
    if (simpleWordsEl?.checked) {
      Object.keys(SIMPLE_MAP).forEach((word) => {
        const re = new RegExp(`\\b${word}\\b`, "gi");
        out = out.replace(re, SIMPLE_MAP[word]);
      });
      out = out
        .replace(/\b(is|are|was|were)\s+being\b/gi, "is")
        .replace(/\bin order to\b/gi, "to")
        .replace(/\bdue to the fact that\b/gi, "because")
        .replace(/\ba large number of\b/gi, "many")
        .replace(/\bat this point in time\b/gi, "now");
    }
    // Shorten very long sentences, keeping normal capitalization.
    out = out
      .split(/(?<=[.!?])\s+/)
      .map((s) => {
        const trimmed = s.trim();
        if (!trimmed) return "";
        const words = trimmed.split(/\s+/);
        if (words.length <= 22) return capitalizeSentence(trimmed);
        return capitalizeSentence(words.slice(0, 20).join(" ") + ".");
      })
      .filter(Boolean)
      .join(" ");
    return out;
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/={2,}/g, " ")
      .trim();
  }

  function capitalizeSentence(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function titleCase(text) {
    return cleanText(text)
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function toBullets(lines, max = 5) {
    const seen = new Set();
    return lines
      .map((l) => simplifyText(l))
      .filter((l) => {
        if (!l || l.length < 12) return false;
        const key = l.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, max);
  }

  function chunkBullets(lines, max = 5) {
    const bullets = toBullets(lines, 40);
    const groups = [];
    for (let i = 0; i < bullets.length; i += max) {
      groups.push(bullets.slice(i, i + max));
    }
    return groups;
  }

  function splitSentences(text) {
    return cleanText(text)
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 18);
  }

  function looksLikeHeading(line) {
    const t = cleanText(line);
    if (!t || t.length > 70) return false;
    if (/[.!?]$/.test(t)) return false;
    if (/^(what is|uses?|advantages?|disadvantages?|pros?|cons?|properties|features|types?|examples?|conclusion|summary|importance|applications?|benefits?|limitations?|key points?|introduction|overview)\b/i.test(t)) {
      return true;
    }
    return t.split(/\s+/).length <= 8 && /:$/.test(t);
  }

  function parseWikiSections(rawText) {
    const text = String(rawText || "").replace(/\r/g, "");
    const parts = text.split(/\n(?=={2,}\s*[^=].*?={2,}\s*$)/m);
    let lead = "";
    const sections = [];

    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const headingMatch = trimmed.match(/^={2,}\s*(.*?)\s*={2,}\s*\n?([\s\S]*)$/);
      if (headingMatch) {
        const title = cleanText(headingMatch[1]);
        const body = cleanText(headingMatch[2]);
        if (title && body) sections.push({ title, body });
        return;
      }
      if (index === 0) lead = cleanText(trimmed);
      else if (trimmed.length > 40) sections.push({ title: "More details", body: cleanText(trimmed) });
    });

    if (!sections.length) {
      const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
      if (blocks.length) {
        lead = cleanText(blocks[0]);
        blocks.slice(1).forEach((block) => {
          const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);
          if (!lines.length) return;
          if (looksLikeHeading(lines[0]) && lines.length > 1) {
            const title = lines[0].replace(/[:.]+$/, "");
            sections.push({
              title: titleCase(title),
              body: cleanText(lines.slice(1).join(" ")),
            });
          } else {
            sections.push({ title: "Key ideas", body: cleanText(block) });
          }
        });
      }
    }

    return { lead: cleanText(lead), sections };
  }

  function isNoiseSection(title) {
    const t = cleanText(title);
    if (!t) return true;
    if (/^(see also|references|notes|external links|further reading|bibliography|citations?|research|gallery|footnotes?|sources?|works cited)$/i.test(t)) return true;
    if (/^\d{3,4}s?\b/i.test(t)) return true;
    if (/^(late|early|mid)\s+\d{4}/i.test(t)) return true;
    if (/^(more details|key ideas)$/i.test(t) && t.length < 12) return false;
    return false;
  }

  const TOPIC_EXPANSIONS = {
    ai: "Artificial Intelligence",
    "a.i": "Artificial Intelligence",
    "a.i.": "Artificial Intelligence",
    ml: "Machine Learning",
    "m.l": "Machine Learning",
    "m.l.": "Machine Learning",
    dbms: "Database Management System",
    db: "Database",
    seo: "Search Engine Optimization",
    ppc: "Pay-Per-Click Advertising",
    iot: "Internet of Things",
    ui: "User Interface",
    ux: "User Experience",
    api: "Application Programming Interface",
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    dna: "DNA",
    rna: "RNA",
    ww2: "World War II",
    wwii: "World War II",
    "world war 2": "World War II",
    "world war 1": "World War I",
    wwi: "World War I",
    gdp: "Gross Domestic Product",
    cnc: "Computer Numerical Control",
    nlp: "Natural Language Processing",
    cv: "Computer Vision",
    os: "Operating System",
    oops: "Object-Oriented Programming",
    oop: "Object-Oriented Programming",
  };

  const TOPIC_PHRASE_FIXES = {
    "artifical inteligence": "Artificial Intelligence",
    "artifical intelligence": "Artificial Intelligence",
    "artificial inteligence": "Artificial Intelligence",
    "artficial intelligence": "Artificial Intelligence",
    photosyntesis: "Photosynthesis",
    photosythesis: "Photosynthesis",
    "photo synthesis": "Photosynthesis",
    "maching learning": "Machine Learning",
    "machine learnig": "Machine Learning",
    "machin learning": "Machine Learning",
    "digtal mrketing": "Digital Marketing",
    "digital mrketing": "Digital Marketing",
    "digtal marketing": "Digital Marketing",
    "digitial marketing": "Digital Marketing",
    "data base": "Database",
    "data bases": "Databases",
    "cyber securty": "Cybersecurity",
    "cyber security": "Cybersecurity",
    "climte change": "Climate Change",
    "global warmingg": "Global Warming",
  };

  const WORD_TYPO_FIXES = {
    artifical: "artificial",
    artficial: "artificial",
    inteligence: "intelligence",
    intelligense: "intelligence",
    photosyntesis: "photosynthesis",
    photosythesis: "photosynthesis",
    maching: "machine",
    machin: "machine",
    learnig: "learning",
    learing: "learning",
    digtal: "digital",
    digitial: "digital",
    mrketing: "marketing",
    marketting: "marketing",
    databse: "database",
    datbase: "database",
    managment: "management",
    managemnt: "management",
    enviroment: "environment",
    goverment: "government",
    buisness: "business",
    buisiness: "business",
    recieve: "receive",
    occured: "occurred",
    seperate: "separate",
    definately: "definitely",
    aquires: "acquires",
    aquired: "acquired",
  };

  function localNormalizeTopic(raw) {
    let text = cleanText(raw);
    if (!text) return "";
    const compact = text.toLowerCase().replace(/\./g, "").trim();
    const lowered = text.toLowerCase().trim();

    if (TOPIC_EXPANSIONS[compact]) return TOPIC_EXPANSIONS[compact];
    if (TOPIC_EXPANSIONS[lowered]) return TOPIC_EXPANSIONS[lowered];
    if (TOPIC_PHRASE_FIXES[lowered]) return TOPIC_PHRASE_FIXES[lowered];
    if (TOPIC_PHRASE_FIXES[compact]) return TOPIC_PHRASE_FIXES[compact];

    const fixedWords = lowered
      .split(/\s+/)
      .map((word) => WORD_TYPO_FIXES[word.replace(/[^a-z0-9-]/g, "")] || word)
      .join(" ");
    const phraseHit = TOPIC_PHRASE_FIXES[fixedWords] || TOPIC_EXPANSIONS[fixedWords.replace(/\./g, "")];
    if (phraseHit) return phraseHit;
    return titleCase(fixedWords);
  }

  function topicsLookSame(a, b) {
    const norm = (value) => cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
    return norm(a) === norm(b);
  }

  function shortTopicLabel(title) {
    const t = cleanText(title);
    const aliases = [
      [/artificial intelligence/i, "AI"],
      [/machine learning/i, "ML"],
      [/database management system/i, "DBMS"],
      [/search engine optimization/i, "SEO"],
      [/digital marketing/i, "Digital Marketing"],
      [/world war\s*ii|world war\s*2/i, "WWII"],
      [/world war\s*i\b|world war\s*1/i, "WWI"],
    ];
    for (const [re, label] of aliases) {
      if (re.test(t)) return label;
    }
    const words = t.split(/\s+/);
    if (words.length <= 4) return t;
    return words.slice(0, 3).join(" ");
  }

  function professionalSubtitle(analysis) {
    const topic = analysis.topic;
    const map = {
      science: `A student study guide to ${topic}`,
      technology: `Key concepts, applications, and challenges of ${topic}`,
      business: `Practical strategies and insights on ${topic}`,
      history: `Causes, events, and impact of ${topic}`,
      math: `Definitions, methods, and examples for ${topic}`,
      health: `Essential facts and understanding of ${topic}`,
      geography: `Location, features, and importance of ${topic}`,
      general: `A clear study presentation on ${topic}`,
    };
    return map[analysis.domain] || map.general;
  }

  function chooseIntroHeading(analysis) {
    const topic = analysis.topic;
    if (["history"].includes(analysis.domain)) return "Introduction";
    if (analysis.domain === "geography" && /country|continent|river|ocean|city|region/i.test(topic)) {
      return "Introduction";
    }
    // Concept-style topics read better as "What is ...?"
    if (["science", "technology", "math", "health", "business", "general"].includes(analysis.domain)) {
      return `What is ${topic}?`;
    }
    return "Introduction";
  }

  function isIntroLikeSection(title) {
    return /^(introduction|intro|overview|terminology|etymology|definition|meaning|concept|about)$/i.test(cleanText(title));
  }

  function scoreText(text, patterns) {
    const s = String(text || "").toLowerCase();
    return patterns.reduce((score, re) => score + (re.test(s) ? 1 : 0), 0);
  }

  function analyzeTopic(title, lead, sections) {
    const corpus = [title, lead, ...sections.map((s) => `${s.title} ${s.body.slice(0, 220)}`)].join(" ");
    const domains = [
      { id: "science", score: scoreText(corpus, [/photosynth|biology|chemistry|physics|organism|molecule|atom|enzyme|cell\b|ecosystem|reaction|chlorophyll|scientific|anatomy|genetics/i]) },
      { id: "technology", score: scoreText(corpus, [/artificial intelligence|\bai\b|machine learning|algorithm|computer|software|robot|neural|programming|database|cyber|network|automation|data science/i]) },
      { id: "business", score: scoreText(corpus, [/marketing|business|finance|seo|advertis|brand|commerce|startup|entrepreneur|sales|ppc|email marketing|social media|market analysis|customer/i]) },
      { id: "history", score: scoreText(corpus, [/war|revolution|empire|ancient|century|civilization|dynasty|colonial|independence|historical|timeline|battle|treaty|kingdom/i]) },
      { id: "math", score: scoreText(corpus, [/algebra|geometry|calculus|fraction|theorem|mathematics|triangle|polynomial|equation|integer|probability/i]) },
      { id: "health", score: scoreText(corpus, [/health|disease|medicine|virus|vaccine|nutrition|hospital|symptom|treatment|therapy/i]) },
      { id: "geography", score: scoreText(corpus, [/climate|geography|continent|river|ocean|latitude|longitude|terrain|rainfall|population/i]) },
    ];
    domains.sort((a, b) => b.score - a.score);
    const best = domains[0].score > 0 ? domains[0].id : "general";
    return {
      domain: best,
      topic: titleCase(title),
      short: shortTopicLabel(title),
      corpus,
    };
  }

  function topicAwareHeading(rawTitle, analysis) {
    const topic = analysis.topic;
    const short = analysis.short;
    const raw = titleCase(cleanText(rawTitle).replace(/[:.]+$/, ""));
    const lower = raw.toLowerCase();

    if (/^(introduction|intro|overview)$/i.test(raw)) return "Introduction";
    if (/^(conclusion|summary|recap)$/i.test(raw)) return "Conclusion";
    if (/^(history|historical background|background|origins?)$/i.test(raw)) return `History of ${short}`;
    if (/^(types?|kinds?|categories|classification)$/i.test(raw)) return `Types of ${short}`;
    if (/^(applications?|uses?|use cases?)$/i.test(raw)) return `Applications of ${short}`;
    if (/^(advantages?|benefits?|pros)$/i.test(raw)) return `Benefits of ${short}`;
    if (/^(disadvantages?|limitations?|challenges?|cons|risks?)$/i.test(raw)) return `Challenges of ${short}`;
    if (/^(importance|significance)$/i.test(raw)) return `Importance of ${short}`;
    if (/^(examples?|case studies)$/i.test(raw)) return `Real-Life Examples of ${short}`;
    if (/^(definition|terminology|meaning|concept)$/i.test(raw)) return `Definition of ${short}`;
    if (/^(process|mechanism|how it works)$/i.test(raw)) return `Process of ${short}`;
    if (/^(future|outlook|trends?)$/i.test(raw)) return `Future of ${short}`;
    if (/^(factors?)$/i.test(raw)) return `Factors Affecting ${short}`;

    // Keep distinctive section names (SEO, Machine Learning, Chemical equation, etc.)
    if (!lower.includes(short.toLowerCase()) && !lower.includes(topic.toLowerCase()) && raw.split(/\s+/).length <= 5) {
      if (/^(components?|features?|structure|methods?|techniques?|tools?|strategies?)$/i.test(raw)) {
        return `${raw} of ${short}`;
      }
    }
    return raw;
  }

  function domainBlueprint(analysis) {
    const t = analysis.topic;
    const s = analysis.short;
    const blueprints = {
      science: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition|terminolog|concept|meaning/i },
        { role: "definition", title: `Definition of ${s}`, match: /definition|what is|meaning|concept|terminolog/i },
        { role: "process", title: `Process of ${s}`, match: /process|mechanism|stage|step|cycle|pathway|how .+ works/i },
        { role: "equation", title: "Chemical Equation", match: /equation|formula|reaction|stoichi/i },
        { role: "factors", title: `Factors Affecting ${s}`, match: /factor|condition|affect|influence|requirement|limit/i },
        { role: "types", title: `Types of ${s}`, match: /type|kind|classif|form|variant/i },
        { role: "importance", title: `Importance of ${s}`, match: /importance|significance|role|why|benefit/i },
        { role: "examples", title: `Real-Life Examples of ${s}`, match: /example|application|in nature|use case|real/i },
      ],
      technology: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition|concept|terminolog/i },
        { role: "history", title: `History of ${s}`, match: /histor|origin|development|evolution|background/i },
        { role: "types", title: `Types of ${s}`, match: /type|kind|classif|categor|narrow|general/i },
        { role: "core", title: "Core Concepts", match: /machine learning|deep learning|neural|algorithm|model|system|architecture|technique/i },
        { role: "applications", title: `Applications of ${s}`, match: /application|use case|uses|applied|industry/i },
        { role: "benefits", title: `Benefits of ${s}`, match: /benefit|advantage|strength|positive/i },
        { role: "challenges", title: `Challenges of ${s}`, match: /challenge|limitation|risk|ethic|problem|disadvantage|concern/i },
        { role: "future", title: `Future of ${s}`, match: /future|trend|outlook|prospect|tomorrow/i },
      ],
      business: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition|concept/i },
        { role: "types", title: `Types of ${s}`, match: /type|channel|form|kind|categor/i },
        { role: "seo", title: "SEO", match: /\bseo\b|search engine/i },
        { role: "social", title: "Social Media Marketing", match: /social media|facebook|instagram|tiktok|linkedin/i },
        { role: "email", title: "Email Marketing", match: /email marketing|newsletter|email campaign/i },
        { role: "ppc", title: "PPC Advertising", match: /\bppc\b|pay[- ]per[- ]click|paid search|ads?/i },
        { role: "benefits", title: `Advantages of ${s}`, match: /advantage|benefit|strength|roi|growth/i },
        { role: "challenges", title: `Challenges of ${s}`, match: /challenge|limitation|risk|disadvantage|problem/i },
        { role: "trends", title: `Future Trends in ${s}`, match: /future|trend|outlook|emerging/i },
      ],
      history: [
        { role: "intro", title: "Introduction", match: /introduction|overview|background/i },
        { role: "causes", title: `Causes of ${s}`, match: /cause|origin|reason|background|lead up/i },
        { role: "timeline", title: "Timeline of Key Events", match: /timeline|chronolog|sequence|course|events?/i },
        { role: "people", title: "Important People", match: /leader|people|figure|personality|commander|president|king/i },
        { role: "events", title: "Major Events", match: /battle|event|campaign|turning point|siege/i },
        { role: "impact", title: `Impact of ${s}`, match: /impact|effect|consequence|aftermath|result/i },
        { role: "legacy", title: "Legacy and Significance", match: /legacy|significance|importance|memory|historiography/i },
      ],
      math: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition/i },
        { role: "definition", title: `Definition of ${s}`, match: /definition|meaning|concept/i },
        { role: "rules", title: "Key Rules and Formulas", match: /formula|rule|theorem|property|identity/i },
        { role: "methods", title: "Methods / Steps", match: /method|step|procedure|solve|approach/i },
        { role: "examples", title: "Worked Examples", match: /example|problem|exercise|sample/i },
        { role: "mistakes", title: "Common Mistakes", match: /mistake|error|pitfall|confusion|wrong/i },
        { role: "practice", title: "Practice Tips", match: /practice|tip|revise|remember|strategy/i },
      ],
      health: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition/i },
        { role: "causes", title: "Causes", match: /cause|risk factor|origin|trigger/i },
        { role: "symptoms", title: "Symptoms", match: /symptom|sign|indication/i },
        { role: "prevention", title: "Prevention", match: /prevention|prevent|avoid|protect/i },
        { role: "treatment", title: "Treatment", match: /treatment|therapy|cure|manage|medicine/i },
        { role: "importance", title: "Why It Matters", match: /importance|impact|health|awareness/i },
      ],
      geography: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition/i },
        { role: "location", title: "Location and Features", match: /location|feature|landform|region|position/i },
        { role: "climate", title: "Climate and Environment", match: /climate|weather|environment|rainfall|temperature/i },
        { role: "people", title: "People and Economy", match: /population|people|economy|culture|industry/i },
        { role: "importance", title: "Importance", match: /importance|significance|role|value/i },
        { role: "issues", title: "Current Issues", match: /issue|challenge|problem|conservation|threat/i },
      ],
      general: [
        { role: "intro", title: "Introduction", match: /introduction|overview|definition|concept|meaning/i },
        { role: "keyideas", title: `Key Ideas about ${s}`, match: /key|main|core|basic|important/i },
        { role: "parts", title: `Main Parts of ${s}`, match: /part|component|element|structure|feature|type/i },
        { role: "how", title: `How ${s} Works`, match: /process|work|method|function|mechanism/i },
        { role: "uses", title: `Why ${s} Matters`, match: /importance|application|use|benefit|role|why/i },
        { role: "examples", title: `Examples of ${s}`, match: /example|case|instance|real/i },
        { role: "challenges", title: `Challenges related to ${s}`, match: /challenge|limitation|problem|risk|issue/i },
      ],
    };
    return blueprints[analysis.domain] || blueprints.general;
  }

  function findBestSection(sections, used, match) {
    let best = null;
    let bestScore = 0;
    sections.forEach((section, index) => {
      if (used.has(index) || isNoiseSection(section.title)) return;
      let score = 0;
      if (match.test(section.title)) score += 5;
      if (match.test(section.body.slice(0, 280))) score += 2;
      score += Math.min(2, splitSentences(section.body).length / 4);
      if (score > bestScore) {
        bestScore = score;
        best = { section, index, score };
      }
    });
    return bestScore >= 2 ? best : null;
  }

  function composeTopicOutline(analysis, sections, maxContentSlides) {
    const outline = [];
    const used = new Set();
    const introHeading = chooseIntroHeading(analysis);
    const introSources = [];

    const usable = sections
      .map((section, index) => ({ section, index }))
      .filter(({ section, index }) => {
        if (isNoiseSection(section.title)) return false;
        if (isIntroLikeSection(section.title)) {
          introSources.push(index);
          used.add(index);
          return false;
        }
        const sentences = splitSentences(section.body);
        return sentences.length >= 2 || cleanText(section.body).length > 140;
      });

    // First content slide: topic intro (no filler slides before this).
    outline.push({
      role: "intro",
      title: introHeading,
      sourceIndexes: introSources,
      match: /introduction|overview|definition|concept|terminology|meaning/i,
      useLead: true,
    });

    // Prefer distinctive Wikipedia / material section titles first (topic-aware renaming).
    usable.forEach(({ section, index }) => {
      if (outline.length >= maxContentSlides) return;
      if (used.has(index)) return;
      const heading = topicAwareHeading(section.title, analysis);
      if (/^conclusion$/i.test(heading)) return;
      if (/^(introduction|what is\b)/i.test(heading)) return;
      if (outline.some((item) => item.title.toLowerCase() === heading.toLowerCase())) return;
      used.add(index);
      outline.push({
        role: "section",
        title: heading,
        sourceIndexes: [index],
        match: new RegExp(section.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        useLead: false,
      });
    });

    // Fill missing conceptual gaps from a domain-specific blueprint.
    if (outline.length < Math.min(6, maxContentSlides)) {
      domainBlueprint(analysis).forEach((seed) => {
        if (outline.length >= maxContentSlides) return;
        if (outline.some((item) => item.role === seed.role || item.title.toLowerCase() === seed.title.toLowerCase())) return;
        const found = findBestSection(sections, used, seed.match);
        if (found) {
          used.add(found.index);
          outline.push({
            role: seed.role,
            title: topicAwareHeading(found.section.title, analysis) || seed.title,
            sourceIndexes: [found.index],
            match: seed.match,
            useLead: seed.role === "intro",
          });
        } else if (seed.role !== "intro") {
          outline.push({
            role: seed.role,
            title: seed.title,
            sourceIndexes: [],
            match: seed.match,
            useLead: false,
            soft: true,
          });
        }
      });
    }

    // Keep intro first; trim soft placeholders if we are over budget.
    const intro = outline[0];
    let rest = outline.slice(1);
    rest = rest.filter((item, idx) => !(item.soft && idx > 4 && rest.length > maxContentSlides));
    while (rest.length > maxContentSlides - 1) {
      const softIdx = rest.map((item, i) => (item.soft ? i : -1)).filter((i) => i >= 0).pop();
      if (softIdx == null) {
        rest.pop();
      } else {
        rest.splice(softIdx, 1);
      }
    }

    return [intro, ...rest].slice(0, maxContentSlides);
  }

  function gatherBulletsForItem(item, analysis, lead, sections, usedSentences) {
    const pool = [];
    if (item.useLead || item.role === "intro") {
      pool.push(...splitSentences(lead).slice(0, 5));
    }
    item.sourceIndexes.forEach((index) => {
      const section = sections[index];
      if (section) pool.push(...splitSentences(section.body).slice(0, 8));
    });
    if (pool.length < 3 && item.match) {
      sections.forEach((section) => {
        if (isNoiseSection(section.title)) return;
        if (item.match.test(section.title) || item.match.test(section.body.slice(0, 320))) {
          pool.push(...splitSentences(section.body).slice(0, 4));
        }
      });
    }
    if (pool.length < 2) {
      const keywords = `${item.title} ${analysis.short}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
      const all = [...splitSentences(lead), ...sections.flatMap((s) => splitSentences(s.body))];
      all.forEach((sentence) => {
        const lower = sentence.toLowerCase();
        if (keywords.some((k) => lower.includes(k))) pool.push(sentence);
      });
    }

    const unique = [];
    pool.forEach((sentence) => {
      const key = sentence.toLowerCase();
      if (usedSentences.has(key)) return;
      usedSentences.add(key);
      unique.push(sentence);
    });

    if (unique.length) return toBullets(unique, 5);

    // Topic-aware fallback only when source text is thin for that heading.
    const s = analysis.short;
    const fallbacks = {
      intro: [
        `${analysis.topic} is an important topic for study and real-life understanding.`,
        `This presentation explains ${s} in a clear order for students.`,
      ],
      definition: [`${analysis.topic} means the main idea and terms students should learn first.`],
      process: [`${s} happens through clear steps that build on each other.`],
      equation: [`The formula or equation linked to ${s} helps explain the process in short form.`],
      factors: [`Several conditions can speed up, slow down, or change ${s}.`],
      types: [`${s} can be grouped into useful types or categories for easier learning.`],
      applications: [`${s} is used in school work, industry, and everyday situations.`],
      benefits: [`Learning ${s} helps students solve problems and explain ideas with confidence.`],
      challenges: [`${s} also has limits, risks, or hard parts that students should remember.`],
      future: [`New tools and research continue to shape the future of ${s}.`],
      examples: [`Real examples make ${s} easier to remember in exams and projects.`],
      conclusion: [`In short, ${s} is best revised from introduction to key ideas and final takeaways.`],
    };
    return toBullets(fallbacks[item.role] || [
      `${item.title} is an important part of understanding ${s}.`,
      `Focus on the main points under “${item.title}” while revising ${analysis.topic}.`,
    ], 4);
  }

  function buildConclusionBullets(analysis, lead, sections, usedSentences) {
    const points = [];
    const leadPoints = splitSentences(lead).filter((s) => !usedSentences.has(s.toLowerCase())).slice(0, 1);
    points.push(...leadPoints);
    const closing = sections.find((section) => /conclusion|summary|legacy|importance|future/i.test(section.title));
    if (closing) points.push(...splitSentences(closing.body).slice(0, 2));
    points.push(`${analysis.topic} is best understood by reviewing each section in order.`);
    points.push(`Revise the key headings of this deck and explain ${analysis.short} in your own words.`);
    return toBullets(points, 4);
  }

  function pushContentSlide(slides, title, bullets, maxSlides) {
    const clean = toBullets(bullets, 5);
    if (!clean.length || slides.length >= maxSlides - 1) return false;
    slides.push({ type: "content", title, bullets: clean });
    return true;
  }

  function templateButtonHtml(tpl) {
    return `
      <button type="button" class="study-template${tpl.id === selectedTemplate ? " is-active" : ""}" data-template="${tpl.id}" aria-pressed="${tpl.id === selectedTemplate}">
        <span class="study-template-swatch study-swatch--${tpl.layout}" style="--slide-accent:#${tpl.accent};--slide-card:#${tpl.card};background:linear-gradient(135deg,#${tpl.bg},#${tpl.card});color:#${tpl.text}">
          <strong>Aa</strong>
        </span>
        <span>${escapeHtml(tpl.name)}</span>
      </button>
    `;
  }

  function isFeaturedTemplate(id) {
    return TEMPLATES.slice(0, FEATURED_TEMPLATE_COUNT).some((tpl) => tpl.id === id);
  }

  function renderTemplates() {
    const featured = TEMPLATES.slice(0, FEATURED_TEMPLATE_COUNT);
    const more = TEMPLATES.slice(FEATURED_TEMPLATE_COUNT);
    const selectedInMore = !isFeaturedTemplate(selectedTemplate);
    if (selectedInMore) templatesExpanded = true;

    templateGrid.innerHTML = `
      <div class="study-template-grid">${featured.map(templateButtonHtml).join("")}</div>
      ${more.length ? `
        <details class="study-template-more"${templatesExpanded ? " open" : ""}>
          <summary>
            <span>${templatesExpanded ? "Hide extra designs" : `More designs (${more.length})`}</span>
            <span class="study-template-more-meta">${more.length} more styles</span>
          </summary>
          <div class="study-template-grid study-template-grid--more">${more.map(templateButtonHtml).join("")}</div>
        </details>
      ` : ""}
    `;

    const details = templateGrid.querySelector(".study-template-more");
    if (details) {
      details.addEventListener("toggle", () => {
        templatesExpanded = details.open;
        const label = details.querySelector("summary span");
        if (label) {
          label.textContent = details.open ? "Hide extra designs" : `More designs (${more.length})`;
        }
      });
    }
  }

  function getTemplate(id = selectedTemplate) {
    return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
  }

  async function wikiOpenSearch(query) {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error("Could not look up this topic right now.");
    const searchData = await searchRes.json();
    return (searchData?.[1] || []).filter(Boolean);
  }

  function pickBestWikiTitle(query, titles) {
    if (!titles.length) return "";
    const q = cleanText(query).toLowerCase();
    const exact = titles.find((t) => t.toLowerCase() === q);
    if (exact) return exact;
    const starts = titles.find((t) => t.toLowerCase().startsWith(q) || q.startsWith(t.toLowerCase()));
    if (starts) return starts;
    const contains = titles.find((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()));
    return contains || titles[0];
  }

  async function resolveCanonicalTopic(rawInput) {
    const original = cleanText(rawInput);
    if (!original) {
      return { original: "", corrected: "", changed: false };
    }

    const local = localNormalizeTopic(original);
    const queries = [];
    if (local) queries.push(local);
    if (original && !topicsLookSame(original, local)) queries.push(original);

    let bestTitle = local || original;
    for (const query of queries) {
      try {
        const titles = await wikiOpenSearch(query);
        const chosen = pickBestWikiTitle(query, titles);
        if (chosen) {
          bestTitle = chosen;
          break;
        }
      } catch (error) {
        // Keep local correction if Wikipedia is unavailable.
      }
    }

    // Prefer readable study titles for common abbreviations even if wiki is shorter.
    if (TOPIC_EXPANSIONS[original.toLowerCase().replace(/\./g, "")] && topicsLookSame(bestTitle, local)) {
      bestTitle = local;
    }

    return {
      original,
      corrected: bestTitle,
      changed: !topicsLookSame(original, bestTitle),
    };
  }

  async function fetchTopicContent(topic) {
    const resolved = await resolveCanonicalTopic(topic);
    const pageTitle = resolved.corrected || topic.trim();
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) throw new Error("Could not load study content for this topic.");
    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages || {};
    const page = Object.values(pages)[0];
    const extract = String(page?.extract || "").trim();
    if (!extract || page?.missing !== undefined) {
      const fallback = buildFallbackTopic(pageTitle);
      return {
        ...fallback,
        title: pageTitle,
        originalTopic: resolved.original,
        corrected: resolved.changed,
      };
    }
    return {
      title: page?.title || pageTitle,
      source: "topic",
      text: extract,
      originalTopic: resolved.original,
      corrected: resolved.changed,
    };
  }

  function buildFallbackTopic(topic) {
    const analysis = analyzeTopic(topic, `${topic} is an important study topic.`, []);
    const seeds = domainBlueprint(analysis);
    const lines = [`${analysis.topic} is an important topic for students.`, `This overview explains ${analysis.short} in a clear study order.`];
    seeds.forEach((seed) => {
      lines.push(`== ${seed.title} ==`);
      lines.push(`${seed.title} helps students understand ${analysis.short} more clearly.`);
      lines.push(`Focus on the main ideas under ${seed.title} and connect them to ${analysis.topic}.`);
    });
    lines.push("== Conclusion ==");
    lines.push(`In conclusion, revise each section of ${analysis.short} from introduction to final takeaways.`);
    return {
      title: analysis.topic,
      source: "topic",
      text: lines.join("\n"),
    };
  }

  function buildSlidesFromText(title, text, maxSlides) {
    const { lead, sections } = parseWikiSections(text);
    const analysis = analyzeTopic(title, lead, sections);
    // Keep Wikipedia / corrected casing for the presentation title.
    analysis.topic = cleanText(title) || analysis.topic;
    analysis.short = shortTopicLabel(analysis.topic);
    const maxContentSlides = Math.max(4, maxSlides - 2); // title + conclusion reserved
    const outline = composeTopicOutline(analysis, sections, maxContentSlides);
    const usedSentences = new Set();
    const slides = [];

    // Slide 1: corrected topic title + professional subtitle only.
    slides.push({
      type: "title",
      title: analysis.topic,
      body: professionalSubtitle(analysis),
    });

    outline.forEach((item) => {
      if (slides.length >= maxSlides - 1) return;
      const bullets = gatherBulletsForItem(item, analysis, lead, sections, usedSentences);
      pushContentSlide(slides, item.title, bullets, maxSlides);
    });

    while (slides.length >= maxSlides) slides.pop();
    slides.push({
      type: "end",
      title: "Conclusion",
      bullets: buildConclusionBullets(analysis, lead, sections, usedSentences),
    });

    return slides.slice(0, maxSlides);
  }

  function buildSlidesFromMaterial(title, material, maxSlides) {
    const topicTitle = title || "My Study Presentation";
    const normalized = String(material || "").replace(/\r/g, "").trim();

    const hasHeadings = /(?:^|\n)\s*(?:#{1,3}\s+|[A-Z][A-Za-z0-9 /&-]{2,60}:\s*$|={2,}.+={2,}|\b(introduction|definition|history|types?|process|applications?|benefits?|challenges?|examples?|conclusion|seo|ppc)\b)/i.test(normalized);
    if (!hasHeadings) {
      return buildSlidesFromText(topicTitle, normalized, maxSlides);
    }

    const asWiki = normalized
      .split(/\n+/)
      .map((line) => {
        const t = line.trim();
        if (!t) return "";
        if (/^={2,}.+={2,}$/.test(t) || /^#{1,3}\s+/.test(t)) {
          const heading = t.replace(/^#{1,3}\s+/, "").replace(/={2,}/g, "").trim();
          return `== ${heading} ==`;
        }
        if (looksLikeHeading(t)) {
          return `== ${t.replace(/[:.]+$/, "")} ==`;
        }
        return t.replace(/^[-*•]\s*/, "");
      })
      .join("\n");

    return buildSlidesFromText(topicTitle, asWiki, maxSlides);
  }

  function textOnFill(fillHex, template) {
    const r = parseInt(fillHex.slice(0, 2), 16);
    const g = parseInt(fillHex.slice(2, 4), 16);
    const b = parseInt(fillHex.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55 ? template.bg : template.text;
  }

  function accentBandTextColor(template) {
    return textOnFill(template.accent, template);
  }

  function layoutDecoSpans(layout) {
    switch (layout) {
      case "leftbar": return '<span class="study-face-deco study-face-deco--bar-left" aria-hidden="true"></span>';
      case "topbar": return '<span class="study-face-deco study-face-deco--bar-top" aria-hidden="true"></span>';
      case "rightbar": return '<span class="study-face-deco study-face-deco--bar-right" aria-hidden="true"></span>';
      case "frame": return '<span class="study-face-deco study-face-deco--frame" aria-hidden="true"></span>';
      case "banner": return '<span class="study-face-deco study-face-deco--banner" aria-hidden="true"></span>';
      case "split": return '<span class="study-face-deco study-face-deco--split" aria-hidden="true"></span>';
      case "corner": return '<span class="study-face-deco study-face-deco--corner" aria-hidden="true"></span>';
      case "ribbon": return '<span class="study-face-deco study-face-deco--ribbon" aria-hidden="true"></span>';
      case "cards": return '<span class="study-face-deco study-face-deco--cards" aria-hidden="true"></span>';
      case "spotlight": return '<span class="study-face-deco study-face-deco--spotlight" aria-hidden="true"></span>';
      default: return "";
    }
  }

  function renderPreview(slides, template) {
    if (!previewStage) return;
    previewMeta.textContent = `${slides.length} slides · ${template.name}`;
    previewStage.innerHTML = slides.map((slide, index) => {
      const bullets = (slide.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      return `
        <article class="study-slide-card" style="--slide-bg:#${template.bg};--slide-card:#${template.card};--slide-text:#${template.text};--slide-accent:#${template.accent};--slide-muted:#${template.muted};--slide-on-accent:#${accentBandTextColor(template)}">
          <header>
            <span>Slide ${index + 1}</span>
            <strong>${escapeHtml(slide.type === "title" ? "Title" : slide.type === "end" ? "Ending" : "Content")}</strong>
          </header>
          <div class="study-slide-face study-face--${template.layout}">
            ${layoutDecoSpans(template.layout)}
            <div class="study-face-content">
              <h3>${escapeHtml(slide.title)}</h3>
              ${slide.body ? `<p>${escapeHtml(slide.body)}</p>` : ""}
              ${bullets ? `<ul>${bullets}</ul>` : ""}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function ensurePptx() {
    const PptxGenJS = window.PptxGenJS || window.pptxgenjs;
    if (!PptxGenJS) throw new Error("PowerPoint library failed to load. Refresh and try again.");
    return PptxGenJS;
  }

  function addLayoutShapes(slide, pptx, template) {
    const W = 13.333;
    const H = 7.5;
    const shadow = { type: "outer", color: "000000", blur: 10, offset: 3, opacity: 0.18 };

    switch (template.layout) {
      case "leftbar":
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 0.28, h: H,
          fill: { color: template.accent }, line: { color: template.accent },
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.7, y: 0.55, w: 12.0, h: 6.4,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.08, shadow,
        });
        break;
      case "topbar":
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: W, h: 1.35,
          fill: { color: template.accent }, line: { color: template.accent },
        });
        break;
      case "rightbar":
        slide.addShape(pptx.ShapeType.rect, {
          x: W - 0.28, y: 0, w: 0.28, h: H,
          fill: { color: template.accent }, line: { color: template.accent },
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.35, y: 0.55, w: 12.0, h: 6.4,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.08, shadow,
        });
        break;
      case "frame":
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.25, y: 0.25, w: W - 0.5, h: H - 0.5,
          fill: { color: template.bg }, line: { color: template.accent, pt: 4 },
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.65, y: 0.65, w: W - 1.3, h: H - 1.3,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.06,
        });
        break;
      case "banner":
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: W, h: 2.0,
          fill: { color: template.accent }, line: { color: template.accent },
        });
        break;
      case "split":
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: W * 0.35, h: H,
          fill: { color: template.accent }, line: { color: template.accent },
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: W * 0.35, y: 0, w: W * 0.65, h: H,
          fill: { color: template.card }, line: { color: template.card },
        });
        break;
      case "corner":
        slide.addShape(pptx.ShapeType.ellipse, {
          x: W - 3.5, y: -1.2, w: 4.2, h: 4.2,
          fill: { color: template.accent, transparency: 15 },
          line: { color: template.accent, transparency: 30 },
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.7, y: 0.55, w: 12.0, h: 6.4,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.08, shadow,
        });
        break;
      case "ribbon":
        slide.addShape(pptx.ShapeType.rect, {
          x: -0.5, y: 0.8, w: 5.5, h: 0.45,
          fill: { color: template.accent }, line: { color: template.accent },
          rotate: 28,
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: -0.2, y: 1.35, w: 4.8, h: 0.25,
          fill: { color: template.muted }, line: { color: template.muted },
          rotate: 28,
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.7, y: 0.55, w: 12.0, h: 6.4,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.08,
        });
        break;
      case "cards":
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 0.5, w: 11.7, h: 1.55,
          fill: { color: template.accent }, line: { color: template.accent },
          rectRadius: 0.06,
        });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8, y: 2.25, w: 11.7, h: 4.55,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.06,
          shadow: { type: "outer", color: "000000", blur: 8, offset: 2, opacity: 0.15 },
        });
        break;
      case "spotlight":
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.4, y: 0.75, w: W - 2.8, h: H - 1.5,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.1,
          shadow: { type: "outer", color: "000000", blur: 12, offset: 4, opacity: 0.22 },
        });
        break;
      default:
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.7, y: 0.55, w: 12.0, h: 6.4,
          fill: { color: template.card }, line: { color: template.card },
          rectRadius: 0.08, shadow,
        });
    }
  }

  function getLayoutContent(template, item) {
    const W = 13.333;
    const isTitle = item.type === "title";
    const bandText = accentBandTextColor(template);
    const titleSize = isTitle ? 40 : 30;
    const base = {
      titleSize,
      titleColor: template.text,
      bodyColor: template.muted,
      bulletColor: template.text,
      footerColor: template.muted,
      underline: null,
    };

    switch (template.layout) {
      case "leftbar":
      case "rightbar":
      case "corner":
      case "ribbon":
        return {
          ...base,
          title: { x: 1.05, y: 0.85, w: 11.2, h: isTitle ? 1.6 : 1.0 },
          body: { x: 1.05, y: 2.7, w: 11.2, h: 1.4 },
          bullets: { x: 1.05, y: isTitle ? 4.2 : 2.1, w: 11.2, h: 4.2 },
          footer: { x: 1.05, y: 6.55, w: 11.2, h: 0.3 },
        };
      case "topbar":
        return {
          ...base,
          title: { x: 0.6, y: 0.28, w: 12.1, h: 0.95 },
          titleColor: bandText,
          titleSize: isTitle ? 36 : 28,
          body: { x: 0.85, y: 1.85, w: 11.6, h: 1.4 },
          bullets: { x: 0.85, y: isTitle ? 3.5 : 1.85, w: 11.6, h: 4.5 },
          footer: { x: 0.85, y: 6.7, w: 11.6, h: 0.3 },
        };
      case "frame":
        return {
          ...base,
          title: { x: 1.0, y: 0.95, w: 11.3, h: isTitle ? 1.6 : 1.0 },
          body: { x: 1.0, y: 2.8, w: 11.3, h: 1.4 },
          bullets: { x: 1.0, y: isTitle ? 4.3 : 2.2, w: 11.3, h: 4.0 },
          footer: { x: 1.0, y: 6.55, w: 11.3, h: 0.3 },
        };
      case "banner":
        return {
          ...base,
          title: { x: 0.6, y: 0.45, w: 12.1, h: 1.2 },
          titleColor: bandText,
          titleSize: isTitle ? 38 : 30,
          body: { x: 0.85, y: 2.35, w: 11.6, h: 1.4 },
          bullets: { x: 0.85, y: isTitle ? 3.9 : 2.35, w: 11.6, h: 4.2 },
          footer: { x: 0.85, y: 6.7, w: 11.6, h: 0.3 },
        };
      case "split":
        return {
          ...base,
          title: { x: 0.45, y: 1.0, w: 4.2, h: isTitle ? 2.0 : 1.2 },
          titleColor: textOnFill(template.accent, template),
          body: { x: 5.0, y: 1.2, w: 7.8, h: 1.4 },
          bullets: { x: 5.0, y: isTitle ? 3.0 : 1.2, w: 7.8, h: 4.5 },
          footer: { x: 5.0, y: 6.7, w: 7.8, h: 0.3 },
          bulletColor: template.text,
        };
      case "cards":
        return {
          ...base,
          title: { x: 1.05, y: 0.72, w: 11.2, h: 1.1 },
          titleColor: bandText,
          titleSize: isTitle ? 34 : 28,
          body: { x: 1.05, y: 2.55, w: 11.2, h: 1.2 },
          bullets: { x: 1.05, y: isTitle ? 3.9 : 2.55, w: 11.2, h: 3.8 },
          footer: { x: 1.05, y: 6.55, w: 11.2, h: 0.3 },
        };
      case "spotlight":
        return {
          ...base,
          title: { x: 1.85, y: 1.15, w: 9.6, h: isTitle ? 1.6 : 1.0 },
          body: { x: 1.85, y: 3.0, w: 9.6, h: 1.4 },
          bullets: { x: 1.85, y: isTitle ? 4.5 : 2.5, w: 9.6, h: 3.5 },
          footer: { x: 1.85, y: 6.55, w: 9.6, h: 0.3 },
          underline: { x: 1.85, y: isTitle ? 2.65 : 2.05, w: 3.2, h: 0.08 },
        };
      default:
        return {
          ...base,
          title: { x: 1.05, y: 0.85, w: 11.2, h: isTitle ? 1.6 : 1.0 },
          body: { x: 1.05, y: 2.7, w: 11.2, h: 1.4 },
          bullets: { x: 1.05, y: isTitle ? 4.2 : 2.1, w: 11.2, h: 4.2 },
          footer: { x: 1.05, y: 6.55, w: 11.2, h: 0.3 },
        };
    }
  }

  async function buildPptx(slides, template, fileTitle) {
    const PptxGenJS = ensurePptx();
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "LAYOUT_16x9", width: 13.333, height: 7.5 });
    pptx.layout = "LAYOUT_16x9";
    pptx.author = "ToolsInFlow";
    pptx.title = fileTitle;

    slides.forEach((item, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: template.bg };

      addLayoutShapes(slide, pptx, template);
      const areas = getLayoutContent(template, item);

      slide.addText(item.title, {
        x: areas.title.x, y: areas.title.y, w: areas.title.w, h: areas.title.h,
        fontSize: areas.titleSize,
        fontFace: "Calibri",
        color: areas.titleColor,
        bold: true,
        margin: 0,
      });

      if (areas.underline) {
        slide.addShape(pptx.ShapeType.rect, {
          x: areas.underline.x, y: areas.underline.y,
          w: areas.underline.w, h: areas.underline.h,
          fill: { color: template.accent }, line: { color: template.accent },
        });
      }

      if (item.body) {
        slide.addText(item.body, {
          x: areas.body.x, y: areas.body.y, w: areas.body.w, h: areas.body.h,
          fontSize: 22,
          fontFace: "Calibri",
          color: areas.bodyColor,
          margin: 0,
        });
      }

      if (item.bullets?.length) {
        slide.addText(
          item.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
          {
            x: areas.bullets.x,
            y: areas.bullets.y,
            w: areas.bullets.w,
            h: areas.bullets.h,
            fontSize: 20,
            fontFace: "Calibri",
            color: areas.bulletColor,
            valign: "top",
            paraSpaceAfter: 10,
          }
        );
      }

      slide.addText(`ToolsInFlow · Slide ${index + 1}`, {
        x: areas.footer.x, y: areas.footer.y, w: areas.footer.w, h: areas.footer.h,
        fontSize: 11,
        fontFace: "Calibri",
        color: areas.footerColor,
      });
    });

    return pptx;
  }

  async function generate() {
    const topic = cleanText(topicInput?.value || "");
    const material = String(materialInput?.value || "").trim();
    const maxSlides = Math.max(8, Math.min(20, Number(slideCountEl?.value || 12)));
    const template = getTemplate();

    if (!topic && !material) {
      setStatus("Enter a topic name or paste study material first.", "error");
      return;
    }

    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    setStatus("Correcting topic and analyzing content...");

    try {
      let title = topic || "My Study Presentation";
      let slides;
      let correctedNote = "";

      if (material.length >= 40) {
        const seed = topic || cleanText(material.split(/\n|[.!?]/)[0].slice(0, 60)) || title;
        const resolved = await resolveCanonicalTopic(seed);
        title = resolved.corrected || seed;
        if (topicInput && resolved.corrected) topicInput.value = resolved.corrected;
        if (resolved.changed) correctedNote = `Corrected to “${title}”. `;
        setStatus(`${correctedNote}Building a topic-aware outline from your notes...`);
        slides = buildSlidesFromMaterial(title, material, maxSlides);
      } else {
        const content = await fetchTopicContent(topic || material);
        title = content.title;
        if (topicInput && title) topicInput.value = title;
        if (content.corrected && content.originalTopic) {
          correctedNote = `Corrected “${content.originalTopic}” to “${title}”. `;
        }
        setStatus(`${correctedNote}Building a custom presentation for ${title}...`);
        slides = buildSlidesFromText(title, content.text, maxSlides);
      }

      // Ensure slide 1 is always the corrected topic title.
      if (slides[0]?.type === "title") {
        slides[0].title = title;
      }

      deck = {
        title,
        slides,
        templateId: template.id,
        fileName: `${title.replace(/[^\w\s-]+/g, "").trim().replace(/\s+/g, "-").slice(0, 48) || "study-presentation"}.pptx`,
      };

      renderPreview(slides, template);
      downloadBtn.disabled = false;
      setStatus(`${correctedNote}${slides.length} slides ready for “${title}”. Download when ready.`, "ok");
    } catch (error) {
      deck = null;
      setStatus(error?.message || "Could not create the presentation.", "error");
    } finally {
      generateBtn.disabled = false;
    }
  }

  async function download() {
    if (!deck) {
      setStatus("Create the presentation first.", "error");
      return;
    }
    downloadBtn.disabled = true;
    setStatus("Preparing your PowerPoint file...");
    try {
      const template = getTemplate(deck.templateId);
      const pptx = await buildPptx(deck.slides, template, deck.title);
      await pptx.writeFile({ fileName: deck.fileName });
      setStatus("Downloaded. Open the file in PowerPoint or Google Slides to edit.", "ok");
    } catch (error) {
      setStatus(error?.message || "Download failed.", "error");
    } finally {
      downloadBtn.disabled = false;
    }
  }

  templateGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-template]");
    if (!btn) return;
    selectedTemplate = btn.getAttribute("data-template") || TEMPLATES[0].id;
    renderTemplates();
    if (deck) {
      deck.templateId = selectedTemplate;
      renderPreview(deck.slides, getTemplate());
    }
  });

  generateBtn.addEventListener("click", () => {
    generate();
  });
  downloadBtn.addEventListener("click", () => {
    download();
  });

  renderTemplates();
})();
