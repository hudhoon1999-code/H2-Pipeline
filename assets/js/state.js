'use strict';
// ── SEED DATA ──────────────────────────────────────────────────────────────
function seedData() {
  if (db.get('seeded3')) return;
  const today = new Date().toISOString().split('T')[0];
  db.set('items', [
    {id:uid(),name:'Fresh Milk 1L',category:'Dairy',unitPrice:65},
    {id:uid(),name:'Butter 500g',category:'Dairy',unitPrice:280},
    {id:uid(),name:'Orange Juice 1L',category:'Beverages',unitPrice:110},
    {id:uid(),name:'Mineral Water 1L',category:'Beverages',unitPrice:20},
    {id:uid(),name:'White Bread',category:'Bakery',unitPrice:45},
  ]);
  db.set('shops', [
    {id:uid(),name:'Al Noor Mart',owner:'Ahmed Ali',contact:'9876543210',area:'Bur Dubai',priority:'High',notes:''},
    {id:uid(),name:'Sunrise Superstore',owner:'Ravi Kumar',contact:'9123456789',area:'Deira',priority:'Medium',notes:''},
    {id:uid(),name:'City Fresh Market',owner:'Sara Hassan',contact:'9988776655',area:'Karama',priority:'High',notes:''},
  ]);
  db.set('sales', [
    {id:uid(),shopName:'Al Noor Mart',area:'Bur Dubai',invoiceId:'INV-001',date:today,itemName:'Fresh Milk 1L',category:'Dairy',priceType:'casePrice',quantity:2,unitPrice:65,lineTotal:1464.40,gstInclusive:false,gstRate:8,gstAmt:109.40,finalTotal:1573.80,paymentStatus:'Paid',notes:''},
    {id:uid(),shopName:'Al Noor Mart',area:'Bur Dubai',invoiceId:'INV-001',date:today,itemName:'Butter 500g',category:'Dairy',priceType:'unit',quantity:5,unitPrice:280,lineTotal:1400,gstInclusive:false,gstRate:8,gstAmt:112,finalTotal:1512,paymentStatus:'Paid',notes:''},
    {id:uid(),shopName:'Sunrise Superstore',area:'Deira',invoiceId:'INV-002',date:today,itemName:'Orange Juice 1L',category:'Beverages',priceType:'halfCase',quantity:3,unitPrice:110,lineTotal:1920.60,gstInclusive:true,gstRate:8,gstAmt:142.27,finalTotal:1920.60,paymentStatus:'Pending',notes:'GST included'},
    {id:uid(),shopName:'City Fresh Market',area:'Karama',invoiceId:'INV-003',date:today,itemName:'Mineral Water 1L',category:'Beverages',priceType:'unit',quantity:50,unitPrice:20,lineTotal:1000,gstInclusive:false,gstRate:8,gstAmt:80,finalTotal:1080,paymentStatus:'Pending',notes:''},
  ]);
  db.set('seeded3', true);
}

// ── STATE ──────────────────────────────────────────────────────────────────
let STATE = {
  dark: db.get('dark', true),
  user: null,
  page: 'dashboard',
  sales: db.get('sales', []),
  items: db.get('items', []),
  shops: db.get('shops', []),
  agents: db.get('agents', []),
  targets: db.get('targets', []),
  checkins: db.get('checkins', []), // {id, agentId, agentName, shopId, shopName, ts, lat, lng, note}
  currency: db.get('currency', 'MVR'),
  modal: null,
  isViewer: false,
  isAdmin: false,
  isAgent: false,
  agentId: null,
};

STATE.sales = (STATE.sales || []).map(normalizeSaleGSTRow);

let SHARE = db.get('shareState', {
  enabled: false,
  shareId: null,
  lastPushed: null,
  perms: {dashboard:true, sales:true, invoices:true, report:true, shops:false, items:false}
});

let itemsMassMode = false;
let selectedItems = new Set();
let shopsMassMode = false;
let selectedShops = new Set();
let shopSort = 'name'; // name | total | due | priority | orders

// ── AGENT HELPERS ────────────────────────────────────────────────────────────
// Returns sales visible to current user (all for admin, own only for agent)
function getVisibleSalesForUser() {
  if (STATE.isAdmin) return STATE.sales;
  if (STATE.agentId) return STATE.sales.filter(s => s.agentId === STATE.agentId);
  // fallback: match by user id or email
  return STATE.sales.filter(s => s.agentId === STATE.user?.id || s.agentEmail === STATE.user?.email);
}

// Get agent record for a given agentId
function getAgent(agentId) {
  return STATE.agents.find(a => a.id === agentId) || null;
}

// Get current period target for an agent
function getAgentTarget(agentId, period, year, periodNum) {
  return STATE.targets.find(t =>
    t.agentId === agentId &&
    t.period === period &&
    t.year === year &&
    (period === 'week' ? t.week === periodNum : t.month === periodNum)
  );
}

// Get agent's sales for a period
function getAgentPeriodSales(agentId, period, year, periodNum) {
  return STATE.sales.filter(s => {
    if (s.agentId !== agentId) return false;
    const d = new Date(s.date);
    if (d.getFullYear() !== year) return false;
    if (period === 'month') return (d.getMonth() + 1) === periodNum;
    // week: get ISO week number
    const startOfYear = new Date(year, 0, 1);
    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return weekNum === periodNum;
  });
}

// Current week/month helpers
function currentWeek() {
  const d = new Date(), startOfYear = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
}
function currentMonth() { return new Date().getMonth() + 1; }
function currentYear() { return new Date().getFullYear(); }

function setCurrency(code) {
  const c = String(code || 'MVR').trim().toUpperCase();
  STATE.currency = c || 'MVR';
  db.set('currency', STATE.currency);
  saveState();
  render();
}

const FIREBASE_URL = 'https://h2line-share-default-rtdb.firebaseio.com';
const VIEW_ID = new URLSearchParams(window.location.search).get('view');

function saveState() {
  db.set('sales', STATE.sales);
  db.set('items', STATE.items);
  db.set('shops', STATE.shops);
  db.set('agents', STATE.agents);
  db.set('targets', STATE.targets);
  db.set('checkins', STATE.checkins);
  db.set('currency', STATE.currency || 'MVR');
  db.set('dark', STATE.dark);
  db.set('syncPending', true);
  if (window.saveToFirestore) window.saveToFirestore();
}

// Admin email — used by firebase.js and auth.js
const ADMIN_EMAIL = 'hudhoon1999@gmail.com';
