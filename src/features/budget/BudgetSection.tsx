import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetLine } from "@/schemas/plan";
import { budgetTotals, formatMoney } from "./allocate";

const COLORS = Array.from({ length: 8 }, (_, i) => `var(--chart-${i + 1})`);

export function BudgetSection({ lines, currency, onSpentChange }: { lines: BudgetLine[]; currency: string; onSpentChange: (key: string, spent: number) => void }) {
  const totals = budgetTotals(lines);
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="h-64" role="img" aria-label="Budget allocation chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={lines} dataKey="amount" nameKey="label" innerRadius="58%" outerRadius="95%" paddingAngle={2} stroke="none">
                {lines.map((l, i) => <Cell key={l.key} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                formatter={(v: number) => formatMoney(v, currency)}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div><dt className="text-muted-foreground">Planned</dt><dd className="font-semibold">{formatMoney(totals.planned, currency)}</dd></div>
          <div><dt className="text-muted-foreground">Spent</dt><dd className="font-semibold">{formatMoney(totals.spent, currency)}</dd></div>
          <div><dt className="text-muted-foreground">Remaining</dt><dd className={totals.remaining < 0 ? "font-semibold text-destructive" : "font-semibold text-success"}>{formatMoney(totals.remaining, currency)}</dd></div>
        </dl>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Itemised budget</caption>
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border"><th className="py-2 font-medium">Category</th><th className="py-2 text-right font-medium">Share</th><th className="py-2 text-right font-medium">Estimate</th><th className="no-print py-2 pl-4 text-right font-medium">Spent so far</th></tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.key} className="border-b border-border/60">
                <td className="py-2.5"><span className="mr-2 inline-block size-2.5 rounded-full align-middle" style={{ background: COLORS[i % COLORS.length] }} aria-hidden />{l.label}</td>
                <td className="py-2.5 text-right tabular-nums text-muted-foreground">{l.percent}%</td>
                <td className="py-2.5 text-right tabular-nums">{formatMoney(l.amount, currency)}</td>
                <td className="no-print py-2.5 pl-4 text-right">
                  <input
                    type="number" min={0} inputMode="decimal" aria-label={`Spent on ${l.label}`}
                    defaultValue={l.spent || ""} placeholder="0"
                    onBlur={(e) => onSpentChange(l.key, Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 w-28 rounded-md border border-input bg-transparent px-2 text-right tabular-nums"
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="font-semibold"><td className="py-2.5">Total</td><td className="py-2.5 text-right">100%</td><td className="py-2.5 text-right tabular-nums">{formatMoney(totals.planned, currency)}</td><td className="no-print" /></tr></tfoot>
        </table>
        <p className="mt-3 text-xs text-muted-foreground">Estimates are illustrative, rule-based allocations of your total — adjust as you collect real quotes. They are not market prices.</p>
      </div>
    </div>
  );
}
