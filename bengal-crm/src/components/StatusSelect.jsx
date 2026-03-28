import React from 'react';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS } from '../constants';

export default function StatusSelect({ value, onChange, style = {} }) {
  const c = STATUS_COLORS[value] || STATUS_COLORS.not_called;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--bg-base)', border: `1px solid ${c.border}`,
        color: c.color, borderRadius: 6, padding: '4px 8px',
        fontSize: 12, outline: 'none', cursor: 'pointer', width: '100%', ...style,
      }}
    >
      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
    </select>
  );
}
