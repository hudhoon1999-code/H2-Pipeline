'use strict';
// ── AUTH ──────────────────────────────────────────────────────────────────
// ── AUTH ────────────────────────────────────────────────────────────────────
let authMode = 'login';
function renderAuth() {
  const formHTML =
    '<div style="display:flex;gap:5px;margin-bottom:22px;background:rgba(255,255,255,.05);border-radius:10px;padding:4px">' +
      '<button id="tab-login" onclick="switchTab(\'login\')" style="flex:1;padding:9px;border-radius:7px;border:none;cursor:pointer;font-weight:700;font-size:13px;transition:all .2s;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;box-shadow:0 2px 10px rgba(99,102,241,.4)">Log In</button>' +
      '<button id="tab-signup" onclick="switchTab(\'signup\')" style="flex:1;padding:9px;border-radius:7px;border:none;cursor:pointer;font-weight:700;font-size:13px;transition:all .2s;background:transparent;color:rgba(255,255,255,.4)">Sign Up</button>' +
    '</div>' +
    '<div class="fg">' +
      '<div class="iw" id="name-row" style="display:none"><label class="il" style="color:rgba(255,255,255,.5)">Full Name</label><input id="a-name" class="inp" placeholder="Your name" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff"></div>' +
      '<div class="iw"><label class="il" style="color:rgba(255,255,255,.5)">Email</label><input id="a-email" class="inp" type="email" placeholder="you@example.com" autocomplete="email" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff"></div>' +
      '<div class="iw" style="position:relative"><label class="il" style="color:rgba(255,255,255,.5)">Password</label>' +
        '<input id="a-pw" class="inp" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" style="padding-right:44px;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff" autocomplete="current-password">' +
        '<button onclick="togglePw()" style="position:absolute;right:8px;top:26px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);padding:6px;font-size:16px">\uD83D\uDC41</button>' +
      '</div>' +
      '<div class="iw" id="invite-row" style="display:none"><label class="il" style="color:rgba(255,255,255,.5)">Invite Code</label>' +
        '<input id="a-invite" class="inp" placeholder="From your admin" style="text-transform:uppercase;letter-spacing:.08em;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#fff" maxlength="10">' +
      '</div>' +
      '<div id="a-msg" style="display:none;padding:10px 13px;border-radius:var(--rx);font-size:13px"></div>' +
      '<button id="a-submit" onclick="doAuth()" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;border:none;border-radius:var(--rs);padding:13px 20px;font-size:15px;font-weight:700;cursor:pointer;width:100%;height:50px;box-shadow:0 6px 22px rgba(99,102,241,.45);transition:all .2s;font-family:Nunito,sans-serif">Log In</button>' +
      '<button onclick="switchTab(\'forgot\')" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);font-size:12px;font-weight:500;width:100%;text-align:center;padding:4px;font-family:Nunito,sans-serif">Forgot password?</button>' +
    '</div>';

  // ── DESKTOP: full-page split layout ──
  if (isDesktop()) {
    const features = [
      {ico:'📊',title:'Real-time Dashboard',sub:'Live sales, GST tracking & pipeline analytics',bg:'rgba(99,102,241,.15)',bd:'rgba(99,102,241,.3)',delay:'.38s'},
      {ico:'🧾',title:'Invoice Generation',sub:'Professional PDF invoices with GST @ 8%',bg:'rgba(16,185,129,.15)',bd:'rgba(16,185,129,.3)',delay:'.50s'},
      {ico:'🤖',title:'AI Invoice Scanning',sub:'Scan Lotus invoices — photo to data instantly',bg:'rgba(139,92,246,.15)',bd:'rgba(139,92,246,.3)',delay:'.62s'},
      {ico:'☁️',title:'Cloud Sync',sub:'Firebase-powered, syncs across all your devices',bg:'rgba(14,165,233,.15)',bd:'rgba(14,165,233,.3)',delay:'.74s'},
    ];
    return '<div class="auth-desktop-wrap">' +
      '<div class="auth-db-orb auth-db-orb1"></div>' +
      '<div class="auth-db-orb auth-db-orb2"></div>' +
      '<div class="auth-db-orb auth-db-orb3"></div>' +
      '<div class="auth-db-orb auth-db-orb4"></div>' +
      '<div class="auth-desktop-grid"></div>' +

      // ── Left panel ──
      '<div class="auth-desktop-left">' +
        '<div class="auth-desktop-left-glow"></div>' +
        '<div class="auth-desktop-left-inner">' +
          '<img src="'+LOGO_AUTH+'" class="auth-db-logo" alt="H2 Line">' +
          '<h1 style="font-family:Outfit,sans-serif;font-size:40px;font-weight:800;color:#fff;line-height:1.18;margin:0 0 14px;animation:authFadeUp .65s .18s ease both">Your distribution<br>business, <span style="background:linear-gradient(135deg,#6366F1,#8B5CF6,#06B6D4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">simplified.</span></h1>' +
          '<p style="font-size:15px;color:rgba(255,255,255,.38);margin:0 0 44px;line-height:1.7;animation:authFadeUp .65s .30s ease both">Track sales, manage invoices, monitor your pipeline — all in one place.</p>' +
          '<div style="display:flex;flex-direction:column;gap:11px">' +
            features.map(f =>
              '<div class="auth-feature-item" style="animation:authFadeUp .55s '+f.delay+' ease both">' +
                '<div style="width:42px;height:42px;border-radius:11px;background:'+f.bg+';border:1px solid '+f.bd+';display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0">'+f.ico+'</div>' +
                '<div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.9)">'+f.title+'</div><div style="font-size:12px;color:rgba(255,255,255,.32);margin-top:2px">'+f.sub+'</div></div>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      // ── Right panel ──
      '<div class="auth-desktop-right">' +
        '<div class="auth-desktop-right-glow"></div>' +
        '<div class="auth-desktop-right-inner" style="animation:authCardIn .65s .08s cubic-bezier(.22,1,.36,1) both">' +
          '<div style="margin-bottom:32px">' +
            '<div style="font-family:Outfit,sans-serif;font-size:30px;font-weight:800;color:#fff;margin-bottom:7px">Welcome back</div>' +
            '<div style="font-size:14px;color:rgba(255,255,255,.32)">Sign in to your H2 Line account</div>' +
          '</div>' +
          '<div class="auth-card">' + formHTML + '</div>' +
          '<div style="text-align:center;margin-top:22px;font-size:11px;color:rgba(255,255,255,.16);line-height:1.8">🔒 Secured by Firebase Authentication<br>Data encrypted and synced across devices</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── MOBILE: single column ──
  return '<div class="authbg">' +
    '<div class="auth-orb auth-orb1"></div>' +
    '<div class="auth-orb auth-orb2"></div>' +
    '<div class="auth-orb auth-orb3"></div>' +
    '<div style="width:100%;max-width:400px;position:relative;z-index:1">' +
      '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;animation:authFadeUp .55s ease both">' +
        '<img src="'+LOGO_AUTH+'" style="width:140px;height:auto;margin-bottom:12px;animation:authLogoFloat 5s ease-in-out infinite,authLogoBeat 3s ease-in-out infinite" alt="H2 Line">' +
        '<div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.7);font-family:Outfit,sans-serif;letter-spacing:.01em;animation:authFadeUp .5s .12s ease both">H2 Line</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,.3);font-weight:500;letter-spacing:.06em;margin-top:3px;animation:authFadeUp .5s .2s ease both">Distribution · Sales · Invoicing</div>' +
      '</div>' +
      '<div style="animation:authCardIn .55s .28s cubic-bezier(.22,1,.36,1) both"><div class="auth-card">' + formHTML + '</div></div>' +
      '<div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,.2);line-height:1.6;animation:authFadeUp .5s .48s ease both">' +
        '🔒 Secured by Firebase &nbsp;·&nbsp; Add to Home Screen for app experience' +
      '</div>' +
    '</div>' +
  '</div>';
}
function switchTab(m) {
  authMode = m;
  const nr = document.getElementById('name-row');
  const sub = document.getElementById('a-submit');
  const tl = document.getElementById('tab-login');
  const ts = document.getElementById('tab-signup');
  if (nr) nr.style.display = m === 'signup' ? 'flex' : 'none';
  const ir = document.getElementById('invite-row');
  if (ir) ir.style.display = m === 'signup' ? 'flex' : 'none';
  if (sub) sub.textContent = m === 'login' ? 'Log In' : m === 'signup' ? 'Create Account' : 'Send Reset Link';
  if (tl) {
    tl.style.background = m === 'login' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent';
    tl.style.color = m === 'login' ? '#fff' : 'rgba(255,255,255,.4)';
    tl.style.boxShadow = m === 'login' ? '0 2px 10px rgba(99,102,241,.4)' : 'none';
  }
  if (ts) {
    ts.style.background = m === 'signup' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent';
    ts.style.color = m === 'signup' ? '#fff' : 'rgba(255,255,255,.4)';
    ts.style.boxShadow = m === 'signup' ? '0 2px 10px rgba(99,102,241,.4)' : 'none';
  }
}
function togglePw() { const i = document.getElementById('a-pw'); if (i) i.type = i.type === 'password' ? 'text' : 'password'; }
function showAuthMsg(msg, ok=false) {
  const el = document.getElementById('a-msg');
  if (!el) return;
  el.style.display = 'block';
  el.style.background = ok ? 'var(--oks)' : 'var(--errs)';
  el.style.color = ok ? 'var(--ok)' : 'var(--err)';
  el.textContent = msg;
}
function doAuth() {
  const sub = document.getElementById('a-submit');
  if (sub) { sub.innerHTML = '<span class="spin"></span>'; sub.disabled = true; }

  if (!window.doFBLogin || !window.doFBSignup) {
    let waited = 0;
    const interval = setInterval(() => {
      waited += 100;
      if (window.doFBLogin && window.doFBSignup) {
        clearInterval(interval);
        _runAuth();
      } else if (waited >= 10000) {
        clearInterval(interval);
        if (sub) { sub.textContent = authMode === 'signup' ? 'Create Account' : 'Log In'; sub.disabled = false; }
        showAuthMsg('Connection timeout — check your internet and try again');
      }
    }, 100);
    return;
  }
  _runAuth();
}

function _runAuth() {
  if (authMode === 'signup') { window.doFBSignup(); return; }
  if (authMode === 'forgot') { window.doFBForgot(); return; }
  window.doFBLogin();
}
function bindAuth() {
  document.getElementById('a-pw')?.addEventListener('keydown', e => { if(e.key==='Enter') doAuth(); });
}
function logout() { if(window.doFBLogout) doFBLogout(); }

// ── ORG SETUP (join screen for users without an org) ─────────────────────────
function renderOrgSetup() {
  return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px">' +
    '<div style="width:100%;max-width:380px">' +
    '<div style="text-align:center;margin-bottom:32px">' +
    '<img src="'+LOGO_AUTH+'" style="width:100px;height:auto;margin-bottom:16px" alt="H2 Line">' +
    '<h2 style="font-family:Outfit,sans-serif;font-size:26px;font-weight:800;margin:0 0 8px;color:var(--t1)">Join Your Team</h2>' +
    '<p style="font-size:13px;color:var(--t2);margin:0;line-height:1.6">Enter the invite code from your organization admin</p>' +
    '</div>' +
    '<div class="card" style="padding:24px">' +
    '<div class="iw"><label class="il">Invite Code</label>' +
    '<input id="org-code" class="inp" style="text-transform:uppercase;font-size:22px;font-weight:800;letter-spacing:.15em;text-align:center" placeholder="XXXXXX" maxlength="10" onkeydown="if(event.key===\'Enter\')joinOrgWithCodeUI()"></div>' +
    '<div id="org-msg" style="display:none;padding:10px 13px;border-radius:var(--rx);font-size:13px;margin-bottom:12px"></div>' +
    '<button class="btn bp bw" style="height:50px;font-size:15px;font-weight:700" onclick="joinOrgWithCodeUI()">Join Organization</button>' +
    '</div>' +
    '<div style="text-align:center;margin-top:18px">' +
    '<button class="btn" style="background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer" onclick="logout()">Sign out of ' + esc(STATE.user?.email||'') + '</button>' +
    '</div>' +
    '</div></div>';
}
function joinOrgWithCodeUI() {
  const code=((document.getElementById('org-code')||{}).value||'').trim().toUpperCase();
  if(!code){showOrgMsg('Enter your invite code');return;}
  const btn=document.querySelector('[onclick="joinOrgWithCodeUI()"]');
  if(btn){btn.textContent='Joining...';btn.disabled=true;}
  if(window.joinOrgWithCode) window.joinOrgWithCode(code);
  else { if(btn){btn.textContent='Join Organization';btn.disabled=false;} showOrgMsg('Still connecting to Firebase…'); }
}
function showOrgMsg(msg,ok=false) {
  const el=document.getElementById('org-msg'); if(!el) return;
  el.style.display='block'; el.style.background=ok?'var(--oks)':'var(--errs)'; el.style.color=ok?'var(--ok)':'var(--err)'; el.textContent=msg;
}

// ── SUSPENDED SCREEN ──────────────────────────────────────────────────────────
function renderSuspended() {
  const reason = STATE.orgProfile?.suspendedReason || 'Non-payment';
  const orgName = STATE.orgProfile?.name || 'your organization';
  return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px">' +
    '<div style="width:100%;max-width:420px;text-align:center">' +
    '<div style="font-size:72px;margin-bottom:16px;animation:pulse 2s ease-in-out infinite">🚫</div>' +
    '<h2 style="font-family:Outfit,sans-serif;font-size:28px;font-weight:800;margin:0 0 10px;color:var(--err)">Account Suspended</h2>' +
    '<p style="font-size:14px;color:var(--t2);margin:0 0 20px;line-height:1.7">Access to <strong>'+esc(orgName)+'</strong> has been suspended by H2 Line.</p>' +
    '<div class="card" style="padding:18px;text-align:left;margin-bottom:20px">' +
      '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Reason</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--err)">'+esc(reason)+'</div>' +
    '</div>' +
    '<p style="font-size:13px;color:var(--t2);line-height:1.7">Please settle any outstanding payments and contact your H2 Line administrator to restore access.</p>' +
    '<button class="btn" style="background:none;border:none;color:var(--t3);font-size:12px;cursor:pointer;margin-top:20px" onclick="logout()">Sign out</button>' +
    '</div></div>';
}

// ── TOP BAR ──────────────────────────────────────────────────────────────────
function renderTopBar() {
  const labels = {dashboard:'Dashboard',sales:'Sales History',invoices:'Invoices',report:'Reports',shops:'Shops',items:'Items',importexport:'Import / Export',settings:'Settings',pending:'Pending Payments',alerts:'Alerts',activitylog:'Activity Log',platform:'Platform Admin'};
  const shareBtn = STATE.isViewer ? '' : '<button class="btn bic" onclick="openShareModal()" style="' + (SHARE.enabled?'background:var(--as);color:var(--a)':'') + '" title="Share">\uD83D\uDD17</button>';
  const viewerBadge = STATE.isViewer ? '<div class="viewer-badge">\uD83D\uDC41 VIEWER</div>' : '';
  const syncPending = db.get('syncPending', false);
  const syncDot = STATE.isAdmin ? '<div title="' + (syncPending ? 'Pending sync — will upload when online' : 'Synced to cloud') + '" style="width:7px;height:7px;border-radius:50%;background:' + (syncPending ? 'var(--warn)' : 'var(--ok)') + ';flex-shrink:0;' + (syncPending ? 'animation:pulse 2s infinite' : '') + '"></div>' : '';
  return '<div id="topbar">' +
    '<img src="'+LOGO_AUTH+'" style="height:28px;width:auto;object-fit:contain;max-width:90px" alt="H2 Line">' +
    '<div style="width:1px;height:14px;background:var(--b)"></div>' +
    '<div style="font-size:13px;color:var(--t2);font-weight:500;flex:1;display:flex;align-items:center;gap:6px">' + (labels[STATE.page]||STATE.page) + syncDot + '</div>' +
    shareBtn +
    '<button class="btn bic" onclick="goPage(\'items\')" style="' + (STATE.page==='items'?'background:var(--as);color:var(--a)':'') + '" title="Items">' + IC.items + '</button>' +
    '<button class="btn bic" onclick="goPage(\'report\')" style="' + (STATE.page==='report'?'background:var(--as);color:var(--a)':'') + '" title="Reports">' + IC.report + '</button>' +
    '<button class="btn bic" onclick="goPage(\'settings\')" style="' + (STATE.page==='settings'?'background:var(--as);color:var(--a)':'') + '">' + IC.cog + '</button>' +
    '</div>' + viewerBadge;
}

// ── NAV ──────────────────────────────────────────────────────────────────────
function renderNav() {
  // Use only the current user's visible sales for badge counts
  const visibleSales = STATE.isAdmin ? STATE.sales : getVisibleSalesForUser();
  const pendingCount = (() => {
    const imap={};
    visibleSales.forEach(s=>{const k=s.invoiceId||(s.shopName+'-'+s.date);if(!imap[k])imap[k]={f:0,p:0};imap[k].f+=(parseFloat(s.finalTotal)||0);if(s.paymentStatus==='Paid')imap[k].p+=(parseFloat(s.finalTotal)||0);});
    return Object.values(imap).filter(i=>i.p<i.f&&i.f>0).length;
  })();
  const alertsDue = getAlerts().filter(a=>!a.done&&a.dueDate&&a.dueDate<=new Date().toISOString().split('T')[0]).length;

  // Agents only see: Home, Sales, Invoices, Pending, Shops, Items
  // Admins see everything
  const tabs = STATE.isAdmin ? [
    {id:'dashboard',ico:IC.home,lbl:'Home'},
    {id:'sales',ico:IC.sales,lbl:'Sales'},
    {id:'invoices',ico:IC.inv,lbl:'Invoices'},
    {id:'pending',ico:IC.pending,lbl:'Pending',badge:pendingCount},
    {id:'shops',ico:IC.shop,lbl:'Shops'},
    {id:'agents',ico:IC.agents,lbl:'Agents'},
    {id:'alerts',ico:IC.bell,lbl:'Alerts',badge:alertsDue},
    {id:'activitylog',ico:IC.log,lbl:'Log'},
    ...(STATE.isSuperAdmin ? [{id:'platform',ico:IC.platform,lbl:'Platform'}] : []),
  ] : [
    {id:'dashboard',ico:IC.home,lbl:'Home'},
    {id:'sales',ico:IC.sales,lbl:'My Sales'},
    {id:'pending',ico:IC.pending,lbl:'Pending',badge:pendingCount},
    {id:'nearby',ico:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',lbl:'Nearby'},
    {id:'map',ico:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',lbl:'Map'},
    {id:'shops',ico:IC.shop,lbl:'Shops'},
    {id:'checkins',ico:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',lbl:'Visits'},
  ];

  return '<nav id="bottomnav">' + tabs.map(t =>
    '<button class="nb' + (STATE.page===t.id?' on':'') + '" onclick="goPage(\'' + t.id + '\')" style="position:relative">' +
    t.ico + '<span>' + t.lbl + '</span>' +
    (t.badge ? '<span style="position:absolute;top:2px;right:calc(50% - 18px);background:var(--warn);color:#000;border-radius:99px;font-size:8px;font-weight:800;padding:1px 4px;min-width:14px;text-align:center">' + t.badge + '</span>' : '') +
    '<div class="ndot"></div></button>'
  ).join('') + '</nav>';
}
function renderFab() {
  if (['settings','importexport'].includes(STATE.page)) return '';
  if (!STATE.isAdmin && !STATE.isAgent) return '';
  return '<button id="fab" onclick="openAddSale()">' + IC.plus + '</button>';
}
function goPage(p) {
  if (p !== STATE.page) {
    invDetail = null;
    agentDetail = null;
    shopsMassMode = false; selectedShops.clear();
    itemsMassMode = false; selectedItems.clear();
    salesMassMode = false; selectedSales.clear(); expandedInvoices.clear();
    if (p !== 'shops' && typeof shopsView !== 'undefined') shopsView = 'cards';
  }
  STATE.page = p;
  STATE.modal = null;
  setTimeout(() => { const c = document.getElementById('content'); if(c) c.scrollTop = 0; }, 10);
  render();
}

function bootLocalAuth() {
  // No Firebase — use localStorage auth
  const saved = db.get('user');
  if (saved) {
    STATE.user = saved;
    STATE.isAdmin = saved.email === ADMIN_EMAIL || saved.role === 'admin';
    STATE.isAgent = !STATE.isAdmin;
    STATE.agentId = null;
    STATE.sales = db.get('sales',[]).map(normalizeSaleGSTRow);
    STATE.items = db.get('items',[]);
    STATE.shops = db.get('shops',[]);
    STATE.agents = db.get('agents',[]);
    STATE.targets = db.get('targets',[]);
    if(!STATE.isAdmin){ const a=STATE.agents.find(a=>a.email===saved.email); if(a) STATE.agentId=a.id; }
  }
  window.saveToFirestore = ()=>{};
  window.doFBLogin = function() {
    const email=((document.getElementById('a-email')||{}).value||'').trim();
    const pw=(document.getElementById('a-pw')||{}).value||'';
    const sub=document.getElementById('a-submit');
    if(!email||!pw){showAuthMsg('Enter email and password');return;}
    const users=db.get('users',[]);
    const u=users.find(x=>x.email===email&&x.password===pw);
    if(u){ db.set('user',u); STATE.user=u; STATE.isAdmin=u.email===ADMIN_EMAIL||u.role==='admin'; STATE.isAgent=!STATE.isAdmin;
      STATE.sales=db.get('sales',[]).map(normalizeSaleGSTRow); STATE.items=db.get('items',[]); STATE.shops=db.get('shops',[]); STATE.agents=db.get('agents',[]); STATE.targets=db.get('targets',[]); render();
      setTimeout(()=>{ showToast('👋 Welcome back, ' + (u.name||'there') + '!'); logActivity('login', (u.name||'User') + ' logged in'); }, 400);
    } else { if(sub){sub.textContent='Log In';sub.disabled=false;} showAuthMsg('Wrong email or password'); }
  };
  window.doFBSignup = function() {
    const name=((document.getElementById('a-name')||{}).value||'').trim();
    const email=((document.getElementById('a-email')||{}).value||'').trim();
    const pw=(document.getElementById('a-pw')||{}).value||'';
    const sub=document.getElementById('a-submit');
    if(!name||!email||!pw){showAuthMsg('Fill all fields');return;}
    const users=db.get('users',[]);
    if(users.find(u=>u.email===email)){ if(sub){sub.textContent='Create Account';sub.disabled=false;} showAuthMsg('Email already registered — try Log In'); return; }
    const isAdmin=email===ADMIN_EMAIL;
    const nu={id:uid(),name,email,password:pw,role:isAdmin?'admin':'agent',approved:isAdmin};
    db.set('users',[...users,nu]); db.set('user',nu); STATE.user=nu; STATE.isAdmin=isAdmin; STATE.isAgent=!isAdmin;
    STATE.sales=db.get('sales',[]).map(normalizeSaleGSTRow); STATE.items=db.get('items',[]); STATE.shops=db.get('shops',[]); STATE.agents=db.get('agents',[]); STATE.targets=db.get('targets',[]); render();
  };
  window.doFBLogout = function() { if(!confirm('Sign out?')) return; db.set('user',null); STATE.user=null; STATE.isAdmin=false; STATE.isAgent=false; render(); };
  window.doFBForgot = function() { showAuthMsg('Reset not available offline'); };
  render();
}
