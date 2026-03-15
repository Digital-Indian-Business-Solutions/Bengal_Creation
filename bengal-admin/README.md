# Bengal Creations — Admin Dashboard

A modern React + Tailwind CSS admin panel for managing products on the Bengal Creations e-commerce platform.

## Tech Stack
- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Chart.js + react-chartjs-2** for analytics charts

## Setup

```bash
npm install
npm start
```

Runs on http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats, recent products, quick district/vendor breakdown |
| `/products` | Full product table with search, filters, sort, pagination |
| `/products/:id` | Product detail with image gallery and stock management |
| `/analytics` | Charts: by district, vendor, category, price, timeline |

## Features

- **Search** by product name, vendor, or district
- **Filter** by category, vendor, district, stock status
- **Sort** by price, stock, newest/oldest
- **Edit** products via modal form (PUT /api/products/:id)
- **Delete** with confirmation popup
- **Increase / Decrease stock** inline
- **Bulk stock update** for multiple selected products
- **Low stock** rows highlighted in amber (stock ≤ 5)
- **Out of stock** rows highlighted in red (stock = 0)
- **Alert banners** for low/out-of-stock products
- **Export CSV** of filtered product list
- **Pagination** — 10 products per page
- **Fully responsive** — mobile sidebar, adaptive columns

## API Base
`https://api.bengalcreations.in/api/products`
