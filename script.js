const phone = document.getElementById('phone');
const timeStatus = document.getElementById('timeStatus');
const icons = document.querySelectorAll('.icon');
const appLayer = document.getElementById('appLayer');
const appWindows = document.querySelectorAll('.app-window');
const blurOverlay = document.getElementById('blurOverlay');
const backButtons = document.querySelectorAll('.back');
const dockApps = document.querySelectorAll('.dock-app');

function tick(){
  const d = new Date();
  timeStatus.textContent = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}
tick(); setInterval(tick,1000);

function closeAll(){
  appWindows.forEach(w=>{ w.classList.remove('active'); w.setAttribute('aria-hidden','true'); });
  blurOverlay.classList.add('hidden');
}
backButtons.forEach(b=>b.addEventListener('click', ()=>closeAll()));

function animateOpen(fromElem, appId){
  const rect = fromElem.getBoundingClientRect();
  const pr = phone.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.style.position='absolute'; ghost.style.left=(rect.left-pr.left)+'px'; ghost.style.top=(rect.top-pr.top)+'px';
  const size = 68;
  ghost.style.width = size + 'px'; ghost.style.height = size + 'px';
  ghost.style.borderRadius = '18px'; ghost.style.background = 'rgba(255,255,255,.12)'; ghost.style.backdropFilter = 'blur(6px)'; ghost.style.zIndex='120';
  phone.appendChild(ghost);
  blurOverlay.classList.remove('hidden');
  const end = {x:0,y:48,w:pr.width,h:pr.height-96};
  const sx = end.w/size, sy = end.h/size;
  const tx = end.x - (rect.left-pr.left), ty = end.y - (rect.top-pr.top);
  ghost.animate([{transform:'translate(0px,0px) scale(1)'},{transform:`translate(${tx}px,${ty}px) scale(${sx},${sy})`}],{duration:260,fill:'forwards'}).onfinish=()=>{phone.removeChild(ghost); document.getElementById(appId).classList.add('active');};
}

icons.forEach(icon=>{
  icon.addEventListener('click',()=>animateOpen(icon,icon.dataset.app));
});
dockApps.forEach(icon=>{
  icon.addEventListener('click',()=>animateOpen(icon,icon.dataset.app));
});

const dialNumber = document.getElementById('dialNumber');
const keys = document.querySelectorAll('#call .key');
const callBtn = document.getElementById('callBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatus = document.getElementById('callStatus');
keys.forEach(k=>k.addEventListener('click',()=>dialNumber.textContent+=k.textContent));
callBtn.addEventListener('click',()=>callStatus.textContent='No SIM card available');
endCallBtn.addEventListener('click',()=>callStatus.textContent='');

const wallpaperFile = document.getElementById('wallpaperFile');
wallpaperFile.addEventListener('change',e=>{ const file = e.target.files[0]; if(file){ const url = URL.createObjectURL(file); phone.style.setProperty('--wallpaper',`url(${url})`); } });

const brightness = document.getElementById('brightness');
brightness.addEventListener('input',e=>phone.style.filter=`brightness(${e.target.value/100})`);

const iconRadius = document.getElementById('iconRadius');
iconRadius.addEventListener('input',e=>document.documentElement.style.setProperty('--icon-radius',e.target.value+'px'));

const notesArea = document.getElementById('notesArea');
document.getElementById('saveNote').addEventListener('click',()=>{ localStorage.setItem('notes',notesArea.value); });
document.getElementById('clearNotes').addEventListener('click',()=>{ notesArea.value=''; localStorage.removeItem('notes'); });
notesArea.value = localStorage.getItem('notes')||'';

const musicPlayer = document.getElementById('musicPlayer');
const albumArt = document.getElementById('albumArt');
const uploadMP3 = document.getElementById('uploadMP3');
musicPlayer.src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
musicPlayer.addEventListener('play',()=>albumArt.textContent='🎵');
musicPlayer.addEventListener('pause',()=>albumArt.textContent='🎵');
uploadMP3.addEventListener('change',e=>{ const file=e.target.files[0]; if(file){ const url = URL.createObjectURL(file); musicPlayer.src=url; albumArt.textContent='🎵'; }});

const camVideo = document.getElementById('camVideo');
document.getElementById('camStart').addEventListener('click',()=>navigator.mediaDevices.getUserMedia({video:true}).then(s=>camVideo.srcObject=s));
document.getElementById('camStop').addEventListener('click',()=>{ if(camVideo.srcObject){ camVideo.srcObject.getTracks().forEach(t=>t.stop()); camVideo.srcObject=null; } });

const calcInput = document.getElementById('calcInput');
const calcBtns = document.querySelectorAll('.calc-btn');
calcBtns.forEach(b=>{
  b.addEventListener('click',()=>{
    if(b.textContent==='C'){calcInput.value='';}
    else if(b.textContent==='='){ try{ calcInput.value=eval(calcInput.value.replace(/×/g,'*').replace(/÷/g,'/')); }catch(e){calcInput.value='Error';} }
    else{ calcInput.value+=b.textContent; }
  });
});

const msgInput = document.getElementById('msgInput');
msgInput.removeAttribute('readonly');
const msgKeys = document.querySelectorAll('.msg-key');
msgKeys.forEach(k=>k.addEventListener('click',()=>msgInput.value+=k.textContent));
document.getElementById('sendMsg').addEventListener('click',()=>{
  if(msgInput.value.trim()!==''){ const m = document.createElement('div'); m.className='msg'; m.textContent=msgInput.value; document.getElementById('msgsList').appendChild(m); msgInput.value=''; }
});

const calendarWidget = document.getElementById('calendarWidget');
const eventsList = document.getElementById('eventsList');
document.getElementById('addEvent').addEventListener('click',()=>{
  const date = document.getElementById('eventDate').value;
  const text = document.getElementById('eventText').value;
  if(date && text){ const li = document.createElement('li'); li.textContent=`${date}: ${text}`; eventsList.appendChild(li); document.getElementById('eventText').value=''; }
});
