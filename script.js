const FP_HOLD_MS = 300;
const ENROLL_HOLD_MS = 300;
let animSpeed = Number(localStorage.getItem('realos_anim_speed') || '1');
const phone = document.getElementById('phone');
const home = document.getElementById('home');
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
const controlCenter = document.getElementById('controlCenter');
const statusBar = document.getElementById('statusBar');
const inAppNav = document.getElementById('inAppNav');
function updateTimes(){ const now = new Date(); const t = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); if(timeStatus) timeStatus.textContent = t; if(lockTime) lockTime.textContent = t; }
updateTimes();
setInterval(updateTimes,1000);
function getFactor(){ return 1 / (animSpeed || 1); }
function closeAllInstant(){ appWindows.forEach(w=>{ w.classList.remove('active'); w.setAttribute('aria-hidden','true'); w.style.transform = ''; }); if(blurOverlay) blurOverlay.classList.add('hidden'); if(controlCenter){ controlCenter.classList.add('hidden'); controlCenter.classList.remove('visible'); controlCenter.setAttribute('aria-hidden','true'); } document.body.style.overflow=''; if(home){ home.style.transform = ''; home.style.transition = ''; } if(inAppNav) inAppNav.classList.remove('hidden'); }
function canOpenApps(){ if(!phone) return false; if(phone.classList.contains('powered-off')) return false; if(lockScreen && lockScreen.dataset && lockScreen.dataset.locked === '1') return false; return true; }
function finishUnlockAnimation(){ if(!lockScreen) return; lockScreen.classList.remove('unlocking'); lockScreen.classList.add('hidden'); lockScreen.dataset.locked = '0'; if(fpCircle) fpCircle.classList.add('hidden'); if(blurOverlay) blurOverlay.classList.add('hidden'); document.body.style.overflow=''; lockScreen.removeEventListener('animationend', finishUnlockAnimation); if(inAppNav) inAppNav.classList.remove('hidden'); }
function triggerUnlockAnimated(){ if(!lockScreen) return; if(lockScreen.classList.contains('unlocking')) return; lockScreen.classList.remove('hidden'); lockScreen.dataset.locked = '1'; lockScreen.classList.add('unlocking'); lockScreen.addEventListener('animationend', finishUnlockAnimation); }
function triggerShake(){ if(!lockScreen) return; lockScreen.classList.remove('shake'); void lockScreen.offsetWidth; lockScreen.classList.add('shake'); setTimeout(()=>{ lockScreen.classList.remove('shake'); }, 420); }
function animateOpen(fromElem, appId){
  if(!canOpenApps()) return;
  const pr = phone.getBoundingClientRect();
  const rect = fromElem.getBoundingClientRect();
  const scaleX = rect.width / pr.width;
  const scaleY = rect.height / pr.height;
  const tx = rect.left - pr.left;
  const ty = rect.top - pr.top;
  const win = document.getElementById(appId);
  if(!win) return;
  if(blurOverlay) blurOverlay.classList.remove('hidden');
  if(home){ home.style.transition = `transform ${320*getFactor()}ms cubic-bezier(.2,.7,.2,1)`; home.style.transform = 'scale(0.95) translateY(6px)'; }
  win.style.transition = 'none';
  win.style.transformOrigin = 'top left';
  win.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
  win.classList.add('active');
  win.setAttribute('aria-hidden','false');
  if(inAppNav) inAppNav.classList.remove('hidden');
  requestAnimationFrame(()=>{
    const tTrans = 350 * getFactor();
    const tOp = 220 * getFactor();
    win.style.transition = `transform ${tTrans}ms cubic-bezier(.2,.7,.2,1), opacity ${tOp}ms`;
    win.style.transform = 'translate(0px, 0px) scale(1,1)';
    const onEnd = (ev)=>{
      win.style.transition = '';
      win.style.transform = '';
      win.removeEventListener('transitionend', onEnd);
      document.body.style.overflow = 'hidden';
    };
    win.addEventListener('transitionend', onEnd);
  });
}
function animateClose(toElem, appWindow){
  if(!appWindow) return;
  const pr = phone.getBoundingClientRect();
  const rect = toElem ? toElem.getBoundingClientRect() : null;
  if(home){ home.style.transition = `transform ${320*getFactor()}ms cubic-bezier(.2,.7,.2,1)`; home.style.transform = ''; }
  if(rect){
    const scaleX = rect.width / pr.width;
    const scaleY = rect.height / pr.height;
    const tx = rect.left - pr.left;
    const ty = rect.top - pr.top;
    const tTrans = 320 * getFactor();
    const tOp = 200 * getFactor();
    appWindow.style.transition = `transform ${tTrans}ms cubic-bezier(.2,.7,.2,1), opacity ${tOp}ms`;
    appWindow.style.transformOrigin = 'top left';
    appWindow.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
    appWindow.addEventListener('transitionend', function onEnd(){
      appWindow.classList.remove('active');
      appWindow.setAttribute('aria-hidden','true');
      appWindow.style.transition = '';
      appWindow.style.transform = '';
      if(blurOverlay) blurOverlay.classList.add('hidden');
      document.body.style.overflow = '';
      appWindow.removeEventListener('transitionend', onEnd);
    });
  } else {
    appWindow.classList.remove('active');
    appWindow.setAttribute('aria-hidden','true');
    if(blurOverlay) blurOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if(inAppNav && lockScreen && lockScreen.dataset && lockScreen.dataset.locked === '1') inAppNav.classList.add('hidden');
}
icons.forEach(icon=> icon.addEventListener('click', (e)=> animateOpen(icon, icon.dataset.app) ));
backButtons.forEach(b=>{
  b.addEventListener('click', e=>{
    const appWindow = e.target.closest('.app-window');
    if(!appWindow){ closeAllInstant(); return; }
    const id = appWindow.id;
    const icon = document.querySelector(`.icon[data-app="${id}"]`);
    if(icon) animateClose(icon, appWindow);
    else { appWindow.classList.remove('active'); if(blurOverlay) blurOverlay.classList.add('hidden'); document.body.style.overflow=''; if(home){ home.style.transform = ''; home.style.transition = ''; } }
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
const NOTES_KEY = 'realos_notes_v4';
const notesArea = document.getElementById('notesArea');
const saveNote = document.getElementById('saveNote');
const clearNotes = document.getElementById('clearNotes');
const notesListEl = document.getElementById('notesList');
const newNoteBtn = document.getElementById('newNote');
const noteEditor = document.getElementById('noteEditor');
const noteTitle = document.getElementById('noteTitle');
const noteChecklistToggle = document.getElementById('noteChecklistToggle');
function loadNotes(){ const items = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); if(!notesListEl) return; notesListEl.innerHTML = ''; items.forEach((n,i)=>{ const li = document.createElement('li'); li.className = 'note-card'; if(n.type === 'checklist'){ const container = document.createElement('div'); container.className = 'note-checklist'; const head = document.createElement('div'); head.className = 'note-head'; head.innerHTML = `<div class="note-title">${n.title||'Untitled'}</div><div class="note-date">${n.date}</div>`; container.appendChild(head); const ul = document.createElement('ul'); ul.style.paddingLeft='18px'; n.items.forEach((it,idx)=>{ const lii = document.createElement('li'); const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!it.checked; cb.addEventListener('change', ()=>{ const arr = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); arr[i].items[idx].checked = cb.checked; localStorage.setItem(NOTES_KEY, JSON.stringify(arr)); }); lii.appendChild(cb); const span = document.createElement('span'); span.style.marginLeft='8px'; span.textContent = it.text; lii.appendChild(span); ul.appendChild(lii); }); container.appendChild(ul); container.addEventListener('click', ()=>{ if(noteEditor) noteEditor.classList.remove('hidden'); if(noteTitle) noteTitle.value = n.title||''; if(notesArea) notesArea.value = n.items.map(it=>it.text).join('\n'); if(noteChecklistToggle) noteChecklistToggle.checked = true; if(noteEditor) noteEditor.dataset.index = i; }); li.appendChild(container); } else { li.innerHTML = `<div class="note-head"><div class="note-title">${n.title||'Untitled'}</div><div class="note-date">${n.date}</div></div><div class="note-body">${n.text.substring(0,140)}</div>`; li.addEventListener('click', ()=>{ if(noteEditor) noteEditor.classList.remove('hidden'); if(notesArea) notesArea.value = n.text; if(noteTitle) noteTitle.value = n.title||''; if(noteChecklistToggle) noteChecklistToggle.checked = false; if(noteEditor) noteEditor.dataset.index = i; }); }
    notesListEl.appendChild(li); }); }
loadNotes();
if(newNoteBtn) newNoteBtn.addEventListener('click', ()=>{ if(noteEditor) noteEditor.classList.remove('hidden'); if(notesArea) notesArea.value=''; if(noteTitle) noteTitle.value=''; if(noteChecklistToggle) noteChecklistToggle.checked = false; if(noteEditor) delete noteEditor.dataset.index; });
if(saveNote) saveNote.addEventListener('click', ()=>{ const text = notesArea ? notesArea.value.trim() : ''; const title = noteTitle ? noteTitle.value.trim() : ''; const items = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); const now = new Date().toISOString().split('T')[0]; if(noteChecklistToggle && noteChecklistToggle.checked){ const lines = text.split('\n').map(s=>s.trim()).filter(Boolean); const obj = {type:'checklist', title, date:now, items: lines.map(l=>({text:l,checked:false}))}; if(noteEditor && noteEditor.dataset.index){ items[Number(noteEditor.dataset.index)] = obj; } else { items.push(obj); } localStorage.setItem(NOTES_KEY, JSON.stringify(items)); if(noteEditor) noteEditor.classList.add('hidden'); loadNotes(); return; } if(noteEditor && noteEditor.dataset.index){ items[Number(noteEditor.dataset.index)] = {type:'text', title, date:now, text}; } else { items.push({type:'text', title, date:now, text}); } localStorage.setItem(NOTES_KEY, JSON.stringify(items)); if(noteEditor) noteEditor.classList.add('hidden'); loadNotes(); });
if(clearNotes) clearNotes.addEventListener('click', ()=>{ if(!noteEditor || !noteEditor.dataset.index) return; const items = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); items.splice(Number(noteEditor.dataset.index),1); localStorage.setItem(NOTES_KEY, JSON.stringify(items)); if(noteEditor) noteEditor.classList.add('hidden'); loadNotes(); });
const musicPlayer = document.getElementById('musicPlayer');
const albumArt = document.getElementById('albumArt');
const albumImg = document.getElementById('albumImg');
const albumPlaceholder = document.getElementById('albumPlaceholder');
const uploadMP3 = document.getElementById('uploadMP3');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const ccArt = document.getElementById('ccArt');
const ccTrack = document.getElementById('ccTrack');
const ccArtist = document.getElementById('ccArtist');
const ccPlay = document.getElementById('ccPlay');
const ccPrev = document.getElementById('ccPrev');
const ccNext = document.getElementById('ccNext');
function fmt(s){ s = Number(s); if(isNaN(s)) return '0:00'; const m = Math.floor(s/60); const sec = Math.floor(s%60).toString().padStart(2,'0'); return m+':'+sec; }
function setCCTrack(t){ if(!ccTrack) return; const s = String(t || ''); ccTrack.textContent = s.length > 36 ? s.slice(0,36) + '…' : s; }
function setCCArtist(a){ if(!ccArtist) return; const s = String(a || ''); ccArtist.textContent = s.length > 36 ? s.slice(0,36) + '…' : s; }
if(musicPlayer){
  musicPlayer.addEventListener('loadedmetadata', ()=>{
    if(progress) progress.max = Math.floor(musicPlayer.duration);
    if(durTime) durTime.textContent = fmt(musicPlayer.duration);
  });
  musicPlayer.addEventListener('timeupdate', ()=>{
    if(progress) progress.value = Math.floor(musicPlayer.currentTime);
    if(curTime) curTime.textContent = fmt(musicPlayer.currentTime);
  });
  musicPlayer.addEventListener('play', ()=>{
    if(ccPlay && ccPlay.querySelector('.material-icons')) ccPlay.querySelector('.material-icons').textContent='pause';
    if(playBtn && playBtn.querySelector('.material-icons')) playBtn.querySelector('.material-icons').textContent='pause';
    setCCTrack(trackTitle ? trackTitle.textContent : 'Playing');
    setCCArtist(trackArtist ? trackArtist.textContent : '—');
  });
  musicPlayer.addEventListener('pause', ()=>{
    if(ccPlay && ccPlay.querySelector('.material-icons')) ccPlay.querySelector('.material-icons').textContent='play_arrow';
    if(playBtn && playBtn.querySelector('.material-icons')) playBtn.querySelector('.material-icons').textContent='play_arrow';
  });
}
if(playBtn) playBtn.addEventListener('click', ()=>{ if(!musicPlayer) return; if(musicPlayer.paused){ musicPlayer.play(); } else { musicPlayer.pause(); }});
if(progress) progress.addEventListener('input', ()=>{ if(musicPlayer) musicPlayer.currentTime = progress.value; });
function urlToBlobUrl(arr, mime){ const blob = new Blob([arr], {type:mime}); return URL.createObjectURL(blob); }
function extractAPIC(file){ return new Promise((resolve)=>{ const reader = new FileReader(); reader.onload = ()=>{ const arr = new Uint8Array(reader.result); if(arr.length < 10){ resolve(null); return; } if(arr[0] !== 73 || arr[1] !== 68 || arr[2] !== 51){ resolve(null); return; } const size = (arr[6] & 0x7f) * 0x200000 + (arr[7] & 0x7f) * 0x4000 + (arr[8] & 0x7f) * 0x80 + (arr[9] & 0x7f); let offset = 10; const end = 10 + size; while(offset + 10 < end){ const id = String.fromCharCode(arr[offset],arr[offset+1],arr[offset+2],arr[offset+3]); const frameSize = (arr[offset+4] << 24) | (arr[offset+5] << 16) | (arr[offset+6] << 8) | (arr[offset+7]); offset += 10; if(frameSize <= 0) break; if(id === 'APIC'){ const frame = arr.subarray(offset, offset + frameSize); let i = 0; const encoding = frame[i]; i++; let mime = ''; while(i < frame.length && frame[i] !== 0){ mime += String.fromCharCode(frame[i]); i++; } i++; const picType = frame[i]; i++; let desc = ''; while(i < frame.length && frame[i] !== 0){ desc += String.fromCharCode(frame[i]); i++; } i++; const imageData = frame.subarray(i); const blobUrl = urlToBlobUrl(imageData, mime || 'image/jpeg'); resolve(blobUrl); return; } offset += frameSize; } resolve(null); }; reader.readAsArrayBuffer(file); }); }
if(uploadMP3) uploadMP3.addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const url = URL.createObjectURL(f);
  if(musicPlayer){ musicPlayer.src = url; musicPlayer.play(); }
  if(playBtn && playBtn.querySelector('.material-icons')) playBtn.querySelector('.material-icons').textContent='pause';
  if(trackTitle) trackTitle.textContent = f.name;
  if(trackArtist) trackArtist.textContent = 'Local';
  setCCTrack(f.name);
  setCCArtist('Local');
  extractAPIC(f).then(blobUrl=>{
    if(blobUrl){
      if(albumImg){ albumImg.src = blobUrl; albumImg.classList.remove('hidden'); }
      if(albumPlaceholder) albumPlaceholder.style.display = 'none';
      if(ccArt) ccArt.textContent = '';
      const img = document.createElement('img');
      img.src = blobUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      ccArt.innerHTML = '';
      ccArt.appendChild(img);
    } else {
      if(albumImg){ albumImg.src = ''; albumImg.classList.add('hidden'); }
      if(albumPlaceholder) albumPlaceholder.style.display = 'grid';
      if(ccArt) ccArt.textContent = '🎵';
    }
  });
});
let camStream = null;
const camVideo = document.getElementById('camVideo');
const camStart = document.getElementById('camStart');
const camStop = document.getElementById('camStop');
if(camStart) camStart.addEventListener('click', async ()=>{ try{ camStream = await navigator.mediaDevices.getUserMedia({ video:true }); if(camVideo) camVideo.srcObject = camStream; }catch(e){} });
if(camStop) camStop.addEventListener('click', ()=>{ if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; if(camVideo) camVideo.srcObject=null; }});
const ccButtons = document.querySelectorAll('.cc-btn[data-action]');
ccButtons.forEach(b=>{
  if(!b.dataset.state) b.dataset.state = 'off';
  b.setAttribute('aria-pressed', b.dataset.state === 'on');
  if(b.dataset.state === 'on') b.classList.add('on'); else b.classList.remove('on');
  b.addEventListener('click', (e)=>{
    e.stopPropagation();
    const action = b.dataset.action;
    if(action === 'settings'){
      const icon = document.querySelector('.icon[data-app="settings"]');
      controlCenter.classList.add('hidden');
      controlCenter.classList.remove('visible');
      controlCenter.setAttribute('aria-hidden','true');
      if(blurOverlay) blurOverlay.classList.add('hidden');
      if(icon) animateOpen(icon,'settings');
      return;
    }
    const s = b.dataset.state === 'on' ? 'off' : 'on';
    b.dataset.state = s;
    b.setAttribute('aria-pressed', s === 'on');
    if(s === 'on') b.classList.add('on'); else b.classList.remove('on');
  });
});
const MSG_KEY = 'realos_msgs_v4';
const msgsList = document.getElementById('msgsList');
const msgInput = document.getElementById('msgInput');
const sendMsg = document.getElementById('sendMsg');
function loadMsgs(){ const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); if(msgsList){ msgsList.innerHTML=''; arr.forEach(m=>{ const el=document.createElement('div'); el.className='msg'; el.textContent=m; msgsList.appendChild(el); }); msgsList.scrollTop = msgsList.scrollHeight; } }
loadMsgs();
if(sendMsg) sendMsg.addEventListener('click', ()=>{ if(!msgInput) return; const v = msgInput.value.trim(); if(!v) return; const arr = JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); arr.push(v); localStorage.setItem(MSG_KEY, JSON.stringify(arr)); msgInput.value=''; loadMsgs(); });
if(msgInput) msgInput.addEventListener('keypress', e=>{ if(e.key==='Enter'){ if(sendMsg) sendMsg.click(); e.preventDefault(); }});
const dialNumber = document.getElementById('dialNumber');
const callKeys = document.querySelectorAll('#call .dial-key');
const callBtn = document.getElementById('callBtn');
const endCallBtn = document.getElementById('endCallBtn');
const callStatus = document.getElementById('callStatus');
callKeys.forEach(k=>k.addEventListener('click', ()=> { if(dialNumber) dialNumber.textContent += k.querySelector('.num').textContent; }));
if(callBtn) callBtn.addEventListener('click', ()=> { if(callStatus) callStatus.textContent = 'No SIM card available'; setTimeout(()=>{ if(callStatus) callStatus.textContent=''; },2000); if(dialNumber) dialNumber.textContent=''; });
if(endCallBtn) endCallBtn.addEventListener('click', ()=>{ if(callStatus) callStatus.textContent=''; if(dialNumber) dialNumber.textContent=''; });
const calendarWidget = document.getElementById('calendarWidget');
const addEventBtn = document.getElementById('addEvent');
const eventDate = document.getElementById('eventDate');
const eventText = document.getElementById('eventText');
const eventsList = document.getElementById('eventsList');
const EVENTS_KEY = 'realos_events_v4';
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
const themeSelect = document.getElementById('themeSelect');
const animSpeedSelect = document.getElementById('animSpeed');
if(brightness) brightness.addEventListener('input', e => { phone.style.filter = `brightness(${e.target.value/100})`; });
if(s_wallpaperFile) s_wallpaperFile.addEventListener('change', e => { const f = e.target.files[0]; if(!f) return; phone.style.backgroundImage = `url(${URL.createObjectURL(f)})`; });
if(wallpaperFile) wallpaperFile.addEventListener('change', e => { const f = e.target.files[0]; if(!f) return; phone.style.backgroundImage = `url(${URL.createObjectURL(f)})`; });
if(themeSelect){ const stored = localStorage.getItem('realos_theme') || 'dark'; themeSelect.value = stored; phone.setAttribute('data-theme', stored); themeSelect.addEventListener('change', e=>{ const v = e.target.value; phone.setAttribute('data-theme', v); localStorage.setItem('realos_theme', v); }); }
if(animSpeedSelect){ animSpeedSelect.value = String(animSpeed || 1); animSpeedSelect.addEventListener('change', e=>{ animSpeed = Number(e.target.value); localStorage.setItem('realos_anim_speed', String(animSpeed)); }); }
function showLock(){ if(lockScreen){ lockScreen.classList.remove('hidden'); lockScreen.dataset.locked = '1'; const enrolled = localStorage.getItem('realos_fp') === '1'; if(enrolled){ if(fpCircle) fpCircle.classList.remove('hidden'); } else { if(fpCircle) fpCircle.classList.add('hidden'); } if(inAppNav) inAppNav.classList.add('hidden'); } }
function hideLockInstant(){ if(!lockScreen) return; lockScreen.classList.add('hidden'); lockScreen.dataset.locked = '0'; if(fpCircle) fpCircle.classList.add('hidden'); if(blurOverlay) blurOverlay.classList.add('hidden'); if(controlCenter){ controlCenter.classList.add('hidden'); controlCenter.classList.remove('visible'); controlCenter.setAttribute('aria-hidden','true'); } document.body.style.overflow=''; if(inAppNav) inAppNav.classList.remove('hidden'); }
showLock();
let startY = null;
let tracking = false;
function zonePointerStart(e){ tracking = true; startY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY || 0); e.preventDefault(); }
function zonePointerEnd(e){ if(!tracking) return; const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : (e.clientY || 0); const delta = startY - endY; tracking = false; startY = null; if(delta > 80) triggerUnlockAnimated(); }
if(unlockZone){ unlockZone.addEventListener('touchstart', zonePointerStart); unlockZone.addEventListener('touchend', zonePointerEnd); unlockZone.addEventListener('mousedown', zonePointerStart); unlockZone.addEventListener('mouseup', zonePointerEnd); }
let pressTimer = null;
function pressToUnlockStart(e){ if(phone.classList.contains('powered-off')) return; pressTimer = setTimeout(()=>{ triggerUnlockAnimated(); pressTimer = null; }, 180); e.preventDefault(); }
function pressToUnlockEnd(e){ if(pressTimer){ clearTimeout(pressTimer); pressTimer = null; } }
if(unlockZone){ unlockZone.addEventListener('pointerdown', pressToUnlockStart); unlockZone.addEventListener('pointerup', pressToUnlockEnd); unlockZone.addEventListener('pointercancel', pressToUnlockEnd); unlockZone.addEventListener('mouseleave', pressToUnlockEnd); }
let fpHoldTimer = null;
let fpHoldStart = 0;
function fpHoldStartHandler(e){ e.preventDefault(); fpHoldStart = Date.now(); if(fpCircle) fpCircle.classList.add('active'); fpHoldTimer = setTimeout(()=>{ triggerUnlockAnimated(); fpHoldTimer = null; }, FP_HOLD_MS); }
function fpHoldEndHandler(e){ if(fpHoldTimer) clearTimeout(fpHoldTimer); const held = Date.now() - fpHoldStart; if(fpCircle) fpCircle.classList.remove('active'); if(held < FP_HOLD_MS){ triggerShake(); showModal('fingerprint failed, please keep your finger in for a little longer'); } fpHoldTimer = null; }
if(fpCircle){ fpCircle.addEventListener('touchstart', fpHoldStartHandler); fpCircle.addEventListener('mousedown', fpHoldStartHandler); fpCircle.addEventListener('touchend', fpHoldEndHandler); fpCircle.addEventListener('mouseup', fpHoldEndHandler); fpCircle.addEventListener('mouseleave', fpHoldEndHandler); }
powerBtn.addEventListener('click', ()=>{ const nowOff = phone.classList.contains('powered-off'); if(nowOff){ phone.classList.remove('powered-off'); showLock(); document.body.style.overflow='hidden'; } else { phone.classList.add('powered-off'); hideLockInstant(); closeAllInstant(); if(modal) modal.classList.add('hidden'); if(enrollModal) enrollModal.classList.add('hidden'); document.body.style.overflow=''; } });
const setupFingerprint = document.getElementById('setupFingerprint');
if(setupFingerprint){ setupFingerprint.addEventListener('click', ()=> enrollModal.classList.remove('hidden')); }
let enrollTimer = null;
let enrollStart = 0;
function enrollStartHandler(e){ e.preventDefault(); if(!enrollCircle) return; enrollCircle.classList.add('active'); enrollStart = Date.now(); enrollTimer = setTimeout(()=>{ localStorage.setItem('realos_fp','1'); enrollCircle.classList.remove('active'); if(enrollModal) enrollModal.classList.add('hidden'); showModal('Fingerprint enrolled'); enrollTimer = null; }, ENROLL_HOLD_MS); }
function enrollEndHandler(e){ if(enrollTimer) clearTimeout(enrollTimer); if(enrollCircle) enrollCircle.classList.remove('active'); const held = Date.now() - enrollStart; if(held < ENROLL_HOLD_MS) showModal('enrollment failed, hold longer'); enrollTimer = null; }
if(enrollCircle){ enrollCircle.addEventListener('touchstart', enrollStartHandler); enrollCircle.addEventListener('mousedown', enrollStartHandler); enrollCircle.addEventListener('touchend', enrollEndHandler); enrollCircle.addEventListener('mouseup', enrollEndHandler); enrollCircle.addEventListener('mouseleave', enrollEndHandler); }
const enrollCancel = document.getElementById('enrollCancel');
if(enrollCancel) enrollCancel.addEventListener('click', ()=> enrollModal.classList.add('hidden'));
document.addEventListener('keydown', e => { if(e.key === 'Escape'){ const active = document.querySelector('.app-window.active'); if(active){ const id = active.id; const icon = document.querySelector(`.icon[data-app="${id}"]`); if(icon) animateClose(icon, active); } } });
let ccStartY = null;
let ccTracking = false;
function ccStart(e){ ccTracking = true; ccStartY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY || 0); }
function ccEnd(e){ if(!ccTracking) return; const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : (e.clientY || 0); const delta = endY - ccStartY; ccTracking = false; ccStartY = null; if(delta > 40){ if(controlCenter){ controlCenter.classList.remove('hidden'); controlCenter.classList.add('visible'); controlCenter.setAttribute('aria-hidden','false'); } if(blurOverlay) blurOverlay.classList.remove('hidden'); } }
if(statusBar){ statusBar.addEventListener('touchstart', ccStart); statusBar.addEventListener('touchend', ccEnd); statusBar.addEventListener('mousedown', ccStart); statusBar.addEventListener('mouseup', ccEnd); }
function ccCloseOnSwipeAndTap(){
  if(!controlCenter) return;
  let start = null;
  controlCenter.addEventListener('pointerdown', e=>{ start = e.clientY; }, {passive:true});
  controlCenter.addEventListener('pointerup', e=>{ if(start === null) return; const delta = start - e.clientY; start = null; if(delta > 40){ controlCenter.classList.add('hidden'); controlCenter.classList.remove('visible'); controlCenter.setAttribute('aria-hidden','true'); if(blurOverlay) blurOverlay.classList.add('hidden'); } }, {passive:true});
  document.addEventListener('pointerdown', e=>{ if(!controlCenter) return; if(controlCenter.classList.contains('hidden')) return; if(e.target.closest && e.target.closest('.control-center')) return; if(e.target.closest && e.target.closest('#statusBar')) return; controlCenter.classList.add('hidden'); controlCenter.classList.remove('visible'); controlCenter.setAttribute('aria-hidden','true'); if(blurOverlay) blurOverlay.classList.add('hidden'); });
}
ccCloseOnSwipeAndTap();
const storedTheme = localStorage.getItem('realos_theme') || 'dark';
if(storedTheme) phone.setAttribute('data-theme', storedTheme);
(function setupInAppNav(){
  if(!inAppNav) return;
  if(lockScreen && lockScreen.dataset && lockScreen.dataset.locked === '1') inAppNav.classList.add('hidden'); else inAppNav.classList.remove('hidden');
  let start = null;
  inAppNav.addEventListener('pointerdown', e=>{ start = e.clientY; }, {passive:true});
  inAppNav.addEventListener('pointerup', e=>{ if(start === null) return; const delta = start - e.clientY; start = null; if(delta > 60){ const active = document.querySelector('.app-window.active'); if(active){ const id = active.id; const icon = document.querySelector(`.icon[data-app="${id}"]`); if(icon) animateClose(icon, active); else animateClose(null, active); } } }, {passive:true});
  let outsideStart = null;
  document.addEventListener('pointerdown', e=>{ const pr = phone.getBoundingClientRect(); if(e.clientY > pr.bottom && e.clientX >= pr.left && e.clientX <= pr.right){ outsideStart = e.clientY; } else outsideStart = null; }, {passive:true});
  document.addEventListener('pointerup', e=>{ if(outsideStart === null) return; const pr = phone.getBoundingClientRect(); if(e.clientX < pr.left || e.clientX > pr.right){ outsideStart = null; return; } const delta = outsideStart - e.clientY; outsideStart = null; if(delta > 60){ const active = document.querySelector('.app-window.active'); if(active){ const id = active.id; const icon = document.querySelector(`.icon[data-app="${id}"]`); if(icon) animateClose(icon, active); else animateClose(null, active); } } }, {passive:true});
})();