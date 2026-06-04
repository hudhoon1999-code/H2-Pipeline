'use strict';
// ── RENDER + NAV + ROUTER ─────────────────────────────────────────────────
const isDesktop = () => window.innerWidth >= 900;

// Track last rendered page to animate only on real page changes
let _lastRenderedPage = null;
// Debounce rapid render calls (e.g. from Firestore snapshots) into one RAF
let _renderRAF = null;
function scheduleRender() {
  if (_renderRAF) cancelAnimationFrame(_renderRAF);
  _renderRAF = requestAnimationFrame(() => { _renderRAF = null; render(); });
}

// ── PARTIAL-RENDER HELPERS ────────────────────────────────────────────────
// Sync only the modal overlay — add/replace/remove without touching the rest
function _syncModal(root) {
  const existing = document.getElementById('modal-overlay');
  if (STATE.modal) {
    if (existing) { existing.outerHTML = renderModal(); }
    else { root.insertAdjacentHTML('beforeend', renderModal()); }
  } else if (existing) { existing.remove(); }
}

// Desktop: keep sidebar (#ds) stable, replace only the main content area (#dm)
function _patchDesktop(root) {
  // Recompute badge counts and sync sidebar state without DOM replacement
  const imap = {};
  getVisibleSalesForUser().forEach(s => { const k = s.invoiceId||(s.shopName+'-'+s.date); if(!imap[k]) imap[k]={f:0,p:0}; imap[k].f += saleFinalTotal(s); if(s.paymentStatus==='Paid') imap[k].p += saleFinalTotal(s); });
  const pendingCnt = Object.values(imap).filter(i => i.p < i.f && i.f > 0).length;
  const alertsCnt  = getAlerts().filter(a => !a.done && a.dueDate && a.dueDate <= new Date().toISOString().split('T')[0]).length;
  document.querySelectorAll('#ds-nav .snb').forEach(b => {
    const m = (b.getAttribute('onclick')||'').match(/goPage\('(\w+)'\)/);
    const pg = m && m[1];
    b.classList.toggle('on', pg === STATE.page);
    if (!pg) return;
    const cnt = pg === 'pending' ? pendingCnt : pg === 'alerts' ? alertsCnt : 0;
    let badge = b.querySelector('.snb-badge');
    if (cnt > 0) {
      if (!badge) { badge = document.createElement('span'); badge.className = 'snb-badge'; b.appendChild(badge); }
      badge.textContent = cnt;
    } else if (badge) { badge.remove(); }
  });
  // Replace main area (header + content) — sidebar never touched
  const dm = document.getElementById('dm');
  if (!dm) { root.innerHTML = renderDesktopShell(); _lastRenderedPage = STATE.page; return; }
  // Only animate when the page actually changes — avoids data-refresh flicker
  const pageChanged = STATE.page !== _lastRenderedPage;
  _lastRenderedPage = STATE.page;
  dm.innerHTML = renderDesktopHeader() + '<div id="content"' + (pageChanged ? ' class="page-in"' : '') + '>' + renderPage() + '</div>';
  // Sync FAB
  const showFab = !STATE.isViewer && !['settings','importexport'].includes(STATE.page);
  const fab = document.getElementById('fab');
  if (showFab && !fab) root.insertAdjacentHTML('beforeend', '<button id="fab" onclick="openAddSale()">' + IC.plus + '</button>');
  else if (!showFab && fab) fab.remove();
  _syncModal(root);
}

// Mobile: replace topbar + nav (small, no visible flash) and content only
function _patchMobile(root) {
  const topbar = document.getElementById('topbar');
  if (topbar) topbar.outerHTML = renderTopBar();
  const nav = document.getElementById('bottomnav');
  if (nav) nav.outerHTML = renderNav();
  const content = document.getElementById('content');
  if (content) {
    const pageChanged = STATE.page !== _lastRenderedPage;
    _lastRenderedPage = STATE.page;
    if (pageChanged) content.className = 'page-in';
    content.innerHTML = renderPage();
  }
  _syncModal(root);
}

// ── RENDER ────────────────────────────────────────────────────────────────
function render() {
  const root = document.getElementById('app');
  if (!root) return;
  document.body.className = STATE.dark ? 'dark' : 'light';
  if (!STATE.user) { _lastRenderedPage = null; root.innerHTML = renderAuth(); bindAuth(); return; }
  if (!STATE.orgId && window._fbDb && !STATE.isSuperAdmin) { _lastRenderedPage = null; root.innerHTML = renderOrgSetup(); return; }
  if (STATE.orgProfile?.status === 'suspended' && !STATE.isSuperAdmin) { _lastRenderedPage = null; root.innerHTML = renderSuspended(); return; }
  if (isDesktop()) {
    if (document.getElementById('ds')) { _patchDesktop(root); }
    else { _lastRenderedPage = null; root.innerHTML = renderDesktopShell(); }
  } else {
    if (!document.getElementById('ds') && document.getElementById('bottomnav')) { _patchMobile(root); }
    else {
      // First full mobile build — mark page so next patch won't animate
      const viewerFab = STATE.isViewer ? '' : renderFab();
      _lastRenderedPage = STATE.page;
      root.innerHTML = renderTopBar() + '<div id="content" class="page-in">' + renderPage() + '</div>' + viewerFab + renderNav() + (STATE.modal ? renderModal() : '');
    }
  }
  bindPage();
  if (STATE.modal) bindModal();
}

function renderDesktopHeader() {
  const labels = {dashboard:'Dashboard',sales:'Sales History',invoices:'Invoices',report:'Reports',shops:'Shops',items:'Items',agents:'Agents',importexport:'Import / Export',settings:'Settings',pending:'Pending Payments',alerts:'Alerts',activitylog:'Activity Log',platform:'Platform Admin'};
  const _vs  = getVisibleSalesForUser();
  const tot  = _vs.reduce((a,r) => a + saleFinalTotal(r), 0);
  const pend = _vs.filter(r => r.paymentStatus === 'Pending').reduce((a,r) => a + saleFinalTotal(r), 0);
  const pageLabel = labels[STATE.page] || STATE.page;
  return '<div id="dm-header">' +
    '<h2>' + pageLabel + '</h2>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="font-size:11px;color:var(--t2)">Total: <span style="font-weight:700;color:var(--a)">' + money(tot) + '</span></div>' +
      '<div style="width:1px;height:12px;background:var(--b)"></div>' +
      '<div style="font-size:11px;color:var(--t2)">Pending: <span style="font-weight:700;color:var(--warn)">' + money(pend) + '</span></div>' +
      '<div style="width:1px;height:12px;background:var(--b)"></div>' +
      '<div style="font-size:11px;color:var(--t3)">' + new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}) + '</div>' +
    '</div>' +
  '</div>';
}

function renderDesktopShell() {
  const pendingCount = (() => {
    const imap={};
    getVisibleSalesForUser().forEach(s=>{const k=s.invoiceId||(s.shopName+'-'+s.date);if(!imap[k])imap[k]={f:0,p:0};imap[k].f+=saleFinalTotal(s);if(s.paymentStatus==='Paid')imap[k].p+=saleFinalTotal(s);});
    return Object.values(imap).filter(i=>i.p<i.f&&i.f>0).length;
  })();
  const alertsDue = getAlerts().filter(a=>!a.done&&a.dueDate&&a.dueDate<=new Date().toISOString().split('T')[0]).length;

  const navGroups = [
    { section: 'Overview', items: [
      {id:'dashboard',ico:IC.home,lbl:'Dashboard'},
      {id:'report',ico:IC.report,lbl:'Reports'},
    ]},
    { section: 'Sales', items: [
      {id:'sales',ico:IC.sales,lbl:'Sales History'},
      {id:'invoices',ico:IC.inv,lbl:'Invoices'},
      {id:'pending',ico:IC.pending,lbl:'Pending',badge:pendingCount},
    ]},
    { section: 'Catalogue', items: [
      {id:'shops',ico:IC.shop,lbl:'Shops'},
      {id:'items',ico:IC.items,lbl:'Items'},
      ...(STATE.isAdmin ? [{id:'agents',ico:IC.agents,lbl:'Agents'}] : []),
    ]},
    { section: 'Manage', items: [
      {id:'alerts',ico:IC.bell,lbl:'Alerts',badge:alertsDue},
      {id:'importexport',ico:IC.ul,lbl:'Import / Export'},
      {id:'activitylog',ico:IC.log,lbl:'Activity Log'},
      {id:'settings',ico:IC.cog,lbl:'Settings'},
      ...(STATE.isSuperAdmin ? [{id:'platform',ico:IC.platform,lbl:'Platform Admin'}] : []),
    ]},
  ];

  const biz = db.get('bizProfile',{name:'Lotus Fihaara'});
  const sidebar = '<div id="ds">' +
    '<div id="ds-logo">' +
      '<img src="'+LOGO_AUTH+'" style="height:38px;width:auto;object-fit:contain;max-width:110px" alt="H2 Line">' +
    '</div>' +
    '<div id="ds-nav">' +
    navGroups.map(g =>
      '<div class="snb-section">' + g.section + '</div>' +
      g.items.map(t =>
        '<button class="snb' + (STATE.page===t.id?' on':'') + '" onclick="goPage(\'' + t.id + '\')">' +
        t.ico +
        '<span>' + t.lbl + '</span>' +
        (t.badge ? '<span class="snb-badge">' + t.badge + '</span>' : '') +
        '</button>'
      ).join('')
    ).join('') +
    '</div>' +
    '<div id="ds-footer">' +
      (STATE.isSuperAdmin ? '<div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:8px;padding:6px;margin-bottom:8px">' +
        '<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;padding:0 2px">View Mode</div>' +
        '<div style="display:flex;gap:4px">' +
          '<button onclick="setSuperAdminMode(\'platform\')" style="flex:1;padding:5px 0;border:none;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;' + (STATE.superAdminViewMode==='platform'?'background:rgba(255,255,255,.25);color:#fff':'background:rgba(255,255,255,.08);color:rgba(255,255,255,.55)') + '">⚡ Platform</button>' +
          '<button onclick="setSuperAdminMode(\'company\')" style="flex:1;padding:5px 0;border:none;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;' + (STATE.superAdminViewMode==='company'?'background:rgba(255,255,255,.25);color:#fff':'background:rgba(255,255,255,.08);color:rgba(255,255,255,.55)') + '">🏢 Admin</button>' +
          '<button onclick="setSuperAdminMode(\'agent\')" style="flex:1;padding:5px 0;border:none;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;' + (STATE.superAdminViewMode==='agent'?'background:rgba(255,255,255,.25);color:#fff':'background:rgba(255,255,255,.08);color:rgba(255,255,255,.55)') + '">👤 Agent</button>' +
        '</div>' +
      '</div>' : '') +
      '<div style="display:flex;align-items:center;gap:8px;padding:6px 6px 8px">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:' + (STATE.isSuperAdmin?'linear-gradient(135deg,#6366F1,#8B5CF6)':STATE.isAdmin?'linear-gradient(135deg,var(--a),var(--gst))':'var(--as)') + ';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;flex-shrink:0">' + (STATE.user?.name||'U')[0].toUpperCase() + '</div>' +
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (STATE.user?.name||'User') + '</div>' +
        '<div style="font-size:9px;margin-top:1px">' + (STATE.isSuperAdmin?'<span style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;padding:1px 6px;border-radius:99px;font-weight:700">⚡ Super Admin</span>':STATE.isAdmin?'<span style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:1px 6px;border-radius:99px;font-weight:700">Admin</span>':'<span style="color:var(--t3);font-weight:600">Agent</span>') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn bic" style="flex:1;height:32px" onclick="openShareModal()" title="Share">' + IC.share + '</button>' +
        '<button class="btn bic" style="flex:1;height:32px" onclick="setTheme(!STATE.dark)" title="Theme">' + (STATE.dark?IC.sun:IC.moon) + '</button>' +
        (STATE.isAdmin&&STATE.superAdminViewMode!=='platform'?'<button class="btn bp" style="flex:2;height:32px;font-size:12px;padding:0 10px" onclick="openAddSale()">+ Sale</button>':STATE.isAdmin?'':'') +
      '</div>' +
    '</div>' +
  '</div>';

  const header = renderDesktopHeader();

  const fab = !STATE.isViewer && !['settings','importexport'].includes(STATE.page)
    ? '<button id="fab" onclick="openAddSale()">' + IC.plus + '</button>'
    : '';

  return sidebar +
    '<div id="dm">' +
    header +
    '<div id="content" class="page-in">' + renderPage() + '</div>' +
    '</div>' +
    fab +
    (STATE.modal ? renderModal() : '');
}

function closeModal() { STATE.modal=null; render(); }

// ── PAGE ROUTER ──────────────────────────────────────────────────────────────
// Pages accessible by agents (non-admin)
const AGENT_PAGES = new Set(['dashboard','sales','invoices','pending','shops','items','checkins','nearby','map','settings','activitylog']);

function renderPage() {
  // Block agents from admin-only pages
  if (!STATE.isAdmin && STATE.isAgent && !AGENT_PAGES.has(STATE.page)) {
    return renderDashboard();
  }
  const _banner = typeof renderSuperAdminModeBanner === 'function' ? renderSuperAdminModeBanner() : '';
  const _content = (() => { switch(STATE.page) {
    case 'checkins': return renderMyCheckins();
    case 'nearby': return renderNearbyShops();
    case 'map': return renderMapPage();
    case 'agents': return renderAgentsPage();
    case 'alerts': return renderAlertsPage();
    case 'pending': return renderPendingPage();
    case 'dashboard': return renderDashboard();
    case 'sales': return renderSalesPage();
    case 'invoices': return renderInvoices();
    case 'report': return STATE.isAdmin ? renderReport() : renderDashboard();
    case 'shops': return renderShops();
    case 'items': return renderItems();
    case 'importexport': return STATE.isAdmin ? renderImportExport() : renderDashboard();
    case 'activitylog': return renderActivityLogPage();
    case 'settings': return renderSettings();
    case 'platform': return renderPlatformPage();
    default: return renderDashboard();
  }})();
  return _banner + _content;
}
function bindPage() {
  if (STATE.page==='sales') bindSales();
  else if (STATE.page==='shops') bindShops();
  else if (STATE.page==='items') bindItems();
  else if (STATE.page==='map') bindMapPage();
  else if (STATE.page==='agents' && STATE.isAdmin) loadUsers();
  else if (STATE.page==='platform') {
    if (typeof _platformDetail !== 'undefined' && _platformDetail) {
      loadPlatformPayments(_platformDetail);
      loadPlatformActivityLog(_platformDetail);
    } else loadPlatformOrgs();
  }
}
