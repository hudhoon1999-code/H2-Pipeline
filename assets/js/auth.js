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
      '<div id="a-msg" style="display:none;padding:10px 13px;border-radius:var(--rx);font-size:13px"></div>' +
      '<button id="a-submit" onclick="doAuth()" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;border:none;border-radius:var(--rs);padding:13px 20px;font-size:15px;font-weight:700;cursor:pointer;width:100%;height:50px;box-shadow:0 6px 22px rgba(99,102,241,.45);transition:all .2s;font-family:Nunito,sans-serif">Log In</button>' +
      '<button onclick="switchTab(\'forgot\')" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);font-size:12px;font-weight:500;width:100%;text-align:center;padding:4px;font-family:Nunito,sans-serif">Forgot password?</button>' +
    '</div>';

  // ── DESKTOP: two-column split layout ──
  if (isDesktop()) {
    return '<div style="min-height:100vh;display:flex;background:#05050F;position:relative;overflow:hidden">' +
      // Background effects — full page
      '<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 70% at 25% 50%,rgba(99,102,241,.18) 0%,transparent 60%),radial-gradient(ellipse 50% 60% at 80% 50%,rgba(139,92,246,.12) 0%,transparent 55%);pointer-events:none;z-index:0"></div>' +
      '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0"></div>' +

      // Left panel — brand (55% width)
      '<div style="flex:0 0 55%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 72px;position:relative;z-index:1;border-right:1px solid rgba(255,255,255,.06);min-height:100vh">' +
        '<div style="width:100%;max-width:440px">' +
          '<img src="'+LOGO_AUTH+'" style="width:200px;height:auto;margin-bottom:24px;filter:drop-shadow(0 10px 40px rgba(99,102,241,.55))" alt="H2 Line">' +
          '<div style="font-family:Outfit,sans-serif;font-size:38px;font-weight:800;color:#fff;line-height:1.15;margin-bottom:12px">Your distribution<br>business, <span style="background:linear-gradient(135deg,#6366F1,#8B5CF6,#06B6D4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">simplified.</span></div>' +
          '<div style="font-size:15px;color:rgba(255,255,255,.4);margin-bottom:48px;line-height:1.6">Track sales, manage invoices, monitor your pipeline — all in one place.</div>' +
          '<div style="display:flex;flex-direction:column;gap:14px">' +
            '<div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 20px;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(99,102,241,.4)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,.08)\'">' +
              '<div style="width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">📊</div>' +
              '<div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.9)">Real-time Dashboard</div><div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:2px">Live sales, GST tracking & pipeline analytics</div></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 20px;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(16,185,129,.4)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,.08)\'">' +
              '<div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🧾</div>' +
              '<div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.9)">Invoice Generation</div><div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:2px">Professional PDF invoices with GST @ 8%</div></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 20px;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(139,92,246,.4)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,.08)\'">' +
              '<div style="width:40px;height:40px;border-radius:10px;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🤖</div>' +
              '<div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.9)">AI Invoice Scanning</div><div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:2px">Scan Lotus invoices — photo to data instantly</div></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px 20px;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(14,165,233,.4)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,.08)\'">' +
              '<div style="width:40px;height:40px;border-radius:10px;background:rgba(14,165,233,.15);border:1px solid rgba(14,165,233,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">☁️</div>' +
              '<div><div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.9)">Cloud Sync</div><div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:2px">Firebase-powered, syncs across all your devices</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Right panel — form (45% width)
      '<div style="flex:0 0 45%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 72px;position:relative;z-index:1;min-height:100vh">' +
        '<div style="width:100%;max-width:380px">' +
          '<div style="margin-bottom:32px">' +
            '<div style="font-family:Outfit,sans-serif;font-size:28px;font-weight:800;color:#fff;margin-bottom:6px">Welcome back</div>' +
            '<div style="font-size:14px;color:rgba(255,255,255,.35)">Sign in to your H2 Line account</div>' +
          '</div>' +
          '<div class="auth-card">' + formHTML + '</div>' +
          '<div style="text-align:center;margin-top:20px;font-size:11px;color:rgba(255,255,255,.18);line-height:1.8">' +
            '🔒 Secured by Firebase Authentication<br>Data encrypted and synced across devices' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ── MOBILE: single column ──
  return '<div class="authbg">' +
    '<div class="auth-orb auth-orb1"></div>' +
    '<div class="auth-orb auth-orb2"></div>' +
    '<div class="auth-orb auth-orb3"></div>' +
    '<div style="width:100%;max-width:400px;position:relative;z-index:1" class="fu">' +
      '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px">' +
        '<img src="'+LOGO_AUTH+'" style="width:160px;height:auto;margin-bottom:10px;filter:drop-shadow(0 6px 24px rgba(99,102,241,.5))" alt="H2 Line">' +
        '<div style="font-size:12px;color:rgba(255,255,255,.35);font-weight:500;letter-spacing:.04em">Distribution · Sales · Invoicing</div>' +
      '</div>' +
      '<div class="auth-card">' + formHTML + '</div>' +
      '<div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,.22);line-height:1.6">' +
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

// ── TOP BAR ──────────────────────────────────────────────────────────────────
function renderTopBar() {
  const labels = {dashboard:'Dashboard',sales:'Sales History',invoices:'Invoices',report:'Reports',shops:'Shops',items:'Items',importexport:'Import / Export',settings:'Settings',pending:'Pending Payments',alerts:'Alerts'};
  const shareBtn = STATE.isViewer ? '' : '<button class="btn bic" onclick="openShareModal()" style="' + (SHARE.enabled?'background:var(--as);color:var(--a)':'') + '" title="Share">\uD83D\uDD17</button>';
  const viewerBadge = STATE.isViewer ? '<div class="viewer-badge">\uD83D\uDC41 VIEWER</div>' : '';
  const syncPending = db.get('syncPending', false);
  const syncDot = STATE.isAdmin ? '<div title="' + (syncPending ? 'Pending sync — will upload when online' : 'Synced to cloud') + '" style="width:7px;height:7px;border-radius:50%;background:' + (syncPending ? 'var(--warn)' : 'var(--ok)') + ';flex-shrink:0;' + (syncPending ? 'animation:pulse 2s infinite' : '') + '"></div>' : '';
  return '<div id="topbar">' +
    '<div style="font-family:Outfit,sans-serif;font-weight:800;font-size:18px;color:var(--a)">H2 Line</div>' +
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
    {id:'importexport',ico:IC.ul,lbl:'Data'},
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
  }
  STATE.page = p;
  STATE.modal = null;
  setTimeout(() => { const c = document.getElementById('content'); if(c) c.scrollTop = 0; }, 10);
  render();
}