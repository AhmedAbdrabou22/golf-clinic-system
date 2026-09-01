interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink/50">{subtitle}</p>}
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export default PageHeader;
