(function(){
  const root = document.getElementById("puteus-bg-root");
  if (!root) return;
  if (root.querySelector("canvas[data-bg='neural']")) return;

  const canvas = document.createElement("canvas");
  canvas.dataset.bg = "neural";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  root.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha:true });
  let w=0,h=0,dpr=1;

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
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize, { passive:true });
  resize();

  const N = Math.max(40, Math.min(80, Math.floor((w*h)/22000)));
  const nodes = [];
  for (let i=0;i<N;i++){
    nodes.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx:(Math.random()*2-1)*12,
      vy:(Math.random()*2-1)*12,
      r: 1.0 + Math.random()*1.6
    });
  }

  const pulses = []; // {a, b, t, speed, color}
  let tPrev = performance.now();
  let pulseTimer = 0;

  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx+dy*dy; }

  function step(ts){
    const dt = Math.min(0.05, (ts - tPrev)/1000);
    tPrev = ts;

    // move nodes
    for (const n of nodes){
      n.x += n.vx*dt;
      n.y += n.vy*dt;
      // bounce with soft wrap
      if (n.x < -20) n.x = w+20;
      if (n.x > w+20) n.x = -20;
      if (n.y < -20) n.y = h+20;
      if (n.y > h+20) n.y = -20;
    }

    pulseTimer -= dt;
    if (pulseTimer <= 0){
      pulseTimer = 0.22 + Math.random()*0.75;
      // pick two close nodes
      let tries = 0;
      while (tries++ < 20){
        const a = nodes[Math.floor(Math.random()*nodes.length)];
        const b = nodes[Math.floor(Math.random()*nodes.length)];
        if (a===b) continue;
        const d = dist2(a,b);
        if (d < 180*180 && d > 40*40){
          pulses.push({ a, b, t: 0, speed: 0.7 + Math.random()*1.3, color: (Math.random()<.35?accent:ink) });
          break;
        }
      }
    }

    // clear
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = "lighter";

    // draw links
    const maxD = 180;
    const maxD2 = maxD*maxD;
    ctx.lineWidth = 1;

    for (let i=0;i<nodes.length;i++){
      const a = nodes[i];
      for (let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const d = dist2(a,b);
        if (d > maxD2) continue;
        const t = 1 - d/maxD2;
        ctx.globalAlpha = 0.12 * t;
        ctx.strokeStyle = (t > 0.55 ? accent : ink);
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }

    // draw nodes
    for (const n of nodes){
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fill();
    }

    // pulses
    for (let i=pulses.length-1;i>=0;i--){
      const p = pulses[i];
      p.t += dt * p.speed;
      if (p.t >= 1){ pulses.splice(i,1); continue; }
      const x = p.a.x + (p.b.x - p.a.x)*p.t;
      const y = p.a.y + (p.b.y - p.a.y)*p.t;
      ctx.globalAlpha = 0.55*(1-p.t);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x,y,2.2,0,Math.PI*2);
      ctx.fill();

      ctx.globalAlpha = 0.18*(1-p.t);
      ctx.beginPath();
      ctx.arc(x,y,6.5,0,Math.PI*2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
