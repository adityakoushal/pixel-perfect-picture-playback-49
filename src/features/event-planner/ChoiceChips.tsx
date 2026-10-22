import { cn } from "@/lib/utils";

interface Props<T extends string> {
  label: string;
  name: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (v: T) => void;
  error?: string;
}

export function ChoiceChips<T extends string>({ label, name, options, value, onChange, error }: Props<T>) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value;
          return (
            <label
              key={o}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-input hover:border-primary/60 hover:bg-accent",
              )}
            >
              <input type="radio" name={name} value={o} checked={active} onChange={() => onChange(o)} className="sr-only" />
              {o}
            </label>
          );
        })}
      </div>
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-destructive">{error}</p>}
    </fieldset>
  );
}
