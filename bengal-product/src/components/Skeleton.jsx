import React from 'react';

export function SkeletonRow() {
  return (
    <tr className="border-b border-ink-100">
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded shimmer" style={{ width: `${40 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="h-3 w-16 rounded shimmer" />
      <div className="h-8 w-24 rounded shimmer" />
      <div className="h-3 w-20 rounded shimmer" />
    </div>
  );
}
