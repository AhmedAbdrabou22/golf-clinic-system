import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 1️⃣ Base URL من environment variable (Vite)
export const BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "https://clinic.codingcut.com/api/v1/";

export const buildUrl = (endpoint: string) =>
  `https://clinic.codingcut.com/api/v1/${endpoint.replace(/^\//, "")}`;

// 2️⃣ تعريف نوع الـ props
type UseFetchProps<T> = {
  queryKey: any[];
  endpoint: string;
  params?: Record<string, any>;
  enabled?: boolean;
  select?: (data: any) => T;
  onError?: (err: any) => void;
  onSuccess?: (data: T) => void;
  refetchInterval?: number | false;
  keepPrevious?: boolean;
};

function useFetch<T = any>({
  queryKey,
  endpoint,
  params,
  enabled = true,
  select,
  onError,
  onSuccess,
  refetchInterval,
  keepPrevious = false,
}: UseFetchProps<T>) {
  const navigate = useNavigate();

  // 3️⃣ جلب التوكن من الكوكيز
  const token = Cookies.get("token");

  // 4️⃣ إعداد الـ headers
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": "ar",
      Accept: "application/json",
    },
    params,
  };

  // 5️⃣ useQuery مع معالجة الأخطاء
  const query = useQuery<T>({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      try {
        const res = await axios.get(buildUrl(endpoint), config);
        const data = res.data;
        onSuccess?.(data);
        return data;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.response?.data?.error?.message;

        // إذا كان غير مصرح له → احذف التوكن وارجعه للـ login
        if (error?.response?.status === 401 || message === "Unauthenticated.") {
          Cookies.remove("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else if (message) {
          toast.error(message);
        }

        onError?.(error);
        throw error;
      }
    },
    enabled,
    select,
    refetchInterval,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  });

  return query;
}

export default useFetch;
