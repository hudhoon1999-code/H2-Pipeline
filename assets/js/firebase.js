'use strict';
// ── FIREBASE + BOOT ───────────────────────────────────────────────────────
// ── RESPONSIVE RESIZE ─────────────────────────────────────────────────────────

// ── FIREBASE + BOOT ───────────────────────────────────────────────────────────
let _fbAuth = null, _fbDb = null, _snapshotUnsub = null;


async function initFirebase() {
  // Wait up to 6s for Firebase compat SDK
  await new Promise(resolve => {
    if(window.firebase&&window.firebase.auth){resolve();return;}
    let t=0; const p=setInterval(()=>{ t+=50; if(window.firebase&&window.firebase.auth){clearInterval(p);resolve();} else if(t>=6000){clearInterval(p);resolve();} },50);
  });
  if(!window.firebase||!window.firebase.auth){ bootLocalAuth(); return; }
  try {
    if(!firebase.apps.length) firebase.initializeApp({apiKey:"AIzaSyCJXo3RSH9MdoV_WNuix_ImGZr9oQC92QM",authDomain:"h2-line.firebaseapp.com",projectId:"h2-line",storageBucket:"h2-line.firebasestorage.app",messagingSenderId:"958098099954",appId:"1:958098099954:web:4e5c45f7b87f06ec390a6b"});
    _fbAuth = firebase.auth();
    _fbDb = firebase.firestore();
    window._fbDb = _fbDb;
  } catch(e) { console.warn('Firebase init error:',e.message); bootLocalAuth(); return; }

  // Auth helpers
  window.doFBLogin = async function() {
    const email=((document.getElementById('a-email')||{}).value||'').trim();
    const pw=(document.getElementById('a-pw')||{}).value||'';
    const sub=document.getElementById('a-submit');
    if(!email||!pw){ if(sub){sub.textContent='Log In';sub.disabled=false;} showAuthMsg('Enter email and password'); return; }
    try { await _fbAuth.signInWithEmailAndPassword(email,pw); }
    catch(e) {
      if(sub){sub.textContent='Log In';sub.disabled=false;}
      let msg=e.message||'Login failed';
      if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(e.code)) msg='Wrong email or password';
      else if(e.code==='auth/unauthorized-domain') msg='Add '+window.location.hostname+' to Firebase Console → Auth → Authorized Domains';
      else if(e.code==='auth/network-request-failed') msg='Network error — check your connection';
      showAuthMsg(msg);
    }
  };
  window.doFBSignup = async function() {
    const name=((document.getElementById('a-name')||{}).value||'').trim();
    const email=((document.getElementById('a-email')||{}).value||'').trim();
    const pw=(document.getElementById('a-pw')||{}).value||'';
    const sub=document.getElementById('a-submit');
    if(!name||!email||!pw){ if(sub){sub.textContent='Create Account';sub.disabled=false;} showAuthMsg('Fill all fields'); return; }
    try {
      const cred=await _fbAuth.createUserWithEmailAndPassword(email,pw);
      await cred.user.updateProfile({displayName:name});
      const isAdmin=email===ADMIN_EMAIL;
      await _fbDb.collection('users').doc(cred.user.uid).set({name,email,role:isAdmin?'admin':'agent',approved:isAdmin,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      showAuthMsg('✓ Account created'+(isAdmin?'':' — awaiting admin approval'),true);
      if(sub){sub.textContent='Create Account';sub.disabled=false;}
    } catch(e) { if(sub){sub.textContent='Create Account';sub.disabled=false;} showAuthMsg(e.code==='auth/email-already-in-use'?'Email already registered — try Log In':e.message||'Signup failed'); }
  };
  window.doFBLogout = async function() {
    if(!confirm('Sign out?')) return;
    if(_snapshotUnsub){_snapshotUnsub();_snapshotUnsub=null;}
    await _fbAuth.signOut();
    STATE.user=null; STATE.isAdmin=false; STATE.isAgent=false; STATE.agentId=null;
    STATE.sales=[]; STATE.items=[]; STATE.shops=[]; render();
  };
  window.doFBForgot = async function() {
    const email=((document.getElementById('a-email')||{}).value||'').trim();
    if(!email){showAuthMsg('Enter your email first');return;}
    try { await _fbAuth.sendPasswordResetEmail(email); showAuthMsg('✓ Reset email sent',true); }
    catch(e){ showAuthMsg(e.message||'Failed'); }
  };
  window.saveToFirestore = async function() {
    if(!STATE.isAdmin||!_fbDb) return;
    try {
      await _fbDb.collection('shared').doc('data').set({sales:STATE.sales,items:STATE.items,shops:STATE.shops,agents:STATE.agents||[],targets:STATE.targets||[],checkins:STATE.checkins||[],currency:STATE.currency||'MVR',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      db.set('syncPending',false);
    } catch(e){ db.set('syncPending',true); console.warn('Firestore save:',e.message); }
  };
  window.addEventListener('online',async()=>{ if(db.get('syncPending')&&STATE.isAdmin&&window.saveToFirestore){showToast('↑ Syncing...'); await window.saveToFirestore(); if(!db.get('syncPending'))showToast('✓ Synced');} });
  window.addEventListener('offline',()=>showToast('⚠️ Offline — saved locally'));

  async function loadFirestoreData() {
    try {
      const snap=await _fbDb.collection('shared').doc('data').get();
      if(snap.exists){ const d=snap.data(); STATE.sales=(d.sales||[]).map(normalizeSaleGSTRow); STATE.items=d.items||[]; STATE.shops=d.shops||[]; STATE.agents=d.agents||[]; STATE.targets=d.targets||[]; STATE.checkins=d.checkins||[]; STATE.currency=d.currency||'MVR'; db.set('sales',STATE.sales); db.set('items',STATE.items); db.set('shops',STATE.shops); db.set('agents',STATE.agents); db.set('targets',STATE.targets); db.set('checkins',STATE.checkins); }
      else if(STATE.isAdmin) await window.saveToFirestore();
    } catch(e){ console.warn('Firestore load:',e.message); STATE.sales=db.get('sales',[]).map(normalizeSaleGSTRow); STATE.items=db.get('items',[]); STATE.shops=db.get('shops',[]); STATE.agents=db.get('agents',[]); STATE.targets=db.get('targets',[]); }
  }

  // Auth timeout fallback
  const authTimeout = setTimeout(()=>{ if(!STATE.user) render(); },8000);

  _fbAuth.onAuthStateChanged(async fbUser => {
    clearTimeout(authTimeout);
    if(_snapshotUnsub){_snapshotUnsub();_snapshotUnsub=null;}
    if(fbUser){
      const isSuperAdmin=fbUser.email===ADMIN_EMAIL;
      STATE.user={id:fbUser.uid,name:fbUser.displayName||fbUser.email.split('@')[0],email:fbUser.email,role:isSuperAdmin?'admin':'agent',approved:true};
      STATE.isAdmin=isSuperAdmin; STATE.isAgent=!isSuperAdmin; STATE.agentId=null;
      try {
        const p=await _fbDb.collection('users').doc(fbUser.uid).get();
        if(p.exists){ const d=p.data(); STATE.user.name=d.name||STATE.user.name; STATE.user.approved=isSuperAdmin?true:(d.approved!==false); const isAdmin=isSuperAdmin||d.role==='admin'; STATE.isAdmin=isAdmin; STATE.isAgent=!isAdmin; }
        else if(isSuperAdmin) await _fbDb.collection('users').doc(fbUser.uid).set({name:STATE.user.name,email:fbUser.email,role:'admin',approved:true});
      } catch(e){console.warn('Profile:',e.message);}
      await loadFirestoreData();
      if(!STATE.isAdmin){ const a=STATE.agents.find(a=>a.uid===fbUser.uid||a.email===fbUser.email); if(a){STATE.agentId=a.id;STATE.user.name=a.name||STATE.user.name;} }
      try {
        _snapshotUnsub=_fbDb.collection('shared').doc('data').onSnapshot(snap=>{
          if(!snap.exists) return;
          const d=snap.data(); STATE.sales=(d.sales||[]).map(normalizeSaleGSTRow); STATE.items=d.items||[]; STATE.shops=d.shops||[]; STATE.agents=d.agents||[]; STATE.targets=d.targets||[]; STATE.checkins=d.checkins||[];
          if(!STATE.isAdmin){ const a=STATE.agents.find(a=>a.uid===fbUser.uid||a.email===fbUser.email); if(a) STATE.agentId=a.id; }
          render();
        },err=>console.warn('Snapshot:',err.message));
      } catch(e){console.warn('Snapshot setup:',e.message);}
      render();
    } else { STATE.user=null; STATE.isAdmin=false; STATE.isAgent=false; STATE.agentId=null; render(); }
  });
}

// Boot
if(VIEW_ID){ bootViewer(); }
else {
  document.body.className=STATE.dark?'dark':'light';
  const root=document.getElementById('app');
  if(root) root.innerHTML='<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px"><img src="'+LOGO_ICON+'" style="width:64px;height:64px;border-radius:16px"><div style="font-family:Outfit,sans-serif;font-size:22px;font-weight:800;color:var(--a)">H2 Line</div><div style="width:28px;height:28px;border:3px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite"></div><div style="font-size:12px;color:var(--t2)">Loading…</div></div>';
  initFirebase().catch(e=>{ console.warn('Firebase failed:',e.message); bootLocalAuth(); });
}

function showUpdateBanner() {
  if(document.getElementById('update-banner')) return;
  const b=document.createElement('div'); b.id='update-banner';
  b.style.cssText='position:fixed;bottom:calc(72px + env(safe-area-inset-bottom,16px) + 8px);left:50%;transform:translateX(-50%);z-index:9999;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;padding:10px 16px;border-radius:12px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:10px;box-shadow:0 4px 24px rgba(99,102,241,.5);white-space:nowrap;animation:slideUp .3s ease;font-family:Nunito,sans-serif';
  b.innerHTML='🆕 Update available &nbsp;<button onclick="applyUpdate()" style="background:rgba(255,255,255,.25);border:none;color:#fff;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Refresh</button><button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;padding:0 4px;line-height:1">×</button>';
  document.body.appendChild(b);
}
function applyUpdate() {
  const b=document.getElementById('update-banner');
  if(b) b.innerHTML='<span style="display:flex;align-items:center;gap:8px"><span style="width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;display:inline-block"></span> Updating…</span>';
  if(navigator.serviceWorker?.controller) navigator.serviceWorker.controller.postMessage({type:'SKIP_WAITING'});
  setTimeout(()=>window.location.reload(),500);
}

if('serviceWorker' in navigator) {
  window.addEventListener('load',()=>{
    const sw=`const CACHE='h2line-v5';self.addEventListener('install',e=>{self.skipWaiting();});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});`;
    try {
      const blob=new Blob([sw],{type:'application/javascript'});
      const url=URL.createObjectURL(blob);
      navigator.serviceWorker.register(url,{scope:'/'}).then(reg=>{
        setInterval(()=>reg.update(),60000);
        reg.addEventListener('updatefound',()=>{
          const nw=reg.installing; if(!nw) return;
          nw.addEventListener('statechange',()=>{ if(nw.state==='installed'&&navigator.serviceWorker.controller) showUpdateBanner(); });
        });
      }).catch(()=>{});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(window._reloading) return; window._reloading=true; window.location.reload(); });
    } catch(e){}
  });
}