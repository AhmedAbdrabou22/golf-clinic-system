const toneClasses: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  amber: "bg-amber-100 text-amber-500",
  coral: "bg-coral-500/10 text-coral-600",
  gray: "bg-ink/5 text-ink/50",
};

const StatusBadge = ({ label, tone = "gray" }: { label: string; tone?: string }) => (
  <span className={`badge ${toneClasses[tone] ?? toneClasses.gray}`}>{label}</span>
);

export default StatusBadge;
