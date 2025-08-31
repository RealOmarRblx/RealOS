const phone = document.getElementById('phone');
const timeStatus = document.getElementById('timeStatus');
const icons = document.querySelectorAll('.icon');
const appWindows = document.querySelectorAll('.app-window');
const blurOverlay = document.getElementById('blurOverlay');
const backButtons = document.querySelectorAll('.back');
const dockApps = document.querySelectorAll('.dock-app');
const powerBtn = document.getElementById('powerBtn');
const offOverlay = document.getElementById('offOverlay');

function tick(){timeStatus.textContent=new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});}
tick();
setInterval(tick,1000);

function closeAll(){appWindows.forEach(w=>{w.classList.remove('active');w.setAttribute('aria-hidden','true');});blurOverlay.classList.add('hidden');document.body.style.overflow='';}
backButtons.forEach(b=>b.addEventListener('click', closeAll));

function animateOpen(fromElem, appId){
  if(phone.classList.contains('powered-off')) return;
  const rect = fromElem.getBoundingClientRect();
  const pr = phone.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.style.position = 'absolute';
  ghost.style.left = (rect.left - pr.left) + 'px';
  ghost.style.top = (rect.top - pr.top) + 'px';
  const size = Math.max(48, Math.min(90, rect.width));
  ghost.style.width = size + 'px';
  ghost.style.height = size + 'px';
  ghost.style.borderRadius = '18px';
  ghost.style.background = 'rgba(255,255,255,.12)';
  ghost.style.zIndex = '999';
  ghost.style.backdropFilter = 'blur(6px)';
  phone.appendChild(ghost);
  blurOverlay.classList.remove('hidden');
  const end = { x:0, y:48, w:pr.width, h:pr.height-96 };
  const sx = end.w / size;
  const sy = end.h / size;
  const tx = end.x - (rect.left - pr.left);
  const ty = end.y - (rect.top - pr.top);
  const anim = ghost.animate([
    { transform: 'translate(0px,0px) scale(1)', borderRadius: '18px' },
    { transform: `translate(${tx}px,${ty}px) scale(${sx},${sy})`, borderRadius: '22px' }
  ], { duration:300, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
  anim.onfinish = () => {
    ghost.remove();
    appWindows.forEach(w=>{ w.classList.remove('active'); w.setAttribute('aria-hidden','true'); });
    const win = document.getElementById(appId);
    if(win){ win.classList.add('active'); win.setAttribute('aria-hidden','false'); }
    document.body.style.overflow = 'hidden';
  };
}

icons.forEach(icon => icon.addEventListener('click', ()=> animateOpen(icon, icon.dataset.app)));
dockApps.forEach(d => d.addEventListener('click', ()=> { const icon = document.querySelector(`.icon[data-app="${d.dataset.app}"]`); if(icon) animateOpen(icon, d.dataset.app); }));

const NOTES_KEY = 'realos_notes_v2';
const notesArea = document.getElementById('notesArea');
const saveNote = document.getElementById('saveNote');
const clearNotes = document.getElementById('clearNotes');
if(notesArea){
  notesArea.value = localStorage.getItem(NOTES_KEY) || '';
  saveNote.addEventListener('click', ()=> localStorage.setItem(NOTES_KEY, notesArea.value));
  clearNotes.addEventListener('click', ()=>{ notesArea.value=''; localStorage.removeItem(NOTES_KEY); });
}

const musicPlayer = document.getElementById('musicPlayer');
const albumArt = document.getElementById('albumArt');
const uploadMP3 = document.getElementById('uploadMP3');
musicPlayer.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
musicPlayer.addEventListener('play', ()=> albumArt.textContent = '🎵');
musicPlayer.addEventListener('pause', ()=> albumArt.textContent = '🎵');
uploadMP3.addEventListener('change', e=>{ const f = e.target.files[0]; if(!f) return; const url = URL.createObjectURL(f); musicPlayer.src = url; musicPlayer.play(); albumArt.textContent = '🎵'; });

let camStream = null;
const camVideo = document.getElementById('camVideo');
const camStart = document.getElementById('camStart');
const camStop = document.getElementById('camStop');
if(camStart) camStart.addEventListener('click', async ()=>{ try{ camStream = await navigator.mediaDevices.getUserMedia({ video:true }); camVideo.srcObject = camStream; }catch(e){} });
if(camStop) camStop.addEventListener('click', ()=>{ if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; camVideo.srcObject=null; }});

const MSG_KEY = 'realos_msgs_v2';
const msgsList = document.getElementById('msgsList');
const msgInput = document.getElementById('msgInput');
const sendMsg = document.getElementById('sendMsg');
function loadMsgs(){ const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); msgsList.innerHTML = ''; arr.forEach(m => { const el = document.createElement('div'); el.className = 'msg'; el.textContent = m; msgsList.appendChild(el); }); msgsList.scrollTop = msgsList.scrollHeight; }
loadMsgs();
sendMsg.addEventListener('click', ()=> { const v = msgInput.value.trim(); if(!v) return; const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); arr.push(v); localStorage.setItem(MSG_KEY, JSON.stringify(arr)); msgInput.value = ''; loadMsgs(); });
msgInput.addEventListener('keypress', e=>{ if(e.key === 'Enter'){ sendMsg.click(); e.preventDefault(); }});

const dialNumber = document.getElementById('dialNumber');
const callKeys = document.querySelectorAll('#call .key');
const callBtn = document.getElementById('callBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatus = document.getElementById('callStatus');
callKeys.forEach(k => k.addEventListener('click', ()=> { dialNumber.textContent += k.textContent; }));
callBtn.addEventListener('click', ()=> { callStatus.textContent = 'No SIM card available'; setTimeout(()=>{ callStatus.textContent=''; }, 2000); dialNumber.textContent = ''; });
endCallBtn.addEventListener('click', ()=> { callStatus.textContent=''; dialNumber.textContent=''; });

const calendarWidget = document.getElementById('calendarWidget');
const addEventBtn = document.getElementById('addEvent');
const eventDate = document.getElementById('eventDate');
const eventText = document.getElementById('eventText');
const eventsList = document.getElementById('eventsList');
const EVENTS_KEY = 'realos_events_v2';
function renderStoredEvents(){ eventsList.innerHTML = ''; const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}'); const keys = Object.keys(events).sort(); keys.forEach(date => { events[date].forEach(text => { const li = document.createElement('li'); li.textContent = `${date}: ${text}`; eventsList.appendChild(li); }); }); }
function buildCalendar(){ calendarWidget.innerHTML = ''; const now = new Date(); const year = now.getFullYear(); const month = now.getMonth(); const firstDay = new Date(year, month, 1).getDay(); const days = new Date(year, month+1, 0).getDate(); const monthDays = []; for(let i=0;i<firstDay;i++) monthDays.push(''); for(let d=1; d<=days; d++) monthDays.push(d); monthDays.forEach(d => { const el = document.createElement('div'); if(d === '') el.textContent = ''; else { el.textContent = d; el.classList.add('day'); el.addEventListener('click', ()=>{ const y = year; const m = month + 1; const key = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; eventDate.value = key; document.querySelectorAll('.calendar-widget .selected').forEach(s=>s.classList.remove('selected')); el.classList.add('selected'); }); const today = new Date(); if(d === today.getDate() && month === today.getMonth()) el.classList.add('today'); } calendarWidget.appendChild(el); }); }
buildCalendar();
renderStoredEvents();
addEventBtn.addEventListener('click', ()=> { const date = eventDate.value; const text = eventText.value.trim(); if(!date || !text) return; const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}'); if(!events[date]) events[date] = []; events[date].push(text); localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); eventText.value = ''; renderStoredEvents(); });

const miniView = document.getElementById('miniView');
const goUrl = document.getElementById('goUrl');
const miniUrl = document.getElementById('miniUrl');
goUrl.addEventListener('click', ()=> { let u = miniUrl.value.trim(); if(!u) return; if(!/^https?:\/\//i.test(u)) u = 'https://' + u; miniView.src = u; });

const calcInput = document.getElementById('calcInput');
const calcBtns = document.querySelectorAll('.calc-btn');
let calcExpr = '';
calcBtns.forEach(b => { b.addEventListener('click', ()=> { const v = b.textContent; if(v === 'C'){ calcExpr = ''; calcInput.value = ''; return; } if(v === '='){ try{ calcExpr = eval(calcExpr.replace(/×/g,'*').replace(/÷/g,'/')).toString(); calcInput.value = calcExpr; } catch(e){ calcInput.value = 'Error'; calcExpr = ''; } return; } calcExpr += v; calcInput.value = calcExpr; }); });

const brightness = document.getElementById('brightness');
const wallpaperFile = document.getElementById('wallpaperFile');
if(brightness) brightness.addEventListener('input', e => { phone.style.filter = `brightness(${e.target.value/100})`; });
if(wallpaperFile) wallpaperFile.addEventListener('change', e => { const f = e.target.files[0]; if(!f) return; phone.style.backgroundImage = `url(${URL.createObjectURL(f)})`; });

powerBtn.addEventListener('click', ()=>{
  const off = phone.classList.toggle('powered-off');
  offOverlay.classList.toggle('hidden', !off);
  powerBtn.setAttribute('aria-pressed', String(!off));
  if(off){
    closeAll();
    document.body.style.overflow = '';
  } else {
    document.body.style.overflow = 'hidden';
  }
});

document.addEventListener('keydown', e => { if(e.key === 'Escape') closeAll(); });
