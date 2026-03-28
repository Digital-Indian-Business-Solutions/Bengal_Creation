# Bengal Creations CRM Dashboard

A marketing CRM dashboard for Bengal Creations e-commerce platform.
Fetches live data from **api.bengalcreations.in/api/cart** and **/api/orders**.

---

## Project Structure

```
bengal-crm/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        ← Navigation sidebar with live badges
│   │   ├── StatCard.jsx       ← Metric summary cards
│   │   ├── FilterBar.jsx      ← Dynamic filters (district, vendor, amount, date)
│   │   ├── StatusSelect.jsx   ← Marketing status dropdown
│   │   ├── LeadsTable.jsx     ← Main data table with call + view actions
│   │   └── OrderModal.jsx     ← Order/cart detail popup with real product images
│   ├── pages/
│   │   ├── DashboardPage.jsx  ← Overview with stats + all leads
│   │   ├── CartLeadsPage.jsx  ← Cart-only leads with value stats
│   │   ├── OrdersPage.jsx     ← Orders with filters
│   │   ├── CustomersPage.jsx  ← Card view of unique customers
│   │   └── FollowUpsPage.jsx  ← Marketing follow-up queue
│   ├── hooks/
│   │   └── useLeads.js        ← All state + API fetching + filtering logic
│   ├── services/
│   │   └── api.js             ← Axios API calls + data normalisation
│   ├── constants.js           ← Status options, nav items, colours
│   ├── App.jsx                ← Root component
│   ├── index.js               ← Entry point
│   └── index.css              ← Global styles + CSS variables
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open browser
http://localhost:3000
```

---

## API Endpoints Used

| Endpoint | Description |
|---|---|
| `GET /api/cart` | Fetches all cart leads (populated with customer + product + vendor) |
| `GET /api/orders` | Fetches all orders (same shape, falls back gracefully if 404) |

Both endpoints are called from `https://api.bengalcreations.in`.

---

## Features

### Dashboard
- Total revenue, total leads, calls done, pending calls stats
- Full leads table with search + filter

### Cart Leads
- Shows only cart entries from `/api/cart`
- Cart value, potential revenue stats
- Filter by district, vendor, amount, date

### Orders
- Orders from `/api/orders`
- Same filters

### Customers
- Unique customer card view (deduplicated by phone/email)
- Call button opens `tel:` link
- Marketing status per customer

### Marketing Follow Ups
- Shows only "Not Called" + "Follow Up Later" leads
- Priority queue for calling team

### All Pages
- 📞 Call button → opens `tel:+91XXXXXXXXXX`
- Marketing status: Not Called / Called / Interested / Not Interested / Follow Up Later
- ⬇ Export CSV with current filters applied
- 🔍 Search by name, phone, email
- Order detail modal with real Cloudinary product images
- Live / Offline indicator
- Refresh button

---

## Adding Your Orders Endpoint

If your orders API uses authentication, edit `src/services/api.js`:

```js
// Add auth header if needed
const api = axios.create({
  baseURL: 'https://api.bengalcreations.in/api',
  headers: {
    Authorization: `Bearer ${YOUR_TOKEN}`,
  },
});
```

---

## Build for Production

```bash
npm run build
# Output in /build folder — deploy to Vercel, Netlify, or any static host
```
