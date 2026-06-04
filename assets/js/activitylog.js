'use strict';
// ── ACTIVITY LOG ──────────────────────────────────────────────────────────────

const ACT_ICONS = {
  login:       '🔐',
  sale_add:    '🧾',
  sale_edit:   '✏️',
  sale_delete: '🗑️',
  shop_add:    '🏪',
  shop_edit:   '✏️',
  shop_delete: '🗑️',
  csv_import:  '📂',
  payment_update: '💳',
  item_add:    '📦',
};
const ACT_COLORS = {
  login:       'var(--a)',
  sale_add:    'var(--ok)',
  csv_import:  'var(--case)',
  shop_add:    'var(--ok)',
  shop_delete: 'var(--err)',
  sale_delete: 'var(--err)',
  payment_update: 'var(--warn)',
};

function _relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return new Date(iso).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
}

function _fmtLogDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {weekday:'short', day:'2-digit', month:'short', year:'numeric'});
}

let _actFilter = 'all';

function renderActivityLogPage() {
  const log = getActivityLog();
  const types = ['all', 'login', 'sale_add', 'shop_add', 'shop_edit', 'shop_delete', 'csv_import'];
  const filtered = _actFilter === 'all' ? log : log.filter(e => e.type === _actFilter);

  // Group by calendar date
  const groups = {};
  filtered.forEach(e => {
    const day = (e.ts || '').split('T')[0] || 'Unknown';
    if (!groups[day]) groups[day] = [];
    groups[day].push(e);
  });
  const days = Object.keys(groups).sort((a,b) => b.localeCompare(a));

  return '<div class="fu">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div><h1 style="font-size:22px;font-weight:800">Activity Log</h1>' +
      '<div style="font-size:12px;color:var(--t2)">' + log.length + ' total events</div></div>' +
      (STATE.isAdmin ? '<button class="btn bd" style="padding:8px 12px;font-size:11px" onclick="clearActivityLog()">Clear Log</button>' : '') +
    '</div>' +

    // Filter chips
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:14px">' +
    types.map(t =>
      '<button class="chip' + (_actFilter===t?' on':'') + '" style="flex-shrink:0;font-size:10px" onclick="setActFilter(\''+t+'\')">' +
        (t==='all' ? 'All ('+log.length+')' : (ACT_ICONS[t]||'') + ' ' + t.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())) +
      '</button>'
    ).join('') +
    '</div>' +

    (!filtered.length ?
      '<div class="empty"><div class="eico">📋</div><div class="etit">No activity yet</div><div class="esub">Actions like logins, sales, and imports will appear here</div></div>' :
      days.map(day => {
        const entries = groups[day];
        const label = day === new Date().toISOString().split('T')[0] ? 'Today' :
                      day === new Date(Date.now()-86400000).toISOString().split('T')[0] ? 'Yesterday' :
                      _fmtLogDate(day+'T00:00:00');
        return '<div style="margin-bottom:18px">' +
          '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding-left:2px">' + label + '</div>' +
          '<div class="card" style="padding:0;overflow:hidden">' +
          entries.map((e, i) => {
            const ico = ACT_ICONS[e.type] || '📝';
            const col = ACT_COLORS[e.type] || 'var(--t2)';
            const time = e.ts ? new Date(e.ts).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) : '';
            const bgMap = {'var(--a)':'rgba(99,102,241,.13)','var(--ok)':'rgba(16,185,129,.13)','var(--err)':'rgba(239,68,68,.13)','var(--warn)':'rgba(245,158,11,.13)','var(--case)':'rgba(14,165,233,.13)'};
            const iconBg = bgMap[col] || 'var(--s2)';
            return '<div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;' + (i>0?'border-top:1px solid var(--b)':'') + '">' +
              '<div style="width:32px;height:32px;border-radius:9px;background:'+iconBg+';display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">'+ico+'</div>' +
              '<div style="flex:1;min-width:0">' +
                '<div style="font-size:13px;font-weight:500;line-height:1.4">' + esc(e.msg||'') + '</div>' +
                '<div style="font-size:10px;color:var(--t3);margin-top:2px;display:flex;gap:8px">' +
                  '<span>' + _relTime(e.ts) + '</span>' +
                  (time ? '<span>· ' + time + '</span>' : '') +
                  (e.userName ? '<span>· ' + esc(e.userName) + '</span>' : '') +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
          '</div></div>';
      }).join('')
    ) +
  '</div>';
}

function setActFilter(f) {
  _actFilter = f;
  const content = document.getElementById('content');
  if (content) content.innerHTML = renderActivityLogPage();
}

function clearActivityLog() {
  if (!confirm('Clear all activity log entries?')) return;
  db.set('activityLog', []);
  showToast('Activity log cleared');
  render();
}
