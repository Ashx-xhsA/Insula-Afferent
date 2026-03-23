import React from 'react';

export default function MentalStatsPanel({ san, hp }) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-3 font-semibold">Mental Stats</h2>
      <div className="flex gap-6">
        <div>
          <span className="text-xs text-gray-500">Cognitive Capacity (SAN)</span>
          <p className="text-2xl font-bold">{san}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Energy (HP)</span>
          <p className="text-2xl font-bold">{hp}</p>
        </div>
      </div>
    </div>
  );
}
