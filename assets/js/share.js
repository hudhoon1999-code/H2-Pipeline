'use strict';
// ── SHARE SYSTEM ──────────────────────────────────────────────────────────
// ── SHARE SYSTEM ──────────────────────────────────────────────────────────────
let syncTimer = null;
function autoSync() {
  if(!SHARE.enabled||!SHARE.shareId) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const ok = await pushShare(SHARE.shareId, SHARE.perms);
    if(ok) { SHARE.lastPushed=new Date().toISOString(); db.set('shareState',SHARE); }
  }, 3000);
}
async function pushShare(shareId, perms) {
  const payload = {
    meta:{ownerName:STATE.user?.name||'H2 Line',updatedAt:new Date().toISOString()},
    perms, sales:perms.sales?STATE.sales:[], items:perms.items?STATE.items:[], shops:perms.shops?STATE.shops:[]
  };
  try {
    const res = await fetch(FIREBASE_URL+'/shares/'+shareId+'.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    return res.ok;
  } catch { return false; }
}
async function deleteShare(shareId) {
  try { await fetch(FIREBASE_URL+'/shares/'+shareId+'.json',{method:'DELETE'}); } catch {}
}
function openShareModal() { STATE.modal={type:'share'}; render(); }
function renderShareModal() {
  const p=SHARE.perms;
  const link=SHARE.shareId?(window.location.origin+window.location.pathname+'?view='+SHARE.shareId):null;
  const permItems=[
    {key:'dashboard',label:'Dashboard & KPIs',ico:'\uD83D\uDCCA',desc:'Totals, charts, top shops/items'},
    {key:'sales',label:'Sales History',ico:'\uD83D\uDCB0',desc:'All sales entries with amounts'},
    {key:'invoices',label:'Invoices',ico:'\uD83E\uDDFE',desc:'Invoice breakdown & GST'},
    {key:'report',label:'Weekly Reports',ico:'\uD83D\uDCC5',desc:'Sat\u2013Thu weekly summaries'},
    {key:'shops',label:'Shop Details',ico:'\uD83C\uDFAA',desc:'Shop names, contacts, areas'},
    {key:'items',label:'Product Catalog',ico:'\uD83D\uDCE6',desc:'Items and pricing tiers'},
  ];
  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:22px">\uD83D\uDD17</div><div class="mtit" style="margin-bottom:0">Share H2 Line</div></div>' +
      '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&times;</button>' +
    '</div>' +
    '<div style="font-size:13px;color:var(--t2);margin-bottom:20px">Generate a live view-only link. Viewers can see your data but cannot edit anything.</div>' +
    '<div style="background:' + (SHARE.enabled?'var(--as)':'var(--s2)') + ';border:1.5px solid ' + (SHARE.enabled?'var(--a)':'var(--b)') + ';border-radius:var(--rm);padding:14px;margin-bottom:16px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between"><div><div style="font-weight:700;font-size:15px">Live Sharing</div><div style="font-size:12px;color:var(--t2)">Anyone with the link can view</div></div>' +
    '<label class="share-tog" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" ' + (SHARE.enabled?'checked':'') + ' onchange="toggleShare(this.checked)"></label></div>' +
    (SHARE.enabled&&link?'<div style="margin-top:12px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Your Share Link</div>' +
    '<div class="slink" onclick="copyLink(\'' + link + '\')">' + link + '</div>' +
    '<div style="display:flex;gap:8px;margin-top:8px">' +
    '<button class="btn bp" style="flex:1;padding:9px;font-size:13px" onclick="copyLink(\'' + link + '\')">\uD83D\uDCCB Copy</button>' +
    '<button class="btn bs" style="flex:1;padding:9px;font-size:13px" onclick="shareLink(\'' + link + '\')">\uD83D\uDCE4 Share</button>' +
    '<button class="btn bs" style="padding:9px 12px;font-size:13px" onclick="syncNow()">\uD83D\uDD04 Sync</button></div>' +
    (SHARE.lastPushed?'<div style="font-size:10px;color:var(--t3);margin-top:6px;text-align:center">Last synced: '+new Date(SHARE.lastPushed).toLocaleString()+'</div>':'') +
    '</div>':'') + '</div>' +
    '<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">What viewers can see</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">' +
    permItems.map(item => '<div style="display:flex;align-items:center;gap:10px;background:var(--s2);border-radius:var(--rs);padding:11px 13px">' +
      '<div style="font-size:18px;width:28px;text-align:center">' + item.ico + '</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + item.label + '</div><div style="font-size:11px;color:var(--t2)">' + item.desc + '</div></div>' +
      '<label class="share-tog" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" ' + (p[item.key]?'checked':'') + ' onchange="updatePerm(\'' + item.key + '\',this.checked)"></label></div>'
    ).join('') + '</div>' +
    '<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">One-time Snapshot</div>' +
    '<div style="background:var(--s2);border-radius:var(--rm);padding:14px;margin-bottom:8px">' +
    '<div style="font-size:13px;color:var(--t2);margin-bottom:12px">Export a self-contained HTML file anyone can open offline.</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<button class="btn bs bw" style="height:42px;font-size:13px" onclick="exportSnap(\'full\')">\uD83D\uDCC4 Full Snapshot</button>' +
    '<button class="btn bs bw" style="height:42px;font-size:13px" onclick="exportSnap(\'dashboard\')">\uD83D\uDCCA Dashboard Only</button>' +
    '<button class="btn bs bw" style="height:42px;font-size:13px" onclick="exportSnap(\'report\')">\uD83D\uDCC5 Weekly Report</button>' +
    '</div></div>';
}
async function toggleShare(enabled) {
  SHARE.enabled = enabled;
  if(enabled&&!SHARE.shareId) SHARE.shareId=uid();
  if(!enabled&&SHARE.shareId) {
    if(confirm('Disable sharing? The current link will stop working.')) { await deleteShare(SHARE.shareId); SHARE.shareId=null; SHARE.lastPushed=null; }
    else { SHARE.enabled=true; }
  }
  db.set('shareState',SHARE);
  if(SHARE.enabled) {
    const ok=await pushShare(SHARE.shareId,SHARE.perms);
    if(ok){SHARE.lastPushed=new Date().toISOString();db.set('shareState',SHARE);showToast('\u2713 Live link active!');}
    else showToast('\u26A0\uFE0F Setup Firebase to enable live links');
  }
  STATE.modal={type:'share'}; render();
}
function updatePerm(key,val) {
  SHARE.perms[key]=val; db.set('shareState',SHARE);
  if(SHARE.enabled&&SHARE.shareId) pushShare(SHARE.shareId,SHARE.perms).then(ok=>{if(ok){SHARE.lastPushed=new Date().toISOString();db.set('shareState',SHARE);showToast('\u2713 Updated');}});
}
async function syncNow() {
  showToast('Syncing\u2026');
  const ok=await pushShare(SHARE.shareId,SHARE.perms);
  if(ok){SHARE.lastPushed=new Date().toISOString();db.set('shareState',SHARE);showToast('\u2713 Synced!');STATE.modal={type:'share'};render();}
  else showToast('\u26A0\uFE0F Sync failed');
}
function copyLink(link) {
  if(navigator.clipboard) navigator.clipboard.writeText(link).then(()=>showToast('\u2713 Link copied!'));
  else { const t=document.createElement('textarea');t.value=link;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();showToast('\u2713 Copied!'); }
}
function shareLink(link) {
  if(navigator.share) navigator.share({title:'H2 Line \u2014 Live View',text:'View my H2 Line sales',url:link});
  else copyLink(link);
}
function exportSnap(mode) {
  const S=STATE.sales, mn=money;
  const tot=S.reduce((a,r)=>a+saleFinalTotal(r),0);
  const pd=S.filter(r=>r.paymentStatus==='Paid').reduce((a,r)=>a+saleFinalTotal(r),0);
  const pe=S.filter(r=>r.paymentStatus==='Pending').reduce((a,r)=>a+saleFinalTotal(r),0);
  const gt=S.reduce((a,r)=>a+saleGstTotal(r),0);
  const wmap={};S.forEach(s=>{const w=weekStart(s.date);wmap[w]=(wmap[w]||0)+saleFinalTotal(s);});
  const wdata=Object.keys(wmap).sort().slice(-8).map(w=>({label:weekLabel(w),total:wmap[w]}));
  const smap={};S.forEach(r=>{smap[r.shopName]=(smap[r.shopName]||0)+r.finalTotal;});
  const topS=Object.entries(smap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const imap={};S.forEach(r=>{imap[r.itemName]=(imap[r.itemName]||0)+r.finalTotal;});
  const topI=Object.entries(imap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const now=new Date().toLocaleString();
  const salesRows = mode==='full' && SHARE.perms.sales
    ? S.slice(-100).map(s=>`<tr><td>${s.date}</td><td>${s.shopName}</td><td>${s.itemName}</td><td>${s.priceType}</td><td>${mn(s.gstAmt)} ${s.gstInclusive?'(incl.)':'(+8%)'}</td><td><b>${mn(s.finalTotal)}</b></td><td>${s.paymentStatus}</td></tr>`).join('')
    : null;
  const weekRows = (mode==='full'||mode==='report')
    ? wdata.map(w=>`<tr><td>${w.label}</td><td><b>${mn(w.total)}</b></td></tr>`).join('')
    : null;
  const topShopsHtml = topS.map(([n,t],i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px"><span><span style="color:#6366F1;margin-right:6px">${i+1}.</span>${n}</span><b>${mn(t)}</b></div>`).join('');
  const topItemsHtml = topI.map(([n,t],i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px"><span><span style="color:#6366F1;margin-right:6px">${i+1}.</span>${n}</span><b>${mn(t)}</b></div>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>H2 Line Snapshot</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Nunito:wght@400;500;600&display=swap">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Nunito,sans-serif;background:#0A0A0F;color:#F0F0FF;padding:20px;max-width:900px;margin:0 auto}
.logo{font-family:Outfit,sans-serif;font-size:26px;font-weight:800;color:#6366F1}
.hdr{display:flex;justify-content:space-between;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.08)}
.meta{font-size:12px;color:#8888AA;text-align:right}
.kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.kcard{background:#141420;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px}
.klbl{font-size:10px;font-weight:700;color:#555570;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.kval{font-family:Outfit,sans-serif;font-size:20px;font-weight:800}
section{margin-bottom:28px}
h2{font-family:Outfit,sans-serif;font-size:16px;font-weight:700;margin-bottom:12px}
table{width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden}
th{background:#1C1C2C;color:#8888AA;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;text-align:left}
td{padding:10px 12px;border-top:1px solid rgba(255,255,255,.05);font-size:13px}
.tops{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
.tc{background:#141420;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px}
.note{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#F59E0B;margin-bottom:20px}
@media(max-width:600px){.kgrid{grid-template-columns:1fr 1fr}.tops{grid-template-columns:1fr}}
</style></head><body>
<div class="hdr"><div><div class="logo">H2 Line</div><div style="font-size:12px;color:#8888AA;margin-top:3px">View-only snapshot by ${STATE.user?.name||'H2 Line'}</div></div><div class="meta"><div>Generated: ${now}</div><div>🔒 Read-only</div></div></div>
<div class="note">👁 Read-only snapshot as of ${now}.</div>
<div class="kgrid">
  <div class="kcard"><div class="klbl">Total Sales</div><div class="kval" style="color:#6366F1">${mn(tot)}</div></div>
  <div class="kcard"><div class="klbl">Collected</div><div class="kval" style="color:#10B981">${mn(pd)}</div></div>
  <div class="kcard"><div class="klbl">Pending</div><div class="kval" style="color:#F59E0B">${mn(pe)}</div></div>
  <div class="kcard"><div class="klbl">GST @ 8%</div><div class="kval" style="color:#8B5CF6">${mn(gt)}</div></div>
</div>
<div class="tops">
  <div class="tc"><h2 style="font-size:14px;margin-bottom:10px">Top Shops</h2>${topShopsHtml}</div>
  <div class="tc"><h2 style="font-size:14px;margin-bottom:10px">Top Items</h2>${topItemsHtml}</div>
</div>
${weekRows ? `<section><h2>Weekly Report</h2><table><thead><tr><th>Week</th><th>Total</th></tr></thead><tbody>${weekRows}</tbody></table></section>` : ''}
${salesRows ? `<section><h2>Sales History</h2><table><thead><tr><th>Date</th><th>Shop</th><th>Item</th><th>Type</th><th>GST</th><th>Total</th><th>Status</th></tr></thead><tbody>${salesRows}</tbody></table></section>` : ''}
</body></html>`;
  dlFile(html,'h2line-snapshot-'+new Date().toISOString().split('T')[0]+'.html','text/html');
  showToast('\u2713 Snapshot exported!');
}

// ── VIEWER MODE ───────────────────────────────────────────────────────────────
async function bootViewer() {
  const root = document.getElementById('app');
  document.body.className = STATE.dark ? 'dark' : 'light';
  root.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px"><div style="font-family:Outfit,sans-serif;font-size:28px;font-weight:800;color:var(--a)">H2 Line</div><div style="font-size:13px;color:var(--t2)">Loading shared view\u2026</div><div style="width:32px;height:32px;border:3px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite"></div></div>';
  try {
    const res = await fetch(FIREBASE_URL+'/shares/'+VIEW_ID+'.json');
    if(!res.ok) throw new Error();
    const data = await res.json();
    if(!data) throw new Error();
    STATE.sales=data.sales||[]; STATE.items=data.items||[]; STATE.shops=data.shops||[];
    STATE.user={name:data.meta?.ownerName||'H2 Line',email:'viewer@h2line.app',id:'viewer'};
    STATE.isViewer=true; STATE.page='dashboard'; render();
  } catch {
    root.innerHTML='<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:24px;text-align:center"><div style="font-size:36px">\uD83D\uDD12</div><div style="font-family:Outfit,sans-serif;font-size:20px;font-weight:700">Link not found</div><div style="font-size:13px;color:var(--t2)">This share link may have expired or been disabled.</div></div>';
  }
}