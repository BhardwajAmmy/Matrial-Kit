
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
(function(){
 const root=document.querySelector(".ehx-site");if(!root||root.dataset.ehxReady==="1")return;root.dataset.ehxReady="1";
 const canvas=root.querySelector(".ehx-room-canvas"),loading=root.querySelector(".ehx-loading");if(!canvas)return;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false,powerPreference:"high-performance"});}
 catch(err){if(loading){loading.textContent="Your browser could not start the 3D viewer. Try a recent version of Chrome or Edge.";loading.classList.remove("hidden");}return;}
 const scene=new THREE.Scene();scene.background=new THREE.Color("#b8b4a8");scene.fog=new THREE.Fog("#b8b4a8",18,34);
 const camera=new THREE.PerspectiveCamera(36,1,.1,80),homeCamera=new THREE.Vector3(8.7,6.8,11.5);camera.position.copy(homeCamera);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.45,-1.25);controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false;controls.minDistance=7.5;controls.maxDistance=17;controls.minPolarAngle=.25;controls.maxPolarAngle=1.43;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 scene.add(new THREE.HemisphereLight(0xf7f1e4,0x726c5e,2));scene.add(new THREE.AmbientLight(0xffffff,.38));
 const sun=new THREE.DirectionalLight(0xffdfb3,3.1);sun.position.set(-5,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.bias=-.00035;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xdce8df,1.25);fill.position.set(7,5,-2);scene.add(fill);const kitchenLight=new THREE.PointLight(0xffbd7d,1.1,8);kitchenLight.position.set(2.2,2.7,-3.2);scene.add(kitchenLight);
 function textureFor(d){const c=document.createElement("canvas");c.width=256;c.height=256;const g=c.getContext("2d");g.fillStyle=d.base;g.fillRect(0,0,256,256);
  if(d.kind==="wood"){for(let y=0;y<256;y+=32){g.strokeStyle="rgba(49,31,18,.15)";g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let k=0;k<9;k++){const yy=y+Math.random()*30;g.strokeStyle=k%3===0?"rgba(255,244,220,.19)":"rgba(54,32,16,.12)";g.lineWidth=.35+Math.random()*1.1;g.beginPath();g.moveTo(0,yy);g.bezierCurveTo(70,yy-5+Math.random()*10,180,yy-3,256,yy+Math.random()*5);g.stroke();}}for(let x=55;x<256;x+=90){g.strokeStyle="rgba(42,26,13,.18)";g.lineWidth=1;g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();}}
  else if(d.kind==="terrazzo"){for(let i=0;i<850;i++){const colors=["rgba(236,222,195,.65)","rgba(28,30,28,.32)","rgba(166,143,111,.55)","rgba(255,249,235,.6)"];g.fillStyle=colors[Math.floor(Math.random()*colors.length)];const s=1+Math.random()*4;g.fillRect(Math.random()*256,Math.random()*256,s,s*.7);}}
  else{for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?"rgba(255,250,235,.06)":"rgba(63,55,42,.045)";const s=.5+Math.random()*1.7;g.fillRect(Math.random()*256,Math.random()*256,s,s);}if(d.kind==="stone"||d.kind==="plaster"){for(let i=0;i<9;i++){g.strokeStyle="rgba(100,83,61,.09)";g.lineWidth=.6+Math.random()*1.2;g.beginPath();const y=Math.random()*256;g.moveTo(0,y);g.bezierCurveTo(65,y-12,190,y+14,256,y-3);g.stroke();}}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(d.rx||1,d.ry||1);t.anisotropy=4;t.needsUpdate=true;return t;}
 function mkMat(d){return new THREE.MeshStandardMaterial({map:textureFor(d),color:0xffffff,roughness:d.roughness===undefined?.72:d.roughness,metalness:d.metalness||0});}
 const defs={cabinetry:[{id:"oak",name:"Natural oak",base:"#b58b5f",kind:"wood",roughness:.62,rx:1,ry:1},{id:"walnut",name:"Smoked walnut",base:"#60432f",kind:"wood",roughness:.57,rx:1,ry:1},{id:"olive",name:"Olive matte",base:"#72765a",kind:"plaster",roughness:.82,rx:1,ry:1}],
 walls:[{id:"limewash",name:"Warm limewash",base:"#d6cbb8",kind:"plaster",roughness:.94,rx:2,ry:1},{id:"clay",name:"Clay plaster",base:"#b98469",kind:"plaster",roughness:.95,rx:2,ry:1},{id:"stone",name:"Soft mineral",base:"#a6a296",kind:"stone",roughness:.88,rx:2,ry:1}],
 flooring:[{id:"oak",name:"Natural oak",base:"#b99262",kind:"wood",roughness:.68,rx:5,ry:4},{id:"travertine",name:"Travertine",base:"#c9baa0",kind:"stone",roughness:.79,rx:4,ry:4},{id:"terrazzo",name:"Dark terrazzo",base:"#5e5a53",kind:"terrazzo",roughness:.42,rx:4,ry:4}],
 countertops:[{id:"travertine",name:"Travertine",base:"#c8b89f",kind:"stone",roughness:.3,rx:2,ry:1},{id:"basalt",name:"Dark basalt",base:"#555650",kind:"terrazzo",roughness:.28,rx:2,ry:1},{id:"quartz",name:"Cream quartz",base:"#e5ded0",kind:"stone",roughness:.23,rx:2,ry:1}]};
 const catalog={};Object.keys(defs).forEach(cat=>{catalog[cat]=defs[cat].map(d=>Object.assign({},d,{material:mkMat(d)}));});
 const objects={cabinetry:[],walls:[],flooring:[],countertops:[]};
 const solid=(color,rough,metal)=>new THREE.MeshStandardMaterial({color:color,roughness:rough===undefined?.7:rough,metalness:metal||0});
 const fixed={dark:solid("#343833",.4),metal:solid("#373b35",.32,.68),glass:new THREE.MeshPhysicalMaterial({color:"#96b0ac",roughness:.12,metalness:.08,transparent:true,opacity:.22,transmission:.15}),sofa:solid("#d9d0c2",.96),cushion:solid("#a9a18f",1),linen:solid("#b9ac9a",1),rug:mkMat({base:"#a99b85",kind:"plaster",roughness:1,rx:3,ry:2}),ceramic:solid("#dfd6c7",.32),plant:solid("#455f43",.96),planter:solid("#8e8270",.86),wood:mkMat({base:"#90704e",kind:"wood",roughness:.72,rx:1,ry:1}),light:new THREE.MeshStandardMaterial({color:"#e9dec7",roughness:.25,emissive:"#6b5335",emissiveIntensity:.12})};
 function box(name,size,pos,material,cat,shadow){const m=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),material);m.name=name;m.position.set(pos[0],pos[1],pos[2]);m.castShadow=shadow!==false;m.receiveShadow=true;if(cat){m.userData.surface=cat;objects[cat].push(m);}scene.add(m);return m;}
 function cyl(name,rt,rb,h,pos,material,segments){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments||20),material);m.name=name;m.position.set(pos[0],pos[1],pos[2]);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,9.4),catalog.flooring[0].material);floor.name="CFG_Floor";floor.rotation.x=-Math.PI/2;floor.position.set(0,.015,0);floor.receiveShadow=true;floor.userData.surface="flooring";objects.flooring.push(floor);scene.add(floor);
 box("CFG_Wall_Back_Left",[1.2,5.2,.16],[-5.4,2.6,-4.68],catalog.walls[0].material,"walls",false);box("CFG_Wall_Back_Right",[7,5.2,.16],[2.5,2.6,-4.68],catalog.walls[0].material,"walls",false);box("CFG_Wall_Back_Header",[3.8,1.15,.16],[-2.5,4.62,-4.68],catalog.walls[0].material,"walls",false);box("CFG_Wall_Back_Sill",[3.8,.35,.16],[-2.5,.18,-4.68],catalog.walls[0].material,"walls",false);box("CFG_Wall_Right",[.16,5.2,3],[5.92,2.6,-3.2],catalog.walls[0].material,"walls",false);
 // Complete the missing left wall with a wide glazed opening.
 box("CFG_Wall_Left_Rear",[.16,5.2,2.25],[-5.92,2.6,-3.54],catalog.walls[0].material,"walls",false);
 box("CFG_Wall_Left_Front",[.16,5.2,2.25],[-5.92,2.6,3.54],catalog.walls[0].material,"walls",false);
 box("CFG_Wall_Left_Header",[.16,1.05,4.95],[-5.92,4.675,0],catalog.walls[0].material,"walls",false);
 box("CFG_Wall_Left_Sill",[.16,.5,4.95],[-5.92,.25,0],catalog.walls[0].material,"walls",false);
 box("CFG_Left_Window_Glass",[.035,3.65,4.88],[-5.82,2.50,0],fixed.glass,null,false);
 [-2.43,0,2.43].forEach(z=>box("CFG_Left_Window_Mullion",[.055,3.68,.055],[-5.77,2.5,z],fixed.metal,null,false));
 box("CFG_Left_Window_Head",[.06,.055,4.98],[-5.77,4.15,0],fixed.metal,null,false);
 box("CFG_Left_Window_Base",[.06,.06,4.98],[-5.77,.60,0],fixed.metal,null,false);

 box("Window glazing",[3.65,3.55,.035],[-2.5,2.34,-4.60],fixed.glass,null,false);[-4.31,-2.5,-.69].forEach(x=>box("Window mullion",[.045,3.62,.055],[x,2.34,-4.56],fixed.metal,null,false));box("Window frame top",[3.75,.055,.07],[-2.5,4.15,-4.56],fixed.metal,null,false);box("Window frame bottom",[3.75,.06,.08],[-2.5,.56,-4.55],fixed.metal,null,false);
 const lowerX=[-.5,.42,1.34,2.26,3.18,4.1,5.02];lowerX.forEach((x,i)=>{box("CFG_Cabinet_Lower_Carcass_"+i,[.88,.88,.68],[x,.47,-4.13],catalog.cabinetry[0].material,"cabinetry");box("CFG_Cabinet_Lower_Front_"+i,[.82,.80,.05],[x,.48,-3.77],catalog.cabinetry[0].material,"cabinetry");box("Cabinet pull "+i,[.018,.12,.04],[x+.28,.50,-3.73],fixed.metal,null);});
 [0,.98,1.96,2.94,3.92,4.90].forEach((x,i)=>{box("CFG_Cabinet_Upper_Carcass_"+i,[.92,1.22,.47],[x,3.10,-4.40],catalog.cabinetry[0].material,"cabinetry");box("CFG_Cabinet_Upper_Front_"+i,[.86,1.14,.04],[x,3.10,-4.14],catalog.cabinetry[0].material,"cabinetry");box("Upper pull "+i,[.018,.12,.035],[x+.28,2.83,-4.11],fixed.metal,null);});
 box("CFG_Back_Countertop",[6.65,.13,.82],[2.25,.97,-4.12],catalog.countertops[0].material,"countertops");box("CFG_Backsplash",[6.5,.68,.045],[2.25,1.50,-4.62],catalog.walls[0].material,"walls",false);box("Sink basin",[.86,.08,.45],[2.7,1.06,-4.06],fixed.dark,null);box("Sink faucet",[.045,.38,.045],[2.7,1.30,-4],fixed.metal,null);box("Sink spout",[.31,.045,.045],[2.56,1.48,-4],fixed.metal,null);
 box("CFG_Island_Carcass",[3.1,.89,1.24],[1.55,.48,-1.72],catalog.cabinetry[0].material,"cabinetry");[-0,1.03,2.06].forEach((x,i)=>box("CFG_Island_Front_"+i,[.96,.80,.045],[x,.48,-1.08],catalog.cabinetry[0].material,"cabinetry"));box("CFG_Island_Countertop",[3.33,.14,1.4],[1.55,1,-1.72],catalog.countertops[0].material,"countertops");
 box("Dining table top",[2.2,.11,1],[-3.35,1.12,-2.35],fixed.wood,null);[-4.2,-2.5].forEach(x=>[-2.72,-1.98].forEach(z=>box("Dining table leg",[.075,1.08,.075],[x,.54,z],fixed.wood,null)));[-4.02,-2.6].forEach(x=>{box("Dining chair seat",[.54,.12,.50],[x,.61,-1.43],fixed.linen,null);box("Dining chair back",[.54,.66,.08],[x,.95,-1.18],fixed.wood,null);[-.19,.19].forEach(dx=>[-1.61,-1.27].forEach(z=>box("Dining chair leg",[.04,.58,.04],[x+dx,.3,z],fixed.wood,null)));});
 box("Area rug",[3.8,.035,2.55],[-2.65,.04,1.45],fixed.rug,null,false);box("Sofa seat",[2.85,.43,1.02],[-2.5,.42,1.35],fixed.sofa,null);box("Sofa back",[2.85,.78,.28],[-2.5,.87,1.77],fixed.sofa,null);[-3.86,-1.14].forEach(x=>box("Sofa arm",[.26,.65,1.02],[x,.61,1.36],fixed.sofa,null));[-3.2,-2.52,-1.84].forEach((x,i)=>box("Sofa cushion",[.58,.52,.18],[x,.88,1.53],i===1?fixed.linen:fixed.cushion,null));box("Coffee table top",[1.5,.12,.82],[-2.55,.48,-.15],fixed.wood,null);[-3.08,-2.02].forEach(x=>[-.42,.12].forEach(z=>box("Coffee table leg",[.06,.42,.06],[x,.23,z],fixed.dark,null)));cyl("Decor vessel",.12,.10,.30,[-2.88,.69,-.14],fixed.ceramic,20);cyl("Planter",.16,.14,.29,[-1.98,.68,-.12],fixed.planter,20);
 function plant(x,z,s){cyl("Plant pot",.18*s,.14*s,.32*s,[x,.16*s,z],fixed.planter,16);for(let i=0;i<8;i++){const a=i*Math.PI/4;const leaf=box("Plant leaf",[.07*s,.62*s,.09*s],[x+Math.cos(a)*.17*s,.53*s,z+Math.sin(a)*.17*s],fixed.plant,null,false);leaf.rotation.z=Math.cos(a)*.46;leaf.rotation.x=Math.sin(a)*.25;}}
 plant(-5.05,.15,1.25);plant(-4.9,-3.8,.85);plant(5.2,-3.05,.92);plant(-.9,-3.65,.75);
 [0.35,1.8].forEach(x=>{box("Pendant cord",[.018,.72,.018],[x,3.88,-2.35],fixed.dark,null,false);cyl("Pendant shade",.21,.09,.16,[x,3.48,-2.35],fixed.light,24);const lamp=new THREE.PointLight(0xffd7a2,.42,3.2);lamp.position.set(x,3.3,-2.35);scene.add(lamp);});box("Under cabinet LED",[5.9,.035,.025],[2.2,1.94,-4.02],new THREE.MeshStandardMaterial({color:"#ffe2b0",emissive:"#edb76c",emissiveIntensity:1.1,roughness:.45}),null,false);
 const state={cabinetry:"oak",walls:"limewash",flooring:"oak",countertops:"travertine"},original={...state};
 const presets={warm:{label:"Warm minimal",cabinetry:"oak",walls:"limewash",flooring:"oak",countertops:"travertine"},contrast:{label:"Modern contrast",cabinetry:"walnut",walls:"stone",flooring:"terrazzo",countertops:"basalt"},earth:{label:"Earth & texture",cabinetry:"olive",walls:"clay",flooring:"travertine",countertops:"travertine"}};
 const labels={cabinetry:"Cabinetry",walls:"Walls",flooring:"Flooring",countertops:"Countertops"};let activeCategory="cabinetry";
 function findMat(cat,id){return catalog[cat].find(o=>o.id===id);}
 function apply(cat,id){const opt=findMat(cat,id);if(!opt)return;state[cat]=id;objects[cat].forEach(o=>{o.material=opt.material;});updateUI();}
 function currentPreset(){for(const key of Object.keys(presets)){if(Object.keys(state).every(k=>state[k]===presets[key][k]))return key;}return null;}
 function updateUI(){
  root.querySelectorAll(".ehx-tab").forEach(b=>{const a=b.dataset.cat===activeCategory;b.classList.toggle("active",a);b.setAttribute("aria-selected",a?"true":"false");});
  const host=root.querySelector(".ehx-options");host.textContent="";
  catalog[activeCategory].forEach(o=>{const b=document.createElement("button");b.type="button";b.className="ehx-option"+(state[activeCategory]===o.id?" active":"");b.setAttribute("aria-pressed",state[activeCategory]===o.id?"true":"false");const sw=document.createElement("span");sw.className="ehx-swatch "+(o.kind==="wood"?"wood":o.kind==="terrazzo"?"terrazzo":"stone");sw.style.backgroundColor=o.base;const name=document.createElement("span");name.className="ehx-option-name";name.textContent=o.name;b.appendChild(sw);b.appendChild(name);b.addEventListener("click",()=>apply(activeCategory,o.id));host.appendChild(b);});
  const chosen=findMat(activeCategory,state[activeCategory]);root.querySelector(".ehx-selection-note").textContent=labels[activeCategory]+" · "+chosen.name;
  const p=currentPreset();root.querySelector(".ehx-current-palette").textContent=p?presets[p].label.toUpperCase():"YOUR MIX";root.querySelectorAll(".ehx-preset").forEach(b=>b.classList.toggle("active",b.dataset.preset===p));
 }
 function setPreset(k){const p=presets[k];if(!p)return;Object.keys(state).forEach(cat=>{state[cat]=p[cat];const m=findMat(cat,p[cat]).material;objects[cat].forEach(o=>{o.material=m;});});updateUI();}
 root.querySelectorAll(".ehx-tab").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.cat;updateUI();}));
 root.querySelectorAll(".ehx-preset").forEach(b=>b.addEventListener("click",()=>setPreset(b.dataset.preset)));
 root.querySelector(".ehx-reset-materials").addEventListener("click",()=>{Object.keys(original).forEach(cat=>{state[cat]=original[cat];const m=findMat(cat,original[cat]).material;objects[cat].forEach(o=>{o.material=m;});});activeCategory="cabinetry";updateUI();});
 root.querySelector(".ehx-reset-camera").addEventListener("click",()=>{camera.position.copy(homeCamera);controls.target.set(0,1.45,-1.25);controls.update();});
 root.querySelectorAll(".ehx-hotspot").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.focusCategory;updateUI();root.querySelectorAll(".ehx-hotspot").forEach(h=>h.classList.toggle("active",h===b));}));
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let start=null;
 canvas.addEventListener("pointerdown",e=>{start={x:e.clientX,y:e.clientY};});
 canvas.addEventListener("pointerup",e=>{if(!start)return;const dist=Math.hypot(e.clientX-start.x,e.clientY-start.y);start=null;if(dist>6)return;const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(scene.children,true);const hit=hits.find(h=>h.object.userData.surface);if(hit){activeCategory=hit.object.userData.surface;updateUI();root.querySelectorAll(".ehx-hotspot").forEach(b=>b.classList.toggle("active",b.dataset.focusCategory===activeCategory));}});
 function resize(){const host=canvas.parentElement;if(!host)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 
 function initMorphStory(root){
  const section=root.querySelector(".ehx-morph-story"),canvas=root.querySelector(".ehx-morph-canvas");
  if(!section||!canvas)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  let W=0,H=0,DPR=1,progress=0,raf=0,active=false,lastPhase=-1;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const copy=[
   {num:"01",title:"A thought becomes a <em>possibility.</em>",desc:"Before the first line, we begin with how you want to live. The early ideas are loose, but each one points toward a more considered home.",caption:"Loose thoughts. A direction begins.",stage:"01 — THE IDEA"},
   {num:"02",title:"Every idea needs <em>its place.</em>",desc:"The dots find their relationships. Rooms, routes, privacy and light become a plan that makes sense for everyday life.",caption:"Space finds its purpose.",stage:"02 — THE PLAN"},
   {num:"03",title:"The drawing starts to become <em>real.</em>",desc:"A plan rises into form. Clear design decisions help connect what is imagined with what can be built.",caption:"From drawing to structure.",stage:"03 — THE FORM"}
  ];
  const blendPoint=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  const random=(a,b)=>a+Math.random()*(b-a);
  const scatter=Array.from({length:230},()=>({x:random(-.94,.94),y:random(-.82,.82)}));
  const planLines=[
   [-.82,-.62,.82,-.62],[-.82,-.62,-.82,.62],[.82,-.62,.82,.62],[-.82,.62,.82,.62],
   [-.82,.12,-.14,.12],[-.02,.12,.82,.12],[-.20,-.62,-.20,.12],[.30,.12,.30,.62],
   [.30,-.24,.82,-.24],[-.20,-.34,-.55,-.34],[-.55,-.34,-.55,-.62],
   [-.02,.12,-.02,.62],[.30,.40,.58,.40],[.58,.40,.58,.12],[-.68,.62,-.68,.32],[-.68,.32,-.82,.32]
  ];
  const houseLines=[
   [-.58,-.43,.36,-.43],[.36,-.43,.36,.22],[.36,.22,-.58,.22],[-.58,.22,-.58,-.43],
   [-.58,.22,-.12,.55],[-.12,.55,.36,.22],[-.58,-.43,-.28,-.22],[.36,-.43,.68,-.22],
   [.36,.22,.68,.43],[-.28,-.22,.68,-.22],[-.28,-.22,-.28,.43],[.68,-.22,.68,.43],
   [-.28,.43,.68,.43],[-.12,.55,.22,.76],[.22,.76,.68,.43],[.22,.76,.22,.08],[-.28,.43,.22,.76],
   [-.40,-.43,-.40,-.02],[-.40,-.02,-.16,-.02],[-.16,-.02,-.16,-.43],
   [-.02,-.10,.20,-.10],[.20,-.10,.20,.12],[-.02,.12,-.02,-.10],[.44,-.22,.44,.06],
   [.44,.06,.60,.06],[.60,.06,.60,-.22]
  ];
  function sampleLines(lines,count){
   const segs=lines.map(l=>({x1:l[0],y1:l[1],x2:l[2],y2:l[3],len:Math.hypot(l[2]-l[0],l[3]-l[1])}));
   const total=segs.reduce((n,s)=>n+s.len,0);
   return Array.from({length:count},(_,i)=>{
    let d=(i/(count-1))*total,seg=segs[segs.length-1];
    for(const s of segs){if(d<=s.len){seg=s;break;}d-=s.len;}
    const t=seg.len?d/seg.len:0;return{x:seg.x1+(seg.x2-seg.x1)*t,y:seg.y1+(seg.y2-seg.y1)*t};
   });
  }
  const plan=sampleLines(planLines,scatter.length),house=sampleLines(houseLines,scatter.length);
  function resize(){
   const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
   W=r.width;H=r.height;DPR=Math.min(window.devicePixelRatio||1,1.6);
   canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
   ctx.setTransform(DPR,0,0,DPR,0,0);draw(performance.now());
  }
  function phase(){return progress<.335?0:progress<.68?1:2}
  function updateCopy(){
   const nphase=phase();if(nphase===lastPhase)return;lastPhase=nphase;const d=copy[nphase];
   const n=section.querySelector("[data-morph-number]"),title=section.querySelector("[data-morph-title]"),desc=section.querySelector("[data-morph-description]"),cap=section.querySelector("[data-morph-caption]"),stage=section.querySelector("[data-morph-stage]");
   if(n)n.textContent=d.num;if(title)title.innerHTML=d.title;if(desc)desc.textContent=d.desc;if(cap)cap.textContent=d.caption;if(stage)stage.textContent=d.stage;
   section.querySelectorAll("[data-morph-go]").forEach(b=>b.classList.toggle("active",Number(b.dataset.morphGo)===nphase));
  }
  function readScroll(){
   const rect=section.getBoundingClientRect(),range=Math.max(1,section.offsetHeight-window.innerHeight);
   progress=Math.max(0,Math.min(1,-rect.top/range));
   const bar=section.querySelector("[data-morph-progress-bar]");if(bar)bar.style.width=(progress*100).toFixed(1)+"%";
   updateCopy();if(active&&!raf)raf=requestAnimationFrame(loop);
  }
  function draw(now){
   if(!W||!H)return;ctx.clearRect(0,0,W,H);
   ctx.strokeStyle="rgba(72,91,76,.055)";ctx.lineWidth=.65;const grid=32;
   for(let x=W%grid;x<W;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
   for(let y=H%grid;y<H;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
   const v=progress*2,from=v<1?scatter:plan,to=v<1?plan:house,blend=smooth(v<1?v:v-1),unit=Math.min(W*.47,H*.53);
   const positions=scatter.map((p,i)=>{
    const p0=from[i],p1=to[i],v2=blendPoint(p0,p1,blend),drift=reduced?0:1.65;
    return{x:W*.5+v2.x*unit+Math.sin(now*.00048+i*1.73)*drift,y:H*.5-v2.y*unit+Math.cos(now*.00042+i*1.29)*drift};
   });
   const limit=Math.min(52,unit*.19);ctx.lineWidth=.7;
   for(let i=0;i<positions.length;i++){
    const a=positions[i];
    for(let j=i+1;j<positions.length;j++){
     const b=positions[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
     if(d2<limit*limit){const d=Math.sqrt(d2),alpha=(1-d/limit)*(.10+progress*.055);
      ctx.strokeStyle="rgba(65,91,73,"+alpha+")";ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
   }
   positions.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=i%13===0?"rgba(179,121,81,.9)":"rgba(67,94,76,.66)";ctx.arc(p.x,p.y,i%13===0?1.8:1.15,0,Math.PI*2);ctx.fill()});
  }
  function loop(now){raf=0;if(!active)return;draw(now);if(!reduced)raf=requestAnimationFrame(loop)}
  section.querySelectorAll("[data-morph-go]").forEach(b=>b.addEventListener("click",()=>{
   const range=Math.max(1,section.offsetHeight-window.innerHeight),n=Number(b.dataset.morphGo);
   const target=section.getBoundingClientRect().top+window.scrollY+range*(n/2);
   window.scrollTo({top:target,behavior:reduced?"auto":"smooth"});
  }));
  window.addEventListener("scroll",readScroll,{passive:true});
  const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
  const io=new IntersectionObserver(entries=>{
   active=entries[0].isIntersecting;
   if(active){readScroll();if(!raf)raf=requestAnimationFrame(loop)}
   else if(raf){cancelAnimationFrame(raf);raf=0}
  },{threshold:.01});
  io.observe(section);resize();readScroll();
 }

 initMorphStory(root);const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();updateUI();
 let running=true;document.addEventListener("visibilitychange",()=>{running=!document.hidden;});function animate(){requestAnimationFrame(animate);if(!running)return;controls.update();renderer.render(scene,camera);}animate();if(loading)window.setTimeout(()=>loading.classList.add("hidden"),450);
})();
