import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import useMutate from "@/hooks/useMutate";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/types";

interface LoginResponse {
  data?: { access_token: string; user: AuthUser };
  access_token?: string;
  user?: AuthUser;
}

const LoginForm = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate, isLoading } = useMutate<LoginResponse>({
    endpoint: "auth/login",
    mutationKey: ["auth-login"],
    successMessage: "تم تسجيل الدخول بنجاح",
    onSuccess: (res) => {
      console.log("res",res);
      const token = res.access_token;
      const user = res.user;
      if (user) login(user, token);
      const redirectTo = (location.state as any)?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ phone, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="phone" className="field-label">
          رقم الهاتف
        </label>
        <div className="relative">
          <FiPhone className="absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/35" size={17} />
          <input
            id="phone"
            type="tel"
            required
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="field-input pr-10 text-left"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          كلمة المرور
        </label>
        <div className="relative">
          <FiLock className="absolute top-1/2 right-3.5 -translate-y-1/2 text-ink/35" size={17} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field-input px-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35 hover:text-ink/60"
            aria-label="إظهار كلمة المرور"
          >
            {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary mt-2 w-full py-3">
        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
};

export default LoginForm;
