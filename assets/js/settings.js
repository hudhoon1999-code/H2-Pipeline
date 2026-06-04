'use strict';
// ── SETTINGS ──────────────────────────────────────────────────────────────
// ── SETTINGS ──────────────────────────────────────────────────────────────────

function renderSettings() {
  return '<div class="fu"><div style="margin-bottom:18px"><h1 style="font-size:22px;font-weight:800">Settings</h1></div>' +
    '<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:14px">' +
    '<div style="width:52px;height:52px;border-radius:16px;background:' + (STATE.isAdmin?'linear-gradient(135deg,var(--a),var(--gst))':'var(--as)') + ';display:flex;align-items:center;justify-content:center;font-size:22px;font-family:Outfit,sans-serif;font-weight:800;color:#fff">' + (STATE.user?.name||'U')[0].toUpperCase() + '</div>' +
    '<div><div style="font-family:Outfit,sans-serif;font-weight:700;font-size:17px">' + (STATE.user?.name||'User') + '</div>' +
    '<div style="font-size:12px;color:var(--t2)">' + (STATE.user?.email||'—') + '</div>' +
    '<div style="margin-top:5px">' + (STATE.isAdmin?'<span style="background:linear-gradient(135deg,var(--a),var(--gst));color:#fff;padding:2px 9px;border-radius:99px;font-size:10px;font-weight:700">⚡ Admin</span>':'<span style="background:var(--s2);color:var(--t3);padding:2px 9px;border-radius:99px;font-size:10px;font-weight:700">Viewer</span>') + '</div>' +
    '</div></div></div>' +

    // Admin: Claim untagged sales migration tool
    (STATE.isAdmin && STATE.agents.length > 0 ? (() => {
      const untagged = STATE.sales.filter(s => !s.agentId).length;
      return '<div class="card" style="margin-bottom:12px;border-color:rgba(245,158,11,.35)">' +
        '<div class="st" style="margin-bottom:8px">🔁 Claim Untagged Sales</div>' +
        '<div style="font-size:12px;color:var(--t2);margin-bottom:12px;line-height:1.6">' +
          '<strong style="color:var(--warn)">' + untagged + ' sales</strong> have no agent assigned. ' +
          'Select an agent to claim them — useful for migrating existing data to your own agent profile.' +
        '</div>' +
        (untagged > 0 ?
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<select id="claim-agent-select" class="inp" style="flex:1;height:40px;font-size:13px">' +
              '<option value="">— Select agent —</option>' +
              STATE.agents.map(a => '<option value="' + a.id + '">' + a.name + '</option>').join('') +
            '</select>' +
            '<button class="btn bp" style="height:40px;padding:0 16px;font-size:13px;white-space:nowrap" onclick="claimUntaggedSales()">Claim ' + untagged + ' Sales</button>' +
          '</div>' :
          '<div style="font-size:12px;color:var(--ok);font-weight:600">✓ All sales are tagged to agents</div>'
        ) +
      '</div>';
    })() : '') +
    '<div class="card" style="margin-bottom:12px"><div class="st" style="margin-bottom:14px">Appearance</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500">Theme</div><div style="font-size:11px;color:var(--t2)">' + (STATE.dark?'Dark':'Light') + ' mode</div></div>' +
    '<div style="display:flex;gap:6px"><button class="chip' + (!STATE.dark?' on':'') + '" onclick="setTheme(false)">' + IC.sun + ' Light</button><button class="chip' + (STATE.dark?' on':'') + '" onclick="setTheme(true)">' + IC.moon + ' Dark</button></div></div></div>' +
    '<div class="card" style="margin-bottom:12px"><div class="st" style="margin-bottom:12px">Business Profile <span style="font-size:10px;color:var(--t3);font-weight:400">— appears on PDF invoices</span></div>' +
    (() => {
      const biz = db.get('bizProfile',{name:'Lotus Fihaara',address:'Male\', Maldives',tel:'',tin:'',bank:''});
      return '<div class="fg">' +
        '<div class="iw"><label class="il">Company Name</label><input id="biz-name" class="inp" value="' + (biz.name||'').replace(/"/g,'&quot;') + '" placeholder="Your company name"></div>' +
        '<div class="iw"><label class="il">Address</label><input id="biz-addr" class="inp" value="' + (biz.address||'').replace(/"/g,'&quot;') + '" placeholder="Male\', Maldives"></div>' +
        '<div class="fr"><div class="iw"><label class="il">Tel / Viber</label><input id="biz-tel" class="inp" value="' + (biz.tel||'') + '" placeholder="+960..."></div>' +
        '<div class="iw"><label class="il">TIN</label><input id="biz-tin" class="inp" value="' + (biz.tin||'') + '" placeholder="GST registration"></div></div>' +
        '<div class="iw"><label class="il">Bank / Payment Info</label><input id="biz-bank" class="inp" value="' + (biz.bank||'').replace(/"/g,'&quot;') + '" placeholder="BML Account No..."></div>' +
        '<button class="btn bp" style="height:44px" onclick="saveBizProfile()">Save Profile</button></div>';
    })() +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b)"><div style="font-size:13px;font-weight:500">GST Rate</div><div style="font-size:12px;color:var(--t2)">8% (fixed)</div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b)"><div style="font-size:13px;font-weight:500">Business Week</div><div style="font-size:12px;color:var(--t2)">Saturday – Thursday</div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b)"><div style="font-size:13px;font-weight:500">Price Tiers</div><div style="font-size:12px;color:var(--t2)">Unit / Half Case / Case</div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--b)"><div style="font-size:13px;font-weight:500">GST Mode</div><div style="font-size:12px;color:var(--t2)">Inclusive or Exclusive per entry</div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0"><div style="font-size:13px;font-weight:500">Currency</div>' +
      '<div style="display:flex;gap:8px;align-items:center"><input id="currency-code" class="inp" style="width:110px;height:34px;font-size:12px;padding:0 10px" value="' + (STATE.currency||'MVR') + '" placeholder="MVR" maxlength="8" oninput="this.value=this.value.toUpperCase()"><button class="btn bs" style="padding:7px 10px;font-size:12px" onclick="setCurrency((document.getElementById(\'currency-code\')||{}).value||\'MVR\')">Save</button></div></div>' +
    '<div style="font-size:11px;color:var(--t3);margin-top:8px">Use any ISO currency code. MVR is supported by default.</div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:12px"><div class="st" style="margin-bottom:10px">iPhone / PWA Install</div>' +
    '<div style="background:var(--as);border-radius:var(--rs);padding:12px 13px;font-size:13px;color:var(--t2);line-height:1.6">' +
    '<div style="font-weight:700;color:var(--a);margin-bottom:6px">📱 Add to Home Screen</div>' +
    '<div>In Safari: tap the <strong>Share button</strong> (□↑) then <strong>"Add to Home Screen"</strong>. Opens fullscreen like a native app.</div></div></div>' +
    '<div class="card" style="margin-bottom:16px"><div class="st" style="margin-bottom:10px">About</div>' +
    '<div style="font-size:12px;color:var(--t2);line-height:1.7">' +
    '<div><strong style="color:var(--t)">H2 Line</strong> · v3.0</div>' +
    '<div>Built for distribution businesses. GST @ 8%, price tiers, weekly reports, invoice tracking, sharing.</div>' +
    '<div style="margin-top:6px;font-size:11px;color:var(--t3)">© 2024 H2 Line · Data stored locally on your device.</div></div></div>' +
    '<button class="btn bd bw" style="height:48px;margin-top:8px" onclick="logout()">Sign Out</button>' +
    '<button class="btn bs bw" style="height:44px;margin-top:8px" onclick="goPage(\'importexport\')">📁 Import / Export Data</button></div>';
}
function saveBizProfile() {
  const v = id => (document.getElementById(id)||{}).value||'';
  db.set('bizProfile',{name:v('biz-name'),address:v('biz-addr'),tel:v('biz-tel'),tin:v('biz-tin'),bank:v('biz-bank')});
  showToast('✓ Business profile saved');
}
function setTheme(dark) { STATE.dark=dark; saveState(); render(); }
function logout() { if(confirm('Sign out?')){db.set('user',null);STATE.user=null;render();} }