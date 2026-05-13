'use strict';
// ── IMPORT / EXPORT ───────────────────────────────────────────────────────
// ── IMPORT/EXPORT ─────────────────────────────────────────────────────────────
function renderImportExport() {
  return '<div class="fu"><div style="margin-bottom:18px"><h1 style="font-size:22px;font-weight:800">Import / Export</h1></div>' +

    // ── SCAN INVOICE BUTTON ──
    '<button onclick="openScanModal()" style="width:100%;margin-bottom:14px;background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.18));border:1.5px solid rgba(99,102,241,.4);border-radius:var(--rm);padding:18px 20px;cursor:pointer;display:flex;align-items:center;gap:14px;text-align:left;-webkit-tap-highlight-color:transparent">' +
      '<div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 14px rgba(99,102,241,.4)">' + IC.camera + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-family:Outfit,sans-serif;font-size:16px;font-weight:800;color:var(--a)">Scan Invoice</div>' +
        '<div style="font-size:12px;color:var(--t2);margin-top:2px">Photo or PDF → AI reads it → review → save</div>' +
      '</div>' +
      '<div style="color:var(--a);font-size:20px">›</div>' +
    '</button>' +

    // ── SMART SHOP IMPORTER ──
    '<div class="card" style="margin-bottom:14px;border-color:rgba(16,185,129,.35)">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
    '<div style="font-size:22px">🏪</div>' +
    '<div style="flex:1"><div style="font-family:Outfit,sans-serif;font-size:16px;font-weight:800;color:var(--ok)">Shop Importer</div>' +
    '<div style="font-size:12px;color:var(--t2)">Smart merge — normalizes names, no duplicates, fills missing fields only</div></div>' +
    '<button class="btn bs" style="padding:7px 11px;font-size:11px;flex-shrink:0" onclick="dlSampleShopCSV()">' + IC.dl + ' Sample</button>' +
    '</div>' +
    '<div style="background:var(--oks);border-radius:var(--rs);padding:10px 13px;font-size:12px;color:var(--ok);margin-bottom:12px;line-height:1.6">' +
    '<strong>Columns:</strong> name, owner, contact, area, priority, type, notes &nbsp;·&nbsp; Existing shops are matched by name (case-insensitive) — only blank fields get filled.</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border:2px dashed rgba(16,185,129,.5);border-radius:var(--rs);cursor:pointer">' +
    '📂 <div><div style="font-weight:600;font-size:14px">Upload shops CSV / text</div><div style="font-size:11px;color:var(--t2)">.csv or .txt</div></div>' +
    '<input type="file" accept=".csv,.txt" style="display:none" onchange="loadShopImportFile(this)"></label>' +
    '<div class="iw"><label class="il">Or paste CSV rows</label>' +
    '<textarea id="shop-import-paste" class="inp" style="min-height:80px;font-size:12px;font-family:monospace" placeholder="On The Way 1,Ahmed,7777888,Male City,High,Retail,&#10;Viva Mart,Sara,9001122,Bur Dubai,Medium,Supermarket,"></textarea></div>' +
    '<button style="background:var(--oks);color:var(--ok);border:1.5px solid var(--ok);border-radius:var(--rs);padding:12px 20px;font-size:14px;font-weight:700;cursor:pointer;width:100%;height:46px" onclick="previewShopImport()">🔍 Preview Import</button>' +
    '</div><div id="shop-import-preview"></div></div>' +

    // ── EXPORT ──
    '<div class="card" style="margin-bottom:14px"><div class="aline"></div><div class="st" style="margin-bottom:12px">Export Data</div>' +
    [['Sales History',STATE.sales.length,'sales'],['Items Catalog',STATE.items.length,'items'],['Shops List',STATE.shops.length,'shops']].map(([l,n,k]) =>
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--b)">' +
      '<div><div style="font-weight:500;font-size:14px">' + l + '</div><div style="font-size:11px;color:var(--t2)">' + n + ' records</div></div>' +
      '<button class="btn bs" style="padding:8px 12px;font-size:12px" onclick="exportCSV(\'' + k + '\')">' + IC.dl + ' CSV</button></div>'
    ).join('') +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0">' +
    '<div><div style="font-weight:500;font-size:14px">Full Backup</div><div style="font-size:11px;color:var(--t2)">All data as JSON</div></div>' +
    '<button class="btn bs" style="padding:8px 12px;font-size:12px" onclick="exportBackup()">' + IC.dl + ' JSON</button></div></div>' +

    // ── IMPORT SALES CSV ──
    '<div class="card" style="margin-bottom:14px"><div class="aline"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
    '<div class="st">Import Sales from CSV</div>' +
    '<button class="btn bs" style="padding:7px 11px;font-size:11px" onclick="dlSampleSalesCSV()">' + IC.dl + ' Sample</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--t2);margin-bottom:12px;line-height:1.6">' +
    'Columns: <code style="background:var(--s2);padding:1px 5px;border-radius:4px;font-size:11px">date, shopName, area, invoiceId, itemName, category, priceMode, quantity, unitPrice, halfPrice, casePrice, lineTotal, finalTotal, gstInclusive, currency, paymentStatus, notes</code>' +
    '</div>' +
    '<label style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--s2);border:2px dashed var(--b);border-radius:var(--rs);cursor:pointer">' +
    IC.ul + '<div><div style="font-weight:600;font-size:14px">Select sales CSV file</div><div style="font-size:11px;color:var(--t2)">.csv files only</div></div>' +
    '<input type="file" accept=".csv" style="display:none" onchange="previewCSV(this)"></label>' +
    '<div id="csv-preview"></div></div>' +

    // ── RESTORE BACKUP ──
    '<div class="card"><div class="aline"></div><div class="st" style="margin-bottom:6px">Restore from Backup</div>' +
    '<label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--s2);border:2px dashed var(--b);border-radius:var(--rs);cursor:pointer">' +
    IC.ul + '<div><div style="font-weight:600;font-size:14px">Select backup JSON file</div><div style="font-size:11px;color:var(--t2)">Overwrites all current data</div></div>' +
    '<input type="file" accept=".json" style="display:none" onchange="restoreBackup(this)"></label></div></div>';
}
function dlSampleShopCSV() {
  const csv = 'name,owner,contact,area,priority,type,notes\n' +
    'On The Way 1,Ahmed Ali,7771234,Male City,High,Retail,Near harbour\n' +
    'Viva Mart,Sara Hassan,9001122,Hulhumale,Medium,Supermarket,\n' +
    'Grocer Corner,Ibrahim,7778888,Male City,High,Grocery,Needs follow-up\n' +
    'Haw Mart,Fathimath,9994444,Addu City,Low,Mini Mart,';
  dlFile(csv, 'h2line-sample-shops.csv', 'text/csv');
  showToast('\u2713 Sample shops CSV downloaded');
}
function dlSampleSalesCSV() {
  const today = new Date().toISOString().split('T')[0];
  const csv = 'date,shopName,area,invoiceId,itemName,category,priceMode,quantity,unitPrice,halfPrice,casePrice,lineTotal,finalTotal,gstInclusive,currency,paymentStatus,notes\n' +
    today + ',On The Way 1,Male City,INV-001,Antabax Shower Cream 250ml,Personal Care,case,2,0,0,449.07,898.14,969.99,false,MVR,Pending,\n' +
    today + ',On The Way 1,Male City,INV-001,Samyang Ramen 5pk,Food,halfCase,3,0,185.00,0,555.00,599.40,false,MVR,Pending,\n' +
    today + ',Viva Mart,Hulhumale,INV-002,Mineral Water 500ml,Beverages,unit,24,8.50,0,0,204.00,220.32,false,MVR,Paid,';
  dlFile(csv, 'h2line-sample-sales.csv', 'text/csv');
  showToast('\u2713 Sample sales CSV downloaded');
}
function exportCSV(key) {
  const data = STATE[key]; if(!data||!data.length){showToast('No data');return;}
  const ks=Object.keys(data[0]);
  const csv=[ks.join(','),...data.map(r=>ks.map(k=>'"'+(String(r[k]||'').replace(/"/g,'""'))+'"').join(','))].join('\n');
  dlFile(csv,'h2line-'+key+'-'+new Date().toISOString().split('T')[0]+'.csv','text/csv');
  showToast('\u2713 Downloaded');
}
function exportBackup() {
  dlFile(JSON.stringify({sales:STATE.sales,items:STATE.items,shops:STATE.shops,exportedAt:new Date().toISOString(),version:'3.0'},null,2),'h2line-backup-'+new Date().toISOString().split('T')[0]+'.json','application/json');
  showToast('\u2713 Backup downloaded');
}
function dlFile(content, name, type) {
  const b=new Blob([content],{type}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}

function parseCSVText(text) {
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); if (row.some(v => String(v).trim() !== '')) rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
  }
  row.push(cell);
  if (row.some(v => String(v).trim() !== '')) rows.push(row);
  return rows;
}
function normalizeCSVRow(row) {
  const out = {};
  Object.keys(row || {}).forEach(k => {
    const nk = String(k).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    out[nk] = row[k];
  });
  return out;
}

function normalizePriceType(v) {
  const t = String(v || 'unit').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (['case', 'cases', 'carton', 'cartons', 'box', 'boxes'].includes(t)) return 'case';
  if (['halfcase', 'halfcases', 'halfCase', 'halfCases', 'half', 'halfcaseprice', 'halfcaseprice'].includes(t)) return 'halfCase';
  return 'unit';
}
function getTierPriceForType(priceType, unitPriceRaw, halfPrice, casePrice) {
  if (priceType === 'case') return casePrice || 0;
  if (priceType === 'halfCase') return halfPrice || 0;
  return unitPriceRaw || 0;
}
function previewCSV(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const csvRows = parseCSVText(ev.target.result || '');
    if (!csvRows.length) { showToast('⚠️ Empty CSV'); return; }
    const headers = csvRows[0].map(h => String(h).trim());
    const allRows = csvRows.slice(1).map(vals => headers.reduce((o,h,i)=>{ o[h]=vals[i]||''; return o; }, {})).filter(r=>Object.values(r).some(v=>String(v).trim()!==''));
    const preview=allRows.slice(0,5);
    const prev=document.getElementById('csv-preview'); if(!prev) return;
    prev.innerHTML='<div style="margin-top:12px;font-size:12px;font-weight:600;margin-bottom:8px;color:var(--t2)">Preview (' + allRows.length + ' rows ready to import):</div>' +
      '<div class="tw"><table class="dt"><thead><tr>' + headers.map(h=>'<th>'+h+'</th>').join('') + '</tr></thead><tbody>' +
      preview.map(r=>'<tr>'+headers.map(h=>'<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r[h]||'')+'</td>').join('')+'</tr>').join('') +
      '</tbody></table></div>' +
      (allRows.length>5?'<div style="font-size:11px;color:var(--t2);padding:6px 0">...and '+(allRows.length-5)+' more rows</div>':'') +
      '<button class="btn bsuc bw" style="margin-top:10px;height:48px;font-size:15px" onclick="doImportCSV(csvPendingRows)">✓ Import ' + allRows.length + ' Rows Now</button>';
    window.csvPendingRows = allRows;
  };
  reader.readAsText(file);
}
function doImportCSV(rows) {
  if(!rows||!rows.length){showToast('⚠️ No rows to import');return;}
  let imported=0, skipped=0;
  rows.forEach(raw=>{
    const r = normalizeCSVRow(raw);
    const date = String(r.date || r.datetime || '').trim();
    const shopName = String(r.shopname || r.shop || r.shoptitle || '').trim();
    const area = String(r.area || '').trim();
    const invoiceId = String(r.invoiceid || r.invoice || r.billid || '').trim();
    const itemName = String(r.itemname || r.item || r.product || '').trim();
    const category = String(r.category || '').trim();
    const priceType = normalizePriceType(r.pricemode || r.saletype || r.pricetype || r.packtype || 'unit');
    const packSize = parseFloat(r.packsize || r.unitspersaletype || r.packcount || (priceType === 'case' ? 12 : priceType === 'halfCase' ? 6 : 1)) || 1;
    const qty = parseFloat(r.quantity || r.qty || r.units || 1) || 1;
    const currency = String(r.currency || STATE.currency || 'MVR').trim().toUpperCase();
    const gstInc = String(r.gstinclusive || r.gstincl || 'true').toLowerCase() === 'true';
    const status = String(r.paymentstatus || r.status || 'Paid').trim();
    const notes = String(r.notes || '').trim();

    const halfPrice = parseFloat(r.halfprice || r.halfcaseprice || r.halfpriceeach || 0) || 0;
    const casePrice = parseFloat(r.caseprice || r.casepriceeach || 0) || 0;
    const unitPriceRaw = parseFloat(r.unitprice || r.price || r.saleprice || r.packprice || 0) || 0;
    const tierPrice = getTierPriceForType(priceType, unitPriceRaw, halfPrice, casePrice);
    const lineTotalRaw = parseFloat(r.linetotal || r.rowtotal || 0) || 0;
    const finalTotalRaw = parseFloat(r.finaltotal || r.total || 0) || 0;

    if(!shopName || !itemName || !date){ skipped++; return; }

    let lineTotal = lineTotalRaw;
    let finalTotal = finalTotalRaw;

    if (!lineTotal && finalTotal) {
      lineTotal = +(finalTotal / 1.08).toFixed(2);
    }

    if (!lineTotal && tierPrice && qty) {
      lineTotal = +(tierPrice * qty).toFixed(2);
    }

    // GST is always 8% on these imports.
    if (!finalTotal && lineTotal) {
      finalTotal = +(lineTotal * 1.08).toFixed(2);
    }

    // If a CSV row came in with pre-GST values in finalTotal, correct it.
    if (!gstInc && lineTotal) {
      if (!finalTotalRaw || Math.abs(finalTotalRaw - lineTotal) < 0.01) {
        finalTotal = +(lineTotal * 1.08).toFixed(2);
      }
    }

    const gstAmt = +(finalTotal - lineTotal).toFixed(2);
    const sale = {
      id: uid(), date, shopName, area, invoiceId, itemName, category,
      priceType, packSize, quantity: qty, unitPrice: tierPrice,
      halfPrice, casePrice, lineTotal, gstInclusive: gstInc, gstRate: GST_RATE,
      gstAmt, finalTotal, currency, paymentStatus: status, notes
    };

    const dup = STATE.sales.find(s => s.date===date && s.shopName===shopName && s.invoiceId===invoiceId && s.itemName===itemName && s.quantity===qty && s.finalTotal===sale.finalTotal);
    if(dup){ skipped++; return; }

    STATE.sales.push(sale);

    const existing = STATE.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (existing) {
      if (priceType === 'unit' && unitPriceRaw) existing.unitPrice = unitPriceRaw;
      if (priceType === 'halfCase' && (halfPrice || tierPrice)) existing.halfPrice = halfPrice || tierPrice;
      if (priceType === 'case' && (casePrice || tierPrice)) existing.casePrice = casePrice || tierPrice;
      if (category && !existing.category) existing.category = category;
    } else {
      const obj = {id:uid(), name:itemName, category, unitPrice:0, halfPrice:0, casePrice:0};
      if (priceType === 'unit' && unitPriceRaw) obj.unitPrice = unitPriceRaw;
      if (priceType === 'halfCase' && (halfPrice || tierPrice)) obj.halfPrice = halfPrice || tierPrice;
      if (priceType === 'case' && (casePrice || tierPrice)) obj.casePrice = casePrice || tierPrice;
      STATE.items.push(obj);
    }

    const _existShop = STATE.shops.find(s => normShopName(s.name) === normShopName(shopName));
    if(_existShop){ if(area && !_existShop.area) _existShop.area = area; }
    else STATE.shops.push({id:uid(), name:shopName, area, owner:'', contact:'', priority:'Medium', notes:'', lastVisit:date});

    imported++;
  });
  saveState();
  window.csvPendingRows = null;
  const cp = document.getElementById('csv-preview'); if(cp) cp.innerHTML='';
  showToast('✓ Imported ' + imported + ' rows' + (skipped ? ' (' + skipped + ' skipped)' : '') + '!');
  render();
}
function restoreBackup(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try {
      const bk=JSON.parse(ev.target.result);
      if(!confirm('Restore backup from '+bk.exportedAt+'? This will overwrite current data.')) return;
      if(bk.sales) STATE.sales=bk.sales; if(bk.items) STATE.items=bk.items; if(bk.shops) STATE.shops=bk.shops;
      saveState(); showToast('\u2713 Backup restored!'); render();
    } catch { showToast('\u26A0\uFE0F Invalid backup file'); }
  };
  reader.readAsText(file);
}

// ── SMART SHOP IMPORTER ──────────────────────────────────────────────────────
function normShopName(n) {
  return String(n||'').toLowerCase().replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();
}
function loadShopImportFile(input) {
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => { const ta=document.getElementById('shop-import-paste'); if(ta) ta.value=ev.target.result||''; showToast('\u2713 File loaded — tap Preview'); };
  reader.readAsText(file);
}
function previewShopImport() {
  const text = (document.getElementById('shop-import-paste')||{}).value||'';
  if (!text.trim()) { showToast('\u26A0\uFE0F Paste shop data first'); return; }
  const csvRows = parseCSVText(text);
  if (!csvRows.length) { showToast('\u26A0\uFE0F No rows found'); return; }
  // Detect header row
  const firstLow = csvRows[0].map(h=>String(h).toLowerCase().trim());
  const hasHeader = firstLow.includes('name') || firstLow.includes('shop') || firstLow.includes('shopname');
  const headers = hasHeader ? firstLow : ['name','owner','contact','area','priority','type','notes'];
  const dataRows = hasHeader ? csvRows.slice(1) : csvRows;

  const parsed = dataRows.map(vals => {
    const obj = {};
    headers.forEach((h,i)=>{ obj[h]=(vals[i]||'').trim(); });
    return obj;
  }).filter(r => (r.name||r.shopname||'').trim());

  let toAdd=[], toMerge=[], toSkip=[];
  parsed.forEach(r => {
    const name = (r.name||r.shopname||'').trim();
    if (!name) return;
    const norm = normShopName(name);
    const existing = STATE.shops.find(s => normShopName(s.name) === norm);
    if (!existing) {
      toAdd.push({name, owner:r.owner||'', contact:r.contact||r.phone||r.mobile||'', area:r.area||r.road||'', priority:r.priority||'Medium', type:r.type||'', notes:r.notes||''});
    } else {
      const changes = {};
      if (!existing.owner && r.owner) changes.owner = r.owner;
      if (!existing.contact && (r.contact||r.phone||r.mobile)) changes.contact = r.contact||r.phone||r.mobile;
      if (!existing.area && (r.area||r.road)) changes.area = r.area||r.road;
      if (!existing.priority && r.priority) changes.priority = r.priority;
      if (!existing.type && r.type) changes.type = r.type;
      if (!existing.notes && r.notes) changes.notes = r.notes;
      if (Object.keys(changes).length) toMerge.push({existing, changes, name});
      else toSkip.push(name);
    }
  });

  const prev = document.getElementById('shop-import-preview'); if(!prev) return;
  prev.innerHTML = '<div style="margin-top:14px">' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<div style="flex:1;background:var(--oks);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--ok)">' + toAdd.length + '</div><div style="font-size:10px;color:var(--ok);font-weight:700;text-transform:uppercase">New Shops</div></div>' +
      '<div style="flex:1;background:var(--warns);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--warn)">' + toMerge.length + '</div><div style="font-size:10px;color:var(--warn);font-weight:700;text-transform:uppercase">To Merge</div></div>' +
      '<div style="flex:1;background:var(--s2);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--t2)">' + toSkip.length + '</div><div style="font-size:10px;color:var(--t2);font-weight:700;text-transform:uppercase">No Change</div></div>' +
    '</div>' +
    (toAdd.length ? '<div style="font-size:12px;font-weight:700;color:var(--ok);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">New shops to add:</div>' +
    '<div class="tw" style="margin-bottom:10px"><table class="dt"><thead><tr><th>Name</th><th>Owner</th><th>Contact</th><th>Area</th><th>Priority</th></tr></thead><tbody>' +
    toAdd.map(s=>'<tr><td style="font-weight:600;font-size:12px">'+s.name+'</td><td style="font-size:11px;color:var(--t2)">'+s.owner+'</td><td style="font-size:11px">'+s.contact+'</td><td style="font-size:11px;color:var(--t2)">'+s.area+'</td><td><span class="badge '+(s.priority==='High'?'bpaid':s.priority==='Medium'?'bpart':'')+'">'+s.priority+'</span></td></tr>').join('') +
    '</tbody></table></div>' : '') +
    (toMerge.length ? '<div style="font-size:12px;font-weight:700;color:var(--warn);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Shops to update (missing fields only):</div>' +
    '<div class="tw" style="margin-bottom:10px"><table class="dt"><thead><tr><th>Shop</th><th>Fields to fill</th></tr></thead><tbody>' +
    toMerge.map(m=>'<tr><td style="font-weight:600;font-size:12px">'+m.name+'</td><td style="font-size:11px;color:var(--warn)">' + Object.entries(m.changes).map(([k,v])=>k+': '+v).join(', ') + '</td></tr>').join('') +
    '</tbody></table></div>' : '') +
    (toSkip.length ? '<div style="font-size:11px;color:var(--t3);margin-bottom:8px">' + toSkip.length + ' shops already complete — no changes needed.</div>' : '') +
    '<button class="btn bsuc bw" style="margin-top:6px;height:48px;font-size:15px" onclick="doImportShops()">✓ Import ' + (toAdd.length+toMerge.length) + ' Shops</button>' +
  '</div>';
  window.shopImportPending = {toAdd, toMerge};
}
function doImportShops() {
  const pending = window.shopImportPending;
  if (!pending) { showToast('\u26A0\uFE0F Run Preview first'); return; }
  let added=0, merged=0;
  pending.toAdd.forEach(s => {
    STATE.shops.push({id:uid(), name:s.name, owner:s.owner, contact:s.contact, area:s.area, priority:s.priority||'Medium', type:s.type||'', notes:s.notes||'', lastVisit:''});
    added++;
  });
  pending.toMerge.forEach(({existing, changes}) => {
    Object.assign(existing, changes);
    merged++;
  });
  window.shopImportPending = null;
  saveState();
  const pr = document.getElementById('shop-import-preview'); if(pr) pr.innerHTML='';
  const ta = document.getElementById('shop-import-paste'); if(ta) ta.value='';
  showToast('\u2713 Imported: ' + added + ' new, ' + merged + ' updated');
  render();
}