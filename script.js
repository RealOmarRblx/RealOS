const phone = document.getElementById('phone');
const timeStatus = document.getElementById('timeStatus');
const lockScreen = document.getElementById('lockScreen');
const lockTime = document.getElementById('lockTime');
const fpCircle = document.getElementById('fpCircle');
const unlockZone = document.getElementById('unlockZone');
const icons = document.querySelectorAll('.icon');
const appWindows = document.querySelectorAll('.app-window');
const blurOverlay = document.getElementById('blurOverlay');
const backButtons = document.querySelectorAll('.back');
const powerBtn = document.getElementById('powerBtn');
const modal = document.getElementById('modal');
const modalMsg = document.getElementById('modalMsg');
const modalOk = document.getElementById('modalOk');
const enrollModal = document.getElementById('enrollModal');
const enrollCircle = document.getElementById('enrollCircle');

function updateTimes(){ const now = new Date(); const t = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); if(timeStatus) timeStatus.textContent = t; if(lockTime) lockTime.textContent = t; }
updateTimes();
setInterval(updateTimes,1000);

function closeAllInstant(){ appWindows.forEach(w=>{ w.classList.remove('active'); w.setAttribute('aria-hidden','true'); }); if(blurOverlay) blurOverlay.classList.add('hidden'); document.body.style.overflow=''; }

function canOpenApps(){ if(!phone) return false; if(phone.classList.contains('powered-off')) return false; if(lockScreen && lockScreen.dataset && lockScreen.dataset.locked === '1') return false; return true; }

function animateOpen(fromElem, appId){
  if(!canOpenApps()) return;
  const rect = fromElem.getBoundingClientRect();
  const pr = phone.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.style.left = (rect.left - pr.left) + 'px';
  ghost.style.top = (rect.top - pr.top) + 'px';
  ghost.style.width = rect.width + 'px';
  ghost.style.height = rect.height + 'px';
  const fromIcon = fromElem.querySelector('.material-icons');
  const br = fromIcon ? window.getComputedStyle(fromIcon).borderRadius : '18px';
  ghost.style.borderRadius = br;
  const bg = fromIcon ? (window.getComputedStyle(fromIcon).backgroundImage || window.getComputedStyle(fromIcon).backgroundColor) : 'rgba(255,255,255,.12)';
  ghost.style.background = bg;
  phone.appendChild(ghost);
  if(blurOverlay) blurOverlay.classList.remove('hidden');
  const scaleX = pr.width / rect.width;
  const scaleY = pr.height / rect.height;
  const tx = - (rect.left - pr.left);
  const ty = - (rect.top - pr.top);
  const anim = ghost.animate([
    { transform: 'translate(0px,0px) scale(1)', borderRadius: br },
    { transform: `translate(${tx}px,${ty}px) scale(${scaleX},${scaleY})`, borderRadius: '0px' }
  ], { duration:350, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
  anim.onfinish = ()=>{
    ghost.remove();
    appWindows.forEach(w=>{ w.classList.remove('active'); w.setAttribute('aria-hidden','true'); });
    const win = document.getElementById(appId);
    if(win){ win.classList.add('active'); win.setAttribute('aria-hidden','false'); }
    document.body.style.overflow='hidden';
  };
}

function animateClose(toElem, appWindow){
  if(!appWindow) return;
  const pr = phone.getBoundingClientRect();
  const rect = toElem ? toElem.getBoundingClientRect() : null;
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.style.left = '0px';
  ghost.style.top = '0px';
  ghost.style.width = pr.width + 'px';
  ghost.style.height = pr.height + 'px';
  ghost.style.borderRadius = '0px';
  ghost.style.background = 'rgba(255,255,255,.12)';
  phone.appendChild(ghost);
  appWindow.classList.remove('active');
  appWindow.setAttribute('aria-hidden','true');
  if(rect){
    const toIcon = toElem.querySelector('.material-icons');
    const br = toIcon ? window.getComputedStyle(toIcon).borderRadius : '18px';
    const scaleX = rect.width / pr.width;
    const scaleY = rect.height / pr.height;
    const tx = rect.left - pr.left;
    const ty = rect.top - pr.top;
    const bg = toIcon ? (window.getComputedStyle(toIcon).backgroundImage || window.getComputedStyle(toIcon).backgroundColor) : 'rgba(255,255,255,.12)';
    ghost.style.background = bg;
    const anim = ghost.animate([
      { transform: 'translate(0px,0px) scale(1)', borderRadius: '0px' },
      { transform: `translate(${tx}px,${ty}px) scale(${scaleX},${scaleY})`, borderRadius: br }
    ], { duration:320, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
    anim.onfinish = ()=>{
      ghost.remove();
      if(blurOverlay) blurOverlay.classList.add('hidden');
      document.body.style.overflow='';
    };
  } else {
    const anim = ghost.animate([{ opacity:1 },{ opacity:0 }], { duration:200, fill:'forwards' });
    anim.onfinish = ()=>{ ghost.remove(); if(blurOverlay) blurOverlay.classList.add('hidden'); document.body.style.overflow=''; };
  }
}

icons.forEach(icon=> icon.addEventListener('click', (e)=> animateOpen(icon, icon.dataset.app) ));

backButtons.forEach(b=>{
  b.addEventListener('click', e=>{
    const appWindow = e.target.closest('.app-window');
    if(!appWindow){ closeAllInstant(); return; }
    const id = appWindow.id;
    const icon = document.querySelector(`.icon[data-app="${id}"]`);
    if(icon) animateClose(icon, appWindow);
    else { appWindow.classList.remove('active'); if(blurOverlay) blurOverlay.classList.add('hidden'); document.body.style.overflow=''; }
  });
});

const settingsList = document.getElementById('settingsList');
const settingsPages = document.getElementById('settingsPages');
const settingsPagesEls = document.querySelectorAll('.s-page');
const sBacks = document.querySelectorAll('.s-back');

if(settingsList){
  settingsList.addEventListener('click', e=>{
    const row = e.target.closest('.settings-row');
    if(!row) return;
    const page = row.dataset.page;
    settingsList.classList.add('hidden');
    if(settingsPages) settingsPages.classList.remove('hidden');
    settingsPagesEls.forEach(p=>p.classList.add('hidden'));
    const target = document.getElementById(page);
    if(target) target.classList.remove('hidden');
  });
}
sBacks.forEach(b=> b.addEventListener('click', ()=> {
  settingsPagesEls.forEach(p=>p.classList.add('hidden'));
  if(settingsPages) settingsPages.classList.add('hidden');
  if(settingsList) settingsList.classList.remove('hidden');
}));

function showModal(msg){ if(modalMsg) modalMsg.textContent = msg; if(modal) modal.classList.remove('hidden'); }
if(modalOk) modalOk.addEventListener('click', ()=> modal.classList.add('hidden'));

const NOTES_KEY = 'realos_notes_v3';
const notesArea = document.getElementById('notesArea');
const saveNote = document.getElementById('saveNote');
const clearNotes = document.getElementById('clearNotes');
if(notesArea){
  notesArea.value = localStorage.getItem(NOTES_KEY) || '';
  if(saveNote) saveNote.addEventListener('click', ()=> localStorage.setItem(NOTES_KEY, notesArea.value));
  if(clearNotes) clearNotes.addEventListener('click', ()=>{ notesArea.value=''; localStorage.removeItem(NOTES_KEY); });
}

const musicPlayer = document.getElementById('musicPlayer');
const albumArt = document.getElementById('albumArt');
const uploadMP3 = document.getElementById('uploadMP3');
if(musicPlayer) musicPlayer.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
if(musicPlayer) musicPlayer.addEventListener('play', ()=> { if(albumArt) albumArt.textContent = '🎵'; });
if(musicPlayer) musicPlayer.addEventListener('pause', ()=> { if(albumArt) albumArt.textContent = '🎵'; });
if(uploadMP3) uploadMP3.addEventListener('change', e=>{ const f = e.target.files[0]; if(!f) return; const url = URL.createObjectURL(f); if(musicPlayer){ musicPlayer.src = url; musicPlayer.play(); } if(albumArt) albumArt.textContent = '🎵'; });

let camStream = null;
const camVideo = document.getElementById('camVideo');
const camStart = document.getElementById('camStart');
const camStop = document.getElementById('camStop');
if(camStart) camStart.addEventListener('click', async ()=>{ try{ camStream = await navigator.mediaDevices.getUserMedia({ video:true }); if(camVideo) camVideo.srcObject = camStream; }catch(e){} });
if(camStop) camStop.addEventListener('click', ()=>{ if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; if(camVideo) camVideo.srcObject=null; }});

const MSG_KEY = 'realos_msgs_v3';
const msgsList = document.getElementById('msgsList');
const msgInput = document.getElementById('msgInput');
const sendMsg = document.getElementById('sendMsg');
function loadMsgs(){ const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); if(msgsList){ msgsList.innerHTML=''; arr.forEach(m=>{ const el=document.createElement('div'); el.className='msg'; el.textContent=m; msgsList.appendChild(el); }); msgsList.scrollTop = msgsList.scrollHeight; } }
loadMsgs();
if(sendMsg) sendMsg.addEventListener('click', ()=>{ if(!msgInput) return; const v = msgInput.value.trim(); if(!v) return; const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); arr.push(v); localStorage.setItem(MSG_KEY, JSON.stringify(arr)); msgInput.value=''; loadMsgs(); });
if(msgInput) msgInput.addEventListener('keypress', e=>{ if(e.key==='Enter'){ if(sendMsg) sendMsg.click(); e.preventDefault(); }});

const dialNumber = document.getElementById('dialNumber');
const callKeys = document.querySelectorAll('#call .key');
const callBtn = document.getElementById('callBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatus = document.getElementById('callStatus');
callKeys.forEach(k=>k.addEventListener('click', ()=> { if(dialNumber) dialNumber.textContent += k.textContent; }));
if(callBtn) callBtn.addEventListener('click', ()=> { if(callStatus) callStatus.textContent = 'No SIM card available'; setTimeout(()=>{ if(callStatus) callStatus.textContent=''; },2000); if(dialNumber) dialNumber.textContent=''; });
if(endCallBtn) endCallBtn.addEventListener('click', ()=>{ if(callStatus) callStatus.textContent=''; if(dialNumber) dialNumber.textContent=''; });

const calendarWidget = document.getElementById('calendarWidget');
const addEventBtn = document.getElementById('addEvent');
const eventDate = document.getElementById('eventDate');
const eventText = document.getElementById('eventText');
const eventsList = document.getElementById('eventsList');
const EVENTS_KEY = 'realos_events_v3';
function renderStoredEvents(){ if(!eventsList) return; eventsList.innerHTML=''; const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}'); const keys = Object.keys(events).sort(); keys.forEach(date=>{ events[date].forEach(text=>{ const li = document.createElement('li'); li.textContent = `${date}: ${text}`; eventsList.appendChild(li); }); }); }
function buildCalendar(){ if(!calendarWidget) return; calendarWidget.innerHTML=''; const now=new Date(); const year=now.getFullYear(); const month=now.getMonth(); const firstDay=new Date(year,month,1).getDay(); const days=new Date(year,month+1,0).getDate(); const monthDays=[]; for(let i=0;i<firstDay;i++) monthDays.push(''); for(let d=1; d<=days; d++) monthDays.push(d); monthDays.forEach(d=>{ const el=document.createElement('div'); if(d==='') el.textContent=''; else { el.textContent=d; el.classList.add('day'); el.addEventListener('click', ()=>{ const y=year; const m=month+1; const key=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; if(eventDate) eventDate.value=key; document.querySelectorAll('.calendar-widget .selected').forEach(s=>s.classList.remove('selected')); el.classList.add('selected'); }); const today=new Date(); if(d===today.getDate() && month===today.getMonth()) el.classList.add('today'); } calendarWidget.appendChild(el); }); }
if(calendarWidget) buildCalendar();
renderStoredEvents();
if(addEventBtn) addEventBtn.addEventListener('click', ()=>{ const date=eventDate ? eventDate.value : ''; const text=eventText ? eventText.value.trim() : ''; if(!date || !text) return; const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}'); if(!events[date]) events[date]=[]; events[date].push(text); localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); if(eventText) eventText.value = ''; renderStoredEvents(); });

const miniView = document.getElementById('miniView');
const goUrl = document.getElementById('goUrl');
const miniUrl = document.getElementById('miniUrl');
if(goUrl) goUrl.addEventListener('click', ()=>{ let u = miniUrl.value.trim(); if(!u) return; if(!/^https?:\/\//i.test(u)) u='https://'+u; if(miniView) miniView.src = u; });

const calcInput = document.getElementById('calcInput');
const calcBtns = document.querySelectorAll('.calc-btn');
let calcExpr = '';
calcBtns.forEach(b=>{ b.addEventListener('click', ()=>{ const v=b.textContent; if(v==='C'){ calcExpr=''; if(calcInput) calcInput.value=''; return; } if(v==='='){ try{ calcExpr = eval(calcExpr.replace(/×/g,'*').replace(/÷/g,'/')).toString(); if(calcInput) calcInput.value = calcExpr; } catch(e){ if(calcInput) calcInput.value = 'Error'; calcExpr = ''; } return; } calcExpr += v; if(calcInput) calcInput.value = calcExpr; }); });

const brightness = document.getElementById('brightness');
const s_wallpaperFile = document.getElementById('s_wallpaperFile');
const wallpaperFile = document.getElementById('wallpaperFile');
if(brightness) brightness.addEventListener('input', e => { phone.style.filter = `brightness(${e.target.value/100})`; });
if(s_wallpaperFile) s_wallpaperFile.addEventListener('change', e => { const f = e.target.files[0]; if(!f) return; phone.style.backgroundImage = `url(${URL.createObjectURL(f)})`; });
if(wallpaperFile) wallpaperFile.addEventListener('change', e => { const f = e.target.files[0]; if(!f) return; phone.style.backgroundImage = `url(${URL.createObjectURL(f)})`; });

function showLock(){ if(lockScreen){ lockScreen.classList.remove('hidden'); lockScreen.dataset.locked = '1'; const enrolled = localStorage.getItem('realos_fp') === '1'; if(enrolled){ if(fpCircle) fpCircle.classList.remove('hidden'); } else { if(fpCircle) fpCircle.classList.add('hidden'); } } }
function hideLock(){ if(lockScreen){ lockScreen.classList.add('hidden'); lockScreen.dataset.locked = '0'; if(fpCircle) fpCircle.classList.add('hidden'); } }

showLock();

let startY = null;
let tracking = false;
function zonePointerStart(e){
  tracking = true;
  startY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY || 0);
  e.preventDefault();
}
function zonePointerEnd(e){
  if(!tracking) return;
  const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : (e.clientY || 0);
  const delta = startY - endY;
  tracking = false;
  startY = null;
  if(delta > 80) hideLock();
}
if(unlockZone){
  unlockZone.addEventListener('touchstart', zonePointerStart);
  unlockZone.addEventListener('touchend', zonePointerEnd);
  unlockZone.addEventListener('mousedown', zonePointerStart);
  unlockZone.addEventListener('mouseup', zonePointerEnd);
}

let pressTimer = null;
function pressToUnlockStart(e){
  if(phone.classList.contains('powered-off')) return;
  pressTimer = setTimeout(()=>{ hideLock(); pressTimer = null; }, 250);
  e.preventDefault();
}
function pressToUnlockEnd(e){
  if(pressTimer){ clearTimeout(pressTimer); pressTimer = null; }
}
if(unlockZone){
  unlockZone.addEventListener('pointerdown', pressToUnlockStart);
  unlockZone.addEventListener('pointerup', pressToUnlockEnd);
  unlockZone.addEventListener('pointercancel', pressToUnlockEnd);
  unlockZone.addEventListener('mouseleave', pressToUnlockEnd);
}

let fpHoldTimer = null;
let fpHoldStart = 0;
function fpHoldStartHandler(e){
  e.preventDefault();
  fpHoldStart = Date.now();
  if(fpCircle) fpCircle.classList.add('active');
  fpHoldTimer = setTimeout(()=>{ hideLock(); if(fpCircle) fpCircle.classList.remove('active'); fpHoldTimer = null; }, 700);
}
function fpHoldEndHandler(e){
  if(fpHoldTimer) clearTimeout(fpHoldTimer);
  const held = Date.now() - fpHoldStart;
  if(fpCircle) fpCircle.classList.remove('active');
  if(held < 700){
    if(lockScreen) lockScreen.classList.add('shake');
    setTimeout(()=>{ if(lockScreen) lockScreen.classList.remove('shake'); }, 360);
    showModal('fingerprint failed, please keep your finger in for a little longer');
  }
  fpHoldTimer = null;
}
if(fpCircle){
  fpCircle.addEventListener('touchstart', fpHoldStartHandler);
  fpCircle.addEventListener('mousedown', fpHoldStartHandler);
  fpCircle.addEventListener('touchend', fpHoldEndHandler);
  fpCircle.addEventListener('mouseup', fpHoldEndHandler);
  fpCircle.addEventListener('mouseleave', fpHoldEndHandler);
}

powerBtn.addEventListener('click', ()=>{
  const nowOff = phone.classList.contains('powered-off');
  if(nowOff){
    phone.classList.remove('powered-off');
    showLock();
    document.body.style.overflow='hidden';
  } else {
    phone.classList.add('powered-off');
    hideLock();
    closeAllInstant();
    if(modal) modal.classList.add('hidden');
    if(enrollModal) enrollModal.classList.add('hidden');
    document.body.style.overflow='';
  }
});

const setupFingerprint = document.getElementById('setupFingerprint');
if(setupFingerprint){
  setupFingerprint.addEventListener('click', ()=> enrollModal.classList.remove('hidden'));
}
let enrollTimer = null;
let enrollStart = 0;
function enrollStartHandler(e){
  e.preventDefault();
  if(!enrollCircle) return;
  enrollCircle.classList.add('active');
  enrollStart = Date.now();
  enrollTimer = setTimeout(()=>{ localStorage.setItem('realos_fp','1'); enrollCircle.classList.remove('active'); if(enrollModal) enrollModal.classList.add('hidden'); showModal('Fingerprint enrolled'); enrollTimer = null; }, 700);
}
function enrollEndHandler(e){
  if(enrollTimer) clearTimeout(enrollTimer);
  if(enrollCircle) enrollCircle.classList.remove('active');
  const held = Date.now() - enrollStart;
  if(held < 700) showModal('enrollment failed, hold longer');
  enrollTimer = null;
}
if(enrollCircle){
  enrollCircle.addEventListener('touchstart', enrollStartHandler);
  enrollCircle.addEventListener('mousedown', enrollStartHandler);
  enrollCircle.addEventListener('touchend', enrollEndHandler);
  enrollCircle.addEventListener('mouseup', enrollEndHandler);
  enrollCircle.addEventListener('mouseleave', enrollEndHandler);
}
const enrollCancel = document.getElementById('enrollCancel');
if(enrollCancel) enrollCancel.addEventListener('click', ()=> enrollModal.classList.add('hidden'));

document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    const active = document.querySelector('.app-window.active');
    if(active){
      const id = active.id;
      const icon = document.querySelector(`.icon[data-app="${id}"]`);
      if(icon) animateClose(icon, active);
    }
  }
});
