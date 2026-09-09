import {Music} from './music.js';
const music=new Music();
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const keys = {left:false,right:false,jump:false,boost:false};
const VERSION='2.1.0';
const stages=[
 {name:'01 · SUNLIT TERRACES',title:'The garden wakes',tip:'Learn the jump rhythm. Upper terraces hide star relics.',sky:['#193c65','#7b9fa0','#ffcf9a'],turf:'#a7f3b9',end:14000,gaps:[[2100,2220],[4800,4940],[7400,7560],[10300,10440],[12400,12550]],drones:[1600,3600,6100,9000,11500],beacons:[3100,6800,11100]},
 {name:'02 · TIDAL OBSERVATORY',title:'Across the moonwater',tip:'Stepping islands, tidal vents and hidden observatory ledges.',sky:['#112f4b','#326d88','#90c8cb'],turf:'#7fe6f2',end:14500,gaps:[[1800,1930],[4200,4360],[7000,7160],[9800,9950],[12700,12880]],drones:[2900,5500,8300,11000,13600],beacons:[3400,7700,11900]},
 {name:'03 · AURORA ENGINE',title:'Bring back the light',tip:'Read the pulse barriers. Restore the final three lanterns.',sky:['#211c4c','#63568d','#d090b1'],turf:'#e5a4ff',end:15000,gaps:[[2400,2550],[5100,5270],[7900,8070],[10600,10780],[13400,13580]],drones:[1500,3900,6600,9400,12100,14300],beacons:[3300,7200,11600]}
];
let stage=0,END,checkpoints,gaps,platforms,beacons,relics,springs,barriers,stageTimes=[],deaths=0;
function loadStage(){const z=stages[stage];END=z.end;gaps=z.gaps;checkpoints=[2800,5800,8800,11800];
 platforms=[];
 // Each hub has an accessible ascent, an upper reward route, and a safe lower route.
 for(const x of [900,3100,5800,8500,11100,13200]){platforms.push({x,y:ground(x)-85,w:190},{x:x+210,y:ground(x)-155,w:260},{x:x+490,y:ground(x)-95,w:190});}
 if(stage===1)for(const [a,b] of gaps)platforms.push({x:a+20,y:ground(a)-75,w:b-a-40});
 beacons=z.beacons.map(x=>({x,y:ground(x)-55,got:false}));relics=platforms.filter((_,i)=>i%3===1).map(p=>({x:p.x+p.w/2,y:p.y-40,got:false}));
 springs=[2000,6500,10000].map(x=>({x,y:ground(x)}));barriers=stage===2?[4500,8700,13000]:[];
 $('stage').textContent=z.name;}

let W=1280,H=720,view=1280,cam=0,mode='ready',elapsed=0,score=0,checkpoint=100,last=0,acc=0,jumpBuffer=0,coyote=0,jumpWas=false,sound=true,audio,noticeTimer=0;
let player,prisms,enemies,particles=[],trail=[];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function ground(x){return 470+Math.sin(x/(stage===1?540:410))*42+Math.sin(x/190+stage)*22;}
function inGap(x){return gaps.some(([a,b])=>x>a&&x<b);}
function tone(freq=600,duration=.08,type='sine'){if(!sound)return;try{audio ||= new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.5,audio.currentTime+duration);g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{sound=false;}}
function notify(text){$('notice').textContent=text;noticeTimer=2.6;}
function burst(x,y,color,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*300,vy:(Math.random()-.7)*300,life:.6,color});}
function reset(whole=true){if(whole){stage=0;elapsed=0;score=0;stageTimes=[];deaths=0;}loadStage();player={x:100,y:ground(100)-23,vx:0,vy:0,r:21,grounded:true,inv:0};prisms=[];enemies=[];for(let x=420;x<END-250;x+=115){if(!inGap(x))prisms.push({x,y:ground(x)-65-Math.max(0,Math.sin(x/320))*65,got:false});}for(const p of platforms)for(let i=0;i<5;i++)prisms.push({x:p.x+22+i*42,y:p.y-35,got:false});for(const x of stages[stage].drones)enemies.push({x,base:x,y:ground(x)-22,alive:true});checkpoint=100;cam=0;particles=[];trail=[];jumpBuffer=0;coyote=0;jumpWas=false;Object.keys(keys).forEach(k=>keys[k]=false);updateHUD();}
function start(){reset();mode='playing';music.start(stage);sound=music.enabled;$('overlay').hidden=true;$('notice').textContent='';$('pause').textContent='Ⅱ';canvas.focus();tone(500,.15);}
function panel(title,body,label){$('overlay').hidden=false;$('overlay').querySelector('.overline').textContent=mode==='won'?'CAMPAIGN COMPLETE':mode==='stageclear'?'LANTERNS RESTORED':'TAKE A BREATHER';$('overlay').querySelector('h1').innerHTML=title;$('overlay').querySelector('p').textContent=body;$('start').innerHTML=label+' <span>→</span>';}
function pause(){if(mode==='playing'){mode='paused';music.pause();Object.keys(keys).forEach(k=>keys[k]=false);panel('HOLD THAT<br><em>MOMENTUM.</em>','Your run is waiting right here.','RESUME');$('pause').textContent='▶';}else if(mode==='paused'){mode='playing';music.start(stage);$('overlay').hidden=true;$('pause').textContent='Ⅱ';canvas.focus();}}
function respawn(){deaths++;burst(player.x,player.y,'#ffabac');player.x=checkpoint;player.y=ground(checkpoint)-60;player.vx=0;player.vy=0;player.inv=1.8;score=Math.max(0,score-5);notify('BACK ON TRACK · −5 prisms');tone(160,.2,'triangle');}
function step(dt){if(mode!=='playing')return;elapsed+=dt;noticeTimer-=dt;if(noticeTimer<=0)$('notice').textContent='';player.inv=Math.max(0,player.inv-dt);const dir=Number(keys.right)-Number(keys.left),max=keys.boost?540:400;player.vx+=dir*(player.grounded?760:520)*dt;if(!dir)player.vx*=Math.exp(-(player.grounded?1.75:.12)*dt);if(player.grounded)player.vx-=(ground(player.x+2)-ground(player.x-2))/4*105*dt;player.vx=Math.max(-max,Math.min(max,player.vx));
 if(keys.jump&&!jumpWas)jumpBuffer=.13;else jumpBuffer-=dt;jumpWas=keys.jump;coyote=player.grounded?.12:coyote-dt;
 if(jumpBuffer>0&&coyote>0){player.vy=-760;player.grounded=false;coyote=0;jumpBuffer=0;tone(750,.13);burst(player.x,player.y+20,'#b2ffe1',7);}
 const oldY=player.y,oldX=player.x;player.vy+=(keys.jump&&player.vy<0?1350:2100)*dt;player.x=Math.max(22,Math.min(END+100,player.x+player.vx*dt));player.y+=player.vy*dt;let surface=inGap(player.x)?Infinity:ground(player.x);for(const p of platforms)if(player.x>p.x-10&&player.x<p.x+p.w+10&&oldY+player.r<=p.y+9&&player.vy>=0)surface=Math.min(surface,p.y);
 const follow=player.grounded&&!inGap(oldX)&&Math.abs(player.y+player.r-surface)<40;
 player.grounded=false;if(player.vy>=0&&(player.y+player.r>=surface||follow)&&(oldY+player.r<=surface+24||follow)){player.y=surface-player.r;player.vy=0;player.grounded=true;}
 for(const c of prisms)if(!c.got&&Math.hypot(player.x-c.x,player.y-c.y)<40){c.got=true;score++;burst(c.x,c.y,'#ffdc83',6);tone(950+score%5*100,.065);}
 for(const e of enemies){if(!e.alive)continue;e.x=e.base+Math.sin(elapsed*1.8+e.base)*38;e.y=ground(e.x)-22;if(Math.abs(player.x-e.x)<38&&Math.abs(player.y-e.y)<39){if(player.vy>80&&oldY<e.y-20){e.alive=false;player.vy=-460;score+=3;burst(e.x,e.y,'#ff96b5',16);tone(240,.12,'square');}else if(player.inv<=0){score=Math.max(0,score-5);player.inv=1.6;player.vx=-Math.sign(player.vx||1)*280;player.vy=-350;burst(player.x,player.y,'#ffabac');notify('DRONE HIT · −5 prisms');tone(120,.2,'sawtooth');}}}
 for(const cp of checkpoints)if(player.x>=cp&&checkpoint<cp){checkpoint=cp;notify('CHECKPOINT LIT · Keep flying!');burst(cp,ground(cp)-80,'#8cffe0',22);tone(1000,.25);}
 for(const b of beacons)if(!b.got&&Math.hypot(player.x-b.x,player.y-b.y)<65){b.got=true;notify('LANTERN RESTORED · '+beacons.filter(b=>b.got).length+'/3');tone(1000,.3);}
 for(const r of relics)if(!r.got&&Math.hypot(player.x-r.x,player.y-r.y)<40){r.got=true;score+=20;notify('SECRET STAR · +20 prisms');burst(r.x,r.y,'#fff1a0',24);}
 for(const sp of springs)if(player.grounded&&Math.abs(player.x-sp.x)<23&&keys.jump){player.vy=-820;player.grounded=false;notify('WIND VENT · Ride the upper route');}
 for(const x of barriers)if(Math.abs(player.x-x)<25&&player.y>ground(x)-100&&Math.sin(elapsed*1.5)>0&&player.inv<=0){player.inv=1.5;player.vx=-180;player.vy=-340;score=Math.max(0,score-5);notify('PULSE BARRIER · Jump over or wait for blue');}
 if(player.y>850)respawn();if(player.x>=END){if(beacons.some(b=>!b.got)){player.x=END-25;player.vx=0;notify('Restore all 3 lanterns first · explore back ←');}else{stageTimes.push(elapsed-stageTimes.reduce((a,b)=>a+b,0));music.pause();if(stage<2){mode='stageclear';panel(stages[stage].title+'<br><em>RESTORED.</em>',`${formatTime(stageTimes.at(-1))} · Next: ${stages[stage+1].name}. ${stages[stage+1].tip}`,'NEXT STAGE');}else{mode='won';panel('THE SKY IS<br><em>ALIVE AGAIN.</em>',`${score} prisms · ${formatTime(elapsed)} · 3 realms restored · ${deaths} recoveries. Explore the upper routes for secret stars.`,'NEW CAMPAIGN');}}}

 if(!reduced){trail.push({x:player.x,y:player.y,life:.22});}trail.forEach(p=>p.life-=dt);trail=trail.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);const lead=Math.max(-50,Math.min(125,player.vx*.28));cam+=(Math.max(0,Math.min(END-view+220,player.x-view*.40+lead))-cam)*Math.min(1,dt*5.2);updateHUD();}
function formatTime(t){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function updateHUD(){$('lanterns').textContent=beacons.filter(b=>b.got).length+'/3';$('score').textContent=String(score).padStart(3,'0');$('time').textContent=formatTime(elapsed);$('speed').style.width=`${Math.abs(player.vx)/540*100}%`;}
function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=W*d;canvas.height=H*d;view=W/H*720;}
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function draw(){ctx.setTransform(canvas.width/view,0,0,canvas.height/720,0,0);const sky=ctx.createLinearGradient(0,0,0,720);sky.addColorStop(0,stages[stage].sky[0]);sky.addColorStop(.52,stages[stage].sky[1]);sky.addColorStop(1,stages[stage].sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,view,720);
 ctx.fillStyle='#ffd4a6';ctx.shadowColor='#ffc89c';ctx.shadowBlur=60;ctx.beginPath();ctx.arc(view*.73-cam*.025,216,68,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 for(let layer=0;layer<3;layer++){const par=.07+layer*.1,base=350+layer*70;ctx.beginPath();ctx.moveTo(-20,720);for(let x=-20;x<view+30;x+=20){const wx=x+cam*par;ctx.lineTo(x,base+Math.sin(wx/170+layer*3)*45+Math.sin(wx/65)*12);}ctx.lineTo(view+30,720);ctx.fillStyle=['#60597c','#454b70','#2b435e'][layer];ctx.fill();}
 for(let i=0;i<22;i++){let x=((i*173-cam*.18)%(view+180)+view+180)%(view+180);ctx.fillStyle='#d4f5ee60';ctx.fillRect(x,100+(i*79)%260,2,2);}
 ctx.save();ctx.translate(-cam,0);
 // Floating stone strata, luminous turf, and geometric foliage are all drawn locally.
 for(let x=Math.floor(cam/20)*20-20;x<cam+view+40;x+=20){if(inGap(x+10))continue;const y=ground(x),ny=ground(x+20);polygon([[x,y],[x+21,ny],[x+21,790],[x,790]],'#203d4b');polygon([[x,y+14],[x+21,ny+14],[x+21,ny+50],[x,y+50]],'#335257');ctx.strokeStyle=stages[stage].turf;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+21,ny);ctx.stroke();if(x%100===0){polygon([[x+5,y+75],[x+40,y+105],[x+16,y+158]],'#2c4957');}}
 for(let x=Math.floor(cam/380)*380;x<cam+view+380;x+=380){if(inGap(x))continue;const y=ground(x);ctx.strokeStyle='#315c62';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+9,y-106);ctx.stroke();if(stage===0){polygon([[x-55,y-78],[x+8,y-150],[x+75,y-83]],'#4f9a8d');polygon([[x-35,y-110],[x+8,y-172],[x+47,y-110]],'#77c5a2');}else if(stage===1){ctx.strokeStyle='#83ccda';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+8,y-130,36,0,7);ctx.moveTo(x-40,y-130);ctx.lineTo(x+55,y-130);ctx.stroke();}else{polygon([[x-22,y-25],[x-12,y-165],[x+12,y-210],[x+34,y-45]],'#b091ca');polygon([[x+12,y-210],[x+15,y-35],[x+34,y-45]],'#ebbef7');}}
 for(const p of platforms){polygon([[p.x,p.y],[p.x+p.w,p.y],[p.x+p.w-24,p.y+30],[p.x+30,p.y+40]],'#3b6167');ctx.fillStyle='#a1f1c6';ctx.fillRect(p.x,p.y,p.w,5);}
 for(const r of relics)if(!r.got){ctx.font='30px system-ui';ctx.fillStyle='#fff0a8';ctx.fillText('✧',r.x-13,r.y+10);}
 for(const b of beacons){ctx.fillStyle=b.got?'#abffe5':'#ffdd91';ctx.fillRect(b.x-7,b.y-25,14,50);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,30,0,7);ctx.stroke();ctx.font='bold 11px system-ui';ctx.fillText(b.got?'RESTORED':'LANTERN',b.x-30,b.y-42);}
 for(const sp of springs){ctx.fillStyle='#8bf9ff';ctx.fillRect(sp.x-25,sp.y-8,50,8);ctx.font='bold 11px system-ui';ctx.fillText('↑ WIND VENT',sp.x-35,sp.y-22);}
 for(const x of barriers){ctx.fillStyle=Math.sin(elapsed*1.5)>0?'#ff809dcc':'#81e9ff44';ctx.fillRect(x-12,ground(x)-105,24,105);ctx.font='bold 11px system-ui';ctx.fillStyle='#fff';ctx.fillText('PULSE',x-20,ground(x)-120);}
 // Zone-specific architecture distinguishes each journey, not just its palette.
 if(stage===1){for(let x=Math.floor(cam/700)*700;x<cam+view+700;x+=700){ctx.strokeStyle='#b4f2ff44';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,ground(x)-110,85,Math.PI,0);ctx.stroke();ctx.fillStyle='#8fe8ed33';ctx.fillRect(x-90,ground(x)+80,180,200);}}
 if(stage===2){for(let x=Math.floor(cam/550)*550;x<cam+view+550;x+=550){ctx.strokeStyle='#ecacff44';ctx.lineWidth=3;ctx.strokeRect(x,ground(x)-180,65,150);ctx.beginPath();ctx.moveTo(x,ground(x)-180);ctx.lineTo(x+180,ground(x)-240);ctx.stroke();}}
 for(const cp of checkpoints){const y=ground(cp);ctx.fillStyle='#89b4b7';ctx.fillRect(cp-3,y-115,6,115);polygon([[cp+3,y-115],[cp+50,y-100],[cp+3,y-80]],checkpoint>=cp?'#91ffda':'#b4a1ba');if(checkpoint>=cp){ctx.fillStyle='#9effdc33';ctx.beginPath();ctx.arc(cp,y-105,35,0,7);ctx.fill();}}
 for(const [a,b]of gaps){ctx.fillStyle='#bedac2';ctx.font='bold 11px system-ui';ctx.fillText('JUMP ↗',a-88,ground(a)-25);}
 for(const c of prisms){if(c.got||c.x<cam-30||c.x>cam+view+30)continue;const y=c.y+Math.sin(elapsed*4+c.x)*4;ctx.shadowColor='#ffe19b';ctx.shadowBlur=12;polygon([[c.x,y-12],[c.x+8,y],[c.x,y+12],[c.x-8,y]],'#ffdf87');ctx.shadowBlur=0;polygon([[c.x,y-8],[c.x+4,y],[c.x,y+5]],'#fff7d1');}
 for(const e of enemies){if(!e.alive||e.x<cam-50||e.x>cam+view+50)continue;ctx.fillStyle='#171f3f';ctx.beginPath();ctx.ellipse(e.x,e.y,24,17,0,0,7);ctx.fill();ctx.strokeStyle='#ff91ac';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.x-31,e.y-18);ctx.lineTo(e.x-15,e.y-7);ctx.moveTo(e.x+31,e.y-18);ctx.lineTo(e.x+15,e.y-7);ctx.stroke();ctx.fillStyle='#ffacbb';ctx.fillRect(e.x-12,e.y-4,24,6);}
 const finishY=ground(END);ctx.strokeStyle='#b1ffe4';ctx.lineWidth=9;ctx.beginPath();ctx.roundRect(END-20,finishY-155,75,155,35);ctx.stroke();ctx.fillStyle='#99ffda20';ctx.fill();ctx.font='bold 12px system-ui';ctx.fillStyle='#d7fff1';ctx.fillText('HORIZON',END-17,finishY-175);
 for(const p of trail){ctx.globalAlpha=p.life/.22*.3;ctx.fillStyle='#8bffdc';ctx.beginPath();ctx.arc(p.x,p.y,player.r*.8,0,7);ctx.fill();}ctx.globalAlpha=1;
 ctx.save();ctx.translate(player.x,player.y);if(player.inv>0&&Math.floor(elapsed*14)%2)ctx.globalAlpha=.45;const face=player.vx< -10?-1:1;ctx.scale(face,1);if(!player.grounded)ctx.rotate(elapsed*10);ctx.fillStyle='#0d2c40';ctx.beginPath();ctx.ellipse(0,22,24,5,0,0,7);ctx.fill();polygon([[-10,-7],[-43,-17],[-27,1],[-49,8],[-12,10]],'#ffa28d');ctx.fillStyle='#88f8d7';ctx.beginPath();ctx.roundRect(-18,-21,37,39,14);ctx.fill();polygon([[-12,-18],[-9,-33],[0,-19]],'#a8ffe5');ctx.fillStyle='#153b51';ctx.beginPath();ctx.roundRect(0,-12,22,14,6);ctx.fill();ctx.fillStyle='#efffff';ctx.fillRect(10,-9,5,5);ctx.fillStyle='#fff2d2';ctx.fillRect(-14,13,15,8);ctx.fillRect(7,13,18,8);ctx.restore();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.6);ctx.fillStyle=p.color;ctx.fillRect(p.x-3,p.y-3,6,6);}ctx.globalAlpha=1;ctx.restore();
 // Route progress indicator.
 ctx.fillStyle='#ffffff1f';ctx.fillRect(0,716,view,4);ctx.fillStyle='#96ffda';ctx.fillRect(0,716,view*Math.min(1,player.x/END),4);
}
function frame(t){acc+=Math.min((t-last)/1000||0,.05);last=t;while(acc>=1/120){step(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}
const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',ShiftLeft:'boost',ShiftRight:'boost'};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(mapping[e.code]){if(e.target.tagName==='BUTTON'&&e.code==='Space')return;e.preventDefault();keys[mapping[e.code]]=true;}if(e.repeat)return;if(e.code==='KeyP')pause();if(e.code==='KeyR')start();});addEventListener('keyup',e=>{if(e.target.tagName==='INPUT')return;if(mapping[e.code]){keys[mapping[e.code]]=false;e.preventDefault();}});addEventListener('blur',()=>{if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys[b.dataset.key]=false);}
function advance(){stage++;reset(false);mode='playing';$('overlay').hidden=true;music.start(stage);notify(stages[stage].tip);canvas.focus();}
$('start').onclick=()=>mode==='paused'?pause():mode==='stageclear'?advance():start();$('restart').onclick=start;$('pause').onclick=pause;$('sound').onclick=()=>{sound=music.toggle();$('sound').textContent=sound?'Music on ♫':'Music muted ♫';$('sound').setAttribute('aria-pressed',String(sound));};
$('volume').oninput=e=>music.setVolume(Number(e.target.value));
addEventListener('resize',resize);reset();resize();requestAnimationFrame(frame);
// Deterministic browser verification is opt-in, never enabled on the normal game URL.
if(new URLSearchParams(location.search).has('test'))window.__game={state:()=>({version:VERSION,stage,stageTimes:[...stageTimes],deaths,beacons:beacons.map(b=>({...b})),gaps,barriers,END,music:{enabled:music.enabled,context:music.ctx?.state,notes:music.notes,rms:music.signal(),volume:music.volume},mode,player:{...player},score,checkpoint,elapsed,prisms:prisms.filter(c=>c.got).length,enemies:enemies.filter(e=>!e.alive).length}),place:(x,y,vx=0,vy=0)=>{Object.assign(player,{x,y,vx,vy,grounded:false,inv:0});},ground,prisms:()=>prisms,enemies:()=>enemies};
