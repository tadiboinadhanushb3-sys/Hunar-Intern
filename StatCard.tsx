import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "orange" | "purple" | "gold";
}

export function StatCard({ label, value, hint, icon, accent = "primary" }: Props) {
  const accentClass = {
    primary: "text-primary",
    orange: "text-orange",
    purple: "text-purple",
    gold: "text-gold",
  }[accent];
  return (
    <div className="stat-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-2 text-3xl font-black tracking-tight ${accentClass}`}>{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>}
        </div>
        {icon && <div className={`${accentClass} opacity-70`}>{icon}</div>}
      </div>
    </div>
  );
}
