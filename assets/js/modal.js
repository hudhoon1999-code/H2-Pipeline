'use strict';
// ── MODAL ─────────────────────────────────────────────────────────────────
// ── MODAL ─────────────────────────────────────────────────────────────────────
function renderModal() {
  if(!STATE.modal) return '';
  let content='';
  if(STATE.modal.type==='addsale') content=renderAddSaleModal();
  else if(STATE.modal.type==='editsale') content=renderEditSaleModal(STATE.modal.data?.id);
  else if(STATE.modal.type==='addagent') content=renderAddAgentModal(STATE.modal.data?.id||null);
  else if(STATE.modal.type==='settarget') content=renderSetTargetModal(STATE.modal.data?.agentId);
  else if(STATE.modal.type==='pindrop') content=renderPinDropModal(STATE.modal.data?.shopId);
  else if(STATE.modal.type==='checkin') content=renderCheckinModal(STATE.modal.data?.shopId);
  else if(STATE.modal.type==='shop') content=renderShopModal(STATE.modal.data?.id);
  else if(STATE.modal.type==='shopdetail') content=renderShopDetailModal(STATE.modal.data?.id);
  else if(STATE.modal.type==='item') content=renderItemModal(STATE.modal.data?.id);
  else if(STATE.modal.type==='share') content=renderShareModal();
  else if(STATE.modal.type==='scan') content=renderScanModal();
  else if(STATE.modal.type==='alert') content=renderAlertModal(STATE.modal.data);
  else if(STATE.modal.type==='newcompany') content=renderNewCompanyModal();
  else if(STATE.modal.type==='addcompadmin') content=renderAddCompanyAdminModal(STATE.modal.data?.orgId, STATE.modal.data?.orgName);
  // Pin-drop needs full screen — different wrapper
  if (STATE.modal.type==='pindrop') {
    return '<div class="mov" id="modal-overlay"><div style="background:var(--s);width:100%;max-width:640px;height:100vh;max-height:100vh;overflow:hidden;display:flex;flex-direction:column;animation:slideUp .3s ease">' + content + '</div></div>';
  }
  return '<div class="mov" id="modal-overlay" onclick="if(event.target.id===\'modal-overlay\')closeModal()"><div class="msh">'+content+'</div></div>';
}
function updateStickyBar(tiers, ptype) {
  const bar = document.getElementById('sale-spb'); if(!bar) return;
  const uv = document.getElementById('spb-unit-val');
  const hv = document.getElementById('spb-half-val');
  const cv = document.getElementById('spb-case-val');
  const uc = document.getElementById('spb-unit');
  const hc = document.getElementById('spb-half');
  const cc = document.getElementById('spb-case');
  if (!tiers) {
    if(uv) uv.textContent='—'; if(hv) hv.textContent='—'; if(cv) cv.textContent='—';
    [uc,hc,cc].forEach(c=>c&&c.classList.remove('spb-act'));
    return;
  }
  if(uv) uv.textContent = tiers.unit>0 ? money(tiers.unit) : '—';
  if(hv) hv.textContent = tiers.halfCase>0 ? money(tiers.halfCase) : '—';
  if(cv) cv.textContent = tiers.casePrice>0 ? money(tiers.casePrice) : '—';
  [uc,hc,cc].forEach(c=>c&&c.classList.remove('spb-act'));
  if(ptype==='unit'&&uc) uc.classList.add('spb-act');
  else if(ptype==='halfCase'&&hc) hc.classList.add('spb-act');
  else if(ptype==='casePrice'&&cc) cc.classList.add('spb-act');
}

function bindModal() {
  if(STATE.modal?.type==='addsale') { /* multi-item handles own binding */ }
  if(STATE.modal?.type==='pindrop') bindPinDropModal(STATE.modal.data?.shopId);
  if(STATE.modal?.type==='checkin') setTimeout(()=>bindCheckinModal(STATE.modal.data?.shopId), 100);
  if(STATE.modal?.type==='shop') {
    const shop = STATE.modal.data?.id ? STATE.shops.find(s=>s.id===STATE.modal.data.id) : null;
    const previewLat = STATE.modal.data?.lat ?? shop?.lat;
    const previewLng = STATE.modal.data?.lng ?? shop?.lng;
    if(previewLat && previewLng) setTimeout(()=>renderShopLocationPreview(previewLat, previewLng), 200);
  }
  if(STATE.modal?.type==='item') { updateTiers(); initItemModalScroll(); }
  if(STATE.modal?.type==='scan') bindScanModal();
  // Swipe down to dismiss
  const sheet = document.querySelector('.msh');
  if (!sheet) return;
  let startY=0, curY=0, dragging=false;
  sheet.addEventListener('touchstart', e=>{
    if(sheet.scrollTop>0) return;
    startY=e.touches[0].clientY; dragging=true;
  },{passive:true});
  sheet.addEventListener('touchmove', e=>{
    if(!dragging) return;
    curY=e.touches[0].clientY;
    const dy=curY-startY;
    if(dy>0){ sheet.classList.add('swiping'); sheet.style.transform='translateY('+dy+'px)'; sheet.style.opacity=Math.max(0,1-dy/300); }
  },{passive:true});
  sheet.addEventListener('touchend', ()=>{
    if(!dragging) return; dragging=false;
    const dy=curY-startY;
    if(dy>90){ sheet.style.animation='swipeOut .22s ease forwards'; setTimeout(closeModal,200); }
    else { sheet.classList.remove('swiping'); sheet.style.transform=''; sheet.style.opacity=''; }
  });
}

function initSaleModalScroll() {
  const sheet = document.querySelector('.msh');
  const bar = document.getElementById('sale-spb');
  const tierBox = document.getElementById('tier-box');
  if (!sheet || !bar) return;
  sheet.addEventListener('scroll', () => {
    const threshold = tierBox && tierBox.style.display !== 'none'
      ? (tierBox.offsetTop - 60)
      : 120;
    if (sheet.scrollTop > threshold) bar.classList.add('spb-on');
    else bar.classList.remove('spb-on');
  }, { passive: true });
}

function initItemModalScroll() {
  const sheet = document.querySelector('.msh');
  const bar = document.getElementById('item-spb');
  if (!sheet || !bar) return;
  sheet.addEventListener('scroll', () => {
    if (sheet.scrollTop > 80) bar.classList.add('spb-on');
    else bar.classList.remove('spb-on');
  }, { passive: true });
}

// ── SCAN INVOICE MODAL ────────────────────────────────────────────────────────
let scanState = { mode: 'pick', imageData: null, imageType: null, imageName: null, rows: [], meta: {} };

function openScanModal() {
  scanState = { mode: 'pick', imageData: null, imageType: null, imageName: null, rows: [], meta: {} };
  STATE.modal = { type: 'scan' };
  render();
}

function renderScanModal() {
  const s = scanState;
  const today = new Date().toISOString().split('T')[0];

  // ── PICK mode: choose source ──
  if (s.mode === 'pick') {
    return '<div class="mhan"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center">' + IC.camera + '</div>' +
          '<div class="mtit" style="margin-bottom:0">Scan Invoice</div>' +
        '</div>' +
        '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--t2);margin-bottom:18px">Upload a photo or PDF of an invoice. Claude AI will read it and extract all items for you to review before saving.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
        '<label style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;background:linear-gradient(135deg,var(--as),rgba(139,92,246,.1));border:2px dashed var(--a);border-radius:var(--rm);cursor:pointer;text-align:center;-webkit-tap-highlight-color:transparent">' +
          '<span style="font-size:32px">📸</span>' +
          '<span style="font-size:13px;font-weight:700;color:var(--a)">Take Photo</span>' +
          '<span style="font-size:10px;color:var(--t3)">Opens camera</span>' +
          '<input type="file" accept="image/*" capture="environment" style="display:none" onchange="scanFileChosen(this)">' +
        '</label>' +
        '<label style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;background:var(--s2);border:2px dashed var(--b);border-radius:var(--rm);cursor:pointer;text-align:center;-webkit-tap-highlight-color:transparent">' +
          '<span style="font-size:32px">🖼️</span>' +
          '<span style="font-size:13px;font-weight:700">Upload File</span>' +
          '<span style="font-size:10px;color:var(--t3)">jpg, png, pdf</span>' +
          '<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" style="display:none" onchange="scanFileChosen(this)">' +
        '</label>' +
      '</div>' +
      '<div style="position:relative;margin-bottom:6px"><div style="height:1px;background:var(--b)"></div><span style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--s);padding:0 10px;font-size:11px;color:var(--t3)">or</span></div>' +
      '<button onclick="scanManualMode()" class="btn bs bw" style="height:44px;font-size:13px;margin-top:10px">✏️ Manual entry alongside image</button>';
  }

  // ── PROCESSING mode: spinner ──
  if (s.mode === 'processing') {
    return '<div class="mhan"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center">' + IC.camera + '</div><div class="mtit" style="margin-bottom:0">Reading Invoice…</div></div>' +
        '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
      '</div>' +
      '<div style="text-align:center;padding:40px 20px">' +
        '<div style="width:52px;height:52px;border:3px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px"></div>' +
        '<div style="font-size:15px;font-weight:600;margin-bottom:6px">Claude AI is reading your invoice…</div>' +
        '<div style="font-size:12px;color:var(--t2)">Extracting items, quantities, prices and GST</div>' +
      '</div>';
  }

  // ── REVIEW mode: editable extracted rows ──
  if (s.mode === 'review') {
    const rows = s.rows || [];
    const imgSrc = s.imageData ? 'data:' + s.imageType + ';base64,' + s.imageData : null;
    const subtotal = rows.reduce((a, r) => a + (parseFloat(r.lineTotal) || 0), 0);
    const gstTotal = rows.reduce((a, r) => a + (parseFloat(r.gstAmt) || 0), 0);
    const finalTotal = rows.reduce((a, r) => a + (parseFloat(r.finalTotal) || 0), 0);

    return '<div class="mhan"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<div><div class="mtit" style="margin-bottom:2px">Review Extracted Invoice</div>' +
        '<div style="font-size:11px;color:var(--t2)">' + rows.length + ' items found — edit anything before saving</div></div>' +
        '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&times;</button>' +
      '</div>' +

      // Image thumbnail
      (imgSrc ? '<img src="' + imgSrc + '" style="width:100%;max-height:160px;object-fit:contain;border-radius:var(--rs);background:var(--s2);margin-bottom:14px">' : '') +

      // Invoice meta fields
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
        '<div class="iw"><label class="il">Shop Name</label><input id="sc-shop" class="inp" value="' + (s.meta.shopName||'').replace(/"/g,'&quot;') + '" placeholder="Shop name"></div>' +
        '<div class="iw"><label class="il">Invoice #</label><input id="sc-inv" class="inp" value="' + (s.meta.invoiceId||'').replace(/"/g,'&quot;') + '" placeholder="INV-001"></div>' +
        '<div class="iw"><label class="il">Date</label><input id="sc-date" class="inp" type="date" value="' + (s.meta.date || today) + '"></div>' +
        '<div class="iw"><label class="il">Area</label><input id="sc-area" class="inp" value="' + (s.meta.area||'').replace(/"/g,'&quot;') + '" placeholder="e.g. Male City"></div>' +
        '<div class="iw"><label class="il">Payment</label><select id="sc-status" class="inp"><option' + (s.meta.paymentStatus==='Paid'?' selected':'') + '>Pending</option><option' + (s.meta.paymentStatus==='Paid'?' selected':'') + '>Paid</option></select></div>' +
        '<div class="iw"><label class="il">GST</label><select id="sc-gstmode" class="inp"><option value="exclusive"' + (s.meta.gstInclusive?'':' selected') + '>+ 8% on top</option><option value="inclusive"' + (s.meta.gstInclusive?' selected':'') + '>Included in price</option></select></div>' +
      '</div>' +

      // Extracted rows
      '<div style="margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<div style="font-size:12px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em">Line Items</div>' +
          '<button onclick="scanAddRow()" class="btn bs" style="padding:5px 10px;font-size:11px">+ Add Row</button>' +
        '</div>' +
        rows.map((r, i) => '<div style="background:var(--s2);border-radius:var(--rs);padding:10px;margin-bottom:8px">' +
          '<div style="display:flex;gap:6px;margin-bottom:6px">' +
            '<input class="inp" style="flex:2;font-size:12px;padding:7px 9px" placeholder="Item name" value="' + (r.itemName||'').replace(/"/g,'&quot;') + '" oninput="scanRowUpdate(' + i + ',\'itemName\',this.value)">' +
            '<select class="inp" style="flex:1;font-size:11px;padding:7px 6px" onchange="scanRowUpdate(' + i + ',\'priceType\',this.value)">' +
              '<option value="unit"' + (r.priceType==='unit'?' selected':'') + '>Unit</option>' +
              '<option value="halfCase"' + (r.priceType==='halfCase'?' selected':'') + '>Half Case</option>' +
              '<option value="casePrice"' + (r.priceType==='casePrice'?' selected':'') + '>Case</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center">' +
            '<input class="inp" style="flex:1;font-size:12px;padding:7px 9px" type="number" placeholder="Qty" value="' + (r.quantity||'') + '" oninput="scanRowUpdate(' + i + ',\'quantity\',this.value)">' +
            '<input class="inp" style="flex:1;font-size:12px;padding:7px 9px" type="number" placeholder="Price" value="' + (r.unitPrice||'') + '" oninput="scanRowUpdate(' + i + ',\'unitPrice\',this.value)">' +
            '<div style="flex:1;text-align:right;font-size:13px;font-weight:700;color:var(--a)">' + money(r.finalTotal||0) + '</div>' +
            '<button onclick="scanRemoveRow(' + i + ')" style="background:var(--errs);color:var(--err);border:none;border-radius:var(--rx);width:28px;height:28px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&times;</button>' +
          '</div>' +
        '</div>').join('') +
      '</div>' +

      // Totals summary
      '<div style="background:var(--s2);border-radius:var(--rs);padding:12px;margin-bottom:14px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:4px"><span>Subtotal</span><span>' + money(subtotal) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gst);margin-bottom:4px"><span>GST @ 8%</span><span>' + money(gstTotal) + '</span></div>' +
        '<div style="height:1px;background:var(--b);margin:6px 0"></div>' +
        '<div style="display:flex;justify-content:space-between;font-family:Outfit,sans-serif;font-weight:800;font-size:16px"><span>Total</span><span style="color:var(--a)">' + money(finalTotal) + '</span></div>' +
      '</div>' +

      '<div style="display:flex;gap:8px">' +
        '<button onclick="scanState.mode=\'pick\';scanRender()" class="btn bs" style="flex:1;height:46px;font-size:13px">← Redo</button>' +
        '<button onclick="saveScanInvoice()" class="btn bp" style="flex:2;height:46px;font-size:14px;font-weight:700">✓ Save ' + rows.length + ' Items</button>' +
      '</div>';
  }

  // ── MANUAL mode: image + form side by side ──
  if (s.mode === 'manual') {
    const imgSrc = s.imageData ? 'data:' + s.imageType + ';base64,' + s.imageData : null;
    return '<div class="mhan"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<div class="mtit" style="margin-bottom:0">Manual Entry</div>' +
        '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
      '</div>' +
      (imgSrc ? '<img src="' + imgSrc + '" style="width:100%;max-height:200px;object-fit:contain;border-radius:var(--rs);background:var(--s2);margin-bottom:14px">' :
        '<label style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--s2);border:2px dashed var(--b);border-radius:var(--rs);cursor:pointer;margin-bottom:14px">' +
        '🖼️ <span style="font-size:13px;color:var(--t2)">Tap to attach invoice image (optional)</span>' +
        '<input type="file" accept="image/*,application/pdf" style="display:none" onchange="scanAttachImage(this)"></label>') +
      '<div style="font-size:12px;color:var(--t2);margin-bottom:12px">Fill in the invoice details while referencing the image above.</div>' +
      '<div onclick="closeModal();openAddSale()" class="btn bp bw" style="height:48px;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:var(--rs)">Open Sale Entry Form →</div>' +
      '<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:8px">The standard sale form lets you add items one by one. Keep this modal image open for reference.</div>';
  }

  return '';
}

function bindScanModal() {}

function scanFileChosen(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const isPDF = file.type === 'application/pdf';
  const reader = new FileReader();
  reader.onload = async ev => {
    const b64 = ev.target.result.split(',')[1];
    scanState.imageData = b64;
    scanState.imageType = isPDF ? 'application/pdf' : file.type;
    scanState.imageName = file.name;
    scanState.mode = 'processing';
    scanRender();
    await runAIScan(b64, isPDF ? 'application/pdf' : file.type);
  };
  reader.readAsDataURL(file);
}

function scanAttachImage(input) {
  const file = input?.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    scanState.imageData = ev.target.result.split(',')[1];
    scanState.imageType = file.type;
    scanRender();
  };
  reader.readAsDataURL(file);
}

function scanManualMode() {
  scanState.mode = 'manual';
  scanRender();
}

function scanRender() {
  // Re-render just the modal sheet content without full page re-render
  const sheet = document.querySelector('.msh');
  if (sheet) { sheet.innerHTML = renderScanModal(); bindScanModal(); }
  else render();
}

async function runAIScan(b64data, mimeType) {
  const today = new Date().toISOString().split('T')[0];
  const isPDF = mimeType === 'application/pdf';

  const systemPrompt = `You are an invoice data extractor for a Maldives distribution business. Extract all line items from the invoice image/PDF.

This may be a Lotus Fihaara (Senior International) tax invoice. Their format is:
Item# | Item Name | Attribute | Size | Qty (e.g. "1 Case (12's)") | Price | Ext Price | Tax(T)

IMPORTANT Lotus rules:
- "Price" column = case price or half-case price (NOT unit price)
- "1 Case (12's)" → priceType = "casePrice", quantity = 1
- "1 Case (40's)" → priceType = "casePrice", quantity = 1  
- "1 Box (24 Pkts)" → priceType = "casePrice", quantity = 1
- "Half Case" or "6's" → priceType = "halfCase"
- Single units → priceType = "unit"
- Ext Price = lineTotal (before GST)
- GST 8% is ALWAYS exclusive (added on top), shown as separate line at bottom
- RECEIPT TOTAL = lineTotal + 8% GST = finalTotal
- itemName should combine Item Name + Attribute (e.g. "Antabax Shower Cream 250ml Fresh")

Return ONLY valid JSON, no markdown:
{
  "shopName": "string (from Bill To field)",
  "invoiceId": "string (e.g. LFF/1060502)",
  "date": "YYYY-MM-DD",
  "area": "",
  "gstInclusive": false,
  "paymentStatus": "Pending",
  "items": [
    {
      "itemName": "full name including attribute",
      "category": "",
      "priceType": "unit|halfCase|casePrice",
      "quantity": 1,
      "unitPrice": 0.00,
      "lineTotal": 0.00,
      "gstAmt": 0.00,
      "finalTotal": 0.00
    }
  ]
}

Calculate: gstAmt = lineTotal * 0.08, finalTotal = lineTotal * 1.08
Extract EVERY line item. Use today ${new Date().toISOString().split('T')[0]} if date unclear.`;

  const userContent = isPDF
    ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64data } },
       { type: 'text', text: 'Extract all invoice line items from this PDF invoice.' }]
    : [{ type: 'image', source: { type: 'base64', media_type: mimeType, data: b64data } },
       { type: 'text', text: 'Extract all invoice line items from this invoice image.' }];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });
    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();

    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/\s*```$/,'').trim();
    const parsed = JSON.parse(clean);

    scanState.meta = {
      shopName: parsed.shopName || '',
      invoiceId: parsed.invoiceId || '',
      date: parsed.date || today,
      area: parsed.area || '',
      gstInclusive: !!parsed.gstInclusive,
      paymentStatus: parsed.paymentStatus || 'Pending'
    };
    scanState.rows = (parsed.items || []).map(it => ({
      itemName: it.itemName || '',
      category: it.category || '',
      priceType: it.priceType || 'unit',
      quantity: parseFloat(it.quantity) || 1,
      unitPrice: parseFloat(it.unitPrice) || 0,
      lineTotal: parseFloat(it.lineTotal) || 0,
      gstAmt: parseFloat(it.gstAmt) || 0,
      finalTotal: parseFloat(it.finalTotal) || 0
    }));
    scanState.mode = 'review';
  } catch (err) {
    // AI failed — drop into manual review with empty rows
    scanState.rows = [];
    scanState.meta = { shopName: '', invoiceId: '', date: today, area: '', gstInclusive: false, paymentStatus: 'Pending' };
    scanState.mode = 'review';
    showToast('⚠️ AI read failed — fill in manually');
  }
  scanRender();
}

function scanRowUpdate(i, field, val) {
  if (!scanState.rows[i]) return;
  scanState.rows[i][field] = val;
  // Recalc totals live
  const r = scanState.rows[i];
  const qty = parseFloat(r.quantity) || 0;
  const price = parseFloat(r.unitPrice) || 0;
  const gstInc = scanState.meta.gstInclusive || false;
  const lt = +(qty * price).toFixed(2);
  const gstAmt = gstInc ? +(lt - lt/1.08).toFixed(2) : +(lt * 0.08).toFixed(2);
  const ft = gstInc ? lt : +(lt + gstAmt).toFixed(2);
  r.lineTotal = lt;
  r.gstAmt = gstAmt;
  r.finalTotal = ft;
  // Update just the total display without full re-render (avoid losing focus)
  const totEl = document.querySelectorAll('.msh .scan-row-total');
  if (totEl[i]) totEl[i].textContent = money(ft);
}

function scanAddRow() {
  scanState.rows.push({ itemName:'', category:'', priceType:'unit', quantity:1, unitPrice:0, lineTotal:0, gstAmt:0, finalTotal:0 });
  scanRender();
}

function scanRemoveRow(i) {
  scanState.rows.splice(i, 1);
  scanRender();
}

function saveScanInvoice() {
  const shop = (document.getElementById('sc-shop')||{}).value || scanState.meta.shopName || '';
  const invId = (document.getElementById('sc-inv')||{}).value || scanState.meta.invoiceId || '';
  const date = (document.getElementById('sc-date')||{}).value || scanState.meta.date || new Date().toISOString().split('T')[0];
  const area = (document.getElementById('sc-area')||{}).value || scanState.meta.area || '';
  const status = (document.getElementById('sc-status')||{}).value || 'Pending';
  const gstMode = (document.getElementById('sc-gstmode')||{}).value || 'exclusive';
  const gstInclusive = gstMode === 'inclusive';

  if (!shop) { showToast('⚠️ Enter a shop name'); return; }
  if (!scanState.rows.length) { showToast('⚠️ No items to save'); return; }

  let saved = 0;
  scanState.rows.forEach(r => {
    if (!r.itemName.trim()) return;
    const qty = parseFloat(r.quantity) || 1;
    const price = parseFloat(r.unitPrice) || 0;
    const lt = parseFloat(r.lineTotal) || +(qty * price).toFixed(2);
    const gst = parseFloat(r.gstAmt) || +(lt * 0.08).toFixed(2);
    const ft = parseFloat(r.finalTotal) || +(lt + gst).toFixed(2);
    const sale = {
      id: uid(), date, shopName: shop, area, invoiceId: invId,
      itemName: r.itemName.trim(), category: r.category || '',
      priceType: r.priceType || 'unit', quantity: qty, unitPrice: price,
      lineTotal: lt, gstInclusive, gstRate: 8, gstAmt: gst, finalTotal: ft,
      currency: STATE.currency || 'MVR', paymentStatus: status, notes: 'Scanned invoice'
    };
    STATE.sales.push(sale);
    if (!STATE.items.find(i => i.name.toLowerCase() === r.itemName.toLowerCase()))
      STATE.items.push({ id: uid(), name: r.itemName.trim(), category: r.category || '', unitPrice: r.priceType === 'unit' ? price : 0, halfPrice: r.priceType === 'halfCase' ? price : 0, casePrice: r.priceType === 'casePrice' ? price : 0 });
    if (!STATE.shops.find(s => s.name.toLowerCase() === shop.toLowerCase()))
      STATE.shops.push({ id: uid(), name: shop, area, owner: '', contact: '', priority: 'Medium', notes: '', lastVisit: date });
    saved++;
  });

  saveState();
  closeModal();
  showToast('✓ Saved ' + saved + ' items from invoice');
}

// ── NEW COMPANY MODAL ─────────────────────────────────────────────────────────
function renderNewCompanyModal() {
  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:18px">🏢</div>' +
        '<div class="mtit" style="margin-bottom:0">New Company</div>' +
      '</div>' +
      '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
    '</div>' +
    '<div class="fg">' +
      '<div class="iw"><label class="il">Company Name *</label><input id="nc-name" class="inp" placeholder="e.g. Al Farooq Trading"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div class="iw"><label class="il">Plan</label><input id="nc-plan" class="inp" placeholder="e.g. Standard"></div>' +
        '<div class="iw"><label class="il">Monthly Fee</label><input id="nc-fee" class="inp" type="number" min="0" placeholder="500"></div>' +
      '</div>' +
      '<div style="height:1px;background:var(--b);margin:4px 0 12px"></div>' +
      '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Admin Account</div>' +
      '<div class="iw"><label class="il">Admin Full Name *</label><input id="nc-admin-name" class="inp" placeholder="e.g. Ahmed Mohamed"></div>' +
      '<div class="iw"><label class="il">Admin Email *</label><input id="nc-admin-email" class="inp" type="email" placeholder="admin@company.com"></div>' +
      '<div class="iw" style="position:relative"><label class="il">Admin Password *</label>' +
        '<input id="nc-admin-pw" class="inp" type="password" placeholder="Minimum 6 characters" style="padding-right:44px">' +
        '<button onclick="var f=document.getElementById(\'nc-admin-pw\');f.type=f.type===\'password\'?\'text\':\'password\'" style="position:absolute;right:8px;top:26px;background:none;border:none;cursor:pointer;color:var(--t3);padding:6px;font-size:16px">👁</button>' +
      '</div>' +
      '<div id="nc-msg" style="display:none;padding:10px 13px;border-radius:var(--rx);font-size:13px"></div>' +
      '<button id="nc-submit" class="btn bp bw" style="height:48px;font-size:14px;font-weight:700" onclick="doCreateNewCompany()">Create Company + Admin Account</button>' +
    '</div>';
}

async function doCreateNewCompany() {
  const name = ((document.getElementById('nc-name')||{}).value||'').trim();
  const adminName = ((document.getElementById('nc-admin-name')||{}).value||'').trim();
  const adminEmail = ((document.getElementById('nc-admin-email')||{}).value||'').trim();
  const adminPw = (document.getElementById('nc-admin-pw')||{}).value||'';
  const plan = ((document.getElementById('nc-plan')||{}).value||'').trim();
  const fee = ((document.getElementById('nc-fee')||{}).value||'');
  const msg = document.getElementById('nc-msg');
  const btn = document.getElementById('nc-submit');
  const showMsg = (m, ok=false) => { if(msg){ msg.style.display='block'; msg.style.background=ok?'var(--oks)':'var(--errs)'; msg.style.color=ok?'var(--ok)':'var(--err)'; msg.textContent=m; } };
  if (!name||!adminName||!adminEmail||!adminPw) { showMsg('Fill all required fields (*)'); return; }
  if (adminPw.length < 6) { showMsg('Password must be at least 6 characters'); return; }
  if (btn) { btn.innerHTML='<span class="spin"></span> Creating…'; btn.disabled=true; }
  if (!window.createCompanyWithAdmin) { showMsg('Firebase not ready — try again'); if(btn){btn.textContent='Create Company + Admin Account';btn.disabled=false;} return; }
  const result = await window.createCompanyWithAdmin(name, adminName, adminEmail, adminPw, plan, fee);
  if (result.success) {
    if (_platformOrgs && result.orgId) {
      _platformOrgs.push({id:result.orgId,name,status:'active',inviteCode:result.inviteCode,billing:{plan,monthlyFee:parseFloat(fee)||0},createdAt:{toDate:()=>new Date()},ownerId:result.adminUid});
    }
    showToast('✓ Company "'+name+'" created!');
    closeModal();
    loadPlatformOrgs();
  } else {
    showMsg(result.error||'Creation failed');
    if (btn) { btn.textContent='Create Company + Admin Account'; btn.disabled=false; }
  }
}

// ── ADD COMPANY ADMIN MODAL ───────────────────────────────────────────────────
function renderAddCompanyAdminModal(orgId, orgName) {
  return '<div class="mhan"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-size:18px">👤</div>' +
        '<div><div class="mtit" style="margin-bottom:0">Add Admin Account</div>' +
        '<div style="font-size:11px;color:var(--t2)">for '+esc(orgName||'company')+'</div></div>' +
      '</div>' +
      '<button onclick="closeModal()" style="background:var(--s2);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;color:var(--t2);font-size:18px;display:flex;align-items:center;justify-content:center">&times;</button>' +
    '</div>' +
    '<div class="fg">' +
      '<div class="iw"><label class="il">Full Name *</label><input id="ca-name" class="inp" placeholder="e.g. Sara Ahmed"></div>' +
      '<div class="iw"><label class="il">Email *</label><input id="ca-email" class="inp" type="email" placeholder="admin@company.com"></div>' +
      '<div class="iw" style="position:relative"><label class="il">Password *</label>' +
        '<input id="ca-pw" class="inp" type="password" placeholder="Minimum 6 characters" style="padding-right:44px">' +
        '<button onclick="var f=document.getElementById(\'ca-pw\');f.type=f.type===\'password\'?\'text\':\'password\'" style="position:absolute;right:8px;top:26px;background:none;border:none;cursor:pointer;color:var(--t3);padding:6px;font-size:16px">👁</button>' +
      '</div>' +
      '<div id="ca-msg" style="display:none;padding:10px 13px;border-radius:var(--rx);font-size:13px"></div>' +
      '<button id="ca-submit" class="btn bp bw" style="height:48px;font-size:14px;font-weight:700" onclick="doAddCompanyAdmin(\''+esc(orgId||'')+'\')">Create Admin Account</button>' +
    '</div>';
}

async function doAddCompanyAdmin(orgId) {
  const name = ((document.getElementById('ca-name')||{}).value||'').trim();
  const email = ((document.getElementById('ca-email')||{}).value||'').trim();
  const pw = (document.getElementById('ca-pw')||{}).value||'';
  const msg = document.getElementById('ca-msg');
  const btn = document.getElementById('ca-submit');
  const showMsg = (m, ok=false) => { if(msg){ msg.style.display='block'; msg.style.background=ok?'var(--oks)':'var(--errs)'; msg.style.color=ok?'var(--ok)':'var(--err)'; msg.textContent=m; } };
  if (!name||!email||!pw) { showMsg('Fill all required fields'); return; }
  if (pw.length < 6) { showMsg('Password must be at least 6 characters'); return; }
  if (btn) { btn.innerHTML='<span class="spin"></span> Creating…'; btn.disabled=true; }
  if (!window.createCompanyAdminAccount) { showMsg('Firebase not ready — try again'); if(btn){btn.textContent='Create Admin Account';btn.disabled=false;} return; }
  const result = await window.createCompanyAdminAccount(orgId, name, email, pw);
  if (result.success) {
    showToast('✓ Admin account created for '+email);
    closeModal();
    if(typeof loadPlatformMembers==='function') loadPlatformMembers(orgId);
  } else {
    showMsg(result.error||'Failed to create account');
    if (btn) { btn.textContent='Create Admin Account'; btn.disabled=false; }
  }
}