"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const P=id=>PRODUCTS.find(p=>p.id===id);
const colIdx=(p,name)=>Math.max(0,p.colors.findIndex(c=>c.name===name));
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)").matches;
let cart=JSON.parse(localStorage.getItem("gc_cart")||"{}");
const saveCart=()=>{localStorage.setItem("gc_cart",JSON.stringify(cart));renderCartCount()};
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("show"),2600)}
/* ---------- pricing ---------- */
const qtyOf=pid=>Object.values(cart[pid]||{}).reduce((a,s)=>a+Object.values(s).reduce((x,y)=>x+y,0),0);
const tierOf=q=>TIERS.find(t=>q>=t.min)||{min:0,off:0};
function lineCalc(pid,grid){const p=P(pid);let q=0,gross=0;for(const c in grid)for(const s in grid[c]){const n=grid[c][s]||0;q+=n;gross+=n*(p.price+SIZE_EXTRA[s])}
 const t=tierOf(q);return{q,gross,disc:gross*t.off,net:gross*(1-t.off),off:t.off,moqOk:q>=p.moq}}
function totals(){let sub=0,disc=0,q=0;const bad=[];for(const pid in cart){const l=lineCalc(pid,cart[pid]);if(!l.q)continue;sub+=l.gross;disc+=l.disc;q+=l.q;if(!l.moqOk)bad.push(P(pid).name)}
 const taxable=sub-disc,gst=taxable*GST_RATE,ship=taxable>25000||!q?0:499;return{sub,disc,taxable,gst,ship,grand:taxable+gst+ship,q,bad}}
/* ---------- modal helpers ---------- */
let lastFocus=null;
function openModal(id){lastFocus=document.activeElement;const m=$(id);m.classList.add("show");setTimeout(()=>m.querySelector("input,button:not(.x)")?.focus({preventScroll:true}),350)}
function closeModal(m){m.classList.remove("show");lastFocus?.focus?.({preventScroll:true})}
/* ---------- preloader ---------- */
function preload(){const urls=["assets/storefront.svg","assets/interior.svg","assets/doorL.svg","assets/doorR.svg","assets/consultant.svg",...PRODUCTS.map(p=>img(p.id))];
 let n=0;const bar=$("#plBar"),pct=$("#plPct");
 return new Promise(res=>{const tick=()=>{n++;const v=Math.round(n/urls.length*100);bar.style.width=v+"%";pct.textContent=v;if(n===urls.length)setTimeout(res,450)};
  urls.forEach(u=>{const i=new Image();i.onload=i.onerror=tick;i.src=u});setTimeout(res,7000)})}
/* ---------- intro ---------- */
let introDone=false;
function introFinishedAnim(){$("#introHint").style.opacity=0;$("#welcome").classList.add("show");$("#enterBtn").focus({preventScroll:true})}
function enterShop(openChatAfter){if(introDone)return;introDone=true;sessionStorage.setItem("gc_seen","1");
 $("#intro").classList.add("gone");document.body.classList.remove("intro-on");window.ThreeIntro?.stop?.();
 setTimeout(()=>{$$(".hero .reveal").forEach((e,i)=>setTimeout(()=>e.classList.add("in"),i*140));countUp();if(openChatAfter)openChat()},500)}
function run2D(){const s=$("#intro2d");s.classList.add("on");$("#introCanvas").style.display="none";
 setTimeout(()=>$("#introSign").classList.add("on"),200);
 setTimeout(()=>s.classList.add("open"),1500);setTimeout(()=>{$("#introSign").classList.add("away");s.classList.add("fly")},2700);setTimeout(introFinishedAnim,6200)}
async function startIntro(){
 if(sessionStorage.getItem("gc_seen")||REDUCED){$("#intro").classList.add("gone");introDone=true;$$(".hero .reveal").forEach(e=>e.classList.add("in"));countUp();return}
 document.body.classList.add("intro-on");
 for(let i=0;i<30&&window.ThreeIntro===undefined;i++)await new Promise(r=>setTimeout(r,100));
 const T=window.ThreeIntro;
 if(T&&T.ok){$("#introSign").classList.add("on");T.play({onDoors:()=>$("#introSign").classList.add("away"),onDone:introFinishedAnim})}else run2D()}
/* ---------- catalog ---------- */
let curCat="";
function renderChips(){const cats=["",...new Set(PRODUCTS.map(p=>p.cat))];$("#catChips").innerHTML=cats.map(c=>`<button class="chip ${c===curCat?"on":""}" data-cat="${c}" role="tab" aria-selected="${c===curCat}">${c||"All"}</button>`).join("")}
function renderCatalog(){const q=$("#search").value.toLowerCase().trim(),so=$("#sort").value;
 let list=PRODUCTS.filter(p=>(!curCat||p.cat===curCat)&&(!q||(p.name+" "+p.fabric+" "+p.tags.join(" ")+" "+p.colors.map(c=>c.name).join(" ")+" "+p.cat).toLowerCase().includes(q)));
 if(so)list=[...list].sort((a,b)=>so==="lo"?a.price-b.price:so==="hi"?b.price-a.price:a.moq-b.moq);
 $("#grid").innerHTML=list.map((p,i)=>`<article class="card reveal" style="transition-delay:${(i%4)*90}ms">
  <div class="ph"><span class="tag">${p.cat}</span>${qtyOf(p.id)?`<span class="incart">${qtyOf(p.id)} in bag</span>`:""}
  <img class="a" src="${img(p.id)}" alt="${p.name} in ${p.colors[0].name}" loading="lazy"><img class="b" src="${img(p.id,1)}" alt="" loading="lazy">
  <div class="acts"><button class="btn glassy" data-qv="${p.id}">Quick view</button><button class="btn dark" data-matrix="${p.id}">Configure</button></div></div>
  <div class="meta"><h3>${p.name}</h3><div class="price">${inr(p.price)}</div><div class="sub">${p.fabric}</div><div class="sub r">per piece · MOQ ${p.moq}</div>
  <div class="swatches">${p.colors.map((c,j)=>`<button class="sw ${j?"":"on"}" title="${c.name}" aria-label="${c.name}" style="background:${c.hex}" data-pid="${p.id}" data-ci="${j}"></button>`).join("")}<span class="swcount">${p.colors.length} colourways</span></div></div></article>`).join("")||`<p style="color:var(--muted)">No designs match your search.</p>`;
 observeReveals()}
/* ---------- quick view ---------- */
function openQV(pid,ci=0){const p=P(pid);
 $("#qvBody").innerHTML=`<div class="qvg"><div class="gal"><div class="thumbs">${p.colors.map((c,j)=>`<button data-qvc="${j}" class="${j===ci?"on":""}" aria-label="${c.name}"><img src="${img(pid,j)}" alt=""></button>`).join("")}</div>
 <div class="zoom" id="zoom"><img id="qvImg" src="${img(pid,ci)}" alt="${p.name}"><span class="zhint">Hover to zoom</span></div></div>
 <div class="qvinfo"><div class="eyebrow">${p.cat} · ${p.fit}</div><h2>${p.name}</h2><div class="pr">${inr(p.price)} <small>per piece, excl. GST · XXL +₹10 · 3XL +₹20</small></div>
 <p>${p.desc}</p><div class="colname">Colour: <b id="qvCol">${p.colors[ci].name}</b></div>
 <div class="swatches" style="margin:0">${p.colors.map((c,j)=>`<button class="sw ${j===ci?"on":""}" data-qvc="${j}" aria-label="${c.name}" style="background:${c.hex}"></button>`).join("")}</div>
 <div class="specs"><div><span>Fabric</span>${p.fabric}</div><div><span>Construction</span>${p.weave}</div><div><span>Details</span>${p.features}</div><div><span>Sizes</span>S – 3XL</div><div><span>Minimum order</span>${p.moq} pieces (mix any colours & sizes)</div><div><span>Care</span>Machine wash cold · Warm iron</div></div>
 <button class="linkbtn" data-sizeguide>View size guide</button>
 <button class="btn dark block" data-matrix="${pid}">Configure wholesale order</button></div></div>`;
 const z=$("#zoom"),im=$("#qvImg");z.onmousemove=e=>{const r=z.getBoundingClientRect();im.style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;z.classList.add("z")};z.onmouseleave=()=>z.classList.remove("z");
 $("#qvBody").onclick=e=>{const b=e.target.closest("[data-qvc]");if(!b)return;const j=+b.dataset.qvc;im.style.opacity=0;setTimeout(()=>{im.src=img(pid,j);im.style.opacity=1},180);$("#qvCol").textContent=p.colors[j].name;$$("#qvBody [data-qvc]").forEach(x=>x.classList.toggle("on",+x.dataset.qvc===j))};
 openModal("#qvModal")}
function openSize(){$("#sizeBody").innerHTML=`<div class="eyebrow">Fit Guidance</div><h2 style="font-size:40px;margin:8px 0">Size guide</h2><p style="color:var(--muted);font-size:13px">Garment measurements in inches. Most retailers stock a 1 : 2 : 2 : 2 : 1 : 1 ratio across S – 3XL.</p>
 <table class="sgt"><tr><th>Size</th><th>Chest</th><th>Length</th><th>Sleeve</th><th>Surcharge</th></tr>${SIZES.map(s=>`<tr><td><b>${s}</b></td><td>${SIZE_CHART[s][0]}"</td><td>${SIZE_CHART[s][1]}"</td><td>${SIZE_CHART[s][2]}"</td><td>${SIZE_EXTRA[s]?"+₹"+SIZE_EXTRA[s]:"—"}</td></tr>`).join("")}</table>`;openModal("#sizeModal")}
/* ---------- matrix ---------- */
let mPid=null,mGrid={};
function openMatrix(pid){$$(".modal.show").forEach(m=>m.classList.remove("show"));closeCart();mPid=pid;const p=P(pid);mGrid=JSON.parse(JSON.stringify(cart[pid]||{}));
 $("#matrixBody").innerHTML=`<div class="mhead"><img src="${img(pid)}" alt=""><div><div class="eyebrow">Order Matrix</div><h2>${p.name}</h2><div class="sub">${p.fabric} · ${inr(p.price)} per piece · XXL +₹10 · 3XL +₹20 · Minimum ${p.moq} pieces</div></div></div>
 <div class="fillrow">Quick fill <input type="number" min="0" id="qf" value="6" aria-label="Quick fill quantity"><button class="pill" id="qfAll">Every cell</button><button class="pill" id="qfRatio">Retail ratio 1:2:2:2:1:1</button><button class="pill" id="qfClear">Clear</button><button class="pill" data-sizeguide>Size guide</button></div>
 <div class="tablewrap"><table class="mtable"><thead><tr><th>Colour</th>${SIZES.map(s=>`<th>${s}</th>`).join("")}<th>Total</th></tr></thead><tbody>
 ${p.colors.map((c,j)=>`<tr><td><div class="rowc"><img src="${img(pid,j)}" alt="">${c.name}</div></td>${SIZES.map(s=>`<td><input type="number" min="0" inputmode="numeric" data-c="${c.name}" data-s="${s}" value="${mGrid[c.name]?.[s]||""}" placeholder="0" aria-label="${c.name} ${s}"></td>`).join("")}<td class="tot" data-rt="${c.name}">0</td></tr>`).join("")}
 <tr class="ft"><td><b style="font-size:10px;letter-spacing:.2em;text-transform:uppercase">Size total</b></td>${SIZES.map(s=>`<td class="tot" data-ct="${s}">0</td>`).join("")}<td class="tot" id="gt">0</td></tr></tbody></table></div>
 <div class="msum"><div id="msum"></div><button class="btn gold" id="mAdd">Add to bag</button><div class="tierbar"><b id="tbar"></b>${[50,100,250,500].map(v=>`<i style="left:${v/6}%"></i>`).join("")}</div></div>`;
 openModal("#matrixModal");updMatrix()}
function readMatrix(){mGrid={};$$("#matrixBody input[data-c]").forEach(i=>{const n=Math.max(0,parseInt(i.value)||0);i.classList.toggle("f",n>0);if(n)(mGrid[i.dataset.c]??={})[i.dataset.s]=n})}
function updMatrix(){readMatrix();const p=P(mPid);
 p.colors.forEach(c=>$(`[data-rt="${CSS.escape(c.name)}"]`).textContent=SIZES.reduce((a,s)=>a+(mGrid[c.name]?.[s]||0),0));
 SIZES.forEach(s=>$(`[data-ct="${s}"]`).textContent=p.colors.reduce((a,c)=>a+(mGrid[c.name]?.[s]||0),0));
 const l=lineCalc(mPid,mGrid);$("#gt").textContent=l.q;const nt=[...TIERS].reverse().find(t=>t.min>l.q);
 $("#tbar").style.width=Math.min(100,l.q/6)+"%";
 $("#msum").innerHTML=`<div class="big">${inr(l.net)} <span style="font-size:14px;font-family:var(--sans);color:#ffffff88">+ GST</span></div>
 <div class="small">${l.q} pieces · Gross ${inr(l.gross)}${l.off?` · <span class="st-ok">Volume saving ${l.off*100}% (−${inr(l.disc)})</span>`:""}<br>
 ${l.q===0?"Enter quantities for each colour and size.":l.moqOk?`<span class="st-ok">✓ Minimum order met</span>`:`<span class="st-warn">${p.moq-l.q} more pieces needed to reach the ${p.moq}-piece minimum</span>`}${nt&&l.q?` · Add ${nt.min-l.q} more for ${nt.off*100}% off`:""}</div>`}
function commitMatrix(){readMatrix();const l=lineCalc(mPid,mGrid),p=P(mPid);
 if(l.q===0){if(cart[mPid]){delete cart[mPid];saveCart();renderCatalog();toast(`${p.name} removed from bag`)}closeModal($("#matrixModal"));return}
 if(!l.moqOk){toast(`Minimum order for ${p.name} is ${p.moq} pieces`);return}
 cart[mPid]=mGrid;saveCart();closeModal($("#matrixModal"));toast(`${l.q} pieces of ${p.name} added to your bag`);renderCatalog();setTimeout(openCart,300)}
/* ---------- cart ---------- */
function renderCartCount(){const b=$("#cartCount");b.textContent=Object.keys(cart).reduce((a,k)=>a+qtyOf(k),0);b.classList.add("bump");setTimeout(()=>b.classList.remove("bump"),400)}
function openCart(){renderCart();$("#cart").classList.add("show");$("#scrim").classList.add("show")}
function closeCart(){$("#cart").classList.remove("show");$("#scrim").classList.remove("show")}
function renderCart(){const ids=Object.keys(cart).filter(k=>qtyOf(k));
 if(!ids.length){$("#cartBody").innerHTML=`<div class="empty"><span class="mono-s big">G<i></i>C</span><h4>Your bag is empty</h4><p>Configure a design from the collection to begin.</p><button class="btn dark" id="browse">Browse the collection</button></div>`;return}
 const t=totals();
 $("#cartBody").innerHTML=ids.map((pid,k)=>{const p=P(pid),l=lineCalc(pid,cart[pid]),first=Object.keys(cart[pid])[0];return`<div class="citem" style="animation-delay:${k*80}ms"><img src="${img(pid,colIdx(p,first))}" alt=""><div>
 <h4>${p.name}<span>${inr(l.net)}</span></h4><div class="sub">${l.q} pieces${l.off?` · ${l.off*100}% volume pricing`:""}${l.moqOk?"":` · <span style="color:var(--err)">below ${p.moq}-piece minimum</span>`}</div>
 <div class="brk">${Object.entries(cart[pid]).map(([c,s])=>`<div><span><i style="background:${p.colors[colIdx(p,c)].hex}"></i>${c}</span><span>${Object.entries(s).map(([z,n])=>`${z} ${n}`).join(" · ")}</span></div>`).join("")}</div>
 <div class="cacts"><button data-matrix="${pid}">Edit</button><button data-remove="${pid}">Remove</button></div></div></div>`}).join("")+
 `<div class="totals"><div><span>Subtotal · ${t.q} pieces</span><span>${inr(t.sub)}</span></div>${t.disc?`<div class="sv"><span>Volume savings</span><span>−${inr(t.disc)}</span></div>`:""}<div><span>Taxable value</span><span>${inr(t.taxable)}</span></div><div><span>GST (5%)</span><span>${inr(t.gst)}</span></div><div><span>Shipping</span><span>${t.ship?inr(t.ship):"Complimentary"}</span></div>
 <div class="grand"><span>Total</span><span>${inr(t.grand)}</span></div>${t.ship?`<p style="font-size:11.5px;color:var(--muted);margin:6px 0">Add ${inr(25000-t.taxable)} more for complimentary shipping.</p>`:""}
 ${t.bad.length?`<p class="warnline">Minimum order not met: ${t.bad.join(", ")}</p>`:""}<button class="btn dark block" style="margin-top:16px" id="toCheckout" ${t.bad.length?"disabled":""}>Proceed to checkout</button></div>`}
/* ---------- checkout ---------- */
let step=0,buyer={};const STEPS=["Business","Delivery","Payment","Review"];
const fld=(n,l,o={})=>`<div class="field ${o.full?"full":""}">${o.area?`<textarea id="f_${n}" name="${n}" rows="2" placeholder=" " ${o.req?"required":""}>${buyer[n]||""}</textarea>`:`<input id="f_${n}" name="${n}" placeholder=" " value="${buyer[n]||""}" ${o.req?"required":""} ${o.pattern?`pattern="${o.pattern}"`:""} ${o.type?`type="${o.type}"`:""} ${o.style?`style="${o.style}"`:""}>`}<label for="f_${n}">${l}${o.req?"":" (optional)"}</label><div class="err"></div></div>`;
function openCheckout(){buyer=JSON.parse(localStorage.getItem("gc_buyer")||"{}");buyer.pay=buyer.pay||"UPI";step=0;closeCart();renderStep();openModal("#checkoutModal")}
function renderStep(){const t=totals();
 const head=`<div class="eyebrow">Secure Checkout</div><h2 style="font-size:40px;margin-top:6px">${["Business details","Delivery address","Payment method","Review & confirm"][step]}</h2>
 <div class="progress">${STEPS.map((s,i)=>`<div class="${i<step?"done":i===step?"on":""}">${String(i+1).padStart(2,"0")} ${s}</div>`).join("")}</div>`;
 let body="";
 if(step===0)body=`<form class="form" id="stepForm" novalidate>${fld("name","Contact name",{req:1})}${fld("shop","Business / shop name",{req:1})}${fld("gstin","GSTIN",{pattern:"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]",style:"text-transform:uppercase"})}${fld("phone","Mobile number",{req:1,pattern:"[6-9][0-9]{9}",type:"tel"})}${fld("email","Email",{type:"email",full:1})}</form>`;
 if(step===1)body=`<form class="form" id="stepForm" novalidate>${fld("address","Street address",{req:1,area:1,full:1})}${fld("city","City",{req:1})}${fld("pin","PIN code",{req:1,pattern:"[1-9][0-9]{5}"})}${fld("state","State",{req:1,full:1})}</form>`;
 if(step===2)body=`<form id="stepForm" class="pay">${[["UPI","UPI","Pay instantly via any UPI app — gupta.co@upi (simulated)"],["Bank Transfer","Bank transfer (NEFT / RTGS)","A/c 1234567890 · IFSC SBIN0000123 (simulated)"],["COD","Cash on delivery","20% advance, balance on delivery (simulated)"]].map(([v,l,d])=>`<label><input type="radio" name="pay" value="${v}" ${buyer.pay===v?"checked":""}><b>${l}</b><small>${d}</small></label>`).join("")}</form>`;
 if(step===3)body=`<div class="rev"><div><h5>Bill to</h5><div class="box">${buyer.name} · ${buyer.shop}<br>${buyer.phone}${buyer.email?" · "+buyer.email:""}${buyer.gstin?"<br>GSTIN "+buyer.gstin.toUpperCase():""}</div></div>
 <div><h5>Ship to</h5><div class="box">${buyer.address}<br>${buyer.city}, ${buyer.state} ${buyer.pin}</div></div>
 <div><h5>Order</h5><div class="box">${Object.keys(cart).filter(k=>qtyOf(k)).map(pid=>`<div style="display:flex;justify-content:space-between"><span>${P(pid).name} × ${qtyOf(pid)}</span><span>${inr(lineCalc(pid,cart[pid]).net)}</span></div>`).join("")}
 <div style="display:flex;justify-content:space-between;color:var(--muted)"><span>GST 5% · Shipping</span><span>${inr(t.gst)} · ${t.ship?inr(t.ship):"Free"}</span></div>
 <div style="display:flex;justify-content:space-between;font-family:var(--serif);font-size:24px;margin-top:6px"><span>Total</span><span>${inr(t.grand)}</span></div></div></div><div><h5>Payment</h5><div class="box">${buyer.pay}</div></div></div>`;
 $("#checkoutBody").innerHTML=head+body+`<div class="conav">${step?`<button class="btn line" id="coBack">Back</button>`:`<span></span>`}<button class="btn dark" id="coNext">${step===3?"Place order · "+inr(t.grand):"Continue"}</button></div>`}
function validateStep(){const f=$("#stepForm");if(!f)return true;let ok=true;
 f.querySelectorAll("input:not([type=radio]),textarea").forEach(i=>{const v=i.value.trim();i.value=i.id==="f_gstin"?v.toUpperCase():v;let m="";
  if(i.required&&!v)m="Required";else if(v&&i.pattern&&!new RegExp("^"+i.pattern+"$").test(i.value))m={f_phone:"Enter a valid 10-digit mobile",f_gstin:"Enter a valid 15-character GSTIN",f_pin:"Enter a valid 6-digit PIN"}[i.id]||"Invalid";
  else if(v&&i.type==="email"&&!/^\S+@\S+\.\S+$/.test(v))m="Enter a valid email";
  i.parentNode.querySelector(".err").textContent=m;if(m)ok=false;else buyer[i.name]=i.value});
 const r=f.querySelector("input[type=radio]:checked");if(r)buyer.pay=r.value;return ok}
function placeOrder(){localStorage.setItem("gc_buyer",JSON.stringify(buyer));const t=totals();
 const id="GC-"+new Date().getFullYear()+"-"+Date.now().toString(36).toUpperCase().slice(-5);
 const items=Object.keys(cart).filter(k=>qtyOf(k)).map(pid=>({pid,name:P(pid).name,price:P(pid).price,grid:cart[pid],...lineCalc(pid,cart[pid])}));
 const order={id,date:new Date().toISOString(),buyer:{...buyer},items,totals:t,status:buyer.pay==="COD"?"Confirmed · COD":"Awaiting payment"};
 const os=JSON.parse(localStorage.getItem("gc_orders")||"[]");os.unshift(order);localStorage.setItem("gc_orders",JSON.stringify(os));
 cart={};saveCart();renderCatalog();
 $("#checkoutBody").innerHTML=`<div class="success"><svg class="check" viewBox="0 0 84 84" fill="none" stroke="#c6a15b" stroke-width="1.5"><circle cx="42" cy="42" r="38"/><path d="M27 43l10 10 21-22"/></svg>
 <div class="eyebrow">Order Confirmed</div><h2>Thank you, ${buyer.name.split(" ")[0]}.</h2><div class="oid">${id}</div><p>${t.q} pieces · ${inr(t.grand)} · ${buyer.pay}<br>Ryan will contact you within 24 hours to confirm dispatch.</p>
 <div class="conav" style="justify-content:center"><button class="btn dark" data-print="${id}">View &amp; print invoice</button><button class="btn line" data-close>Continue browsing</button></div></div>`}
function invoiceHTML(o){const b=o.buyer,t=o.totals;return`<div class="inv"><div class="ih"><div><h1>GUPTA &amp; CO.</h1><div style="letter-spacing:.2em;font-size:9px;color:#777;margin-top:4px">FINE SHIRTMAKERS · WHOLESALE</div><p style="margin-top:10px;line-height:1.6">Gandhi Nagar Market, Delhi 110031, India<br>GSTIN 07ABCDE1234F1Z5 · trade@gupta.co</p></div>
 <div class="t"><h2>Tax Invoice</h2><p style="line-height:1.7">No. <b>${o.id}</b><br>${new Date(o.date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}<br>${o.status}</p></div></div>
 <div class="two"><div><h5>Billed to</h5>${b.name}<br><b>${b.shop}</b><br>${b.phone}${b.email?"<br>"+b.email:""}${b.gstin?"<br>GSTIN "+b.gstin:""}</div><div><h5>Shipped to</h5>${b.address}<br>${b.city}, ${b.state||""} ${b.pin||""}<br><br><h5>Payment</h5>${b.pay}</div></div>
 <table><tr><th>Design</th><th>Colour / size breakdown</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Disc.</th><th class="r">Amount</th></tr>
 ${o.items.map(i=>`<tr><td><b>${i.name}</b><br><span style="color:#777">HSN 6205</span></td><td>${Object.entries(i.grid).map(([c,s])=>`${c}: ${Object.entries(s).map(([z,n])=>z+"×"+n).join(", ")}`).join("<br>")}</td><td class="r">${i.q}</td><td class="r">${inr(i.price)}</td><td class="r">${i.off*100}%</td><td class="r">${inr(i.net)}</td></tr>`).join("")}</table>
 <div class="sum"><div><span>Subtotal</span><span>${inr(t.sub)}</span></div><div><span>Volume discount</span><span>−${inr(t.disc)}</span></div><div><span>Taxable value</span><span>${inr(t.taxable)}</span></div><div><span>CGST 2.5%</span><span>${inr(t.gst/2)}</span></div><div><span>SGST 2.5%</span><span>${inr(t.gst/2)}</span></div><div><span>Shipping</span><span>${inr(t.ship)}</span></div><div class="g"><span>Total</span><span>${inr(t.grand)}</span></div></div>
 <div class="foot"><span>Computer-generated invoice · demonstration only</span><span>Thank you for your business.</span></div></div>`}
function printInvoice(id){const o=JSON.parse(localStorage.getItem("gc_orders")||"[]").find(x=>x.id===id);if(!o)return;$("#printArea").innerHTML=invoiceHTML(o);
 $("#ordersBody").innerHTML=invoiceHTML(o)+`<div class="conav" style="justify-content:center"><button class="btn dark" id="doPrint">Print invoice</button><button class="btn line" id="backOrders">All orders</button></div>`;
 $$(".modal.show").forEach(m=>m.classList.remove("show"));openModal("#ordersModal")}
function showOrders(){const os=JSON.parse(localStorage.getItem("gc_orders")||"[]");
 $("#ordersBody").innerHTML=`<div class="eyebrow">Account</div><h2 style="font-size:40px;margin:6px 0 10px">Order history</h2>`+(os.length?os.map(o=>`<div class="orow"><b>${o.id}</b><b>${inr(o.totals.grand)}</b><div class="m">${new Date(o.date).toLocaleString("en-IN")} · ${o.totals.q} pieces · ${o.buyer.pay} · ${o.status}<br>${o.items.map(i=>i.name+" ("+i.q+")").join(", ")}</div><button class="linkbtn" data-print="${o.id}">Invoice</button></div>`).join(""):`<p style="color:var(--muted)">No orders yet.</p>`);
 openModal("#ordersModal")}
/* ---------- chat ---------- */
function addMsg(html,who="bot"){const d=document.createElement("div");d.className="m "+who;d.innerHTML=html;$("#msgs").append(d);$("#msgs").scrollTop=1e9;return d}
let greeted=false;
function openChat(){$("#chat").classList.add("show");$("#chatFab").classList.add("hide");if(!greeted){greeted=true;botReply("__greet__")}setTimeout(()=>$("#chatIn").focus({preventScroll:true}),400)}
function closeChat(){$("#chat").classList.remove("show");$("#chatFab").classList.remove("hide")}
async function botReply(text){const t=addMsg(`<span class="typing"><i></i><i></i><i></i></span>`,"bot");t.style.padding="0";
 const r=await Salesman.respond(text,{cart,totals:totals()});await new Promise(s=>setTimeout(s,700));t.remove();addMsg(r.html);
 $("#quick").innerHTML=(r.quick||["Recommend best-sellers","Show party wear","What is the MOQ?","Volume discounts","Size guide","View my bag"]).map(q=>`<button>${q}</button>`).join("")}
function send(text){if(!text.trim())return;addMsg(text.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])),"me");botReply(text)}
/* ---------- motion ---------- */
let io;function observeReveals(){io??=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
 $$(".reveal:not(.in)").forEach(e=>{if(!e.closest(".hero"))io.observe(e)})}
let counted=false;function countUp(){if(counted)return;counted=true;$$("[data-count]").forEach(el=>{const to=+el.dataset.count,t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
function cursor(){if(!matchMedia("(pointer:fine)").matches)return;document.documentElement.classList.add("has-cursor");const d=$(".cur-dot"),r=$(".cur-ring");let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
 addEventListener("mousemove",e=>{x=e.clientX;y=e.clientY;d.style.transform=`translate(${x}px,${y}px)`;r.classList.toggle("hover",!!e.target.closest("a,button,input,select,textarea,label,.zoom"))});
 (function loop(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;r.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})()}
addEventListener("scroll",()=>{const y=scrollY;$("#hdr").classList.toggle("solid",y>innerHeight*.75);if(y<innerHeight*1.2)$("#heroBg").style.transform=`translateY(${y*.25}px) scale(1.06)`},{passive:true});
/* ---------- events ---------- */
document.addEventListener("click",e=>{const el=e.target.closest("[data-matrix],[data-remove],[data-close],[data-print],[data-qv],.sw[data-pid],.chip,[data-sizeguide],[data-act],#toCheckout,#browse,#coNext,#coBack,#doPrint,#backOrders");if(!el)return;
 if(el.dataset.matrix){closeChat();openMatrix(el.dataset.matrix)}
 else if(el.dataset.qv)openQV(el.dataset.qv);
 else if(el.dataset.remove){const n=P(el.dataset.remove).name;delete cart[el.dataset.remove];saveCart();renderCart();renderCatalog();toast(`${n} removed`)}
 else if(el.hasAttribute("data-close"))closeModal(el.closest(".modal"));
 else if(el.dataset.print)printInvoice(el.dataset.print);
 else if(el.dataset.pid){const card=el.closest(".card"),i=+el.dataset.ci,a=card.querySelector("img.a");a.src=img(el.dataset.pid,i);a.alt=P(el.dataset.pid).name+" in "+P(el.dataset.pid).colors[i].name;card.querySelector("img.b").src=img(el.dataset.pid,(i+1)%P(el.dataset.pid).colors.length);card.querySelectorAll(".sw").forEach(s=>s.classList.toggle("on",s===el))}
 else if(el.classList.contains("chip")){curCat=el.dataset.cat;renderChips();renderCatalog()}
 else if(el.hasAttribute("data-sizeguide"))openSize();
 else if(el.dataset.act==="cart")openCart();
 else if(el.dataset.act==="checkout"){totals().bad.length||!totals().q?openCart():openCheckout()}
 else if(el.dataset.act==="sizes")openSize();
 else if(el.id==="toCheckout")openCheckout();
 else if(el.id==="browse"){closeCart();location.hash="#collection"}
 else if(el.id==="coBack"){step--;renderStep()}
 else if(el.id==="coNext"){if(step===3)placeOrder();else if(validateStep()){step++;renderStep()}}
 else if(el.id==="doPrint")window.print();
 else if(el.id==="backOrders")showOrders()});
$("#matrixModal").addEventListener("input",e=>{if(e.target.dataset.c)updMatrix()});
$("#matrixModal").addEventListener("click",e=>{const q=+($("#qf")?.value)||0,set=f=>{$$("#matrixBody input[data-c]").forEach(f);updMatrix()};
 if(e.target.id==="qfAll")set(i=>i.value=q||"");if(e.target.id==="qfClear")set(i=>i.value="");
 if(e.target.id==="qfRatio"){const r={S:1,M:2,L:2,XL:2,XXL:1,"3XL":1};set(i=>i.value=(q||1)*r[i.dataset.s])}if(e.target.id==="mAdd")commitMatrix()});
$("#checkoutModal").addEventListener("submit",e=>e.preventDefault());
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const m=$$(".modal.show").pop();if(m)closeModal(m);else if($("#cart").classList.contains("show"))closeCart();else if($("#chat").classList.contains("show"))closeChat()}});
$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;$("#scrim").onclick=closeCart;
$("#ordersLink").onclick=showOrders;$("#footOrders").onclick=showOrders;
$("#enterBtn").onclick=()=>enterShop(false);$("#talkBtn").onclick=()=>enterShop(true);$("#skip").onclick=()=>enterShop(false);
$("#heroChat").onclick=openChat;$("#footChat").onclick=openChat;$("#chatFab").onclick=openChat;$("#chatClose").onclick=closeChat;
$("#chatForm").onsubmit=e=>{e.preventDefault();send($("#chatIn").value);$("#chatIn").value=""};
$("#quick").onclick=e=>{if(e.target.tagName==="BUTTON")send(e.target.textContent)};
$("#search").addEventListener("input",renderCatalog);$("#sort").addEventListener("input",renderCatalog);
window.ShopAPI={addToCart(pid,color,perSize){const g=cart[pid]||{};g[color]=g[color]||{};for(const s in perSize)g[color][s]=(g[color][s]||0)+perSize[s];cart[pid]=g;saveCart();renderCatalog();return lineCalc(pid,g)},qtyOf,lineCalc,inr,img,colIdx};
renderChips();renderCatalog();renderCartCount();cursor();
preload().then(()=>{$("#preloader").classList.add("done");document.body.classList.remove("loading");startIntro()});
