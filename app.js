const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const P=id=>PRODUCTS.find(p=>p.id===id);
let cart=JSON.parse(localStorage.getItem("gs_cart")||"{}"); // {pid:{color:{size:qty}}}
const saveCart=()=>{localStorage.setItem("gs_cart",JSON.stringify(cart));renderCartCount()};
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("show"),2200)}
function shade(hex,a){let n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v+a)));return`rgb(${f(r)},${f(g)},${f(b)})`}
function shirtSVG(p,hex){
 const id=p.id+hex.slice(1)+Math.random().toString(36).slice(2,6),dk=shade(hex,-35),lt=shade(hex,25);
 const pats={check:`<pattern id="pt${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${hex}"/><rect width="16" height="5" fill="${dk}" opacity=".5"/><rect width="5" height="16" fill="${dk}" opacity=".5"/></pattern>`,
 stripe:`<pattern id="pt${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="3" height="8" fill="${hex}"/></pattern>`,
 dots:`<pattern id="pt${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${hex}"/><circle cx="7" cy="7" r="2.5" fill="${lt}"/></pattern>`,
 floral:`<pattern id="pt${id}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${hex}"/><g fill="${hex==='#f5f5f5'?'#e86a92':lt}"><circle cx="6" cy="6" r="3"/><circle cx="16" cy="16" r="3"/></g><circle cx="6" cy="6" r="1" fill="#ffd166"/><circle cx="16" cy="16" r="1" fill="#ffd166"/></pattern>`,
 denim:`<pattern id="pt${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${hex}"/><path d="M0 4L4 0" stroke="${lt}" stroke-width=".6"/></pattern>`};
 const fill=pats[p.pattern]?`url(#pt${id})`:hex;
 const sl=p.sleeve==="half"?"M40 30 L8 62 L24 80 L44 60":"M40 30 L6 120 L24 126 L44 62";
 const sr=p.sleeve==="half"?"M120 30 L152 62 L136 80 L116 60":"M120 30 L154 120 L136 126 L116 62";
 const collar=p.collar==="mandarin"?`<rect x="62" y="14" width="36" height="10" rx="4" fill="${dk}"/>`:`<path d="M62 16 L80 40 L70 46 L56 22Z M98 16 L80 40 L90 46 L104 22Z" fill="${p.collar==='formal'?lt:dk}" stroke="${dk}" stroke-width="1"/>`;
 return`<svg viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg"><defs>${pats[p.pattern]||""}<linearGradient id="sh${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs>
 <path d="${sl}Z" fill="${fill}" stroke="${dk}"/><path d="${sr}Z" fill="${fill}" stroke="${dk}"/>
 <path d="M40 30 L62 16 Q80 26 98 16 L120 30 L118 164 L42 164Z" fill="${fill}" stroke="${dk}"/>
 <path d="M40 30 L62 16 Q80 26 98 16 L120 30 L118 164 L42 164Z" fill="url(#sh${id})"/>
 ${collar}<line x1="80" y1="40" x2="80" y2="164" stroke="${dk}" stroke-width="1.2"/>
 ${[56,76,96,116,136].map(y=>`<circle cx="83" cy="${y}" r="2" fill="${dk}"/>`).join("")}
 ${p.cat==="Formal"?`<rect x="92" y="60" width="16" height="16" rx="2" fill="none" stroke="${dk}"/>`:""}</svg>`}
/* pricing */
const qtyOf=pid=>Object.values(cart[pid]||{}).reduce((a,s)=>a+Object.values(s).reduce((x,y)=>x+y,0),0);
const tierOf=q=>TIERS.find(t=>q>=t.min)||{min:0,off:0};
function lineCalc(pid,grid){const p=P(pid);let q=0,gross=0;for(const c in grid)for(const s in grid[c]){const n=grid[c][s]||0;q+=n;gross+=n*(p.price+SIZE_EXTRA[s])}
 const t=tierOf(q);return{q,gross,disc:gross*t.off,net:gross*(1-t.off),off:t.off,moqOk:q>=p.moq}}
function totals(){let sub=0,disc=0,q=0,bad=[];for(const pid in cart){const l=lineCalc(pid,cart[pid]);if(!l.q)continue;sub+=l.gross;disc+=l.disc;q+=l.q;if(!l.moqOk)bad.push(P(pid).name)}
 const taxable=sub-disc,gst=taxable*GST_RATE,ship=taxable>25000||!q?0:499;return{sub,disc,taxable,gst,ship,grand:taxable+gst+ship,q,bad}}
/* intro */
function intro(){const sf=$("#shopfront"),cu=$("#customer");
 if(sessionStorage.getItem("gs_seen")){$("#intro").classList.add("gone");return}
 cu.classList.add("walking");requestAnimationFrame(()=>cu.style.left="calc(50% - 20px)");
 setTimeout(()=>{cu.classList.remove("walking");sf.querySelector(".doorway").classList.add("open")},3100);
 setTimeout(()=>{cu.classList.add("walking");cu.style.transform="scale(.5) translateY(-60px)";cu.style.opacity=0;sf.classList.add("zoom")},4300);
 setTimeout(()=>$("#greet").classList.add("show"),6300)}
function enterShop(){sessionStorage.setItem("gs_seen",1);$("#intro").classList.add("gone");setTimeout(()=>{openChat();},700)}
/* catalog */
function renderCatalog(){const q=$("#search").value.toLowerCase(),cat=$("#catFilter").value,so=$("#sort").value;
 let list=PRODUCTS.filter(p=>(!cat||p.cat===cat)&&(!q||(p.name+p.fabric+p.tags.join(" ")+p.colors.map(c=>c.name).join(" ")).toLowerCase().includes(q)));
 if(so)list=[...list].sort((a,b)=>so==="lo"?a.price-b.price:b.price-a.price);
 $("#grid").innerHTML=list.map((p,i)=>`<div class="card" style="animation-delay:${i*60}ms"><div class="shirtbox" id="sb-${p.id}">${shirtSVG(p,p.colors[0].hex)}<span class="badge">${p.cat}</span></div>
 <div class="cbody"><h3>${p.name}</h3><div class="muted">${p.fabric} • ${p.colors.length} colors • S–3XL</div>
 <div class="price">${inr(p.price)}<small> /piece (excl. GST)</small></div><div class="muted">MOQ: <b>${p.moq} pcs</b> (design total) ${qtyOf(p.id)?`• <b style="color:#1e8449">${qtyOf(p.id)} in cart</b>`:""}</div>
 <div class="swatches">${p.colors.map((c,j)=>`<span class="sw ${j?"":"on"}" title="${c.name}" style="background:${c.hex}" data-pid="${p.id}" data-hex="${c.hex}"></span>`).join("")}</div>
 <button class="btn o" data-matrix="${p.id}">📋 Select Colors × Sizes</button></div></div>`).join("")||"<p>No designs match your search.</p>"}
/* matrix */
let mPid=null,mGrid={};
function openMatrix(pid){mPid=pid;const p=P(pid);mGrid=JSON.parse(JSON.stringify(cart[pid]||{}));
 $("#matrixBody").innerHTML=`<div class="mhead"><div id="mprev">${shirtSVG(p,p.colors[0].hex)}</div><div><h2>${p.name}</h2><div class="muted">${p.fabric} • Base ${inr(p.price)}/pc • XXL +₹10, 3XL +₹20 • MOQ ${p.moq} pcs</div></div></div>
 <div class="fillrow">⚡ Quick fill: set every cell to <input type="number" min="0" id="qf" value="6"> pcs <button class="btn ghost" id="qfAll">Fill all</button> <button class="btn ghost" id="qfRatio">Ratio set (1:2:2:2:1:1 ×)</button> <button class="btn ghost" id="qfClear">Clear</button></div>
 <div class="tablewrap"><table class="mtable"><thead><tr><th>Color \\ Size</th>${SIZES.map(s=>`<th>${s}</th>`).join("")}<th>Total</th></tr></thead><tbody>
 ${p.colors.map(c=>`<tr><td><span class="sw" style="display:inline-block;vertical-align:middle;background:${c.hex}"></span> ${c.name}</td>${SIZES.map(s=>`<td><input type="number" min="0" inputmode="numeric" data-c="${c.name}" data-s="${s}" data-hex="${c.hex}" value="${mGrid[c.name]?.[s]||""}" placeholder="0"></td>`).join("")}<td class="tot" data-rt="${c.name}">0</td></tr>`).join("")}
 <tr class="tot"><td>Size Total</td>${SIZES.map(s=>`<td data-ct="${s}">0</td>`).join("")}<td id="gt">0</td></tr></tbody></table></div>
 <div class="summary"><div id="msum"></div><button class="btn o" id="mAdd">🛒 Add to Cart</button></div>`;
 $("#matrixModal").classList.add("show");updMatrix()}
function readMatrix(){mGrid={};$$("#matrixBody input[data-c]").forEach(i=>{const n=Math.max(0,parseInt(i.value)||0);if(n){(mGrid[i.dataset.c]??={})[i.dataset.s]=n}})}
function updMatrix(){readMatrix();const p=P(mPid);
 p.colors.forEach(c=>$(`[data-rt="${c.name}"]`).textContent=SIZES.reduce((a,s)=>a+(mGrid[c.name]?.[s]||0),0));
 SIZES.forEach(s=>$(`[data-ct="${s}"]`).textContent=p.colors.reduce((a,c)=>a+(mGrid[c.name]?.[s]||0),0));
 const l=lineCalc(mPid,mGrid);$("#gt").textContent=l.q;const nt=TIERS.slice().reverse().find(t=>t.min>l.q);
 $("#msum").innerHTML=`<div><b>${l.q} pcs</b> • Gross ${inr(l.gross)} ${l.off?`• <span class="ok">−${l.off*100}% bulk (${inr(l.disc)})</span>`:""}</div><div style="font-size:20px;font-weight:800">${inr(l.net)} <small class="muted">+GST</small></div>
 <div class="${l.moqOk?"ok":"warn"}">${l.q===0?"Enter quantities":l.moqOk?"✅ MOQ met":"⚠️ "+(p.moq-l.q)+" more pcs needed to meet MOQ"}</div>${nt?`<div class="muted">💡 ${nt.min-l.q} more pcs → ${nt.off*100}% off</div>`:""}`}
function commitMatrix(){readMatrix();const l=lineCalc(mPid,mGrid),p=P(mPid);
 if(l.q===0){delete cart[mPid];saveCart();$("#matrixModal").classList.remove("show");renderCatalog();return}
 if(!l.moqOk){toast(`Minimum order is ${p.moq} pcs — you have ${l.q}`);return}
 cart[mPid]=mGrid;saveCart();$("#matrixModal").classList.remove("show");toast(`✅ ${p.name}: ${l.q} pcs added to cart`);renderCatalog();openCart()}
/* cart */
function renderCartCount(){$("#cartCount").textContent=Object.keys(cart).reduce((a,k)=>a+qtyOf(k),0)}
function openCart(){renderCart();$("#cart").classList.add("show")}
function renderCart(){const ids=Object.keys(cart).filter(k=>qtyOf(k));
 if(!ids.length){$("#cartBody").innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:60px">🛍️</div><p>Your cart is empty. Browse the catalog to add designs.</p></div>`;return}
 const t=totals();
 $("#cartBody").innerHTML=ids.map(pid=>{const p=P(pid),l=lineCalc(pid,cart[pid]);return`<div class="citem"><h4>${p.name}<span>${inr(l.net)}</span></h4>
 <div class="muted">${l.q} pcs ${l.off?`• ${l.off*100}% bulk off`:""} ${l.moqOk?"":`<span class="warn">• MOQ ${p.moq} not met</span>`}</div>
 ${Object.entries(cart[pid]).map(([c,s])=>`<div class="crow"><span>🎨 ${c}</span><span>${Object.entries(s).map(([z,n])=>`${z}:${n}`).join(" · ")}</span></div>`).join("")}
 <div style="display:flex;gap:6px;margin-top:8px"><button class="btn ghost" data-matrix="${pid}">✏️ Edit</button><button class="btn ghost" data-remove="${pid}">🗑 Remove</button></div></div>`}).join("")+
 `<div class="totals"><div><span>Subtotal (${t.q} pcs)</span><span>${inr(t.sub)}</span></div><div class="ok"><span>Bulk discount</span><span>−${inr(t.disc)}</span></div><div><span>Taxable value</span><span>${inr(t.taxable)}</span></div><div><span>GST @5%</span><span>${inr(t.gst)}</span></div><div><span>Shipping ${t.ship?"(free above ₹25,000)":""}</span><span>${t.ship?inr(t.ship):"FREE"}</span></div><div class="grand"><span>Grand Total</span><span>${inr(t.grand)}</span></div></div>
 ${t.bad.length?`<p class="warn">MOQ pending: ${t.bad.join(", ")}</p>`:""}<button class="btn o" style="width:100%;margin-top:12px" id="toCheckout" ${t.bad.length?"disabled style='opacity:.5;width:100%'":""}>Proceed to Checkout →</button>`}
/* checkout */
function openCheckout(){const t=totals(),b=JSON.parse(localStorage.getItem("gs_buyer")||"{}");
 $("#checkoutBody").innerHTML=`<h2>🧾 Checkout</h2><p class="muted">${t.q} pcs • Payable <b>${inr(t.grand)}</b></p><form class="form" id="coForm">
 <label>Contact name *<input name="name" required value="${b.name||""}"></label><label>Shop / Business name *<input name="shop" required value="${b.shop||""}"></label>
 <label>GSTIN (optional)<input name="gstin" placeholder="22AAAAA0000A1Z5" pattern="^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$" title="Valid 15-char GSTIN" value="${b.gstin||""}" style="text-transform:uppercase"></label>
 <label>Mobile *<input name="phone" required pattern="[6-9][0-9]{9}" title="10 digit mobile" value="${b.phone||""}"></label>
 <label>Delivery address *<textarea name="address" required rows="2">${b.address||""}</textarea></label>
 <label>City & PIN *<input name="city" required value="${b.city||""}"></label>
 <b>Payment method</b><div class="pay"><label><input type="radio" name="pay" value="UPI" checked>📱 UPI</label><label><input type="radio" name="pay" value="Bank Transfer">🏦 Bank / NEFT</label><label><input type="radio" name="pay" value="COD">💵 COD</label></div>
 <div id="payInfo" class="muted"></div><button class="btn o">Place Order ✅</button></form>`;
 const pi=()=>{const v=$("#coForm").pay.value;$("#payInfo").innerHTML=v==="UPI"?"UPI ID: <b>guptashirts@upi</b> (simulated) — pay after placing the order":v==="COD"?"Cash on Delivery requires a 20% advance (simulated)":"A/c: 1234567890 • IFSC: SBIN0000123 • Gupta Shirts (simulated)"};
 $("#coForm").addEventListener("change",pi);pi();$("#cart").classList.remove("show");$("#checkoutModal").classList.add("show")}
function placeOrder(f){const d=Object.fromEntries(new FormData(f));d.gstin=(d.gstin||"").toUpperCase();localStorage.setItem("gs_buyer",JSON.stringify(d));
 const t=totals(),id="GS"+Date.now().toString(36).toUpperCase().slice(-6)+Math.floor(Math.random()*90+10);
 const items=Object.keys(cart).filter(k=>qtyOf(k)).map(pid=>({pid,name:P(pid).name,price:P(pid).price,grid:cart[pid],...lineCalc(pid,cart[pid])}));
 const order={id,date:new Date().toISOString(),buyer:d,items,totals:t,status:d.pay==="COD"?"Confirmed (COD)":"Payment pending"};
 const os=JSON.parse(localStorage.getItem("gs_orders")||"[]");os.unshift(order);localStorage.setItem("gs_orders",JSON.stringify(os));
 cart={};saveCart();renderCatalog();
 $("#checkoutBody").innerHTML=`<div class="success"><div class="big">🎉</div><h2>Order Confirmed!</h2><p>Order ID: <b>${id}</b></p><p class="muted">${t.q} pcs • ${inr(t.grand)} • ${d.pay}</p><p>Thank you, ${d.name}! Our sales team will contact you within 24 hours to confirm dispatch.</p><div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn o" data-print="${id}">🖨 Invoice Print</button><button class="btn ghost" data-close>Continue Shopping</button></div></div>`}
function invoiceHTML(o){const b=o.buyer,t=o.totals;return`<div class="invoice"><h2>TAX INVOICE — Gupta Shirts Wholesale</h2><p>GSTIN: 07ABCDE1234F1Z5 • Gandhi Nagar Market, Delhi, India • +91 98XXXXXX00</p><hr><p><b>Invoice/Order:</b> ${o.id} &nbsp; <b>Date:</b> ${new Date(o.date).toLocaleString("en-IN")}</p>
 <p><b>Bill To:</b> ${b.name}, ${b.shop}<br>${b.address}, ${b.city}<br>Ph: ${b.phone} ${b.gstin?"• GSTIN: "+b.gstin:""}</p>
 <table><tr><th>Design</th><th>Color / Size breakdown</th><th>Qty</th><th>Rate</th><th>Disc</th><th>Amount</th></tr>${o.items.map(i=>`<tr><td>${i.name}<br><small>HSN 6205</small></td><td>${Object.entries(i.grid).map(([c,s])=>`${c}: ${Object.entries(s).map(([z,n])=>z+"×"+n).join(", ")}`).join("<br>")}</td><td>${i.q}</td><td>${inr(i.price)}+</td><td>${i.off*100}%</td><td>${inr(i.net)}</td></tr>`).join("")}</table>
 <p style="text-align:right">Taxable: ${inr(t.taxable)}<br>CGST 2.5%: ${inr(t.gst/2)} • SGST 2.5%: ${inr(t.gst/2)}<br>Shipping: ${inr(t.ship)}<br><b style="font-size:18px">Grand Total: ${inr(t.grand)}</b></p><p>Payment: ${b.pay} • Status: ${o.status}</p><p class="muted">Computer generated invoice (demo).</p></div>`}
function printInvoice(id){const o=JSON.parse(localStorage.getItem("gs_orders")||"[]").find(x=>x.id===id);if(!o)return;$("#printArea").innerHTML=invoiceHTML(o);window.print()}
function showOrders(){const os=JSON.parse(localStorage.getItem("gs_orders")||"[]");
 $("#ordersBody").innerHTML=`<h2>📦 My Orders</h2>`+(os.length?os.map(o=>`<div class="citem"><h4>${o.id}<span>${inr(o.totals.grand)}</span></h4><div class="muted">${new Date(o.date).toLocaleString("en-IN")} • ${o.totals.q} pcs • ${o.buyer.pay} • ${o.status}</div><div class="muted">${o.items.map(i=>i.name+" ("+i.q+")").join(", ")}</div><button class="btn ghost" data-print="${o.id}" style="margin-top:6px">🖨 Invoice</button></div>`).join(""):"<p>No orders yet.</p>");
 $("#ordersModal").classList.add("show")}
/* chat UI */
function addMsg(html,who="bot"){const d=document.createElement("div");d.className="m "+who;d.innerHTML=html;$("#msgs").append(d);$("#msgs").scrollTop=1e9;return d}
let greeted=false;
function openChat(){$("#chat").classList.add("show");$("#chatFab").style.display="none";if(!greeted){greeted=true;botReply("__greet__")}}
async function botReply(text){const t=addMsg("Ryan is typing…","bot typing");const r=await Salesman.respond(text,{cart,totals:totals()});await new Promise(s=>setTimeout(s,400));t.remove();
 addMsg(r.html);$("#quick").innerHTML=(r.quick||["Best value options","Show party wear","What is the MOQ?","Bulk discount?","Size chart","View cart"]).map(q=>`<button>${q}</button>`).join("")}
function send(text){if(!text.trim())return;addMsg(text.replace(/</g,"&lt;"),"me");botReply(text)}
/* events */
document.addEventListener("click",e=>{const el=e.target.closest("[data-matrix],[data-remove],[data-close],[data-print],.sw[data-pid],#toCheckout,[data-act]");if(!el)return;
 if(el.dataset.matrix){$("#cart").classList.remove("show");$("#chat").classList.remove("show");$("#chatFab").style.display="";openMatrix(el.dataset.matrix)}
 else if(el.dataset.remove){delete cart[el.dataset.remove];saveCart();renderCart();renderCatalog()}
 else if(el.hasAttribute("data-close"))el.closest(".modal").classList.remove("show");
 else if(el.dataset.print)printInvoice(el.dataset.print);
 else if(el.dataset.pid){const p=P(el.dataset.pid);$(`#sb-${p.id} svg`).outerHTML=shirtSVG(p,el.dataset.hex);el.parentNode.querySelectorAll(".sw").forEach(s=>s.classList.toggle("on",s===el))}
 else if(el.id==="toCheckout")openCheckout();
 else if(el.dataset.act==="cart")openCart();
 else if(el.dataset.act==="checkout")totals().bad.length?openCart():openCheckout()});
$("#matrixModal").addEventListener("input",e=>{if(e.target.dataset.c){updMatrix();$("#mprev").innerHTML=shirtSVG(P(mPid),e.target.dataset.hex)}});
$("#matrixModal").addEventListener("click",e=>{const q=+$("#qf")?.value||0,set=f=>{$$("#matrixBody input[data-c]").forEach(f);updMatrix()};
 if(e.target.id==="qfAll")set(i=>i.value=q||"");if(e.target.id==="qfClear")set(i=>i.value="");
 if(e.target.id==="qfRatio"){const r={S:1,M:2,L:2,XL:2,XXL:1,"3XL":1};set(i=>i.value=(q||1)*r[i.dataset.s])}if(e.target.id==="mAdd")commitMatrix()});
$("#checkoutModal").addEventListener("submit",e=>{e.preventDefault();placeOrder(e.target)});
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")}));
$("#cartBtn").onclick=openCart;$("#closeCart").onclick=()=>$("#cart").classList.remove("show");
$("#ordersLink").onclick=e=>{e.preventDefault();showOrders()};
$("#enterBtn").onclick=enterShop;$("#skip").onclick=enterShop;
$("#chatFab").onclick=openChat;$("#chatClose").onclick=()=>{$("#chat").classList.remove("show");$("#chatFab").style.display=""};
$("#chatForm").onsubmit=e=>{e.preventDefault();send($("#chatIn").value);$("#chatIn").value=""};
$("#quick").onclick=e=>{if(e.target.tagName==="BUTTON")send(e.target.textContent)};
["search","catFilter","sort"].forEach(i=>$("#"+i).addEventListener("input",renderCatalog));
$("#catFilter").innerHTML+=[...new Set(PRODUCTS.map(p=>p.cat))].map(c=>`<option>${c}</option>`).join("");
// hook for salesman to add to cart
window.ShopAPI={addToCart(pid,color,perSize){const g=cart[pid]||{};g[color]=g[color]||{};for(const s in perSize)g[color][s]=(g[color][s]||0)+perSize[s];cart[pid]=g;saveCart();renderCatalog();return lineCalc(pid,g)},qtyOf,lineCalc,shirtSVG,inr};
renderCatalog();renderCartCount();intro();
