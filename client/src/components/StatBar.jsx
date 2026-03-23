import React from 'react';

export default function StatBar({ name, value }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{name}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200">
        <div
          className={`h-3 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
