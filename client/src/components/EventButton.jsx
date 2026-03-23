import React from 'react';

export default function EventButton({ event, onTrigger }) {
  return (
    <button
      className="rounded border px-3 py-2 text-sm hover:bg-gray-100"
      onClick={() => onTrigger(event)}
    >
      {event.icon} {event.name}
    </button>
  );
}
