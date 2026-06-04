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
  if (!window.jspdf) { showToast('⚠️ PDF library not loaded yet — try again'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const biz = db.get('bizProfile', {name:'Lotus Fihaara',address:"Male', Maldives",tel:'',tin:'',bank:''});
  const shop = STATE.shops.find(s => normShopName(s.name) === normShopName(inv.shopName)) || {};
  const base = inv.items.reduce((a, i) => a + saleBaseTotal(i), 0);
  const gstTot = inv.items.reduce((a, i) => a + saleGstTotal(i), 0);
  const stat = inv.paid >= inv.finalTotal && inv.finalTotal > 0 ? 'PAID'
             : inv.paid > 0 ? 'PARTIAL' : 'UNPAID';

  const W = 210, M = 14;
  let y = M;

  // ── HEADER BAR ──────────────────────────────────────────────────────────────
  doc.setFillColor(17, 17, 17);
  doc.rect(M, y, W - M * 2, 20, 'F');

  // Biz name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(biz.name || 'Lotus Fihaara', M + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  if (biz.address) doc.text(biz.address, M + 4, y + 12);
  if (biz.tel) doc.text('TEL: ' + biz.tel, M + 4, y + 17);

  // Invoice title (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('TAX INVOICE', W - M - 4, y + 8, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(inv.id, W - M - 4, y + 14, { align: 'right' });
  doc.text(inv.date, W - M - 4, y + 19, { align: 'right' });

  y += 24;

  // ── BILL TO + SUMMARY ROW ────────────────────────────────────────────────────
  const colW = (W - M * 2) / 2 - 3;

  // Bill-To box
  doc.setFillColor(244, 244, 250);
  doc.rect(M, y, colW, 24, 'F');
  doc.setTextColor(100, 100, 130);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BILL TO', M + 3, y + 5);
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(11);
  doc.text(inv.shopName, M + 3, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  let shopY = y + 17;
  if (shop.owner) { doc.text(shop.owner, M + 3, shopY); shopY += 5; }
  if (inv.area || shop.area) doc.text(inv.area || shop.area, M + 3, shopY);
  if (shop.contact) {
    doc.setTextColor(100, 100, 130);
    doc.text('Tel: ' + shop.contact, M + 3, shopY + 5);
  }

  // Invoice detail box (right)
  const rx = M + colW + 6;
  doc.setFillColor(244, 244, 250);
  doc.rect(rx, y, colW, 24, 'F');
  doc.setTextColor(100, 100, 130);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('INVOICE DETAILS', rx + 3, y + 5);
  doc.setTextColor(17, 17, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ref:   ' + inv.id, rx + 3, y + 11);
  doc.text('Date:  ' + inv.date, rx + 3, y + 17);
  doc.text('Items: ' + inv.items.length, rx + 3, y + 22);

  // Status badge + amount (far right inside detail box)
  const statusColors = { PAID: [16, 185, 129], PARTIAL: [245, 158, 11], UNPAID: [239, 68, 68] };
  const [sr, sg, sb] = statusColors[stat] || [100, 100, 100];
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(rx + colW - 32, y + 3, 29, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(stat, rx + colW - 17.5, y + 8.5, { align: 'center' });

  // Total amount
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(13);
  doc.text(money(inv.finalTotal), rx + colW - 3, y + 21, { align: 'right' });

  y += 28;

  // Bank notice
  if (biz.bank) {
    doc.setFillColor(255, 243, 205);
    doc.rect(M, y, W - M * 2, 7, 'F');
    doc.setTextColor(120, 90, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Payments: ' + biz.bank, (W) / 2, y + 4.8, { align: 'center' });
    y += 10;
  }

  if (biz.tin) {
    doc.setTextColor(100, 100, 130);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('TIN: ' + biz.tin, W - M, y, { align: 'right' });
    y += 4;
  }

  // ── ITEMS TABLE ─────────────────────────────────────────────────────────────
  doc.autoTable({
    startY: y,
    head: [['#', 'Item Description', 'Pack', 'Qty', 'Unit Price', 'Ext. Price', 'Tax']],
    body: inv.items.map((it, idx) => [
      idx + 1,
      it.itemName + (it.category ? '\n(' + it.category + ')' : ''),
      tierLabel(it.priceType),
      it.quantity,
      money(it.unitPrice),
      money(saleBaseTotal(it)),
      it.gstInclusive ? 'Incl.' : '+8%'
    ]),
    margin: { left: M, right: M },
    headStyles: {
      fillColor: [17, 17, 17],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
    },
    bodyStyles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }, textColor: [30, 30, 40] },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 16, halign: 'center' }
    },
    styles: { lineColor: [220, 220, 235], lineWidth: 0.15 }
  });

  y = doc.lastAutoTable.finalY + 5;

  // ── TOTALS BOX ──────────────────────────────────────────────────────────────
  const totW = 76, totX = W - M - totW;

  doc.setFillColor(248, 248, 252);
  doc.setDrawColor(220, 220, 235);
  doc.rect(totX, y, totW, 8, 'FD');
  doc.setTextColor(100, 100, 130);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Subtotal (ex-GST):', totX + 3, y + 5.5);
  doc.setTextColor(17, 17, 17);
  doc.text(money(base), totX + totW - 3, y + 5.5, { align: 'right' });
  y += 8;

  doc.setFillColor(245, 243, 255);
  doc.rect(totX, y, totW, 8, 'FD');
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('GST @ 8%:', totX + 3, y + 5.5);
  doc.text('+ ' + money(gstTot), totX + totW - 3, y + 5.5, { align: 'right' });
  y += 8;

  doc.setFillColor(17, 17, 17);
  doc.rect(totX, y, totW, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RECEIPT TOTAL:', totX + 3, y + 7);
  doc.text(money(inv.finalTotal), totX + totW - 3, y + 7, { align: 'right' });
  y += 15;

  if (inv.paid > 0 && stat !== 'PAID') {
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Balance Due: ' + money(inv.finalTotal - inv.paid), totX + totW - 3, y, { align: 'right' });
    y += 8;
  }

  // ── SIGNATURE SECTION ───────────────────────────────────────────────────────
  doc.setDrawColor(210, 210, 220);
  doc.line(M, y, W - M, y);
  y += 5;

  const sigW = (W - M * 2 - 6) / 2;
  const sigH = 26;
  const sigLines = [
    ['DELIVERED BY', ['Name & Phone No: ..................................', 'Date: ............. Signature: .....................', 'Packages Delivered: ...............................']],
    ['RECEIVED IN GOOD CONDITION', ['Location / ID / Name & Phone: ...................', 'Date: .............. Signature: ....................', 'Packages Received: ................................']]
  ];
  sigLines.forEach(([title, lines], i) => {
    const sx = M + i * (sigW + 6);
    doc.setFillColor(250, 250, 253);
    doc.rect(sx, y, sigW, sigH, 'F');
    doc.setTextColor(17, 17, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(title, sx + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 130);
    lines.forEach((l, li) => doc.text(l, sx + 3, y + 10 + li * 5.5));
  });

  y += sigH + 5;

  // ── FOOTER NOTICE ────────────────────────────────────────────────────────────
  doc.setDrawColor(210, 210, 220);
  doc.line(M, y, W - M, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 160);
  doc.text('Notice must be given of any goods not received, damaged or short within 48 hours from delivery date.', W / 2, y, { align: 'center' });
  doc.text('Complaints accepted only in writing. Invoice assumed correct if no discrepancy notified within the stated period.', W / 2, y + 4.5, { align: 'center' });

  // Page count
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 180);
    doc.text('Page ' + p + ' of ' + pages, W - M, 290, { align: 'right' });
  }

  const fname = 'Invoice-' + (inv.id || 'draft').replace(/[^a-z0-9]/gi, '-') + '-' + inv.date + '.pdf';
  doc.save(fname);
  showToast('✓ PDF saved — ' + fname);
}