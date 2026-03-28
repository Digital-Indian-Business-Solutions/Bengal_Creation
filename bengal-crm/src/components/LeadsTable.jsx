import React from 'react';
import StatusSelect from './StatusSelect';
import { exportCustomerPDF } from '../services/pdfExport';

const th = {
  padding: '10px 13px', fontSize: 10, fontWeight: 600, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '.7px', textAlign: 'left',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const td = {
  padding: '10px 13px', fontSize: 13, color: 'var(--text2)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

export default function LeadsTable({ leads, statuses, setStatus, onRowClick, onExport, title = 'Leads' }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
          {title} <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 13 }}>({leads.length})</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onExport(leads)}
            style={{ background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 7, padding: '6px 13px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
          >⬇ CSV</button>
          <button
            onClick={() => exportCustomerPDF(leads, statuses)}
            style={{ background: 'rgba(242,87,87,0.1)', color: 'var(--red)', border: '1px solid rgba(242,87,87,0.25)', borderRadius: 7, padding: '6px 13px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
          >📄 Export PDF</button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No records found</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1050 }}>
            <colgroup>
              <col style={{ width: 140 }} /><col style={{ width: 125 }} /><col style={{ width: 170 }} />
              <col style={{ width: 75 }} /><col style={{ width: 100 }} /><col style={{ width: 95 }} />
              <col style={{ width: 130 }} /><col style={{ width: 150 }} /><col style={{ width: 95 }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                {['Customer','Phone','Email','Type','Amount','Date','District','Call Status','Action'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <Row
                  key={l._id}
                  lead={l}
                  status={statuses[l._id] || 'not_called'}
                  onStatusChange={(v) => setStatus(l._id, v)}
                  onRowClick={() => onRowClick(l)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ lead, status, onStatusChange, onRowClick }) {
  return (
    <tr
      onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach((c) => (c.style.background = 'var(--bg-hover)'))}
      onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach((c) => (c.style.background = 'transparent'))}
    >
      <td style={td}><span style={{ color: 'var(--text)', fontWeight: 500 }}>{lead.customer.name || '—'}</span></td>
      <td style={td}>
        {lead.customer.phone ? (
          <span style={{ color: 'var(--accent)', fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{lead.customer.phone}</span>
        ) : <span style={{ color: 'var(--text3)' }}>—</span>}
      </td>
      <td style={{ ...td, fontSize: 12 }}>{lead.customer.email || '—'}</td>
      <td style={td}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
          padding: '2px 7px', borderRadius: 5,
          background: lead.type === 'cart' ? 'rgba(167,139,250,0.15)' : 'rgba(79,142,247,0.15)',
          color: lead.type === 'cart' ? 'var(--purple)' : 'var(--accent)',
        }}>
          {lead.type === 'cart' ? '🛒' : '📦'} {lead.type}
        </span>
      </td>
      <td style={td}><span style={{ color: 'var(--green)', fontFamily: 'Space Mono,monospace', fontWeight: 700 }}>₹{lead.totalAmount.toLocaleString()}</span></td>
      <td style={{ ...td, fontSize: 12 }}>{lead.createdAt?.slice(0, 10) || '—'}</td>
      <td style={{ ...td, fontSize: 12 }}>{lead.district || '—'}</td>
      <td style={td}><StatusSelect value={status} onChange={onStatusChange} /></td>
      <td style={td}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {lead.customer.phone ? (
            <a href={`tel:${lead.customer.phone}`} style={{ textDecoration: 'none' }}>
              <button style={{ background: 'rgba(34,201,122,0.12)', color: 'var(--green)', border: '1px solid rgba(34,201,122,0.25)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>📞 Call</button>
            </a>
          ) : null}
          <button
            onClick={onRowClick}
            style={{ background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >View</button>
        </div>
      </td>
    </tr>
  );
}
