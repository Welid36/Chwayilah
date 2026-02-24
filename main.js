
// ═════════ PARTICLES ═════════
(()=>{
  const c=document.getElementById('particles-canvas'),ctx=c.getContext('2d');
  let W,H,ps=[];
  const resize=()=>{W=c.width=window.innerWidth;H=c.height=window.innerHeight;};
  resize(); window.addEventListener('resize',resize);
  const cols=['rgba(201,165,100,','rgba(232,160,160,','rgba(160,130,210,'];
  for(let i=0;i<90;i++) ps.push({x:Math.random()*1400,y:Math.random()*900,r:Math.random()*1.6+.3,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,a:Math.random()*.45+.1,c:cols[Math.floor(Math.random()*cols.length)]});
  (function draw(){
    ctx.clearRect(0,0,W,H);
    ps.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c+p.a+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

// ═════════ FLOATING EMOJIS ═════════
const emo=['💛','🌸','✨','💕','🌹','⭐','💫','🌙','🦋','🕊'];
function spawnFloat(){
  const el=document.createElement('span');
  el.className='floaty';
  el.textContent=emo[Math.floor(Math.random()*emo.length)];
  el.style.cssText=`left:${Math.random()*100}vw;bottom:8%;animation-duration:${4+Math.random()*5}s;font-size:${13+Math.random()*18}px;`;
  document.getElementById('floaties').appendChild(el);
  setTimeout(()=>el.remove(),9000);
}
setInterval(spawnFloat,2000);

// ═════════ AUTH ═════════
const DU='Chan&meima',DP='123456';
const getUsers=()=>JSON.parse(localStorage.getItem('_mu')||JSON.stringify({[DU]:DP}));

function doLogin(){
  const u=document.getElementById('u-inp').value.trim();
  const p=document.getElementById('p-inp').value;
  if(getUsers()[u]===p){
    sessionStorage.setItem('_su',u);
    document.getElementById('login-screen').style.display='none';
    document.getElementById('main-site').style.display='block';
    loadGallery(); updateStats();
  } else {
    const e=document.getElementById('login-err');
    e.style.display='block'; e.style.animation='none';
    void e.offsetWidth; e.style.animation='shake .4s ease';
    setTimeout(()=>e.style.display='none',3200);
  }
}
document.getElementById('p-inp').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('u-inp').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
function doLogout(){sessionStorage.removeItem('_su');location.reload();}
function toggleVis(id,btn){const i=document.getElementById(id);i.type=i.type==='password'?'text':'password';btn.textContent=i.type==='password'?'👁':'🙈';}

// ═════════ CHANGE PASSWORD ═════════
function openCP(){
  document.getElementById('cp-modal').classList.add('open');
  ['cp-old','cp-new','cp-con'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('cp-err').style.display='none';
  document.getElementById('cp-suc').style.display='none';
}
function closeCP(){document.getElementById('cp-modal').classList.remove('open');}
function saveCP(){
  const u=sessionStorage.getItem('_su');
  const old_=document.getElementById('cp-old').value;
  const new_=document.getElementById('cp-new').value;
  const con_=document.getElementById('cp-con').value;
  const users=getUsers();
  const err=document.getElementById('cp-err'),suc=document.getElementById('cp-suc');
  err.style.display='none'; suc.style.display='none';
  if(users[u]!==old_){err.textContent='❌ كلمة السر الحالية غير صحيحة';err.style.display='block';return;}
  if(new_.length<4){err.textContent='❌ يجب أن تكون 4 أحرف على الأقل';err.style.display='block';return;}
  if(new_!==con_){err.textContent='❌ كلمة السر وتأكيدها غير متطابقتان';err.style.display='block';return;}
  users[u]=new_; localStorage.setItem('_mu',JSON.stringify(users));
  suc.style.display='block'; setTimeout(closeCP,2000);
  toast('🎉 تم تغيير كلمة السر بنجاح');
}

// ═════════ CLOUDINARY CONFIG ═════════
const CLOUD_NAME = 'db1e11a15';
const UPLOAD_PRESET = 'memories_upload';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

// ═════════ GALLERY (سحابي) ═════════
let pending=[],lbIdx=0;

// البيانات الوصفية (caption, date, public_id) تُحفظ محلياً فقط
// بينما الصور والفيديوهات على Cloudinary
const getPhotos=()=>JSON.parse(localStorage.getItem('_mp')||'[]');
const setPhotos=a=>localStorage.setItem('_mp',JSON.stringify(a));

function loadGallery(){
  const photos=getPhotos(), g=document.getElementById('gallery');
  g.innerHTML='';
  if(!photos.length){
    g.innerHTML='<div class="empty-state"><span class="empty-icon">🌸</span><p>لا توجد ذكريات بعد...<br>ابدأ بإضافة أول صورة أو فيديو لتبدأ رحلتكم معاً</p></div>';
    return;
  }
  photos.forEach((p,i)=>{
    const card=document.createElement('div');
    card.className='photo-card'; card.style.animationDelay=(i*.05)+'s';

    const del=document.createElement('button');
    del.className='del-btn'; del.title='حذف'; del.textContent='🗑';
    del.onclick=ev=>{ev.stopPropagation();delPhoto(i);};

    const vi=document.createElement('div');
    vi.className='view-indicator'; vi.textContent=p.type==='video'?'▶':'🔍';

    if(p.type==='video'){
      const vid=document.createElement('video');
      vid.src=p.src; vid.muted=true; vid.preload='metadata';
      vid.style.cssText='width:100%;display:block;object-fit:cover;max-height:300px;background:#000;';
      card.addEventListener('mouseenter',()=>vid.play());
      card.addEventListener('mouseleave',()=>{vid.pause();vid.currentTime=0;});
      const badge=document.createElement('div');
      badge.style.cssText='position:absolute;top:10px;right:10px;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);color:var(--gold2);font-size:.75rem;padding:4px 10px;border-radius:20px;border:1px solid rgba(201,165,100,.3);z-index:3;font-family:Tajawal,sans-serif;';
      badge.textContent='🎬 فيديو';
      card.appendChild(badge);
      card.appendChild(del); card.appendChild(vi); card.appendChild(vid);
    } else {
      const img=document.createElement('img');
      img.src=p.src; img.alt=p.caption||''; img.loading='lazy';
      card.appendChild(del); card.appendChild(vi); card.appendChild(img);
    }

    const ov=document.createElement('div'); ov.className='card-overlay';
    if(p.caption) ov.innerHTML+=`<div class="card-caption">${p.caption}</div>`;
    if(p.date)    ov.innerHTML+=`<div class="card-date">📅 ${p.date}</div>`;

    card.onclick=()=>openLB(i);
    card.appendChild(ov);
    g.appendChild(card);
  });
  updateStats();
}

function delPhoto(idx){
  if(!confirm('هل تريد حذف هذه الذكرى؟'))return;
  const p=getPhotos(); p.splice(idx,1); setPhotos(p); loadGallery();
  toast('🗑 تم حذف الذكرى');
}

function updateStats(){
  const p=getPhotos();
  document.getElementById('stat-photos').textContent=p.length;
  document.getElementById('stat-mem').textContent=[...new Set(p.map(x=>x.caption).filter(Boolean))].length||p.length;
}

function handleFiles(files){
  pending=Array.from(files); if(!pending.length)return;
  document.getElementById('cap-panel').style.display='block';
  document.getElementById('cap-inp').focus();
  const imgs=pending.filter(f=>f.type.startsWith('image/')).length;
  const vids=pending.filter(f=>f.type.startsWith('video/')).length;
  let msg='📁 تم اختيار: ';
  if(imgs) msg+=`${imgs} صورة `;
  if(vids) msg+=`${vids} فيديو`;
  toast(msg);
}

// ─── رفع الملف لـ Cloudinary ───
async function uploadToCloudinary(file){
  const fd=new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'memories');

  const res=await fetch(UPLOAD_URL,{method:'POST',body:fd});
  if(!res.ok) throw new Error('فشل الرفع');
  const data=await res.json();
  return {
    src: data.secure_url,
    public_id: data.public_id,
    type: file.type.startsWith('video/') ? 'video' : 'image'
  };
}

async function savePhotos_(){
  if(!pending.length)return;
  const cap=document.getElementById('cap-inp').value.trim();
  const date=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});

  // إظهار شريط التحميل
  showProgress(0);
  document.querySelector('.btn-save-cap').disabled=true;

  const photos=getPhotos();
  let done=0;

  for(const f of pending){
    try{
      toast(`⬆️ جاري رفع الملف ${done+1} من ${pending.length}...`);
      const result=await uploadToCloudinary(f);
      photos.push({src:result.src, public_id:result.public_id, caption:cap, date, type:result.type});
      done++;
      showProgress(Math.round((done/pending.length)*100));
    } catch(e){
      toast(`❌ فشل رفع ملف — تحقق من الاتصال`);
    }
  }

  setPhotos(photos);
  loadGallery();
  cancelUp();
  hideProgress();
  toast(`✨ تمت إضافة ${done} ذكرى على السحابة! ☁️`);
  document.querySelector('.btn-save-cap').disabled=false;
}

function cancelUp(){
  pending=[];
  document.getElementById('cap-panel').style.display='none';
  document.getElementById('cap-inp').value='';
  document.getElementById('f-inp').value='';
  hideProgress();
}

// ─── شريط التقدم ───
function showProgress(pct){
  let bar=document.getElementById('progress-bar-wrap');
  if(!bar){
    bar=document.createElement('div');
    bar.id='progress-bar-wrap';
    bar.style.cssText='position:fixed;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,.08);z-index:9999;';
    const inner=document.createElement('div');
    inner.id='progress-bar';
    inner.style.cssText='height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .3s;width:0%;';
    bar.appendChild(inner);
    document.body.appendChild(bar);
  }
  document.getElementById('progress-bar').style.width=pct+'%';
}
function hideProgress(){
  setTimeout(()=>{
    const b=document.getElementById('progress-bar-wrap');
    if(b) b.remove();
  },600);
}

function ev_over(e){e.preventDefault();document.getElementById('drop-zone').classList.add('dragover');}
function ev_leave(){document.getElementById('drop-zone').classList.remove('dragover');}
function ev_drop(e){e.preventDefault();document.getElementById('drop-zone').classList.remove('dragover');handleFiles(e.dataTransfer.files);}
function trackM(e){const z=document.getElementById('drop-zone'),r=z.getBoundingClientRect();z.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');z.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');}

// ═════════ LIGHTBOX ═════════
function openLB(idx){
  lbIdx=idx; renderLB();
  document.getElementById('lb').classList.add('open');
  document.body.style.overflow='hidden';
}
function renderLB(){
  const p=getPhotos()[lbIdx];
  const lbInner=document.querySelector('.lb-inner');
  // remove old media
  const old=lbInner.querySelector('img,video');
  if(old) old.remove();

  if(p.type==='video'){
    const vid=document.createElement('video');
    vid.src=p.src; vid.controls=true; vid.autoplay=true;
    vid.style.cssText='max-width:88vw;max-height:82vh;border-radius:16px;display:block;box-shadow:0 40px 100px rgba(0,0,0,.8);';
    lbInner.insertBefore(vid, lbInner.firstChild);
  } else {
    const img=document.createElement('img');
    img.id='lb-img'; img.src=p.src; img.alt='';
    img.style.cssText='max-width:88vw;max-height:82vh;border-radius:16px;display:block;box-shadow:0 40px 100px rgba(0,0,0,.8);object-fit:contain;transition:opacity .2s,transform .2s;';
    lbInner.insertBefore(img, lbInner.firstChild);
  }

  document.getElementById('lb-cap').textContent=p.caption||'';
  document.getElementById('lb-date').textContent=p.date?'📅 '+p.date:'';
  const show=getPhotos().length>1?'flex':'none';
  document.getElementById('lb-prev').style.display=show;
  document.getElementById('lb-next').style.display=show;
}
function navLB(d){
  // stop any playing video
  const vid=document.querySelector('.lb-inner video');
  if(vid){vid.pause();}
  const n=getPhotos().length;
  lbIdx=(lbIdx+d+n)%n;
  renderLB();
}
function closeLB(){
  const vid=document.querySelector('.lb-inner video');
  if(vid) vid.pause();
  document.getElementById('lb').classList.remove('open');
  document.body.style.overflow='';
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeLB();closeCP();}
  if(document.getElementById('lb').classList.contains('open')){
    if(e.key==='ArrowLeft')navLB(1);
    if(e.key==='ArrowRight')navLB(-1);
  }
});

// ═════════ TOAST ═════════
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3200);
}

// ═════════ مزامنة / نسخ احتياطي ═════════
function exportData(){
  const data=localStorage.getItem('_mp')||'[]';
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='dhikrayatna-backup.json'; a.click();
  URL.revokeObjectURL(url);
  toast('💾 تم تصدير البيانات بنجاح!');
}

function importData(){
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='.json';
  inp.onchange=e=>{
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!Array.isArray(data)) throw new Error();
        localStorage.setItem('_mp',JSON.stringify(data));
        loadGallery(); updateStats();
        toast('✅ تم استيراد '+data.length+' ذكرى بنجاح!');
      }catch{toast('❌ ملف غير صالح');}
    };
    r.readAsText(f);
  };
  inp.click();
}

function addSyncButtons(){
  const nav=document.querySelector('.nav-actions');
  const syncBtn=document.createElement('button');
  syncBtn.className='btn-ghost';
  syncBtn.textContent='☁️ نسخ احتياطي';
  syncBtn.onclick=()=>{
    const m=document.getElementById('sync-menu');
    m.style.display=m.style.display==='block'?'none':'block';
  };
  const menu=document.createElement('div');
  menu.id='sync-menu';
  menu.style.cssText='display:none;position:absolute;top:68px;left:160px;background:rgba(14,10,26,.96);border:1px solid rgba(201,165,100,.25);border-radius:14px;padding:8px;min-width:210px;z-index:300;box-shadow:0 16px 40px rgba(0,0,0,.5);backdrop-filter:blur(16px);';
  menu.innerHTML=`
    <button onclick="exportData();document.getElementById('sync-menu').style.display='none'" style="width:100%;padding:12px 16px;background:none;border:none;color:#f0e8d8;font-family:Tajawal,sans-serif;font-size:.9rem;cursor:pointer;border-radius:8px;text-align:right;" onmouseover="this.style.background='rgba(201,165,100,.12)'" onmouseout="this.style.background='none'">📤 تصدير الذكريات (backup)</button>
    <button onclick="importData();document.getElementById('sync-menu').style.display='none'" style="width:100%;padding:12px 16px;background:none;border:none;color:#f0e8d8;font-family:Tajawal,sans-serif;font-size:.9rem;cursor:pointer;border-radius:8px;text-align:right;" onmouseover="this.style.background='rgba(201,165,100,.12)'" onmouseout="this.style.background='none'">📥 استيراد على جهاز جديد</button>
    <div style="padding:8px 16px;font-size:.75rem;color:#9a8870;border-top:1px solid rgba(255,255,255,.08);margin-top:4px;">💡 انقل ذكرياتك لأي جهاز بسهولة</div>
  `;
  nav.insertBefore(syncBtn, nav.firstChild);
  document.querySelector('.navbar').appendChild(menu);
  document.addEventListener('click',e=>{if(!syncBtn.contains(e.target)&&!menu.contains(e.target))menu.style.display='none';});
}

// ═════════ INIT ═════════
if(sessionStorage.getItem('_su')){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('main-site').style.display='block';
  loadGallery(); updateStats(); addSyncButtons();
}
