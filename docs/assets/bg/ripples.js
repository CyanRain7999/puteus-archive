(function(){
  const root = document.getElementById("puteus-bg-root");
  if (!root) return;

  // Avoid double init
  if (root.querySelector("canvas[data-bg='ripples']")) return;

  const canvas = document.createElement("canvas");
  canvas.dataset.bg = "ripples";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  root.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = 1;

  function cssVar(name, fallback){
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  const accent = cssVar("--accent2", "#e84a4a");
  const ink = cssVar("--ink", "#e8edf3");

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize, { passive:true });
  resize();

  const ripples = [];
  let tPrev = performance.now();
  let spawnTimer = 0;

  function spawnRipple(){
    const x = Math.random() * w;
    const y = Math.random() * h;
    const speed = 20 + Math.random() * 120;          // px/s
    const maxR = 80 + Math.random() * 520;
    const width = 0.8 + Math.random() * 2.2;
    const life = 2.5 + Math.random() * 4.5;          // seconds
    const hue = Math.random() < 0.35 ? accent : ink; // mostly ink, sometimes accent
    ripples.push({ x, y, r: 0, speed, maxR, width, life, age: 0, color: hue });
  }

  function step(ts){
    const dt = Math.min(0.05, (ts - tPrev) / 1000);
    tPrev = ts;

    spawnTimer -= dt;
    if (spawnTimer <= 0){
      // random cadence: sometimes fast, sometimes slow
      spawnTimer = 0.35 + Math.random() * 1.2;
      spawnRipple();
      if (Math.random() < 0.18) spawnRipple();
    }

    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = "lighter";

    for (let i = ripples.length - 1; i >= 0; i--){
      const r = ripples[i];
      r.age += dt;
      r.r += r.speed * dt;
      const p = r.age / r.life;
      if (r.r > r.maxR || p >= 1){
        ripples.splice(i,1);
        continue;
      }

      const alpha = (1 - p) * 0.35;
      const fadeEdge = Math.max(0, Math.min(1, (r.maxR - r.r) / 120));
      const a = alpha * fadeEdge;

      ctx.lineWidth = r.width;
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = a;

      // ring with soft glow (two passes)
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = a * 0.45;
      ctx.lineWidth = r.width * 2.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
