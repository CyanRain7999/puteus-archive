(function(){
  const root = document.getElementById("puteus-bg-root");
  if (!root) return;
  if (root.querySelector("canvas[data-bg='hybrid']")) return;

  const canvas = document.createElement("canvas");
  canvas.dataset.bg = "hybrid";
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

  function nodeCount(){
    const n = Math.floor((w*h)/22000);
    return Math.max(36, Math.min(78, n));
  }

  let N = nodeCount();
  let nodes = [];
  function initNodes(){
    N = nodeCount();
    nodes = [];
    for (let i=0;i<N;i++){
      nodes.push({
        x: Math.random()*w,
        y: Math.random()*h,
        vx:(Math.random()*2-1)*(10 + Math.random()*10),
        vy:(Math.random()*2-1)*(10 + Math.random()*10),
        r: 1.0 + Math.random()*1.7
      });
    }
  }
  initNodes();

  let prevArea = w*h;
  function maybeReinit(){
    const area = w*h;
    if (Math.abs(area - prevArea) / Math.max(1, prevArea) > 0.35){
      prevArea = area;
      initNodes();
    }
  }

  const pulses = []; // {a,b,t,speed,color}
  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx+dy*dy; }

  const ripples = []; // {x,y,r,speed,maxR,width,life,age,color}
  function spawnRipple(){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const speed = 18 + Math.random()*110;
    const maxR = 90 + Math.random()*520;
    const width = 0.8 + Math.random()*2.0;
    const life = 2.6 + Math.random()*4.4;
    const color = (Math.random() < 0.30 ? accent : ink);
    ripples.push({x,y,r:0,speed,maxR,width,life,age:0,color});
  }

  let tPrev = performance.now();
  let pulseTimer = 0;
  let rippleTimer = 0;

  function step(ts){
    const dt = Math.min(0.05, (ts - tPrev)/1000);
    tPrev = ts;

    maybeReinit();

    for (const n of nodes){
      n.x += n.vx*dt;
      n.y += n.vy*dt;
      if (n.x < -24) n.x = w+24;
      if (n.x > w+24) n.x = -24;
      if (n.y < -24) n.y = h+24;
      if (n.y > h+24) n.y = -24;
    }

    pulseTimer -= dt;
    if (pulseTimer <= 0){
      pulseTimer = 0.22 + Math.random()*0.80;
      let tries = 0;
      while (tries++ < 22){
        const a = nodes[(Math.random()*nodes.length)|0];
        const b = nodes[(Math.random()*nodes.length)|0];
        if (a === b) continue;
        const d = dist2(a,b);
        if (d < 190*190 && d > 48*48){
          pulses.push({
            a,b,t:0,
            speed: 0.65 + Math.random()*1.4,
            color: (Math.random()<.35?accent:ink)
          });
          break;
        }
      }
    }

    rippleTimer -= dt;
    if (rippleTimer <= 0){
      rippleTimer = 0.40 + Math.random()*1.25;
      spawnRipple();
      if (Math.random() < 0.16) spawnRipple();
    }

    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = "lighter";

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
        ctx.globalAlpha = 0.10 * t;
        ctx.strokeStyle = (t > 0.58 ? accent : ink);
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }

    for (const n of nodes){
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fill();
    }

    for (let i=pulses.length-1;i>=0;i--){
      const p = pulses[i];
      p.t += dt * p.speed;
      if (p.t >= 1){ pulses.splice(i,1); continue; }
      const x = p.a.x + (p.b.x - p.a.x)*p.t;
      const y = p.a.y + (p.b.y - p.a.y)*p.t;

      ctx.globalAlpha = 0.52*(1-p.t);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x,y,2.2,0,Math.PI*2);
      ctx.fill();

      ctx.globalAlpha = 0.18*(1-p.t);
      ctx.beginPath();
      ctx.arc(x,y,7.0,0,Math.PI*2);
      ctx.fill();
    }

    for (let i=ripples.length-1;i>=0;i--){
      const r = ripples[i];
      r.age += dt;
      r.r += r.speed*dt;
      const p = r.age / r.life;
      if (r.r > r.maxR || p >= 1){ ripples.splice(i,1); continue; }

      const alpha = (1-p) * 0.33;
      const fadeEdge = Math.max(0, Math.min(1, (r.maxR - r.r)/130));
      const a = alpha * fadeEdge;

      ctx.strokeStyle = r.color;
      ctx.globalAlpha = a;
      ctx.lineWidth = r.width;
      ctx.beginPath();
      ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
      ctx.stroke();

      ctx.globalAlpha = a*0.45;
      ctx.lineWidth = r.width*2.6;
      ctx.beginPath();
      ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
