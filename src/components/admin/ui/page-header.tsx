import type { ReactNode } from "react";

interface PageHeaderProps {
  crumb: string;
  title: string;
  description?: ReactNode;
  /** Shown next to the title, e.g. a status pill. */
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ crumb, title, description, badge, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1.5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone">
        <span>Haqdar</span>
        <span aria-hidden>›</span>
        <span>{crumb}</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[30px] font-semibold tracking-[-0.03em]">{title}</h1>
          {badge}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {description && <p className="text-[13px] text-stone">{description}</p>}
    </header>
  );
}
