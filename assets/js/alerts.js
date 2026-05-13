'use strict';
// ── ALERTS SYSTEM ─────────────────────────────────────────────────────────
// ── ALERTS SYSTEM ─────────────────────────────────────────────────────────────
function getAlerts() { return db.get('alerts', []); }
function saveAlerts(a) { db.set('alerts', a); }

function renderAlertsPage() {
  const alerts = getAlerts();
  const shops = STATE.shops.map(s=>s.name);
  const items = STATE.items.map(i=>i.name);
  return '<div class="fu">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
      '<div><h1 style="font-size:22px;font-weight:800">Alerts</h1><div style="font-size:12px;color:var(--t2)">Reminders to call shops or update stock</div></div>' +
      '<button class="btn bp" style="padding:10px 14px;font-size:13px" onclick="openAlertModal(null)">+ New</button>' +
    '</div>' +
    (alerts.length ? alerts.map((a,i) => {
      const isDue = a.dueDate && a.dueDate <= new Date().toISOString().split('T')[0];
      const isDone = a.done;
      return '<div class="card csm" style="margin-bottom:10px;opacity:'+(isDone?'.5':'1')+';border-color:'+(isDue&&!isDone?'rgba(245,158,11,.5)':'var(--b)')+'">' +
        '<div style="display:flex;align-items:flex-start;gap:10px">' +
          '<div onclick="toggleAlertDone('+i+')" style="width:22px;height:22px;border-radius:50%;border:2px solid '+(isDone?'var(--ok)':'var(--b)')+';background:'+(isDone?'var(--ok)':'transparent')+';display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:2px">' +
            (isDone?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>':'') +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:14px;font-weight:700;'+(isDone?'text-decoration:line-through;color:var(--t3)':'')+'">' + a.title + '</div>' +
            (a.product?'<div style="font-size:11px;margin-top:3px"><span style="background:var(--gsts);color:var(--gst);padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700">📦 '+a.product+'</span></div>':'') +
            (a.shops&&a.shops.length?'<div style="font-size:11px;color:var(--t2);margin-top:4px">🏪 '+a.shops.join(', ')+'</div>':'') +
            (a.notes?'<div style="font-size:11px;color:var(--t3);margin-top:3px">'+a.notes+'</div>':'') +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
              (a.dueDate?'<span style="font-size:10px;font-weight:700;color:'+(isDue&&!isDone?'var(--warn)':'var(--t3)')+'">📅 '+a.dueDate+'</span>':'') +
              '<span style="font-size:10px;color:var(--t3);text-transform:uppercase;font-weight:600">' + (a.type||'reminder') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:4px;flex-shrink:0">' +
            '<button class="btn bic" style="width:28px;height:28px" onclick="openAlertModal('+i+')">' + IC.edit + '</button>' +
            '<button class="btn bic" style="width:28px;height:28px;background:var(--errs);color:var(--err)" onclick="deleteAlert('+i+')">' + IC.trash + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') :
    '<div class="empty"><div class="eico">🔔</div><div class="etit">No alerts yet</div><div class="esub">Add reminders to call shops when products like Samyang become available</div></div>') +
  '</div>';
}

function openAlertModal(idx) { STATE.modal={type:'alert',data:{idx}}; render(); }
function renderAlertModal(data) {
  const idx = data?.idx;
  const existing = (idx !== null && idx !== undefined) ? getAlerts()[idx] : null;
  const v = k => existing ? (existing[k]||'') : '';
  const shops = STATE.shops.map(s=>s.name);
  const items = [...new Set([...STATE.items.map(i=>i.name), 'Samyang','Biscolata','Antabax','Momogi'])];
  const selShops = existing?.shops || [];
  const today = new Date().toISOString().split('T')[0];
  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div class="mtit" style="margin-bottom:0">' + (existing?'Edit Alert':'New Alert') + '</div>' +
      '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
    '</div>' +
    '<div class="fg">' +
      '<div class="iw"><label class="il">Alert Title *</label><input id="al-title" class="inp" value="' + v('title').replace(/"/g,'&quot;') + '" placeholder="e.g. Call when Samyang arrives"></div>' +
      '<div class="iw"><label class="il">Type</label><select id="al-type" class="inp">' +
        ['reminder','stock-alert','call-shop','follow-up','delivery'].map(t=>'<option'+(v('type')===t?' selected':'')+'>'+t+'</option>').join('') +
      '</select></div>' +
      '<div class="iw"><label class="il">Product (optional)</label><input id="al-product" class="inp" list="al-prod-list" value="' + v('product').replace(/"/g,'&quot;') + '" placeholder="e.g. Samyang Ramen">' +
        '<datalist id="al-prod-list">' + items.map(i=>'<option value="'+i+'">').join('') + '</datalist></div>' +
      '<div class="iw"><label class="il">Shops to call (select multiple)</label>' +
        '<div style="background:var(--s2);border:1.5px solid var(--b);border-radius:var(--rs);padding:10px;max-height:150px;overflow-y:auto">' +
        shops.map(s=>'<label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;font-size:13px">' +
          '<input type="checkbox" value="'+s+'" '+(selShops.includes(s)?'checked':'')+' style="accent-color:var(--a);width:16px;height:16px"> '+s+'</label>').join('') +
        (shops.length?'':'<div style="font-size:12px;color:var(--t3)">No shops yet</div>') +
        '</div></div>' +
      '<div class="iw"><label class="il">Due Date</label><input id="al-due" class="inp" type="date" value="' + (v('dueDate')||today) + '"></div>' +
      '<div class="iw"><label class="il">Notes</label><textarea id="al-notes" class="inp" style="min-height:60px">' + v('notes') + '</textarea></div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>' +
        '<button class="btn bp" style="flex:2;height:46px" onclick="saveAlert('+(idx!==null&&idx!==undefined?idx:'null')+')">Save Alert</button>' +
      '</div>' +
    '</div>';
}
function saveAlert(idx) {
  const title = (document.getElementById('al-title')||{}).value||'';
  if(!title.trim()){showToast('⚠️ Title required');return;}
  const type = (document.getElementById('al-type')||{}).value||'reminder';
  const product = (document.getElementById('al-product')||{}).value||'';
  const dueDate = (document.getElementById('al-due')||{}).value||'';
  const notes = (document.getElementById('al-notes')||{}).value||'';
  const shops = [...document.querySelectorAll('#modal-overlay input[type=checkbox]:checked')].map(c=>c.value);
  const alert = {title:title.trim(), type, product, shops, dueDate, notes, done:false, created:new Date().toISOString().split('T')[0]};
  const alerts = getAlerts();
  if(idx!==null&&idx!==undefined&&idx!=='null') alerts[idx]={...alerts[idx],...alert,done:alerts[idx].done};
  else alerts.push(alert);
  saveAlerts(alerts);
  showToast('✓ Alert saved');
  closeModal();
  if(STATE.page==='alerts') render();
}
function toggleAlertDone(idx) {
  const alerts = getAlerts();
  if(alerts[idx]) alerts[idx].done = !alerts[idx].done;
  saveAlerts(alerts);
  render();
}
function deleteAlert(idx) {
  const alerts = getAlerts();
  alerts.splice(idx,1);
  saveAlerts(alerts);
  showToast('Deleted');
  render();
}

// ── RESPONSIVE RESIZE ─────────────────────────────────────────────────────────
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => { if(STATE.user) render(); }, 120);
});