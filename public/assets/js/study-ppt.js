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
    { id: "fresh-green", name: "Fresh Green", bg: "0F9F73", accent: "FFFFFF", text: "FFFFFF", muted: "D7F5EA", card: "0C7F5C" },
    { id: "ocean-blue", name: "Ocean Blue", bg: "1B6CA8", accent: "FFFFFF", text: "FFFFFF", muted: "D7EAF8", card: "155887" },
    { id: "sunset", name: "Sunset Study", bg: "E36A2E", accent: "FFFFFF", text: "FFFFFF", muted: "FFE4D4", card: "C4541F" },
    { id: "midnight", name: "Midnight Focus", bg: "1A2230", accent: "7DD3C0", text: "F4F7FA", muted: "A8B3C2", card: "263246" },
    { id: "lavender", name: "Soft Lavender", bg: "6B5B95", accent: "FFFFFF", text: "FFFFFF", muted: "EDE7F6", card: "57497A" },
    { id: "chalk", name: "Classroom Chalk", bg: "2F5D50", accent: "F4F1DE", text: "F4F1DE", muted: "C8E6C9", card: "24483E" },
    { id: "coral", name: "Coral Pop", bg: "E85A71", accent: "FFFFFF", text: "FFFFFF", muted: "FFD9E0", card: "C94459" },
    { id: "forest", name: "Forest Notes", bg: "3D5A40", accent: "DAD7CD", text: "F0EDE5", muted: "A3B18A", card: "314832" },
    { id: "sand", name: "Sand & Ink", bg: "F4E9D8", accent: "1F2A24", text: "1F2A24", muted: "5D6F67", card: "FFFFFF" },
    { id: "neon", name: "Neon Focus", bg: "111827", accent: "34D399", text: "F9FAFB", muted: "9CA3AF", card: "1F2937" },
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
        <span class="study-template-swatch" style="background:linear-gradient(135deg,#${tpl.bg},#${tpl.card});color:#${tpl.text}">
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

  function renderPreview(slides, template) {
    if (!previewStage) return;
    previewMeta.textContent = `${slides.length} slides · ${template.name}`;
    previewStage.innerHTML = slides.map((slide, index) => {
      const bullets = (slide.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("");
      return `
        <article class="study-slide-card" style="--slide-bg:#${template.bg};--slide-card:#${template.card};--slide-text:#${template.text};--slide-accent:#${template.accent};--slide-muted:#${template.muted}">
          <header>
            <span>Slide ${index + 1}</span>
            <strong>${escapeHtml(slide.type === "title" ? "Title" : slide.type === "end" ? "Ending" : "Content")}</strong>
          </header>
          <div class="study-slide-face">
            <h3>${escapeHtml(slide.title)}</h3>
            ${slide.body ? `<p>${escapeHtml(slide.body)}</p>` : ""}
            ${bullets ? `<ul>${bullets}</ul>` : ""}
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

      // Accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.28, h: 7.5,
        fill: { color: template.accent },
        line: { color: template.accent },
      });

      // Soft card panel
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.7, y: 0.55, w: 12.0, h: 6.4,
        fill: { color: template.card },
        line: { color: template.card },
        shadow: { type: "outer", color: "000000", blur: 10, offset: 3, opacity: 0.18 },
      });

      slide.addText(item.title, {
        x: 1.05, y: 0.85, w: 11.2, h: item.type === "title" ? 1.6 : 1.0,
        fontSize: item.type === "title" ? 40 : 30,
        fontFace: "Calibri",
        color: template.text,
        bold: true,
        margin: 0,
      });

      if (item.body) {
        slide.addText(item.body, {
          x: 1.05, y: 2.7, w: 11.2, h: 1.4,
          fontSize: 22,
          fontFace: "Calibri",
          color: template.muted,
          margin: 0,
        });
      }

      if (item.bullets?.length) {
        slide.addText(
          item.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
          {
            x: 1.05,
            y: item.type === "title" ? 4.2 : 2.1,
            w: 11.2,
            h: 4.2,
            fontSize: 20,
            fontFace: "Calibri",
            color: template.text,
            valign: "top",
            paraSpaceAfter: 10,
          }
        );
      }

      slide.addText(`ToolsInFlow · Slide ${index + 1}`, {
        x: 1.05, y: 6.55, w: 11.2, h: 0.3,
        fontSize: 11,
        fontFace: "Calibri",
        color: template.muted,
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
