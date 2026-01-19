(function(){
  const base = (window.__SITE_BASE__ || "/");

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

  // Single background only: Hybrid (ripples + neural)
  addCss("assets/bg/bg-core.css");
  addCss("assets/bg/hybrid.css");
  addJs("assets/bg/hybrid.js");
})();
