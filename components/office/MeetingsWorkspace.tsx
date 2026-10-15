"use client";

import { useState } from "react";

type Meeting = {
  id: string;
  title: string;
  date: string;
  venue: string;
  agenda: string;
  mandatory: boolean;
  createdBy: string;
  myRsvp: string | null;
};

export default function MeetingsWorkspace({
  initialMeetings,
  canCreate,
}: {
  initialMeetings: Meeting[];
  canCreate: boolean;
}) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const dateValue = String(form.get("date"));
    try {
      const response = await fetch("/api/office/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          date: new Date(dateValue).toISOString(),
          venue: form.get("venue"),
          agenda: form.get("agenda"),
          mandatory: form.get("mandatory") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Meeting creation failed");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Meeting creation failed");
    } finally {
      setBusy(false);
    }
  }

  async function respond(meetingId: string, responseValue: "ATTENDING" | "APOLOGIES") {
    const response = await fetch(`/api/office/meetings/${meetingId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: responseValue }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not save RSVP");
      return;
    }
    setMeetings((current) => current.map((meeting) =>
      meeting.id === meetingId ? { ...meeting, myRsvp: responseValue } : meeting
    ));
    setMessage("RSVP saved.");
  }

  return (
    <div className="space-y-5">
      {message && <p role="status" className="rounded-lg border border-navy-border p-3 text-sm text-navy-body">{message}</p>}
      {canCreate && (
        <form onSubmit={createMeeting} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
          <h2 className="md:col-span-2 font-bold text-navy-heading">Create a meeting</h2>
          <input name="title" required minLength={3} maxLength={160} placeholder="Meeting title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="date" type="datetime-local" required className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="venue" required placeholder="Venue or meeting link" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <label className="flex items-center gap-2 text-sm text-navy-body"><input name="mandatory" type="checkbox" /> Mandatory attendance</label>
          <textarea name="agenda" required rows={3} placeholder="Agenda" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
          <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-5 font-bold text-navy-bgStart disabled:opacity-50 md:col-span-2">
            {busy ? "Creating…" : "Create meeting"}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <article key={meeting.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-navy-heading">{meeting.title}</h2>
                <p className="mt-1 text-sm text-navy-body">{new Date(meeting.date).toLocaleString()} · {meeting.venue}</p>
              </div>
              <span className="rounded-full bg-mint/10 px-3 py-1 text-xs text-mint">{meeting.mandatory ? "Mandatory" : "Optional"}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-navy-body">{meeting.agenda}</p>
            <p className="mt-2 text-xs text-navy-subtle">Created by {meeting.createdBy}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => respond(meeting.id, "ATTENDING")} className={`min-h-touch rounded-lg border px-3 text-xs ${meeting.myRsvp === "ATTENDING" ? "border-mint text-mint" : "border-navy-border text-navy-body"}`}>Attending</button>
              <button onClick={() => respond(meeting.id, "APOLOGIES")} className={`min-h-touch rounded-lg border px-3 text-xs ${meeting.myRsvp === "APOLOGIES" ? "border-mint text-mint" : "border-navy-border text-navy-body"}`}>Send apologies</button>
            </div>
          </article>
        ))}
        {!meetings.length && <p className="rounded-2xl border border-navy-border p-5 text-sm text-navy-body">No meetings have been scheduled.</p>}
      </div>
    </div>
  );
}
