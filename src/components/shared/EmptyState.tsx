import { FiInbox } from "react-icons/fi";

const EmptyState = ({
  title = "لا توجد بيانات بعد",
  hint = "ابدأ بإضافة عنصر جديد وسيظهر هنا.",
  action,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-primary-500">
      <FiInbox size={26} />
    </div>
    <h3 className="font-display text-base font-bold text-ink">{title}</h3>
    <p className="max-w-xs text-sm text-ink/50">{hint}</p>
    {action}
  </div>
);

export default EmptyState;
