"use client";

export default function PrintButton() {
  return <button onClick={() => window.print()} className="print:hidden min-h-touch rounded-xl border border-navy-border px-4 text-sm">Print / save as PDF</button>;
}
