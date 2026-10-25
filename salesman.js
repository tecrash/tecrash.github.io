/* Ryan Carter — offline rule-based sales consultant. To plug a real LLM: set Salesman.llm = async (text, ctx, catalog) => ({html}) ;
   respond() will call it first and fall back to rules on error. */
const Salesman={llm:null,last:null,
 async respond(text,ctx){if(this.llm&&text!=="__greet__"){try{return await this.llm(text,ctx,PRODUCTS)}catch(e){console.warn("LLM failed, rules fallback",e)}}return this.rules(text,ctx)},
 card(p){const I=ShopAPI.inr;return`<div class="mini"><img src="${ShopAPI.img(p.id)}" alt=""><div><b>${p.name}</b><br><span style="opacity:.7">${I(p.price)} / piece · MOQ ${p.moq}</span><br><button class="cb" data-qv="${p.id}">View</button><button class="cb" data-matrix="${p.id}">Configure</button></div></div>`},
 find(t){let best=null,sc=0;for(const p of PRODUCTS){let s=0;for(const w of [p.id,...p.name.toLowerCase().split(/\W+/),...p.tags,p.cat.toLowerCase()])if(w.length>2&&t.includes(w))s+=w===p.id?3:1;if(s>sc){sc=s;best=p}}return best},
 rules(raw,ctx){const t=raw.toLowerCase(),I=ShopAPI.inr,has=(...w)=>w.some(x=>t.includes(x));
  if(raw==="__greet__")return{html:"Hello and welcome! 👋 I'm <b>Ryan Carter</b>, your sales consultant. We carry "+PRODUCTS.length+" designs across formal, casual, party and ethnic ranges. What are you sourcing today? You can also type something like <i>\"add 120 white oxford\"</i>."};
  let p=this.find(t);if(p)this.last=p;else if(has("this","it ","same"))p=this.last;
  const num=(t.match(/(\d+)\s*(pc|pcs|piece|pieces|nos)?/)||[])[1];
  // add to cart
  if(has("add","order","buy","need","want","book")&&num&&p){const n=+num,col=p.colors.find(c=>t.includes(c.name.toLowerCase()))||p.colors[0];
   const ratio={S:1,M:2,L:2,XL:2,XXL:1,"3XL":1},per={};let left=n;SIZES.forEach((s,i)=>{per[s]=i===5?left:Math.floor(n*ratio[s]/9);left-=i===5?0:per[s]});
   const l=ShopAPI.addToCart(p.id,col.name,per);
   return{html:`✅ <b>${n} pcs ${p.name} (${col.name})</b> added to your cart — size ratio ${Object.entries(per).map(([s,v])=>s+":"+v).join(", ")}.<br>Design total: ${l.q} pcs ${l.moqOk?"✅ MOQ met":"⚠️ "+(p.moq-l.q)+" more pcs needed for MOQ "+p.moq}${l.off?` • ${l.off*100}% bulk off`:""}<br><button class="cb" data-matrix="${p.id}">Edit sizes</button><button class="cb" data-act="cart">View cart</button>`,quick:["Checkout","Other colors?","Bulk discount?"]}}
  if(has("checkout","order place","payment")) return{html:`Certainly. We accept UPI, bank transfer (NEFT/RTGS) and cash on delivery. <button class="cb" data-act="checkout">Proceed to checkout →</button>`};
  if(has("cart","total","bill")){const T=ctx.totals;return{html:T.q?`Your cart has <b>${T.q} pcs</b>, total <b>${I(T.grand)}</b> (incl. GST). ${T.bad.length?"⚠️ MOQ pending: "+T.bad.join(", "):""}<br><button class="cb" data-act="cart">Open cart</button>`:"Your cart is empty. Shall I recommend some designs?"}}
  if(has("discount","offer","tier","bulk","deal","negotiat")) return{html:"Volume discounts (per design):<br>• 50+ pcs → 3%<br>• 100+ → 6%<br>• 250+ → 9%<br>• 500+ → <b>12% off</b><br>Shipping is free on orders above ₹25,000 🚚."};
  if(has("size","chart","measure")) return{html:"Size chart (chest, inches): S-38, M-40, L-42, XL-44, XXL-46, 3XL-48.<br>XXL is +₹10 and 3XL +₹20 per piece. Most retailers order in a <b>1:2:2:2:1:1</b> ratio — the order matrix can fill it in one click.<br><button class=\"cb\" data-act=\"sizes\">Open size guide</button>"};
  if(has("moq","minimum","min order")) return{html:p?`The MOQ for ${p.name} is <b>${p.moq} pcs</b>, mixable across any colors and sizes.`:"MOQ is set per design (36–72 pcs) and can be mixed across colors and sizes:<br>"+PRODUCTS.map(x=>`${x.name}: ${x.moq}`).join("<br>")};
  if(has("gst","tax","invoice")) return{html:"Shirts attract 5% GST (2.5% CGST + 2.5% SGST). Provide your GSTIN at checkout to receive a tax invoice eligible for input tax credit."};
  if(has("deliver","shipping","dispatch","courier")) return{html:"Orders dispatch within 2–3 business days with delivery in 4–7 days across India. Shipping is free above ₹25,000, otherwise ₹499."};
  if(has("cheap","budget","lowest","affordable","value")){const s=[...PRODUCTS].sort((a,b)=>a.price-b.price).slice(0,3);return{html:"Our best-value designs:"+s.map(x=>this.card(x)).join("")}}
  if(has("premium","best","quality","top")){const s=[...PRODUCTS].sort((a,b)=>b.price-a.price).slice(0,3);return{html:"Our premium range:"+s.map(x=>this.card(x)).join("")}}
  if(has("color","colour")&&p) return{html:`${p.name}  is available in: ${p.colors.map(c=>`<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.hex};border:1px solid #ccc"></span> ${c.name}`).join(", ")}`};
  if(has("price","rate","how much","cost")&&p) return{html:`${p.name}: <b>${I(p.price)}/pc</b> (S–XL), XXL ${I(p.price+10)}, 3XL ${I(p.price+20)}. MOQ ${p.moq}. At 100+ pcs (6% off) that is ~${I(p.price*.94)}/pc.`+this.card(p)};
  const cats={party:"Party",wedding:"Party",office:"Formal",formal:"Formal",casual:"Casual",ethnic:"Ethnic",festive:"Ethnic",premium:"Premium"};
  for(const k in cats)if(t.includes(k)){const l=PRODUCTS.filter(x=>x.cat===cats[k]);return{html:`${cats[k]} collection 👇`+l.map(x=>this.card(x)).join("")}}
  if(p) return{html:`Great choice — ${p.fabric}, available in ${p.colors.length} colors.`+this.card(p)};
  if(has("hi","hello","hey","good morning","good evening")) return{html:"Hello! What can I show you — formal, casual, party or ethnic wear?"};
  if(has("thank")) return{html:"You're welcome! Let me know if there is anything else I can help with."};
  if(has("recommend","suggest","show")) {const s=[PRODUCTS[0],PRODUCTS[1],PRODUCTS[5]];return{html:"Our best-sellers:"+s.map(x=>this.card(x)).join("")}}
  return{html:"Sorry, I didn't quite catch that. You can ask about pricing, MOQ, sizes, discounts, GST or delivery — or type <i>\"add 100 blue checked\"</i>."}}};
