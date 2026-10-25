const SIZES=["S","M","L","XL","XXL","3XL"];
const SIZE_EXTRA={S:0,M:0,L:0,XL:0,XXL:10,"3XL":20};
const GST_RATE=0.05; // shirts <= ₹1000: 5% GST
const TIERS=[{min:500,off:.12},{min:250,off:.09},{min:100,off:.06},{min:50,off:.03}];
const C=(n,h)=>({name:n,hex:h});
const PRODUCTS=[
{id:"oxf",name:"Classic Oxford Formal",cat:"Formal",fabric:"100% Cotton Oxford",pattern:"plain",collar:"formal",sleeve:"full",price:285,moq:60,colors:[C("White","#f5f5f5"),C("Sky Blue","#8ec5ff"),C("Pink","#f7b6c8"),C("Grey","#9aa3ad")],tags:["office","formal","cotton","oxford"]},
{id:"chk",name:"Checked Casual",cat:"Casual",fabric:"Cotton Twill",pattern:"check",collar:"casual",sleeve:"full",price:240,moq:48,colors:[C("Red","#d64545"),C("Blue","#3a64c8"),C("Green","#2f8f5b"),C("Black","#333")],tags:["check","checks","casual","college"]},
{id:"lin",name:"Premium Linen",cat:"Premium",fabric:"Linen Blend",pattern:"plain",collar:"casual",sleeve:"full",price:420,moq:36,colors:[C("Beige","#e3d3b4"),C("Olive","#7d8450"),C("White","#f5f5f5"),C("Navy","#22325e")],tags:["linen","summer","premium"]},
{id:"den",name:"Denim Shirt",cat:"Casual",fabric:"Light Denim 6oz",pattern:"denim",collar:"casual",sleeve:"full",price:330,moq:48,colors:[C("Light Blue","#7fa6d1"),C("Dark Blue","#2b4a7a"),C("Black","#2d2d2d")],tags:["denim","jeans","casual"]},
{id:"str",name:"Striped Executive",cat:"Formal",fabric:"Poly-Cotton",pattern:"stripe",collar:"formal",sleeve:"full",price:260,moq:60,colors:[C("Blue","#4b7bd8"),C("Lavender","#b9a6e8"),C("Black","#333"),C("Maroon","#7a2335")],tags:["stripe","striped","office","formal"]},
{id:"prt",name:"Printed Party Wear",cat:"Party",fabric:"Rayon",pattern:"dots",collar:"casual",sleeve:"full",price:310,moq:36,colors:[C("Black","#222"),C("Maroon","#7a2335"),C("Teal","#1b8a8a"),C("Mustard","#d9a82b")],tags:["party","printed","rayon","print"]},
{id:"hsl",name:"Half Sleeve Summer",cat:"Casual",fabric:"Cotton Poplin",pattern:"plain",collar:"casual",sleeve:"half",price:195,moq:72,colors:[C("White","#f5f5f5"),C("Yellow","#f3d95e"),C("Mint","#9fe0c3"),C("Peach","#f7c19b"),C("Sky Blue","#8ec5ff")],tags:["half","summer","cheap","budget","poplin"]},
{id:"mdr",name:"Mandarin Collar Kurta-Shirt",cat:"Ethnic",fabric:"Khadi Cotton",pattern:"plain",collar:"mandarin",sleeve:"full",price:350,moq:36,colors:[C("Off White","#efe8d8"),C("Saffron","#f09a3e"),C("Navy","#22325e"),C("Bottle Green","#1f5b3f")],tags:["mandarin","chinese","ethnic","khadi","festive"]},
{id:"sat",name:"Satin Shine Party",cat:"Party",fabric:"Satin",pattern:"plain",collar:"formal",sleeve:"full",price:375,moq:36,colors:[C("Wine","#6b1a2e"),C("Black","#1c1c1c"),C("Royal Blue","#2346a8"),C("Gold","#c9a227")],tags:["satin","shine","party","wedding"]},
{id:"flr",name:"Floral Resort",cat:"Casual",fabric:"Viscose",pattern:"floral",collar:"casual",sleeve:"half",price:265,moq:48,colors:[C("White","#f5f5f5"),C("Navy","#22325e"),C("Pink","#f7b6c8")],tags:["floral","flower","goa","resort","vacation"]}
];
