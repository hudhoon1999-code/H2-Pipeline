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
    'Required: <code style="background:var(--errs);color:var(--err);padding:1px 5px;border-radius:4px;font-size:11px">date, shopName, itemName</code> &nbsp;·&nbsp; ' +
    'Optional: <code style="background:var(--s2);padding:1px 5px;border-radius:4px;font-size:11px">area, invoiceId, category, priceMode, quantity, unitPrice, halfPrice, casePrice, lineTotal, finalTotal, gstInclusive, currency, paymentStatus, notes, agentEmail</code><br>' +
    '<span style="color:var(--t3);font-size:11px">Dates: YYYY-MM-DD, DD/MM/YYYY or MM/DD/YYYY all accepted. Duplicate rows are skipped automatically.</span>' +
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
  const csv = 'date,shopName,area,invoiceId,itemName,category,priceMode,quantity,unitPrice,halfPrice,casePrice,lineTotal,finalTotal,gstInclusive,currency,paymentStatus,notes,agentEmail\n' +
    today + ',On The Way 1,Male City,INV-001,Antabax Shower Cream 250ml,Personal Care,case,2,0,0,449.07,898.14,969.99,false,MVR,Pending,,\n' +
    today + ',On The Way 1,Male City,INV-001,Samyang Ramen 5pk,Food,halfCase,3,0,185.00,0,555.00,599.40,false,MVR,Pending,,\n' +
    today + ',Viva Mart,Hulhumale,INV-002,Mineral Water 500ml,Beverages,unit,24,8.50,0,0,204.00,220.32,false,MVR,Paid,,';
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
// Normalise a date string to YYYY-MM-DD regardless of input format
function normDateStr(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmY = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmY) {
    const [,d,m,y] = dmY;
    // If day > 12 it can only be DD/MM
    if (parseInt(d) > 12) return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
    // Ambiguous — assume DD/MM for non-US locale
    return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
  }
  // MM/DD/YYYY (US)
  const mDY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mDY) {
    const [,m,d,y] = mDY;
    if (parseInt(m) > 12) return y+'-'+d.padStart(2,'0')+'-'+m.padStart(2,'0');
    return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
  }
  // Try native Date parse as last resort
  const nd = new Date(s);
  if (!isNaN(nd)) return nd.toISOString().split('T')[0];
  return s;
}

function doImportCSV(rows) {
  if(!rows||!rows.length){showToast('⚠️ No rows to import');return;}
  let imported=0, skipped=0, warnings=[];
  // For agent imports, auto-assign their agentId; admin imports can specify via column
  const selfAgentId   = STATE.isAgent ? (STATE.agentId || STATE.user?.id || null) : null;
  const selfAgentName = STATE.isAgent ? (STATE.user?.name || null) : null;

  rows.forEach((raw, rowIdx)=>{
    const r = normalizeCSVRow(raw);

    // ── date ──
    const dateRaw = String(r.date || r.datetime || r.saledate || r.invoicedate || '').trim();
    const date = normDateStr(dateRaw);

    // ── required fields ──
    const shopName = String(r.shopname || r.shop || r.shoptitle || r.customername || r.client || '').trim();
    const itemName = String(r.itemname || r.item || r.product || r.productname || r.description || r.itemdescription || '').trim();

    if (!shopName || !itemName) { skipped++; warnings.push('Row '+(rowIdx+2)+': missing shop or item name'); return; }
    if (!date) { skipped++; warnings.push('Row '+(rowIdx+2)+': missing or unreadable date ("'+dateRaw+'")'); return; }

    const area       = String(r.area || r.location || r.region || '').trim();
    const invoiceId  = String(r.invoiceid || r.invoice || r.billid || r.invoiceno || r.invno || '').trim();
    const category   = String(r.category || r.cat || r.itemcategory || '').trim();
    const priceType  = normalizePriceType(r.pricemode || r.saletype || r.pricetype || r.packtype || r.type || 'unit');
    const qty        = parseFloat(r.quantity || r.qty || r.units || r.count || 1) || 1;
    const currency   = String(r.currency || STATE.currency || 'MVR').trim().toUpperCase() || 'MVR';
    const notes      = String(r.notes || r.remarks || r.comment || '').trim();

    // Payment status — tolerate many spellings
    const rawStatus = String(r.paymentstatus || r.status || r.payment || 'Pending').trim().toLowerCase();
    const status = rawStatus.startsWith('paid') ? 'Paid' : rawStatus.startsWith('part') ? 'Partial' : 'Pending';

    // GST inclusive — default false (most exports are exclusive)
    const gstIncRaw = String(r.gstinclusive || r.gstincl || r.inclusive || 'false').toLowerCase();
    const gstInc = gstIncRaw === 'true' || gstIncRaw === '1' || gstIncRaw === 'yes';

    // Prices
    const halfPrice    = parseFloat(r.halfprice || r.halfcaseprice || r.halfpriceeach || 0) || 0;
    const casePrice    = parseFloat(r.caseprice || r.casepriceeach || 0) || 0;
    const unitPriceRaw = parseFloat(r.unitprice || r.price || r.saleprice || r.packprice || r.rate || 0) || 0;
    const tierPrice    = getTierPriceForType(priceType, unitPriceRaw, halfPrice, casePrice);

    const lineTotalRaw  = parseFloat(r.linetotal || r.rowtotal || r.subtotal || r.nettotal || 0) || 0;
    const finalTotalRaw = parseFloat(r.finaltotal || r.total || r.grandtotal || r.amount || 0) || 0;

    // Compute lineTotal / finalTotal
    let lineTotal  = lineTotalRaw;
    let finalTotal = finalTotalRaw;

    // Derive lineTotal from price × qty when missing
    if (!lineTotal && tierPrice && qty) lineTotal = +(tierPrice * qty).toFixed(2);
    // Derive lineTotal from finalTotal (strip GST)
    if (!lineTotal && finalTotal) lineTotal = +(finalTotal / (gstInc ? 1 : 1.08)).toFixed(2);
    // Derive finalTotal from lineTotal
    if (!finalTotal && lineTotal) finalTotal = gstInc ? lineTotal : +(lineTotal * 1.08).toFixed(2);
    // When finalTotal == lineTotal and GST not inclusive, assume finalTotal is the pre-GST value
    if (!gstInc && lineTotal && Math.abs(finalTotalRaw - lineTotalRaw) < 0.01 && finalTotalRaw > 0) {
      finalTotal = +(lineTotal * 1.08).toFixed(2);
    }

    const gstAmt = +(finalTotal - lineTotal).toFixed(2);

    // Agent assignment
    let agentId   = selfAgentId;
    let agentName = selfAgentName;
    if (STATE.isAdmin) {
      const csvAgentEmail = String(r.agentemail || r.agent || '').trim().toLowerCase();
      const csvAgentId    = String(r.agentid || '').trim();
      if (csvAgentId) {
        const ag = STATE.agents.find(a=>a.id===csvAgentId);
        if (ag) { agentId=ag.id; agentName=ag.name; }
      } else if (csvAgentEmail) {
        const ag = STATE.agents.find(a=>(a.email||'').toLowerCase()===csvAgentEmail);
        if (ag) { agentId=ag.id; agentName=ag.name; }
      }
    }

    const sale = {
      id: uid(), date, shopName, area, invoiceId, itemName, category,
      priceType, quantity: qty, unitPrice: tierPrice,
      halfPrice, casePrice, lineTotal, gstInclusive: gstInc, gstRate: GST_RATE,
      gstAmt, finalTotal, currency, paymentStatus: status, notes,
      agentId, agentName
    };

    // Duplicate check (same date + shop + invoice + item + qty + total)
    const dup = STATE.sales.find(s =>
      s.date === date && normShopName(s.shopName) === normShopName(shopName) &&
      (s.invoiceId||'') === invoiceId &&
      s.itemName.toLowerCase() === itemName.toLowerCase() &&
      Math.abs(s.quantity - qty) < 0.01 &&
      Math.abs(s.finalTotal - finalTotal) < 0.01
    );
    if (dup) { skipped++; return; }

    STATE.sales.push(sale);

    // Auto-update items catalogue
    const existItem = STATE.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (existItem) {
      if (priceType === 'unit' && unitPriceRaw > 0) existItem.unitPrice = unitPriceRaw;
      if (priceType === 'halfCase' && (halfPrice || tierPrice) > 0) existItem.halfPrice = halfPrice || tierPrice;
      if (priceType === 'case' && (casePrice || tierPrice) > 0) existItem.casePrice = casePrice || tierPrice;
      if (category && !existItem.category) existItem.category = category;
    } else {
      const obj = {id:uid(), name:itemName, category, unitPrice:0, halfPrice:0, casePrice:0};
      if (priceType === 'unit') obj.unitPrice = unitPriceRaw;
      else if (priceType === 'halfCase') obj.halfPrice = halfPrice || tierPrice;
      else if (priceType === 'case') obj.casePrice = casePrice || tierPrice;
      STATE.items.push(obj);
    }

    // Auto-update shops
    const existShop = STATE.shops.find(s => normShopName(s.name) === normShopName(shopName));
    if (existShop) { if (area && !existShop.area) existShop.area = area; }
    else STATE.shops.push({id:uid(), name:shopName, area, owner:'', contact:'', priority:'Medium', notes:'', lastVisit:date, createdAt:new Date().toISOString()});

    imported++;
  });

  saveState();
  window.csvPendingRows = null;
  const cp = document.getElementById('csv-preview'); if(cp) cp.innerHTML='';
  logActivity('csv_import', (STATE.user?.name||'?') + ' imported ' + imported + ' sales rows' + (skipped?' ('+skipped+' skipped)':''));
  let msg = '✓ Imported ' + imported + ' rows' + (skipped ? ' · ' + skipped + ' skipped' : '');
  if (warnings.length) {
    msg += ' · ' + warnings.length + ' warning' + (warnings.length>1?'s':'');
    console.warn('CSV import warnings:', warnings);
  }
  showToast(msg);
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
  const now = new Date().toISOString();
  pending.toAdd.forEach(s => {
    STATE.shops.push({id:uid(), name:s.name, owner:s.owner, contact:s.contact, area:s.area, priority:s.priority||'Medium', type:s.type||'', notes:s.notes||'', lastVisit:'', createdAt:now});
    added++;
  });
  pending.toMerge.forEach(({existing, changes}) => {
    Object.assign(existing, changes);
    merged++;
  });
  window.shopImportPending = null;
  saveState();
  logActivity('csv_import', (STATE.user?.name||'?') + ' imported shops: ' + added + ' new, ' + merged + ' updated');
  const pr = document.getElementById('shop-import-preview'); if(pr) pr.innerHTML='';
  const ta = document.getElementById('shop-import-paste'); if(ta) ta.value='';
  showToast('\u2713 Imported: ' + added + ' new, ' + merged + ' updated');
  render();
}