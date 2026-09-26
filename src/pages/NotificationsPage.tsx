import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { SelectField } from "@/components/shared/FormField";
import NotificationItem from "@/components/notifications/NotificationItem";
import type { AppNotification } from "@/types/notification";

const TYPE_OPTIONS = [
  { value: "follow_up", label: "متابعات" },
  { value: "low_stock", label: "انخفاض مخزون" },
];

const READ_OPTIONS = [{ value: "true", label: "غير مقروءة فقط" }];

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [unreadOnly, setUnreadOnly] = useState("");
  const [toDelete, setToDelete] = useState<AppNotification | null>(null);

  const { data, isLoading } = useFetch<any>({
    queryKey: ["notifications", page, type, unreadOnly],
    endpoint: "notifications",
    params: {
      page,
      per_page: 15,
      ...(type ? { type } : {}),
      ...(unreadOnly ? { unread_only: unreadOnly } : {}),
    },
    keepPrevious: true,
  });

  const notifications: AppNotification[] = data?.data ?? (Array.isArray(data) ? data : []);
  const meta = data?.meta;

  const { mutate: markAsRead } = useMutate({
    endpoint: (n: AppNotification) => `notifications/${n.id}/read`,
    method: "post",
    mutationKey: ["notification-read"],
    invalidateKeys: [["notifications"], ["notifications-recent"], ["notifications-unread-count"]],
  });

  const { mutate: markAllAsRead, isLoading: markingAll } = useMutate({
    endpoint: "notifications/read-all",
    method: "post",
    mutationKey: ["notifications-read-all"],
    invalidateKeys: [["notifications"], ["notifications-recent"], ["notifications-unread-count"]],
    successMessage: "تم تعليم كل الإشعارات كمقروءة",
  });

  const { mutate: deleteNotification, isLoading: deleting } = useMutate({
    endpoint: (n: AppNotification) => `notifications/${n.id}`,
    method: "delete",
    mutationKey: ["notification-delete"],
    invalidateKeys: [["notifications"], ["notifications-recent"], ["notifications-unread-count"]],
    successMessage: "تم حذف الإشعار",
    onSuccess: () => setToDelete(null),
  });

  const { mutate: triggerCheck, isLoading: checking } = useMutate({
    endpoint: "notifications/check",
    method: "post",
    mutationKey: ["notifications-check"],
    invalidateKeys: [["notifications"], ["notifications-recent"], ["notifications-unread-count"]],
    successMessage: "تم فحص الإشعارات الجديدة",
  });

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        subtitle="متابعات المرضى وتنبيهات انخفاض المخزون"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => triggerCheck({})} disabled={checking}>
              <FiRefreshCw size={16} /> فحص الإشعارات الآن
            </button>
            <button className="btn-primary" onClick={() => markAllAsRead({})} disabled={markingAll}>
              تعليم الكل كمقروء
            </button>
          </div>
        }
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <SelectField
          label="نوع الإشعار"
          name="type"
          placeholder="كل الأنواع"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          options={TYPE_OPTIONS}
        />
        <SelectField
          label="الحالة"
          name="unread_only"
          placeholder="كل الإشعارات"
          value={unreadOnly}
          onChange={(e) => {
            setUnreadOnly(e.target.value);
            setPage(1);
          }}
          options={READ_OPTIONS}
        />
      </div>

      <div className="card divide-y divide-ink/5 p-2">
        {isLoading && <p className="px-2 py-6 text-center text-sm text-ink/40">جاري التحميل...</p>}
        {!isLoading && notifications.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-ink/40">لا يوجد إشعارات</p>
        )}
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClick={() => !n.is_read && markAsRead(n)}
            onDelete={() => setToDelete(n)}
          />
        ))}
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteNotification(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف الإشعار "${toDelete?.title}"؟`}
      />
    </div>
  );
};

export default NotificationsPage;