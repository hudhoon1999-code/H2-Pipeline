'use strict';
// ── DASHBOARD ─────────────────────────────────────────────────────────────
// ── DASHBOARD ────────────────────────────────────────────────────────────────
let dashShopsExpanded = false;
let dashItemsExpanded = false;

function renderDashboard() {
  // Agents see their own focused dashboard
  if (STATE.isAgent && !STATE.isAdmin) return renderAgentDashboard();
  const S = STATE.sales;
  const total = S.reduce((a,r) => a+saleFinalTotal(r), 0);
  const paid = S.filter(r => r.paymentStatus==='Paid').reduce((a,r) => a+saleFinalTotal(r), 0);
  const pend = S.filter(r => r.paymentStatus==='Pending').reduce((a,r) => a+saleFinalTotal(r), 0);
  const gstTot = S.reduce((a,r) => a + Math.max(0, saleGstTotal(r)), 0);

  const shopMap = {};
  S.forEach(r => { shopMap[r.shopName] = (shopMap[r.shopName]||0) + saleFinalTotal(r); });
  const allShops = Object.entries(shopMap).sort((a,b)=>b[1]-a[1]);
  const topShops = isDesktop() ? allShops.slice(0,8) : (dashShopsExpanded ? allShops.slice(0,10) : allShops.slice(0,5));

  const itemMap = {};
  S.forEach(r => { itemMap[r.itemName] = (itemMap[r.itemName]||0) + saleFinalTotal(r); });
  const allItems = Object.entries(itemMap).sort((a,b)=>b[1]-a[1]);
  const topItems = isDesktop() ? allItems.slice(0,8) : (dashItemsExpanded ? allItems.slice(0,10) : allItems.slice(0,5));

  const wmap = {};
  S.forEach(r => { const w=weekStart(r.date); wmap[w]=(wmap[w]||0)+saleFinalTotal(r); });
  const wks = Object.keys(wmap).sort().slice(-8);
  const wdata = wks.length>=2 ? wks.map(w=>wmap[w]) : [1200,1800,1500,2400,1900,2600,total||2000];
  const mx = Math.max(...wdata, 1);
  const recent = [...S].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0, isDesktop()?10:5);

  const imap = {};
  S.forEach(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    if(!imap[key]) imap[key]={id:key,shopName:s.shopName,area:s.area||'',date:s.date,items:[],finalTotal:0,paid:0};
    imap[key].items.push(s);
    imap[key].finalTotal += (parseFloat(s.finalTotal)||0);
    if(s.paymentStatus==='Paid') imap[key].paid += (parseFloat(s.finalTotal)||0);
  });
  const pendingInvs = Object.values(imap).filter(inv => inv.paid < inv.finalTotal && inv.finalTotal > 0).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0, isDesktop()?8:5);

  const kpis = '<div class="kgrid stag" style="margin-bottom:16px">' +
    '<div class="kcard fu"><div class="klbl">Total Sales</div><div class="kval" style="color:var(--a)">' + money(total) + '</div><div class="ksub">' + S.length + ' transactions</div></div>' +
    '<div class="kcard fu"><div class="klbl">Collected</div><div class="kval" style="color:var(--ok)">' + money(paid) + '</div><div class="ksub">' + (total>0?Math.round(paid/total*100):0) + '% of total</div></div>' +
    '<div class="kcard fu" style="cursor:pointer" onclick="goPage(\'invoices\')"><div class="klbl">Pending</div><div class="kval" style="color:var(--warn)">' + money(pend) + '</div><div class="ksub">' + S.filter(r=>r.paymentStatus==='Pending').length + ' orders</div></div>' +
    '<div class="kcard fu"><div class="klbl">GST Collected</div><div class="kval" style="color:var(--gst)">' + money(gstTot) + '</div><div class="ksub">@ 8% rate</div></div>' +
  '</div>';

  const trendCard = '<div class="card" style="margin-bottom:14px">' +
    '<div class="sh"><div class="st">Weekly Trend</div><button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'report\')">Full Report \u2192</button></div>' +
    '<div class="cbw" style="height:' + (isDesktop()?'100px':'72px') + '">' +
    wdata.map((v,i) => '<div class="cb" title="' + money(v) + '" style="height:' + Math.round(v/mx*100) + '%;background:' + (i===wdata.length-1?'var(--a)':'var(--as)') + '"></div>').join('') +
    '</div></div>';

  const topShopsCard = '<div class="card" style="margin-bottom:14px">' +
    '<div class="sh"><div class="st">Top Shops</div>' +
    (!isDesktop() && allShops.length>5 ? '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="dashShopsExpanded=!dashShopsExpanded;render()">' + (dashShopsExpanded?'Less':'More') + '</button>' : '') +
    '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'shops\')">Shops \u2192</button></div>' +
    (topShops.length ? topShops.map(([n,t],i) => {
      const pct = total > 0 ? Math.round(t/total*100) : 0;
      return '<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">' +
        '<span style="display:flex;align-items:center;gap:5px"><span style="font-size:10px;font-weight:700;color:var(--a);min-width:14px">' + (i+1) + '</span>' + n + '</span>' +
        '<span style="font-weight:700">' + money(t) + ' <span style="color:var(--t3);font-size:10px">(' + pct + '%)</span></span></div>' +
        '<div class="pb"><div class="pf" style="width:' + pct + '%;background:var(--a)"></div></div></div>';
    }).join('') : '<div style="font-size:12px;color:var(--t3)">No data yet</div>') +
  '</div>';

  const topItemsCard = '<div class="card" style="margin-bottom:14px">' +
    '<div class="sh"><div class="st">Top Items</div>' +
    (!isDesktop() && allItems.length>5 ? '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="dashItemsExpanded=!dashItemsExpanded;render()">' + (dashItemsExpanded?'Less':'More') + '</button>' : '') +
    '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'items\')">Items \u2192</button></div>' +
    (topItems.length ? topItems.map(([n,t],i) => {
      const pct = total > 0 ? Math.round(t/total*100) : 0;
      return '<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">' +
        '<span style="display:flex;align-items:center;gap:5px"><span style="font-size:10px;font-weight:700;color:var(--gst);min-width:14px">' + (i+1) + '</span>' + n + '</span>' +
        '<span style="font-weight:700">' + money(t) + ' <span style="color:var(--t3);font-size:10px">(' + pct + '%)</span></span></div>' +
        '<div class="pb"><div class="pf" style="width:' + pct + '%;background:var(--gst)"></div></div></div>';
    }).join('') : '<div style="font-size:12px;color:var(--t3)">No data yet</div>') +
  '</div>';

  const pendingCard = pendingInvs.length ? '<div class="card" style="margin-bottom:14px;border-color:rgba(245,158,11,.35)">' +
    '<div class="sh"><div style="display:flex;align-items:center;gap:7px"><div style="width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 2s infinite"></div><div class="st" style="color:var(--warn)">Pending Payments</div></div><button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'pending\')">All \u2192</button></div>' +
    pendingInvs.map(inv => {
      const due = inv.finalTotal - inv.paid;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b)">' +
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + inv.shopName + '</div>' +
        '<div style="font-size:10px;color:var(--t2)">' + inv.id + ' · ' + inv.date + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-left:10px">' +
        '<div style="font-size:13px;font-weight:700;color:var(--warn)">' + money(due) + '</div>' +
        '<button class="btn" style="background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:5px 9px;font-size:11px;font-weight:700;white-space:nowrap" onclick="markInvPaid(\'' + inv.id + '\',event)">' + IC.chk + ' Pay</button>' +
        '</div></div>';
    }).join('') +
  '</div>' : '';

  const recentCard = '<div class="card">' +
    '<div class="sh"><div class="st">Recent Activity</div><button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'sales\')">All \u2192</button></div>' +
    (recent.length ?
      (isDesktop()
        // Desktop: table format for density
        ? '<div class="tw"><table class="dt"><thead><tr><th>Date</th><th>Shop</th><th>Item</th><th>Type</th><th class="nr">Total</th><th>Status</th></tr></thead><tbody>' +
          recent.map(r => '<tr>' +
            '<td style="font-size:11px;color:var(--t2);white-space:nowrap">' + r.date + '</td>' +
            '<td style="font-weight:600;font-size:12px">' + r.shopName + '</td>' +
            '<td style="font-size:11px;color:var(--t2)">' + r.itemName + '</td>' +
            '<td><span class="badge ' + (r.priceType==='casePrice'||r.priceType==='case'?'bcase':r.priceType==='halfCase'?'bhalf':'bpart') + '" style="font-size:9px">' + tierLabel(r.priceType) + '</span></td>' +
            '<td class="nr" style="font-weight:700">' + money(r.finalTotal) + '</td>' +
            '<td><span class="badge ' + (r.paymentStatus==='Paid'?'bpaid':r.paymentStatus==='Partial'?'bpart':'bpend') + '">' + r.paymentStatus + '</span></td>' +
          '</tr>').join('') + '</tbody></table></div>'
        // Mobile: list format
        : recent.map(r =>
          '<div class="li"><div class="lav">' + IC.sales + '</div>' +
          '<div style="flex:1;min-width:0"><div class="ltit" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.itemName + '</div>' +
          '<div class="lsub">' + r.shopName + ' · ' + r.date + '</div></div>' +
          '<div class="lrt"><div style="font-size:13px;font-weight:700">' + money(r.finalTotal) + '</div>' +
          '<span class="badge ' + (r.paymentStatus==='Paid'?'bpaid':r.paymentStatus==='Partial'?'bpart':'bpend') + '">' + r.paymentStatus + '</span></div></div>'
        ).join('')
      )
    : '<div class="empty"><div class="eico">📦</div><div class="esub">No sales yet. Tap + to add!</div></div>') +
  '</div>';

  // ── Agents overview card (admin only) ──
  const agentsCard = STATE.isAdmin && STATE.agents.length > 0 ? (() => {
    const yr = currentYear(), mo = currentMonth();
    const agentRows = STATE.agents.map(agent => {
      const sales = STATE.sales.filter(s => s.agentId === agent.id);
      const monthTotal = sales.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear()===yr && (d.getMonth()+1)===mo;
      }).reduce((a,s) => a+(parseFloat(s.finalTotal)||0), 0);
      const pending = sales.filter(s=>s.paymentStatus==='Pending').reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
      const target = getAgentTarget(agent.id,'month',yr,mo);
      const progress = target ? Math.min(100,Math.round(monthTotal/target.amount*100)) : 0;
      return {agent, monthTotal, pending, target, progress};
    }).sort((a,b) => b.monthTotal - a.monthTotal);

    return '<div class="card" style="margin-bottom:14px">' +
      '<div class="sh">' +
        '<div class="st">👥 Agents This Month</div>' +
        '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'agents\')">View All →</button>' +
      '</div>' +
      agentRows.map((r, i) => {
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b)">' +
          '<div style="font-size:14px;width:20px;text-align:center">' + (medal || '<span style="font-size:11px;color:var(--t3);font-weight:700">'+(i+1)+'</span>') + '</div>' +
          '<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;flex-shrink:0">' + (r.agent.name||'?')[0].toUpperCase() + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.agent.name + '</div>' +
            (r.target ?
              '<div style="display:flex;align-items:center;gap:5px;margin-top:3px">' +
                '<div style="flex:1;height:3px;background:var(--s2);border-radius:99px;overflow:hidden">' +
                  '<div style="height:100%;width:'+r.progress+'%;background:'+(r.progress>=100?'var(--ok)':r.progress>=60?'var(--a)':'var(--warn)')+'"></div>' +
                '</div>' +
                '<span style="font-size:9px;color:var(--t2);white-space:nowrap">'+r.progress+'%</span>' +
              '</div>'
            : '<div style="font-size:10px;color:var(--t3);margin-top:2px">no target set</div>') +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<div style="font-size:13px;font-weight:700;color:var(--a)">' + money(r.monthTotal) + '</div>' +
            (r.pending > 0 ? '<div style="font-size:10px;color:var(--warn)">' + money(r.pending) + ' due</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  })() : '';

  // ── Today's check-ins card (admin only) ──────────────────────────────────
  const checkinsCard = STATE.isAdmin && STATE.checkins.length > 0 ? (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCheckins = STATE.checkins
      .filter(c => c.ts.startsWith(todayStr))
      .sort((a,b) => new Date(b.ts) - new Date(a.ts));
    const totalToday = todayCheckins.length;
    const uniqueAgents = [...new Set(todayCheckins.map(c=>c.agentId))].length;
    const uniqueShops = [...new Set(todayCheckins.map(c=>c.shopId))].length;
    // Agent visit summary
    const byAgent = {};
    todayCheckins.forEach(c => {
      if(!byAgent[c.agentId]) byAgent[c.agentId] = {name:c.agentName, count:0, shops:new Set()};
      byAgent[c.agentId].count++;
      byAgent[c.agentId].shops.add(c.shopName);
    });
    return '<div class="card" style="margin-bottom:14px">' +
      '<div class="sh">' +
        '<div class="st">📍 Today\'s Check-ins</div>' +
        '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'checkins\')">All →</button>' +
      '</div>' +
      // Summary stats
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' +
        '<div style="background:var(--as);border-radius:var(--rs);padding:10px;text-align:center">' +
          '<div style="font-size:22px;font-weight:800;color:var(--a)">' + totalToday + '</div>' +
          '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase">Visits</div>' +
        '</div>' +
        '<div style="background:var(--oks);border-radius:var(--rs);padding:10px;text-align:center">' +
          '<div style="font-size:22px;font-weight:800;color:var(--ok)">' + uniqueAgents + '</div>' +
          '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase">Agents</div>' +
        '</div>' +
        '<div style="background:var(--s2);border-radius:var(--rs);padding:10px;text-align:center">' +
          '<div style="font-size:22px;font-weight:800;color:var(--t)">' + uniqueShops + '</div>' +
          '<div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase">Shops</div>' +
        '</div>' +
      '</div>' +
      // Per-agent breakdown
      (Object.values(byAgent).length ? Object.values(byAgent).map(a =>
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b)">' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;flex-shrink:0">' + (a.name||'?')[0].toUpperCase() + '</div>' +
            '<div>' +
              '<div style="font-size:13px;font-weight:600">' + a.name + '</div>' +
              '<div style="font-size:11px;color:var(--t2)">' + [...a.shops].slice(0,2).join(', ') + (a.shops.size>2?' +' + (a.shops.size-2) + ' more':'') + '</div>' +
            '</div>' +
          '</div>' +
          '<span style="background:var(--oks);color:var(--ok);padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700">' + a.count + ' visit' + (a.count!==1?'s':'') + '</span>' +
        '</div>'
      ).join('') : '') +
      // Recent 3 check-ins
      (totalToday === 0 ? '<div style="font-size:12px;color:var(--t3);text-align:center;padding:8px 0">No check-ins today yet</div>' : '') +
    '</div>';
  })() : (STATE.isAdmin ? '<div class="card" style="margin-bottom:14px">' +
    '<div class="sh"><div class="st">📍 Today\'s Check-ins</div>' +
      '<button class="btn bg2" style="font-size:11px;padding:5px 9px" onclick="goPage(\'checkins\')">History →</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--t3);padding:8px 0">No check-ins today · Check-ins appear here once agents visit shops</div>' +
  '</div>' : '');

  // Desktop: two-column layout
  if (isDesktop()) {
    return '<div class="fu">' +
      '<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">' +
        '<div><h1 style="font-size:20px;font-weight:800">Hello, ' + (STATE.user?.name?.split(' ')[0]||'there') + ' 👋</h1>' +
        '<div style="font-size:12px;color:var(--t2)">' + new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}) + '</div></div>' +
        (STATE.isAdmin ? '<div style="display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700">⚡ Admin Access</div>' :
         '<div style="font-size:11px;color:var(--t2);background:var(--s2);padding:5px 12px;border-radius:99px">👁 Viewer</div>') +
      '</div>' +
      kpis +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
        '<div>' + trendCard + pendingCard + agentsCard + checkinsCard + '</div>' +
        '<div>' + topShopsCard + topItemsCard + recentCard + '</div>' +
      '</div>' +
    '</div>';
  }

  // Mobile: single column
  return '<div class="fu">' +
    '<div style="margin-bottom:18px">' +
      '<div style="font-size:12px;color:var(--t2)">' + new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}) + '</div>' +
      '<h1 style="font-size:24px;font-weight:800;margin-top:2px">Hello, ' + (STATE.user?.name?.split(' ')[0]||'there') + ' 👋</h1>' +
      (STATE.isAdmin ? '<div style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:2px 9px;border-radius:99px;font-size:10px;font-weight:700;margin-top:4px">⚡ Admin</div>' :
       '<div style="font-size:11px;color:var(--t2);margin-top:3px">Viewer access</div>') +
    '</div>' +
    kpis + pendingCard + trendCard + agentsCard + checkinsCard + topShopsCard + topItemsCard + recentCard +
  '</div>';
}

// Mark all items of an invoice as paid from dashboard
function markInvPaid(invId, event) {
  if (event) event.stopPropagation();
  STATE.sales = STATE.sales.map(s => {
    const key = s.invoiceId || (s.shopName+'-'+s.date);
    return key === invId ? {...s, paymentStatus:'Paid'} : s;
  });
  saveState();
  showToast('\u2713 Invoice marked as Paid');
  render();
}