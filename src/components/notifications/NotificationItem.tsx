import { FiCalendar, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import type { AppNotification } from "@/types/notification";

interface Props {
  notification: AppNotification;
  onClick?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const ICONS: Record<string, any> = {
  follow_up: FiCalendar,
  low_stock: FiAlertTriangle,
};

const NotificationItem = ({ notification, onClick, onDelete, compact }: Props) => {
  const Icon = ICONS[notification.type] ?? FiCalendar;

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-mint-100 ${
        !notification.is_read ? "bg-primary-50/50" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          notification.type === "low_stock" ? "bg-coral-500/10 text-coral-500" : "bg-primary-50 text-primary-600"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-bold text-ink">{notification.title}</p>
        <p className={`text-xs text-ink/60 ${compact ? "line-clamp-2" : ""}`}>{notification.message}</p>
        <span className="mt-1 block text-[10px] text-ink/35">{notification.created_at_human}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        {!notification.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-ink/30 hover:bg-coral-500/10 hover:text-coral-500"
            aria-label="حذف"
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;