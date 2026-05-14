'use strict';
// ── GEOLOCATION + MAP + CHECK-IN ─────────────────────────────────────────

const CHECKIN_RADIUS = 100; // metres — configurable

function renderShopLocationPreview(lat, lng) {
  const preview=document.getElementById('shop-loc-preview');
  if(!preview||!window.L) return;
  preview.style.display='block';
  if(window._shopPreviewMap){window._shopPreviewMap.remove();window._shopPreviewMap=null;}
  const m=L.map('shop-loc-preview-map',{zoomControl:false,attributionControl:false}).setView([lat,lng],16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(m);
  L.circleMarker([lat,lng],{radius:8,color:'#6366F1',fillColor:'#6366F1',fillOpacity:1,weight:3}).addTo(m);
  window._shopPreviewMap=m;
}

function captureShopLocation() {
  const btn=document.querySelector('[onclick="captureShopLocation()"]');
  if(btn){btn.textContent='📍 Getting…';btn.disabled=true;}
  getGPS().then(pos=>{
    const lat=document.getElementById('sm-lat'), lng=document.getElementById('sm-lng');
    if(lat) lat.value=pos.coords.latitude.toFixed(6);
    if(lng) lng.value=pos.coords.longitude.toFixed(6);
    if(btn){btn.textContent='✓ GPS set';btn.disabled=false;}
    const st=document.getElementById('sm-loc-status');
    if(st){st.textContent='✓ Location set: '+pos.coords.latitude.toFixed(4)+', '+pos.coords.longitude.toFixed(4);st.style.color='var(--ok)';}
    const preview=document.getElementById('shop-loc-preview');
    if(preview) preview.style.display='block';
    showToast('✓ '+pos.coords.latitude.toFixed(4)+', '+pos.coords.longitude.toFixed(4));
    // Mini preview map
    setTimeout(()=>renderShopLocationPreview(pos.coords.latitude,pos.coords.longitude),200);
  }).catch(e=>{
    if(btn){btn.textContent='📍 Use My Location';btn.disabled=false;}
    showToast('⚠️ '+(e.code===1?'Allow location access in browser settings':e.code===2?'GPS unavailable':'Timed out'));
  });
}

// ── CHECK-IN ──────────────────────────────────────────────────────────────────
function openCheckin(shopId) {
  const shop=STATE.shops.find(s=>s.id===shopId); if(!shop) return;
  if(!shop.lat||!shop.lng){showToast('⚠️ No GPS set for this shop — admin must add location first');return;}
  window._checkinPos=null;
  STATE.modal={type:'checkin',data:{shopId}}; render();
}

function renderCheckinModal(shopId) {
  const shop=STATE.shops.find(s=>s.id===shopId); if(!shop) return '';
  const todayStr=new Date().toISOString().split('T')[0];
  const checkedToday=STATE.checkins.some(c=>c.shopId===shopId&&c.agentId===(STATE.agentId||STATE.user?.id)&&c.ts.startsWith(todayStr));
  const recent=STATE.checkins.filter(c=>c.shopId===shopId&&(STATE.isAdmin||c.agentId===(STATE.agentId||STATE.user?.id))).sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,4);
  return '<div class="mhan"></div>'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'+
      '<div style="width:44px;height:44px;border-radius:var(--rs);background:var(--as);display:flex;align-items:center;justify-content:center;font-size:22px">🏪</div>'+
      '<div><div style="font-family:Outfit,sans-serif;font-size:18px;font-weight:800">'+shop.name+'</div>'+
      '<div style="font-size:12px;color:var(--t2)">'+(shop.area||'')+(shop.lat&&shop.lng?' · 📍 GPS set':'')+'</div></div>'+
    '</div>'+
    (checkedToday?'<div style="background:var(--oks);color:var(--ok);padding:10px 14px;border-radius:var(--rs);font-size:13px;font-weight:600;margin-bottom:12px;text-align:center">✓ Already visited today</div>':'')+
    '<div id="checkin-status" style="background:var(--s2);border-radius:var(--rm);padding:16px;text-align:center;margin-bottom:14px">'+
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--t2)">'+
        '<span style="width:18px;height:18px;border:2px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite;display:inline-block;flex-shrink:0"></span>'+
        'Getting your location…</div>'+
    '</div>'+
    '<div class="iw" style="margin-bottom:14px"><label class="il">Note (optional)</label>'+
      '<input id="checkin-note" class="inp" placeholder="e.g. Placed order, owner available, follow up needed…"></div>'+
    '<div style="display:flex;gap:10px;margin-bottom:'+(recent.length?'18':'0')+'px">'+
      '<button class="btn bs" style="flex:1;height:48px" onclick="closeModal()">Cancel</button>'+
      '<button id="checkin-submit" class="btn bp" style="flex:2;height:48px;font-size:15px;font-weight:700" disabled onclick="submitCheckin(\''+shopId+'\')">📍 Verifying…</button>'+
    '</div>'+
    (recent.length?'<div style="border-top:1px solid var(--b);padding-top:14px">'+
      '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Recent Visits</div>'+
      recent.map(c=>{
        const d=new Date(c.ts);
        const when=d.toLocaleDateString('en',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
        return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--b)">'+
          '<div style="width:28px;height:28px;border-radius:50%;background:var(--as);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:var(--a);flex-shrink:0">'+(c.agentName||'?')[0].toUpperCase()+'</div>'+
          '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600">'+(STATE.isAdmin?c.agentName+' · ':'')+when+(c.distanceM?' · '+c.distanceM+'m':'')+'</div>'+
          (c.note?'<div style="font-size:11px;color:var(--t2);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">"'+c.note+'"</div>':'')+'</div>'+
          '<span style="background:var(--oks);color:var(--ok);padding:2px 7px;border-radius:99px;font-size:9px;font-weight:700">✓</span></div>';
      }).join('')+
    '</div>':'');
}

function bindCheckinModal(shopId) {
  const shop=STATE.shops.find(s=>s.id===shopId); if(!shop?.lat||!shop?.lng) return;
  getGPS().then(pos=>{
    const dist=gpsDistance(pos.coords.latitude,pos.coords.longitude,shop.lat,shop.lng);
    const st=document.getElementById('checkin-status'), btn=document.getElementById('checkin-submit');
    const ok=dist<=CHECKIN_RADIUS;
    if(st) st.innerHTML=ok
      ?'<div style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="font-size:22px">✅</span><div><div style="font-size:14px;font-weight:700;color:var(--ok)">You\'re at the shop!</div><div style="font-size:11px;color:var(--t2)">'+fmtDist(dist)+' away</div></div></div>'
      :'<div style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="font-size:22px">❌</span><div><div style="font-size:14px;font-weight:700;color:var(--err)">Too far away</div><div style="font-size:11px;color:var(--t2)">'+fmtDist(dist)+' · need to be within '+CHECKIN_RADIUS+'m</div></div></div>';
    if(btn){btn.disabled=!ok;btn.textContent=ok?'✓ Check In Now':'Too far — '+fmtDist(dist);}
    window._checkinPos=ok?{lat:pos.coords.latitude,lng:pos.coords.longitude,dist}:null;
  }).catch(e=>{
    const st=document.getElementById('checkin-status');
    if(st) st.innerHTML='<div style="color:var(--err);font-size:13px">⚠️ '+(e.code===1?'Allow location access in settings':e.code===2?'GPS unavailable':'Timed out')+'</div>';
  });
}

function submitCheckin(shopId) {
  const shop=STATE.shops.find(s=>s.id===shopId); if(!shop) return;
  const pos=window._checkinPos; if(!pos){showToast('⚠️ GPS not verified');return;}
  const note=((document.getElementById('checkin-note')||{}).value||'').trim();
  const c={id:uid(),agentId:STATE.agentId||STATE.user?.id,agentName:STATE.user?.name||'Agent',shopId:shop.id,shopName:shop.name,ts:new Date().toISOString(),lat:pos.lat,lng:pos.lng,distanceM:Math.round(pos.dist),note};
  STATE.checkins.push(c);
  STATE.shops=STATE.shops.map(s=>s.id===shopId?{...s,lastVisit:c.ts.split('T')[0]}:s);
  saveState(); window._checkinPos=null;
  showToast('✓ Checked in at '+shop.name); closeModal();
}

// ── NEARBY SHOPS PAGE ─────────────────────────────────────────────────────────
let _nearbyPos=null, _nearbyLoading=false;

function renderNearbyShops() {
  const gpsShops=STATE.shops.filter(s=>s.lat&&s.lng);
  return '<div class="fu">'+
    '<div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">📡 Nearby Shops</h1>'+
    '<div style="font-size:12px;color:var(--t2)">'+gpsShops.length+' shops with GPS</div></div>'+
    (!gpsShops.length
      ?'<div class="empty"><div class="eico">📍</div><div class="etit">No shops have GPS set</div><div class="esub">Admin must set shop locations first</div></div>'
      :_nearbyLoading
        ?'<div style="display:flex;flex-direction:column;align-items:center;padding:48px 20px;gap:14px"><div style="width:36px;height:36px;border:3px solid var(--as);border-top-color:var(--a);border-radius:50%;animation:spin 1s linear infinite"></div><div style="font-size:14px;color:var(--t2)">Getting your location…</div></div>'
        :_nearbyPos?renderNearbyList()
          :'<div style="display:flex;flex-direction:column;align-items:center;padding:48px 20px;gap:14px">'+
            '<div style="font-size:52px">📡</div>'+
            '<div style="font-family:Outfit,sans-serif;font-size:18px;font-weight:700;text-align:center">Find shops near you</div>'+
            '<div style="font-size:13px;color:var(--t2);text-align:center;max-width:240px">Your GPS sorts all shops by distance and lets you check in instantly</div>'+
            '<button class="btn bp" style="height:50px;padding:0 32px;font-size:15px;font-weight:700" onclick="loadNearby()">📍 Use My Location</button>'+
          '</div>'
    )+'</div>';
}

function renderNearbyList() {
  const todayStr=new Date().toISOString().split('T')[0];
  const shops=STATE.shops.filter(s=>s.lat&&s.lng)
    .map(s=>({...s,dist:gpsDistance(_nearbyPos.lat,_nearbyPos.lng,s.lat,s.lng)}))
    .sort((a,b)=>a.dist-b.dist);
  return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'+
    '<div style="font-size:12px;color:var(--t2)"><span style="color:var(--ok)">●</span> Live · '+shops.length+' shops</div>'+
    '<button class="btn bs" style="height:32px;padding:0 10px;font-size:11px" onclick="loadNearby()">↺ Refresh</button>'+
  '</div>'+
  shops.map(shop=>{
    const checkedToday=STATE.checkins.some(c=>c.shopId===shop.id&&c.agentId===(STATE.agentId||STATE.user?.id)&&c.ts.startsWith(todayStr));
    const last=STATE.checkins.filter(c=>c.shopId===shop.id&&c.agentId===(STATE.agentId||STATE.user?.id)).sort((a,b)=>new Date(b.ts)-new Date(a.ts))[0];
    const inRange=shop.dist<=CHECKIN_RADIUS;
    const distColor=inRange?'var(--ok)':shop.dist<=500?'var(--warn)':'var(--t3)';
    return '<div class="card csm" style="margin-bottom:8px">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="flex:1;min-width:0">'+
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">'+
            '<div style="font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+shop.name+'</div>'+
            (checkedToday?'<span style="background:var(--oks);color:var(--ok);padding:1px 6px;border-radius:99px;font-size:9px;font-weight:700;flex-shrink:0">✓ Today</span>':'')+
          '</div>'+
          '<div style="font-size:11px;color:var(--t2)">'+(shop.area||'')+(shop.owner?' · '+shop.owner:'')+'</div>'+
          (last&&!checkedToday?'<div style="font-size:10px;color:var(--t3)">Last: '+new Date(last.ts).toLocaleDateString('en',{day:'2-digit',month:'short'})+'</div>':'')+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0">'+
          '<div style="font-size:18px;font-weight:800;color:'+distColor+'">'+fmtDist(shop.dist)+'</div>'+
          '<div style="font-size:9px;color:var(--t3)">'+(inRange?'✓ in range':shop.dist<=500?'close':'far')+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:7px;margin-top:10px">'+
        (inRange?'<button class="btn bp" style="flex:2;height:36px;font-size:12px;font-weight:700" onclick="openCheckin(\''+shop.id+'\')">📍 Check In</button>':
                 '<button class="btn bs" style="flex:2;height:36px;font-size:12px;color:var(--t3);cursor:default" disabled>'+fmtDist(shop.dist)+' away</button>')+
        '<button class="btn bs" style="flex:1;height:36px;font-size:12px" onclick="openShopDetail(\''+shop.id+'\')">Info</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function loadNearby() {
  _nearbyLoading=true; _nearbyPos=null; render();
  getGPS().then(pos=>{_nearbyPos={lat:pos.coords.latitude,lng:pos.coords.longitude};_nearbyLoading=false;render();})
  .catch(e=>{_nearbyLoading=false;showToast('⚠️ '+(e.code===1?'Allow location access':e.code===2?'GPS unavailable':'Timed out'));render();});
}

// ── MAP PAGE (Leaflet + OpenStreetMap — 100% free, no API key) ────────────────
let _leafletMap=null, _userMarker=null;

function renderMapPage() {
  return '<div class="fu" style="padding:0">'+
    '<div style="padding:12px 16px 10px;display:flex;align-items:center;justify-content:space-between;background:var(--s);border-bottom:1px solid var(--b)">'+
      '<div><div style="font-family:Outfit,sans-serif;font-size:18px;font-weight:800">🗺 Shop Map</div>'+
      '<div style="font-size:11px;color:var(--t2)">OpenStreetMap · '+STATE.shops.filter(s=>s.lat&&s.lng).length+' shops</div></div>'+
      '<div style="display:flex;gap:7px">'+
        '<button class="btn bs" style="height:34px;padding:0 12px;font-size:12px" onclick="centerMapOnUser()">📍 Me</button>'+
        '<button class="btn bs" style="height:34px;padding:0 12px;font-size:12px" onclick="fitMapToShops()">⊞ Fit</button>'+
      '</div>'+
    '</div>'+
    '<div id="map-container" style="height:calc(100vh - 168px);width:100%"></div>'+
    '<div style="padding:8px 16px;display:flex;gap:14px;flex-wrap:wrap;background:var(--s);border-top:1px solid var(--b)">'+
      '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t2)"><span style="width:10px;height:10px;border-radius:50%;background:#6366F1;display:inline-block"></span>Shop</div>'+
      '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t2)"><span style="width:10px;height:10px;border-radius:50%;background:#10B981;display:inline-block"></span>Visited today</div>'+
      '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t2)"><span style="width:10px;height:10px;border-radius:50%;background:#F59E0B;display:inline-block"></span>You</div>'+
    '</div>'+
  '</div>';
}

function bindMapPage() { setTimeout(()=>initLeafletMap(), 150); }

function initLeafletMap() {
  const container=document.getElementById('map-container');
  if(!container||!window.L) return;
  if(_leafletMap){_leafletMap.remove();_leafletMap=null;_userMarker=null;}
  const shopsWithGPS=STATE.shops.filter(s=>s.lat&&s.lng);
  const center=shopsWithGPS.length?[shopsWithGPS[0].lat,shopsWithGPS[0].lng]:[4.1755,73.5093];
  _leafletMap=L.map('map-container',{zoomControl:true,attributionControl:true,tap:true}).setView(center,14);
  // OpenStreetMap tiles — free, no API key needed
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom:19
  }).addTo(_leafletMap);
  const todayStr=new Date().toISOString().split('T')[0];
  shopsWithGPS.forEach(shop=>{
    const visitedToday=STATE.checkins.some(c=>c.shopId===shop.id&&c.agentId===(STATE.agentId||STATE.user?.id)&&c.ts.startsWith(todayStr));
    const color=visitedToday?'#10B981':'#6366F1';
    const marker=L.circleMarker([shop.lat,shop.lng],{radius:9,color:'#fff',fillColor:color,fillOpacity:1,weight:2.5}).addTo(_leafletMap);
    marker.bindPopup(
      '<div style="font-family:Nunito,sans-serif;min-width:150px">'+
      '<div style="font-family:Outfit,sans-serif;font-weight:800;font-size:14px;margin-bottom:4px">'+shop.name+'</div>'+
      (shop.area?'<div style="font-size:12px;color:#666;margin-bottom:4px">'+shop.area+'</div>':'')+
      (visitedToday?'<div style="color:#10B981;font-size:11px;font-weight:700;margin-bottom:6px">✓ Visited today</div>':'')+
      (shop.owner?'<div style="font-size:11px;margin-bottom:2px">👤 '+shop.owner+'</div>':'')+
      (shop.contact?'<div style="font-size:11px;margin-bottom:8px">📞 <a href="tel:'+shop.contact+'">'+shop.contact+'</a></div>':'')+
      '<button onclick="window._mapCheckin(\''+shop.id+'\')" style="background:#6366F1;color:#fff;border:none;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;width:100%">📍 Check In</button>'+
      '</div>'
    );
  });
  if(shopsWithGPS.length>1){
    _leafletMap.fitBounds(L.latLngBounds(shopsWithGPS.map(s=>[s.lat,s.lng])),{padding:[30,30]});
  }
  // Try user location
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      if(!_leafletMap) return;
      if(_userMarker) _userMarker.remove();
      _userMarker=L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:10,color:'#fff',fillColor:'#F59E0B',fillOpacity:1,weight:3}).addTo(_leafletMap).bindPopup('<b>You are here</b>');
    },()=>{},{enableHighAccuracy:true,timeout:8000});
  }
}
window._mapCheckin=function(shopId){if(_leafletMap)_leafletMap.closePopup();openCheckin(shopId);};

function centerMapOnUser() {
  if(!navigator.geolocation||!_leafletMap){showToast('⚠️ GPS not available');return;}
  showToast('Getting location…');
  navigator.geolocation.getCurrentPosition(pos=>{
    if(_userMarker) _userMarker.remove();
    _userMarker=L.circleMarker([pos.coords.latitude,pos.coords.longitude],{radius:10,color:'#fff',fillColor:'#F59E0B',fillOpacity:1,weight:3}).addTo(_leafletMap).bindPopup('<b>You are here</b>').openPopup();
    _leafletMap.setView([pos.coords.latitude,pos.coords.longitude],16);
  },e=>showToast('⚠️ '+(e.code===1?'Allow location access':e.code===2?'GPS unavailable':'Timed out')),{enableHighAccuracy:true,timeout:8000});
}
function fitMapToShops() {
  if(!_leafletMap) return;
  const s=STATE.shops.filter(x=>x.lat&&x.lng);
  if(!s.length){showToast('No shops have GPS set');return;}
  _leafletMap.fitBounds(L.latLngBounds(s.map(x=>[x.lat,x.lng])),{padding:[30,30]});
}

// ── CHECK-IN HISTORY ──────────────────────────────────────────────────────────
function renderCheckinHistory(shopId) {
  const checkins=STATE.checkins.filter(c=>(!shopId||c.shopId===shopId)&&(STATE.isAdmin||c.agentId===(STATE.agentId||STATE.user?.id))).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  if(!checkins.length) return '<div class="empty"><div class="eico">📍</div><div class="etit">No check-ins yet</div><div class="esub">Check in at shops to build visit history</div></div>';
  const byDate={};
  checkins.forEach(c=>{const d=c.ts.split('T')[0];if(!byDate[d])byDate[d]=[];byDate[d].push(c);});
  return Object.keys(byDate).sort().reverse().map(date=>{
    const label=new Date(date+'T12:00:00').toLocaleDateString('en',{weekday:'long',day:'2-digit',month:'short',year:'numeric'});
    return '<div style="margin-bottom:14px">'+
      '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">'+label+' · '+byDate[date].length+' visit'+(byDate[date].length!==1?'s':'')+'</div>'+
      byDate[date].map(c=>{
        const time=new Date(c.ts).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
        return '<div class="card csm" style="margin-bottom:8px">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
            '<div style="flex:1;min-width:0">'+
              '<div style="font-size:14px;font-weight:700">'+c.shopName+'</div>'+
              (STATE.isAdmin?'<div style="font-size:11px;color:var(--a);font-weight:600">'+(c.agentName||'Agent')+'</div>':'')+
              '<div style="font-size:11px;color:var(--t2)">'+time+(c.distanceM?' · '+c.distanceM+'m':'')+'</div>'+
              (c.note?'<div style="font-size:12px;margin-top:6px;padding:6px 8px;background:var(--s2);border-radius:var(--rx);font-style:italic">"'+c.note+'"</div>':'')+
            '</div>'+
            '<span style="background:var(--oks);color:var(--ok);padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;flex-shrink:0;margin-left:10px">✓</span>'+
          '</div>'+
        '</div>';
      }).join('')+
    '</div>';
  }).join('');
}

function renderMyCheckins() {
  const mine=STATE.checkins.filter(c=>STATE.isAdmin||c.agentId===(STATE.agentId||STATE.user?.id));
  const todayStr=new Date().toISOString().split('T')[0];
  const todayCount=mine.filter(c=>c.ts.startsWith(todayStr)).length;
  const weekCount=mine.filter(c=>c.ts>=new Date(Date.now()-7*86400000).toISOString()).length;
  return '<div class="fu">'+
    '<div style="margin-bottom:14px"><h1 style="font-size:22px;font-weight:800">'+(STATE.isAdmin?'All Check-ins':'My Visits')+'</h1>'+
    '<div style="font-size:12px;color:var(--t2)">'+mine.length+' total visits recorded</div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'+
      '<div class="kcard"><div class="klbl">Today</div><div class="kval" style="color:var(--a)">'+todayCount+'</div><div class="ksub">shops visited</div></div>'+
      '<div class="kcard"><div class="klbl">This Week</div><div class="kval" style="color:var(--ok)">'+weekCount+'</div><div class="ksub">total visits</div></div>'+
    '</div>'+
    renderCheckinHistory(null)+
  '</div>';
}

function renderItems() {
  const cats = [...new Set(STATE.items.map(i=>i.category).filter(Boolean))];
  return '<div class="fu"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:10px">' +
    '<div><h1 style="font-size:22px;font-weight:800">Items</h1><div style="font-size:12px;color:var(--t2)">' + STATE.items.length + ' products</div></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end">' +
      '<button class="btn bs" style="padding:10px 12px;font-size:12px" onclick="toggleItemsMassMode()">' + (itemsMassMode ? 'Exit Mass Delete' : 'Mass Delete') + '</button>' +
      (itemsMassMode ? '<button class="btn bs" style="padding:10px 12px;font-size:12px" onclick="selectAllVisibleItems()">Select All</button><button class="btn bs" style="padding:10px 12px;font-size:12px" onclick="clearItemSelection()">Clear</button><button class="btn bd" style="padding:10px 12px;font-size:12px" onclick="deleteSelectedItems()">Delete Selected (' + selectedItems.size + ')</button><button class="btn bd" style="padding:10px 12px;font-size:12px" onclick="deleteAllItems()">Delete All</button>' : '') +
      '<button class="btn bp" style="padding:10px 14px;font-size:13px" onclick="openItemModal(null)">' + IC.plus + ' Add</button></div></div>' +
    '<div class="srchw" style="margin-bottom:10px"><span class="srchi">' + IC.srch + '</span><input id="it-srch" class="inp srchin" placeholder="Search items…" style="height:38px;font-size:13px" oninput="filterItems()"></div>' +
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px">' +
    '<button class="chip on" id="cat-all" onclick="setCat(\'\')">All</button>' +
    cats.map(c=>'<button class="chip" id="cat-' + c.replace(/\s/g,'_') + '" onclick="setCat(\'' + c.replace(/'/g,'\\\'') + '\')">' + c + '</button>').join('') + '</div>' +
    '<input type="hidden" id="cat-filter" value=""><div id="items-list"></div></div>';
}
function bindItems() { filterItems(); }
function setCat(c) {
  const el=document.getElementById('cat-filter'); if(el) el.value=c;
  document.querySelectorAll('#content .chip').forEach(b=>b.classList.remove('on'));
  const t=document.getElementById(c?'cat-'+c.replace(/\s/g,'_'):'cat-all'); if(t) t.classList.add('on');
  filterItems();
}
function getVisibleItems() {
  const srch = ((document.getElementById('it-srch')||{}).value||'').toLowerCase();
  const cat = (document.getElementById('cat-filter')||{}).value||'';
  return STATE.items.filter(i=>(!cat||i.category===cat)&&(!srch||i.name.toLowerCase().includes(srch)));
}
function toggleItemsMassMode() { itemsMassMode = !itemsMassMode; selectedItems.clear(); render(); }
function toggleItemSelect(id, checked) { if (checked) selectedItems.add(id); else selectedItems.delete(id); filterItems(); }
function selectAllVisibleItems() { getVisibleItems().forEach(i=>selectedItems.add(i.id)); filterItems(); }
function clearItemSelection() { selectedItems.clear(); filterItems(); }
function deleteSelectedItems() {
  if (!selectedItems.size) { showToast('Nothing selected'); return; }
  if (!confirm('Delete ' + selectedItems.size + ' selected items?')) return;
  STATE.items = STATE.items.filter(i => !selectedItems.has(i.id));
  selectedItems.clear();
  saveState();
  showToast('Deleted selected items');
  render();
}
function deleteAllItems() {
  if (!confirm('Delete ALL items?')) return;
  STATE.items = [];
  selectedItems.clear();
  saveState();
  showToast('Deleted all items');
  render();
}
function filterItems() {
  const items = getVisibleItems();
  const el=document.getElementById('items-list'); if(!el) return;
  if(!items.length){el.innerHTML='<div class="empty"><div class="eico">📦</div><div class="etit">No items</div><div class="esub">Items auto-save when you add sales</div></div>';return;}
  el.innerHTML='<div class="tw"><table class="dt"><thead><tr>' +
    (itemsMassMode ? '<th style="width:34px"></th>' : '') +
    '<th>Item</th><th>Category</th><th class="nr">Price</th><th class="nr">Half Doz.</th><th class="nr">Case</th><th></th></tr></thead><tbody>' +
    items.map(it => {
      const tiers = calcTiers(it);
      return '<tr' + (selectedItems.has(it.id) ? ' style="background:var(--as)"' : '') + '>' +
        (itemsMassMode ? '<td><input type="checkbox" ' + (selectedItems.has(it.id) ? 'checked' : '') + ' onchange="toggleItemSelect(\'' + it.id + '\',this.checked)"></td>' : '') +
        '<td style="font-weight:600;font-size:13px">' + it.name + '</td>' +
        '<td><span class="tag">' + (it.category||'—') + '</span></td>' +
        '<td class="nr" style="font-weight:700">' + (tiers.unit > 0 ? money(tiers.unit) : '<span style="color:var(--t3)">\u2014</span>') + '</td>' +
        '<td class="nr" style="color:var(--half);font-weight:600">' + (tiers.halfCase > 0 ? money(tiers.halfCase)+'<div style="font-size:9px;color:var(--t3)">for 6</div>' : '<span style="color:var(--t3)">\u2014</span>') + '</td>' +
        '<td class="nr" style="color:var(--case);font-weight:600">' + (tiers.casePrice > 0 ? money(tiers.casePrice)+'<div style="font-size:9px;color:var(--t3)">for 12</div>' : '<span style="color:var(--t3)">\u2014</span>') + '</td>' +
        '<td><div style="display:flex;gap:4px">' +
        '<button class="btn bic" style="width:28px;height:28px" onclick="openItemModal(\'' + it.id + '\')">' + IC.edit + '</button>' +
        '<button class="btn bic" style="width:28px;height:28px;background:var(--errs);color:var(--err)" onclick="delItem(\'' + it.id + '\')">' + IC.trash + '</button>' +
        '</div></td></tr>';
    }).join('') + '</tbody></table></div>';
}
function openItemModal(id) { STATE.modal={type:'item',data:{id}}; render(); }
function delItem(id) { if(confirm('Remove item?')){STATE.items=STATE.items.filter(i=>i.id!==id);saveState();showToast('Removed');render();} }
function renderItemModal(id) {
  const item = id ? STATE.items.find(i=>i.id===id) : null;
  const tiers = item ? calcTiers(item) : {unit:0,halfCase:0,casePrice:0};
  const v = k => item ? (item[k] ?? '') : '';
  const ptype = 'unit'; // default active
  return '<div class="mhan"></div>' +
    // ── STICKY PRICE BAR for item modal ──
    '<div class="spb" id="item-spb">' +
      '<div class="spb-cell spb-act" id="ispb-unit"><div class="spb-lbl">Unit</div><div class="spb-val" id="ispb-unit-val">' + (tiers.unit>0?money(tiers.unit):'—') + '</div></div>' +
      '<div class="spb-cell" id="ispb-half"><div class="spb-lbl">Half Case ×6</div><div class="spb-val" id="ispb-half-val">' + (tiers.halfCase>0?money(tiers.halfCase):'—') + '</div></div>' +
      '<div class="spb-cell" id="ispb-case"><div class="spb-lbl">Case ×12</div><div class="spb-val" id="ispb-case-val">' + (tiers.casePrice>0?money(tiers.casePrice):'—') + '</div></div>' +
    '</div>' +
    '<div class="mtit">' + (item?'Edit Item':'Add Item') + '</div><div class="fg">' +
    '<div class="iw"><label class="il">Item Name *</label><input id="im-name" class="inp" value="' + v('name') + '" placeholder="e.g. Fresh Milk 1L"></div>' +
    '<div class="iw"><label class="il">Category</label><input id="im-cat" class="inp" value="' + v('category') + '" placeholder="e.g. Dairy"></div>' +
    '<div class="ptbox">' +
      '<div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Price Tiers</div>' +
      '<div class="iw" style="margin-bottom:10px"><label class="il">Unit Price (per single item)</label><input id="im-unit" class="inp" type="number" step="0.01" value="' + (item && item.unitPrice > 0 ? item.unitPrice : '') + '" placeholder="Blank = no unit price" oninput="updateTiers()"></div>' +
      '<div class="fr">' +
        '<div class="iw"><label class="il" style="color:var(--half)">Half Case (6) — auto from Case÷2</label><input id="im-half" class="inp" type="number" step="0.01" value="' + (item && item.halfPrice > 0 ? item.halfPrice : '') + '" placeholder="Auto: Case ÷ 2" oninput="updateTiers()"></div>' +
        '<div class="iw"><label class="il" style="color:var(--case)">Case Price (12)</label><input id="im-case" class="inp" type="number" step="0.01" value="' + (item && item.casePrice > 0 ? item.casePrice : '') + '" placeholder="From invoice" oninput="autoFillHalf()"></div>' +
      '</div>' +
      '<div style="margin-top:10px;font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.05em">Preview</div>' +
      '<div class="ptrow"><span class="ptlbl">Unit</span><span class="ptval" id="imt-unit">' + money(tiers.unit) + '</span></div>' +
      '<div class="ptrow"><span class="ptlbl" style="color:var(--half)">Half Case</span><span class="ptval" style="color:var(--half)" id="imt-half">' + money(tiers.halfCase) + '</span></div>' +
      '<div class="ptrow"><span class="ptlbl" style="color:var(--case)">Case</span><span class="ptval" style="color:var(--case)" id="imt-case">' + money(tiers.casePrice) + '</span></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px"><button class="btn bs" style="flex:1;height:46px" onclick="closeModal()">Cancel</button>' +
    '<button class="btn bp" style="flex:2;height:46px" onclick="saveItem(\'' + (id||'') + '\')">' + (item?'Save Changes':'Add Item') + '</button></div></div>';
}
function autoFillHalf() {
  const cv = parseFloat((document.getElementById('im-case')||{}).value)||0;
  const hel = document.getElementById('im-half');
  if (hel && !hel.value && cv > 0) hel.value = (cv/2).toFixed(2);
  updateTiers();
}
function updateTiers() {
  const uv = parseFloat((document.getElementById('im-unit')||{}).value)||0;
  const hv = parseFloat((document.getElementById('im-half')||{}).value)||0;
  const cv = parseFloat((document.getElementById('im-case')||{}).value)||0;
  const eu=document.getElementById('imt-unit'),eh=document.getElementById('imt-half'),ec=document.getElementById('imt-case');
  if(eu) eu.textContent = uv > 0 ? money(uv) : '\u2014';
  if(eh) eh.textContent = hv > 0 ? money(hv) : (cv > 0 ? money(+(cv/2).toFixed(2)) : '\u2014');
  if(ec) ec.textContent = cv > 0 ? money(cv) : '\u2014';
  // Sync item sticky bar
  const isu=document.getElementById('ispb-unit-val'),ish=document.getElementById('ispb-half-val'),isc=document.getElementById('ispb-case-val');
  if(isu) isu.textContent = uv>0?money(uv):'—';
  if(ish) ish.textContent = hv>0?money(hv):(cv>0?money(+(cv/2).toFixed(2)):'—');
  if(isc) isc.textContent = cv>0?money(cv):'—';
}
function saveItem(id) {
  const v = i => (document.getElementById(i)||{}).value||'';
  const name = v('im-name').trim(); if(!name){showToast('\u26A0\uFE0F Item name required');return;}
  const cat = v('im-cat').trim();
  const unit = parseFloat(v('im-unit')) || 0;
  const casePrice = parseFloat(v('im-case')) || 0;
  const halfRaw = v('im-half').trim();
  // half: explicit value, or case/2 if case given, or 0 — NEVER auto from unit
  const half = halfRaw !== '' ? (parseFloat(halfRaw) || 0) : (casePrice > 0 ? +(casePrice / 2).toFixed(2) : 0);
  if(id) STATE.items=STATE.items.map(i=>i.id===id?{...i,name,category:cat,unitPrice:unit,halfPrice:half,casePrice:casePrice}:i);
  else {
    if(STATE.items.find(i=>i.name.toLowerCase()===name.toLowerCase())){showToast('⚠️ Already exists');return;}
    STATE.items.push({id:uid(),name,category:cat,unitPrice:unit,halfPrice:half,casePrice:casePrice});
  }
  saveState(); showToast('✓ Saved'); closeModal();
}