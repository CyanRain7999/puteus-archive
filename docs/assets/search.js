(function () {
  const input = document.getElementById("q");
  const results = document.getElementById("results");
  if (!input || !results) return;

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

  function render(items){
    if(!items.length){results.innerHTML="<div class='muted'>没有匹配结果。</div>";return;}
    results.innerHTML=items.map(it=>`
      <div class="item">
        <div class="item__title"><a href="${esc(it.url)}">${esc(it.id)} · ${esc(it.title)}</a></div>
        <div class="item__meta muted tiny">${esc(it.ordo)} · ${esc(it.date||"")} · ${esc(it.puteus||"")}</div>
        <div class="muted">${esc(it.summary||"")}</div>
        <div class="item__meta">${(it.tags||[]).slice(0,10).map(t=>`<span class="badge">${esc(t)}</span>`).join(" ")}</div>
      </div>`).join("");
  }

  let data=[];
  async function load(){
    const res=await fetch("data/entries.json",{cache:"no-store"});
    data=await res.json();
    const params=new URLSearchParams(location.search);
    const preset=params.get("q"); if(preset) input.value=preset;
    run();
  }
  function run(){
    const q=input.value.trim().toLowerCase();
    if(!q){render([]);return;}
    const out=data.filter(it=>{
      const hay=[it.id,it.title,it.summary,it.ordo,it.puteus,it.mersor,...(it.tags||[])].join(" ").toLowerCase();
      return hay.includes(q);
    }).slice(0,50);
    render(out);
  }
  input.addEventListener("input",run);
  load();
})();
