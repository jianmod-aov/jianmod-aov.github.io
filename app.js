window.__VT_VER='20261009n'; /* bản JS — index.html sẽ đối chiếu để phát hiện cache cũ */
let CFG=null, lbList=[], lbIdx=0;
const $=id=>document.getElementById(id);
async function load(){
  try{
    const r=await fetch('/api/config',{cache:'no-store'});
    if(!r.ok) throw new Error('api');
    const j=await r.json(); CFG=j.data;
  }catch(e){
    if(window.VT_CONFIG){ CFG=window.VT_CONFIG; } /* gói tĩnh cPanel: dùng config.js có sẵn */
    else { CFG=null; return; }
  }
  applyTheme(); renderAll(); startTyped(); initSky();
}
function applyTheme(){
  const dark=localStorage.getItem('vt-dark');
  const useDark=dark===null ? !!CFG.settings.default_dark : dark==='1';
  document.body.classList.toggle('vthangios-dark',useDark);
  setThemeIcon(useDark); setAccent();
}
function setThemeIcon(isDark){
  const el=$('themeIcon');
  el.className=isDark ? 'bi bi-moon-fill vthangios-theme-icon' : 'bi bi-sun-fill vthangios-theme-icon';
}
function setAccent(){
  const r=document.documentElement.style;
  r.setProperty('--vi-accent',CFG.settings.accent||'#4a6cf7');
  r.setProperty('--vi-accent2',CFG.settings.accent2||'#b983ff');
}
function renderAll(){
  const s=CFG.settings, ui=CFG.ui||{};
  document.title=s.site_title||'Văn Thắng iOS';
  $('seo-title').textContent=s.site_title||'';
  $('seo-desc').setAttribute('content',s.site_desc||'');
  const fav=$('favicon'); if(fav&&s.favicon) fav.href=s.favicon;
  $('iamText').textContent=s.iam_text||'';
  $('profileName').textContent=s.profile_name||'';
  const vb=$('verifyBadge');
  if(s.verify_badge){ vb.style.display=''; vb.src=s.verify_img||'/assets/img/verify.png'; } else vb.style.display='none';
  $('headlinePrefix').textContent=(s.headline_prefix||'')+' ';
  $('avatarImg').src=s.avatar_url||'';
  $('avatarImg').alt='Ảnh đại diện '+(s.profile_name||'');
  const fr=$('avatarFrame');
  if(s.avatar_frame_url){ fr.src=s.avatar_frame_url; fr.hidden=false; $('avatarWrap').classList.add('has-frame'); }
  else { fr.hidden=true; }
  $('footerText').innerHTML=esc(s.footer_text||'');
  $('notifTitle').textContent=ui.notif_title||'Thông Báo';
  $('socials').innerHTML=(CFG.socials||[]).map(x=>`<a href="${esc(x.url)}" class="vthangios-social-item" target="_blank" rel="noopener noreferrer" aria-label="${esc(x.label||'')}"><img src="${esc(x.icon_url)}" alt="Social" width="40" height="40" loading="lazy"></a>`).join('');
  $('linkboxSec').innerHTML=(CFG.linkboxes||[]).map(x=>lbCard(x)).join('');
  const n=CFG.notifs||[];
  const bell=$('bellBtn');
  bell.querySelectorAll('.vthangios-bell-badge').forEach(e=>e.remove());
  if(n.length){ const b=document.createElement('span'); b.className='vthangios-bell-badge'; b.id='bellDot'; bell.appendChild(b); }
  $('notifBody').innerHTML=n.length ? n.map(x=>`<div class="vthangios-notif-item"><div style="font-weight:800">${esc(x.title)}</div><div>${esc(x.content)}</div><div style="opacity:.6;font-size:11px">${esc(x.time||'')}</div></div>`).join('') : `<div class="vthangios-notif-empty"><i class="fas fa-bell-slash"></i><br>${esc(ui.notif_empty||'Chưa có thông báo')}</div>`;
  const m=CFG.music||{};
  $('musicCard').hidden=!m.enabled;
  if(m.enabled){ $('mTitle').textContent=m.title||''; $('mArtist').textContent=m.artist||''; setupMusicSource(); }
  const y=CFG.youtube||{};
  $('ytBanner').hidden=!y.enabled;
  if(y.enabled){ $('ytAvatar').src=y.avatar_url||''; $('ytName').textContent=y.channel_name||''; $('ytHandle').textContent=y.handle||''; $('ytMeta').innerHTML=`<span>${esc(y.subs||'')}</span><span class="vthangios-yt-dot">•</span><span>${esc(y.videos||'')}</span>`; $('ytBtn').href=y.sub_url||'#'; $('ytBtn').textContent=ui.subscribe_btn||'Đăng ký'; }
  renderGroups();
}
function renderGroups(){
  const box=$('groups'); box.innerHTML='';
  (CFG.groups||[]).forEach(g=>{
    const apps=(CFG.apps||[]).filter(a=>a.group_id===g.id);
    if(!apps.length) return;
    const ui=CFG.ui||{};
    const wrap=document.createElement('div'); wrap.className='vthangios-group-block'; wrap.id='group-'+g.id;
    wrap.innerHTML=`<h2 class="vthangios-section-title">${esc(g.name)}</h2><div class="vthangios-app-list"></div>`;
    const list=wrap.querySelector('.vthangios-app-list');
    apps.forEach(a=>{
      const badges=(a.platforms||[]).map(p=>{
        if(p==='iOS') return `<span class="vthangios-platform-badge vthangios-platform-ios"><i class="fab fa-apple"></i> iOS</span>`;
        return `<span class="vthangios-platform-badge vthangios-platform-android"><i class="bi bi-android2"></i> Android</span>`;
      }).join('');
      const previews=[...(a.previews||[]),a.banner_url].filter(Boolean).filter((v,i,arr)=>arr.indexOf(v)===i);
      const dlTxt=ui.download_btn||'Tải Xuống', keyTxt=ui.getkey_btn||'Get Key';
      const entry=document.createElement('div'); entry.className='vthangios-app-entry';
      entry.innerHTML=`<div class="vthangios-app-item">
        <div class="vthangios-app-banner"><img src="${esc(a.banner_url||'')}" alt="${esc(a.name)}" loading="lazy"><span class="vthangios-app-banner-badges">${badges}</span></div>
        <div class="vthangios-app-info"><div class="vthangios-app-icon-wrap"><img src="${esc(a.icon_url||'')}" alt="${esc(a.name)}" width="78" height="78" loading="lazy"></div>
        <div><span class="vthangios-app-name">${esc(a.name)}</span><span class="vthangios-app-desc">${esc(a.desc||'')}</span></div></div>
        <div class="vthangios-app-actions"><button class="vthangios-download-btn vthangios-app-cta"><span>${esc(dlTxt)}</span><i class="bi bi-download"></i></button>${a.show_getkey?`<button type="button" class="vthangios-app-getkey"><i class="fas fa-key"></i><span>${esc(keyTxt)}</span></button>`:''}</div>
      </div>`;
      entry.querySelector('.vthangios-app-banner').onclick=()=>openLB(previews,a.name);
      entry.querySelector('.vthangios-download-btn').onclick=()=>window.open(a.download_url,'_blank');
      const kb=entry.querySelector('.vthangios-app-getkey'); if(kb) kb.onclick=()=>window.open(a.getkey_url,'_blank');
      list.appendChild(entry);
    });
    box.appendChild(wrap);
  });
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeColor(c){c=String(c||'').trim();return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)?c:'#4a6cf7';}
function lbCard(x){
  return `<a href="${esc(x.url||'#')}" target="_blank" rel="noopener" class="vthangios-lb-card">
    <span class="vthangios-lb-ic" style="background:${safeColor(x.color)}"><i class="${esc(x.icon||'fa-solid fa-link')}"></i></span>
    <span class="vthangios-lb-tx"><b>${esc(x.title||'')}</b><small>${esc(x.desc||'')}</small></span>
    <i class="fa-solid fa-arrow-right vthangios-lb-ar" aria-hidden="true"></i>
  </a>`;
}

/* ===== Trời đầy sao + sao băng (CSS có sẵn trong style.2.0.css) ===== */
function initSky(){
  const sky=$('skyOverlay'); if(!sky) return;
  const frag=document.createDocumentFragment();
  for(let i=0;i<54;i++){
    const s=document.createElement('span'); s.className='vt-star-dot';
    const sz=(Math.random()*1.7+0.7).toFixed(1);
    s.style.cssText='left:'+(Math.random()*100).toFixed(2)+'%;top:'+(Math.random()*100).toFixed(2)+'%;width:'+sz+'px;height:'+sz+'px;opacity:'+(0.3+Math.random()*0.65).toFixed(2)+';animation-duration:'+(2+Math.random()*3.5).toFixed(1)+'s;animation-delay:-'+(Math.random()*6).toFixed(1)+'s';
    frag.appendChild(s);
  }
  sky.appendChild(frag);
  let last=0;
  const drop=()=>{
    const m=document.createElement('span'); m.className='vt-meteor';
    m.style.cssText='--mt-angle:-'+(14+Math.random()*24).toFixed(1)+'deg;left:'+(52+Math.random()*46).toFixed(1)+'%;top:'+(Math.random()*30).toFixed(1)+'%;width:'+(100+Math.random()*170).toFixed(0)+'px;animation-duration:'+(1.1+Math.random()*1.2).toFixed(2)+'s';
    sky.appendChild(m);
    setTimeout(()=>m.remove(),3000);
    setTimeout(drop,1100+Math.random()*2800);
  };
  setTimeout(drop,600);
  document.addEventListener('pointerdown',e=>{
    const now=Date.now(); if(now-last<260) return; last=now;
    const sp=document.createElement('span'); sp.className='vt-sparkle-dot';
    const sz=12+Math.random()*12;
    sp.style.cssText='left:'+(e.clientX-sz/2).toFixed(0)+'px;top:'+(e.clientY-sz/2).toFixed(0)+'px;width:'+sz.toFixed(0)+'px;height:'+sz.toFixed(0)+'px;--sp-color:'+(CFG&&CFG.settings?safeColor(CFG.settings.accent2):'#a78bfa')+';animation-duration:.85s';
    document.body.appendChild(sp);
    setTimeout(()=>sp.remove(),1000);
  },{passive:true});
}
let tw=0,tc=0;
function startTyped(){
  const words=(CFG.settings.headline_words||[]).filter(Boolean);
  const el=$('typedText');
  if(!words.length){ el.textContent=''; return; }
  const w=words[tw%words.length];
  el.textContent=w.slice(0,++tc);
  if(tc>=w.length){ setTimeout(()=>{ const iv=setInterval(()=>{ el.textContent=w.slice(0,--tc); if(tc<=0){ clearInterval(iv); tw++; startTyped(); } },35); },1400); return; }
  setTimeout(startTyped,90);
}
$('bellBtn').onclick=()=>{ const p=$('notifPanel'); p.style.display='flex'; requestAnimationFrame(()=>p.classList.add('open')); $('notifOverlay').classList.add('open'); };
function closeNotif(){ const p=$('notifPanel'); p.classList.remove('open'); $('notifOverlay').classList.remove('open'); setTimeout(()=>{ if(!p.classList.contains('open')) p.style.display='none'; },200); }
$('notifClose').onclick=closeNotif; $('notifOverlay').onclick=closeNotif;
$('themeBtn').onclick=()=>{ const d=document.body.classList.toggle('vthangios-dark'); localStorage.setItem('vt-dark',d?'1':'0'); setThemeIcon(d); };
function openLB(list,title){ lbList=list; lbIdx=0; $('lbTitle').textContent=title||''; const m=$('lightbox'); m.classList.add('open'); m.style.display='flex'; showLB(); }
function showLB(){ $('vthangios-preview-img').src=lbList[lbIdx]||''; $('lbDots').innerHTML=lbList.map((_,i)=>`<span class="vthangios-preview-dot ${i===lbIdx?'active':''}"></span>`).join(''); [...$('lbDots').children].forEach((d,i)=>d.onclick=e=>{e.stopPropagation(); lbIdx=i; showLB();}); }
function closeLB(){ const m=$('lightbox'); m.classList.remove('open'); m.style.display='none'; }
$('lbClose').onclick=e=>{e.stopPropagation(); closeLB();};
$('lightbox').onclick=e=>{ if(e.target.id==='lightbox') closeLB(); };
$('lbPrev').onclick=e=>{e.stopPropagation(); lbIdx=(lbIdx-1+lbList.length)%lbList.length; showLB();};
$('lbNext').onclick=e=>{e.stopPropagation(); lbIdx=(lbIdx+1)%lbList.length; showLB();};
const audio=$('audio');
let scWidget=null, scMode=false, scTimer=null, scPlaying=false;
function setPlayIcon(playing){ $('mIcon').className=playing?'fa-solid fa-pause':'fa-solid fa-play'; }
function fmt(t){ if(!isFinite(t)||t<0) return '0:00'; const m=Math.floor(t/60),s=Math.floor(t%60); return m+':'+String(s).padStart(2,'0'); }
$('mToggle').onclick=()=>{
  const m=(CFG&&CFG.music)||{};
  if(scMode&&scWidget){ try{ scWidget.isPaused(p=>{ try{ p?scWidget.play():scWidget.pause(); }catch(e){} }); }catch(e){} return; }
  if(audio.src){ if(audio.paused){ audio.play().catch(()=>{}); } else audio.pause(); return; }
  if(m.soundcloud_url) window.open(m.soundcloud_url,'_blank');
};
$('mPrev').onclick=()=>{ if(scMode&&scWidget){ try{scWidget.prev();}catch(e){} } else if(audio.src){ audio.currentTime=0; } };
$('mNext').onclick=()=>{ if(scMode&&scWidget){ try{scWidget.next();}catch(e){} } else if(audio.src){ audio.currentTime=0; } };
audio.onplay=()=>setPlayIcon(true);
audio.onpause=()=>setPlayIcon(false);
audio.ontimeupdate=()=>{ if(audio.duration){ $('mFill').style.width=(audio.currentTime/audio.duration*100)+'%'; $('tCur').textContent=fmt(audio.currentTime); $('tTotal').textContent=fmt(audio.duration); } };
audio.onloadedmetadata=()=>{ $('tTotal').textContent=fmt(audio.duration); };
$('mProgress').onclick=e=>{ const r=e.currentTarget.getBoundingClientRect(); const k=(e.clientX-r.left)/r.width;
  if(scMode&&scWidget){ try{ scWidget.getDuration(d=>{ if(d>0) scWidget.seekTo(k*d); }); }catch(err){} return; }
  if(audio.duration) audio.currentTime=k*audio.duration; };
function setupMusicSource(){
  const m=(CFG&&CFG.music)||{};
  scMode=false; scWidget=null; scPlaying=false; clearInterval(scTimer); setPlayIcon(false);
  if(m.audio_url){ try{ audio.src=m.audio_url; }catch(e){} return; }
  try{ audio.removeAttribute('src'); audio.load(); }catch(e){}
  if(m.soundcloud_url) setupSC(m.soundcloud_url);
}
function loadSCApi(){
  return new Promise(res=>{
    if(window.SC&&SC.Widget) return res(true);
    const s=document.createElement('script'); s.src='https://w.soundcloud.com/player/api.js';
    s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s);
    setTimeout(()=>res(!!(window.SC&&SC.Widget)),8000);
  });
}
async function setupSC(url){
  if(!await loadSCApi()) return;
  const holder=$('vt-music-frame-holder'); if(!holder) return; holder.innerHTML='';
  const fr=document.createElement('iframe');
  fr.scrolling='no'; fr.frameBorder='no'; fr.setAttribute('allow','autoplay; encrypted-media');
  fr.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false';
  fr.style.cssText='position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;';
  holder.appendChild(fr);
  try{
    scWidget=SC.Widget(fr); scMode=true;
    scWidget.bind(SC.Widget.Events.READY,()=>{ try{ scWidget.getSounds(s=>{ if(s&&s[0]&&s[0].duration) $('tTotal').textContent=fmt(s[0].duration/1000); }); }catch(e){} });
    scWidget.bind(SC.Widget.Events.PLAY,()=>{ scPlaying=true; setPlayIcon(true); scTick(); });
    scWidget.bind(SC.Widget.Events.PAUSE,()=>{ scPlaying=false; setPlayIcon(false); });
    scWidget.bind(SC.Widget.Events.FINISH,()=>{ scPlaying=false; setPlayIcon(false); });
  }catch(e){ scMode=false; scWidget=null; }
}
function scTick(){
  clearInterval(scTimer);
  scTimer=setInterval(()=>{ if(!scWidget) return;
    try{ scWidget.getPosition(p=>{ try{ scWidget.getDuration(d=>{ if(d>0){ $('mFill').style.width=(p/d*100)+'%'; $('tCur').textContent=fmt(p/1000); $('tTotal').textContent=fmt(d/1000); } }); }catch(e){} }); }catch(e){}
  },500);
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeNotif(); closeLB(); } });
load();
