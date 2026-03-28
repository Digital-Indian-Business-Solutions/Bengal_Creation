# Bengal Creations — Vendor Management Dashboard

A modern, fully-featured vendor management dashboard for the Bengal Creations marketplace.

## Tech Stack

- **React 18** + **React Router v6**
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Chart.js** + **react-chartjs-2** for analytics charts
- **react-hot-toast** for notifications
- **lucide-react** for icons

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

Open http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx        # Collapsible sidebar with nav links
│   ├── Navbar.jsx         # Top bar with dark mode toggle
│   ├── VendorTable.jsx    # Reusable vendor data table
│   ├── VendorCard.jsx     # Stat card for dashboard metrics
│   ├── Modal.jsx          # Reusable modal with backdrop
│   └── Pagination.jsx     # Page navigation component
├── pages/
│   ├── Dashboard.jsx      # Overview with charts & stats
│   ├── Vendors.jsx        # All vendors with pagination
│   ├── PendingVendors.jsx # Pending approval queue
│   ├── VendorDetails.jsx  # Full vendor profile + docs
│   ├── VendorProducts.jsx # Products by vendor
│   ├── Analytics.jsx      # Charts & metrics deep-dive
│   └── SearchVendor.jsx   # Debounced vendor search
├── services/
│   └── api.js             # Axios instance + all API calls
├── context/
│   └── ThemeContext.jsx   # Dark mode state management
├── App.jsx                # Router + layout wrapper
├── main.jsx               # React entry point
└── index.css              # Tailwind + custom CSS
```

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors?page=1&limit=10` | Paginated vendors list |
| GET | `/vendors/:id` | Single vendor details |
| GET | `/vendors/pending/all` | Pending vendors |
| GET | `/vendors/search/query?q=keyword` | Search vendors |
| GET | `/vendors/:vendorId/products` | Vendor products |
| GET | `/vendors/analytics/summary` | Analytics data |
| PATCH | `/vendors/verify/:id` | Verify a vendor |
| DELETE | `/vendors/:id` | Delete a vendor |

## Features

- ✅ Dashboard with live stats + Chart.js charts
- ✅ Full vendor table with pagination & action menus
- ✅ Pending vendor approval workflow
- ✅ Vendor detail page with document viewer modal
- ✅ Vendor products table with image previews
- ✅ Debounced real-time search
- ✅ Full analytics page with bar, line & doughnut charts
- ✅ Dark mode (system preference + toggle)
- ✅ Mobile-responsive sidebar
- ✅ Loading skeletons for all pages
- ✅ Toast notifications for all actions
- ✅ Empty state UI
- ✅ Delete confirmation modals
- ✅ Instant UI updates after verify/delete

## Base URL

```
https://api.bengalcreations.in/api/vendors
```

To change it, edit `src/services/api.js`:
```js
const BASE_URL = 'https://api.bengalcreations.in/api/vendors'
```
