"use client";

import { useState } from "react";

export default function OfficeControls({ compact = false }: { compact?: boolean }) {
  const [error, setError] = useState("");
  async function switchOffice() {
    const response = await fetch("/api/admin/auth", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ office: null }),
    });
    if (!response.ok) {
      setError("Could not switch offices.");
      return;
    }
    window.location.assign("/admin");
  }

  async function logOut() {
    const response = await fetch("/api/admin/auth", { method: "DELETE" });
    if (!response.ok) {
      setError("Could not log out.");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <div className={compact ? "flex flex-col items-end gap-1" : "mt-3 flex flex-wrap gap-x-3 gap-y-1"}>
      <button type="button" onClick={switchOffice} className="text-xs text-navy-body underline hover:text-mint">
        Switch office
      </button>
      <button type="button" onClick={logOut} className="text-xs text-navy-body underline hover:text-mint">
        Log out
      </button>
      {error && <span role="alert" className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
