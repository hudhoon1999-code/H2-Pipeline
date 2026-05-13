'use strict';
// ── INVOICES ──────────────────────────────────────────────────────────────
// ── INVOICES ──────────────────────────────────────────────────────────────────
let invDetail = null;
let salesMassMode = false;
let selectedSales = new Set();
function renderInvoices() {
  const sales = STATE.isAdmin ? STATE.sales : getVisibleSalesForUser();
  const imap = {};
  sales.forEach(s => {
    const key = s.invoiceId || (s.shopName + '-' + s.date);
    if (!imap[key]) imap[key] = {id:key,shopName:s.shopName,area:s.area||'',date:s.date,items:[],lineTotal:0,gstTotal:0,finalTotal:0,paid:0};
    imap[key].items.push(s);
    imap[key].lineTotal += (parseFloat(s.lineTotal)||0);
    imap[key].gstTotal += (parseFloat(s.gstAmt)||0);
    imap[key].finalTotal += (parseFloat(s.finalTotal)||0);
    if(s.paymentStatus==='Paid') imap[key].paid += (parseFloat(s.finalTotal)||0);
  });
  const invs = Object.values(imap).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if (invDetail) {
    const inv = invs.find(i=>i.id===invDetail);
    if (inv) return renderInvDetail(inv);
    invDetail = null; // stale — fall through to list
  }
  return '<div class="fu"><div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">Invoices</h1><div style="font-size:12px;color:var(--t2)">' + invs.length + ' invoices</div></div>' +
    (invs.length ? invs.map(inv => {
      const stat = inv.paid>=inv.finalTotal&&inv.finalTotal>0?'Paid':inv.paid>0?'Partial':'Pending';
      return '<div class="card csm chov" style="margin-bottom:10px;cursor:pointer" onclick="invDetail=\'' + inv.id + '\';render()">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div><div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.06em">' + inv.id + '</div>' +
        '<div style="font-size:16px;font-weight:700;margin-top:2px">' + inv.shopName + '</div>' +
        '<div style="font-size:11px;color:var(--t2)">' + inv.area + ' \u00b7 ' + inv.date + ' \u00b7 ' + inv.items.length + ' items</div></div>' +
        '<div style="text-align:right"><div style="font-size:18px;font-weight:800;color:var(--a)">' + money(inv.finalTotal) + '</div>' +
        '<span class="badge ' + (stat==='Paid'?'bpaid':stat==='Partial'?'bpart':'bpend') + '">' + stat + '</span></div></div>' +
        (stat!=='Paid'&&inv.finalTotal>0?'<div class="pb" style="margin-top:10px"><div class="pf" style="width:' + Math.round(inv.paid/inv.finalTotal*100) + '%;background:' + (stat==='Partial'?'var(--warn)':'var(--a)') + '"></div></div>':'') +
        '</div>';
    }).join('') : '<div class="empty"><div class="eico">\uD83E\uDDFE</div><div class="etit">No invoices yet</div><div class="esub">Add sales with Invoice IDs</div></div>') + '</div>';
}
function renderInvDetail(inv) {
  window._pdfInv = inv; // stored for PDF button
  const stat = inv.paid>=inv.finalTotal&&inv.finalTotal>0?'Paid':inv.paid>0?'Partial':'Pending';
  const base = inv.items.reduce((a,i)=>a+(parseFloat(i.lineTotal)||0),0);
  const adminActions = STATE.isAdmin ? (
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
      (stat!=='Paid'?'<button class="btn" style="background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:9px 16px;font-size:13px;font-weight:700" onclick="markInvoicePaid(\''+inv.id+'\')">✓ Mark All Paid</button>':'') +
      '<button class="btn bs" style="padding:9px 16px;font-size:13px" onclick="editInvoiceStatus(\''+inv.id+'\')">✏️ Edit Status</button>' +
      '<button class="btn bd" style="padding:9px 16px;font-size:13px" onclick="deleteInvoice(\''+inv.id+'\')">🗑 Delete Invoice</button>' +
    '</div>'
  ) : '';

  return '<div class="fu">' +
    '<button class="btn bg2" style="margin-bottom:14px;padding:6px 0;display:flex;align-items:center;gap:4px" onclick="invDetail=null;render();setTimeout(()=>{const c=document.getElementById(\'content\');if(c)c.scrollTop=0;},10)">' + IC.back + ' All Invoices</button>' +

    // Invoice header card
    '<div style="background:var(--s);border:1px solid var(--b);border-radius:var(--rl);padding:18px;margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">' +
        '<div>' +
          '<div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Invoice</div>' +
          '<div style="font-family:Outfit,sans-serif;font-size:22px;font-weight:800">' + inv.id + '</div>' +
          '<div style="font-size:14px;font-weight:600;margin-top:2px">' + inv.shopName + '</div>' +
          '<div style="font-size:12px;color:var(--t2)">' + (inv.area?inv.area+' · ':'') + inv.date + ' · ' + inv.items.length + ' item' + (inv.items.length!==1?'s':'') + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-family:Outfit,sans-serif;font-size:26px;font-weight:800;color:var(--a)">' + money(inv.finalTotal) + '</div>' +
          '<span class="badge ' + (stat==='Paid'?'bpaid':stat==='Partial'?'bpart':'bpend') + '" style="font-size:11px;padding:4px 12px">' + stat + '</span>' +
        '</div>' +
      '</div>' +
      (stat!=='Paid'&&inv.finalTotal>0?'<div class="pb" style="margin-top:4px"><div class="pf" style="width:'+Math.round(inv.paid/inv.finalTotal*100)+'%;background:'+(stat==='Partial'?'var(--warn)':'var(--ok)')+'"></div></div>':'') +
    '</div>' +

    adminActions +

    // Items table
    '<div style="background:var(--s);border:1px solid var(--b);border-radius:var(--rl);overflow:hidden;margin-bottom:14px">' +
      inv.items.map((it,idx) => {
        const itStat = it.paymentStatus||stat;
        return '<div style="padding:14px 16px;border-bottom:1px solid var(--b);' + (idx===inv.items.length-1?'border-bottom:none':'') + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + it.itemName + '</div>' +
              '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap">' +
                '<span class="badge ' + ((it.priceType==='case'||it.priceType==='casePrice')?'bcase':(it.priceType==='halfCase')?'bhalf':'bpart') + '" style="font-size:9px">' + tierLabel(it.priceType) + '</span>' +
                '<span style="font-size:11px;color:var(--t3)">× ' + it.quantity + ' @ ' + money(it.unitPrice) + '</span>' +
                '<span class="badge bgst" style="font-size:9px">' + (it.gstInclusive?'GST Incl.':'+8% GST') + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="text-align:right;flex-shrink:0">' +
              '<div style="font-size:15px;font-weight:800;color:var(--a)">' + money(parseFloat(it.finalTotal)||0) + '</div>' +
              '<div style="font-size:10px;color:var(--gst);margin-top:2px">GST ' + money(parseFloat(it.gstAmt)||0) + '</div>' +
              (STATE.isAdmin?'<div style="display:flex;gap:4px;margin-top:6px;justify-content:flex-end">' +
                '<button class="btn bic" style="width:26px;height:26px" onclick="editSaleRow(\''+it.id+'\')" title="Edit">'+IC.edit+'</button>' +
                '<button class="btn bic" style="width:26px;height:26px;background:var(--errs);color:var(--err)" onclick="delSaleRow(\''+it.id+'\',\''+inv.id+'\')" title="Delete">'+IC.trash+'</button>' +
              '</div>':'') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    // Totals
    '<div style="background:var(--s2);border-radius:var(--rs);padding:14px;margin-bottom:14px">' +
      '<div class="gstrow" style="font-size:12px"><span style="color:var(--t2)">Subtotal (ex-GST)</span><span style="font-weight:600">' + money(base) + '</span></div>' +
      '<div class="gstrow" style="font-size:12px"><span style="color:var(--gst)">GST @ 8%</span><span style="color:var(--gst);font-weight:600">' + money(inv.gstTotal) + '</span></div>' +
      '<div style="height:1px;background:var(--b);margin:8px 0"></div>' +
      '<div class="gstrow" style="font-size:17px;font-weight:800"><span>Total</span><span style="color:var(--a)">' + money(inv.finalTotal) + '</span></div>' +
      (inv.paid>0&&stat!=='Paid'?'<div class="gstrow" style="font-size:12px;color:var(--warn);font-weight:700;margin-top:6px"><span>Balance Due</span><span>' + money(inv.finalTotal-inv.paid) + '</span></div>':'') +
    '</div>' +

    '<button class="btn bp bw" style="height:48px;font-size:14px" onclick="generateInvoicePDF(window._pdfInv)">📄 Download Invoice</button>' +
  '</div>';
}

// ── INVOICE EDIT ACTIONS (admin only) ─────────────────────────────────────────
function markInvoicePaid(invId) {
  STATE.sales = STATE.sales.map(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    return key === invId ? {...s, paymentStatus:'Paid'} : s;
  });
  saveState(); showToast('✓ Invoice marked Paid'); render();
}

function deleteInvoice(invId) {
  if(!confirm('Delete this entire invoice and all its items?')) return;
  STATE.sales = STATE.sales.filter(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    return key !== invId;
  });
  invDetail = null;
  saveState(); showToast('Invoice deleted'); render();
}

function delSaleRow(saleId, invId) {
  if(!confirm('Remove this item from the invoice?')) return;
  STATE.sales = STATE.sales.filter(s=>s.id!==saleId);
  // If invoice is now empty, go back to list
  const remaining = STATE.sales.filter(s=>(s.invoiceId||(s.shopName+'-'+s.date))===invId);
  if(!remaining.length) invDetail = null;
  saveState(); showToast('Item removed'); render();
}

function editSaleRow(saleId) {
  const sale = STATE.sales.find(s=>s.id===saleId); if(!sale) return;
  STATE.modal = {type:'editsale', data:{id:saleId}};
  render();
}

function editInvoiceStatus(invId) {
  const status = prompt('Set payment status:\n1 = Pending\n2 = Paid\n3 = Partial\n\nEnter 1, 2 or 3:');
  const map = {'1':'Pending','2':'Paid','3':'Partial'};
  if(!map[status]) return;
  STATE.sales = STATE.sales.map(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    return key === invId ? {...s, paymentStatus:map[status]} : s;
  });
  saveState(); showToast('✓ Status updated to ' + map[status]); render();
}

function renderEditSaleModal(id) {
  const sale = STATE.sales.find(s=>s.id===id); if(!sale) return '<div class="mhan"></div><div class="mtit">Not found</div>';
  return '<div class="mhan"></div>' +
    '<div style="font-family:Outfit,sans-serif;font-size:18px;font-weight:800;margin-bottom:16px">Edit Line Item</div>' +
    '<div class="fg">' +
      '<div class="iw"><label class="il">Item Name</label><input id="es-name" class="inp" value="' + (sale.itemName||'') + '"></div>' +
      '<div class="fr">' +
        '<div class="iw"><label class="il">Qty</label><input id="es-qty" class="inp" type="number" value="' + (sale.quantity||1) + '" step="0.5" oninput="recalcEdit()"></div>' +
        '<div class="iw"><label class="il">Unit Price</label><input id="es-price" class="inp" type="number" value="' + (sale.unitPrice||0) + '" step="0.01" oninput="recalcEdit()"></div>' +
      '</div>' +
      '<div class="iw"><label class="il">Price Type</label>' +
        '<select id="es-ptype" class="inp">' +
          '<option value="unit"' + (sale.priceType==='unit'?' selected':'') + '>Unit</option>' +
          '<option value="halfCase"' + (sale.priceType==='halfCase'?' selected':'') + '>Half Case (6)</option>' +
          '<option value="casePrice"' + (sale.priceType==='casePrice'?' selected':'') + '>Case (12)</option>' +
        '</select>' +
      '</div>' +
      '<div class="iw"><label class="il">Payment Status</label>' +
        '<select id="es-status" class="inp">' +
          ['Pending','Paid','Partial'].map(s=>'<option'+(sale.paymentStatus===s?' selected':'')+'>'+s+'</option>').join('') +
        '</select>' +
      '</div>' +
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--gst)">' +
        '<input type="checkbox" id="es-gst" '+(sale.gstInclusive?'checked':'')+' style="width:16px;height:16px;accent-color:var(--gst)" onchange="recalcEdit()"> GST Already Included' +
      '</label>' +
      '<div id="es-preview" style="background:var(--s2);border-radius:var(--rs);padding:12px;font-size:12px;color:var(--t2)">—</div>' +
      '<div style="display:flex;gap:10px">' +
        '<button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>' +
        '<button class="btn bp" style="flex:2;height:46px" onclick="saveEditSale(\''+id+'\')">Save Changes</button>' +
      '</div>' +
    '</div>';
}

function recalcEdit() {
  const qty = parseFloat((document.getElementById('es-qty')||{}).value)||0;
  const price = parseFloat((document.getElementById('es-price')||{}).value)||0;
  const inc = (document.getElementById('es-gst')||{}).checked||false;
  const lt = +(qty*price).toFixed(2);
  const g = calcGST(lt,inc);
  const el = document.getElementById('es-preview');
  if(el) el.innerHTML = 'Line: <strong>' + money(lt) + '</strong> · GST: <strong style="color:var(--gst)">' + money(g.gst) + '</strong> · Total: <strong style="color:var(--a)">' + money(g.total) + '</strong>';
}

function saveEditSale(id) {
  const v = i => (document.getElementById(i)||{}).value||'';
  const qty = parseFloat(v('es-qty'))||0;
  const price = parseFloat(v('es-price'))||0;
  const inc = (document.getElementById('es-gst')||{}).checked||false;
  if(!qty||!price){showToast('⚠️ Fill qty and price');return;}
  const lt = +(qty*price).toFixed(2);
  const g = calcGST(lt,inc);
  STATE.sales = STATE.sales.map(s => s.id===id ? {
    ...s,
    itemName: v('es-name')||s.itemName,
    quantity: qty, unitPrice: price,
    priceType: v('es-ptype')||s.priceType,
    paymentStatus: v('es-status')||s.paymentStatus,
    gstInclusive: inc, lineTotal: lt,
    gstAmt: g.gst, finalTotal: g.total
  } : s);
  saveState(); showToast('✓ Item updated'); closeModal();
}


function generateInvoicePDF(inv) {
  const biz = db.get('bizProfile', {name:'H2 Line Distribution',address:'Male\', Maldives',tel:'',tin:'',bank:''});
  const shop = STATE.shops.find(s=>normShopName(s.name)===normShopName(inv.shopName))||{};
  const base = inv.items.reduce((a,i)=>a+saleBaseTotal(i),0);
  const gstTot = inv.items.reduce((a,i)=>a+saleGstTotal(i),0);
  const rows = inv.items.map((it,idx)=>`
    <tr>
      <td>${(idx+1)}</td>
      <td><strong>${it.itemName}</strong>${it.category?'<br><small>'+it.category+'</small>':''}</td>
      <td>${tierLabel(it.priceType)}</td>
      <td style="text-align:center">${it.quantity}</td>
      <td style="text-align:right">${money(it.unitPrice,inv.currency)}</td>
      <td style="text-align:right">${money(saleBaseTotal(it),inv.currency)}</td>
      <td style="text-align:center">${it.gstInclusive?'Incl.':'T'}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${inv.id}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Arial',sans-serif;font-size:12px;color:#111;background:#fff;padding:20px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid #111}
.biz-name{font-size:18px;font-weight:bold;margin-bottom:2px}
.biz-sub{font-size:10px;color:#555;line-height:1.5}
.inv-title{font-size:22px;font-weight:bold;font-style:italic;text-align:right}
.inv-num{font-size:14px;font-weight:bold;text-align:right}
.inv-meta{font-size:10px;text-align:right;color:#555;margin-top:4px}
.bank-notice{background:#fff3cd;border:1px solid #ffc107;padding:6px 10px;font-size:9px;margin:8px 0;text-align:center}
.bill-section{display:flex;justify-content:space-between;margin:12px 0;padding:8px;border:1px solid #ddd}
.bill-lbl{font-size:9px;font-weight:bold;text-transform:uppercase;color:#666;margin-bottom:3px}
.bill-val{font-size:12px;font-weight:bold}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11px}
thead tr{background:#111;color:#fff}
th{padding:6px 8px;text-align:left;font-size:10px;font-weight:bold;letter-spacing:.04em}
td{padding:6px 8px;border-bottom:1px solid #eee;vertical-align:middle}
tr:last-child td{border-bottom:none}
.totals{margin-left:auto;width:260px;border:1px solid #ddd;margin-top:8px}
.tot-row{display:flex;justify-content:space-between;padding:5px 10px;font-size:12px}
.tot-row.grand{background:#111;color:#fff;font-weight:bold;font-size:14px}
.sig-section{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px;border-top:1px solid #ddd;padding-top:12px}
.sig-box{font-size:10px;line-height:2.2;color:#444}
.notice{margin-top:14px;font-size:9px;color:#777;text-align:center;border-top:1px solid #eee;padding-top:8px;line-height:1.6}
@media print{body{padding:0}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="biz-name">${biz.name}</div>
    <div class="biz-sub">${biz.address}${biz.tel?'<br>TEL: '+biz.tel:''}</div>
    ${biz.tin?'<div class="biz-sub">TIN: '+biz.tin+'</div>':''}
  </div>
  <div>
    <div class="inv-title">Tax Invoice</div>
    <div class="inv-num">${inv.id}</div>
    <div class="inv-meta">Date: ${inv.date}<br>Printed: ${new Date().toLocaleDateString()}</div>
  </div>
</div>
${biz.bank?'<div class="bank-notice">Payments: '+biz.bank+'</div>':''}
<div class="bill-section">
  <div>
    <div class="bill-lbl">Bill To</div>
    <div class="bill-val">${inv.shopName}</div>
    ${shop.owner?'<div style="font-size:11px">'+shop.owner+'</div>':''}
    ${shop.area?'<div style="font-size:10px;color:#666">'+shop.area+'</div>':''}
    ${shop.contact?'<div style="font-size:10px;color:#666">📞 '+shop.contact+'</div>':''}
  </div>
  <div style="text-align:right">
    <div class="bill-lbl">Invoice Details</div>
    <div style="font-size:10px;line-height:1.8">Ref: ${inv.id}<br>Date: ${inv.date}<br>Items: ${inv.items.length}</div>
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>Item Name</th><th>Pack Type</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Ext Price</th><th style="text-align:center">Tax</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div class="tot-row"><span>Subtotal:</span><span>${money(base)}</span></div>
  <div class="tot-row"><span>GST 8%:</span><span>+ ${money(gstTot)}</span></div>
  <div class="tot-row grand"><span>RECEIPT TOTAL:</span><span>${money(inv.finalTotal)}</span></div>
</div>
<div class="sig-section">
  <div class="sig-box">
    <strong>Goods Delivered By:</strong><br>
    Name &amp; Phone No:................................<br>
    Date:.................. Signature:....................<br>
    Total No. of Packages Delivered: . . . . . . . .
  </div>
  <div class="sig-box">
    <strong>Goods Received in Good Condition:</strong><br>
    Location, ID, Name &amp; Phone No:.................<br>
    Date:................... Signature:...................<br>
    Total No of Packages Received: . . . . . . . . .
  </div>
</div>
<div class="notice">
  Notice must be given of any goods not received, damaged or short within 48 hours from delivery date.<br>
  Complaints accepted only in writing. Invoice assumed correct if no discrepancy notified.
</div>
</body></html>`;
  // Download as HTML file — open in browser and use Share → Print to get PDF
  const fname = 'invoice-' + (inv.id||'draft').replace(/[^a-z0-9]/gi,'-') + '-' + inv.date + '.html';
  dlFile(html, fname, 'text/html');
  showToast('✓ Invoice downloaded — open file → Share → Print for PDF');
}