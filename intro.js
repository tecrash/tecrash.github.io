// Cinematic boutique entrance — Three.js 2.5D scene with graceful 2D fallback (handled in app.js)
let THREE;
try{
  THREE=await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  const c=document.createElement("canvas");
  if(!(c.getContext("webgl2")||c.getContext("webgl")))throw new Error("no webgl");
}catch(e){console.info("3D intro unavailable, using 2D fallback");window.ThreeIntro={ok:false};}
if(THREE&&!window.ThreeIntro){
  const canvas=document.getElementById("introCanvas");
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050505);scene.fog=new THREE.Fog(0x050505,14,30);
  const cam=new THREE.PerspectiveCamera(40,1,.05,100);
  const L=new THREE.TextureLoader();
  const tex=u=>{const t=L.load(u);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t};
  const W=16,H=9,S=W/1280;               // storefront plane maps 1280x720 image
  const dx0=(522-640)*S,dx1=(772-640)*S,dxm=(647-640)*S,dy0=(360-225)*S,dy1=(360-548)*S;
  const doorCx=(dx0+dx1)/2,doorCy=(dy0+dy1)/2,doorH=dy0-dy1;
  // storefront with door cut-out
  const front=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tex("assets/storefront.svg"),transparent:true}));scene.add(front);
  // extended dark facade so wide screens never see edges
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(80,40),new THREE.MeshBasicMaterial({color:0x070707}));wall.position.z=-.02;scene.add(wall);
  // hole in wall: rebuild wall as frame around storefront
  wall.visible=false;
  [[-W/2-20,0,40,40],[W/2+20,0,40,40],[0,H/2+10,W,20],[0,-H/2-10,W,20]].forEach(([x,y,w,h])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x060606}));m.position.set(x,y,-.01);scene.add(m)});
  // sliding glass doors
  const mkDoor=(u,w,x)=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.PlaneGeometry(w,doorH),new THREE.MeshBasicMaterial({map:tex(u),transparent:true}));g.add(m);
    const sheen=new THREE.Mesh(new THREE.PlaneGeometry(w,doorH),new THREE.MeshBasicMaterial({color:0xfff1d0,transparent:true,opacity:.06,blending:THREE.AdditiveBlending}));sheen.position.z=.002;g.add(sheen);
    g.position.set(x,doorCy,.03);scene.add(g);return g};
  const dl=mkDoor("assets/doorL.svg",dxm-dx0,(dx0+dxm)/2),dr=mkDoor("assets/doorR.svg",dx1-dxm,(dxm+dx1)/2);
  const dlx=dl.position.x,drx=dr.position.x;
  // interior showroom behind the doors
  const IZ=-5.5,inter=new THREE.Mesh(new THREE.PlaneGeometry(10.5,5.9),new THREE.MeshBasicMaterial({map:tex("assets/interior.svg")}));inter.position.set(doorCx,doorCy,IZ);scene.add(inter);
  // corridor sides (dark warm walls) between door and interior
  const sideMat=new THREE.MeshBasicMaterial({color:0x1a120a,side:THREE.DoubleSide});
  [[dx0,1],[dx1,-1]].forEach(([x])=>{const s=new THREE.Mesh(new THREE.PlaneGeometry(-IZ,doorH),sideMat);s.rotation.y=Math.PI/2;s.position.set(x,doorCy,IZ/2);s.visible=false;scene.add(s)});
  // warm floating dust motes
  const N=600,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*14;pos[i*3+1]=(Math.random()-.5)*8;pos[i*3+2]=Math.random()*14-6}
  const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const dot=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,226,170,1)");g.addColorStop(1,"rgba(255,226,170,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.05,map:dot,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(pts);
  // light bloom quad over doorway
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:dot,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.set(doorCx,doorCy,.05);scene.add(glow);
  // camera keyframes
  const P0=new THREE.Vector3(0,0,15),P1=new THREE.Vector3(doorCx*.6,doorCy*.4,9.5),P2=new THREE.Vector3(doorCx,doorCy,.6),P3=new THREE.Vector3(doorCx,doorCy,-1.4);
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,lerp=(a,b,t)=>a+(b-a)*t;
  let t0=0,running=false,mx=0,my=0,cb={},doorsFired=false,doneFired=false;
  addEventListener("mousemove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;
    // ensure storefront fills the view at start
    const vFov=2*Math.atan(Math.max(H/2/15,(W/2/15)/cam.aspect));cam.fov=Math.min(60,Math.max(28,THREE.MathUtils.radToDeg(vFov)*.92));cam.updateProjectionMatrix()}
  addEventListener("resize",resize);resize();
  function frame(now){if(!running)return;const t=(now-t0)/1000;
    let p=new THREE.Vector3();
    if(t<2.2)p.lerpVectors(P0,P1,ease(t/2.2));
    else if(t<5.6)p.lerpVectors(P1,P2,ease((t-2.2)/3.4));
    else p.lerpVectors(P2,P3,ease(Math.min(1,(t-5.6)/2.2)));
    // doors slide open 2.4s → 4.2s
    const d=ease(Math.min(1,Math.max(0,(t-2.4)/1.8)));dl.position.x=dlx-d*(dxm-dx0)*1.02;dr.position.x=drx+d*(dx1-dxm)*1.02;
    glow.material.opacity=d*.35*(1-Math.min(1,Math.max(0,(t-5)/1.5)));
    if(!doorsFired&&t>2.4){doorsFired=true;cb.onDoors?.()}
    cam.position.set(p.x+mx*.25*(1-Math.min(1,t/6)),p.y-my*.15,p.z);cam.lookAt(doorCx*.95,doorCy*.95,p.z-10);
    inter.scale.setScalar(1+.04*Math.sin(t*.25));
    const a=pos;for(let i=0;i<N;i++){a[i*3+1]+=Math.sin(t+i)*.0008;a[i*3]+=.0006}pg.attributes.position.needsUpdate=true;
    renderer.render(scene,cam);
    if(!doneFired&&t>7.6){doneFired=true;cb.onDone?.()}
    requestAnimationFrame(frame)}
  window.ThreeIntro={ok:true,play(c){cb=c||{};t0=performance.now();running=true;requestAnimationFrame(frame)},stop(){setTimeout(()=>{running=false;renderer.dispose()},1300)}};
}
