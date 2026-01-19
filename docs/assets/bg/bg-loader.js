(function(){
  const base = (window.__SITE_BASE__ || "/");
  const params = new URLSearchParams(location.search);
  const bgParam = params.get("bg");
  if (bgParam) {
    try { localStorage.setItem("puteus_bg", bgParam); } catch(e) {}
  }
  let chosen = bgParam;
  if (!chosen) {
    try { chosen = localStorage.getItem("puteus_bg"); } catch(e) {}
  }
  if (!chosen) chosen = "ripples"; // default
  chosen = String(chosen).toLowerCase();

  if (chosen === "off" || chosen === "none" || chosen === "0") return;

  const map = {
    ripples: { css: "assets/bg/ripples.css", js: "assets/bg/ripples.js" },
    scan:    { css: "assets/bg/scan.css",    js: "assets/bg/scan.js"    },
    neural:  { css: "assets/bg/neural.css",  js: "assets/bg/neural.js"  },
  };

  const pick = map[chosen] || map.ripples;

  // Create root container if not exist
  if (!document.getElementById("puteus-bg-root")) {
    const root = document.createElement("div");
    root.id = "puteus-bg-root";
    document.body.prepend(root);
  }

  function addCss(href){
    const id = "puteus-bg-css-" + href.replace(/[^\w]/g, "_");
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = base + href;
    document.head.appendChild(link);
  }

  function addJs(src){
    const id = "puteus-bg-js-" + src.replace(/[^\w]/g, "_");
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = base + src;
    s.async = true;
    document.head.appendChild(s);
  }

  addCss("assets/bg/bg-core.css");
  addCss(pick.css);
  addJs(pick.js);

  // Quick hint (console only)
  // Use ?bg=ripples | ?bg=scan | ?bg=neural | ?bg=off
})();
