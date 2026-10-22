import type { PlanContent, Task } from "@/schemas/plan";

export function tasksFromContent(content: PlanContent): Task[] {
  return content.tasks.map((t, i) => ({ id: `t${i + 1}`, group: t.group, title: t.title, done: false }));
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function taskProgress(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
