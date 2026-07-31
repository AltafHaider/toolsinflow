(() => {
  const tools = Array.isArray(window.TOOLS_INDEX) ? window.TOOLS_INDEX : [];
  if (!tools.length) return;

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreTool(tool, query) {
    const q = normalize(query);
    if (!q) return 0;
    const name = normalize(tool.name);
    const desc = normalize(tool.desc);
    const cat = normalize(tool.catLabel || tool.cat);
    const keywords = normalize(tool.keywords);
    const id = normalize(tool.id);

    if (name === q || id === q) return 100;
    if (name.startsWith(q)) return 90;
    if (name.includes(q)) return 80;
    if (id.includes(q) || cat.includes(q)) return 70;
    if (keywords.includes(q) || desc.includes(q)) return 60;

    const parts = q.split(" ").filter(Boolean);
    const hits = parts.filter((p) => name.includes(p) || desc.includes(p) || keywords.includes(p) || cat.includes(p));
    if (hits.length === parts.length) return 50 + hits.length;
    if (hits.length) return 30 + hits.length;
    return 0;
  }

  function searchTools(query, limit = 8) {
    const q = normalize(query);
    if (!q) return [];
    return tools
      .map((tool) => ({ tool, score: scoreTool(tool, q) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
      .slice(0, limit)
      .map((row) => row.tool);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initHeaderSearch() {
    const wrap = document.querySelector("[data-tool-search]");
    const input = document.getElementById("toolSearch");
    const results = document.getElementById("toolSearchResults");
    if (!wrap || !input || !results) return;

    let active = -1;

    function close() {
      results.hidden = true;
      results.innerHTML = "";
      active = -1;
      wrap.classList.remove("is-open");
    }

    function render(list) {
      if (!list.length) {
        results.innerHTML = `<div class="header-search-empty">No tools found</div>`;
        results.hidden = false;
        wrap.classList.add("is-open");
        active = -1;
        return;
      }

      results.innerHTML = list
        .map(
          (tool, index) => `
          <a class="header-search-item" role="option" href="${escapeHtml(tool.url)}" data-index="${index}">
            <strong>${escapeHtml(tool.name)}</strong>
            <span>${escapeHtml(tool.catLabel || tool.cat)}</span>
            <em>${escapeHtml(tool.desc)}</em>
          </a>`
        )
        .join("");
      results.hidden = false;
      wrap.classList.add("is-open");
      active = -1;
    }

    function updateActive(items) {
      items.forEach((item, index) => item.classList.toggle("is-active", index === active));
    }

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (!q) {
        close();
        return;
      }
      render(searchTools(q, 8));
    });

    input.addEventListener("keydown", (event) => {
      const items = [...results.querySelectorAll(".header-search-item")];
      if (!items.length) {
        if (event.key === "Escape") close();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        active = (active + 1) % items.length;
        updateActive(items);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        active = active <= 0 ? items.length - 1 : active - 1;
        updateActive(items);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = items[active] || items[0];
        if (target) window.location.href = target.getAttribute("href");
      } else if (event.key === "Escape") {
        close();
        input.blur();
      }
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) close();
    });
  }

  function initPageSearch() {
    const input = document.getElementById("toolsPageSearch");
    const empty = document.getElementById("toolsSearchEmpty");
    if (!input) return;

    const cards = [...document.querySelectorAll("#tools .tool-card")];
    const groups = [...document.querySelectorAll("#tools .tools-group")];

    function applyFilter() {
      const q = normalize(input.value);
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize(`${card.textContent || ""} ${card.getAttribute("href") || ""}`);
        const show = !q || text.includes(q) || q.split(" ").every((part) => !part || text.includes(part));
        card.hidden = !show;
        if (show) visible += 1;
      });

      groups.forEach((group) => {
        const anyVisible = [...group.querySelectorAll(".tool-card")].some((card) => !card.hidden);
        group.hidden = !anyVisible;
        group.querySelectorAll(".cat-title").forEach((title) => {
          const grid = title.nextElementSibling;
          if (!grid || !grid.classList.contains("tools-grid")) return;
          const any = [...grid.querySelectorAll(".tool-card")].some((card) => !card.hidden);
          title.hidden = !any;
          grid.hidden = !any;
        });
      });

      if (empty) empty.hidden = visible > 0 || !q;
    }

    input.addEventListener("input", applyFilter);
  }

  initHeaderSearch();
  initPageSearch();
})();
