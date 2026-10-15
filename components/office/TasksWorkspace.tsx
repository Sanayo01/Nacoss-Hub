"use client";

import { useState } from "react";
import { EXECUTIVES_LIST } from "@/config/executives";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedByOffice: string;
  assignedToOffice: string;
  dueDate: string | null;
  status: string;
  overdue: boolean;
}

export default function TasksWorkspace({ initialTasks, office }: { initialTasks: TaskItem[]; office: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [message, setMessage] = useState("");

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dueDate = String(form.get("dueDate") || "");
    const response = await fetch("/api/office/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        assignedToOffice: form.get("assignedToOffice"),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not create task");
      return;
    }
    window.location.reload();
  }

  async function updateTask(id: string, status: string) {
    const response = await fetch("/api/office/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not update task");
      return;
    }
    setTasks((items) => items.map((task) => task.id === id ? { ...task, status, overdue: false } : task));
    setMessage("Task updated.");
  }

  return (
    <div className="space-y-5">
      {message && <p role="status" className="text-sm text-navy-body">{message}</p>}
      <form onSubmit={createTask} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-bold text-navy-heading">Create and assign a task</h2>
        <input name="title" required minLength={2} maxLength={160} placeholder="Task title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <select name="assignedToOffice" defaultValue={office} className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">
          {EXECUTIVES_LIST.map((executive) => <option key={executive.officeSlug} value={executive.officeSlug}>{executive.position}</option>)}
        </select>
        <input name="dueDate" type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" rows={2} placeholder="Description (optional)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-xl bg-mint px-5 font-bold text-navy-bgStart md:col-span-2">Assign task</button>
      </form>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-navy-heading">{task.title}</h2>
                <p className="mt-1 text-xs text-navy-body">From {task.assignedByOffice} · To {task.assignedToOffice}{task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleString()}` : ""}</p>
                {task.description && <p className="mt-2 text-sm text-navy-body">{task.description}</p>}
              </div>
              {task.overdue && <span className="text-xs font-bold text-red-400">OVERDUE</span>}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs uppercase text-navy-subtle">{task.status.replaceAll("_", " ")}</span>
              {task.assignedToOffice === office && task.status !== "DONE" && (
                <button onClick={() => updateTask(task.id, task.status === "OPEN" ? "IN_PROGRESS" : "DONE")} className="text-xs font-semibold text-mint underline">
                  {task.status === "OPEN" ? "Start task" : "Mark done"}
                </button>
              )}
            </div>
          </article>
        ))}
        {!tasks.length && <p className="text-sm text-navy-body">No tasks assigned to or created by your office.</p>}
      </div>
    </div>
  );
}
