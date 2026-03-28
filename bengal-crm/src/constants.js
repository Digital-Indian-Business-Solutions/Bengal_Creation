export const STATUS_OPTIONS = ['not_called', 'called', 'interested', 'not_interested', 'follow_up'];

export const STATUS_LABELS = {
  not_called: 'Not Called',
  called: 'Called',
  interested: 'Interested',
  not_interested: 'Not Interested',
  follow_up: 'Follow Up Later',
};

export const STATUS_COLORS = {
  not_called:     { color: 'var(--text3)',  border: 'var(--border)' },
  called:         { color: 'var(--accent)', border: 'rgba(79,142,247,0.4)' },
  interested:     { color: 'var(--green)',  border: 'rgba(34,201,122,0.4)' },
  not_interested: { color: 'var(--red)',    border: 'rgba(242,87,87,0.4)' },
  follow_up:      { color: 'var(--amber)',  border: 'rgba(245,166,35,0.4)' },
};

export const NAV_ITEMS = [
  { id: 'dashboard',  icon: '⊞',  label: 'Dashboard' },
  { id: 'carts',      icon: '🛒',  label: 'Cart Leads' },
  { id: 'orders',     icon: '📦',  label: 'Orders' },
  { id: 'customers',  icon: '👥',  label: 'Customers' },
  { id: 'followups',  icon: '📞',  label: 'Follow Ups' },
];

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#4f8ef7,#7c5bf5)',
  'linear-gradient(135deg,#22c97a,#4f8ef7)',
  'linear-gradient(135deg,#f5a623,#f25757)',
  'linear-gradient(135deg,#a78bfa,#f25757)',
  'linear-gradient(135deg,#22c97a,#a78bfa)',
];

export const PAGE_TITLES = {
  dashboard: 'Dashboard',
  carts:     'Cart Leads',
  orders:    'Orders',
  customers: 'Customers',
  followups: 'Marketing Follow Ups',
};
