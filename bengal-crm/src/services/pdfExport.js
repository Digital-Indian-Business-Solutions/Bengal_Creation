import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";
// ─── Brand colours ────────────────────────────────────────────────────────────
const C = {
  primary: [79, 142, 247], // #4f8ef7
  purple: [124, 91, 245], // #7c5bf5
  dark: [15, 17, 23], // #0f1117
  card: [24, 28, 39], // #181c27
  cardBorder: [42, 48, 69], // #2a3045
  green: [34, 201, 122], // #22c97a
  amber: [245, 166, 35], // #f5a623
  red: [242, 87, 87], // #f25757
  purple2: [167, 139, 250], // #a78bfa
  white: [232, 234, 240], // #e8eaf0
  muted: [136, 146, 170], // #8892aa
  faint: [80, 88, 112], // #505870
};

const STATUS_COLORS = {
  not_called: C.faint,
  called: C.primary,
  interested: C.green,
  not_interested: C.red,
  follow_up: C.amber,
};
const STATUS_LABELS = {
  not_called: "Not Called",
  called: "Called",
  interested: "Interested",
  not_interested: "Not Interested",
  follow_up: "Follow Up Later",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rgb = (c) => ({ r: c[0], g: c[1], b: c[2] });

function setFill(doc, color) {
  doc.setFillColor(...color);
}
function setDraw(doc, color) {
  doc.setDrawColor(...color);
}
function setFont(doc, color, size, style = "normal") {
  doc.setTextColor(...color);
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
}

function drawRect(doc, x, y, w, h, fill, radius = 0) {
  setFill(doc, fill);
  if (radius) doc.roundedRect(x, y, w, h, radius, radius, "F");
  else doc.rect(x, y, w, h, "F");
}

function drawBadge(doc, x, y, text, bg, textColor, w = 28) {
  drawRect(doc, x, y - 4, w, 6, bg, 2);
  setFont(doc, textColor, 6, "bold");
  doc.text(text.toUpperCase(), x + w / 2, y, { align: "center" });
}
function drawWatermark(doc) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setTextColor(245, 245, 245);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');

  doc.text(
    'BENGAL CREATIONS',
    pw / 1.5,
    ph / 1.5,
    {
      align: 'center',
      angle: 45
    }
  );
}

// ─── Page header (repeated on each page) ─────────────────────────────────────
function drawPageHeader(doc, pageNum, totalPages) {
  const pw = doc.internal.pageSize.getWidth();

  // Top bar gradient simulation (two rects)
  drawRect(doc, 0, 0, pw / 2, 18, C.primary);
  drawRect(doc, pw / 2, 0, pw / 2, 18, C.purple);

  // Logo square
  doc.addImage(logo, "PNG", 10, 3, 14, 14);

  // Title
  setFont(doc, C.white, 11, "bold");
  doc.text("Bengal Creations", 26, 8);
  setFont(doc, [200, 210, 230], 7, "normal");
  doc.text("CRM Marketing Dashboard — Customer Report", 26, 13);

  // Page number
  setFont(doc, [200, 210, 230], 7, "normal");
  doc.text(`Page ${pageNum} of ${totalPages}`, pw - 12, 11, { align: "right" });

  // Sub-bar
  drawRect(doc, 0, 18, pw, 5, C.card);
  setFont(doc, C.faint, 6, "normal");
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
  doc.text(`Generated: ${now}`, 10, 22);
  doc.text("CONFIDENTIAL — INTERNAL USE ONLY", pw - 12, 22, { align: "right" });
}

// ─── Page footer ─────────────────────────────────────────────────────────────
function drawPageFooter(doc) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  drawRect(doc, 0, ph - 8, pw, 8, C.card);
  setFont(doc, C.faint, 6, "normal");
  doc.text(
    "Bengal Creations © 2024  |  api.bengalcreations.in",
    pw / 2,
    ph - 3,
    { align: "center" },
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function sectionHeading(doc, y, title, color = C.primary) {
  const pw = doc.internal.pageSize.getWidth();
  drawRect(doc, 10, y, pw - 20, 8, [...color, 20], 2); // low-alpha fill via opacity trick
  setDraw(doc, color);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, y, pw - 20, 8, 2, 2, "S");
  setFont(doc, color, 8, "bold");
  doc.text(title, 15, y + 5.5);
  return y + 12;
}

// ─── Key-value info row ───────────────────────────────────────────────────────
function infoRow(doc, x, y, label, value, valueColor = C.white) {
  setFont(doc, C.faint, 7, "normal");
  doc.text(label, x, y);
  setFont(doc, valueColor, 7, "bold");
  doc.text(String(value || "—"), x + 28, y);
}

// ─── Summary stats bar ────────────────────────────────────────────────────────
function drawSummaryBar(doc, leads, statuses, startY) {
  const pw = doc.internal.pageSize.getWidth();
  const bw = (pw - 20) / 4;
  const bh = 20;
  const bx = 10;

  const totalRev = leads
    .filter((l) => l.type === "order")
    .reduce((a, b) => a + b.totalAmount, 0);
  const callsDone = Object.values(statuses).filter(
    (s) => s !== "not_called",
  ).length;
  const pending = Object.values(statuses).filter(
    (s) => s === "not_called",
  ).length;
  const interested = Object.values(statuses).filter(
    (s) => s === "interested",
  ).length;

  const stats = [
    { label: "Total Records", value: leads.length, color: C.primary },
    {
      label: "Total Revenue",
      value: `Rs.${(totalRev / 1000).toFixed(1)}K`,
      color: C.green,
    },
    {
      label: "Calls Done",
      value: `${callsDone} (${interested} interested)`,
      color: C.amber,
    },
    { label: "Pending Calls", value: pending, color: C.red },
  ];

  stats.forEach((s, i) => {
    const x = bx + i * bw;
    drawRect(doc, x, startY, bw - 2, bh, C.card, 3);
    setDraw(doc, s.color);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, startY, bw - 2, bh, 3, 3, "S");
    // Left accent bar
    drawRect(doc, x, startY, 2, bh, s.color, 1);
    setFont(doc, C.faint, 6, "normal");
    doc.text(s.label, x + 6, startY + 7);
    setFont(doc, s.color, 10, "bold");
    doc.text(String(s.value), x + 6, startY + 15);
  });

  return startY + bh + 6;
}

// ─── Individual customer card ─────────────────────────────────────────────────
function drawCustomerCard(doc, lead, status, y) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Check page space — needs at least 80mm for a card + products
  if (y > ph - 90) {
    doc.addPage();
    drawPageHeader(doc, doc.internal.getCurrentPageInfo().pageNumber, "?");
    drawPageFooter(doc);
    y = 30;
  }

  // Card background
  const cardH = 38;
  drawRect(doc, 10, y, pw - 20, cardH, C.card, 3);
  setDraw(doc, C.cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, y, pw - 20, cardH, 3, 3, "S");

  // Left accent
  const typeColor = lead.type === "cart" ? C.purple2 : C.primary;
  drawRect(doc, 10, y, 3, cardH, typeColor, 1);

  // Avatar circle
  const ax = 22,
    ay = y + cardH / 2;
  setFill(doc, C.primary);
  doc.circle(ax, ay, 8, "F");
  setFont(doc, C.white, 7, "bold");
  const initials = (lead.customer.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  doc.text(initials, ax, ay + 2.5, { align: "center" });

  // Customer info
  const ix = 35;
  setFont(doc, C.white, 9, "bold");
  doc.text(lead.customer.name || "Unknown", ix, y + 10);

  setFont(doc, C.primary, 7, "normal");
  doc.text(lead.customer.phone || "—", ix, y + 17);

  setFont(doc, C.muted, 7, "normal");
  doc.text(lead.customer.email || "—", ix, y + 23);
  doc.text(
    `District: ${lead.district || "—"}  |  Date: ${lead.createdAt?.slice(0, 10) || "—"}`,
    ix,
    y + 29,
  );

  // Right side: amount + type badge + status
  const rx = pw - 15;
  setFont(doc, C.green, 11, "bold");
  doc.text(`Rs.${lead.totalAmount.toLocaleString()}`, rx, y + 13, {
    align: "right",
  });

  // Type badge
  drawBadge(
    doc,
    rx - 32,
    y + 20,
    lead.type === "cart" ? "Cart" : "Order",
    typeColor,
    C.white,
    22,
  );

  // Status badge
  const sc = STATUS_COLORS[status] || C.faint;
  drawBadge(
    doc,
    rx - 32,
    y + 28,
    STATUS_LABELS[status] || status,
    sc,
    C.white,
    32,
  );

  return y + cardH + 4;
}

// ─── Products table for a lead ────────────────────────────────────────────────
function drawProductsTable(doc, lead, startY) {
  const ph = doc.internal.pageSize.getHeight();

  if (startY > ph - 50) {
    doc.addPage();
    drawPageHeader(doc, doc.internal.getCurrentPageInfo().pageNumber, "?");
    drawPageFooter(doc);
    startY = 30;
  }

  startY = sectionHeading(
    doc,
    startY,
    `Items Ordered  (${lead.items.length} product${lead.items.length > 1 ? "s" : ""})`,
    C.purple2,
  );

  const rows = lead.items.map((item, idx) => [
    idx + 1,
    item.productName || "—",
    item.vendorName || "—",
    item.district || "—",
    item.quantity,
    `Rs.${(item.price || 0).toLocaleString()}`,
    `Rs.${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY,
    head: [
      [
        "#",
        "Product Name",
        "Vendor",
        "District",
        "Qty",
        "Unit Price",
        "Subtotal",
      ],
    ],
    body: rows,
    margin: { left: 10, right: 10 },
    theme: "plain",
    headStyles: {
      fillColor: C.cardBorder,
      textColor: C.muted,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    bodyStyles: {
      fillColor: [20, 24, 34],
      textColor: C.white,
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: C.card,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", textColor: C.faint },
      1: { cellWidth: 55, fontStyle: "bold" },
      2: { cellWidth: 38 },
      3: { cellWidth: 30 },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 25, halign: "right", textColor: C.muted },
      6: {
        cellWidth: 25,
        halign: "right",
        textColor: C.green,
        fontStyle: "bold",
      },
    },
    tableLineColor: C.cardBorder,
    tableLineWidth: 0.2,
    didDrawPage: (data) => {
      drawWatermark(doc);
      drawPageHeader(doc, doc.internal.getCurrentPageInfo().pageNumber, "?");
      drawPageFooter(doc);
    },
  });

  // Total row
  const finalY = doc.lastAutoTable.finalY + 2;
  const pw = doc.internal.pageSize.getWidth();
  drawRect(doc, pw - 60, finalY, 50, 9, C.primary, 2);
  setFont(doc, C.white, 7, "bold");
  doc.text("TOTAL", pw - 55, finalY + 6);
  setFont(doc, C.green, 8, "bold");
  doc.text(`Rs.${lead.totalAmount.toLocaleString()}`, pw - 12, finalY + 6, {
    align: "right",
  });

  return finalY + 14;
}

// ─── Divider line ─────────────────────────────────────────────────────────────
function drawDivider(doc, y) {
  const pw = doc.internal.pageSize.getWidth();
  setDraw(doc, C.cardBorder);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(10, y, pw - 10, y);
  doc.setLineDashPattern([], 0);
  return y + 5;
}

// ─── Cover / summary page ─────────────────────────────────────────────────────
function buildCoverPage(doc, leads, statuses) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Full dark bg
  drawRect(doc, 0, 0, pw, ph, C.dark);

  // Large gradient header band
  drawRect(doc, 0, 0, pw / 2, 60, C.primary);
  drawRect(doc, pw / 2, 0, pw / 2, 60, C.purple);

  // Big logo
  drawRect(doc, pw / 2 - 18, 15, 36, 30, [255, 255, 255], 6);

// Logo image
doc.addImage(logo, "PNG", pw / 2 - 18, 15, 36, 30);

  // Title block
  setFont(doc, C.white, 22, "bold");
  doc.text("Bengal Creations", pw / 2, 80, { align: "center" });
  setFont(doc, [200, 210, 230], 12, "normal");
  doc.text("CRM Customer Report", pw / 2, 92, { align: "center" });

  // Subtitle
  setFont(doc, C.faint, 9, "normal");
  const now = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
  doc.text(`Generated on ${now}`, pw / 2, 104, { align: "center" });

  // Horizontal rule
  setDraw(doc, C.cardBorder);
  doc.setLineWidth(0.5);
  doc.line(20, 112, pw - 20, 112);

  // Stats grid
  let sy = 120;
  const totalRev = leads
    .filter((l) => l.type === "order")
    .reduce((a, b) => a + b.totalAmount, 0);
  const cartCount = leads.filter((l) => l.type === "cart").length;
  const orderCount = leads.filter((l) => l.type === "order").length;
  const callsDone = Object.values(statuses).filter(
    (s) => s !== "not_called",
  ).length;
  const interested = Object.values(statuses).filter(
    (s) => s === "interested",
  ).length;
  const notIntrsted = Object.values(statuses).filter(
    (s) => s === "not_interested",
  ).length;
  const followUp = Object.values(statuses).filter(
    (s) => s === "follow_up",
  ).length;
  const pending = Object.values(statuses).filter(
    (s) => s === "not_called",
  ).length;

  const statItems = [
    { label: "Total Customers", value: leads.length, color: C.primary },
    {
      label: "Total Revenue",
      value: `Rs.${(totalRev / 1000).toFixed(2)}K`,
      color: C.green,
    },
    { label: "Cart Leads", value: cartCount, color: C.purple2 },
    { label: "Orders", value: orderCount, color: C.primary },
    { label: "Calls Done", value: callsDone, color: C.amber },
    { label: "Interested", value: interested, color: C.green },
    { label: "Not Interested", value: notIntrsted, color: C.red },
    { label: "Follow Up", value: followUp, color: C.amber },
    { label: "Pending Calls", value: pending, color: C.red },
  ];

  const cols = 3;
  const boxW = (pw - 20 - (cols - 1) * 4) / cols;
  const boxH = 24;

  statItems.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = 10 + col * (boxW + 4);
    const by = sy + row * (boxH + 4);

    drawRect(doc, bx, by, boxW, boxH, C.card, 3);
    setDraw(doc, s.color);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, boxW, boxH, 3, 3, "S");
    drawRect(doc, bx, by, 3, boxH, s.color, 1);

    setFont(doc, C.faint, 6.5, "normal");
    doc.text(s.label, bx + 7, by + 9);
    setFont(doc, s.color, 13, "bold");
    doc.text(String(s.value), bx + 7, by + 19);
  });

  // Footer of cover page
  const fy = ph - 14;
  drawRect(doc, 0, fy, pw, 14, C.card);
  setFont(doc, C.faint, 7, "normal");
  doc.text(
    "Bengal Creations  |  api.bengalcreations.in  |  CONFIDENTIAL",
    pw / 2,
    fy + 9,
    { align: "center" },
  );
}

// ─── Master export function ───────────────────────────────────────────────────
export function exportCustomerPDF(leads, statuses) {
  if (!leads || leads.length === 0) {
    alert("No records to export.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // ── Page 1: Cover ──────────────────────────────────────────────────────────
  buildCoverPage(doc, leads, statuses);

  // ── Page 2: Summary table of all customers ────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, 2, "?");
  drawPageFooter(doc);

  let y = 30;
  setFont(doc, C.white, 13, "bold");
  doc.text("All Customers Overview", 10, y);
  y += 8;

  y = drawSummaryBar(doc, leads, statuses, y);
  y += 4;

  // Overview table
  const overviewRows = leads.map((l, i) => [
    i + 1,
    l.customer.name || "—",
    l.customer.phone || "—",
    l.customer.email || "—",
    l.type === "cart" ? "Cart" : "Order",
    l.district || "—",
    `Rs.${l.totalAmount.toLocaleString()}`,
    l.createdAt?.slice(0, 10) || "—",
    STATUS_LABELS[statuses[l._id]] || "Not Called",
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "#",
        "Name",
        "Phone",
        "Email",
        "Type",
        "District",
        "Amount",
        "Date",
        "Status",
      ],
    ],
    body: overviewRows,
    margin: { left: 10, right: 10 },
    theme: "plain",
    headStyles: {
      fillColor: C.primary,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fillColor: [20, 24, 34],
      textColor: C.white,
      fontSize: 6.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: C.card },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", textColor: C.faint },
      1: { cellWidth: 30, fontStyle: "bold" },
      2: { cellWidth: 22, textColor: C.primary },
      3: { cellWidth: 38 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 22 },
      6: {
        cellWidth: 20,
        halign: "right",
        textColor: C.green,
        fontStyle: "bold",
      },
      7: { cellWidth: 18, halign: "center" },
      8: { cellWidth: 22, halign: "center" },
    },
    tableLineColor: C.cardBorder,
    tableLineWidth: 0.2,
    didDrawPage: () => {
      drawPageHeader(doc, doc.internal.getCurrentPageInfo().pageNumber, "?");
      drawPageFooter(doc);
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 8) {
        const statusKey = Object.keys(STATUS_LABELS).find(
          (k) => STATUS_LABELS[k] === data.cell.text[0],
        );
        if (statusKey)
          data.cell.styles.textColor = STATUS_COLORS[statusKey] || C.faint;
      }
    },
  });

  // ── Pages 3+: Individual customer detail pages ────────────────────────────
  leads.forEach((lead, idx) => {
    doc.addPage();
    const pageN = doc.internal.getCurrentPageInfo().pageNumber;
    drawPageHeader(doc, pageN, "?");
    drawPageFooter(doc);

    let cy = 30;

    // Customer number heading
    setFont(doc, C.faint, 7, "normal");
    doc.text(`Customer ${idx + 1} of ${leads.length}`, pw - 12, cy, {
      align: "right",
    });

    cy = sectionHeading(doc, cy, "Customer Information", C.primary);

    // Customer card
    cy = drawCustomerCard(doc, lead, statuses[lead._id] || "not_called", cy);
    cy += 4;

    // Contact details
    cy = sectionHeading(doc, cy, "Contact Details", C.primary);

    const col1x = 14,
      col2x = 105;
    infoRow(doc, col1x, cy, "Full Name:", lead.customer.name, C.white);
    infoRow(doc, col2x, cy, "Phone:", lead.customer.phone, C.primary);
    infoRow(doc, col1x, cy + 8, "Email:", lead.customer.email, C.muted);
    infoRow(doc, col2x, cy + 8, "District:", lead.district, C.white);
    infoRow(
      doc,
      col1x,
      cy + 16,
      "Order Date:",
      lead.createdAt?.slice(0, 10),
      C.white,
    );
    infoRow(
      doc,
      col2x,
      cy + 16,
      "Lead Type:",
      lead.type === "cart" ? "Cart (Not Purchased)" : "Order (Purchased)",
      C.amber,
    );
    infoRow(
      doc,
      col1x,
      cy + 24,
      "Total Amount:",
      `Rs.${lead.totalAmount.toLocaleString()}`,
      C.green,
    );
    infoRow(
      doc,
      col2x,
      cy + 24,
      "Call Status:",
      STATUS_LABELS[statuses[lead._id]] || "Not Called",
      STATUS_COLORS[statuses[lead._id]] || C.faint,
    );

    cy += 36;

    // Products table
    cy = drawProductsTable(doc, lead, cy);
    cy = drawDivider(doc, cy);

    // Call-to-action box
    if (lead.customer.phone) {
      const ph2 = doc.internal.pageSize.getHeight();
      if (cy > ph2 - 30) {
        doc.addPage();
        drawPageHeader(doc, doc.internal.getCurrentPageInfo().pageNumber, "?");
        drawPageFooter(doc);
        cy = 30;
      }
      const bw = pw - 20;
      drawRect(doc, 10, cy, bw, 14, [34, 201, 122, 15], 3);
      setDraw(doc, C.green);
      doc.setLineWidth(0.3);
      doc.roundedRect(10, cy, bw, 14, 3, 3, "S");
      setFont(doc, C.green, 8, "bold");
      doc.text("📞  Call This Customer:", 15, cy + 9);
      setFont(doc, C.white, 9, "bold");
      doc.text(lead.customer.phone, 65, cy + 9);
      setFont(doc, C.faint, 7, "normal");
      doc.text(`Dial: tel:${lead.customer.phone}`, pw - 15, cy + 9, {
        align: "right",
      });
    }
  });

  // ── Fix page totals in all headers (re-render isn't possible, so stamp count) ─
  // jsPDF doesn't support dynamic "Page X of Y" natively in didDrawPage,
  // but we can overwrite the placeholder after all pages are built:
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    // Overwrite the "?" placeholder with real total
    setFill(doc, C.purple); // same colour as right half of header bar
    doc.rect(pw - 30, 6, 28, 8, "F");
    setFont(doc, [200, 210, 230], 7, "normal");
    doc.text(`Page ${p} of ${totalPages}`, pw - 12, 11, { align: "right" });
  }

  // Save
  const filename = `bengal_crm_customers_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
