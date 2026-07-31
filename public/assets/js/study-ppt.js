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

  if (!generateBtn || !templateGrid) return;

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

  let selectedTemplate = TEMPLATES[0].id;
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
    if (!simpleWordsEl?.checked) return cleanText(text);
    let out = cleanText(text).toLowerCase();
    Object.keys(SIMPLE_MAP).forEach((word) => {
      const re = new RegExp(`\\b${word}\\b`, "gi");
      out = out.replace(re, SIMPLE_MAP[word]);
    });
    out = out
      .replace(/\b(is|are|was|were)\s+being\b/g, "is")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\bdue to the fact that\b/gi, "because")
      .replace(/\ba large number of\b/gi, "many")
      .replace(/\bat this point in time\b/gi, "now");
    // Shorten very long sentences.
    out = out
      .split(/(?<=[.!?])\s+/)
      .map((s) => {
        const words = s.trim().split(/\s+/);
        if (words.length <= 18) return s.trim();
        return words.slice(0, 16).join(" ") + ".";
      })
      .filter(Boolean)
      .join(" ");
    return capitalizeSentence(out);
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\[[^\]]*\]/g, "")
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

  function chunkBullets(lines, max = 5) {
    const bullets = lines.map((l) => simplifyText(l)).filter((l) => l.length > 8);
    const groups = [];
    for (let i = 0; i < bullets.length; i += max) {
      groups.push(bullets.slice(i, i + max));
    }
    return groups;
  }

  function renderTemplates() {
    templateGrid.innerHTML = TEMPLATES.map((tpl) => `
      <button type="button" class="study-template${tpl.id === selectedTemplate ? " is-active" : ""}" data-template="${tpl.id}" aria-pressed="${tpl.id === selectedTemplate}">
        <span class="study-template-swatch study-swatch--${tpl.layout}" style="--slide-accent:#${tpl.accent};--slide-card:#${tpl.card};background:linear-gradient(135deg,#${tpl.bg},#${tpl.card});color:#${tpl.text}">
          <strong>Aa</strong>
        </span>
        <span>${escapeHtml(tpl.name)}</span>
      </button>
    `).join("");
  }

  function getTemplate(id = selectedTemplate) {
    return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
  }

  async function fetchTopicContent(topic) {
    const query = encodeURIComponent(topic.trim());
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${query}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error("Could not look up this topic right now.");
    const searchData = await searchRes.json();
    const pageTitle = searchData?.[1]?.[0] || topic.trim();
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=plain&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) throw new Error("Could not load study content for this topic.");
    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages || {};
    const page = Object.values(pages)[0];
    const extract = cleanText(page?.extract || "");
    if (!extract || page?.missing !== undefined) {
      return buildFallbackTopic(topic);
    }
    return {
      title: titleCase(pageTitle),
      source: "topic",
      text: extract,
    };
  }

  function buildFallbackTopic(topic) {
    const t = titleCase(topic);
    return {
      title: t,
      source: "topic",
      text: [
        `${t} is an important school topic.`,
        `Students should learn what ${t} means in simple words.`,
        `First, learn the basic idea of ${t}.`,
        `Next, learn the main parts or steps of ${t}.`,
        `Then, look at real-life examples of ${t}.`,
        `Also learn why ${t} is useful.`,
        `Finally, review key words and practice questions about ${t}.`,
      ].join(" "),
    };
  }

  function buildSlidesFromText(title, text, maxSlides) {
    const simple = simplifyText(text);
    const sentences = simple
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const slides = [];
    slides.push({
      type: "title",
      title,
      body: "A simple study presentation made for easy understanding.",
    });

    if (sentences[0]) {
      slides.push({
        type: "content",
        title: "What is this about?",
        bullets: [sentences[0], sentences[1] || "We will learn the main ideas in easy words."].filter(Boolean),
      });
    }

    const remaining = sentences.slice(2);
    const groups = chunkBullets(remaining, 4);
    groups.forEach((group, index) => {
      if (slides.length >= maxSlides - 1) return;
      slides.push({
        type: "content",
        title: index === 0 ? "Main points" : `More key points ${index + 1}`,
        bullets: group,
      });
    });

    while (slides.length < Math.min(5, maxSlides - 1) && remaining.length) {
      // ensure a minimum useful deck
      break;
    }

    if (slides.length < maxSlides) {
      const tipPool = remaining.slice(-6);
      if (tipPool.length) {
        slides.push({
          type: "content",
          title: "Remember these",
          bullets: tipPool.slice(0, 4).map((s) => simplifyText(s)),
        });
      }
    }

    slides.push({
      type: "end",
      title: "Quick review",
      bullets: [
        `Topic: ${title}`,
        "Read each slide slowly.",
        "Say the ideas in your own words.",
        "Ask your teacher about anything unclear.",
      ],
    });

    return slides.slice(0, maxSlides);
  }

  function buildSlidesFromMaterial(title, material, maxSlides) {
    const blocks = String(material || "")
      .replace(/\r/g, "")
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);

    const slides = [{
      type: "title",
      title: title || "My Study Presentation",
      body: "Made from your study material in simple words.",
    }];

    blocks.forEach((block) => {
      if (slides.length >= maxSlides - 1) return;
      const lines = block.split(/\n+/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
      if (!lines.length) return;
      const heading = lines[0].length < 70 ? titleCase(lines[0].replace(/[:.]+$/, "")) : "Key idea";
      const points = lines
        .slice(heading === titleCase(lines[0].replace(/[:.]+$/, "")) ? 1 : 0)
        .map((l) => simplifyText(l))
        .filter(Boolean);
      const bullets = points.length ? points : [simplifyText(block)];
      chunkBullets(bullets, 5).forEach((group, idx) => {
        if (slides.length >= maxSlides - 1) return;
        slides.push({
          type: "content",
          title: idx === 0 ? heading : `${heading} (cont.)`,
          bullets: group,
        });
      });
    });

    slides.push({
      type: "end",
      title: "Study tip",
      bullets: [
        "Review these slides once more.",
        "Write 3 questions from the topic.",
        "Explain one idea to a friend.",
      ],
    });

    return slides.slice(0, maxSlides);
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
    const maxSlides = Math.max(6, Math.min(12, Number(slideCountEl?.value || 8)));
    const template = getTemplate();

    if (!topic && !material) {
      setStatus("Enter a topic name or paste study material first.", "error");
      return;
    }

    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    setStatus(material ? "Building slides from your notes..." : "Looking up the topic and writing simple slides...");

    try {
      let title = topic || "My Study Presentation";
      let slides;

      if (material.length >= 40) {
        title = topic || titleCase(material.split(/\n|[.!?]/)[0].slice(0, 60)) || title;
        slides = buildSlidesFromMaterial(title, material, maxSlides);
      } else {
        const content = await fetchTopicContent(topic || material);
        title = content.title;
        slides = buildSlidesFromText(title, content.text, maxSlides);
      }

      deck = {
        title,
        slides,
        templateId: template.id,
        fileName: `${title.replace(/[^\w\s-]+/g, "").trim().replace(/\s+/g, "-").slice(0, 48) || "study-presentation"}.pptx`,
      };

      renderPreview(slides, template);
      downloadBtn.disabled = false;
      setStatus(`${slides.length} slides ready. Download and open in PowerPoint to edit.`, "ok");
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
