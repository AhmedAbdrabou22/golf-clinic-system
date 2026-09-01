import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { buildUrl } from "./useFetch";

// 1️⃣ نوع الـ props
type UseMutateProps<TResponse> = {
  endpoint: string | ((variables: any) => string);
  mutationKey: any[];
  onSuccess?: (data: TResponse, variables?: any) => void;
  onError?: (err: any) => void;
  onMutate?: (variables?: unknown) => void;
  formData?: boolean;
  method?: "post" | "put" | "delete" | "patch";
  responseType?: "json" | "blob" | "arraybuffer";
  // مفاتيح الـ queries التي يجب إعادة تحميلها بعد نجاح العملية
  invalidateKeys?: any[][];
  successMessage?: string;
};

export function useMutate<TResponse = unknown>({
  endpoint,
  mutationKey,
  onSuccess,
  onError,
  onMutate,
  formData = false,
  method = "post",
  responseType = "json",
  invalidateKeys,
  successMessage,
}: UseMutateProps<TResponse>) {
  const queryClient = useQueryClient();

  // 2️⃣ التوكن من الكوكيز
  const token = Cookies.get("token");

  // 3️⃣ الـ headers بناءً على نوع الـ request
  const getHeaders = () => {
    const baseHeaders = formData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json; charset=utf-8" };

    return {
      ...baseHeaders,
      "Accept-Language": "ar",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // 4️⃣ useMutation
  const { data, isPending, isSuccess, mutate, mutateAsync, isError, failureReason, reset } =
    useMutation<TResponse, any, any>({
      mutationKey,
      mutationFn: (values) => {
        const url = typeof endpoint === "function" ? endpoint(values) : endpoint;
        // دعم إرسال DELETE / PATCH بدون body لو مش محتاجين values
        const payload = method === "delete" && values === undefined ? undefined : values;

        return axios({
          method: method.toUpperCase(),
          // url: buildUrl(url),
            url: `https://clinic.codingcut.com/api/v1/`,

          data: payload,
          responseType,
          headers: getHeaders(),
        }).then((res) => res.data);
      },
      onMutate,
      onSuccess: (resData, variables) => {
        if (successMessage) toast.success(successMessage);
        invalidateKeys?.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
        onSuccess?.(resData, variables);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          "حدث خطأ غير متوقع، برجاء المحاولة مرة أخرى";
        toast.error(message);
        onError?.(error);
      },
    });

  return {
    data,
    isLoading: isPending,
    isSuccess,
    mutate,
    mutateAsync,
    isError,
    failureReason,
    reset,
  };
}

export default useMutate;
