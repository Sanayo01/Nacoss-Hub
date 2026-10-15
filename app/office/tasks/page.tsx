import { requirePageCapability } from "@/lib/office-access";
import { getOfficeTasks } from "@/lib/office-data";
import TasksWorkspace from "@/components/office/TasksWorkspace";

export default async function TasksPage() {
  const office = await requirePageCapability("tasks.view");
  const tasks = await getOfficeTasks(office);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Action tracking</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Tasks</h1>
        <p className="mt-1 text-sm text-navy-body">Assign work across offices, track progress, and see overdue items.</p>
      </header>
      <TasksWorkspace initialTasks={tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate?.toISOString() ?? null,
      }))} office={office} />
    </section>
  );
}
