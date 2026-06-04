'use strict';
// ── SHOPS ─────────────────────────────────────────────────────────────────────
let shopsView = 'cards'; // 'cards' | 'database'

function renderShops() {
  if (shopsView === 'database') return renderShopDatabase();
  const sortOpts = [
    {v:'name', l:'Name'},
    {v:'total', l:'Total ↓'},
    {v:'due', l:'Due ↓'},
    {v:'priority', l:'Priority'},
    {v:'orders', l:'Orders ↓'},
  ];
  return '<div class="fu">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:10px">' +
    '<div><h1 style="font-size:22px;font-weight:800">Shops</h1><div style="font-size:12px;color:var(--t2)">' + STATE.shops.length + ' shops</div></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end">' +
      '<button class="btn bs" style="padding:10px 12px;font-size:12px;background:var(--as);color:var(--a);border:1px solid var(--a)" onclick="shopsView=\'database\';render()">🗄 Database</button>' +
      (!shopsMassMode ? '<button class="btn bp" style="padding:10px 14px;font-size:13px" onclick="openShopModal(null)">' + IC.plus + ' Add</button>' : '') +
      '<button class="btn bs" style="padding:10px 12px;font-size:12px" onclick="toggleShopsMassMode()">' + (shopsMassMode ? 'Exit' : 'Mass Delete') + '</button>' +
      (shopsMassMode ? '<button class="btn bd" style="padding:10px 12px;font-size:12px" onclick="deleteSelectedShops()">Delete (' + selectedShops.size + ')</button>' : '') +
    '</div></div>' +
    // Search + sort bar
    '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">' +
      '<div class="srchw" style="flex:1"><span class="srchi">' + IC.srch + '</span><input id="sh-srch" class="inp srchin" placeholder="Search by name, area, owner…" style="height:38px;font-size:13px" oninput="filterShops()"></div>' +
      '<select id="sh-sort" class="inp" style="height:38px;font-size:12px;padding:0 10px;width:auto" onchange="shopSort=this.value;filterShops()">' +
        sortOpts.map(o => '<option value="'+o.v+'"'+(shopSort===o.v?' selected':'')+'>'+o.l+'</option>').join('') +
      '</select>' +
    '</div>' +
    // Sort chips
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px">' +
      ['All','High','Medium','Low'].map(p =>
        '<button class="chip" id="sh-pri-'+p+'" onclick="setShopPriFilter(\''+p+'\')" style="flex-shrink:0">'+p+'</button>'
      ).join('') +
    '</div>' +
    '<input type="hidden" id="sh-pri-filter" value="All">' +
    '<div id="shops-list"></div></div>';
}

function renderShopDatabase() {
  // For each shop, try to resolve the "first seen" date
  const shopFirstSale = {};
  STATE.sales.forEach(s => {
    const k = normShopName(s.shopName);
    if (!shopFirstSale[k] || s.date < shopFirstSale[k]) shopFirstSale[k] = s.date;
  });
  const sorted = [...STATE.shops].sort((a,b) => {
    const da = a.createdAt || shopFirstSale[normShopName(a.name)] || '9999';
    const db2 = b.createdAt || shopFirstSale[normShopName(b.name)] || '9999';
    return da.localeCompare(db2);
  });

  const fmtDate = d => {
    if (!d) return '—';
    const dd = new Date(d);
    if (isNaN(dd)) return d;
    return dd.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  };

  return '<div class="fu">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
      '<div><h1 style="font-size:22px;font-weight:800">Shop Database</h1>' +
      '<div style="font-size:12px;color:var(--t2)">' + sorted.length + ' shops · sorted by date added</div></div>' +
      '<button class="btn bs" style="padding:10px 12px;font-size:12px" onclick="shopsView=\'cards\';render()">← Back to Shops</button>' +
    '</div>' +
    '<div class="tw"><table class="dt"><thead><tr>' +
      '<th>#</th><th>Shop Name</th><th>Owner</th><th>Area</th><th>Priority</th><th>Contact</th><th>Date Added</th><th>First Sale</th>' +
    '</tr></thead><tbody>' +
    sorted.map((shop, i) => {
      const firstSale = shopFirstSale[normShopName(shop.name)];
      const createdDisplay = shop.createdAt ? fmtDate(shop.createdAt) : (firstSale ? '<span style="color:var(--t3);font-size:10px">≈</span> ' + fmtDate(firstSale) : '<span style="color:var(--t3)">Unknown</span>');
      return '<tr style="cursor:pointer" onclick="openShopDetail(\''+shop.id+'\')">' +
        '<td style="color:var(--t3);font-size:11px">' + (i+1) + '</td>' +
        '<td><div style="font-weight:700;font-size:13px">' + esc(shop.name) + '</div>' + (shop.type?'<div style="font-size:10px;color:var(--t3)">'+esc(shop.type)+'</div>':'') + '</td>' +
        '<td style="font-size:12px;color:var(--t2)">' + esc(shop.owner||'—') + '</td>' +
        '<td style="font-size:12px;color:var(--t2)">' + esc(shop.area||'—') + '</td>' +
        '<td><span class="badge '+(shop.priority==='High'?'bpaid':shop.priority==='Medium'?'bpart':'')+'" style="font-size:9px">'+(shop.priority||'—')+'</span></td>' +
        '<td style="font-size:12px">' + esc(shop.contact||'—') + '</td>' +
        '<td style="font-size:12px;white-space:nowrap">' + createdDisplay + '</td>' +
        '<td style="font-size:12px;color:var(--t3);white-space:nowrap">' + (firstSale ? fmtDate(firstSale) : '—') + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';
}
function bindShops() {
  // Set active priority chip
  const cur = (document.getElementById('sh-pri-filter')||{}).value||'All';
  document.querySelectorAll('[id^="sh-pri-"]').forEach(b => {
    b.classList.toggle('on', b.id === 'sh-pri-'+cur);
  });
  filterShops();
}
function setShopPriFilter(p) {
  const el = document.getElementById('sh-pri-filter'); if(el) el.value = p;
  document.querySelectorAll('[id^="sh-pri-"]').forEach(b => b.classList.toggle('on', b.id === 'sh-pri-'+p));
  filterShops();
}
function getVisibleShops() {
  const srch = ((document.getElementById('sh-srch')||{}).value||'').toLowerCase();
  const pri = (document.getElementById('sh-pri-filter')||{}).value||'All';
  const sort = shopSort || 'name';
  let shops = STATE.shops.filter(s =>
    (!srch || s.name.toLowerCase().includes(srch) || (s.area||'').toLowerCase().includes(srch) || (s.owner||'').toLowerCase().includes(srch)) &&
    (pri === 'All' || s.priority === pri)
  );
  // Compute sales stats for sorting
  const statsMap = {};
  STATE.sales.forEach(r => {
    if (!statsMap[r.shopName]) statsMap[r.shopName] = {total:0, due:0, orders:0};
    statsMap[r.shopName].total += saleFinalTotal(r);
    statsMap[r.shopName].orders++;
    if (r.paymentStatus === 'Pending') statsMap[r.shopName].due += saleFinalTotal(r);
  });
  const priOrder = {High:0, Medium:1, Low:2};
  shops.sort((a, b) => {
    const as = statsMap[a.name]||{total:0,due:0,orders:0};
    const bs = statsMap[b.name]||{total:0,due:0,orders:0};
    switch(sort) {
      case 'total': return bs.total - as.total;
      case 'due': return bs.due - as.due;
      case 'orders': return bs.orders - as.orders;
      case 'priority': return (priOrder[a.priority]??2) - (priOrder[b.priority]??2);
      default: return a.name.localeCompare(b.name);
    }
  });
  return shops;
}
function toggleShopsMassMode() { shopsMassMode = !shopsMassMode; selectedShops.clear(); render(); }
function toggleShopSelect(id, checked) { if (checked) selectedShops.add(id); else selectedShops.delete(id); filterShops(); }
function selectAllVisibleShops() { getVisibleShops().forEach(s=>selectedShops.add(s.id)); filterShops(); }
function clearShopSelection() { selectedShops.clear(); filterShops(); }
function deleteSelectedShops() {
  if (!selectedShops.size) { showToast('Nothing selected'); return; }
  if (!confirm('Delete ' + selectedShops.size + ' selected shops?')) return;
  STATE.shops = STATE.shops.filter(s => !selectedShops.has(s.id));
  selectedShops.clear();
  saveState();
  showToast('Deleted selected shops');
  render();
}
function deleteAllShops() {
  if (!confirm('Delete ALL shops?')) return;
  STATE.shops = [];
  selectedShops.clear();
  saveState();
  showToast('Deleted all shops');
  render();
}
function filterShops() {
  const shops = getVisibleShops();
  const el = document.getElementById('shops-list'); if(!el) return;
  if(!shops.length){el.innerHTML='<div class="empty"><div class="eico">🎪</div><div class="etit">No shops found</div></div>';return;}

  if (isDesktop()) {
    // Desktop: compact table view
    el.innerHTML = '<div class="tw"><table class="dt"><thead><tr><th>Shop</th><th>Owner</th><th>Area</th><th>Priority</th><th class="nr">Total</th><th class="nr">Due</th><th>Orders</th><th></th></tr></thead><tbody>' +
      shops.map(shop => {
        const ss = STATE.sales.filter(r=>normShopName(r.shopName)===normShopName(shop.name));
        const stot = ss.reduce((a,r)=>a+saleFinalTotal(r),0);
        const spend = ss.filter(r=>r.paymentStatus==='Pending').reduce((a,r)=>a+saleFinalTotal(r),0);
        return '<tr style="cursor:pointer" onclick="openShopDetail(\'' + shop.id + '\')">' +
          '<td><div style="font-weight:700;font-size:13px">' + shop.name + '</div>' + (shop.type?'<div style="font-size:10px;color:var(--t3)">'+shop.type+'</div>':'') + '</td>' +
          '<td style="font-size:12px;color:var(--t2)">' + (shop.owner||'—') + '</td>' +
          '<td style="font-size:12px;color:var(--t2)">' + (shop.area||'—') + '</td>' +
          '<td><span class="badge ' + (shop.priority==='High'?'bpaid':shop.priority==='Medium'?'bpart':'') + '" style="font-size:9px">' + (shop.priority||'—') + '</span></td>' +
          '<td class="nr" style="font-weight:700;font-size:13px;color:var(--a)">' + money(stot) + '</td>' +
          '<td class="nr" style="font-weight:700;font-size:12px;color:' + (spend>0?'var(--warn)':'var(--t3)') + '">' + (spend>0?money(spend):'—') + '</td>' +
          '<td style="font-size:12px;color:var(--t2);text-align:center">' + ss.length + '</td>' +
          '<td><div style="display:flex;gap:4px">' +
            '<button class="btn bic" style="width:28px;height:28px" onclick="event.stopPropagation();openShopModal(\'' + shop.id + '\')">' + IC.edit + '</button>' +
            '<button class="btn bic" style="width:28px;height:28px;background:var(--errs);color:var(--err)" onclick="event.stopPropagation();delShop(\'' + shop.id + '\')">' + IC.trash + '</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table></div>';
    return;
  }

  // Mobile: card view
  el.innerHTML = shops.map(shop => {
    const ss = STATE.sales.filter(r=>normShopName(r.shopName)===normShopName(shop.name));
    const stot = ss.reduce((a,r)=>a+saleFinalTotal(r),0);
    const spend = ss.filter(r=>r.paymentStatus==='Pending').reduce((a,r)=>a+saleFinalTotal(r),0);
    return '<div class="card csm chov" style="margin-bottom:10px;position:relative;cursor:pointer' + (selectedShops.has(shop.id)?';background:var(--as)':'') + '" onclick="' + (shopsMassMode?'':'openShopDetail(\''+shop.id+'\')') + '">' +
      (shopsMassMode ? '<div style="position:absolute;top:12px;right:12px" onclick="event.stopPropagation()"><input type="checkbox" ' + (selectedShops.has(shop.id)?'checked':'') + ' onchange="toggleShopSelect(\'' + shop.id + '\',this.checked)"></div>' : '') +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div style="flex:1"><div style="display:flex;align-items:center;gap:7px;margin-bottom:2px">' +
      '<div style="font-size:15px;font-weight:700">' + shop.name + '</div>' +
      '<span class="badge ' + (shop.priority==='High'?'bpaid':shop.priority==='Medium'?'bpart':'') + '" style="font-size:9px">' + (shop.priority||'—') + '</span>' + (shop.type?'<span class="tag" style="font-size:9px;margin-left:4px">'+shop.type+'</span>':'') + '</div>' +
      '<div style="font-size:11px;color:var(--t2)">' + (shop.owner?shop.owner+' · ':'') + (shop.area||'') + '</div>' +
      (shop.contact?'<div style="font-size:11px;color:var(--t3)">📞 '+shop.contact+'</div>':'') + '</div>' +
      '<div style="text-align:right;margin-left:12px"><div style="font-size:15px;font-weight:800;color:var(--a)">' + money(stot) + '</div>' +
      (spend>0?'<div style="font-size:10px;color:var(--warn)">'+money(spend)+' due</div>':'') +
      '<div style="font-size:10px;color:var(--t3)">' + ss.length + ' orders</div></div></div>' +
      (!shopsMassMode ? '<div style="display:flex;gap:6px;margin-top:10px">' +
        (STATE.isAgent || STATE.isAdmin ? '<button class="btn bp" style="flex:1;height:36px;font-size:12px" onclick="event.stopPropagation();openCheckin(\'' + shop.id + '\')">📍 Check In</button>' : '') +
        (STATE.isAdmin ? '<button class="btn" style="flex:1;height:36px;font-size:12px;background:var(--as);color:var(--a);border-radius:var(--rs)" onclick="event.stopPropagation();openPinDropModal(\'' + shop.id + '\')">' + (shop.lat&&shop.lng?'📍 Re-pin':'📍 Set Location') + '</button>' : '') +
        '<button class="btn bs" style="flex:1;height:36px;font-size:12px" onclick="event.stopPropagation();openShopModal(\'' + shop.id + '\')">' + IC.edit + ' Edit</button>' +
        (STATE.isAdmin ? '<button class="btn bd" style="flex:1;height:36px;font-size:12px" onclick="event.stopPropagation();delShop(\'' + shop.id + '\')">' + IC.trash + '</button>' : '') +
      '</div>' : '') +
      '</div>';
  }).join('');
}
function openShopDetail(id) { STATE.modal={type:'shopdetail',data:{id}}; render(); }
function renderShopDetailModal(id) {
  const shop = STATE.shops.find(s=>s.id===id); if(!shop) return '<div class="mhan"></div><div class="mtit">Not found</div>';
  const ss = STATE.sales.filter(r=>r.shopName===shop.name).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const stot = ss.reduce((a,r)=>a+saleFinalTotal(r),0);
  const spend = ss.filter(r=>r.paymentStatus==='Pending').reduce((a,r)=>a+saleFinalTotal(r),0);
  const spaid = ss.filter(r=>r.paymentStatus==='Paid').reduce((a,r)=>a+saleFinalTotal(r),0);
  const lastSale = ss[0];
  // Group by invoice for compact view
  const imap={};
  ss.forEach(s=>{const k=s.invoiceId||(s.shopName+'-'+s.date);if(!imap[k])imap[k]={id:k,date:s.date,items:[],total:0};imap[k].items.push(s);imap[k].total+=saleFinalTotal(s);});
  const invList = Object.values(imap).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-family:Outfit,sans-serif;font-size:19px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + shop.name + '</div>' +
        '<div style="font-size:11px;color:var(--t2)">' + (shop.area||'') + (shop.type?' · '+shop.type:'') + '</div>' +
      '</div>' +
      '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&times;</button>' +
    '</div>' +
    // Stats row
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">' +
      '<div style="background:var(--as);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:10px;color:var(--a);font-weight:700;text-transform:uppercase">Total</div><div style="font-size:14px;font-weight:800;color:var(--a);margin-top:2px">' + money(stot) + '</div></div>' +
      '<div style="background:var(--oks);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:10px;color:var(--ok);font-weight:700;text-transform:uppercase">Paid</div><div style="font-size:14px;font-weight:800;color:var(--ok);margin-top:2px">' + money(spaid) + '</div></div>' +
      '<div style="background:var(--warns);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:10px;color:var(--warn);font-weight:700;text-transform:uppercase">Due</div><div style="font-size:14px;font-weight:800;color:var(--warn);margin-top:2px">' + money(spend) + '</div></div>' +
    '</div>' +
    // Contact info
    '<div style="background:var(--s2);border-radius:var(--rs);padding:12px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px">' +
      (shop.owner?'<div style="display:flex;gap:8px;align-items:center;font-size:13px">👤 <span style="font-weight:600">'+esc(shop.owner)+'</span></div>':'') +
      (shop.contact?'<div style="display:flex;gap:8px;align-items:center;font-size:13px">📞 <a href="tel:'+esc(shop.contact)+'" style="color:var(--a);font-weight:600;text-decoration:none">'+esc(shop.contact)+'</a></div>':'') +
      (shop.notes?'<div style="font-size:12px;color:var(--t2)">📝 '+esc(shop.notes)+'</div>':'') +
      '<div style="font-size:11px;color:var(--t3)">'+ss.length+' orders · Last: '+(lastSale?lastSale.date:'never')+'</div>' +
    '</div>' +
    // Recent invoices
    '<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Recent Orders</div>' +
    (invList.length ? invList.map(inv=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b)">' +
      '<div><div style="font-size:12px;font-weight:600">' + inv.id + '</div><div style="font-size:10px;color:var(--t2)">' + inv.date + ' · ' + inv.items.length + ' item' + (inv.items.length!==1?'s':'') + '</div></div>' +
      '<div style="font-weight:700;font-size:13px;color:var(--a)">' + money(inv.total) + '</div>' +
    '</div>').join('') : '<div style="font-size:12px;color:var(--t3);padding:10px 0">No orders yet</div>') +
    // Check-in history
    (() => {
      const shopCheckins = STATE.checkins
        .filter(c => c.shopId===id && (STATE.isAdmin || c.agentId===STATE.agentId))
        .sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,5);
      if (!shopCheckins.length) return '';
      return '<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;margin-top:14px">📍 Recent Check-ins</div>' +
        shopCheckins.map(c=>{
          const d=new Date(c.ts);
          const when=d.toLocaleDateString('en',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
          return '<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">' +
            '<div style="width:28px;height:28px;border-radius:50%;background:var(--as);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:var(--a);flex-shrink:0">'+(c.agentName||'?')[0].toUpperCase()+'</div>' +
            '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600">'+(STATE.isAdmin?c.agentName+' · ':'')+when+(c.distanceM?' · '+c.distanceM+'m':'')+'</div>' +
            (c.note?'<div style="font-size:11px;color:var(--t2);font-style:italic">"'+esc(c.note)+'"</div>':'')+'</div>' +
            '<span style="background:var(--oks);color:var(--ok);padding:2px 7px;border-radius:99px;font-size:9px;font-weight:700;flex-shrink:0">✓</span></div>';
        }).join('');
    })() +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
      (STATE.isAgent || STATE.isAdmin?'<button class="btn bp" style="flex:1;height:44px;font-size:13px" onclick="closeModal();openCheckin(\''+id+'\')">📍 Check In</button>':'') +
      '<button class="btn bs" style="flex:1;height:44px;font-size:13px" onclick="closeModal();openShopModal(\''+id+'\')">✏️ Edit</button>' +
      (STATE.isAdmin?'<button class="btn bp" style="flex:1;height:44px;font-size:13px" onclick="closeModal();openAddSale()">+ Sale</button>':'') +
      (shop.contact?'<a href="tel:'+shop.contact+'" class="btn bs" style="flex:1;height:44px;font-size:13px;text-decoration:none">📞 Call</a>':'') +
    '</div>';
}
function openShopModal(id) { STATE.modal={type:'shop',data:{id}}; render(); }
function delShop(id) {
  const shop = STATE.shops.find(s=>s.id===id);
  if(confirm('Remove this shop?')){
    STATE.shops=STATE.shops.filter(s=>s.id!==id);
    saveState();
    logActivity('shop_delete', (STATE.user?.name||'?') + ' deleted shop: ' + (shop?.name||id));
    showToast('Removed');
    render();
  }
}
function renderShopModal(id) {
  const shop = id ? STATE.shops.find(s=>s.id===id) : null;
  // Restore values saved before pin-drop, or fall back to existing shop data
  const saved = STATE.modal?.data?.saved || {};
  const pendingLat = STATE.modal?.data?.lat || null;
  const pendingLng = STATE.modal?.data?.lng || null;
  const v = k => saved[k] !== undefined ? saved[k] : (shop ? (shop[k]||'') : '');
  const lat = pendingLat || shop?.lat || '';
  const lng = pendingLng || shop?.lng || '';
  const hasCoords = !!(lat && lng);
  return '<div class="mhan"></div><div class="mtit">' + (shop?'Edit Shop':'Add Shop') + '</div><div class="fg">' +
    '<div class="iw"><label class="il">Shop Name *</label><input id="sm-name" class="inp" value="' + v('name') + '" placeholder="e.g. Al Noor Mart"></div>' +
    '<div class="fr"><div class="iw"><label class="il">Owner</label><input id="sm-owner" class="inp" value="' + v('owner') + '" placeholder="Owner name"></div>' +
    '<div class="iw"><label class="il">Contact</label><input id="sm-contact" class="inp" value="' + v('contact') + '" placeholder="Phone"></div></div>' +
    '<div class="fr"><div class="iw"><label class="il">Area</label><input id="sm-area" class="inp" value="' + v('area') + '" placeholder="e.g. Male\'"></div>' +
    '<div class="iw"><label class="il">Priority</label><select id="sm-priority" class="inp">' +
    ['High','Medium','Low'].map(p=>'<option' + (v('priority')===p?' selected':'') + '>' + p + '</option>').join('') + '</select></div></div>' +
    // Location section — pin-drop map
    '<div style="background:var(--s2);border-radius:var(--rm);padding:12px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em">📍 Location</div>' +
        (hasCoords ? '<a href="https://maps.google.com/?q=' + lat + ',' + lng + '" target="_blank" style="font-size:11px;color:var(--a);text-decoration:none">View on map ↗</a>' : '') +
      '</div>' +
      // Hidden lat/lng fields — set by pin drop or GPS
      '<input type="hidden" id="sm-lat" value="' + (lat||'') + '">' +
      '<input type="hidden" id="sm-lng" value="' + (lng||'') + '">' +
      // Status + preview
      '<div id="sm-loc-status" style="font-size:12px;margin-bottom:10px;' + (hasCoords?'color:var(--ok)':'color:var(--t3)') + '">' +
        (hasCoords ? '✓ Location set: ' + parseFloat(lat).toFixed(4) + ', ' + parseFloat(lng).toFixed(4) : 'No location set — drop a pin or use GPS') +
      '</div>' +
      // Map preview (shown when coords exist)
      '<div id="shop-loc-preview" style="display:' + (hasCoords?'block':'none') + ';border-radius:var(--rs);overflow:hidden;margin-bottom:10px">' +
        '<div id="shop-loc-preview-map" style="height:160px;width:100%"></div>' +
      '</div>' +
      // Action buttons
      '<div style="display:flex;gap:8px">' +
        '<button type="button" onclick="openPinDropModal(\'' + (id||'') + '\')" class="btn bp" style="flex:2;height:40px;font-size:13px;font-weight:700">🗺 Drop a Pin on Map</button>' +
        '<button type="button" onclick="captureShopLocation()" class="btn bs" style="flex:1;height:40px;font-size:12px">📍 GPS</button>' +
      '</div>' +
    '</div>' +
    '<div class="iw"><label class="il">Notes</label><textarea id="sm-notes" class="inp">' + v('notes') + '</textarea></div>' +
    '<div style="display:flex;gap:10px"><button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>' +
    '<button class="btn bp" style="flex:2;height:46px" onclick="saveShop(\'' + (id||'') + '\')">' + (shop?'Save Changes':'Add Shop') + '</button></div></div>';
}
let _pinDropMap=null, _pinDropMarker=null, _pinDropLat=null, _pinDropLng=null;

function openPinDropModal(shopId) {
  // If called from inside the shop form modal, save current form values
  // so they survive the modal switch; otherwise fall back to shop data
  const nameEl = document.getElementById('sm-name');
  const shopData = shopId ? STATE.shops.find(s=>s.id===shopId) : null;
  const saved = nameEl ? {
    name:     nameEl.value||'',
    owner:    (document.getElementById('sm-owner')||{}).value||'',
    contact:  (document.getElementById('sm-contact')||{}).value||'',
    area:     (document.getElementById('sm-area')||{}).value||'',
    priority: (document.getElementById('sm-priority')||{}).value||'Medium',
    notes:    (document.getElementById('sm-notes')||{}).value||'',
  } : {
    name:     shopData?.name||'',
    owner:    shopData?.owner||'',
    contact:  shopData?.contact||'',
    area:     shopData?.area||'',
    priority: shopData?.priority||'Medium',
    notes:    shopData?.notes||'',
  };
  window._pinDropShopId = shopId;
  STATE.modal = {type:'pindrop', data:{shopId, saved}};
  render();
}

function renderPinDropModal(shopId) {
  const shop = shopId ? STATE.shops.find(s=>s.id===shopId) : null;
  const shopName = shop?.name || 'Shop';
  const currentLat = shop?.lat || _pinDropLat;
  const currentLng = shop?.lng || _pinDropLng;
  return '<div style="display:flex;flex-direction:column;height:93vh">' +
    '<div style="padding:14px 16px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--b);flex-shrink:0">' +
      '<div><div style="font-family:Outfit,sans-serif;font-size:17px;font-weight:800">📍 Drop a Pin</div>' +
      '<div style="font-size:11px;color:var(--t2)">Tap map to set location for <strong>'+shopName+'</strong></div></div>' +
      '<button onclick="closePinDrop()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;color:var(--t2);display:flex;align-items:center;justify-content:center">×</button>' +
    '</div>' +
    '<div id="pindrop-status" style="padding:10px 16px;background:var(--as);font-size:12px;font-weight:600;color:var(--a);text-align:center;flex-shrink:0">' +
      (currentLat?'📍 Pin at '+parseFloat(currentLat).toFixed(4)+', '+parseFloat(currentLng).toFixed(4)+' — tap to move':'👆 Tap anywhere on the map to drop a pin') +
    '</div>' +
    '<div id="pindrop-map" style="flex:1;min-height:0"></div>' +
    '<div style="padding:12px 16px;display:flex;gap:10px;border-top:1px solid var(--b);background:var(--s);flex-shrink:0">' +
      '<button onclick="centerPinDropOnMe()" class="btn bs" style="flex:1;height:44px;font-size:13px">📍 My Location</button>' +
      '<button id="pindrop-confirm" onclick="confirmPinDrop()" class="btn bp" style="flex:2;height:44px;font-size:14px;font-weight:700" '+(currentLat?'':'disabled')+'>✓ Confirm Location</button>' +
    '</div>' +
  '</div>';
}

function bindPinDropModal(shopId) {
  const shop = shopId ? STATE.shops.find(s=>s.id===shopId) : null;
  _pinDropLat = shop?.lat || null;
  _pinDropLng = shop?.lng || null;
  setTimeout(() => {
    const container = document.getElementById('pindrop-map');
    if (!container || !window.L) return;
    if (_pinDropMap) { _pinDropMap.remove(); _pinDropMap=null; _pinDropMarker=null; }
    const center = _pinDropLat ? [_pinDropLat,_pinDropLng] : [4.1755,73.5093];
    _pinDropMap = L.map('pindrop-map',{zoomControl:true,tap:true}).setView(center,_pinDropLat?17:14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',maxZoom:19}).addTo(_pinDropMap);
    // Existing pin
    if (_pinDropLat) {
      _pinDropMarker = L.marker([_pinDropLat,_pinDropLng],{icon:L.divIcon({className:'',html:'<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#6366F1;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);transform:rotate(-45deg);margin:-14px 0 0 -14px"></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(_pinDropMap);
    }
    // Other shops as reference
    STATE.shops.filter(s=>s.lat&&s.lng&&s.id!==shopId).forEach(s=>{
      L.circleMarker([s.lat,s.lng],{radius:5,color:'#fff',fillColor:'#8B8BCC',fillOpacity:0.6,weight:1}).addTo(_pinDropMap).bindTooltip(s.name,{direction:'top'});
    });
    // User location dot
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos=>{
        if(!_pinDropMap) return;
        L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:8,color:'#fff',fillColor:'#F59E0B',fillOpacity:1,weight:2}).addTo(_pinDropMap).bindTooltip('You',{permanent:false});
      },()=>{},{enableHighAccuracy:true,timeout:6000});
    }
    // Tap to drop/move pin
    _pinDropMap.on('click', e => {
      _pinDropLat = e.latlng.lat; _pinDropLng = e.latlng.lng;
      if (_pinDropMarker) _pinDropMap.removeLayer(_pinDropMarker);
      _pinDropMarker = L.marker([_pinDropLat,_pinDropLng],{icon:L.divIcon({className:'',html:'<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#6366F1;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);transform:rotate(-45deg);margin:-14px 0 0 -14px"></div>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(_pinDropMap);
      const st=document.getElementById('pindrop-status');
      if(st) st.innerHTML='📍 Pin at '+_pinDropLat.toFixed(4)+', '+_pinDropLng.toFixed(4)+' — tap to move';
      const btn=document.getElementById('pindrop-confirm');
      if(btn) btn.disabled=false;
    });
  }, 150);
}

function centerPinDropOnMe() {
  if(!navigator.geolocation||!_pinDropMap){showToast('⚠️ GPS not available');return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    _pinDropMap.setView([pos.coords.latitude,pos.coords.longitude],18);
  },e=>showToast('⚠️ '+(e.code===1?'Allow location':e.code===2?'GPS unavailable':'Timed out')),{enableHighAccuracy:true,timeout:8000});
}

function confirmPinDrop() {
  if(!_pinDropLat||!_pinDropLng){showToast('⚠️ Tap the map to drop a pin first');return;}
  const shopId = window._pinDropShopId;
  const saved = STATE.modal?.data?.saved || {};
  if(shopId) {
    STATE.shops=STATE.shops.map(s=>s.id===shopId?{...s,lat:_pinDropLat,lng:_pinDropLng}:s);
    saveState();
    const name=STATE.shops.find(s=>s.id===shopId)?.name||'shop';
    showToast('✓ Location saved for '+name);
  }
  const lat=_pinDropLat, lng=_pinDropLng;
  _pinDropLat=null; _pinDropLng=null;
  if(_pinDropMap){_pinDropMap.remove();_pinDropMap=null;}
  STATE.modal={type:'shop', data:{id:shopId||'', saved, lat, lng}};
  render();
}

function closePinDrop() {
  if(_pinDropMap){_pinDropMap.remove();_pinDropMap=null;_pinDropMarker=null;}
  _pinDropLat=null; _pinDropLng=null;
  const shopId=window._pinDropShopId;
  const saved = STATE.modal?.data?.saved || {};
  STATE.modal=shopId?{type:'shop',data:{id:shopId, saved}}:{type:'shop',data:{id:'', saved}};
  render();
}

function saveShop(id) {
  const v = i => (document.getElementById(i)||{}).value||'';
  const name = v('sm-name'); if(!name){showToast('⚠️ Shop name required');return;}
  const lat = parseFloat(v('sm-lat'))||null;
  const lng = parseFloat(v('sm-lng'))||null;
  const data = {name,owner:v('sm-owner'),contact:v('sm-contact'),area:v('sm-area'),type:v('sm-type')||'',priority:v('sm-priority')||'Medium',notes:v('sm-notes'),lat,lng};
  if(id) {
    STATE.shops=STATE.shops.map(s=>s.id===id?{...s,...data}:s);
    logActivity('shop_edit', (STATE.user?.name||'?') + ' edited shop: ' + name);
  } else {
    STATE.shops.push({id:uid(),...data,lastVisit:new Date().toISOString().split('T')[0],createdAt:new Date().toISOString()});
    logActivity('shop_add', (STATE.user?.name||'?') + ' added shop: ' + name);
  }
  saveState(); showToast('✓ Saved'); closeModal();
}