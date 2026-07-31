(() => {
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  const cookieBar = document.getElementById("cookieBar");
  const cookieAccept = document.getElementById("cookieAccept");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("toolsinflow-theme", next); } catch (e) {}
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) {
        nav.querySelectorAll(".nav-dropdown.is-open").forEach((d) => {
          d.classList.remove("is-open");
          d.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
        });
      }
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      nav.querySelectorAll(".nav-dropdown.is-open").forEach((d) => {
        d.classList.remove("is-open");
        d.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
    }));
  }

  const navDropdowns = [...document.querySelectorAll("[data-nav-dropdown]")];
  if (navDropdowns.length) {
    navDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (!toggle) return;
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const willOpen = !dropdown.classList.contains("is-open");
        navDropdowns.forEach((other) => {
          if (other === dropdown) return;
          other.classList.remove("is-open");
          other.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
        });
        dropdown.classList.toggle("is-open", willOpen);
        toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-nav-dropdown]") || target.closest("#menuToggle")) return;
      navDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("is-open");
        dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      navDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("is-open");
        dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (cookieBar && cookieAccept) {
    try {
      if (localStorage.getItem("toolsinflow-cookies") === "1") {
        cookieBar.hidden = true;
        cookieBar.classList.add("is-hidden");
      } else {
        cookieBar.hidden = false;
        cookieBar.classList.remove("is-hidden");
      }
    } catch (e) {
      cookieBar.hidden = false;
      cookieBar.classList.remove("is-hidden");
    }

    cookieAccept.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.setItem("toolsinflow-cookies", "1");
      } catch (err) {}
      cookieBar.hidden = true;
      cookieBar.classList.add("is-hidden");
      cookieBar.style.display = "none";
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const captions = [
    "Remove backgrounds in your browser",
    "Shrink JPG and PNG without the quality drop",
    "Switch formats: JPG, PNG, WebP, SVG, PDF",
    "Crop, rotate, flip and tidy shots",
    "Blur faces with adjustable strength",
    "Fillable forms, PDF to Word, and more",
  ];

  const heroVisual = document.getElementById("heroVisual");
  const heroStage = document.getElementById("heroStage");
  const toolkitCaption = document.getElementById("toolkitCaption");
  const heroRotateCta = document.getElementById("heroRotateCta");
  const modes = heroVisual ? heroVisual.querySelectorAll(".mode") : [];
  const chips = heroVisual ? [...heroVisual.querySelectorAll(".orbit-chip")] : [];
  const howSection = document.getElementById("howSection");
  const flowCards = [...document.querySelectorAll("#flowVisual [data-tilt]")];

  let rotateTools = [];
  try {
    rotateTools = JSON.parse(heroRotateCta?.dataset.rotateTools || "[]");
  } catch (e) {
    rotateTools = [];
  }

  let rotateIndex = 0;
  function showRotateTool(index) {
    if (!heroRotateCta || !rotateTools.length) return;
    const item = rotateTools[index];
    if (!item) return;
    heroRotateCta.href = item.href;
    heroRotateCta.textContent = item.label;
  }

  if (heroRotateCta && rotateTools.length) {
    showRotateTool(0);
    if (!reduceMotion) {
      setInterval(() => {
        heroRotateCta.classList.add("is-swap");
        window.setTimeout(() => {
          rotateIndex = (rotateIndex + 1) % rotateTools.length;
          showRotateTool(rotateIndex);
          heroRotateCta.classList.remove("is-swap");
        }, 220);
      }, 2600);
    }
  }

  let modeIndex = 0;
  if (modes.length && !reduceMotion) {
    setInterval(() => {
      modes[modeIndex]?.classList.remove("is-active");
      modeIndex = (modeIndex + 1) % modes.length;
      modes[modeIndex]?.classList.add("is-active");
      if (toolkitCaption) toolkitCaption.textContent = captions[modeIndex] || captions[0];
      chips.forEach((chip, i) => chip.classList.toggle("is-active", i === modeIndex));
    }, 2800);
  }

  function bindMouseZone(zone, options = {}) {
    if (!zone || reduceMotion) return;
    const stage = options.stage || null;
    const magnets = options.magnets || [];

    zone.addEventListener("pointermove", (e) => {
      const rect = zone.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (stage) {
        const nx = (x / 100) * 2 - 1;
        const ny = (y / 100) * 2 - 1;
        stage.style.setProperty("--rx", `${(-ny * 7).toFixed(2)}deg`);
        stage.style.setProperty("--ry", `${(nx * 9).toFixed(2)}deg`);
      }

      magnets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const pull = Math.max(0, 1 - dist / 150);
        if (pull > 0.12) {
          el.classList.add("is-near");
          el.style.setProperty("--ox", `${(dx * 0.14 * pull).toFixed(1)}px`);
          el.style.setProperty("--oy", `${(dy * 0.14 * pull).toFixed(1)}px`);
        } else {
          el.classList.remove("is-near");
          el.style.setProperty("--ox", "0px");
          el.style.setProperty("--oy", "0px");
        }
      });
    });

    zone.addEventListener("pointerleave", () => {
      if (stage) {
        stage.style.setProperty("--rx", "0deg");
        stage.style.setProperty("--ry", "0deg");
      }
      magnets.forEach((el) => {
        el.classList.remove("is-near");
        el.style.setProperty("--ox", "0px");
        el.style.setProperty("--oy", "0px");
      });
    });
  }

  bindMouseZone(heroVisual, { stage: heroStage, magnets: chips });
  bindMouseZone(howSection, { magnets: flowCards });

  // Custom cursor: blue dot + lagging ring + trail dots
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const wideEnough = window.matchMedia("(min-width: 901px)").matches;

  if (cursorDot && cursorRing && finePointer && wideEnough && !reduceMotion) {
    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;
    let lastTrailX = mouseX;
    let lastTrailY = mouseY;
    let lastTrailAt = 0;

    const show = () => {
      if (visible) return;
      visible = true;
      cursorDot.style.opacity = "1";
      cursorRing.style.opacity = "1";
    };

    const hide = () => {
      visible = false;
      cursorDot.style.opacity = "0";
      cursorRing.style.opacity = "0";
    };

    const isInteractive = (el) =>
      !!(el && el.closest && el.closest("a, button, .tool-card, .primary, .ghost, .mode-tab, .bg-swatch, .dropzone, summary, label.mode-tab"));

    const isTextField = (el) =>
      !!(el && el.closest && el.closest("input, textarea, select, .blur-canvas"));

    const spawnTrail = (x, y) => {
      const dot = document.createElement("span");
      dot.className = "cursor-trail";
      const size = 3 + Math.random() * 3;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1)`;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.classList.add("is-fading");
        dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.15)`;
      });
      setTimeout(() => dot.remove(), 560);
    };

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      show();

      const target = e.target;
      if (isTextField(target)) {
        document.documentElement.classList.remove("is-hover");
        hide();
        document.documentElement.style.cursor = "auto";
      } else {
        document.documentElement.style.cursor = "none";
        show();
        document.documentElement.classList.toggle("is-hover", isInteractive(target));

        const now = performance.now();
        const dist = Math.hypot(mouseX - lastTrailX, mouseY - lastTrailY);
        if (dist > 14 && now - lastTrailAt > 28) {
          spawnTrail(mouseX, mouseY);
          lastTrailX = mouseX;
          lastTrailY = mouseY;
          lastTrailAt = now;
        }
      }
    });

    window.addEventListener("mousedown", () => document.documentElement.classList.add("cursor-down"));
    window.addEventListener("mouseup", () => document.documentElement.classList.remove("cursor-down"));
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
