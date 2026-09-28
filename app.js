(() => {
  "use strict";

  const DATA = (typeof PERSON_DATA !== "undefined" && Array.isArray(PERSON_DATA)) ? PERSON_DATA : [];
  const $ = id => document.getElementById(id);
  const norm = s => String(s ?? "").trim().toLowerCase()
    .replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");

  const pageSize = 60;
  let matches = [];
  let page = 1;

  function field(r, i){ return String(r?.[i] ?? "").trim(); }
  function fullName(r){ return [field(r,3),field(r,4),field(r,5)].filter(Boolean).join(" "); }
  function familyId(r){ return field(r,1); }
  function birthYear(r){
    const x = field(r,7);
    const m = x.match(/(18|19|20)\d{2}/);
    return m ? Number(m[0]) : null;
  }
  function ageOf(r){
    const y = birthYear(r);
    if(!y) return null;
    return new Date().getFullYear() - y;
  }
  function matchesAge(r, q){
    if(!q) return true;
    const n = Number(q);
    if(!Number.isFinite(n)) return false;
    const y = birthYear(r);
    if(n >= 1800 && n <= new Date().getFullYear()) return y === n;
    const a = ageOf(r);
    return a === n;
  }

  function render(){
    const box = $("results");
    box.innerHTML = "";
    const total = matches.length;
    $("count").textContent = total ? `${total.toLocaleString()} ئەنجام` : "هیچ ئەنجامێک نییە";
    if(!total){
      box.innerHTML = `<div class="empty">هیچ کەسێک بەو زانیارییە نەدۆزرایەوە.</div>`;
      $("pager").innerHTML = "";
      return;
    }
    const pages = Math.ceil(total / pageSize);
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize;
    const chunk = matches.slice(start, start + pageSize);

    const frag = document.createDocumentFragment();
    chunk.forEach(r => {
      const b = birthYear(r), a = ageOf(r);
      const btn = document.createElement("button");
      btn.className = "person";
      btn.type = "button";
      btn.innerHTML = `
        <div class="avatar">${escapeHtml(field(r,3).slice(0,1) || "?")}</div>
        <div class="person-main">
          <div class="person-name">${escapeHtml(fullName(r) || "بێ ناو")}</div>
          <div class="person-meta">ژمارەی خێزان: ${escapeHtml(familyId(r))}${b ? ` · ${b}` : ""}${a !== null ? ` · تەمەن ${a}` : ""}</div>
        </div>
        <div class="chev">‹</div>`;
      btn.addEventListener("click", () => openPerson(r));
      frag.appendChild(btn);
    });
    box.appendChild(frag);

    const pager = $("pager");
    pager.innerHTML = "";
    if(pages > 1){
      const from = Math.max(1, page - 2), to = Math.min(pages, page + 2);
      if(page > 1) addPage("‹", page-1);
      for(let i=from;i<=to;i++) addPage(String(i), i, i===page);
      if(page < pages) addPage("›", page+1);
    }
    function addPage(label,n,active=false){
      const b=document.createElement("button"); b.textContent=label; b.className=active?"active":"";
      b.onclick=()=>{page=n;render();scrollTo({top:$("results").offsetTop-20,behavior:"smooth"});};
      pager.appendChild(b);
    }
  }

  function search(){
    const n=norm($("name").value), f=norm($("father").value), g=norm($("grandfather").value), a=$("age").value.trim();
    if(!n&&!f&&!g&&!a){
      matches=[]; page=1; $("count").textContent="خانەکان پڕ بکە"; render(); return;
    }
    const out=[];
    for(const r of DATA){
      if(n && !norm(field(r,3)).includes(n)) continue;
      if(f && !norm(field(r,4)).includes(f)) continue;
      if(g && !norm(field(r,5)).includes(g)) continue;
      if(a && !matchesAge(r,a)) continue;
      out.push(r);
    }
    matches=out; page=1; render();
  }

  function openPerson(r){
    const fid=familyId(r);
    const family=[];
    if(fid){
      for(const x of DATA) if(familyId(x)===fid) family.push(x);
    }
    $("modalContent").innerHTML = `
      <div class="detail-head">
        <h2>${escapeHtml(fullName(r)||"بێ ناو")}</h2>
        <p>ژمارەی خێزان: ${escapeHtml(fid||"—")}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><small>ناو</small><b>${escapeHtml(field(r,3)||"—")}</b></div>
        <div class="detail-item"><small>باوک</small><b>${escapeHtml(field(r,4)||"—")}</b></div>
        <div class="detail-item"><small>باپیر</small><b>${escapeHtml(field(r,5)||"—")}</b></div>
        <div class="detail-item"><small>ساڵی لەدایکبوون</small><b>${escapeHtml(String(birthYear(r)||"—"))}</b></div>
        <div class="detail-item"><small>تەمەن</small><b>${ageOf(r) ?? "—"}</b></div>
        <div class="detail-item"><small>ژمارەی خێزان</small><b>${escapeHtml(fid||"—")}</b></div>
      </div>
      <h3 class="family-title">هەموو ئەندامانی هەمان خێزان (${family.length})</h3>
      <div class="family-list">
        ${family.map(x => `<div class="family-member"><b>${escapeHtml(fullName(x)||"بێ ناو")}</b><span>${escapeHtml(field(x,3))} · باوک: ${escapeHtml(field(x,4))} · باپیر: ${escapeHtml(field(x,5))}${ageOf(x)!==null ? ` · تەمەن: ${ageOf(x)}` : ""}</span></div>`).join("")}
      </div>`;
    $("modal").classList.remove("hidden");
    $("modal").setAttribute("aria-hidden","false");
  }

  function closeModal(){ $("modal").classList.add("hidden"); $("modal").setAttribute("aria-hidden","true"); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  function setTheme(){
    const saved=localStorage.getItem("personTheme");
    if(saved==="light") document.documentElement.className="light";
    else if(saved==="dark") document.documentElement.className="dark";
    else document.documentElement.className="";
    $("themeBtn").textContent=document.documentElement.classList.contains("dark")?"☀":"☾";
  }

  function toggleTheme(){
    const dark=!document.documentElement.classList.contains("dark");
    document.documentElement.className=dark?"dark":"light";
    localStorage.setItem("personTheme",dark?"dark":"light");
    $("themeBtn").textContent=dark?"☀":"☾";
  }

  ["name","father","grandfather","age"].forEach(id => $(id).addEventListener("keydown",e=>{if(e.key==="Enter")search();}));
  ["name","father","grandfather","age"].forEach(id => $(id).addEventListener("input", () => search()));
  $("searchBtn").onclick=search;
  $("clearBtn").onclick=()=>{["name","father","grandfather","age"].forEach(id=>$(id).value="");matches=[];page=1;render();};
  $("closeModal").onclick=closeModal;
  $("modalBackdrop").onclick=closeModal;
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});


  // File:// compatible: no fetch(), no modules, no server required.
  // Data is already loaded by the classic script tag above.
  $("loadStatus").textContent=`${DATA.length.toLocaleString()} تۆمار ئامادەیە`;
  $("hint").textContent="لەگەڵ هەر پیتێکدا گەڕان بەخۆکار دەکرێت.";
  $("progressBar").style.width="100%";
  setTimeout(()=>{
    $("splash").classList.add("hidden");
    $("app").classList.remove("hidden");
  },500);
})();
