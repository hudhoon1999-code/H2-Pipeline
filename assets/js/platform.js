'use strict';
// ── PLATFORM SUPER ADMIN ──────────────────────────────────────────────────────
// Only accessible by STATE.isSuperAdmin (hudhoon1999@gmail.com)

let _platformDetail = null; // orgId of currently viewed company, null = list view
let _platformFilter = 'all';
let _platformSearch = '';
let _platformOrgs = [];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function _isOverdue(org) {
  if (org.status === 'suspended' || org.status === 'cancelled') return false;
  const nb = org.billing?.nextBillDate;
  return nb ? nb < new Date().toISOString().split('T')[0] : false;
}
function _orgStatus(org) {
  if (org.status === 'suspended') return {label:'🚫 Suspended', color:'var(--err)', bg:'var(--errs)'};
  if (org.status === 'trial')     return {label:'🔄 Trial',     color:'var(--case)', bg:'rgba(14,165,233,.12)'};
  if (org.status === 'cancelled') return {label:'✕ Cancelled',  color:'var(--t3)',   bg:'var(--s2)'};
  if (_isOverdue(org))            return {label:'⚠️ Overdue',   color:'var(--warn)', bg:'var(--warns)'};
  return                                 {label:'✓ Active',      color:'var(--ok)',   bg:'var(--oks)'};
}
function _statCard(label, value, color) {
  return '<div class="card" style="text-align:center;padding:14px">' +
    '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">'+label+'</div>' +
    '<div style="font-size:26px;font-weight:800;color:'+color+'">'+value+'</div>' +
  '</div>';
}
function _miniStat(label, value, color) {
  return '<div style="background:var(--s2);border-radius:var(--rs);padding:10px;text-align:center">' +
    '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;margin-bottom:3px">'+label+'</div>' +
    '<div style="font-size:13px;font-weight:800;color:'+color+'">'+value+'</div>' +
  '</div>';
}

// ── LIST VIEW ─────────────────────────────────────────────────────────────────
function renderPlatformPage() {
  if (!STATE.isSuperAdmin) return renderDashboard();
  if (_platformDetail) return _renderPlatformDetail(_platformDetail);

  const cos = _platformOrgs;
  const active    = cos.filter(o => (o.status==='active'||!o.status) && !_isOverdue(o)).length;
  const overdue   = cos.filter(o => _isOverdue(o)).length;
  const suspended = cos.filter(o => o.status==='suspended').length;
  const trial     = cos.filter(o => o.status==='trial').length;
  const revenue   = cos.filter(o => o.status!=='suspended'&&o.status!=='cancelled').reduce((s,o)=>s+(parseFloat(o.billing?.monthlyFee)||0),0);

  return '<div class="fu">' +
    // Mode switcher
    '<div style="display:flex;gap:6px;margin-bottom:16px;background:var(--s2);padding:5px;border-radius:10px">' +
      '<button class="chip on" style="flex:1;font-size:11px;font-weight:700" onclick="setSuperAdminMode(\'platform\')">⚡ Platform</button>' +
      '<button class="chip" style="flex:1;font-size:11px" onclick="setSuperAdminMode(\'company\')">🏢 Admin</button>' +
      '<button class="chip" style="flex:1;font-size:11px" onclick="setSuperAdminMode(\'agent\')">👤 Agent</button>' +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">' +
      '<div><h1 style="font-size:22px;font-weight:800">Platform Admin</h1>' +
      '<div style="font-size:12px;color:var(--t2)">'+cos.length+' organization'+(cos.length!==1?'s':'')+' · only visible to you</div></div>' +
      '<button class="btn bp" style="padding:10px 14px;font-size:13px" onclick="STATE.modal={type:\'newcompany\'};render()">+ New Company</button>' +
    '</div>' +

    // Revenue + stats
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
      '<div class="card" style="padding:16px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;grid-column:1/-1">' +
        '<div style="font-size:10px;font-weight:700;opacity:.7;text-transform:uppercase;letter-spacing:.06em">Monthly Recurring Revenue</div>' +
        '<div style="font-size:30px;font-weight:800;margin-top:4px">'+money(revenue)+'</div>' +
        '<div style="font-size:11px;opacity:.65;margin-top:2px">across '+cos.filter(o=>o.status!=='suspended'&&o.status!=='cancelled').length+' active companies</div>' +
      '</div>' +
      _statCard('Active', active, 'var(--ok)') +
      _statCard('Overdue', overdue, 'var(--warn)') +
      _statCard('Suspended', suspended, 'var(--err)') +
      _statCard('Trial', trial, 'var(--case)') +
    '</div>' +

    // Search
    '<div style="position:relative;margin-bottom:10px">' +
      '<input id="pf-search" class="inp" style="padding-left:34px;height:40px;font-size:13px" placeholder="Search by company name or email…" value="'+esc(_platformSearch)+'" oninput="pfSearch(this.value)">' +
      '<div style="position:absolute;left:11px;top:11px;color:var(--t3)">'+IC.srch+'</div>' +
    '</div>' +

    // Filter chips
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:14px">' +
    [['all','All'],['active','Active'],['overdue','Overdue'],['suspended','Suspended'],['trial','Trial']].map(([f,l])=>
      '<button class="chip'+(_platformFilter===f?' on':'')+'" style="flex-shrink:0;font-size:10px" onclick="pfFilter(\''+f+'\')">'+l+'</button>'
    ).join('')+'</div>' +

    '<div id="platform-orgs">'+_renderOrgList()+'</div>' +
  '</div>';
}

function _renderOrgList() {
  if (!_platformOrgs.length) {
    return '<div class="empty"><div class="eico">🏢</div><div class="etit">No companies yet</div><div class="esub">Organizations appear here when admins sign up</div></div>';
  }
  let orgs = [..._platformOrgs];

  if (_platformFilter==='active')    orgs = orgs.filter(o=>(o.status==='active'||!o.status)&&!_isOverdue(o));
  else if (_platformFilter==='overdue')   orgs = orgs.filter(o=>_isOverdue(o));
  else if (_platformFilter==='suspended') orgs = orgs.filter(o=>o.status==='suspended');
  else if (_platformFilter==='trial')     orgs = orgs.filter(o=>o.status==='trial');

  if (_platformSearch) {
    const q = _platformSearch.toLowerCase();
    orgs = orgs.filter(o=>(o.name||'').toLowerCase().includes(q)||(o.billing?.email||'').toLowerCase().includes(q));
  }

  // Sort: overdue first, then by next bill date
  orgs.sort((a,b) => {
    const ao=_isOverdue(a),bo=_isOverdue(b);
    if(ao&&!bo) return -1; if(!ao&&bo) return 1;
    return (a.billing?.nextBillDate||'9999') < (b.billing?.nextBillDate||'9999') ? -1 : 1;
  });

  if (!orgs.length) return '<div style="text-align:center;padding:32px;color:var(--t3);font-size:13px">No companies match this filter</div>';

  return '<div style="display:flex;flex-direction:column;gap:10px">' +
    orgs.map(o => {
      const st=_orgStatus(o), fee=parseFloat(o.billing?.monthlyFee)||0, plan=o.billing?.plan||'';
      const nb=o.billing?.nextBillDate||'', lp=o.billing?.lastPaidDate||'';
      const nbFmt = nb ? (nb<new Date().toISOString().split('T')[0] ? '<span style="color:var(--warn);font-weight:700">OVERDUE ('+nb+')</span>' : nb) : '<span style="color:var(--t3)">Not set</span>';
      const joined = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
      const safeName = esc(o.name||'Unnamed').replace(/'/g,'&#39;');
      return '<div class="card" style="cursor:pointer;'+(o.status==='suspended'?'border-left:3px solid var(--err)':_isOverdue(o)?'border-left:3px solid var(--warn)':'')+'" onclick="viewPlatformOrg(\''+o.id+'\')">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px">' +
              '<span style="font-size:15px;font-weight:800">'+esc(o.name||'Unnamed')+'</span>' +
              '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:'+st.bg+';color:'+st.color+'">'+st.label+'</span>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--t2);margin-bottom:6px">' +
              (plan?'<strong>'+esc(plan)+'</strong> · ':'') +
              (fee>0?'<span style="color:var(--a);font-weight:700">'+money(fee)+'/mo</span>':'<span style="color:var(--t3)">No fee set</span>') +
              ' · Joined '+joined +
            '</div>' +
            '<div style="display:flex;gap:14px;flex-wrap:wrap">' +
              '<span style="font-size:10px;color:var(--t2)">📅 Next: '+nbFmt+'</span>' +
              (lp?'<span style="font-size:10px;color:var(--t2)">💰 Last paid: '+lp+'</span>':'') +
            '</div>' +
          '</div>' +
          '<div style="color:var(--t3);font-size:18px;flex-shrink:0">›</div>' +
        '</div>' +
        '<div style="display:flex;gap:7px" onclick="event.stopPropagation()">' +
          (o.status==='suspended'
            ? '<button class="btn" style="background:var(--oks);color:var(--ok);font-size:11px;font-weight:700;height:32px;flex:1" onclick="unsuspendOrg(\''+o.id+'\',\''+safeName+'\')">✓ Resume Access</button>'
            : '<button class="btn" style="background:var(--errs);color:var(--err);font-size:11px;font-weight:700;height:32px;flex:1" onclick="suspendOrg(\''+o.id+'\',\''+safeName+'\')">⏸ Pause Access</button>') +
          '<button class="btn bs" style="font-size:11px;height:32px;flex:1" onclick="viewPlatformOrg(\''+o.id+'\')">Details →</button>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function pfFilter(f) { _platformFilter=f; const el=document.getElementById('platform-orgs'); if(el) el.innerHTML=_renderOrgList(); }
function pfSearch(v) { _platformSearch=v; const el=document.getElementById('platform-orgs'); if(el) el.innerHTML=_renderOrgList(); }
function viewPlatformOrg(orgId) { _platformDetail=orgId; render(); }

async function loadPlatformOrgs() {
  if (!STATE.isSuperAdmin||!window._fbDb) return;
  const el=document.getElementById('platform-orgs'); if(!el) return;
  try {
    const snap=await window._fbDb.collection('orgs').get();
    _platformOrgs=[];
    snap.forEach(d=>_platformOrgs.push({id:d.id,...d.data()}));
    el.innerHTML=_renderOrgList();
  } catch(e) { el.innerHTML='<div style="font-size:12px;color:var(--err);padding:16px">Error: '+e.message+'</div>'; }
}

// ── DETAIL VIEW ───────────────────────────────────────────────────────────────
function _renderPlatformDetail(orgId) {
  const org=_platformOrgs.find(o=>o.id===orgId);
  if(!org){ _platformDetail=null; return renderPlatformPage(); }

  const st=_orgStatus(org), fee=parseFloat(org.billing?.monthlyFee)||0;
  const totalPaid=parseFloat(org.billing?.totalPaid)||0;
  const isSuspended=org.status==='suspended';
  const joined=org.createdAt?.toDate?org.createdAt.toDate().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
  const today=new Date().toISOString().split('T')[0];

  return '<div class="fu">' +
    '<button class="btn bg2" style="margin-bottom:14px;display:flex;align-items:center;gap:4px" onclick="_platformDetail=null;render()">'+IC.back+' All Companies</button>' +

    // Company header
    '<div class="card" style="margin-bottom:14px;'+(isSuspended?'border-left:3px solid var(--err)':_isOverdue(org)?'border-left:3px solid var(--warn)':'')+'">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">' +
        '<div>' +
          '<div style="font-size:22px;font-weight:800;margin-bottom:2px">'+esc(org.name||'Unnamed')+'</div>' +
          '<div style="font-size:11px;color:var(--t2)">Joined '+joined+(org.billing?.email?' · '+esc(org.billing.email):'')+'</div>' +
        '</div>' +
        '<span style="font-size:10px;font-weight:700;padding:4px 10px;border-radius:99px;background:'+st.bg+';color:'+st.color+'">'+st.label+'</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">' +
        _miniStat('Monthly Fee', fee>0?money(fee):'Not set', 'var(--a)') +
        _miniStat('Total Paid', money(totalPaid), 'var(--ok)') +
        _miniStat('Members', org.memberCount||'—', 'var(--gst)') +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (isSuspended
          ? '<button class="btn" style="background:var(--oks);color:var(--ok);font-weight:700;flex:1;height:40px;font-size:13px" onclick="unsuspendOrg(\''+org.id+'\',\''+esc(org.name||'Unnamed')+'\')">✓ Restore Access</button>'
          : '<button class="btn" style="background:var(--errs);color:var(--err);font-weight:700;flex:1;height:40px;font-size:13px" onclick="suspendOrg(\''+org.id+'\',\''+esc(org.name||'Unnamed')+'\')">🚫 Suspend Access</button>') +
        '<button class="btn bs" style="flex:1;height:40px;font-size:13px" onclick="loadPlatformMembers(\''+org.id+'\')">👥 Members</button>' +
        '<button class="btn" style="background:var(--as);color:var(--a);font-weight:700;flex:1;height:40px;font-size:13px" onclick="openAddCompanyAdminModal(\''+org.id+'\')">+ Admin</button>' +
      '</div>' +
    '</div>' +

    // Billing settings form
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="sh"><div class="st">💳 Subscription & Billing</div></div>' +
      '<div class="fg">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div class="iw"><label class="il">Plan</label><input id="pf-plan" class="inp" value="'+esc(org.billing?.plan||'')+'" placeholder="e.g. Standard"></div>' +
          '<div class="iw"><label class="il">Monthly Fee ('+( STATE.currency||'MVR')+')</label><input id="pf-fee" class="inp" type="number" min="0" value="'+(org.billing?.monthlyFee||'')+'" placeholder="500"></div>' +
        '</div>' +
        '<div class="iw"><label class="il">Billing Email</label><input id="pf-bemail" class="inp" type="email" value="'+esc(org.billing?.email||'')+'" placeholder="billing@company.com"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div class="iw"><label class="il">Next Bill Date</label><input id="pf-next" class="inp" type="date" value="'+(org.billing?.nextBillDate||'')+'"></div>' +
          '<div class="iw"><label class="il">Status</label>' +
            '<select id="pf-status" class="inp" style="height:40px">' +
              ['active','trial','suspended','cancelled'].map(s=>'<option value="'+s+'"'+(( org.status||'active')===s?' selected':'')+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>').join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="iw"><label class="il">Internal Notes</label><textarea id="pf-notes" class="inp" rows="2" style="resize:none" placeholder="Notes visible only to you…">'+esc(org.billing?.notes||'')+'</textarea></div>' +
        '<button class="btn bp" style="height:44px;font-size:13px;font-weight:700" onclick="savePlatformBilling(\''+org.id+'\')">Save Changes</button>' +
      '</div>' +
    '</div>' +

    // Record payment
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="sh"><div class="st" style="color:var(--ok)">💰 Record Payment</div></div>' +
      '<div class="fg">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div class="iw"><label class="il">Amount ('+( STATE.currency||'MVR')+')</label><input id="pf-pay-amt" class="inp" type="number" min="0" value="'+(org.billing?.monthlyFee||'')+'" placeholder="500"></div>' +
          '<div class="iw"><label class="il">Payment Date</label><input id="pf-pay-date" class="inp" type="date" value="'+today+'"></div>' +
        '</div>' +
        '<div class="iw"><label class="il">Note (optional)</label><input id="pf-pay-note" class="inp" placeholder="e.g. June 2025 payment"></div>' +
        (isSuspended?'<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;font-weight:600"><input type="checkbox" id="pf-restore" checked style="width:16px;height:16px;accent-color:var(--ok)"> Restore account access after recording</label>':'')+
        '<button class="btn" style="background:var(--oks);color:var(--ok);font-weight:700;height:44px;font-size:13px;border:1px solid rgba(16,185,129,.25)" onclick="recordPlatformPayment(\''+org.id+'\')">✓ Record Payment</button>' +
      '</div>' +
    '</div>' +

    // Payment history + members (loaded async)
    '<div class="card" style="margin-bottom:14px" id="pf-history-card">' +
      '<div class="sh"><div class="st" id="pf-history-title">📜 Payment History</div>' +
        '<button class="btn bs" style="font-size:11px;padding:5px 10px" onclick="loadPlatformPayments(\''+org.id+'\')">Refresh</button>' +
      '</div>' +
      '<div id="pf-history"><div style="display:flex;align-items:center;gap:8px;color:var(--t2);font-size:12px"><div style="width:16px;height:16px;border:2px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0"></div>Loading…</div></div>' +
    '</div>' +

    // Per-company activity log
    '<div class="card">' +
      '<div class="sh" style="margin-bottom:10px"><div class="st">📋 Activity Log</div>' +
        '<button class="btn bs" style="font-size:11px;padding:5px 10px" onclick="loadPlatformActivityLog(\''+org.id+'\')">Refresh</button>' +
      '</div>' +
      '<div id="pf-actlog"><div style="display:flex;align-items:center;gap:8px;color:var(--t2);font-size:12px"><div style="width:16px;height:16px;border:2px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0"></div>Loading…</div></div>' +
    '</div>' +
  '</div>';
}

// ── ASYNC DATA LOADERS ────────────────────────────────────────────────────────
async function loadPlatformPayments(orgId) {
  const el=document.getElementById('pf-history'); if(!el) return;
  const title=document.getElementById('pf-history-title'); if(title) title.textContent='📜 Payment History';
  try {
    const snap=await window._fbDb.collection('orgs').doc(orgId).collection('payments').orderBy('date','desc').get();
    if(snap.empty){ el.innerHTML='<div style="font-size:12px;color:var(--t3);padding:4px 0">No payments recorded yet</div>'; return; }
    const rows=[]; snap.forEach(d=>rows.push({id:d.id,...d.data()}));
    const runningTotal=rows.reduce((s,p)=>s+(parseFloat(p.amount)||0),0);
    el.innerHTML='<div style="font-size:10px;color:var(--t2);margin-bottom:10px;font-weight:700">'+rows.length+' payment'+(rows.length!==1?'s':'')+' · Total collected: <span style="color:var(--ok)">'+money(runningTotal)+'</span></div><div>'+
      rows.map((p,i)=>
        '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;'+(i>0?'border-top:1px solid var(--b)':'')+'">' +
          '<div style="width:34px;height:34px;border-radius:8px;background:var(--oks);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">💰</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:14px;font-weight:800;color:var(--ok)">'+money(parseFloat(p.amount)||0)+'</div>' +
            '<div style="font-size:10px;color:var(--t2)">'+p.date+(p.note?' · '+esc(p.note):'')+'</div>' +
          '</div>' +
          '<button class="btn bic" style="background:var(--errs);color:var(--err);width:28px;height:28px;flex-shrink:0" onclick="deletePlatformPayment(\''+orgId+'\',\''+p.id+'\','+( parseFloat(p.amount)||0)+',\''+p.date+'\')">'+IC.trash+'</button>' +
        '</div>'
      ).join('')+'</div>';
  } catch(e){ el.innerHTML='<div style="font-size:12px;color:var(--err)">Error: '+e.message+'</div>'; }
}

async function loadPlatformMembers(orgId) {
  const el=document.getElementById('pf-history'); if(!el) return;
  const title=document.getElementById('pf-history-title'); if(title) title.textContent='👥 Team Members';
  el.innerHTML='<div style="display:flex;align-items:center;gap:8px;color:var(--t2);font-size:12px"><div style="width:16px;height:16px;border:2px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0"></div>Loading members…</div>';
  try {
    const snap=await window._fbDb.collection('users').where('orgId','==',orgId).get();
    const members=[]; snap.forEach(d=>members.push({id:d.id,...d.data()}));
    if(!members.length){ el.innerHTML='<div style="font-size:12px;color:var(--t3)">No members found</div>'; return; }
    el.innerHTML='<div>'+members.map((m,i)=>
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;'+(i>0?'border-top:1px solid var(--b)':'')+'">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;flex-shrink:0">'+(m.name||'?')[0].toUpperCase()+'</div>' +
        '<div style="flex:1"><div style="font-size:13px;font-weight:600">'+esc(m.name||'Unknown')+'</div><div style="font-size:10px;color:var(--t2)">'+esc(m.email||'')+'</div></div>' +
        '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:'+(m.role==='admin'?'var(--as)':'var(--oks)')+';color:'+(m.role==='admin'?'var(--a)':'var(--ok)')+'">'+( m.role==='admin'?'Admin':'Agent')+'</span>' +
      '</div>'
    ).join('')+'</div>';
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0){ _platformOrgs[idx].memberCount=members.length; window._fbDb.collection('orgs').doc(orgId).update({memberCount:members.length}).catch(()=>{}); }
  } catch(e){ el.innerHTML='<div style="font-size:12px;color:var(--err)">Error: '+e.message+'</div>'; }
}

async function loadPlatformActivityLog(orgId) {
  const el = document.getElementById('pf-actlog'); if (!el) return;
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;color:var(--t2);font-size:12px"><div style="width:16px;height:16px;border:2px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;flex-shrink:0"></div>Loading…</div>';
  try {
    const snap = await window._fbDb.collection('orgs').doc(orgId).collection('appdata').doc('main').get();
    const log = (snap.exists && snap.data().activityLog) ? snap.data().activityLog : [];
    if (!log.length) { el.innerHTML = '<div style="font-size:12px;color:var(--t3);padding:4px 0">No activity recorded yet</div>'; return; }
    const ACT = {login:'🔐',sale_add:'🧾',sale_edit:'✏️',sale_delete:'🗑️',shop_add:'🏪',shop_edit:'✏️',shop_delete:'🗑️',csv_import:'📂',payment_update:'💳',item_add:'📦'};
    el.innerHTML = '<div style="font-size:10px;color:var(--t2);margin-bottom:8px;font-weight:700">Last '+Math.min(log.length,100)+' events</div>' +
      log.slice(0,100).map((e,i) => {
        const ts = e.ts ? new Date(e.ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
        return '<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;'+(i>0?'border-top:1px solid var(--b)':'')+'">' +
          '<div style="width:28px;height:28px;border-radius:7px;background:var(--s2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">'+(ACT[e.type]||'📝')+'</div>' +
          '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500">'+esc(e.msg||'')+'</div>' +
          '<div style="font-size:10px;color:var(--t3);margin-top:1px">'+ts+(e.userName?' · '+esc(e.userName):'')+'</div></div>' +
        '</div>';
      }).join('');
  } catch(e) { el.innerHTML = '<div style="font-size:12px;color:var(--err)">Error: '+e.message+'</div>'; }
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
async function savePlatformBilling(orgId) {
  const plan=((document.getElementById('pf-plan')||{}).value||'').trim();
  const fee=parseFloat((document.getElementById('pf-fee')||{}).value||0)||0;
  const email=((document.getElementById('pf-bemail')||{}).value||'').trim();
  const nextBill=((document.getElementById('pf-next')||{}).value||'').trim();
  const status=((document.getElementById('pf-status')||{}).value||'active');
  const notes=((document.getElementById('pf-notes')||{}).value||'').trim();
  try {
    const updates={'billing.plan':plan,'billing.monthlyFee':fee,'billing.email':email,'billing.nextBillDate':nextBill,'billing.notes':notes,status};
    if(status==='active'){updates.suspendedReason=firebase.firestore.FieldValue.delete();updates.suspendedAt=firebase.firestore.FieldValue.delete();}
    await window._fbDb.collection('orgs').doc(orgId).update(updates);
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0){ _platformOrgs[idx]={..._platformOrgs[idx],status,billing:{...(_platformOrgs[idx].billing||{}),plan,monthlyFee:fee,email,nextBillDate:nextBill,notes}}; if(status==='active'){delete _platformOrgs[idx].suspendedReason;} }
    showToast('✓ Billing settings saved');
  } catch(e){ showToast('⚠️ '+e.message); }
}

async function recordPlatformPayment(orgId) {
  const amount=parseFloat((document.getElementById('pf-pay-amt')||{}).value||0);
  if(!amount||amount<=0){ showToast('⚠️ Enter payment amount'); return; }
  const date=((document.getElementById('pf-pay-date')||{}).value||'').trim()||new Date().toISOString().split('T')[0];
  const note=((document.getElementById('pf-pay-note')||{}).value||'').trim();
  const restoreAccess=!!(document.getElementById('pf-restore')||{checked:false}).checked;
  const org=_platformOrgs.find(o=>o.id===orgId);
  const newTotal=+((parseFloat(org?.billing?.totalPaid)||0)+amount).toFixed(2);
  const nextBill=new Date(date); nextBill.setMonth(nextBill.getMonth()+1);
  const nextBillDate=nextBill.toISOString().split('T')[0];
  try {
    await window._fbDb.collection('orgs').doc(orgId).collection('payments').add({amount,date,note,recordedAt:firebase.firestore.FieldValue.serverTimestamp()});
    const updates={'billing.lastPaidDate':date,'billing.lastPaidAmount':amount,'billing.totalPaid':newTotal,'billing.nextBillDate':nextBillDate};
    if(restoreAccess&&org?.status==='suspended'){ updates.status='active'; updates.suspendedReason=firebase.firestore.FieldValue.delete(); updates.suspendedAt=firebase.firestore.FieldValue.delete(); }
    await window._fbDb.collection('orgs').doc(orgId).update(updates);
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0){
      _platformOrgs[idx].billing={...(_platformOrgs[idx].billing||{}),lastPaidDate:date,lastPaidAmount:amount,totalPaid:newTotal,nextBillDate};
      if(restoreAccess&&_platformOrgs[idx].status==='suspended'){ _platformOrgs[idx].status='active'; delete _platformOrgs[idx].suspendedReason; }
    }
    showToast('✓ Payment recorded — next bill: '+nextBillDate);
    _platformDetail=orgId; render();
  } catch(e){ showToast('⚠️ '+e.message); }
}

async function deletePlatformPayment(orgId, paymentId, amount, date) {
  if(!confirm('Delete this payment record?\n'+date+' · '+money(amount))) return;
  try {
    await window._fbDb.collection('orgs').doc(orgId).collection('payments').doc(paymentId).delete();
    const org=_platformOrgs.find(o=>o.id===orgId);
    const newTotal=Math.max(0,(parseFloat(org?.billing?.totalPaid)||0)-amount);
    await window._fbDb.collection('orgs').doc(orgId).update({'billing.totalPaid':newTotal});
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0) _platformOrgs[idx].billing={...(_platformOrgs[idx].billing||{}),totalPaid:newTotal};
    showToast('Payment record deleted');
    loadPlatformPayments(orgId);
  } catch(e){ showToast('⚠️ '+e.message); }
}

async function suspendOrg(orgId, orgName) {
  const reason=prompt('Reason for suspending "'+orgName+'"?\n(Shown to users — leave blank for "Non-payment"):');
  if(reason===null) return;
  const finalReason=reason.trim()||'Non-payment';
  try {
    await window._fbDb.collection('orgs').doc(orgId).update({status:'suspended',suspendedReason:finalReason,suspendedAt:firebase.firestore.FieldValue.serverTimestamp()});
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0){ _platformOrgs[idx].status='suspended'; _platformOrgs[idx].suspendedReason=finalReason; }
    showToast('🚫 "'+orgName+'" suspended');
    if(_platformDetail){ _platformDetail=orgId; render(); } else { const el=document.getElementById('platform-orgs'); if(el) el.innerHTML=_renderOrgList(); }
  } catch(e){ showToast('⚠️ '+e.message); }
}

async function unsuspendOrg(orgId, orgName) {
  if(!confirm('Restore access for "'+orgName+'"?')) return;
  try {
    await window._fbDb.collection('orgs').doc(orgId).update({status:'active',suspendedReason:firebase.firestore.FieldValue.delete(),suspendedAt:firebase.firestore.FieldValue.delete()});
    const idx=_platformOrgs.findIndex(o=>o.id===orgId);
    if(idx>=0){ _platformOrgs[idx].status='active'; delete _platformOrgs[idx].suspendedReason; delete _platformOrgs[idx].suspendedAt; }
    showToast('✓ "'+orgName+'" access restored');
    if(_platformDetail){ _platformDetail=orgId; render(); } else { const el=document.getElementById('platform-orgs'); if(el) el.innerHTML=_renderOrgList(); }
  } catch(e){ showToast('⚠️ '+e.message); }
}

function openAddCompanyAdminModal(orgId) {
  const org = _platformOrgs.find(o => o.id === orgId);
  STATE.modal = {type:'addcompadmin', data:{orgId, orgName: org?.name || 'Company'}};
  render();
}
