export function exportToCSV(products) {
  const headers = ['ID','Name','Category','Vendor','District','Price','Original Price','Stock','Created At'];
  const rows = products.map(p => [
    p._id,
    `"${p.name}"`,
    p.category?.name || '',
    p.vendor?.shopName || '',
    p.district || '',
    p.price,
    p.orginalPrice || '',
    p.stock,
    new Date(p.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bengal-products-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
