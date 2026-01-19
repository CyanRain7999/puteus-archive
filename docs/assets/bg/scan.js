(function(){
  const root = document.getElementById("puteus-bg-root");
  if (!root) return;
  if (root.querySelector(".puteus-scan")) return;

  const layer = document.createElement("div");
  layer.className = "puteus-bg-fill puteus-scan";
  root.appendChild(layer);
})();
