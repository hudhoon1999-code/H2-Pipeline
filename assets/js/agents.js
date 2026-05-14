'use strict';
// ── AGENTS PAGE ───────────────────────────────────────────────────────────────
let agentDetail = null;

function renderAgentsPage() {
  if(agentDetail) return renderAgentDetail(agentDetail);
  const yr=currentYear(),mo=currentMonth();
  const stats=STATE.agents.map(agent=>{
    const sales=STATE.sales.filter(s=>s.agentId===agent.id);
    const total=sales.reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
    const paid=sales.filter(s=>s.paymentStatus==='Paid').reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
    const thisMonth=sales.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&(d.getMonth()+1)===mo;}).reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
    const target=getAgentTarget(agent.id,'month',yr,mo);
    const progress=target?Math.min(100,Math.round(thisMonth/target.amount*100)):0;
    return {agent,total,paid,pending:total-paid,thisMonth,targetAmt:target?target.amount:0,progress,shops:[...new Set(sales.map(s=>s.shopName))].length,salesCount:sales.length};
  }).sort((a,b)=>b.thisMonth-a.thisMonth);

  return '<div class="fu">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">'+
    '<div><h1 style="font-size:22px;font-weight:800">Sales Agents</h1><div style="font-size:12px;color:var(--t2)">'+STATE.agents.length+' agents</div></div>'+
    '<button class="btn bp" style="padding:10px 14px;font-size:13px" onclick="STATE.modal={type:\'addagent\',data:{}};render()">'+IC.plus+' Add Agent</button></div>'+
    (stats.length?'<div class="card" style="margin-bottom:14px"><div class="sh"><div class="st">🏆 This Month</div><div style="font-size:11px;color:var(--t2)">'+new Date().toLocaleDateString('en',{month:'long',year:'numeric'})+'</div></div>'+
    stats.map((s,i)=>'<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--b)">'+
      '<div style="width:22px;text-align:center">'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':'<span style="font-size:10px;color:var(--t3);font-weight:700">'+(i+1)+'</span>')+'</div>'+
      '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:13px;flex-shrink:0">'+(s.agent.name||'?')[0].toUpperCase()+'</div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">'+s.agent.name+'</div>'+
      (s.targetAmt>0?'<div style="display:flex;align-items:center;gap:5px;margin-top:3px"><div style="flex:1;height:3px;background:var(--s2);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+s.progress+'%;background:'+(s.progress>=100?'var(--ok)':s.progress>=60?'var(--a)':'var(--warn)')+'"></div></div><span style="font-size:9px;color:var(--t2)">'+s.progress+'%</span></div>':'')+'</div>'+
      '<div style="text-align:right"><div style="font-size:14px;font-weight:800;color:var(--a)">'+money(s.thisMonth)+'</div>'+(s.targetAmt>0?'<div style="font-size:9px;color:var(--t2)">of '+money(s.targetAmt)+'</div>':'<div style="font-size:9px;color:var(--t3)">no target</div>')+'</div></div>'
    ).join('')+'</div>':'<div class="empty"><div class="eico">👤</div><div class="etit">No agents yet</div></div>')+
    stats.map(s=>'<div class="card chov" style="margin-bottom:10px;cursor:pointer" onclick="agentDetail=\''+s.agent.id+'\';render()">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
      '<div style="display:flex;align-items:center;gap:10px"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:18px;flex-shrink:0">'+(s.agent.name||'?')[0].toUpperCase()+'</div>'+
      '<div><div style="font-size:16px;font-weight:700">'+s.agent.name+'</div><div style="font-size:11px;color:var(--t2)">'+(s.agent.phone||s.agent.email||'—')+'</div>'+
      '<div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap">'+
        '<span style="font-size:9px;background:var(--as);color:var(--a);padding:2px 7px;border-radius:99px;font-weight:700">'+s.salesCount+' sales</span>'+
        '<span style="font-size:9px;background:var(--s2);color:var(--t2);padding:2px 7px;border-radius:99px;font-weight:700">'+s.shops+' shops</span>'+
        (s.pending>0?'<span style="font-size:9px;background:var(--warns);color:var(--warn);padding:2px 7px;border-radius:99px;font-weight:700">'+money(s.pending)+' due</span>':'')+
      '</div></div></div>'+
      '<div style="text-align:right"><div style="font-size:18px;font-weight:800;color:var(--a)">'+money(s.total)+'</div><div style="font-size:10px;color:var(--t2)">all time</div></div></div>'+
      (s.targetAmt>0?'<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--t2);margin-bottom:4px"><span>Monthly target</span><span style="font-weight:700;color:'+(s.progress>=100?'var(--ok)':s.progress>=60?'var(--a)':'var(--warn)')+'">'+money(s.thisMonth)+' / '+money(s.targetAmt)+'</span></div><div class="pb"><div class="pf" style="width:'+s.progress+'%;background:'+(s.progress>=100?'var(--ok)':s.progress>=60?'var(--a)':'var(--warn)')+'"></div></div></div>':'')
    +'</div>').join('')+'</div>';
}

function renderAgentDetail(agentId) {
  const agent=getAgent(agentId); if(!agent){agentDetail=null;return renderAgentsPage();}
  const sales=STATE.sales.filter(s=>s.agentId===agentId);
  const total=sales.reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const paid=sales.filter(s=>s.paymentStatus==='Paid').reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const gst=sales.reduce((a,s)=>a+(parseFloat(s.gstAmt)||0),0);
  const yr=currentYear(),mo=currentMonth(),wk=currentWeek();
  const monthTotal=sales.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&(d.getMonth()+1)===mo;}).reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const weekTotal=sales.filter(s=>{const d=new Date(s.date);const sw=Math.ceil(((d-new Date(yr,0,1))/86400000+new Date(yr,0,1).getDay()+1)/7);return d.getFullYear()===yr&&sw===wk;}).reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const mt=getAgentTarget(agentId,'month',yr,mo),wt=getAgentTarget(agentId,'week',yr,wk);
  const mp=mt?Math.min(100,Math.round(monthTotal/mt.amount*100)):0,wp=wt?Math.min(100,Math.round(weekTotal/wt.amount*100)):0;
  const assignedShops=(agent.assignedShops||[]).map(n=>STATE.shops.find(s=>s.name===n)).filter(Boolean);
  const recent=[...sales].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);
  return '<div class="fu"><button class="btn bg2" style="margin-bottom:14px;display:flex;align-items:center;gap:4px" onclick="agentDetail=null;render()">'+IC.back+' All Agents</button>'+
    '<div class="card" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">'+
      '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--gst));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:20px">'+(agent.name||'?')[0].toUpperCase()+'</div>'+
      '<div style="flex:1"><div style="font-family:Outfit,sans-serif;font-size:19px;font-weight:800">'+agent.name+'</div>'+
      '<div style="font-size:12px;color:var(--t2)">'+(agent.email||'')+(agent.phone?' · 📞 '+agent.phone:'')+'</div></div>'+
      '<div style="display:flex;gap:6px"><button class="btn bic" onclick="openEditAgent(\''+agentId+'\')">'+IC.edit+'</button>'+
      '<button class="btn bic" style="background:var(--errs);color:var(--err)" onclick="deleteAgent(\''+agentId+'\')">'+IC.trash+'</button></div></div>'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">'+
        [['Total',total,'var(--a)'],['Paid',paid,'var(--ok)'],['Due',total-paid,'var(--warn)'],['GST',gst,'var(--gst)']].map(([l,v,c])=>
          '<div style="background:var(--s2);border-radius:var(--rs);padding:10px;text-align:center"><div style="font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase">'+l+'</div><div style="font-size:12px;font-weight:800;color:'+c+';margin-top:2px">'+money(v)+'</div></div>'
        ).join('')+'</div></div>'+
    '<div class="card" style="margin-bottom:14px"><div class="sh"><div class="st">🎯 Targets</div>'+
      '<button class="btn bs" style="font-size:12px;padding:7px 12px" onclick="openSetTarget(\''+agentId+'\')">Set Target</button></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
        ['week','month'].map((p,i)=>{const t=i?mt:wt,val=i?monthTotal:weekTotal,prog=i?mp:wp;return '<div style="background:var(--s2);border-radius:var(--rs);padding:12px"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:6px">This '+(i?'Month':'Week')+'</div><div style="font-size:16px;font-weight:800;color:var(--a)">'+money(val)+'</div>'+(t?'<div style="font-size:10px;color:var(--t2)">of '+money(t.amount)+'</div><div class="pb" style="margin-top:6px"><div class="pf" style="width:'+prog+'%;background:'+(prog>=100?'var(--ok)':'var(--a)')+'"></div></div><div style="font-size:10px;font-weight:700;color:'+(prog>=100?'var(--ok)':'var(--warn)')+';margin-top:4px">'+prog+'%</div>':'<div style="font-size:10px;color:var(--t3)">No target</div>')+'</div>';}).join('')+
      '</div></div>'+
    '<div class="card" style="margin-bottom:14px"><div class="sh"><div class="st">🏪 Assigned Shops</div><button class="btn bs" style="font-size:12px;padding:7px 12px" onclick="openAssignShops(\''+agentId+'\')">Assign</button></div>'+
      (assignedShops.length?assignedShops.map(s=>'<div class="li"><div class="lav">🏪</div><div><div class="ltit">'+s.name+'</div><div class="lsub">'+(s.area||'')+'</div></div></div>').join(''):'<div style="font-size:12px;color:var(--t3)">No shops assigned — can sell to all shops</div>')+
    '</div>'+
    '<div class="card"><div class="sh"><div class="st">Recent Sales</div><div style="font-size:11px;color:var(--t2)">'+sales.length+' total</div></div>'+
      (recent.length?recent.map(s=>'<div class="li"><div class="lav" style="background:var(--as);color:var(--a)">'+IC.sales+'</div><div style="flex:1;min-width:0"><div class="ltit" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+s.itemName+'</div><div class="lsub">'+s.shopName+' · '+s.date+'</div></div><div class="lrt"><div style="font-size:13px;font-weight:700">'+money(parseFloat(s.finalTotal)||0)+'</div><span class="badge '+(s.paymentStatus==='Paid'?'bpaid':s.paymentStatus==='Partial'?'bpart':'bpend')+'">'+s.paymentStatus+'</span></div></div>').join(''):'<div class="empty"><div class="eico">📊</div><div class="esub">No sales yet</div></div>')+
    '</div></div>';
}

function renderAgentDashboard() {
  const mySales=getVisibleSalesForUser();
  const total=mySales.reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const paid=mySales.filter(s=>s.paymentStatus==='Paid').reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const yr=currentYear(),mo=currentMonth(),wk=currentWeek();
  const monthTotal=mySales.filter(s=>{const d=new Date(s.date);return d.getFullYear()===yr&&(d.getMonth()+1)===mo;}).reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const weekTotal=mySales.filter(s=>{const d=new Date(s.date);const sw=Math.ceil(((d-new Date(yr,0,1))/86400000+new Date(yr,0,1).getDay()+1)/7);return d.getFullYear()===yr&&sw===wk;}).reduce((a,s)=>a+(parseFloat(s.finalTotal)||0),0);
  const myId=STATE.agentId,mt=myId?getAgentTarget(myId,'month',yr,mo):null,wt=myId?getAgentTarget(myId,'week',yr,wk):null;
  const mp=mt?Math.min(100,Math.round(monthTotal/mt.amount*100)):0,wp=wt?Math.min(100,Math.round(weekTotal/wt.amount*100)):0;
  const pendingInvs=(()=>{const imap={};mySales.forEach(s=>{const k=s.invoiceId||(s.shopName+'-'+s.date);if(!imap[k])imap[k]={id:k,shopName:s.shopName,date:s.date,f:0,p:0};imap[k].f+=(parseFloat(s.finalTotal)||0);if(s.paymentStatus==='Paid')imap[k].p+=(parseFloat(s.finalTotal)||0);});return Object.values(imap).filter(i=>i.p<i.f&&i.f>0).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);})();
  return '<div class="fu">'+
    '<div style="margin-bottom:18px"><div style="font-size:12px;color:var(--t2)">'+new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})+'</div>'+
    '<h1 style="font-size:24px;font-weight:800;margin-top:2px">Hello, '+(STATE.user?.name?.split(' ')[0]||'there')+' 👋</h1>'+
    '<div style="font-size:11px;color:var(--t2);margin-top:2px">Sales Agent</div></div>'+
    '<div class="kgrid stag" style="margin-bottom:16px">'+
      '<div class="kcard"><div class="klbl">Total Sales</div><div class="kval" style="color:var(--a)">'+money(total)+'</div><div class="ksub">'+mySales.length+' orders</div></div>'+
      '<div class="kcard"><div class="klbl">Collected</div><div class="kval" style="color:var(--ok)">'+money(paid)+'</div></div>'+
      '<div class="kcard"><div class="klbl">Pending</div><div class="kval" style="color:var(--warn)">'+money(total-paid)+'</div></div>'+
      '<div class="kcard"><div class="klbl">This Month</div><div class="kval" style="color:var(--a)">'+money(monthTotal)+'</div></div>'+
    '</div>'+
    ((mt||wt)?'<div class="card" style="margin-bottom:14px"><div class="st" style="margin-bottom:12px">🎯 My Targets</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
        (wt?'<div style="background:var(--s2);border-radius:var(--rs);padding:12px"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:6px">This Week</div><div style="font-size:18px;font-weight:800;color:var(--a)">'+money(weekTotal)+'</div><div style="font-size:10px;color:var(--t2)">of '+money(wt.amount)+'</div><div class="pb" style="margin-top:6px"><div class="pf" style="width:'+wp+'%;background:'+(wp>=100?'var(--ok)':'var(--a)')+'"></div></div><div style="font-size:11px;font-weight:700;color:'+(wp>=100?'var(--ok)':'var(--warn)')+';margin-top:4px">'+wp+'%'+(wp>=100?' 🎉':'')+'</div></div>':'')+
        (mt?'<div style="background:var(--s2);border-radius:var(--rs);padding:12px"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:6px">This Month</div><div style="font-size:18px;font-weight:800;color:var(--a)">'+money(monthTotal)+'</div><div style="font-size:10px;color:var(--t2)">of '+money(mt.amount)+'</div><div class="pb" style="margin-top:6px"><div class="pf" style="width:'+mp+'%;background:'+(mp>=100?'var(--ok)':'var(--a)')+'"></div></div><div style="font-size:11px;font-weight:700;color:'+(mp>=100?'var(--ok)':'var(--warn)')+';margin-top:4px">'+mp+'%'+(mp>=100?' 🎉':'')+'</div></div>':'')+
      '</div></div>':'')+
    (pendingInvs.length?'<div class="card" style="margin-bottom:14px"><div class="sh"><div class="st" style="color:var(--warn)">⏳ Collect Payments</div><div style="font-size:11px;color:var(--warn);font-weight:700">'+money(total-paid)+' due</div></div>'+
      pendingInvs.map(inv=>'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--b)"><div><div style="font-size:13px;font-weight:700">'+inv.shopName+'</div><div style="font-size:11px;color:var(--t2)">'+inv.id+' · '+inv.date+'</div></div><div style="display:flex;align-items:center;gap:8px"><div style="font-size:14px;font-weight:800;color:var(--warn)">'+money(inv.f-inv.p)+'</div><button class="btn" style="background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:7px 10px;font-size:11px;font-weight:700" onclick="markInvoicePaid(\''+inv.id+'\')">✓ Paid</button></div></div>').join('')+
    '</div>':'')+
    '<button class="btn bp bw" style="height:52px;font-size:15px;font-weight:700;margin-top:4px" onclick="openAddSale()">'+IC.plus+' Record New Sale</button>'+
  '</div>';
}

// Agent modal renders
function renderAddAgentModal(id) {
  const agent=id?getAgent(id):null,v=k=>agent?(agent[k]||''):'';
  return '<div class="mhan"></div><div style="font-family:Outfit,sans-serif;font-size:20px;font-weight:800;margin-bottom:18px">'+(agent?'Edit Agent':'Add Agent')+'</div>'+
    '<div class="fg">'+
    '<div class="iw"><label class="il">Full Name *</label><input id="ag-name" class="inp" value="'+v('name')+'" placeholder="Agent name"></div>'+
    '<div class="iw"><label class="il">Email</label><input id="ag-email" class="inp" type="email" value="'+v('email')+'" placeholder="agent@email.com"></div>'+
    '<div class="iw"><label class="il">Phone</label><input id="ag-phone" class="inp" value="'+v('phone')+'" placeholder="7xxxxxxx"></div>'+
    '<div class="iw"><label class="il">Firebase UID <span style="color:var(--t3);font-size:10px">(links their login to their agent profile)</span></label><input id="ag-uid" class="inp" value="'+v('uid')+'" placeholder="From Firebase Console → Auth → Users"></div>'+
    '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;font-weight:600"><input type="checkbox" id="ag-active" '+(v('active')!=='false'?'checked':'')+' style="width:18px;height:18px;accent-color:var(--a)"> Active</label>'+
    '<div style="display:flex;gap:10px"><button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>'+
    '<button class="btn bp" style="flex:2;height:46px" onclick="saveAgent(\''+(id||'')+'\')">'+( agent?'Save Changes':'Add Agent')+'</button></div></div>';
}
function renderSetTargetModal(agentId) {
  const agent=getAgent(agentId),yr=currentYear(),mo=currentMonth(),wk=currentWeek();
  const mt=getAgentTarget(agentId,'month',yr,mo),wt=getAgentTarget(agentId,'week',yr,wk);
  return '<div class="mhan"></div><div style="font-family:Outfit,sans-serif;font-size:20px;font-weight:800;margin-bottom:6px">Set Targets</div>'+
    '<div style="font-size:13px;color:var(--t2);margin-bottom:18px">'+(agent?.name||'Agent')+'</div>'+
    '<div class="fg">'+
    '<div style="background:var(--s2);border-radius:var(--rm);padding:14px"><div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px">Monthly Target</div>'+
    '<div class="iw"><label class="il">Amount ('+( STATE.currency||'MVR')+')</label><input id="tg-month" class="inp" type="number" step="1000" value="'+(mt?mt.amount:'')+'" placeholder="e.g. 50000"></div></div>'+
    '<div style="background:var(--s2);border-radius:var(--rm);padding:14px"><div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px">Weekly Target</div>'+
    '<div class="iw"><label class="il">Amount ('+( STATE.currency||'MVR')+')</label><input id="tg-week" class="inp" type="number" step="1000" value="'+(wt?wt.amount:'')+'" placeholder="e.g. 15000"></div></div>'+
    '<div style="display:flex;gap:10px"><button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>'+
    '<button class="btn bp" style="flex:2;height:46px" onclick="saveTarget(\''+agentId+'\')">Save Targets</button></div></div>';
}
function renderAssignShopsModal(agentId) {
  const agent=getAgent(agentId),assigned=new Set(agent?.assignedShops||[]);
  return '<div class="mhan"></div><div style="font-family:Outfit,sans-serif;font-size:20px;font-weight:800;margin-bottom:6px">Assign Shops</div>'+
    '<div style="font-size:13px;color:var(--t2);margin-bottom:16px">'+(agent?.name||'Agent')+' · leave all unchecked = can sell to all shops</div>'+
    '<div style="max-height:52vh;overflow-y:auto">'+STATE.shops.map(s=>'<label style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--b);cursor:pointer"><input type="checkbox" '+(assigned.has(s.name)?'checked':'')+' onchange="toggleAssignShop(\''+agentId+'\',\''+encodeURIComponent(s.name)+'\',this.checked)" style="width:18px;height:18px;accent-color:var(--a)"><div><div style="font-size:13px;font-weight:600">'+s.name+'</div><div style="font-size:11px;color:var(--t2)">'+(s.area||'')+'</div></div></label>').join('')+'</div>'+
    '<button class="btn bp bw" style="height:46px;margin-top:14px" onclick="closeModal()">Done</button>';
}

// Agent actions
function uid_gen(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
function openEditAgent(id){STATE.modal={type:'addagent',data:{id}};render();}
function openSetTarget(agentId){STATE.modal={type:'settarget',data:{agentId}};render();}
function openAssignShops(agentId){STATE.modal={type:'assignshops',data:{agentId}};render();}
function saveAgent(id) {
  const name=((document.getElementById('ag-name')||{}).value||'').trim();
  if(!name){showToast('⚠️ Name required');return;}
  const email=((document.getElementById('ag-email')||{}).value||'').trim();
  const phone=((document.getElementById('ag-phone')||{}).value||'').trim();
  const agentUid=((document.getElementById('ag-uid')||{}).value||'').trim();
  const active=(document.getElementById('ag-active')||{}).checked!==false;
  if(id) STATE.agents=STATE.agents.map(a=>a.id===id?{...a,name,email,phone,uid:agentUid,active}:a);
  else STATE.agents.push({id:uid_gen(),name,email,phone,uid:agentUid,active:true,assignedShops:[]});
  saveState();showToast('✓ Agent saved');closeModal();
}
function deleteAgent(id) {
  if(!confirm('Remove agent? Their sales history is kept.')) return;
  STATE.agents=STATE.agents.filter(a=>a.id!==id); agentDetail=null; saveState();showToast('Agent removed');render();
}
function saveTarget(agentId) {
  const yr=currentYear(),mo=currentMonth(),wk=currentWeek();
  const ma=parseFloat((document.getElementById('tg-month')||{}).value)||0;
  const wa=parseFloat((document.getElementById('tg-week')||{}).value)||0;
  STATE.targets=STATE.targets.filter(t=>!(t.agentId===agentId&&t.year===yr&&((t.period==='month'&&t.month===mo)||(t.period==='week'&&t.week===wk))));
  if(ma>0) STATE.targets.push({id:uid_gen(),agentId,period:'month',year:yr,month:mo,amount:ma});
  if(wa>0) STATE.targets.push({id:uid_gen(),agentId,period:'week',year:yr,week:wk,amount:wa});
  saveState();showToast('✓ Targets saved');closeModal();
}
function toggleAssignShop(agentId,encodedName,checked) {
  const shopName=decodeURIComponent(encodedName);
  STATE.agents=STATE.agents.map(a=>{if(a.id!==agentId)return a;const s=new Set(a.assignedShops||[]);if(checked)s.add(shopName);else s.delete(shopName);return {...a,assignedShops:[...s]};});
  saveState();
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────
async function loadUsers() {
  if (!STATE.isAdmin || !window._fbDb) return;
  const el = document.getElementById('users-list'); if(!el) return;
  el.innerHTML = '<div style="font-size:12px;color:var(--t2);padding:8px 0">Loading...</div>';
  try {
    const snap = await window._fbDb.collection('users').get();
    const users = [];
    snap.forEach(d => users.push({id:d.id,...d.data()}));
    if(!users.length){el.innerHTML='<div style="font-size:12px;color:var(--t3)">No users yet.</div>';return;}
    el.innerHTML = users.map(u => {
      const isMe = u.email === STATE.user?.email;
      const isSuperAdm = u.email === (window.ADMIN_EMAIL||'hudhoon1999@gmail.com');
      const isAdm = isSuperAdm || u.role === 'admin';
      const badge = isSuperAdm
        ? '<span style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700">⚡ Super Admin</span>'
        : isAdm ? '<span style="background:var(--as);color:var(--a);padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700">⚡ Admin</span>'
        : u.approved ? '<span style="background:var(--oks);color:var(--ok);padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700">✓ Agent</span>'
        : '<span style="background:var(--warns);color:var(--warn);padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700">⏳ Pending</span>';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--b);gap:8px">' +
        '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">' + (u.name||'Unknown') + (isMe?' <span style="color:var(--t3);font-size:10px">(you)</span>':'') + '</div>' +
        '<div style="font-size:11px;color:var(--t2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (u.email||'') + '</div>' +
        '<div style="margin-top:3px">' + badge + '</div></div>' +
        (!isSuperAdm && !isMe ? '<div style="display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">' +
          (!u.approved ? '<button class="btn" style="background:var(--oks);color:var(--ok);border-radius:var(--rs);padding:5px 9px;font-size:11px;font-weight:700" onclick="approveUser(\'' + u.id + '\',true)">✓ Approve</button>' : '') +
          (u.approved && !isAdm ? '<button class="btn bs" style="padding:5px 9px;font-size:11px" onclick="approveUser(\'' + u.id + '\',false)">Revoke</button>' : '') +
          (!isAdm && u.approved ? '<button class="btn" style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;border-radius:var(--rs);padding:5px 9px;font-size:11px;font-weight:700" onclick="setUserRole(\'' + u.id + '\',\'admin\')">⚡ Make Admin</button>' : '') +
          (isAdm && !isSuperAdm ? '<button class="btn bs" style="padding:5px 9px;font-size:11px;color:var(--warn)" onclick="setUserRole(\'' + u.id + '\',\'agent\')">Demote</button>' : '') +
        '</div>' : '') +
      '</div>';
    }).join('') + '<div style="font-size:10px;color:var(--t3);margin-top:10px">⚡ Admins have full access. Agents can only add sales and mark payments.</div>';
  } catch(e) { el.innerHTML='<div style="font-size:12px;color:var(--err)">Failed: '+e.message+'</div>'; }
}
async function approveUser(uid, approved) {
  if(!window._fbDb) return;
  try { await window._fbDb.collection('users').doc(uid).set({approved},{merge:true}); showToast(approved?'✓ Approved':'Revoked'); loadUsers(); }
  catch(e) { showToast('⚠️ '+e.message); }
}
async function setUserRole(uid, role) {
  if(!window._fbDb) return;
  if(!confirm(role==='admin'?'Make this user an Admin? They will have full access.':'Remove admin access?')) return;
  try { await window._fbDb.collection('users').doc(uid).set({role,approved:true},{merge:true}); showToast(role==='admin'?'✓ Made Admin':'Admin removed'); loadUsers(); }
  catch(e) { showToast('⚠️ '+e.message); }
}
function claimUntaggedSales() {
  const agentId = (document.getElementById('claim-agent-select')||{}).value||'';
  if(!agentId){showToast('⚠️ Select an agent first');return;}
  const agent = getAgent(agentId); if(!agent) return;
  const untagged = STATE.sales.filter(s=>!s.agentId);
  if(!untagged.length){showToast('No untagged sales');return;}
  if(!confirm('Assign '+untagged.length+' untagged sales to '+agent.name+'?')) return;
  STATE.sales = STATE.sales.map(s=>s.agentId?s:{...s,agentId:agent.id,agentName:agent.name});
  saveState(); showToast('✓ '+untagged.length+' sales assigned to '+agent.name); render();
}