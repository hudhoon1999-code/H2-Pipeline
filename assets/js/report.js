'use strict';
// ── WEEKLY REPORT ─────────────────────────────────────────────────────────
// ── WEEKLY REPORT ─────────────────────────────────────────────────────────────
let selWeek = null;
let expandedWeeks = new Set();
let reportViewMode = 'invoices'; // 'invoices' | 'lines'
function renderReport() {
  // Build weeks with data — agents only see their own sales
  const reportSales = STATE.isAdmin ? STATE.sales : getVisibleSalesForUser();
  const wmap = {};
  reportSales.forEach(s => { const w=weekStart(s.date); if(!wmap[w]) wmap[w]=[]; wmap[w].push(s); });

  // Generate calendar weeks: 4 past + current + 8 future
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const curWk = weekStart(todayStr);
  const calWeeks = [];
  for(let i=-4;i<=8;i++){
    const d=new Date(curWk); d.setDate(d.getDate()+i*6);
    // snap to correct week start
    const ws=weekStart(d.toISOString().split('T')[0]);
    if(!calWeeks.includes(ws)) calWeeks.push(ws);
  }
  // Also include any weeks with historical data not in range
  Object.keys(wmap).forEach(w=>{ if(!calWeeks.includes(w)) calWeeks.push(w); });
  calWeeks.sort((a,b)=>b.localeCompare(a)); // newest first

  if(!selWeek) selWeek = curWk;

  const grandTot = STATE.sales.reduce((a,r)=>a+saleFinalTotal(r),0);
  const grandPaid = STATE.sales.filter(r=>r.paymentStatus==='Paid').reduce((a,r)=>a+saleFinalTotal(r),0);
  const grandGST = STATE.sales.reduce((a,r)=>a+saleGstTotal(r),0);

  return '<div class="fu">' +
    '<div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">Reports</h1>' +
    '<div style="font-size:12px;color:var(--t2)">Business week: Sat – Thu</div></div>' +

    // All-time summary
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">' +
    [['All Sales',grandTot,'var(--a)'],['Collected',grandPaid,'var(--ok)'],['GST',grandGST,'var(--gst)']].map(([l,v,c])=>
      '<div style="background:var(--s);border:1px solid var(--b);border-radius:var(--rs);padding:10px">' +
      '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase">' + l + '</div>' +
      '<div style="font-size:13px;font-weight:800;color:'+c+';margin-top:2px">' + money(v) + '</div></div>'
    ).join('') + '</div>' +

    // Week cards
    calWeeks.map(w => {
      const wd = wmap[w] || [];
      const wTot = wd.reduce((a,r)=>a+saleFinalTotal(r),0);
      const wPaid = wd.filter(r=>r.paymentStatus==='Paid').reduce((a,r)=>a+saleFinalTotal(r),0);
      const wGST = wd.reduce((a,r)=>a+saleGstTotal(r),0);
      const isCur = w===curWk;
      const isFut = w>curWk;
      const isExp = expandedWeeks.has(w);
      const hasData = wd.length>0;
      return '<div class="card csm" style="margin-bottom:8px;border-color:' + (isCur?'rgba(99,102,241,.4)':isFut?'var(--b)':'var(--b)') + '">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="' + (hasData?'toggleWeek(\''+w+'\')':'') + '">' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            (isCur?'<span style="font-size:9px;background:var(--a);color:#fff;padding:2px 6px;border-radius:99px;font-weight:700">THIS WEEK</span>':isFut?'<span style="font-size:9px;background:var(--s2);color:var(--t3);padding:2px 6px;border-radius:99px;font-weight:700">UPCOMING</span>':'') +
            '<div style="font-size:12px;font-weight:600;color:'+(isFut?'var(--t3)':'var(--t)')+'">' + weekLabel(w) + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            (hasData?'<div style="font-size:13px;font-weight:800;color:var(--a)">' + money(wTot) + '</div>':'<div style="font-size:11px;color:var(--t3)">No sales</div>') +
            (hasData?'<span style="color:var(--t3);font-size:14px">'+(isExp?'▴':'▾')+'</span>':'') +
          '</div>' +
        '</div>' +
        (isExp && hasData ? '<div style="margin-top:10px;border-top:1px solid var(--b);padding-top:10px">' +
          // Mini KPI row
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">' +
          [['Total',wTot,'var(--a)'],['Paid',wPaid,'var(--ok)'],['Pending',wTot-wPaid,'var(--warn)'],['GST',wGST,'var(--gst)']].map(([l,v,c])=>
            '<div style="background:var(--s2);border-radius:var(--rx);padding:8px;text-align:center">' +
            '<div style="font-size:8px;color:var(--t3);font-weight:700;text-transform:uppercase">' + l + '</div>' +
            '<div style="font-size:11px;font-weight:800;color:'+c+';margin-top:2px">' + money(v) + '</div></div>'
          ).join('') + '</div>' +
          // View toggle
          '<div style="display:flex;gap:6px;margin-bottom:10px">' +
            '<button class="chip'+(reportViewMode==='invoices'?' on':'')+'" onclick="reportViewMode=\'invoices\';render()">🧾 By Invoice</button>' +
            '<button class="chip'+(reportViewMode==='lines'?' on':'')+'" onclick="reportViewMode=\'lines\';render()">≡ Line Items</button>' +
          '</div>' +
          // Invoice grouped view
          (reportViewMode === 'invoices' ? (() => {
            const imap = {};
            wd.forEach(s => {
              const key = s.invoiceId || (s.shopName+'-'+s.date);
              if(!imap[key]) imap[key]={id:key,shopName:s.shopName,area:s.area||'',date:s.date,items:[],finalTotal:0,gstTotal:0,paid:0};
              imap[key].items.push(s);
              imap[key].finalTotal += (parseFloat(s.finalTotal)||0);
              imap[key].gstTotal += (parseFloat(s.gstAmt)||0);
              if(s.paymentStatus==='Paid') imap[key].paid += (parseFloat(s.finalTotal)||0);
            });
            return Object.values(imap).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(inv => {
              const stat = inv.paid>=inv.finalTotal&&inv.finalTotal>0?'Paid':inv.paid>0?'Partial':'Pending';
              return '<div style="background:var(--s2);border-radius:var(--rm);padding:12px;margin-bottom:8px">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
                  '<div>' +
                    '<div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.06em">' + inv.id + '</div>' +
                    '<div style="font-size:14px;font-weight:700">' + inv.shopName + '</div>' +
                    '<div style="font-size:11px;color:var(--t2)">' + inv.date + ' · ' + inv.items.length + ' item' + (inv.items.length!==1?'s':'') + '</div>' +
                  '</div>' +
                  '<div style="text-align:right">' +
                    '<div style="font-size:16px;font-weight:800;color:var(--a)">' + money(inv.finalTotal) + '</div>' +
                    '<span class="badge '+(stat==='Paid'?'bpaid':stat==='Partial'?'bpart':'bpend')+'" style="font-size:9px">' + stat + '</span>' +
                  '</div>' +
                '</div>' +
                // Invoice items mini table
                '<div style="border-top:1px solid var(--b);padding-top:8px">' +
                inv.items.map(it =>
                  '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--b)">' +
                    '<div style="flex:1;min-width:0">' +
                      '<div style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + it.itemName + '</div>' +
                      '<div style="font-size:10px;color:var(--t3)">' +
                        '<span class="badge '+(it.priceType==='casePrice'||it.priceType==='case'?'bcase':it.priceType==='halfCase'?'bhalf':'bpart')+'" style="font-size:8px;padding:1px 5px">' + tierLabel(it.priceType) + '</span>' +
                        ' × ' + it.quantity +
                      '</div>' +
                    '</div>' +
                    '<div style="text-align:right;margin-left:8px">' +
                      '<div style="font-size:12px;font-weight:700">' + money(parseFloat(it.finalTotal)||0) + '</div>' +
                      '<div style="font-size:9px;color:var(--gst)">GST ' + money(parseFloat(it.gstAmt)||0) + '</div>' +
                    '</div>' +
                  '</div>'
                ).join('') +
                '<div style="display:flex;justify-content:space-between;padding:6px 0 0;font-size:11px">' +
                  '<span style="color:var(--gst)">GST: ' + money(inv.gstTotal) + '</span>' +
                  '<span style="font-weight:800;color:var(--a)">Total: ' + money(inv.finalTotal) + '</span>' +
                '</div>' +
                '</div>' +
              '</div>';
            }).join('');
          })() :
          // Line items view
          '<div class="tw"><table class="dt"><thead><tr><th>Shop</th><th>Item</th><th>Type</th><th class="nr">Total</th><th>Status</th></tr></thead><tbody>' +
          wd.map(s=>'<tr>' +
            '<td style="font-size:11px;font-weight:600">' + s.shopName + '<div style="font-size:9px;color:var(--t3)">' + s.date + '</div></td>' +
            '<td style="font-size:10px;color:var(--t2)">' + s.itemName + '</td>' +
            '<td><span class="badge '+(s.priceType==='casePrice'||s.priceType==='case'?'bcase':s.priceType==='halfCase'?'bhalf':'bpart')+'" style="font-size:9px">' + tierLabel(s.priceType) + '</span></td>' +
            '<td class="nr" style="font-weight:700;font-size:12px">' + money(s.finalTotal) + '</td>' +
            '<td><span class="badge ' + (s.paymentStatus==='Paid'?'bpaid':s.paymentStatus==='Partial'?'bpart':'bpend') + '" style="font-size:9px">' + s.paymentStatus + '</span></td></tr>'
          ).join('') + '</tbody></table></div>') +
          '<div style="display:flex;justify-content:space-between;padding:8px 0 0;font-size:12px;font-weight:700;color:var(--t2)">' +
            '<span>GST: <span style="color:var(--gst)">' + money(wGST) + '</span></span>' +
            '<span>Week Total: <span style="color:var(--a)">' + money(wTot) + '</span></span>' +
          '</div>' +
        '</div>' : '') +
      '</div>';
    }).join('') +
  '</div>';
}
function toggleWeek(w) {
  if(expandedWeeks.has(w)) expandedWeeks.delete(w);
  else { expandedWeeks.clear(); expandedWeeks.add(w); }
  render();
}