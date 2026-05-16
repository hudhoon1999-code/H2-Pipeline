'use strict';
// ── RENDER + NAV + ROUTER ─────────────────────────────────────────────────
const isDesktop = () => window.innerWidth >= 900;

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
  STATE.sales.forEach(s => { const k = s.invoiceId||(s.shopName+'-'+s.date); if(!imap[k]) imap[k]={f:0,p:0}; imap[k].f += saleFinalTotal(s); if(s.paymentStatus==='Paid') imap[k].p += saleFinalTotal(s); });
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
  if (!dm) { root.innerHTML = renderDesktopShell(); return; }
  dm.innerHTML = renderDesktopHeader() + '<div id="content" class="page-in">' + renderPage() + '</div>';
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
  if (content) content.innerHTML = renderPage();
  _syncModal(root);
}

// ── RENDER ────────────────────────────────────────────────────────────────
function render() {
  const root = document.getElementById('app');
  if (!root) return;
  document.body.className = STATE.dark ? 'dark' : 'light';
  if (!STATE.user) { root.innerHTML = renderAuth(); bindAuth(); return; }
  if (isDesktop()) {
    if (document.getElementById('ds')) { _patchDesktop(root); }
    else { root.innerHTML = renderDesktopShell(); }
  } else {
    if (!document.getElementById('ds') && document.getElementById('bottomnav')) { _patchMobile(root); }
    else {
      const viewerFab = STATE.isViewer ? '' : renderFab();
      root.innerHTML = renderTopBar() + '<div id="content" class="page-in">' + renderPage() + '</div>' + viewerFab + renderNav() + (STATE.modal ? renderModal() : '');
    }
  }
  bindPage();
  if (STATE.modal) bindModal();
}

function renderDesktopHeader() {
  const labels = {dashboard:'Dashboard',sales:'Sales History',invoices:'Invoices',report:'Reports',shops:'Shops',items:'Items',agents:'Agents',importexport:'Import / Export',settings:'Settings',pending:'Pending Payments',alerts:'Alerts'};
  const tot  = STATE.sales.reduce((a,r) => a + saleFinalTotal(r), 0);
  const pend = STATE.sales.filter(r => r.paymentStatus === 'Pending').reduce((a,r) => a + saleFinalTotal(r), 0);
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
    STATE.sales.forEach(s=>{const k=s.invoiceId||(s.shopName+'-'+s.date);if(!imap[k])imap[k]={f:0,p:0};imap[k].f+=saleFinalTotal(s);if(s.paymentStatus==='Paid')imap[k].p+=saleFinalTotal(s);});
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
      {id:'settings',ico:IC.cog,lbl:'Settings'},
    ]},
  ];

  const biz = db.get('bizProfile',{name:'H2 Line'});
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
      '<div style="display:flex;align-items:center;gap:8px;padding:6px 6px 8px">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:' + (STATE.isAdmin?'linear-gradient(135deg,var(--a),var(--gst))':'var(--as)') + ';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;flex-shrink:0">' + (STATE.user?.name||'U')[0].toUpperCase() + '</div>' +
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (STATE.user?.name||'User') + '</div>' +
        '<div style="font-size:9px;margin-top:1px">' + (STATE.isAdmin?'<span style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:1px 6px;border-radius:99px;font-weight:700">⚡ Admin</span>':'<span style="color:var(--t3);font-weight:600">Viewer</span>') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn bic" style="flex:1;height:32px" onclick="openShareModal()" title="Share">' + IC.share + '</button>' +
        '<button class="btn bic" style="flex:1;height:32px" onclick="setTheme(!STATE.dark)" title="Theme">' + (STATE.dark?IC.sun:IC.moon) + '</button>' +
        (STATE.isAdmin?'<button class="btn bp" style="flex:2;height:32px;font-size:12px;padding:0 10px" onclick="openAddSale()">+ Sale</button>':'') +
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
const AGENT_PAGES = new Set(['dashboard','sales','invoices','pending','shops','items','checkins','nearby','map','settings']);

function renderPage() {
  // Block agents from admin-only pages
  if (!STATE.isAdmin && STATE.isAgent && !AGENT_PAGES.has(STATE.page)) {
    return renderDashboard();
  }
  switch(STATE.page) {
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
    case 'settings': return renderSettings();
    default: return renderDashboard();
  }
}
function bindPage() {
  if (STATE.page==='sales') bindSales();
  else if (STATE.page==='shops') bindShops();
  else if (STATE.page==='items') bindItems();
  else if (STATE.page==='map') bindMapPage();
  else if (STATE.page==='nearby') {} // no binding needed
}
