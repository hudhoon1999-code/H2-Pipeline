'use strict';
// ── PENDING PAYMENTS ──────────────────────────────────────────────────────
// ── PENDING PAYMENTS PAGE ─────────────────────────────────────────────────────
function renderPendingPage() {
  const S = STATE.isAdmin ? STATE.sales : getVisibleSalesForUser();
  const imap = {};
  S.forEach(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    if(!imap[key]) imap[key]={id:key,shopName:s.shopName,area:s.area||'',date:s.date,items:[],finalTotal:0,paid:0};
    imap[key].items.push(s);
    imap[key].finalTotal += (parseFloat(s.finalTotal)||0);
    if(s.paymentStatus==='Paid') imap[key].paid += (parseFloat(s.finalTotal)||0);
  });
  const pendingInvs = Object.values(imap).filter(inv => inv.paid < inv.finalTotal && inv.finalTotal > 0).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const totalDue = pendingInvs.reduce((a,inv)=>a+(inv.finalTotal-inv.paid),0);

  return '<div class="fu">' +
    '<div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">Pending Payments</h1><div style="font-size:12px;color:var(--t2)">' + pendingInvs.length + ' invoices due</div></div>' +
    '<div style="background:var(--warns);border:1.5px solid var(--warn);border-radius:var(--rm);padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">' +
      '<div><div style="font-size:11px;color:var(--warn);font-weight:700;text-transform:uppercase;letter-spacing:.06em">Total Outstanding</div><div style="font-family:Outfit,sans-serif;font-size:26px;font-weight:800;color:var(--warn)">' + money(totalDue) + '</div></div>' +
      '<div style="font-size:28px">\u23F0</div>' +
    '</div>' +
    (pendingInvs.length ? pendingInvs.map(inv => {
      const due = inv.finalTotal - inv.paid;
      const isPartial = inv.paid > 0;
      const pct = inv.finalTotal > 0 ? Math.round(inv.paid/inv.finalTotal*100) : 0;
      return '<div class="card csm" style="margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.06em">' + inv.id + '</div>' +
            '<div style="font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + inv.shopName + '</div>' +
            '<div style="font-size:11px;color:var(--t2)">' + inv.area + ' \u00b7 ' + inv.date + ' \u00b7 ' + inv.items.length + ' item' + (inv.items.length!==1?'s':'') + '</div>' +
          '</div>' +
          '<div style="text-align:right;margin-left:10px">' +
            '<div style="font-size:16px;font-weight:800;color:var(--a)">' + money(inv.finalTotal) + '</div>' +
            (isPartial ? '<div style="font-size:11px;color:var(--ok)">Paid: ' + money(inv.paid) + '</div>' : '') +
            '<div style="font-size:14px;font-weight:700;color:var(--warn)">Due: ' + money(due) + '</div>' +
          '</div>' +
        '</div>' +
        (isPartial ? '<div class="pb" style="margin-bottom:8px"><div class="pf" style="width:' + pct + '%;background:var(--ok)"></div></div>' : '') +
        '<div style="font-size:11px;color:var(--t2);margin-bottom:8px">' +
          inv.items.map(it => '<span style="margin-right:8px">\u00b7 ' + it.itemName + (it.quantity>1?' \u00d7'+it.quantity:'') + '</span>').join('') +
        '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn" style="flex:1;background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:9px;font-size:13px;font-weight:700" onclick="markInvPaid(\'' + inv.id + '\',event)">' + IC.chk + ' Mark All Paid</button>' +
          '<button class="btn bg2" style="padding:9px 12px;font-size:12px" onclick="invDetail=\'' + inv.id + '\';goPage(\'invoices\')">' + IC.inv + ' View Invoice</button>' +
        '</div>' +
      '</div>';
    }).join('') : '<div class="empty"><div class="eico">\uD83C\uDF89</div><div class="etit">All Paid!</div><div class="esub">No outstanding invoices. Great work!</div></div>') +
  '</div>';
}