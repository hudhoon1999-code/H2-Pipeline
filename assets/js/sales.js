'use strict';
// ── ADD SALE + SALES PAGE ─────────────────────────────────────────────────
// ── ADD SALE ──────────────────────────────────────────────────────────────────
// ── ADD SALE — multi-item state ───────────────────────────────────────────────
let saleItems = []; // array of {id, itemName, category, priceType, unitPrice, quantity, gstInclusive, lineTotal, gstAmt, finalTotal}

function openAddSale() {
  saleItems = [newSaleItem()];
  STATE.modal = {type:'addsale'};
  render();
}

function newSaleItem() {
  return {
    id: uid(), itemName:'', category:'', priceType:'unit',
    unitPrice:0, quantity:1, gstInclusive:false,
    lineTotal:0, gstAmt:0, finalTotal:0
  };
}

function renderAddSaleModal() {
  const today = new Date().toISOString().split('T')[0];
  const invoiceTotal = saleItems.reduce((a,i)=>a+(i.finalTotal||0),0);
  const invoiceGST = saleItems.reduce((a,i)=>a+(i.gstAmt||0),0);
  const invoiceLine = saleItems.reduce((a,i)=>a+(i.lineTotal||0),0);

  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">' +
      '<div><div style="font-family:Outfit,sans-serif;font-size:20px;font-weight:800">New Invoice</div>' +
      '<div style="font-size:11px;color:var(--t2);margin-top:2px">' + saleItems.length + ' item' + (saleItems.length!==1?'s':'') + ' · ' + money(invoiceTotal) + ' total</div></div>' +
      '<div style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700">' + money(invoiceTotal) + '</div>' +
    '</div>' +

    // Invoice header
    '<div style="background:var(--s2);border-radius:var(--rm);padding:14px;margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Invoice Details</div>' +
      '<div class="fr" style="gap:10px;margin-bottom:10px">' +
        '<div class="iw"><label class="il">Date</label><input id="sd-date" class="inp" type="date" value="' + today + '" style="height:40px"></div>' +
        '<div class="iw"><label class="il">Invoice #</label><input id="sd-inv" class="inp" placeholder="INV-001" style="height:40px"></div>' +
      '</div>' +
      '<div class="iw acw" style="margin-bottom:10px"><label class="il">Shop *</label>' +
        '<input id="sd-shop" class="inp" placeholder="Search shop…" style="height:40px" ' +
          'oninput="acShow(\'sd-shop\',\'ac-shop\',STATE.shops.map(s=>s.name))" ' +
          'onfocus="acShow(\'sd-shop\',\'ac-shop\',STATE.shops.map(s=>s.name))" ' +
          'onblur="setTimeout(()=>acHide(\'ac-shop\'),200)">' +
        '<div id="ac-shop" class="acd"></div>' +
      '</div>' +
      '<div class="fr" style="gap:10px">' +
        '<div class="iw"><label class="il">Area</label><input id="sd-area" class="inp" placeholder="e.g. Male&apos;" style="height:40px"></div>' +
        '<div class="iw"><label class="il">Payment</label>' +
          '<select id="sd-status" class="inp" style="height:40px">' +
            '<option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Partial">Partial</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // Items section
    '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Line Items</div>' +
    '<div id="sale-items-list">' + saleItems.map((item,idx) => renderSaleItemRow(item,idx)).join('') + '</div>' +

    // Add item button
    '<button onclick="addSaleItem()" style="width:100%;height:42px;border:1.5px dashed var(--b);background:transparent;color:var(--t2);border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;transition:all .2s" onmouseover="this.style.borderColor=\'var(--a)\';this.style.color=\'var(--a)\'" onmouseout="this.style.borderColor=\'var(--b)\';this.style.color=\'var(--t2)\'">' +
      IC.plus + ' Add Item' +
    '</button>' +

    // Invoice summary
    (saleItems.length > 0 && invoiceTotal > 0 ?
    '<div style="background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08));border:1px solid rgba(99,102,241,.2);border-radius:var(--rm);padding:14px;margin-bottom:16px">' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:6px"><span>Subtotal</span><span>' + money(invoiceLine) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gst);margin-bottom:8px"><span>GST @ 8%</span><span>' + money(invoiceGST) + '</span></div>' +
      '<div style="height:1px;background:rgba(99,102,241,.2);margin-bottom:8px"></div>' +
      '<div style="display:flex;justify-content:space-between;font-family:Outfit,sans-serif;font-size:18px;font-weight:800"><span>Total</span><span style="color:var(--a)">' + money(invoiceTotal) + '</span></div>' +
    '</div>' : '') +

    '<div style="display:flex;gap:10px">' +
      '<button class="btn bs" style="flex:1;height:48px" onclick="closeModal()">Cancel</button>' +
      '<button class="btn bp" style="flex:2;height:48px;font-size:15px;font-weight:700" onclick="saveInvoice()">Save Invoice</button>' +
    '</div>';
}

function renderSaleItemRow(item, idx) {
  const catalogItem = STATE.items.find(i=>i.name.toLowerCase()===(item.itemName||'').toLowerCase());
  const tiers = catalogItem ? calcTiers(catalogItem) : null;
  return '<div id="sir-'+item.id+'" style="background:var(--s2);border:1px solid var(--b);border-radius:var(--rm);padding:12px;margin-bottom:10px;position:relative">' +
    // Row header
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em">Item ' + (idx+1) + '</div>' +
      '<div style="display:flex;align-items:center;gap:6px">' +
        (item.finalTotal > 0 ? '<div style="font-size:12px;font-weight:700;color:var(--a)">' + money(item.finalTotal) + '</div>' : '') +
        (saleItems.length > 1 ? '<button onclick="removeSaleItem(&quot;'+item.id+'&quot;)" style="width:24px;height:24px;border-radius:50%;background:var(--errs);color:var(--err);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1">×</button>' : '') +
      '</div>' +
    '</div>' +

    // Item name autocomplete
    '<div class="iw acw" style="margin-bottom:8px">' +
      '<input class="inp" placeholder="Search item…" value="' + (item.itemName||'') + '" style="height:38px" ' +
        'oninput="saleItemInput(\''+item.id+'\',\'name\',this.value);acShowSI(\''+item.id+'\')" ' +
        'onfocus="acShowSI(\''+item.id+'\')" ' +
        'onblur="setTimeout(()=>acHide(\'ac-si-'+item.id+'\'),200)">' +
      '<div id="ac-si-'+item.id+'" class="acd"></div>' +
    '</div>' +

    // Price type chips
    '<div style="display:flex;gap:5px;margin-bottom:8px">' +
      ['unit','halfCase','casePrice'].map(pt => {
        const price = tiers ? (pt==='unit'?tiers.unit:pt==='halfCase'?tiers.halfCase:tiers.casePrice) : 0;
        const lbl = pt==='unit'?'Unit'+(price>0?' · '+money(price):''):pt==='halfCase'?'Half Case'+(price>0?' · '+money(price):''):'Case'+(price>0?' · '+money(price):'');
        return '<button onclick="saleItemSetType(\''+item.id+'\',\''+pt+'\')" style="flex:1;padding:6px 4px;border-radius:var(--rx);border:1.5px solid '+(item.priceType===pt?'var(--a)':'var(--b)')+';background:'+(item.priceType===pt?'var(--as)':'transparent')+';color:'+(item.priceType===pt?'var(--a)':'var(--t3)')+';font-size:10px;font-weight:700;cursor:pointer;transition:all .15s">' + lbl + '</button>';
      }).join('') +
    '</div>' +

    // Qty + Price row
    '<div class="fr" style="gap:8px;margin-bottom:8px">' +
      '<div class="iw"><label class="il">Qty</label>' +
        '<input class="inp" type="number" value="' + (item.quantity||1) + '" min="0.5" step="0.5" style="height:38px;text-align:center;font-size:16px;font-weight:700" ' +
          'oninput="saleItemInput(\''+item.id+'\',\'quantity\',parseFloat(this.value)||1)">' +
      '</div>' +
      '<div class="iw"><label class="il">Unit Price</label>' +
        '<input class="inp" type="number" value="' + (item.unitPrice||'') + '" step="0.01" placeholder="0.00" style="height:38px" ' +
          'oninput="saleItemInput(\''+item.id+'\',\'unitPrice\',parseFloat(this.value)||0)">' +
      '</div>' +
    '</div>' +

    // GST toggle + totals
    '<div style="display:flex;align-items:center;justify-content:space-between">' +
      '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--gst);font-weight:600">' +
        '<input type="checkbox" ' + (item.gstInclusive?'checked':'') + ' onchange="saleItemInput(\''+item.id+'\',\'gstInclusive\',this.checked)" style="accent-color:var(--gst);width:14px;height:14px"> GST Included' +
      '</label>' +
      (item.finalTotal > 0 ?
      '<div style="display:flex;gap:10px;font-size:11px">' +
        '<span style="color:var(--t3)">Line: ' + money(item.lineTotal) + '</span>' +
        '<span style="color:var(--gst)">GST: ' + money(item.gstAmt) + '</span>' +
      '</div>' : '') +
    '</div>' +
  '</div>';
}

function acShowSI(itemId) {
  const row = saleItems.find(i=>i.id===itemId); if(!row) return;
  const inp = document.querySelector('#sir-'+itemId+' input');
  const val = inp ? inp.value : '';
  const drop = document.getElementById('ac-si-'+itemId); if(!drop) return;
  const filtered = STATE.items.map(i=>i.name).filter(n=>n&&n.toLowerCase().includes(val.toLowerCase())&&n.toLowerCase()!==(val.toLowerCase()));
  if(!filtered.length){drop.style.display='none';return;}
  drop.style.display='block';
  drop.innerHTML = filtered.slice(0,8).map(n=>'<div class="aci" onmousedown="saleItemPickName(\''+itemId+'\',decodeURIComponent(\''+encodeURIComponent(n)+'\'))">'+n+'</div>').join('');
}

function saleItemPickName(itemId, name) {
  const row = saleItems.find(i=>i.id===itemId); if(!row) return;
  row.itemName = name;
  const catalogItem = STATE.items.find(i=>i.name.toLowerCase()===name.toLowerCase());
  if(catalogItem){
    row.category = catalogItem.category||'';
    const price = getTierPrice(catalogItem, row.priceType);
    if(price>0) row.unitPrice = price;
  }
  recalcSaleItem(row);
  acHide('ac-si-'+itemId);
  refreshSaleItems();
}

function saleItemSetType(itemId, ptype) {
  const row = saleItems.find(i=>i.id===itemId); if(!row) return;
  row.priceType = ptype;
  const catalogItem = STATE.items.find(i=>i.name.toLowerCase()===(row.itemName||'').toLowerCase());
  if(catalogItem){
    const price = getTierPrice(catalogItem, ptype);
    if(price>0) row.unitPrice = price;
  }
  recalcSaleItem(row);
  refreshSaleItems();
}

function saleItemInput(itemId, field, value) {
  const row = saleItems.find(i=>i.id===itemId); if(!row) return;
  row[field] = value;
  if(field==='itemName'){
    const catalogItem = STATE.items.find(i=>i.name.toLowerCase()===(value||'').toLowerCase());
    if(catalogItem){
      row.category = catalogItem.category||'';
      const price = getTierPrice(catalogItem, row.priceType);
      if(price>0) row.unitPrice = price;
    }
  }
  recalcSaleItem(row);
  // Refresh totals in modal header without full re-render
  const invoiceTotal = saleItems.reduce((a,i)=>a+(i.finalTotal||0),0);
  const hdr = document.querySelector('#modal-overlay .msh > div:first-child > div:last-child');
  if(hdr) hdr.textContent = money(invoiceTotal);
  // Update this row's display
  const rowEl = document.getElementById('sir-'+itemId);
  if(rowEl){
    const newRow = document.createElement('div');
    newRow.innerHTML = renderSaleItemRow(row, saleItems.indexOf(row));
    const newContent = newRow.firstChild;
    rowEl.replaceWith(newContent||rowEl);
    rebindSaleItemInputs(itemId);
  }
}

function rebindSaleItemInputs(itemId) {
  // Re-attach live input listeners after DOM update
  const row = saleItems.find(i=>i.id===itemId); if(!row) return;
  const el = document.getElementById('sir-'+itemId); if(!el) return;
  const inputs = el.querySelectorAll('input[type="number"]');
  if(inputs[0]) inputs[0].addEventListener('input', e=>saleItemInput(itemId,'quantity',parseFloat(e.target.value)||1));
  if(inputs[1]) inputs[1].addEventListener('input', e=>saleItemInput(itemId,'unitPrice',parseFloat(e.target.value)||0));
}

function recalcSaleItem(row) {
  const lt = +((row.unitPrice||0)*(row.quantity||1)).toFixed(2);
  const g = calcGST(lt, row.gstInclusive||false);
  row.lineTotal = lt;
  row.gstAmt = g.gst;
  row.finalTotal = g.total;
}

function addSaleItem() {
  saleItems.push(newSaleItem());
  refreshSaleItems();
}

function removeSaleItem(itemId) {
  saleItems = saleItems.filter(i=>i.id!==itemId);
  refreshSaleItems();
}

function refreshSaleItems() {
  // Re-render just the items list and summary without closing modal
  const listEl = document.getElementById('sale-items-list');
  if(listEl) listEl.innerHTML = saleItems.map((item,idx)=>renderSaleItemRow(item,idx)).join('');
  // Update header totals
  const invoiceTotal = saleItems.reduce((a,i)=>a+(i.finalTotal||0),0);
  const invoiceGST = saleItems.reduce((a,i)=>a+(i.gstAmt||0),0);
  const invoiceLine = saleItems.reduce((a,i)=>a+(i.lineTotal||0),0);
  // Update badge in header
  const badges = document.querySelectorAll('#modal-overlay .msh [style*="linear-gradient(135deg,var(--a)"]');
  badges.forEach(b=>b.textContent=money(invoiceTotal));
  const subtitles = document.querySelectorAll('#modal-overlay .msh > div:first-child > div:first-child > div:last-child');
  subtitles.forEach(s=>{ s.textContent=saleItems.length+' item'+(saleItems.length!==1?'s':'')+' · '+money(invoiceTotal)+' total'; });
}

function saveInvoice() {
  const v = id => (document.getElementById(id)||{}).value||'';
  const date=v('sd-date')||new Date().toISOString().split('T')[0];
  const shopName=v('sd-shop').trim();
  const area=v('sd-area').trim();
  const invoiceId=v('sd-inv').trim();
  const paymentStatus=v('sd-status')||'Pending';

  if(!shopName){showToast('⚠️ Enter shop name');return;}
  const validItems = saleItems.filter(i=>i.itemName&&i.unitPrice>0&&i.quantity>0);
  if(!validItems.length){showToast('⚠️ Add at least one item with price');return;}

  validItems.forEach(item=>{
    const sale={
      id:uid(), date, shopName, area, invoiceId,
      itemName:item.itemName, category:item.category||'',
      priceType:item.priceType||'unit', quantity:item.quantity,
      unitPrice:item.unitPrice, lineTotal:item.lineTotal,
      gstInclusive:item.gstInclusive||false, gstRate:GST_RATE,
      gstAmt:item.gstAmt, finalTotal:item.finalTotal,
      currency:STATE.currency||'MVR', paymentStatus, notes:'',
      agentId: STATE.agentId || STATE.user?.id || null,
      agentName: STATE.user?.name || null
    };
    STATE.sales.push(sale);

    // Auto-save shop
    const _si = STATE.shops.find(s=>normShopName(s.name)===normShopName(shopName));
    if(_si){ if(area&&!_si.area) _si.area=area; }
    else STATE.shops.push({id:uid(),name:shopName,area,owner:'',contact:'',priority:'Medium',notes:'',lastVisit:date});

    // Auto-save item
    if(!STATE.items.find(i=>i.name.toLowerCase()===item.itemName.toLowerCase()))
      STATE.items.push({id:uid(),name:item.itemName,category:item.category||'',unitPrice:item.priceType==='unit'?item.unitPrice:0,halfPrice:item.priceType==='halfCase'?item.unitPrice:0,casePrice:item.priceType==='casePrice'?item.unitPrice:0});
  });

  saveState();
  showToast('✓ Invoice saved — ' + validItems.length + ' item' + (validItems.length!==1?'s':''));
  saleItems = [];
  closeModal();
}

// ── AUTOCOMPLETE (shop field) ─────────────────────────────────────────────────
function acShow(inputId, dropId, list) {
  const val = (document.getElementById(inputId)||{}).value||'';
  const drop = document.getElementById(dropId); if(!drop) return;
  const filtered = list.filter(s=>s&&s.toLowerCase().includes(val.toLowerCase())&&s.toLowerCase()!==val.toLowerCase());
  if(!filtered.length){drop.style.display='none';return;}
  drop.style.display='block';
  drop.innerHTML=filtered.slice(0,8).map(s=>'<div class="aci" onmousedown="acPick(\''+inputId+'\',\''+dropId+'\',decodeURIComponent(\''+encodeURIComponent(s)+'\'))">'+s+'</div>').join('');
}
function acHide(id){const el=document.getElementById(id);if(el)el.style.display='none';}
function acPick(inputId,dropId,val){
  const el=document.getElementById(inputId);if(el)el.value=val;
  acHide(dropId);
  if(inputId==='sd-shop'){
    const sh=STATE.shops.find(s=>normShopName(s.name)===normShopName(val));
    if(sh){const a=document.getElementById('sd-area');if(a&&!a.value)a.value=sh.area||'';}
  }
}

// ── SALES PAGE ────────────────────────────────────────────────────────────────
let salesViewMode = 'invoices'; // 'invoices' | 'list'
let expandedInvoices = new Set();

function getVisibleSales() {
  const srch = ((document.getElementById('s-srch') || {}).value || '').toLowerCase();
  const stat = (document.getElementById('s-stat') || {}).value || '';
  const sort = (document.getElementById('s-sort') || {}).value || 'date';
  // Agents only see their own sales
  let rows = [...(STATE.isAdmin ? STATE.sales : getVisibleSalesForUser())];
  if (stat) rows = rows.filter(r => r.paymentStatus === stat);
  if (srch) rows = rows.filter(r => (r.shopName || '').toLowerCase().includes(srch) || (r.itemName || '').toLowerCase().includes(srch) || (r.invoiceId || '').toLowerCase().includes(srch));
  rows.sort((a,b) => sort === 'date' ? new Date(b.date) - new Date(a.date) : (b.finalTotal || 0) - (a.finalTotal || 0));
  return rows;
}
function renderSalesPage() {
  const S = STATE.isAdmin ? STATE.sales : getVisibleSalesForUser();
  const total = S.reduce((a,r) => a + (parseFloat(r.finalTotal)||0), 0);
  const paid = S.filter(r => r.paymentStatus === 'Paid').reduce((a,r) => a + (parseFloat(r.finalTotal)||0), 0);
  const pend = S.filter(r => r.paymentStatus === 'Pending').reduce((a,r) => a + (parseFloat(r.finalTotal)||0), 0);
  return '<div class="fu">' +
    '<div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">' + (STATE.isAdmin?'Sales History':'My Sales') + '</h1><div style="font-size:12px;color:var(--t2)">' + S.length + ' records</div></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px">' +
    [['Total', total, 'var(--a)'], ['Paid', paid, 'var(--ok)'], ['Pending', pend, 'var(--warn)']].map(([l,v,c]) =>
      '<div style="flex:1;background:var(--s);border:1px solid var(--b);border-radius:var(--rs);padding:10px"><div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em">' + l + '</div><div style="font-size:13px;font-weight:700;color:' + c + ';margin-top:2px">' + money(v) + '</div></div>'
    ).join('') + '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">' +
      '<div class="srchw" style="flex:1;min-width:180px"><span class="srchi">' + IC.srch + '</span><input id="s-srch" class="inp srchin" placeholder="Search…" style="height:38px;font-size:13px" oninput="filterSales()"></div>' +
      '<select id="s-stat" class="inp" style="height:38px;font-size:12px;padding:0 10px;width:auto" onchange="filterSales()"><option value="">All</option><option>Paid</option><option>Pending</option><option>Partial</option></select>' +
      '<select id="s-sort" class="inp" style="height:38px;font-size:12px;padding:0 10px;width:auto" onchange="filterSales()"><option value="date">Date</option><option value="total">Amount</option></select>' +
    '</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:12px">' +
      '<button class="chip' + (salesViewMode==='invoices'?' on':'') + '" onclick="salesViewMode=\'invoices\';filterSales()">' + IC.inv + ' By Invoice</button>' +
      '<button class="chip' + (salesViewMode==='list'?' on':'') + '" onclick="salesViewMode=\'list\';filterSales()">' + IC.sales + ' Line Items</button>' +
      (STATE.isAdmin ? '<button class="btn bs" style="margin-left:auto;height:34px;padding:0 12px;font-size:12px" onclick="toggleSalesMassMode()">' + (salesMassMode ? 'Exit' : 'Mass Delete') + '</button>' : '') +
      (STATE.isAdmin && salesMassMode ? '<button class="btn bd" style="height:34px;padding:0 12px;font-size:12px" onclick="deleteSelectedSales()">Delete (' + selectedSales.size + ')</button>' : '') +
    '</div>' +
    '<div id="sales-tbl"></div></div>';
}
function bindSales() { filterSales(); }
function filterSales() {
  const rows = getVisibleSales();
  const tbl = document.getElementById('sales-tbl');
  if (!tbl) return;
  if (!rows.length) { tbl.innerHTML = '<div class="empty"><div class="eico">🔍</div><div class="etit">No results</div></div>'; return; }

  if (salesViewMode === 'invoices') {
    // Group by invoice
    const imap = {};
    rows.forEach(s => {
      const key = s.invoiceId || (s.shopName+'-'+s.date);
      if(!imap[key]) imap[key]={id:key,shopName:s.shopName,area:s.area||'',date:s.date,items:[],finalTotal:0,paid:0};
      imap[key].items.push(s);
      imap[key].finalTotal += (parseFloat(s.finalTotal)||0);
      if(s.paymentStatus==='Paid') imap[key].paid += (parseFloat(s.finalTotal)||0);
    });
    const invs = Object.values(imap).sort((a,b) => {
      const sort = (document.getElementById('s-sort')||{}).value||'date';
      return sort==='date' ? new Date(b.date)-new Date(a.date) : b.finalTotal-a.finalTotal;
    });
    tbl.innerHTML = invs.map(inv => {
      const stat = inv.paid>=inv.finalTotal&&inv.finalTotal>0?'Paid':inv.paid>0?'Partial':'Pending';
      const isExpanded = expandedInvoices.has(inv.id);
      return '<div class="card csm" style="margin-bottom:10px">' +
        '<div style="cursor:pointer" onclick="toggleInvExpand(\'' + inv.id + '\')">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.06em">' + inv.id + '</div>' +
              '<div style="font-size:15px;font-weight:700;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + inv.shopName + '</div>' +
              '<div style="font-size:11px;color:var(--t2)">' + inv.area + ' \u00b7 ' + inv.date + ' \u00b7 ' + inv.items.length + ' item' + (inv.items.length!==1?'s':'') + '</div>' +
            '</div>' +
            '<div style="text-align:right;margin-left:10px">' +
              '<div style="font-size:17px;font-weight:800;color:var(--a)">' + money(inv.finalTotal) + '</div>' +
              '<span class="badge ' + (stat==='Paid'?'bpaid':stat==='Partial'?'bpart':'bpend') + '">' + stat + '</span>' +
              '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + (isExpanded?'\u25B4 hide':'\u25BE items') + '</div>' +
            '</div>' +
          '</div>' +
          (stat!=='Paid'&&inv.finalTotal>0?'<div class="pb" style="margin-top:8px"><div class="pf" style="width:' + Math.round(inv.paid/inv.finalTotal*100) + '%;background:' + (stat==='Partial'?'var(--warn)':'var(--a)') + '"></div></div>':'') +
        '</div>' +
        (isExpanded ? '<div style="margin-top:10px;border-top:1px solid var(--b);padding-top:10px">' +
          '<div class="tw"><table class="dt"><thead><tr><th>Item</th><th>Type</th><th class="nr">Qty</th><th class="nr">Price</th><th class="nr">Total</th><th>Status</th><th></th></tr></thead><tbody>' +
          inv.items.map(r => '<tr>' +
            '<td><div style="font-weight:600;font-size:12px">' + r.itemName + '</div><div style="font-size:10px;color:var(--t3)">' + (r.category||'') + '</div></td>' +
            '<td><span class="badge ' + (r.priceType==='casePrice'||r.priceType==='case'?'bcase':r.priceType==='halfCase'?'bhalf':'bpart') + '" style="font-size:9px">' + tierLabel(r.priceType) + '</span></td>' +
            '<td class="nr" style="font-size:12px">' + r.quantity + '</td>' +
            '<td class="nr" style="font-size:11px;color:var(--t2)">' + money(r.unitPrice) + '</td>' +
            '<td class="nr" style="font-weight:700;font-size:13px">' + money(r.finalTotal) + '</td>' +
            '<td><span class="badge ' + (r.paymentStatus==='Paid'?'bpaid':r.paymentStatus==='Partial'?'bpart':'bpend') + '">' + r.paymentStatus + '</span></td>' +
            '<td><div style="display:flex;gap:4px">' +
              (r.paymentStatus!=='Paid'?'<button class="btn bic" style="width:26px;height:26px;background:var(--oks);color:var(--ok)" onclick="markPaid(\'' + r.id + '\')">' + IC.chk + '</button>':'') +
              (STATE.isAdmin?'<button class="btn bic" style="width:26px;height:26px;background:var(--errs);color:var(--err)" onclick="delSale(\'' + r.id + '\')">' + IC.trash + '</button>':'') +
            '</div></td></tr>'
          ).join('') + '</tbody></table></div>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:8px;gap:8px">' +
            (stat!=='Paid'?'<button class="btn" style="background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:7px 13px;font-size:12px;font-weight:700" onclick="markInvPaid(\'' + inv.id + '\',event)">' + IC.chk + ' Mark All Paid</button>':'') +
          '</div>' +
        '</div>' : '') +
      '</div>';
    }).join('');
  } else {
    // Flat list view
    tbl.innerHTML = '<div class="tw"><table class="dt"><thead><tr>' +
      (salesMassMode ? '<th style="width:34px"></th>' : '') +
      '<th>Date</th><th>Shop</th><th>Item</th><th>Type</th><th class="nr">Total</th><th>GST</th><th>Status</th><th></th></tr></thead><tbody>' +
      rows.map(r => '<tr' + (selectedSales.has(r.id) ? ' style="background:var(--as)"' : '') + '>' +
        (salesMassMode ? '<td><input type="checkbox" ' + (selectedSales.has(r.id) ? 'checked' : '') + ' onchange="toggleSaleSelect(\'' + r.id + '\', this.checked)" style="width:18px;height:18px;accent-color:var(--a)"></td>' : '') +
        '<td style="white-space:nowrap;color:var(--t2);font-size:11px">' + r.date + '</td>' +
        '<td><div style="font-weight:600;font-size:12px">' + r.shopName + '</div><div style="font-size:10px;color:var(--t3)">' + (r.area||'') + '</div></td>' +
        '<td><div style="font-size:12px">' + r.itemName + '</div><div style="font-size:10px;color:var(--t3)">' + (r.category||'') + '</div></td>' +
        '<td><span class="badge ' + (r.priceType==='casePrice'||r.priceType==='case'?'bcase':r.priceType==='halfCase'?'bhalf':'bpart') + '">' + tierLabel(r.priceType) + '</span></td>' +
        '<td class="nr" style="font-weight:700;font-size:13px">' + money(r.finalTotal) + '</td>' +
        '<td><span class="badge bgst" style="font-size:9px">' + (r.gstInclusive?'Incl.':'+ 8%') + '</span></td>' +
        '<td><span class="badge ' + (r.paymentStatus==='Paid'?'bpaid':r.paymentStatus==='Partial'?'bpart':'bpend') + '">' + r.paymentStatus + '</span></td>' +
        '<td><div style="display:flex;gap:4px">' +
          (r.paymentStatus!=='Paid' ? '<button class="btn bic" style="width:28px;height:28px;background:var(--oks);color:var(--ok)" onclick="markPaid(\'' + r.id + '\')">' + IC.chk + '</button>' : '') +
          '<button class="btn bic" style="width:28px;height:28px;background:var(--errs);color:var(--err)" onclick="delSale(\'' + r.id + '\')">' + IC.trash + '</button>' +
        '</div></td></tr>'
      ).join('') + '</tbody></table></div>';
  }
}
function toggleInvExpand(id) {
  if (expandedInvoices.has(id)) expandedInvoices.delete(id);
  else expandedInvoices.add(id);
  filterSales();
}
function toggleSalesMassMode() {
  salesMassMode = !salesMassMode;
  selectedSales.clear();
  render();
}
function toggleSaleSelect(id, checked) {
  if (checked) selectedSales.add(id);
  else selectedSales.delete(id);
  filterSales();
}
function selectAllVisibleSales() {
  getVisibleSales().forEach(r => selectedSales.add(r.id));
  filterSales();
}
function clearSaleSelection() {
  selectedSales.clear();
  filterSales();
}
function deleteSelectedSales() {
  if (!selectedSales.size) { showToast('Nothing selected'); return; }
  if (!confirm('Delete ' + selectedSales.size + ' selected entries?')) return;
  STATE.sales = STATE.sales.filter(s => !selectedSales.has(s.id));
  selectedSales.clear();
  saveState();
  showToast('Deleted selected');
  render();
}
function markPaid(id) { STATE.sales = STATE.sales.map(s => s.id===id ? {...s, paymentStatus:'Paid'} : s); saveState(); showToast('✓ Marked Paid'); render(); }
function delSale(id) { if(confirm('Delete this sale?')) { STATE.sales = STATE.sales.filter(s=>s.id!==id); saveState(); showToast('Deleted'); render(); } }