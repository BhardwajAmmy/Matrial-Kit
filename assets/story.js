import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const mix = (a,b,t) => a + (b-a)*t;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sampleSegments(segments, count, y=0.035) {
  const lengths = segments.map(s => Math.hypot(s[2]-s[0], s[3]-s[1], (s[5]||0)-(s[1]||0)));
  // For 2D/3D tuple segments [x1,z1,y1,x2,z2,y2].
  const lens = segments.map(s => Math.hypot(s[3]-s[0], s[4]-s[1], s[5]-s[2]));
  const total = lens.reduce((a,b)=>a+b,0) || 1;
  const result=[];
  for (let i=0;i<count;i++) {
    let d=((i+0.5)/count)*total, index=0;
    while(index<lens.length-1 && d>lens[index]) { d-=lens[index]; index++; }
    const s=segments[index], t=lens[index] ? d/lens[index] : 0;
    result.push([mix(s[0],s[3],t), mix(s[2],s[5],t), mix(s[1],s[4],t)]);
  }
  return result;
}
function seg(x1,z1,y1,x2,z2,y2=0.04){return [x1,z1,y1,x2,z2,y2];}
function linesFromPath(points, y=0.04, closed=false) {
  const out=[]; for(let i=0;i<points.length-1;i++) out.push(seg(points[i][0],points[i][1],y,points[i+1][0],points[i+1][1],y));
  if(closed && points.length>2) out.push(seg(points[points.length-1][0],points[points.length-1][1],y,points[0][0],points[0][1],y)); return out;
}
function makeHouseLines(){
  const l=[];
  // Site/foundation and main house volume.
  l.push(...linesFromPath([[-2.7,-2.05],[2.7,-2.05],[2.7,2.05],[-2.7,2.05]],0.035,true));
  const floor=[[-1.9,-1.25],[1.9,-1.25],[1.9,1.35],[-1.9,1.35]];
  const upper=[[-1.55,-.95],[1.55,-.95],[1.55,.95],[-1.55,.95]];
  l.push(...linesFromPath(floor,0.12,true));
  // Ground floor walls and upper slab.
  l.push(...linesFromPath(floor,1.55,true));
  for(const [x,z] of floor) l.push(seg(x,z,.12,x,z,1.55));
  l.push(...linesFromPath(upper,1.62,true));
  // Upper volume and parapet.
  l.push(...linesFromPath(upper,3.05,true));
  for(const [x,z] of upper) l.push(seg(x,z,1.62,x,z,3.05));
  l.push(...linesFromPath([[-1.7,-1.07],[1.7,-1.07],[1.7,1.07],[-1.7,1.07]],3.18,true));
  // Window frames on front face z=1.35 and upper front face z=.95.
  for(const x of [-1.2,-.35,.55,1.28]) { l.push(seg(x,1.365,.55,x+.43,1.365,.55),seg(x+.43,1.365,.55,x+.43,1.365,1.18),seg(x+.43,1.365,1.18,x,1.365,1.18),seg(x,1.365,1.18,x,1.365,.55)); }
  for(const x of [-.95,.25]) { l.push(seg(x,.965,2.05,x+.57,.965,2.05),seg(x+.57,.965,2.05,x+.57,.965,2.65),seg(x+.57,.965,2.65,x,.965,2.65),seg(x,.965,2.65,x,.965,2.05)); }
  // Door and path.
  l.push(seg(-.22,1.375,.12,-.22,1.375,1.35),seg(.25,1.375,.12,.25,1.375,1.35),seg(-.22,1.375,1.35,.25,1.375,1.35));
  l.push(...linesFromPath([[0,1.8],[0,2.5],[.1,3.2]],0.06,false));
  return l;
}
function makePlanLines(){
  const p=[];
  p.push(...linesFromPath([[-2,-1.5],[2,-1.5],[2,1.5],[-2,1.5]],.045,true));
  // Interior plan partitions with doors represented by breaks.
  p.push(seg(0,-1.5,.045,0,-.35,.045),seg(0,.25,.045,0,1.5,.045));
  p.push(seg(-2,.05,.045,-.65,.05,.045),seg(.2,.05,.045,2,.05,.045));
  p.push(seg(-.85,-1.5,.045,-.85,-.3,.045),seg(-.85,.35,.045,-.85,1.5,.045));
  p.push(seg(.9,.05,.045,.9,1.5,.045));
  // kitchen/bath fixtures and furniture hints.
  p.push(...linesFromPath([[-1.75,-1.25],[-1.05,-1.25],[-1.05,-.75],[-1.75,-.75]],.055,true));
  p.push(...linesFromPath([[.35,.45],[.75,.45],[.75,1.1],[.35,1.1]],.055,true));
  p.push(...linesFromPath([[-1.65,.45],[-1.15,.45],[-1.15,.95],[-1.65,.95]],.055,true));
  p.push(...linesFromPath([[1.15,-1.15],[1.7,-1.15],[1.7,-.65],[1.15,-.65]],.055,true));
  // Door swings as quarter approximations.
  for(const [cx,cz,r,start,end] of [[0,-.35,.42,Math.PI/2,Math.PI],[0,.25,.42,Math.PI,Math.PI*1.5],[-.65,.05,.35,-Math.PI/2,0],[.2,.05,.35,Math.PI,Math.PI*1.5]]){
    const pts=[]; for(let i=0;i<=9;i++){const a=start+(end-start)*i/9;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);} p.push(...linesFromPath(pts,.05,false));
  }
  return p;
}
function makeCanvasLines(){
  const l=[]; l.push(...linesFromPath([[-2.5,-1.7],[2.5,-1.7],[2.5,1.7],[-2.5,1.7]],.025,true));
  for(let x=-2.25;x<=2.26;x+=.28) l.push(seg(x,-1.68,.028,x,1.68,.028));
  for(let z=-1.4;z<=1.41;z+=.28) l.push(seg(-2.48,z,.028,2.48,z,.028));
  return l;
}
function cloudPoints(count){const a=[];for(let i=0;i<count;i++){const r=1.4+Math.random()*3.8,t=Math.random()*Math.PI*2,u=(Math.random()-.5)*3.2;a.push([Math.cos(t)*r,u,Math.sin(t)*r]);}return a;}
function pointsForSegments(lines,count){return sampleSegments(lines,count).map(p=>[p[0],p[1],p[2]]);}
function houseFillPoints(count){
  const a=[];
  // A house-like cloud: sample top and side faces of two box volumes.
  const boxes=[{x:0,z:0,y:.85,w:3.8,d:2.7,h:1.55,n:.68},{x:0,z:0,y:2.35,w:3.1,d:2.05,h:1.45,n:.32}];
  for(let i=0;i<count;i++){
    const b=Math.random()<.68?boxes[0]:boxes[1]; const face=Math.floor(Math.random()*6); let x,z,y;
    if(face===0){x=(Math.random()-.5)*b.w;z=(Math.random()-.5)*b.d;y=b.y+b.h/2;}
    else if(face===1){x=(Math.random()-.5)*b.w;z=(Math.random()-.5)*b.d;y=b.y-b.h/2;}
    else if(face===2){x=-b.w/2;z=(Math.random()-.5)*b.d;y=b.y+(Math.random()-.5)*b.h;}
    else if(face===3){x=b.w/2;z=(Math.random()-.5)*b.d;y=b.y+(Math.random()-.5)*b.h;}
    else if(face===4){z=-b.d/2;x=(Math.random()-.5)*b.w;y=b.y+(Math.random()-.5)*b.h;}
    else {z=b.d/2;x=(Math.random()-.5)*b.w;y=b.y+(Math.random()-.5)*b.h;}
    a.push([x,y,z]);
  }
  return a;
}
function geometryFromSegments(lines,color=0x526e5c, opacity=.7){
  const pts=[]; for(const s of lines){pts.push(s[0],s[2],s[1],s[3],s[5],s[4]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}); return new THREE.LineSegments(g,m);
}
function makeHouseMesh(){
  const group=new THREE.Group(); group.name='house-mesh'; const parts=[];
  const matWall=new THREE.MeshStandardMaterial({color:0xc9bba6,roughness:.88,transparent:true,opacity:0,side:THREE.DoubleSide});
  const matEdge=new THREE.MeshStandardMaterial({color:0x607466,roughness:.8,transparent:true,opacity:0});
  const matFloor=new THREE.MeshStandardMaterial({color:0x948775,roughness:1,transparent:true,opacity:0});
  const matAccent=new THREE.MeshStandardMaterial({color:0x9e5e44,roughness:.82,transparent:true,opacity:0});
  function box(w,h,d,x,y,z,mat,phase){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat.clone());m.position.set(x,y,z);m.userData.phase=phase;m.userData.isGlass=(mat.color.getHex()===0x8aaba5);group.add(m);parts.push(m);return m;}
  // Foundation / plinth.
  box(4.05,.16,3.0,0,.07,0,matFloor,0);
  // Ground floor walls, with deliberately simplified openings in the front.
  box(3.9,1.48,.13,0,.86,-1.42,matWall,1);
  box(.75,1.48,.13,-1.56,.86,1.42,matWall,1); box(.95,1.48,.13,.05,.86,1.42,matWall,1); box(.7,1.48,.13,1.62,.86,1.42,matWall,1);
  box(.13,1.48,2.72,-1.96,.86,0,matWall,1); box(.13,1.48,2.72,1.96,.86,0,matWall,1);
  // Ground slab and upper walls.
  box(4.05,.13,3.02,0,1.66,0,matFloor,2);
  box(3.25,1.34,.13,0,2.38,-1.05,matWall,2);
  box(.85,1.34,.13,-1.18,2.38,.98,matWall,2); box(.85,1.34,.13,1.18,2.38,.98,matWall,2);
  box(.13,1.34,2.03,-1.62,2.38,-.03,matWall,2); box(.13,1.34,2.03,1.62,2.38,-.03,matWall,2);
  box(3.42,.12,2.25,0,3.09,0,matFloor,3);
  // Parapet and accent portal.
  box(3.5,.27,.12,0,3.27,-1.13,matWall,3); box(.12,.27,2.26,-1.69,3.27,0,matWall,3); box(.12,.27,2.26,1.69,3.27,0,matWall,3);
  box(.12,2.15,.16,-.48,1.18,1.51,matAccent,3); box(.12,2.15,.16,.48,1.18,1.51,matAccent,3); box(1.08,.12,.16,0,2.23,1.51,matAccent,3);
  // Window glazing planes.
  const glass=new THREE.MeshStandardMaterial({color:0x8aaba5,metalness:.1,roughness:.3,transparent:true,opacity:0});
  box(.7,.55,.025,-1.1,1.0,1.505,glass,4); box(.7,.55,.025,.95,1.0,1.505,glass,4); box(.95,.55,.025,-.68,2.5,1.08,glass,4); box(.95,.55,.025,.68,2.5,1.08,glass,4);
  // Subtle site path.
  box(.8,.025,1.5,0,.02,2.13,matAccent,4);
  // Set all parts visible through scale/opacity controlled on scroll. Material instances shared by phase.
  group.userData.parts=parts; group.userData.materials={matWall,matEdge,matFloor,matAccent,glass}; return group;
}
function initHeroScene(root){
  const stage=root.querySelector('.ehx-lightstage');if(!stage)return null;
  const buttons=[...stage.querySelectorAll('[data-light-mode]')];
  const title=stage.querySelector('[data-light-title]'),description=stage.querySelector('[data-light-description]');
  const presets={
    morning:{title:'Soft morning',description:'Gentle warmth, long shadows, a slow start.',x:'23%',y:'33%'},
    daylight:{title:'Clear daylight',description:'Balanced colour, open space, honest materials.',x:'66%',y:'22%'},
    evening:{title:'Evening glow',description:'Deeper tones, warm edges, time to settle.',x:'82%',y:'38%'}
  };
  let resetTimer=0;
  function setMode(mode){
    const preset=presets[mode];if(!preset)return;
    stage.dataset.lightMode=mode;
    stage.style.setProperty('--beam-x',preset.x);stage.style.setProperty('--beam-y',preset.y);
    buttons.forEach(b=>{const active=b.dataset.lightMode===mode;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',active?'true':'false');});
    if(title)title.textContent=preset.title;if(description)description.textContent=preset.description;
    stage.classList.remove('is-changing');void stage.offsetWidth;stage.classList.add('is-changing');
    window.clearTimeout(resetTimer);resetTimer=window.setTimeout(()=>stage.classList.remove('is-changing'),1000);
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.lightMode)));
  stage.addEventListener('pointermove',ev=>{
    if(ev.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=stage.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;
    stage.style.setProperty('--parallax-x',`${(x-.5)*-11}px`);stage.style.setProperty('--parallax-y',`${(y-.5)*-8}px`);
    const mode=stage.dataset.lightMode||'morning';
    stage.style.setProperty('--beam-x',`${Math.min(92,Math.max(8,parseFloat(presets[mode].x)+(x-.5)*9))}%`);
    stage.style.setProperty('--beam-y',`${Math.min(72,Math.max(12,parseFloat(presets[mode].y)+(y-.5)*8))}%`);
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--parallax-x','0px');stage.style.setProperty('--parallax-y','0px');const p=presets[stage.dataset.lightMode||'morning'];stage.style.setProperty('--beam-x',p.x);stage.style.setProperty('--beam-y',p.y);},{passive:true});
  setMode('morning');
  return {dispose(){window.clearTimeout(resetTimer);}};
}

function initScene(root){
  const canvas=root.querySelector('.ehx-canvas');
  let renderer,scene,camera,points,houseMesh,plotLines,planLines,houseLines,canvasLines,baseGrid,frameId=0,active=false,disposed=false;
  const N=1350;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!matchMedia('(max-width:680px)').matches,powerPreference:'low-power'});
  }catch(e){
    const fallback=root.querySelector('.ehx-scene-fallback'); if(fallback) fallback.hidden=false;
    canvas.hidden=true; return null;
  }
  const fallback=root.querySelector('.ehx-scene-fallback');if(fallback)fallback.hidden=true;
  canvas.dataset.ehxSceneReady='1';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)); renderer.setSize(canvas.clientWidth||window.innerWidth,canvas.clientHeight||window.innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene(); scene.background=null;
  camera=new THREE.PerspectiveCamera(34,1,.1,100); camera.position.set(7.3,6.3,8.7); camera.lookAt(window.innerWidth<680?0:-2.65,1,0);
  const hemi=new THREE.HemisphereLight(0xfaf5eb,0x6b786d,1.55);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffedda,2.0);key.position.set(4,9,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc3d8cf,.78);fill.position.set(-6,4,-4);scene.add(fill);
  // Quiet ground grid, never a heavy texture.
  baseGrid=new THREE.GridHelper(12,30,0x9cae9c,0xcbd1c5);baseGrid.position.y=-.03;baseGrid.material.transparent=true;baseGrid.material.opacity=.15;scene.add(baseGrid);
  plotLines=makeCanvasLines(); planLines=makePlanLines(); houseLines=makeHouseLines(); canvasLines=plotLines;
  const shapeCloud=cloudPoints(N), shapeCanvas=pointsForSegments(canvasLines,N), shapePlan=pointsForSegments(planLines,N), shapeStructure=pointsForSegments(houseLines,N), shapeHome=houseFillPoints(N);
  const positions=new Float32Array(N*3); for(let i=0;i<N;i++){positions[i*3]=shapeCloud[i][0];positions[i*3+1]=shapeCloud[i][1];positions[i*3+2]=shapeCloud[i][2];}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const colors=new Float32Array(N*3);const col1=new THREE.Color(0x526c59),col2=new THREE.Color(0xa9684d);
  for(let i=0;i<N;i++){const c=Math.random()<.14?col2:col1;colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({size:.036,vertexColors:true,transparent:true,opacity:.92,depthWrite:false,sizeAttenuation:true});
  points=new THREE.Points(geometry,material);scene.add(points);
  // A live network joins nearby particles while the idea is still unformed.
  // It is drawn as one dynamic buffer, not thousands of individual objects.
  const maxConnections=190, networkNodes=128;
  const networkPositions=new Float32Array(maxConnections*6);
  const networkGeometry=new THREE.BufferGeometry();
  networkGeometry.setAttribute('position',new THREE.BufferAttribute(networkPositions,3).setUsage(THREE.DynamicDrawUsage));
  networkGeometry.setDrawRange(0,0);
  const networkMaterial=new THREE.LineBasicMaterial({color:0x8ba08b,transparent:true,opacity:0,depthWrite:false});
  const network=new THREE.LineSegments(networkGeometry,networkMaterial);scene.add(network);
  // Crisp linework overlays fade in over the point-cloud transition.
  const guideGroup=new THREE.Group();scene.add(guideGroup);
  const plotGuide=geometryFromSegments(linesFromPath([[-2.5,-1.7],[2.5,-1.7],[2.5,1.7],[-2.5,1.7]],.04,true),0x6a7c6d,.35);guideGroup.add(plotGuide);
  const planGuide=geometryFromSegments(planLines,0x3e604c,.8);guideGroup.add(planGuide);planGuide.visible=false;planGuide.material.opacity=0;
  const structureGuide=geometryFromSegments(houseLines,0x3b5846,.62);guideGroup.add(structureGuide);structureGuide.visible=false;structureGuide.material.opacity=0;
  houseMesh=makeHouseMesh();scene.add(houseMesh);
  // Store target positions for fast, continuous morphs controlled by story progress.
  const targets=[shapeCloud,shapeCanvas,shapePlan,shapeStructure,shapeHome];
  const stages=root.querySelectorAll('.ehx-chapter');const status=root.querySelector('.ehx-stage-status-text');const jumpBtns=root.querySelectorAll('[data-jump]');
  let scrollProgress=0,lastProgress=-1,rafNeeded=true,mouseX=0,mouseY=0;
  const journey=root.querySelector('.ehx-journey');
  function getProgress(){const rect=journey.getBoundingClientRect();const scrollable=Math.max(1,journey.offsetHeight-window.innerHeight);return clamp(-rect.top/scrollable);}
  function requestRender(){if(!frameId&&!disposed) frameId=requestAnimationFrame(render);}
  function setProgress(p){scrollProgress=clamp(p);rafNeeded=true;requestRender();}
  function resize(){const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,matchMedia('(max-width:680px)').matches?1.1:1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();rafNeeded=true;requestRender();}
  function setChapter(idx){stages.forEach((el,i)=>{const yes=i===idx;el.classList.toggle('is-active',yes);el.setAttribute('aria-hidden',yes?'false':'true');});jumpBtns.forEach((b,i)=>b.classList.toggle('is-active',i===idx));if(status) status.textContent=String(idx+1).padStart(2,'0')+' / '+['THE IDEA','THE PLOT','THE PLAN','THE STRUCTURE','THE HOME'][idx];const note=root.querySelector('.ehx-model-note-number'),title=root.querySelector('.ehx-model-note-title');if(note)note.textContent=String(idx+1).padStart(2,'0')+' / 05';if(title)title.textContent=['Living patterns','Reading the site','Room relationships','Details meet site','A place to belong'][idx];}
  jumpBtns.forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.jump);const rect=journey.getBoundingClientRect();const start=window.scrollY+rect.top;const track=Math.max(1,journey.offsetHeight-window.innerHeight);window.scrollTo({top:start+track*(idx/4),behavior:prefersReducedMotion?'auto':'smooth'});}));
  root.addEventListener('pointermove',ev=>{if(ev.pointerType==='mouse'&&!prefersReducedMotion){mouseX=(ev.clientX/window.innerWidth-.5)*.22;mouseY=(ev.clientY/window.innerHeight-.5)*.12;rafNeeded=true;requestRender();}},{passive:true});
  const chapterObserver=new IntersectionObserver(entries=>{active=entries.some(e=>e.isIntersecting);if(active){setProgress(getProgress());setChapter(Math.min(4,Math.floor(scrollProgress*4.999)));rafNeeded=true;requestRender();}else if(frameId&&!prefersReducedMotion){cancelAnimationFrame(frameId);frameId=0;}},{threshold:0});chapterObserver.observe(journey);
  window.addEventListener('scroll',()=>{if(active){setProgress(getProgress());setChapter(Math.min(4,Math.floor(scrollProgress*4.999)));}},{passive:true});window.addEventListener('resize',resize,{passive:true});resize();setChapter(0);
  function updateHouse(q){
    const parts=houseMesh.userData.parts;
    for(const mesh of parts){const ph=mesh.userData.phase;let k=0;if(q>=.12){const local=clamp((q-.12)/.88);k=smooth(clamp((local-ph*.16)/.4));}mesh.material.opacity=k*(mesh.userData.isGlass?.76:.92);mesh.scale.y=ph===0?1:mix(.88,1,k);}
  }
  function render(now){
    frameId=0;
    if(disposed||document.hidden)return;
    if(!active&&!rafNeeded)return;
    const p=scrollProgress,scaled=p*4,idx=Math.min(3,Math.floor(scaled)),local=scaled-idx;
    const blend=smooth(local);
    const arr=geometry.attributes.position.array;const from=targets[idx],to=targets[idx+1];
    const cloudWeight=idx===0?(1-blend):0;
    for(let i=0;i<N;i++){
      const a=from[i],b=to[i],ix=i*3;
      const phase=now*.00031+i*.071;
      // A layered, flowing field gives the initial particles life without looking noisy.
      const fx=(Math.sin(a[1]*1.55+phase)+Math.cos(a[2]*1.08-phase*.63))*.22*cloudWeight;
      const fy=(Math.cos(a[0]*1.23+phase*.79)+Math.sin(a[2]*1.32+phase*.58))*.17*cloudWeight;
      const fz=(Math.sin(a[0]*.92-phase*.72)+Math.cos(a[1]*1.41+phase*.84))*.20*cloudWeight;
      const cursorDx=a[0]-mouseX*5.2,cursorDy=a[1]+mouseY*3.5;
      const cursorForce=Math.exp(-(cursorDx*cursorDx+cursorDy*cursorDy)/1.2)*.12*cloudWeight;
      arr[ix]=mix(a[0],b[0],blend)+fx+(a[0]-mouseX*5.2)*cursorForce;
      arr[ix+1]=mix(a[1],b[1],blend)+fy+(a[1]+mouseY*3.5)*cursorForce;
      arr[ix+2]=mix(a[2],b[2],blend)+fz;
    }
    geometry.attributes.position.needsUpdate=true;
    // Build live connecting lines between nearby points during the first chapter.
    const networkAlpha=(1-smooth(clamp(p/.27)))*.115;
    networkMaterial.opacity=networkAlpha;
    let connectionCount=0;
    if(networkAlpha>.004){
      const nodeCount=Math.min(networkNodes,N),thresholdSq=1.08*1.08;
      outer: for(let i=0;i<nodeCount;i++){
        const ai=i*3,ax=arr[ai],ay=arr[ai+1],az=arr[ai+2];
        for(let j=i+1;j<nodeCount;j++){
          const bj=j*3,dx=ax-arr[bj],dy=ay-arr[bj+1],dz=az-arr[bj+2];
          if(dx*dx+dy*dy+dz*dz<thresholdSq){
            const o=connectionCount*6;
            networkPositions[o]=ax;networkPositions[o+1]=ay;networkPositions[o+2]=az;
            networkPositions[o+3]=arr[bj];networkPositions[o+4]=arr[bj+1];networkPositions[o+5]=arr[bj+2];
            connectionCount++;
            if(connectionCount>=maxConnections) break outer;
          }
        }
      }
      networkGeometry.setDrawRange(0,connectionCount*2);
      networkGeometry.attributes.position.needsUpdate=true;
    } else networkGeometry.setDrawRange(0,0);
    // Morph from a living particle network into plot, floor plan, structure and home.
    plotGuide.visible=p>.12&&p<.58;plotGuide.material.opacity=.36*(1-smooth(clamp((p-.2)/.35)));
    planGuide.visible=p>.34&&p<.77;planGuide.material.opacity=.82*smooth(clamp((p-.34)/.18))*(1-smooth(clamp((p-.61)/.16)));
    structureGuide.visible=p>.53&&p<.99;structureGuide.material.opacity=.7*smooth(clamp((p-.53)/.16))*(1-smooth(clamp((p-.78)/.18)));
    const q=clamp((p-.56)/.44);updateHouse(q);
    const mobile=window.innerWidth<680;
    camera.position.x=mix(mobile?5.8:7.3,mobile?5.2:6.3,p)+mouseX*(!prefersReducedMotion?1.25:0);
    camera.position.y=mix(6.3,5.4,p)+mouseY*(!prefersReducedMotion?1:0);
    camera.position.z=mix(8.7,7.7,p);camera.lookAt(window.innerWidth<680?0:-2.65+mouseX*.18,mix(.1,1.05,p),0);
    points.rotation.y=Math.sin(now*.00018)*.035;network.rotation.y=points.rotation.y;renderer.render(scene,camera);
    rafNeeded=false;
    if(Math.abs(p-lastProgress)>.0004){lastProgress=p;}
    // Keep animating while the pinned story is visible. Outside it, render only on scroll/resize.
    if(active&&!prefersReducedMotion) requestRender();
  }
  requestRender();
  // Avoid leaving the WebGL context burning cycles when the story is far from view.
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frameId)cancelAnimationFrame(frameId);frameId=0;}else{setProgress(getProgress());}});
  return {dispose(){disposed=true;cancelAnimationFrame(frameId);chapterObserver.disconnect();renderer.dispose();geometry.dispose();material.dispose();networkGeometry.dispose();networkMaterial.dispose();scene.clear();}};
}

function setupUI(root){
  const menu=root.querySelector('.ehx-menu'),nav=root.querySelector('.ehx-nav');
  if(menu&&nav){menu.addEventListener('click',()=>{const opened=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',opened?'true':'false');menu.setAttribute('aria-label',opened?'Close navigation':'Open navigation');});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}));}
  const form=root.querySelector('[data-ehx-form]');
  if(form){form.addEventListener('submit',ev=>{ev.preventDefault();const d=new FormData(form);const fields=[['Name',d.get('name')],['Phone / WhatsApp',d.get('phone')],['Plot size',d.get('plot')],['Current stage',d.get('stage')],['Project details',d.get('message')]].filter(([,v])=>String(v||'').trim());const msg='Hello ExactHousing, I would like to discuss a home design project.\n\n'+fields.map(([k,v])=>k+': '+v).join('\n');
      // Replace this placeholder with the business WhatsApp number before launch.
      const number=(root.dataset.whatsapp||'').replace(/\D/g,'');
      const status=form.querySelector('.ehx-form-status');
      if(!number){status.textContent='The form is working, but WhatsApp is not configured yet. Add your business number in the plugin code before launch.';const toast=root.querySelector('.ehx-toast');if(toast){toast.textContent='Configure the WhatsApp number before publishing.';toast.classList.add('is-visible');setTimeout(()=>toast.classList.remove('is-visible'),3600);}return;}
      const url='https://wa.me/'+number+'?text='+encodeURIComponent(msg);window.open(url,'_blank','noopener,noreferrer');status.textContent='Your project brief is ready in WhatsApp.';
    });}
}
document.querySelectorAll('.ehx').forEach(root=>{setupUI(root);const lightStage=root.querySelector('.ehx-lightstage');if(lightStage){let heroReady=false;const startHero=()=>{if(heroReady)return;heroReady=true;initHeroScene(root);};if('IntersectionObserver'in window){const heroLoader=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){heroLoader.disconnect();startHero();}},{rootMargin:'120px'});heroLoader.observe(lightStage);}else startHero();}const init=()=>initScene(root);if('IntersectionObserver'in window){const preloader=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){preloader.disconnect();init();}},{rootMargin:'200px'});preloader.observe(root.querySelector('.ehx-journey'));}else init();});