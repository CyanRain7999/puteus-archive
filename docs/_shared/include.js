(async function () {
  async function includePartials() {
    const nodes = document.querySelectorAll("[data-include]");
    await Promise.all([...nodes].map(async (el) => {
      const url = el.getAttribute("data-include");
      const res = await fetch(url, { cache: "no-store" });
      el.outerHTML = await res.text();
    }));
  }

  async function resolveBase() {
    // Works for:
    // - Project Pages: https://user.github.io/<repo>/...
    // - User/Org Pages: https://user.github.io/...
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "/";
    if (parts[0].includes(".")) return "/";
    const candidate = "/" + parts[0] + "/";
    try {
      const probe = await fetch(candidate + "data/entries.json", { cache: "no-store" });
      if (probe.ok) return candidate;
    } catch (e) {}
    return "/";
  }

  function applyNavLinks(base) {
    document.querySelectorAll("a[data-path]").forEach((a) => {
      const p = a.getAttribute("data-path") || "";
      a.setAttribute("href", base + p);
    });

    const cur = location.pathname;
    document.querySelectorAll(".topnav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href && cur.startsWith(href.replace(/index\.html$/, ""))) {
        a.classList.add("active");
      }
    });
  }

  function loadDynamicBg(base) {
    // One-liner switch:
    // ?bg=ripples | ?bg=scan | ?bg=neural | ?bg=off
    const id = "puteus-bg-loader";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = base + "assets/bg/bg-loader.js";
    s.async = true;
    document.head.appendChild(s);
  }

  await includePartials();
  const base = await resolveBase();
  window.__SITE_BASE__ = base;
  applyNavLinks(base);

  // Auto-load dynamic backgrounds (safe no-op if assets missing)
  loadDynamicBg(base);
})();
