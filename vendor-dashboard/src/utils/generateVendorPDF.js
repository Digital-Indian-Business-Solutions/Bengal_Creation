import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Brand colours (RGB) ────────────────────────────────────────────────────
const BRAND   = [14,  165, 233]
const ACCENT  = [192,  38, 211]
const DARK    = [15,   23,  42]
const MID     = [71,   85, 105]
const LIGHT   = [148, 163, 184]
const SILVER  = [241, 245, 249]
const WHITE   = [255, 255, 255]
const SUCCESS = [16,  185, 129]
const WARNING = [245, 158,  11]
const DANGER  = [239,  68,  68]

/** Convert image URL → base64 dataURL (returns null on any failure) */
async function urlToBase64(url) {
  if (!url) return null
  try {
    const res  = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror  = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Horizontal rule */
function hRule(doc, y, color = SILVER) {
  doc.setDrawColor(...color)
  doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
}

/** Section heading with left accent bar */
function sectionHeading(doc, text, y) {
  doc.setFillColor(...BRAND)
  doc.rect(14, y, 3, 6, 'F')
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(text, 20, y + 4.5)
  return y + 12
}

/**
 * Main entry — generates and auto-saves a vendor PDF.
 * @param {object} vendor   normalised vendor object
 * @param {array}  products array of product objects (may be empty)
 */
export async function generateVendorPDF(vendor, products = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const PW  = doc.internal.pageSize.getWidth()   // 210
  const PH  = doc.internal.pageSize.getHeight()  // 297

  // Try loading logo — gracefully skip on CORS / network failure
  const logoB64 = await urlToBase64(vendor.logo).catch(() => null)

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER BANNER
  // ═══════════════════════════════════════════════════════════════════════════

  // Primary background
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, PW, 42, 'F')

  // Accent overlay — use a lighter tint instead of transparency
  doc.setFillColor(100, 20, 180)
  doc.rect(130, 0, PW - 130, 42, 'F')

  // Diagonal stripes for texture (no alpha needed)
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.15)
  for (let x = 0; x < PW + 42; x += 8) {
    doc.line(x, 0, x - 42, 42)
  }

  // Logo area
  const logoX = 14, logoY = 7, logoSize = 26
  if (logoB64) {
    // White border circle behind logo
    doc.setFillColor(255, 255, 255)
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1.5, 'F')
    try {
      doc.addImage(logoB64, 'JPEG', logoX, logoY, logoSize, logoSize)
    } catch {
      // fallback initials if addImage fails
      drawInitialsCircle(doc, vendor, logoX, logoY, logoSize)
    }
  } else {
    drawInitialsCircle(doc, vendor, logoX, logoY, logoSize)
  }

  // Vendor name
  const textX = logoX + logoSize + 7
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(vendor.name || 'Vendor Report', textX, 17)

  // Shop name
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(200, 235, 255)
  doc.text(vendor.shopName || '', textX, 25)

  // Vendor ID small
  doc.setFontSize(7)
  doc.setTextColor(180, 220, 255)
  doc.text(vendor.vendorId || '', textX, 32)

  // Status badge (top-right corner)
  const isVerified = vendor.isVerified === true
  const badgeColor = isVerified ? SUCCESS : WARNING
  doc.setFillColor(...badgeColor)
  doc.roundedRect(PW - 44, 10, 30, 8, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(isVerified ? 'VERIFIED' : 'PENDING', PW - 29, 15, { align: 'center' })

  // Sub-bar
  doc.setFillColor(230, 240, 250)
  doc.rect(0, 42, PW, 7, 'F')
  doc.setTextColor(...MID)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('VENDOR PROFILE REPORT  —  BengalCreations', 14, 47)
  doc.text(
    `Generated: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    PW - 14, 47, { align: 'right' }
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — VENDOR INFORMATION
  // ═══════════════════════════════════════════════════════════════════════════
  let y = 57

  y = sectionHeading(doc, 'Vendor Information', y)

  const infoFields = [
    ['Full Name',    vendor.name        || '—'],
    ['Shop Name',    vendor.shopName    || '—'],
    ['Email',        vendor.email       || '—'],
    ['Phone',        vendor.phone       || '—'],
    ['Address',      (vendor.address || '—').replace(/\n/g, ', ')],
    ['Member Since', vendor.createdAt
      ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—'],
  ]

  const colW = (PW - 32) / 2
  infoFields.forEach(([label, value], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx  = 14 + col * (colW + 4)
    const cy  = y + row * 18

    doc.setFillColor(...SILVER)
    doc.roundedRect(cx, cy, colW, 14, 2, 2, 'F')

    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.text(label.toUpperCase(), cx + 4, cy + 4.5)

    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const trimmed = doc.splitTextToSize(value, colW - 8)[0]
    doc.text(trimmed, cx + 4, cy + 10.5)
  })

  y += Math.ceil(infoFields.length / 2) * 18 + 6

  // Description block
  if (vendor.description) {
    doc.setFillColor(248, 250, 252)
    const descLines = doc.splitTextToSize(vendor.description, PW - 38)
    const descH = descLines.length * 4.5 + 10
    doc.roundedRect(14, y, PW - 28, descH, 2, 2, 'F')
    doc.setFillColor(...BRAND)
    doc.rect(14, y, 2.5, descH, 'F')
    doc.setTextColor(...MID)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text(descLines, 20, y + 6)
    y += descH + 8
  }

  hRule(doc, y)
  y += 7

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — DOCUMENTS STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  y = sectionHeading(doc, 'Submitted Documents', y)

  const docItems = [
    { label: 'Trade License',  url: vendor.tradeLicense },
    { label: 'Aadhaar Card',   url: vendor.aadhaarCard  },
    { label: 'PAN Card',       url: vendor.panCard      },
    { label: 'Other Document', url: vendor.otherDoc     },
  ]

  const docColW = (PW - 28 - 9) / 4
  docItems.forEach(({ label, url }, i) => {
    const cx        = 14 + i * (docColW + 3)
    const submitted = Boolean(url)
    const bgColor   = submitted ? [236, 253, 245] : [254, 242, 242]
    const fgColor   = submitted ? SUCCESS : DANGER

    doc.setFillColor(...bgColor)
    doc.roundedRect(cx, y, docColW, 22, 2, 2, 'F')

    // Coloured top bar
    doc.setFillColor(...fgColor)
    doc.roundedRect(cx, y, docColW, 3, 2, 2, 'F')
    doc.rect(cx, y + 1, docColW, 2, 'F')

    // Icon text
    doc.setTextColor(...fgColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(submitted ? '✓' : '✗', cx + docColW / 2, y + 12, { align: 'center' })

    // Label
    doc.setTextColor(...MID)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    const lblLines = doc.splitTextToSize(label, docColW - 2)
    doc.text(lblLines, cx + docColW / 2, y + 18, { align: 'center' })
  })

  y += 28

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — PRODUCT SUMMARY STATS
  // ═══════════════════════════════════════════════════════════════════════════

  hRule(doc, y)
  y += 7

  const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0)
  const totalValue = products.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
  const avgPrice   = products.length
    ? products.reduce((s, p) => s + (Number(p.price) || 0), 0) / products.length
    : 0

  y = sectionHeading(doc, 'Product Summary', y)

  const statItems = [
    { label: 'Total Products',   value: String(products.length),                   color: BRAND   },
    { label: 'Total Stock Units',value: totalStock.toLocaleString('en-IN'),         color: ACCENT  },
    { label: 'Average Price',    value: `Rs.${avgPrice.toFixed(0)}`,               color: SUCCESS },
    { label: 'Inventory Value',  value: `Rs.${totalValue.toLocaleString('en-IN')}`,color: WARNING },
  ]

  const statW = (PW - 28 - 9) / 4
  statItems.forEach(({ label, value, color }, i) => {
    const cx = 14 + i * (statW + 3)

    doc.setFillColor(...SILVER)
    doc.roundedRect(cx, y, statW, 22, 2, 2, 'F')

    // Top accent bar
    doc.setFillColor(...color)
    doc.roundedRect(cx, y, statW, 3, 2, 2, 'F')
    doc.rect(cx, y + 1, statW, 2, 'F')

    doc.setTextColor(...color)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(value, cx + statW / 2, y + 13, { align: 'center' })

    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.text(label.toUpperCase(), cx + statW / 2, y + 19, { align: 'center' })
  })

  y += 28

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — PRODUCTS TABLE
  // ═══════════════════════════════════════════════════════════════════════════

  hRule(doc, y)
  y += 7

  y = sectionHeading(doc, `Product Listing  (${products.length})`, y)

  if (products.length === 0) {
    doc.setFillColor(...SILVER)
    doc.roundedRect(14, y, PW - 28, 16, 3, 3, 'F')
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.text('No products listed for this vendor.', PW / 2, y + 9.5, { align: 'center' })
    y += 22
  } else {
    const rows = products.map((p, idx) => [
      idx + 1,
      p.name || p.productName || '—',
      p.category || '—',
      p.price != null ? `Rs.${Number(p.price).toLocaleString('en-IN')}` : '—',
      p.stock != null ? String(p.stock) : '—',
      p.createdAt
        ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
    ])

    autoTable(doc, {
      startY: y,
      head: [['#', 'Product Name', 'Category', 'Price', 'Stock', 'Listed On']],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: DARK,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: BRAND,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: SILVER,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', textColor: LIGHT, fontSize: 7 },
        1: { cellWidth: 60 },
        2: { cellWidth: 34 },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, textColor: MID, fontSize: 7 },
      },
      didParseCell(data) {
        if (data.column.index === 4 && data.section === 'body') {
          const val = Number(data.cell.raw)
          if (val === 0)      data.cell.styles.textColor = DANGER
          else if (val < 10)  data.cell.styles.textColor = WARNING
          else                data.cell.styles.textColor = SUCCESS
        }
      },
      didDrawPage(data) {
        addFooter(doc, data.pageNumber, doc.internal.getNumberOfPages())
      },
    })
  }

  // Footer on first page (subsequent pages handled by didDrawPage above)
  addFooter(doc, 1, doc.internal.getNumberOfPages())

  // ─── Save ────────────────────────────────────────────────────────────────
  const safeName = (vendor.name || 'vendor').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
  doc.save(`${safeName}_${vendor.vendorId || 'report'}.pdf`)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawInitialsCircle(doc, vendor, x, y, size) {
  doc.setFillColor(255, 255, 255)
  doc.circle(x + size / 2, y + size / 2, size / 2 + 1, 'F')
  doc.setFillColor(...BRAND)
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(
    (vendor.name || 'V')[0].toUpperCase(),
    x + size / 2,
    y + size / 2 + 1,
    { align: 'center', baseline: 'middle' }
  )
}

function addFooter(doc, pageNum, totalPages) {
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()

  doc.setFillColor(230, 240, 250)
  doc.rect(0, PH - 10, PW, 10, 'F')

  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.3)
  doc.line(0, PH - 10, PW, PH - 10)

  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('BengalCreations — Vendor Management System', 14, PH - 4)
  doc.text(`Page ${pageNum} of ${totalPages}`, PW - 14, PH - 4, { align: 'right' })
}
