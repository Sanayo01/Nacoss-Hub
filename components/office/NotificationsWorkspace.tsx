"use client";

import { useState } from "react";

interface OfficeNotification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  kind: string;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsWorkspace({ initialItems }: { initialItems: OfficeNotification[] }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  async function markRead(id: string) {
    const response = await fetch("/api/office/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      setError("Could not mark notification as read.");
      return;
    }
    setItems((notifications) => notifications.map((item) =>
      item.id === id ? { ...item, readAt: new Date().toISOString() } : item
    ));
  }
  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {items.map((item) => (
        <article key={item.id} className={`rounded-2xl border p-5 ${item.readAt ? "border-navy-border bg-navy-bgStart" : "border-mint/40 bg-navy-card"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-mint">{item.kind.replaceAll("_", " ")}</p>
              <h2 className="mt-1 font-bold text-navy-heading">{item.title}</h2>
              <p className="mt-1 text-sm text-navy-body">{item.message}</p>
              <p className="mt-2 text-xs text-navy-subtle">{new Date(item.createdAt).toLocaleString()}</p>
              {item.link && <a href={item.link} className="mt-2 inline-block text-xs text-mint underline">Open</a>}
            </div>
            {!item.readAt && <button onClick={() => void markRead(item.id)} className="min-h-touch text-xs text-mint underline">Mark read</button>}
          </div>
        </article>
      ))}
      {!items.length && <p className="rounded-2xl border border-navy-border p-5 text-sm text-navy-body">No notifications.</p>}
    </div>
  );
}
