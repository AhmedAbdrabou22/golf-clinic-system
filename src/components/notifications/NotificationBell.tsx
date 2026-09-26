import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import type { AppNotification } from "@/types/notification";
import NotificationItem from "./NotificationItem";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ===== عدد غير المقروء (يفضل شغال دايمًا عشان الشارة تتحدث) =====
  const { data: countData } = useFetch<any>({
    queryKey: ["notifications-unread-count"],
    endpoint: "notifications/unread-count",
  });
  const unreadCount: number =
    countData?.data?.count ??
    countData?.data?.unread_count ??
    countData?.count ??
    countData?.unread_count ??
    0;

  // ===== آخر إشعارات، بتتجاب بس لما الدروب داون يتفتح =====
  const { data: listData, isLoading } = useFetch<any>({
    queryKey: ["notifications-recent"],
    endpoint: "notifications",
    params: { per_page: 6 },
    enabled: open,
  });
  const notifications: AppNotification[] = listData?.data ?? (Array.isArray(listData) ? listData : []);

  const { mutate: markAsRead } = useMutate({
    endpoint: (n: AppNotification) => `notifications/${n.id}/read`,
    method: "post",
    mutationKey: ["notification-read"],
    invalidateKeys: [["notifications-recent"], ["notifications-unread-count"], ["notifications"]],
  });

  const { mutate: markAllAsRead, isLoading: markingAll } = useMutate({
    endpoint: "notifications/read-all",
    method: "post",
    mutationKey: ["notifications-read-all"],
    invalidateKeys: [["notifications-recent"], ["notifications-unread-count"], ["notifications"]],
    successMessage: "تم تعليم كل الإشعارات كمقروءة",
  });

  const handleItemClick = (n: AppNotification) => {
    if (!n.is_read) markAsRead(n);
    setOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 transition hover:bg-mint-100 hover:text-primary-600"
        aria-label="الإشعارات"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-extrabold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1.5 w-80 rounded-xl border border-ink/10 bg-white p-2 shadow-soft z-50">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-sm font-extrabold text-ink">الإشعارات</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead({})}
                disabled={markingAll}
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && <p className="px-2 py-4 text-center text-xs text-ink/40">جاري التحميل...</p>}
            {!isLoading && notifications.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-ink/40">لا يوجد إشعارات</p>
            )}
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={() => handleItemClick(n)} compact />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="mt-1 w-full rounded-lg px-2 py-2 text-center text-xs font-bold text-primary-600 hover:bg-primary-50"
          >
            عرض كل الإشعارات
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;